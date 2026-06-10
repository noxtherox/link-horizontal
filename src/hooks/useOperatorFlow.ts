import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  Arc,
  CapabilityFlags,
  CompletedWeldRecord,
  Consumable,
  InspectionStatus,
  Part,
  PartCompletionRecord,
  User,
  Weld,
  WelderStep,
  WorkOrder,
} from '@/types/weldcloud';
import { useParts, useWorkOrders } from '@/hooks/useWorkOrders';
import { consumables as consumableTemplate } from '@/data/mockData';
import { checkPartQualification, checkWeldQualification, gateLevel } from '@/lib/qualifications';
import { showError, showSuccess } from '@/utils/toast';

export interface QueueWeldItem {
  weld: Weld;
  completed: boolean;
  gate: 'ok' | 'warn' | 'locked';
  gateReason: string | null;
  /** Present when this is repair/rework work coming back from inspection */
  repair?: { of: string; defectCode: string; note?: string };
  /** Present when the weld is gated behind fit-up */
  fitUp?: 'required' | 'pending-approval';
}

export type FitUpStatus = 'pending-approval' | 'ready';

export interface FitUpTask {
  /** weld id in per-weld granularity, part id in part-level */
  key: string;
  workOrder: WorkOrder;
  part: Part;
  weld?: Weld;
  status?: FitUpStatus;
}

export interface RepairWeldEntry {
  weld: Weld;
  workOrderId: string;
  repairOf: string;
  defectCode: string;
  note?: string;
  /** Welder this repair is assigned to; undefined = open pool */
  assignedTo?: string;
}

export interface QueuePartItem {
  part: Part;
  workOrder: WorkOrder;
  mode: 'per-weld' | 'part-level';
  welds: QueueWeldItem[];
  remaining: number;
  completed: boolean;
  gate: 'ok' | 'warn' | 'locked';
  gateReason: string | null;
  attributedArcs: number;
  /** Present when a part-level completion was rejected and flagged for rework */
  rework?: { defectCode?: string; note?: string };
  /** Present when the part session is gated behind fit-up */
  fitUp?: 'required' | 'pending-approval';
}

export interface QueueWorkOrderGroup {
  workOrder: WorkOrder;
  parts: QueuePartItem[];
}

interface ActiveWeld {
  weld: Weld;
  workOrder: WorkOrder;
}

interface PartSessionState {
  workOrder: WorkOrder;
  part: Part;
}

function freshConsumables(): Consumable[] {
  return consumableTemplate.map((c) => ({ ...c }));
}

/** Decide inspection routing the moment work completes, per the WO's flags. */
function decideInspection(flags: CapabilityFlags): InspectionStatus {
  switch (flags.inspectionScope) {
    case 'all':
      return 'pending';
    case 'sample':
      return Math.random() * 100 < flags.samplePercent ? 'pending' : 'not-required';
    case 'self-check':
      return 'self-checked';
  }
}

