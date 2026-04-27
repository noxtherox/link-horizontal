import { useState, useCallback, useEffect, useRef } from 'react';
import { WelderStep, ViewMode, Weld, Consumable } from '@/types/weldcloud';
import { welds as initialWelds, consumables as initialConsumables } from '@/data/mockData';

export function useWeldFlow() {
  const [viewMode, setViewMode] = useState<ViewMode>('welder');
  const [step, setStep] = useState<WelderStep>('taskQueue');
  const [welds, setWelds] = useState<Weld[]>(initialWelds);
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
    startArcTimer();
  }, [startArcTimer]);

  const pauseArc = useCallback(() => {
    stopArcTimer();
    setStep('deviationFlag');
  }, [stopArcTimer]);

  const saveDeviation = useCallback(() => {
    setShowConfirm(true);
    setConfirmMessage('Save deviation note and resume arc?');
    setConfirmAction(() => () => {
      setShowConfirm(false);
      setDeviationText('');
      setStep('arcOn');
      startArcTimer();
    });
  }, [startArcTimer]);

  const completeWeld = useCallback(() => {
    stopArcTimer();
    setStep('completeSign');
  }, [stopArcTimer]);

  const signWeld = useCallback(() => {
    setWelds((prev) => prev.filter((w) => w.id !== selectedWeld?.id));
    setSelectedWeld(null);
    setConsumables(initialConsumables);
    setArcTime(0);
    setDeviationText('');
    setStep('taskQueue');
  }, [selectedWeld]);

  const handleVoice = useCallback((cmd: string) => {
    setVoiceCommand(cmd);
    setTimeout(() => setVoiceCommand(''), 2000);
  }, []);

  return {
    viewMode,
    setViewMode,
    step,
    setStep,
    welds,
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
    handleVoice,
  };
}