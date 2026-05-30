import { useState, useCallback, useEffect, useRef } from 'react';
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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    startArcTimer();
  }, [startArcTimer]);

  const pauseArc = useCallback(() => {
    stopArcTimer();
    setStep('deviationFlag');
    setWorkflowStep('deviationFlag');
  }, [stopArcTimer]);

  const saveDeviation = useCallback(() => {
    setShowConfirm(true);
    setConfirmMessage('Save deviation note and resume arc?');
    setConfirmAction(() => () => {
      setShowConfirm(false);
      setDeviationText('');
      setStep('arcOn');
      setWorkflowStep('arcOn');
      startArcTimer();
    });
  }, [startArcTimer]);

  const completeWeld = useCallback(() => {
    stopArcTimer();
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
    setDeviationText('');
    setStep('taskQueue');
    setWorkflowStep('taskQueue');
  }, [selectedWeld]);

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
    selectWeld,
    verifyConsumable,
    startArc,
    pauseArc,
    saveDeviation,
    completeWeld,
    signWeld,
    resumeStep,
    handleVoice,
  };
}