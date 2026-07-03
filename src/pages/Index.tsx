import { useWeldFlow } from '@/hooks/useWeldFlow';
import { Header } from '@/components/Header';
import { VoicePanel } from '@/components/VoicePanel';
import { InputBar } from '@/components/InputBar';
import { TaskQueue } from '@/components/TaskQueue';
import { WeldActive } from '@/components/WeldActive';
import { ReviewAndSign } from '@/components/ReviewAndSign';
import { FloorStatus } from '@/components/FloorStatus';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Index() {
  const flow = useWeldFlow();

  return (
    <div className="min-h-screen bg-[var(--c-root)] flex flex-col">
      <Header
        viewMode={flow.viewMode}
        setViewMode={flow.setViewMode}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden pb-[88px]">
        <main className="flex-1 overflow-y-auto min-h-0">
          {flow.viewMode === 'supervisor' && <FloorStatus />}

          {flow.viewMode === 'welder' && flow.step === 'taskQueue' && (
            <TaskQueue
              parts={flow.parts}
              onSelectWeld={flow.selectWeld}
              completedWelds={flow.completedWelds}
              onSendPartForReview={flow.sendPartToInspection}
            />
          )}

          {flow.viewMode === 'welder' && flow.step === 'weldActive' && (
            <WeldActive
              mode={flow.weldActiveMode}
              onStartArc={flow.startArc}
              onTogglePause={flow.toggleArcPause}
              onComplete={flow.completeWeld}
              onDoneNext={flow.finishAndStartNext}
              onChooseDifferent={flow.chooseDifferentWeld}
              onBackToQueue={flow.backToQueue}
              onVerify={flow.verifyConsumable}
              allVerified={flow.allConsumablesVerified}
              selectedWeld={flow.selectedWeld}
              parts={flow.parts}
              onSelectWeld={flow.selectWeld}
              arcTime={flow.arcTime}
              isPaused={flow.isArcPaused}
              nextWeld={flow.nextWeld}
              completedWelds={flow.completedWelds}
              onGoToReview={flow.goToReview}
              lastCompletedPartId={flow.lastCompletedPartId}
            />
          )}

          {flow.viewMode === 'welder' && flow.step === 'reviewAndSign' && (
            <ReviewAndSign
              onSign={flow.signWeld}
              arcTime={flow.arcTime}
              arcs={flow.arcs}
              selectedWeld={flow.selectedWeld}
              completedWelds={flow.completedWelds}
              parts={flow.parts}
              onSelectWeld={flow.selectWeld}
              consumables={flow.consumables}
              onUpdateConsumable={flow.updateConsumable}
              onUpdateCompletedWeldConsumable={flow.updateCompletedWeldConsumable}
            />
          )}
        </main>

        <VoicePanel
          viewMode={flow.viewMode}
          step={flow.step}
          weldActiveMode={flow.weldActiveMode}
          isRecording={flow.isRecording}
          setIsRecording={flow.setIsRecording}
          voiceCommand={flow.voiceCommand}
          selectedWeld={flow.selectedWeld}
          nextWeld={flow.nextWeld}
          parts={flow.parts}
          consumables={flow.consumables}
          completedWelds={flow.completedWelds}
          onVerify={flow.verifyConsumable}
          onSendToInspection={flow.sendToInspection}
          onSelectWeld={flow.selectWeld}
        />
      </div>

      <InputBar
        isRecording={flow.isRecording}
        setIsRecording={flow.setIsRecording}
        voiceCommand={flow.voiceCommand}
        step={flow.step}
        viewMode={flow.viewMode}
        weldActiveMode={flow.weldActiveMode}
        selectedWeld={flow.selectedWeld}
        parts={flow.parts}
      />

      <Dialog open={flow.showConfirm} onOpenChange={flow.setShowConfirm}>
        <DialogContent className="bg-[var(--c-raised)] border-[var(--c-border)] text-[var(--text-hi)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Confirm Action</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--text-lo)] mb-4">{flow.confirmMessage}</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => flow.confirmAction?.()}
              className="p-4 bg-green-600 hover:bg-green-500 rounded-lg text-[var(--text-hi)] font-medium transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => flow.setShowConfirm(false)}
              className="p-4 bg-[var(--c-border)] hover:bg-[var(--c-hover)] rounded-lg text-[var(--text-hi)] font-medium transition-colors"
            >
              No
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}