import { useEffect, useState } from 'react';
import { useOperatorFlow } from '@/hooks/useOperatorFlow';
import { useSession } from '@/context/SessionContext';
import { Header } from '@/components/Header';
import { VoicePanel } from '@/components/VoicePanel';
import { StatusBar } from '@/components/StatusBar';
import { OperatorQueue } from '@/components/OperatorQueue';
import { WeldActive } from '@/components/WeldActive';
import { PartSession } from '@/components/PartSession';
import { PartSignOff } from '@/components/PartSignOff';
import { FloorStatus } from '@/components/FloorStatus';
import { WorkOrderSetup } from '@/components/manager/WorkOrderSetup';
import { BadgeIn } from '@/components/BadgeIn';
import { InspectorQueue } from '@/components/InspectorQueue';
import { FitterQueue } from '@/components/FitterQueue';
import { ViewMode } from '@/types/weldcloud';

const statusHints: Record<string, string> = {
  taskQueue: 'Tasks grouped by work order — each carries its own traceability rules · Locked welds need a valid qualification · Tap play to start',
  weldActive: 'Setup: verify consumables when required · Arc: minimal screen — eyes on arc · Part sessions bundle arcs automatically',
  reviewAndSign: 'Sign-off appears only when the work order requires it · Per-weld: tap each weld · Batch: one signature per part',
  supervisor: 'Heat map strip + cell list · Touch adds alert/assign buttons per station · Voice alerts push to earpiece',
  manager: 'Create work orders and pick an industry preset · Every traceability flag is overridable per work order · Tap a card to edit',
};

export default function Index() {
  const { currentUser, badgeOut, users } = useSession();
  const [viewMode, setViewMode] = useState<ViewMode>('welder');
  const flow = useOperatorFlow(currentUser);

  // Badge-in routes each role to its home view
  useEffect(() => {
    if (!currentUser) return;
    setViewMode(currentUser.role === 'manager' ? 'manager' : 'welder');
  }, [currentUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentUser) return <BadgeIn />;

  const isInspector = currentUser.role === 'inspector';
  const isFitter = currentUser.role === 'fitter';
  const hint =
    isInspector && viewMode === 'welder'
      ? 'Accept or reject each item · Reject requires a defect code · Rejections spawn a repair weld (W-xxx-R1) or a rework flag per the work order'
      : isFitter && viewMode === 'welder'
      ? 'Complete the fit-up checklist per joint · Mark ready releases the weld · Strictest mode routes fit-up to inspector sign-off first'
      : statusHints[viewMode !== 'welder' ? viewMode : flow.step];

  const signCurrentTarget = () => {
    if (!flow.signTarget) return;
    const ids = flow.completedWelds
      .filter((cw) => cw.weld.partNumber === flow.signTarget!.part.id && !cw.signed)
      .map((cw) => cw.weld.id);
    flow.signWelds(ids);
    flow.finishSignOff();
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        step={flow.step}
        workflowStep={flow.workflowStep}
        setStep={flow.setStep}
        onResume={flow.resumeStep}
        showSignStep={flow.showSignStep}
        currentUser={currentUser}
        onBadgeOut={badgeOut}
        stepStripOverride={
          isInspector
            ? 'Inspector View — Inspection Queue'
            : isFitter
            ? 'Fitter View — Fit-up Tasks'
            : undefined
        }
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <main className="flex-1 overflow-y-auto min-h-0">
          {viewMode === 'supervisor' && <FloorStatus />}

          {viewMode === 'manager' && <WorkOrderSetup />}

          {viewMode === 'welder' && isInspector && (
            <InspectorQueue flow={flow} currentUser={currentUser} users={users} />
          )}

          {viewMode === 'welder' && isFitter && (
            <FitterQueue flow={flow} currentUser={currentUser} />
          )}

          {viewMode === 'welder' && !isFitter && !isInspector && (
            <>
              {flow.step === 'taskQueue' && <OperatorQueue flow={flow} currentUser={currentUser} />}

              {flow.step === 'weldActive' &&
                (flow.partSession ? (
                  <PartSession flow={flow} />
                ) : (
                  <WeldActive
                    mode={flow.weldActiveMode}
                    onStartArc={flow.startArc}
                    onTogglePause={flow.toggleArcPause}
                    onComplete={flow.finishAndStartNext}
                    onDoneNext={flow.finishAndStartNext}
                    onChooseDifferent={flow.chooseDifferentWeld}
                    onBackToQueue={flow.backToQueue}
                    onVerify={flow.verifyConsumable}
                    allVerified={flow.allConsumablesVerified}
                    verificationNeeded={flow.verificationNeeded}
                    selectedWeld={flow.selectedWeld}
                    parts={flow.voiceParts}
                    onSelectWeld={flow.selectWeldInQueue}
                    arcTime={flow.arcTime}
                    isPaused={flow.isArcPaused}
                    nextWeld={flow.nextWeld}
                    completedWelds={flow.completedWelds}
                    onGoToReview={() => flow.setStep('reviewAndSign')}
                    showSign={flow.showSignStep}
                    lastCompletedPartId={flow.lastCompletedPartId}
                  />
                ))}

              {flow.step === 'reviewAndSign' && <PartSignOff flow={flow} currentUser={currentUser} />}
            </>
          )}
        </main>

        {viewMode !== 'manager' && (
          <VoicePanel
            viewMode={viewMode}
            step={flow.step}
            weldActiveMode={flow.weldActiveMode}
            isRecording={flow.isRecording}
            setIsRecording={flow.setIsRecording}
            voiceCommand={flow.voiceCommand}
            selectedWeld={flow.selectedWeld}
            nextWeld={flow.nextWeld}
            parts={flow.voiceParts}
            consumables={flow.verificationNeeded ? flow.consumables : undefined}
            completedWelds={
              flow.signTarget
                ? flow.completedWelds.filter((cw) => cw.weld.partNumber === flow.signTarget!.part.id)
                : flow.completedWelds
            }
            onVerify={flow.verifyConsumable}
            onSendToInspection={signCurrentTarget}
          />
        )}
      </div>

      <StatusBar hint={hint} />
    </div>
  );
}
