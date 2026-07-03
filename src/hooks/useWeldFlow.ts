import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { WelderStep, ViewMode, Weld, Consumable, Part, CompletedWeld, Arc } from '@/types/weldcloud';
import { parts as initialParts, consumables as initialConsumables } from '@/data/mockData';
import { showSuccess } from '@/utils/toast';

export function useWeldFlow() {
  const [viewMode, setViewMode] = useState<ViewMode>('welder');
  const [step, setStep] = useState<WelderStep>('taskQueue');
  const [workflowStep, setWorkflowStep] = useState<WelderStep>('taskQueue');
  const [weldActiveMode, setWeldActiveMode] = useState<'setup' | 'arc'>('setup');
  const [parts, setParts] = useState<Part[]>(initialParts);
  const [selectedWeld, setSelectedWeld] = useState<Weld | null>(null);
  const [consumables, setConsumables] = useState<Consumable[]>(initialConsumables);
  const [arcTime, setArcTime] = useState(0);
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [arcStartOffset, setArcStartOffset] = useState(0);
  const [deviationText, setDeviationText] = useState('');
  const [deviations, setDeviations] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [isArcPaused, setIsArcPaused] = useState(false);
  const [completedWelds, setCompletedWelds] = useState<CompletedWeld[]>([]);
  const [lastCompletedPartId, setLastCompletedPartId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextWeld = useMemo(() => {
    if (!selectedWeld) return null;

    const currentPart = parts.find(p => p.id === selectedWeld.partNumber);
    if (!currentPart) return null;

    // Only suggest the next weld within the SAME part — never roll over into a new part
    const currentIndex = currentPart.welds.findIndex(w => w.id === selectedWeld.id);
    if (currentIndex >= 0 && currentIndex < currentPart.welds.length - 1) {
      return currentPart.welds[currentIndex + 1];
    }

    return null;
  }, [selectedWeld, parts]);

  const startArcTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setArcTime((t) => t + 1);
    }, 1000);
  }, []);

  const stopArcTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

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
    if (duration > 0) {
      finalArcs.push(createArc(duration, finalArcs.length));
    }
    return finalArcs;
  }, [arcs, arcTime, arcStartOffset, createArc]);

  const toggleArcPause = useCallback(() => {
    const nextPaused = !isArcPaused;
    if (nextPaused) {
      const duration = arcTime - arcStartOffset;
      if (duration > 0) {
        setArcs(prev => [...prev, createArc(duration, prev.length)]);
      }
      setArcStartOffset(arcTime);
      stopArcTimer();
    } else {
      startArcTimer();
    }
    setIsArcPaused(nextPaused);
  }, [isArcPaused, arcTime, arcStartOffset, createArc, startArcTimer, stopArcTimer]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const addCompletedWeld = useCallback((weld: Weld, method: CompletedWeld['method'], weldArcs: Arc[], consumablesSnapshot: Consumable[]) => {
    setCompletedWelds((prev) => {
      if (prev.some((cw) => cw.weld.id === weld.id)) return prev;
      return [
        ...prev,
        {
          weld,
          completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          arcs: weldArcs,
          method,
          consumables: consumablesSnapshot,
        },
      ];
    });
  }, []);

  const selectWeld = useCallback((weld: Weld) => {
    setLastCompletedPartId(null);
    setSelectedWeld(weld);
    setStep('weldActive');
    setWorkflowStep('weldActive');
    setWeldActiveMode('setup');
    setArcTime(0);
    setArcs([]);
    setArcStartOffset(0);
    setIsArcPaused(false);
    setDeviationText('');
  }, []);

  const verifyConsumable = useCallback((id: string) => {
    setConsumables((prev) =>
      prev.map((c) => (c.id === id ? { ...c, verified: true, method: 'voice' as const } : c))
    );
  }, []);

  const updateConsumable = useCallback((id: string, updates: Partial<Consumable>) => {
    setConsumables((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const updateCompletedWeldConsumable = useCallback((weldId: string, consumableId: string, updates: Partial<Consumable>) => {
    setCompletedWelds((prev) =>
      prev.map((cw) => {
        if (cw.weld.id !== weldId) return cw;
        return {
          ...cw,
          consumables: (cw.consumables || []).map((c) =>
            c.id === consumableId ? { ...c, ...updates } : c
          ),
        };
      })
    );
  }, []);

  const allConsumablesVerified = consumables.every((c) => c.verified);

  const startArc = useCallback(() => {
    setWeldActiveMode('arc');
    setIsArcPaused(false);
    setArcStartOffset(0);
    startArcTimer();
  }, [startArcTimer]);

  const pauseArc = useCallback(() => {
    toggleArcPause();
  }, [toggleArcPause]);

  const saveDeviation = useCallback(() => {
    if (deviationText.trim()) {
      setDeviations((prev) => [...prev, deviationText.trim()]);
      setDeviationText('');
    }
  }, [deviationText]);

  const completeWeld = useCallback(() => {
    const duration = arcTime - arcStartOffset;
    if (duration > 0) {
      setArcs(prev => [...prev, createArc(duration, prev.length)]);
      setArcStartOffset(arcTime);
    }
    stopArcTimer();
    setIsArcPaused(false);
    setStep('reviewAndSign');
    setWorkflowStep('reviewAndSign');
  }, [stopArcTimer, arcTime, arcStartOffset, createArc]);

  const signWeld = useCallback(() => {
    if (selectedWeld) {
      const finalArcs = buildFinalArcs();
      addCompletedWeld(selectedWeld, 'signed', finalArcs, consumables);
    }
    
    // Compute remaining parts before updating state
    const remainingParts = parts
      .map((part) => ({
        ...part,
        welds: part.welds.filter((w) => w.id !== selectedWeld?.id),
      }))
      .filter((part) => part.welds.length > 0);
    
    setParts(remainingParts);
    
    setSelectedWeld(null);
    setConsumables(initialConsumables);
    setArcTime(0);
    setArcs([]);
    setArcStartOffset(0);
    setIsArcPaused(false);
    setDeviationText('');
    setDeviations([]);
    setWeldActiveMode('setup');
    
    setStep('taskQueue');
    setWorkflowStep('taskQueue');
  }, [selectedWeld, addCompletedWeld, buildFinalArcs, parts, consumables]);

  const sendToInspection = useCallback(() => {
    setCompletedWelds((prev) => prev.map((cw) => ({ ...cw, locked: true })));
    showSuccess('All welds sent to inspection and locked');
  }, []);

  const sendPartToInspection = useCallback((partId: string) => {
    setCompletedWelds((prev) =>
      prev.map((cw) => cw.weld.partNumber === partId ? { ...cw, locked: true } : cw)
    );
    showSuccess(`Part ${partId} sent for review`);
  }, []);

  const finishAndStartNext = useCallback(() => {
    if (!selectedWeld) return;
    
    const finalArcs = buildFinalArcs();
    addCompletedWeld(selectedWeld, 'done', finalArcs, consumables);
    
    const currentPart = parts.find(p => p.id === selectedWeld.partNumber);
    const currentIndex = currentPart?.welds.findIndex(w => w.id === selectedWeld.id) ?? -1;

    // Only auto-advance to the next weld within the SAME part — never jump into a new part
    let nextWeldObj: Weld | null = null;
    if (currentPart && currentIndex >= 0 && currentIndex < currentPart.welds.length - 1) {
      nextWeldObj = currentPart.welds[currentIndex + 1];
    }

    // Remove current weld and compute remaining parts
    const remainingParts = parts
      .map((part) => ({
        ...part,
        welds: part.welds.filter((w) => w.id !== selectedWeld.id),
      }))
      .filter((part) => part.welds.length > 0);

    setParts(remainingParts);

    const resetWeldState = () => {
      setConsumables(initialConsumables);
      setArcTime(0);
      setArcs([]);
      setArcStartOffset(0);
      setIsArcPaused(false);
      setDeviationText('');
      setDeviations([]);
    };

    const nextWeldStillExists = nextWeldObj && remainingParts.some(p => p.welds.some(w => w.id === nextWeldObj?.id));

    if (nextWeldObj && nextWeldStillExists) {
      // More welds remain on this part — keep welding
      setSelectedWeld(nextWeldObj);
      setWeldActiveMode('arc');
      resetWeldState();
      startArcTimer();
    } else {
      // Part complete — go back to the task queue so the welder sees green weld pills
      // and can click "Send for review".
      stopArcTimer();
      setSelectedWeld(null);
      setLastCompletedPartId(null);
      resetWeldState();
      setStep('taskQueue');
      setWorkflowStep('taskQueue');
    }
  }, [selectedWeld, parts, buildFinalArcs, stopArcTimer, startArcTimer, addCompletedWeld, consumables]);

  const chooseDifferentWeld = useCallback(() => {
    if (selectedWeld) {
      const finalArcs = buildFinalArcs();
      addCompletedWeld(selectedWeld, 'done', finalArcs, consumables);
    }
    stopArcTimer();
    setIsArcPaused(false);
    setArcTime(0);
    setArcs([]);
    setArcStartOffset(0);
    setWeldActiveMode('setup');
    setDeviationText('');
    setDeviations([]);
  }, [selectedWeld, buildFinalArcs, stopArcTimer, addCompletedWeld, consumables]);

  const backToQueue = useCallback(() => {
    stopArcTimer();
    setIsArcPaused(false);
    setLastCompletedPartId(null);
    setSelectedWeld(null);
    setStep('taskQueue');
    setWorkflowStep('taskQueue');
    setArcTime(0);
    setArcs([]);
    setArcStartOffset(0);
    setWeldActiveMode('setup');
    setDeviationText('');
    setDeviations([]);
  }, [stopArcTimer]);

  const goToReview = useCallback(() => {
    setStep('reviewAndSign');
    setWorkflowStep('reviewAndSign');
  }, []);

  const resumeStep = useCallback(() => {
    setStep(workflowStep);
  }, [workflowStep]);

  const handleVoice = useCallback((cmd: string) => {
    setVoiceCommand(cmd);
    setTimeout(() => setVoiceCommand(''), 2000);
  }, []);

  return {
    viewMode,
    setViewMode,
    step,
    setStep,
    workflowStep,
    weldActiveMode,
    setWeldActiveMode,
    parts,
    selectedWeld,
    nextWeld,
    consumables,
    arcTime,
    arcs,
    deviationText,
    setDeviationText,
    deviations,
    isRecording,
    setIsRecording,
    voiceCommand,
    showConfirm,
    setShowConfirm,
    confirmAction,
    confirmMessage,
    allConsumablesVerified,
    isArcPaused,
    completedWelds,
    lastCompletedPartId,
    selectWeld,
    verifyConsumable,
    updateConsumable,
    updateCompletedWeldConsumable,
    startArc,
    pauseArc,
    toggleArcPause,
    saveDeviation,
    completeWeld,
    signWeld,
    sendToInspection,
    sendPartToInspection,
    finishAndStartNext,
    chooseDifferentWeld,
    backToQueue,
    goToReview,
    resumeStep,
    handleVoice,
  };
}