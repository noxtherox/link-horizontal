import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { WelderStep, ViewMode, Weld, Consumable, Part } from '@/types/weldcloud';
import { parts as initialParts, consumables as initialConsumables } from '@/data/mockData';

export function useWeldFlow() {
  const [viewMode, setViewMode] = useState<ViewMode>('welder');
  const [step, setStep] = useState<WelderStep>('taskQueue');
  const [workflowStep, setWorkflowStep] = useState<WelderStep>('taskQueue');
  const [parts, setParts] = useState<Part[]>(initialParts);
  const [selectedWeld, setSelectedWeld] = useState<Weld | null>(null);
  const [consumables, setConsumables] = useState<Consumable[]>(initialConsumables);
  const [arcTime, setArcTime] = useState(0);
  const [deviationText, setDeviationText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [isArcPaused, setIsArcPaused] = useState(false);
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

  const toggleArcPause = useCallback(() => {
    setIsArcPaused((prev) => {
      const next = !prev;
      if (next) {
        stopArcTimer();
      } else {
        startArcTimer();
      }
      return next;
    });
  }, [startArcTimer, stopArcTimer]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const selectWeld = useCallback((weld: Weld) => {
    setSelectedWeld(weld);
    setStep('preWeldCheck');
    setWorkflowStep('preWeldCheck');
    setArcTime(0);
    setIsArcPaused(false);
  }, []);

  const verifyConsumable = useCallback((id: string) => {
    setConsumables((prev) =>
      prev.map((c) => (c.id === id ? { ...c, verified: true, method: 'voice' as const } : c))
    );
  }, []);

  const allConsumablesVerified = consumables.every((c) => c.verified);

  const startArc = useCallback(() => {
    setStep('arcOn');
    setWorkflowStep('arcOn');
    setIsArcPaused(false);
    startArcTimer();
  }, [startArcTimer]);

  const pauseArc = useCallback(() => {
    stopArcTimer();
    setIsArcPaused(true);
    setStep('deviationFlag');
    setWorkflowStep('deviationFlag');
  }, [stopArcTimer]);

  const saveDeviation = useCallback(() => {
    setShowConfirm(true);
    setConfirmMessage('Save deviation note and resume arc?');
    setConfirmAction(() => () => {
      setShowConfirm(false);
      setDeviationText('');
      setIsArcPaused(false);
      setStep('arcOn');
      setWorkflowStep('arcOn');
      startArcTimer();
    });
  }, [startArcTimer]);

  const completeWeld = useCallback(() => {
    stopArcTimer();
    setIsArcPaused(false);
    setStep('completeSign');
    setWorkflowStep('completeSign');
  }, [stopArcTimer]);

  const signWeld = useCallback(() => {
    setParts((prev) =>
      prev
        .map((part) => ({
          ...part,
          welds: part.welds.filter((w) => w.id !== selectedWeld?.id),
        }))
        .filter((part) => part.welds.length > 0)
    );
    setSelectedWeld(null);
    setConsumables(initialConsumables);
    setArcTime(0);
    setIsArcPaused(false);
    setDeviationText('');
    setStep('taskQueue');
    setWorkflowStep('taskQueue');
  }, [selectedWeld]);

  const finishAndStartNext = useCallback(() => {
    if (!selectedWeld) return;
    
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
    
    setParts((prev) =>
      prev
        .map((part) => ({
          ...part,
          welds: part.welds.filter((w) => w.id !== selectedWeld.id),
        }))
        .filter((part) => part.welds.length > 0)
    );
    
    if (nextWeldObj) {
      setSelectedWeld(nextWeldObj);
      setStep('preWeldCheck');
      setWorkflowStep('preWeldCheck');
    } else {
      setSelectedWeld(null);
      setStep('taskQueue');
      setWorkflowStep('taskQueue');
    }
    setArcTime(0);
    setIsArcPaused(false);
    stopArcTimer();
  }, [selectedWeld, parts, stopArcTimer]);

  const chooseDifferentWeld = useCallback(() => {
    stopArcTimer();
    setIsArcPaused(false);
    setSelectedWeld(null);
    setStep('taskQueue');
    setWorkflowStep('taskQueue');
    setArcTime(0);
    setDeviationText('');
  }, [stopArcTimer]);

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
    parts,
    selectedWeld,
    nextWeld,
    consumables,
    arcTime,
    deviationText,
    setDeviationText,
    isRecording,
    setIsRecording,
    voiceCommand,
    showConfirm,
    setShowConfirm,
    confirmAction,
    confirmMessage,
    allConsumablesVerified,
    isArcPaused,
    selectWeld,
    verifyConsumable,
    startArc,
    pauseArc,
    toggleArcPause,
    saveDeviation,
    completeWeld,
    signWeld,
    finishAndStartNext,
    chooseDifferentWeld,
    resumeStep,
    handleVoice,
  };
}