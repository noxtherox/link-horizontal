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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextWeld = useMemo(() => {
    if (!selectedWeld) return null;
    
    const currentPart = parts.find(p => p.id === selectedWeld.partNumber);
    if (!currentPart) return null;
    
    const currentIndex = currentPart.welds.findIndex(w => w.id === selectedWeld.id);
    if (currentIndex >= 0 && currentIndex < currentPart.welds.length - 1) {
      return currentPart.welds[currentIndex + 1];
    }
    
    const currentPartIndex = parts.findIndex(p => p.id === currentPart.id);
    for (let i = currentPartIndex + 1; i < parts.length; i++) {
      if (parts[i].welds.length > 0) {
        return parts[i].welds[0];
      }
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
    
    if (remainingParts.length === 0) {
      // All welds done - stay in weldActive context to show completion
      // Don't change step
    } else {
      setStep('taskQueue');
      setWorkflowStep('taskQueue');
    }
  }, [selectedWeld, addCompletedWeld, buildFinalArcs, parts, consumables]);

  const sendToInspection = useCallback(() => {
    setCompletedWelds((prev) => prev.map((cw) => ({ ...cw, locked: true })));
    showSuccess('All welds sent to inspection and locked');
  }, []);

  const finishAndStartNext = useCallback(() => {
    if (!selectedWeld) return;
    
    const finalArcs = buildFinalArcs();
    addCompletedWeld(selectedWeld, 'done', finalArcs, consumables);
    
    const currentPart = parts.find(p => p.id === selectedWeld.partNumber);
    const currentIndex = currentPart?.welds.findIndex(w => w.id === selectedWeld.id) ?? -1;
    let nextWeldObj: Weld | null = null;
    
    if (currentPart && currentIndex >= 0 && currentIndex < currentPart.welds.length - 1) {
      nextWeldObj = currentPart.welds[currentIndex + 1];
    } else {
      const currentPartIndex = parts.findIndex(p => p.id === currentPart?.id);
      for (let i = currentPartIndex + 1; i < parts.length; i++) {
        if (parts[i].welds.length > 0) {
          nextWeldObj = parts[i].welds[0];
          break;
        }
      }
    }
    
    // Remove current weld and compute remaining parts
    const remainingParts = parts
      .map((part) => ({
        ...part,
        welds: part.welds.filter((w) => w.id !== selectedWeld.id),
      }))
      .filter((part) => part.welds.length > 0);
    
    setParts(remainingParts);
    
    const nextWeldStillExists = nextWeldObj && remainingParts.some(p => p.welds.some(w => w.id === nextWeldObj?.id));
    
    if (nextWeldObj && nextWeldStillExists) {
      setSelectedWeld(nextWeldObj);
      setWeldActiveMode('arc');
      setConsumables(initialConsumables);
      setArcTime(0);
      setArcs([]);
      setArcStartOffset(0);
      setIsArcPaused(false);
      setDeviationText('');
      setDeviations([]);
      startArcTimer();
    } else {
      // No more welds - stay in weldActive context to show completion
      setSelectedWeld(null);
      setConsumables(initialConsumables);
      setArcTime(0);
      setArcs([]);
      setArcStartOffset(0);
      setIsArcPaused(false);
      setDeviationText('');
      setDeviations([]);
      stopArcTimer();
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
    finishAndStartNext,
    chooseDifferentWeld,
    backToQueue,
    goToReview,
    resumeStep,
    handleVoice,
  };
}