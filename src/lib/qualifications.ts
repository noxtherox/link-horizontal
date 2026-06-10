import { CapabilityFlags, Part, User, Weld } from '@/types/weldcloud';

export interface QualCheck {
  qualified: boolean;
  /** Human-readable reason when not qualified, e.g. "Requires 3G SMAW — no qualification" */
  reason: string | null;
}

const OK: QualCheck = { qualified: true, reason: null };

function positionOf(weld: Weld): string | null {
  return /\b(\d[GF])\b/.exec(weld.jointType)?.[1] ?? null;
}

export function checkWeldQualification(user: User, weld: Weld): QualCheck {
  const position = positionOf(weld);
  const candidates = user.qualifications.filter((q) => q.process === weld.process);
  if (candidates.length === 0) {
    return {
      qualified: false,
      reason: `Requires ${position ?? ''} ${weld.process} — no qualification`.replace('  ', ' '),
    };
  }
  const positionMatches = position
    ? candidates.filter((q) => q.positions.includes(position))
    : candidates;
  if (positionMatches.length === 0) {
    return { qualified: false, reason: `Requires position ${position} for ${weld.process}` };
  }
  const now = new Date().toISOString().slice(0, 10);
  const valid = positionMatches.filter((q) => q.expires >= now);
  if (valid.length === 0) {
    const latest = positionMatches.map((q) => q.expires).sort().pop();
    return { qualified: false, reason: `${weld.process} ${position ?? ''} expired ${latest}`.replace('  ', ' ') };
  }
  return OK;
}

/** Part-level granularity: the welder must be qualified for every weld on the part. */
export function checkPartQualification(user: User, part: Part): QualCheck {
  for (const weld of part.welds) {
    const check = checkWeldQualification(user, weld);
    if (!check.qualified) return check;
  }
  return OK;
}

/**
 * Gate or warn per the work order's wpqGating flag.
 * Returns: 'ok' | 'warn' (proceed with banner) | 'locked' (cannot start).
 */
export function gateLevel(check: QualCheck, flags: CapabilityFlags): 'ok' | 'warn' | 'locked' {
  if (check.qualified) return 'ok';
  return flags.wpqGating === 'hard-lock' ? 'locked' : 'warn';
}
