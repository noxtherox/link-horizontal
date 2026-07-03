import { Weld, WpsProcessStep } from '@/types/weldcloud';

export const assignedSteps = (weld: Weld): WpsProcessStep[] =>
  weld.processes.filter((s) => s.assigned);

export const unassignedSteps = (weld: Weld): WpsProcessStep[] =>
  weld.processes.filter((s) => !s.assigned);

// True when the welder's task covers only part of the WPS process stack
export const isPartialAssignment = (weld: Weld): boolean =>
  weld.processes.some((s) => !s.assigned);

export const assignedPasses = (weld: Weld): string[] =>
  assignedSteps(weld).flatMap((s) => s.passes);

export const processLabel = (weld: Weld): string =>
  assignedSteps(weld).map((s) => s.process).join(' + ');

// Note for the paused/done arc screen when the weld's later processes belong
// to someone else: the welder can move on, the rest is handed off.
export function getHandoffNote(weld: Weld, hasNextWeld: boolean): string | null {
  const assigned = assignedSteps(weld);
  const remaining = unassignedSteps(weld).filter((s) => !s.completed);
  if (assigned.length === 0 || remaining.length === 0) return null;
  const firstAssignedIdx = weld.processes.findIndex((s) => s.assigned);
  const yourLabel = assigned.length === 1
    ? `${ordinals[firstAssignedIdx] ?? '1st'} process (${assigned[0].process})`
    : `your processes (${assigned.map((s) => s.process).join(' + ')})`;
  const otherProcs = remaining.map((s) => s.process).join(' + ');
  const welders = joinAnd([...new Set(remaining.map((s) => s.welder ?? 'another welder'))]);
  return `When you're done with the ${yourLabel}, ${
    hasNextWeld ? 'continue to the next weld' : 'your work on this part is complete'
  } — ${otherProcs} will be done by ${welders}`;
}

export type ProcessScopeKind = 'full' | 'first-only' | 'waiting' | 'proceed';

export interface ProcessScope {
  kind: ProcessScopeKind;
  message: string;
  // false when an earlier process step is still open at another station
  canStart: boolean;
}

const joinAnd = (items: string[]): string =>
  items.length <= 1
    ? items.join('')
    : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

const ordinals = ['1st', '2nd', '3rd'];

// Classifies the welder's scope on this weld and builds the banner message
// shown above Start Arc.
export function getProcessScope(weld: Weld): ProcessScope {
  const assigned = assignedSteps(weld);
  const unassigned = unassignedSteps(weld);

  if (unassigned.length === 0) {
    return {
      kind: 'full',
      message: `You will complete the full weld with ${joinAnd(weld.processes.map((s) => s.process))}`,
      canStart: true,
    };
  }

  const firstAssignedIdx = weld.processes.findIndex((s) => s.assigned);
  const priorSteps = weld.processes.slice(0, firstAssignedIdx).filter((s) => !s.assigned);
  const yourProcs = assigned.map((s) => s.process).join(' + ');

  if (priorSteps.length === 0) {
    // You weld the first process(es); later steps go to someone else
    const otherWelders = joinAnd([...new Set(unassigned.map((s) => s.welder ?? 'another welder'))]);
    const otherProcs = unassigned.map((s) => s.process).join(' + ');
    const ordinal = assigned.length === 1
      ? `${ordinals[firstAssignedIdx] ?? '1st'} process`
      : `${assigned.length} first processes`;
    return {
      kind: 'first-only',
      message: `Only ${ordinal} — ${yourProcs}. Remaining passes to be done by ${otherWelders} (${otherProcs})`,
      canStart: true,
    };
  }

  const priorLabel = priorSteps.length === 1 ? 'First process' : 'Previous processes';

  if (priorSteps.every((s) => s.completed)) {
    return {
      kind: 'proceed',
      message: `${priorLabel} complete, you can proceed with the remaining layers (${yourProcs})`,
      canStart: true,
    };
  }

  const priorWelders = joinAnd([
    ...new Set(priorSteps.filter((s) => !s.completed).map((s) => s.welder ?? 'another welder')),
  ]);
  return {
    kind: 'waiting',
    message: `${priorLabel} not yet complete, you will do the remaining passes (${yourProcs}) after it has been completed by ${priorWelders}`,
    canStart: false,
  };
}
