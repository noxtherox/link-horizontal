import { useWeldFlow } from '@/hooks/useWeldFlow';
import { Header } from '@/components/Header';
import { VoicePanel } from '@/components/VoicePanel';
import { StatusBar } from '@/components/StatusBar';
import { TaskQueue } from '@/components/TaskQueue';
import { WeldActive } from '@/components/WeldActive';
import { ReviewAndSign } from '@/components/ReviewAndSign';
import { FloorStatus } from '@/components/FloorStatus';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const statusHints: Record<string, string> = {
  taskQueue: 'Voice: say "start [weld ID]" · Tap play button on part to start first weld · Tap weld pills to expand · Scan: scan work order QR',
  weldActive: 'Setup: Voice "gas confirmed" · Touch confirm tiles · Scan consumables. Arc: minimal screen — eyes on arc · Touch command tiles · Voice PTT',
  reviewAndSign: 'Review completed welds grouped by part number. Tap Send to inspection in the right panel to lock welds. Add deviation notes before sending.',
  supervisor: 'Heat map strip + cell list · Touch adds alert/assign buttons per station · Voice alerts push to earpiece',
};

export default function Index() {
  const flow = useWeldFlow();
  const hint = statusHints[flow.viewMode === 'supervisor' ? 'supervisor' : flow.step];

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      <Header 
        viewMode={flow.viewMode} 
        setViewMode={flow.setViewMode} 
        step={flow.step}
        workflowStep={flow.workflowStep}
        setStep={flow.setStep}
        onResume={flow.resumeStep}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <main className="flex-1 overflow-y-auto min-h-0">
          {flow.viewMode === 'supervisor' && <FloorStatus />}

          {flow.viewMode === 'welder' && flow.step === 'taskQueue' && (
            <TaskQueue 
              parts={flow.parts} 
              onSelectWeld={flow.selectWeld}
              completedWelds={flow.completedWelds}
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
        />
      </div>

      <StatusBar hint={hint} />

      <Dialog open={flow.showConfirm} onOpenChange={flow.setShowConfirm}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Confirm Action</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-400 mb-4">{flow.confirmMessage}</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => flow.confirmAction?.()}
              className="p-4 bg-green-600 hover:bg-green-500 rounded-lg text-white font-medium transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => flow.setShowConfirm(false)}
              className="p-4 bg-[#2a2a2a] hover:bg-[#333333] rounded-lg text-white font-medium transition-colors"
            >
              No
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}