export function useOperatorFlow(currentUser: User | null) {
  const { data: workOrders = [] } = useWorkOrders();
  const { data: partsCatalog = [] } = useParts();

  const [step, setStep] = useState<WelderStep>('taskQueue');
  const [workflowStep, setWorkflowStep] = useState<WelderStep>('taskQueue');
  const [weldActiveMode, setWeldActiveMode] = useState<'setup' | 'arc'>('setup');

  const [completedWelds, setCompletedWelds] = useState<CompletedWeldRecord[]>([]);
  const [completedParts, setCompletedParts] = useState<PartCompletionRecord[]>([]);

  const [active, setActive] = useState<ActiveWeld | null>(null);
  const [consumables, setConsumables] = useState<Consumable[]>(freshConsumables());
  const [verifiedParts, setVerifiedParts] = useState<Set<string>>(new Set());

  const [arcTime, setArcTime] = useState(0);
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [arcStartOffset, setArcStartOffset] = useState(0);
  const [isArcPaused, setIsArcPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [partSession, setPartSession] = useState<PartSessionState | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionArcs, setSessionArcs] = useState<Arc[]>([]);

  const [unattributedArcs, setUnattributedArcs] = useState<Arc[]>([]);
  const [arcsByPart, setArcsByPart] = useState<Record<string, Arc[]>>({});

  const [signTarget, setSignTarget] = useState<PartSessionState | null>(null);
  const [lastCompletedPartId, setLastCompletedPartId] = useState<string | null>(null);

  const [repairWelds, setRepairWelds] = useState<RepairWeldEntry[]>([]);
  const [fitUps, setFitUps] = useState<Record<string, FitUpStatus>>({});

  const [isRecording, setIsRecording] = useState(false);
  const [voiceCommand] = useState('');

  const woById = useMemo(() => new Map(workOrders.map((wo) => [wo.id, wo])), [workOrders]);

  // A weld counts as complete unless it was rejected with the rework-flag
  // model — then it reopens in place instead of spawning a -R1 weld.
  const completedWeldIds = useMemo(() => {
    const ids = new Set<string>();
    for (const cw of completedWelds) {
      const reopened =
        cw.inspectionStatus === 'rejected' &&
        woById.get(cw.workOrderId)?.flags.repairModel === 'rework-flag';
      if (!reopened) ids.add(cw.weld.id);
    }
    return ids;
  }, [completedWelds, woById]);

  const reworkByWeldId = useMemo(() => {
    const map = new Map<string, { defectCode: string; note?: string }>();
    for (const cw of completedWelds) {
      if (
        cw.inspectionStatus === 'rejected' &&
        woById.get(cw.workOrderId)?.flags.repairModel === 'rework-flag'
      ) {
        map.set(cw.weld.id, { defectCode: cw.defectCode ?? 'defect', note: cw.reworkNote });
      }
    }
    return map;
  }, [completedWelds, woById]);

  const completedPartIds = useMemo(
    () =>
      new Set(
        completedParts.filter((cp) => cp.inspectionStatus !== 'rejected').map((cp) => cp.partId)
      ),
    [completedParts]
  );

  const partReworkById = useMemo(() => {
    const map = new Map<string, { defectCode?: string; note?: string }>();
    for (const cp of completedParts) {
      if (cp.inspectionStatus === 'rejected') {
        map.set(cp.partId, { defectCode: cp.defectCode, note: cp.reworkNote });
      }
    }
    return map;
  }, [completedParts]);

  // ── Queue model: Work Order → Part → Weld, gated by the current user's WPQ ──

  const queue: QueueWorkOrderGroup[] = useMemo(() => {
    if (!currentUser) return [];
    return workOrders
      .filter((wo) => wo.status === 'released' || wo.status === 'in-progress')
      .map((wo) => ({
        workOrder: wo,
        parts: wo.partIds
          .map((pid) => partsCatalog.find((p) => p.id === pid))
          .filter((p): p is Part => !!p)
          .map((part) => {
            const mode = wo.flags.weldGranularity;
            // Fit-up gate: keyed per joint (weld id) in per-weld mode, per part otherwise.
            // Repairs/rework are exempt — the joint was already fitted.
            const fitUpGate = (key: string, isRepair: boolean): QueueWeldItem['fitUp'] => {
              if (wo.flags.fitUpTracking === 'off' || isRepair) return undefined;
              const status = fitUps[key];
              if (status === 'ready') return undefined;
              if (wo.flags.fitUpTracking === 'gated-inspected' && status === 'pending-approval')
                return 'pending-approval';
              return status === 'pending-approval' ? 'pending-approval' : 'required';
            };

            if (mode === 'part-level') {
              const check = checkPartQualification(currentUser, part);
              const completed = completedPartIds.has(part.id);
              const fitUp = fitUpGate(part.id, !!partReworkById.get(part.id));
              const gate = fitUp ? ('locked' as const) : gateLevel(check, wo.flags);
              return {
                part,
                workOrder: wo,
                mode,
                welds: [],
                remaining: completed ? 0 : 1,
                completed,
                gate,
                gateReason: fitUp
                  ? fitUp === 'required'
                    ? 'Awaiting fit-up'
                    : 'Fit-up awaiting inspection'
                  : check.reason,
                attributedArcs: arcsByPart[part.id]?.length ?? 0,
                rework: partReworkById.get(part.id),
                fitUp,
              } as QueuePartItem;
            }
            const welds: QueueWeldItem[] = part.welds.map((weld) => {
              const check = checkWeldQualification(currentUser, weld);
              const isRework = reworkByWeldId.has(weld.id);
              const fitUp = fitUpGate(weld.id, isRework);
              return {
                weld,
                completed: completedWeldIds.has(weld.id),
                gate: fitUp ? ('locked' as const) : gateLevel(check, wo.flags),
                gateReason: fitUp
                  ? fitUp === 'required'
                    ? 'Awaiting fit-up'
                    : 'Fit-up awaiting inspection'
                  : check.reason,
                repair: isRework ? { of: weld.id, ...reworkByWeldId.get(weld.id)! } : undefined,
                fitUp,
              };
            });
            // Repair welds (W-xxx-R1) rejected by inspection: visible to the
            // assigned welder, or to everyone when left in the open pool.
            for (const entry of repairWelds) {
              if (entry.weld.partNumber !== part.id) continue;
              if (entry.assignedTo && entry.assignedTo !== currentUser.id) continue;
              const check = checkWeldQualification(currentUser, entry.weld);
              welds.push({
                weld: entry.weld,
                completed: completedWeldIds.has(entry.weld.id),
                gate: gateLevel(check, wo.flags),
                gateReason: check.reason,
                repair: { of: entry.repairOf, defectCode: entry.defectCode, note: entry.note },
              });
            }
            const remaining = welds.filter((w) => !w.completed).length;
            return {
              part,
              workOrder: wo,
              mode,
              welds,
              remaining,
              completed: remaining === 0,
              gate: 'ok' as const,
              gateReason: null,
              attributedArcs: 0,
            };
          }),
      }))
      .filter((group) => group.parts.length > 0);
  }, [workOrders, partsCatalog, currentUser, completedWeldIds, completedPartIds, arcsByPart, repairWelds, reworkByWeldId, partReworkById, fitUps]);

  /** Parts shaped for components that expect Part[] with only remaining welds. */
  const voiceParts: Part[] = useMemo(
    () =>
      queue
        .flatMap((g) => g.parts)
        .filter((p) => !p.completed && p.mode === 'per-weld')
        .map((p) => ({ ...p.part, welds: p.welds.filter((w) => !w.completed && w.gate !== 'locked').map((w) => w.weld) })),
    [queue]
  );

  const activeFlags: CapabilityFlags | null =
    active?.workOrder.flags ?? partSession?.workOrder.flags ?? signTarget?.workOrder.flags ?? null;

  const verificationNeeded = useMemo(() => {
    if (!active) return false;
    const level = active.workOrder.flags.consumableVerification;
    if (level === 'off') return false;
    if (level === 'per-weld') return true;
    return !verifiedParts.has(active.weld.partNumber);
  }, [active, verifiedParts]);

  const allConsumablesVerified = !verificationNeeded || consumables.every((c) => c.verified);

  const nextWeld = useMemo(() => {
    if (!active) return null;
    const group = queue.flatMap((g) => g.parts).find((p) => p.part.id === active.weld.partNumber);
    if (!group) return null;
    const idx = group.welds.findIndex((w) => w.weld.id === active.weld.id);
    const candidate = group.welds.find(
      (w, i) => i > idx && !w.completed && w.gate !== 'locked'
    );
    return candidate?.weld ?? null;
  }, [active, queue]);

  // Header steps adapt: SIGN only exists when the active context demands it.
  const showSignStep = activeFlags
    ? activeFlags.signOffRigor !== 'none' && activeFlags.weldGranularity === 'per-weld'
    : completedWelds.some((cw) => !cw.signed && cw.method !== 'signed');

  // ── Arc timer (per-weld mode) ──

  const startArcTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setArcTime((t) => t + 1), 1000);
  }, []);

  const stopArcTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => stopArcTimer(), [stopArcTimer]);

  const createArc = useCallback((duration: number, index: number): Arc => {
    const passOptions = [['Root'], ['Root', 'Fill'], ['Root', 'Fill', 'Cap']];
    return {
      id: `arc-${Date.now()}-${index}`,
      duration,
      startedAt: new Date(Date.now() - duration * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      avgHeat: Number((0.95 + Math.random() * 0.1).toFixed(2)),
      wpsConformance: Math.floor(82 + Math.random() * 12),
      passes: passOptions[Math.min(index, 2)],
    };
  }, []);

  const buildFinalArcs = useCallback(() => {
    const finalArcs = [...arcs];
    const duration = arcTime - arcStartOffset;
    if (duration > 0) finalArcs.push(createArc(duration, finalArcs.length));
    return finalArcs;
  }, [arcs, arcTime, arcStartOffset, createArc]);

  const toggleArcPause = useCallback(() => {
    const nextPaused = !isArcPaused;
    if (nextPaused) {
      const duration = arcTime - arcStartOffset;
      if (duration > 0) setArcs((prev) => [...prev, createArc(duration, prev.length)]);
      setArcStartOffset(arcTime);
      stopArcTimer();
    } else {
      startArcTimer();
    }
    setIsArcPaused(nextPaused);
  }, [isArcPaused, arcTime, arcStartOffset, createArc, startArcTimer, stopArcTimer]);

  const resetArcState = useCallback(() => {
    setArcTime(0);
    setArcs([]);
    setArcStartOffset(0);
    setIsArcPaused(false);
  }, []);

  // ── Per-weld flow ──

  const selectWeld = useCallback(
    (weld: Weld, workOrder: WorkOrder) => {
      if (!currentUser) return;
      const check = checkWeldQualification(currentUser, weld);
      const gate = gateLevel(check, workOrder.flags);
      if (gate === 'locked') {
        showError(`Locked: ${check.reason}`);
        return;
      }
      if (gate === 'warn') showError(`Qualification warning: ${check.reason}`);
      setLastCompletedPartId(null);
      setActive({ weld, workOrder });
      setSignTarget(null);
      setStep('weldActive');
      setWorkflowStep('weldActive');
      setWeldActiveMode('setup');
      resetArcState();
      const level = workOrder.flags.consumableVerification;
      if (level === 'per-weld' || (level === 'per-part' && !verifiedParts.has(weld.partNumber))) {
        setConsumables(freshConsumables());
      }
    },
    [currentUser, resetArcState, verifiedParts]
  );

  /** Used by queue items that already know their work order group. */
  const selectWeldInQueue = useCallback(
    (weld: Weld) => {
      const group = queue.find((g) => g.parts.some((p) => p.part.id === weld.partNumber));
      if (group) selectWeld(weld, group.workOrder);
    },
    [queue, selectWeld]
  );

  const verifyConsumable = useCallback((id: string) => {
    setConsumables((prev) =>
      prev.map((c) => (c.id === id ? { ...c, verified: true, method: 'voice' as const } : c))
    );
  }, []);

  const startArc = useCallback(() => {
    if (!active) return;
    if (active.workOrder.flags.consumableVerification === 'per-part') {
      setVerifiedParts((prev) => new Set(prev).add(active.weld.partNumber));
    }
    setWeldActiveMode('arc');
    setIsArcPaused(false);
    setArcStartOffset(0);
    startArcTimer();
  }, [active, startArcTimer]);

  const recordCompletedWeld = useCallback(
    (weld: Weld, workOrder: WorkOrder, method: CompletedWeldRecord['method'], weldArcs: Arc[]) => {
      if (!currentUser) return;
      const flags = workOrder.flags;
      const needsSign = flags.signOffRigor !== 'none';
      const repairEntry = repairWelds.find((r) => r.weld.id === weld.id);
      const isRework = reworkByWeldId.has(weld.id);
      setCompletedWelds((prev) => {
        if (prev.some((cw) => cw.weld.id === weld.id && cw.inspectionStatus !== 'rejected'))
          return prev;
        return [
          // Rework-flag mode re-welds the same id: replace the rejected record
          ...prev.filter((cw) => cw.weld.id !== weld.id),
          {
            weld,
            completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            arcs: weldArcs,
            method,
            consumables:
              flags.consumableVerification !== 'off' ? consumables.map((c) => ({ ...c })) : undefined,
            workOrderId: workOrder.id,
            welderId: currentUser.id,
            signed: !needsSign,
            locked: !needsSign,
            // Repairs and rework always loop back to inspection
            inspectionStatus: repairEntry || isRework ? 'pending' : decideInspection(flags),
            repairOf: repairEntry?.repairOf,
            defectCode: repairEntry?.defectCode,
          },
        ];
      });
    },
    [currentUser, consumables, repairWelds, reworkByWeldId]
  );

  const finishAndStartNext = useCallback(() => {
    if (!active) return;
    const { weld, workOrder } = active;
    const finalArcs = buildFinalArcs();
    recordCompletedWeld(weld, workOrder, 'done', finalArcs);

    const group = queue.flatMap((g) => g.parts).find((p) => p.part.id === weld.partNumber);
    const idx = group?.welds.findIndex((w) => w.weld.id === weld.id) ?? -1;
    const next =
      group?.welds.find((w, i) => i > idx && !w.completed && w.gate !== 'locked')?.weld ?? null;
    const remainingAfter =
      group?.welds.filter((w) => !w.completed && w.weld.id !== weld.id) ?? [];

    if (next) {
      // More welds on this part — keep the rhythm going
      setActive({ weld: next, workOrder });
      resetArcState();
      const level = workOrder.flags.consumableVerification;
      if (level === 'per-weld') {
        setConsumables(freshConsumables());
        setWeldActiveMode('setup');
        stopArcTimer();
      } else {
        setWeldActiveMode('arc');
        startArcTimer();
      }
      return;
    }

    stopArcTimer();
    resetArcState();
    setActive(null);

    if (remainingAfter.length > 0) {
      // Remaining welds are locked for this welder — hand the part back
      const fitUpBlocked = remainingAfter.some((w) => w.fitUp);
      showError(
        fitUpBlocked
          ? 'Remaining welds on this part are awaiting fit-up'
          : 'Remaining welds on this part need a differently qualified welder'
      );
      setStep('taskQueue');
      setWorkflowStep('taskQueue');
      return;
    }

    // Part complete — route per sign-off flag
    if (workOrder.flags.signOffRigor !== 'none' && group) {
      setSignTarget({ workOrder, part: group.part });
      setStep('reviewAndSign');
      setWorkflowStep('reviewAndSign');
    } else {
      setLastCompletedPartId(weld.partNumber);
      showSuccess(`Part ${weld.partNumber} complete`);
    }
  }, [active, buildFinalArcs, recordCompletedWeld, queue, resetArcState, startArcTimer, stopArcTimer]);

  const chooseDifferentWeld = useCallback(() => {
    if (active) {
      const finalArcs = buildFinalArcs();
      recordCompletedWeld(active.weld, active.workOrder, 'done', finalArcs);
    }
    stopArcTimer();
    resetArcState();
    setWeldActiveMode('setup');
  }, [active, buildFinalArcs, recordCompletedWeld, stopArcTimer, resetArcState]);

  const backToQueue = useCallback(() => {
    stopArcTimer();
    resetArcState();
    setActive(null);
    setSignTarget(null);
    setLastCompletedPartId(null);
    setWeldActiveMode('setup');
    setStep('taskQueue');
    setWorkflowStep('taskQueue');
  }, [stopArcTimer, resetArcState]);

  // ── Sign-off ──

  const signWelds = useCallback(
    (weldIds: string[]) => {
      setCompletedWelds((prev) =>
        prev.map((cw) =>
          weldIds.includes(cw.weld.id)
            ? { ...cw, signed: true, locked: true, method: 'signed' as const }
            : cw
        )
      );
    },
    []
  );

  const finishSignOff = useCallback(() => {
    const target = signTarget;
    if (target) {
      const partWelds = completedWelds.filter((cw) => cw.weld.partNumber === target.part.id);
      const toInspect = partWelds.filter((cw) => cw.inspectionStatus === 'pending').length;
      showSuccess(
        toInspect > 0
          ? `${target.part.id} signed — ${toInspect} weld${toInspect !== 1 ? 's' : ''} sent to inspection`
          : `${target.part.id} signed`
      );
    }
    setSignTarget(null);
    setStep('taskQueue');
    setWorkflowStep('taskQueue');
  }, [signTarget, completedWelds]);

  // ── Part sessions (part-level granularity) ──

  const sessionVerificationNeeded = useMemo(() => {
    if (!partSession) return false;
    const level = partSession.workOrder.flags.consumableVerification;
    if (level === 'off') return false;
    return !verifiedParts.has(partSession.part.id);
  }, [partSession, verifiedParts]);

  const sessionArmed = !!partSession && !sessionVerificationNeeded;

  const startPartSession = useCallback(
    (part: Part, workOrder: WorkOrder) => {
      if (!currentUser) return;
      const check = checkPartQualification(currentUser, part);
      const gate = gateLevel(check, workOrder.flags);
      if (gate === 'locked') {
        showError(`Locked: ${check.reason}`);
        return;
      }
      if (gate === 'warn') showError(`Qualification warning: ${check.reason}`);
      setActive(null);
      setSignTarget(null);
      setPartSession({ part, workOrder });
      setSessionTime(0);
      // Sweep in any arcs the welder already attributed to this part
      setSessionArcs(arcsByPart[part.id] ?? []);
      setArcsByPart((prev) => {
        const next = { ...prev };
        delete next[part.id];
        return next;
      });
      if (workOrder.flags.consumableVerification !== 'off' && !verifiedParts.has(part.id)) {
        setConsumables(freshConsumables());
      }
      setStep('weldActive');
      setWorkflowStep('weldActive');
    },
    [currentUser, arcsByPart, verifiedParts]
  );

  const verifySessionConsumables = useCallback(() => {
    if (!partSession) return;
    setVerifiedParts((prev) => new Set(prev).add(partSession.part.id));
  }, [partSession]);

  // Session clock + machine arc auto-bundling: while armed, the (simulated)
  // machine logs arcs against the open part session without any taps.
  useEffect(() => {
    if (!partSession) return;
    const tick = setInterval(() => setSessionTime((t) => t + 1), 1000);
    return () => clearInterval(tick);
  }, [partSession]);

  useEffect(() => {
    if (!sessionArmed) return;
    const gen = setInterval(() => {
      if (Math.random() < 0.18) {
        const duration = Math.floor(8 + Math.random() * 35);
        setSessionArcs((prev) => [...prev, createArc(duration, prev.length)]);
      }
    }, 1000);
    return () => clearInterval(gen);
  }, [sessionArmed, createArc]);

  const completePartSession = useCallback(
    (selfChecked: boolean) => {
      if (!partSession || !currentUser) return;
      const { part, workOrder } = partSession;
      setCompletedParts((prev) => {
        const wasRejected = prev.some(
          (cp) => cp.partId === part.id && cp.inspectionStatus === 'rejected'
        );
        return [
          // Rework replaces the rejected completion record
          ...prev.filter((cp) => cp.partId !== part.id),
          {
            workOrderId: workOrder.id,
            partId: part.id,
            welderId: currentUser.id,
            completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            arcs: sessionArcs,
            selfChecked,
            // Rework always loops back to whoever rejected it
            inspectionStatus: wasRejected ? 'pending' : decideInspection(workOrder.flags),
          },
        ];
      });
      showSuccess(
        `${part.id} complete — ${sessionArcs.length} arc${sessionArcs.length !== 1 ? 's' : ''} bundled${selfChecked ? ' · self-check passed' : ''}`
      );
      setPartSession(null);
      setSessionArcs([]);
      setSessionTime(0);
      setStep('taskQueue');
      setWorkflowStep('taskQueue');
    },
    [partSession, currentUser, sessionArcs]
  );

  const pausePartSession = useCallback(() => {
    if (!partSession) return;
    // Keep accumulated arcs attributed to the part so resuming continues where it left off
    if (sessionArcs.length > 0) {
      setArcsByPart((prev) => ({ ...prev, [partSession.part.id]: sessionArcs }));
    }
    setPartSession(null);
    setSessionArcs([]);
    setSessionTime(0);
    setStep('taskQueue');
    setWorkflowStep('taskQueue');
  }, [partSession, sessionArcs]);

  // ── Weld-first: unattributed arc tray ──

  const hasWeldFirstWork = useMemo(
    () =>
      queue.some(
        (g) =>
          g.workOrder.flags.taskDirection === 'weld-first' &&
          g.parts.some((p) => !p.completed)
      ),
    [queue]
  );

  const simulateMachineArc = useCallback(() => {
    const duration = Math.floor(8 + Math.random() * 35);
    setUnattributedArcs((prev) => [...prev, createArc(duration, prev.length)]);
  }, [createArc]);

  const assignArcsToPart = useCallback(
    (partId: string) => {
      if (unattributedArcs.length === 0) return;
      setArcsByPart((prev) => ({
        ...prev,
        [partId]: [...(prev[partId] ?? []), ...unattributedArcs],
      }));
      showSuccess(
        `${unattributedArcs.length} arc${unattributedArcs.length !== 1 ? 's' : ''} attributed to ${partId}`
      );
      setUnattributedArcs([]);
    },
    [unattributedArcs]
  );

  // ── Inspector: queue, accept/reject, repair loop ──

  /** Welds ready for inspection: pending + signed (or no sign-off required). */
  const inspectionQueue = useMemo(
    () =>
      completedWelds.filter((cw) => {
        if (cw.inspectionStatus !== 'pending') return false;
        const wo = woById.get(cw.workOrderId);
        return cw.signed || wo?.flags.signOffRigor === 'none';
      }),
    [completedWelds, woById]
  );

  const partInspectionQueue = useMemo(
    () => completedParts.filter((cp) => cp.inspectionStatus === 'pending'),
    [completedParts]
  );

  /** Completed work that wasn't routed to inspection — inspectors can pull it in ad hoc. */
  const uninspectedWelds = useMemo(
    () =>
      completedWelds.filter(
        (cw) =>
          (cw.inspectionStatus === 'not-required' || cw.inspectionStatus === 'self-checked') &&
          cw.signed !== false
      ),
    [completedWelds]
  );

  const uninspectedParts = useMemo(
    () =>
      completedParts.filter(
        (cp) => cp.inspectionStatus === 'not-required' || cp.inspectionStatus === 'self-checked'
      ),
    [completedParts]
  );

  const acceptWeld = useCallback((weldId: string) => {
    setCompletedWelds((prev) =>
      prev.map((cw) =>
        cw.weld.id === weldId ? { ...cw, inspectionStatus: 'accepted' as const } : cw
      )
    );
    showSuccess(`${weldId} accepted`);
  }, []);

  const rejectWeld = useCallback(
    (weldId: string, defectCode: string, note: string, assignedTo?: string) => {
      const record = completedWelds.find((cw) => cw.weld.id === weldId);
      if (!record) return;
      const wo = woById.get(record.workOrderId);
      if (!wo) return;

      setCompletedWelds((prev) =>
        prev.map((cw) =>
          cw.weld.id === weldId
            ? {
                ...cw,
                inspectionStatus: 'rejected' as const,
                defectCode,
                reworkNote: note || undefined,
              }
            : cw
        )
      );

      if (wo.flags.repairModel === 'new-weld') {
        // O&G/Wind/Shipyard: rejection spawns W-xxx-R1 with its own full history
        const baseId = record.repairOf ?? weldId.replace(/-R\d+$/, '');
        const repairIndex = repairWelds.filter((r) => r.repairOf === baseId).length + 1;
        const repairId = `${baseId}-R${repairIndex}`;
        setRepairWelds((prev) => [
          ...prev,
          {
            weld: { ...record.weld, id: repairId, priority: true },
            workOrderId: wo.id,
            repairOf: baseId,
            defectCode,
            note: note || undefined,
            assignedTo,
          },
        ]);
        showSuccess(`${weldId} rejected — repair ${repairId} ${assignedTo ? 'assigned' : 'in open pool'}`);
      } else {
        // Mobile machinery: rework info attaches to the weld, which reopens in place
        showSuccess(`${weldId} rejected — flagged for rework`);
      }
    },
    [completedWelds, woById, repairWelds]
  );

  const acceptPart = useCallback((partId: string) => {
    setCompletedParts((prev) =>
      prev.map((cp) =>
        cp.partId === partId ? { ...cp, inspectionStatus: 'accepted' as const } : cp
      )
    );
    showSuccess(`${partId} accepted`);
  }, []);

  const rejectPart = useCallback((partId: string, defectCode: string, note: string) => {
    setCompletedParts((prev) =>
      prev.map((cp) =>
        cp.partId === partId
          ? {
              ...cp,
              inspectionStatus: 'rejected' as const,
              defectCode,
              reworkNote: note || undefined,
            }
          : cp
      )
    );
    showSuccess(`${partId} rejected — flagged for rework`);
  }, []);

  const markWeldForInspection = useCallback((weldId: string) => {
    setCompletedWelds((prev) =>
      prev.map((cw) =>
        cw.weld.id === weldId ? { ...cw, inspectionStatus: 'pending' as const } : cw
      )
    );
  }, []);

  const markPartForInspection = useCallback((partId: string) => {
    setCompletedParts((prev) =>
      prev.map((cp) =>
        cp.partId === partId ? { ...cp, inspectionStatus: 'pending' as const } : cp
      )
    );
  }, []);

  // ── Fitter: fit-up tasks gate welding ──

  /** Open fit-up work across active WOs: per joint in per-weld mode, per part otherwise. */
  const fitUpTasks: FitUpTask[] = useMemo(() => {
    const tasks: FitUpTask[] = [];
    for (const wo of workOrders) {
      if (wo.status !== 'released' && wo.status !== 'in-progress') continue;
      if (wo.flags.fitUpTracking === 'off') continue;
      for (const pid of wo.partIds) {
        const part = partsCatalog.find((p) => p.id === pid);
        if (!part) continue;
        if (wo.flags.weldGranularity === 'part-level') {
          if (completedPartIds.has(part.id)) continue;
          if (fitUps[part.id] === 'ready') continue;
          tasks.push({ key: part.id, workOrder: wo, part, status: fitUps[part.id] });
        } else {
          for (const weld of part.welds) {
            if (completedWeldIds.has(weld.id)) continue;
            if (fitUps[weld.id] === 'ready') continue;
            tasks.push({ key: weld.id, workOrder: wo, part, weld, status: fitUps[weld.id] });
          }
        }
      }
    }
    return tasks;
  }, [workOrders, partsCatalog, completedPartIds, completedWeldIds, fitUps]);

  /** Fit-ups waiting for inspector sign-off (strictest mode). */
  const fitUpApprovalQueue: FitUpTask[] = useMemo(
    () => fitUpTasks.filter((t) => t.status === 'pending-approval'),
    [fitUpTasks]
  );

  const markFitUpReady = useCallback((task: FitUpTask) => {
    const needsApproval = task.workOrder.flags.fitUpTracking === 'gated-inspected';
    setFitUps((prev) => ({ ...prev, [task.key]: needsApproval ? 'pending-approval' : 'ready' }));
    showSuccess(
      needsApproval
        ? `${task.key} fit-up done — awaiting inspector sign-off`
        : `${task.key} fit-up done — weld released`
    );
  }, []);

  const approveFitUp = useCallback((key: string) => {
    setFitUps((prev) => ({ ...prev, [key]: 'ready' }));
    showSuccess(`Fit-up ${key} approved — weld released`);
  }, []);

  const rejectFitUp = useCallback((key: string) => {
    setFitUps((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    showSuccess(`Fit-up ${key} sent back to fitter`);
  }, []);

  const resumeStep = useCallback(() => setStep(workflowStep), [workflowStep]);

  return {
    // data
    queue,
    voiceParts,
    completedWelds,
    completedParts,
    activeFlags,
    // navigation
    step,
    setStep,
    workflowStep,
    resumeStep,
    showSignStep,
    // per-weld flow
    weldActiveMode,
    active,
    selectedWeld: active?.weld ?? null,
    nextWeld,
    consumables,
    verificationNeeded,
    allConsumablesVerified,
    arcTime,
    isArcPaused,
    lastCompletedPartId,
    selectWeld,
    selectWeldInQueue,
    verifyConsumable,
    startArc,
    toggleArcPause,
    finishAndStartNext,
    chooseDifferentWeld,
    backToQueue,
    // sign-off
    signTarget,
    signWelds,
    finishSignOff,
    // part sessions
    partSession,
    sessionTime,
    sessionArcs,
    sessionArmed,
    sessionVerificationNeeded,
    startPartSession,
    verifySessionConsumables,
    completePartSession,
    pausePartSession,
    // weld-first tray
    hasWeldFirstWork,
    unattributedArcs,
    simulateMachineArc,
    assignArcsToPart,
    // inspector
    partsCatalog,
    workOrders,
    inspectionQueue,
    partInspectionQueue,
    uninspectedWelds,
    uninspectedParts,
    acceptWeld,
    rejectWeld,
    acceptPart,
    rejectPart,
    markWeldForInspection,
    markPartForInspection,
    // fitter
    fitUpTasks,
    fitUpApprovalQueue,
    markFitUpReady,
    approveFitUp,
    rejectFitUp,
    // voice panel compat
    isRecording,
    setIsRecording,
    voiceCommand,
  };
}

export type OperatorFlow = ReturnType<typeof useOperatorFlow>;
