import { differenceInDays, addDays } from "date-fns";

export type Phase = "Menstrual" | "Follicular" | "Ovulatory" | "Luteal";

export interface CycleStatus {
  currentPhase: Phase;
  dayOfCycle: number;
  cycleLength: number;
  phaseDay: number;
  daysUntilNextPeriod: number;
  nextPeriodDate: Date;
  ovulationDate: Date;
  isPeriodDue: boolean;
  periodConfirmationNeeded: boolean;
  daysLate: number;
  confidenceScore: number;
  dataPoints: number;
}

const UNKNOWN_STATUS: CycleStatus = {
  currentPhase: "Follicular",
  dayOfCycle: 1,
  cycleLength: 28,
  phaseDay: 1,
  daysUntilNextPeriod: 28,
  nextPeriodDate: addDays(new Date(), 28),
  ovulationDate: addDays(new Date(), 14),
  isPeriodDue: false,
  periodConfirmationNeeded: false,
  daysLate: 0,
  confidenceScore: 0,
  dataPoints: 0,
};

export function calculateCycleStatus(profile: any): CycleStatus {
  const {
    periodDates,
    lastPeriodStart,
    avgCycleLength,
    periodDuration,
    conditions = [],
  } = profile ?? {};

  // Support both multi-date and legacy single-date format
  const rawDates: string[] =
    periodDates && periodDates.length > 0
      ? [...periodDates].sort()
      : lastPeriodStart
      ? [lastPeriodStart]
      : [];

  if (rawDates.length === 0) return UNKNOWN_STATUS;

  const mostRecent = rawDates[rawDates.length - 1];
  const periodLen = clamp(parseInt(periodDuration) || 5, 1, 10);

  // Compute cycle length from consecutive dates when possible
  let cycleLen: number;
  let confidence: number;

  if (rawDates.length >= 2) {
    const lengths: number[] = [];
    for (let i = 1; i < rawDates.length; i++) {
      const diff = differenceInDays(new Date(rawDates[i]), new Date(rawDates[i - 1]));
      if (diff >= 15 && diff <= 90) lengths.push(diff); // sanity filter
    }

    if (lengths.length === 0) {
      cycleLen = clamp(parseInt(avgCycleLength) || 28, 21, 90);
      confidence = 45;
    } else {
      cycleLen = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
      cycleLen = clamp(cycleLen, 21, 90);

      // More data = higher confidence, up to ~90
      confidence = 40 + Math.min(lengths.length, 5) * 10;

      // Penalise variability
      if (lengths.length > 1) {
        const mean = cycleLen;
        const stdDev = Math.sqrt(
          lengths.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / lengths.length
        );
        if (stdDev > 7) confidence -= 20;
        else if (stdDev > 3) confidence -= 10;
      }
    }
  } else {
    cycleLen = clamp(parseInt(avgCycleLength) || 28, 21, 90);
    confidence = 40;
  }

  if (conditions.includes("PCOS") || conditions.includes("PCOD")) confidence -= 10;

  const today = startOfDay(new Date());
  const start = startOfDay(new Date(mostRecent));
  const daysSinceStart = differenceInDays(today, start);

  if (daysSinceStart > cycleLen * 3) confidence -= 10;

  const ovulationDay = cycleLen - 14;
  const predictedNextPeriodDate = addDays(start, cycleLen);

  // Positive = period is overdue by that many days; 0 = predicted to start today
  const daysLate = differenceInDays(today, predictedNextPeriodDate);

  // Period predicted but user hasn't confirmed it started — don't assume Menstrual
  if (daysLate >= 0) {
    return {
      currentPhase: "Luteal",
      dayOfCycle: cycleLen + daysLate,
      cycleLength: cycleLen,
      phaseDay: (cycleLen - ovulationDay - 1) + daysLate + 1,
      daysUntilNextPeriod: -daysLate,
      nextPeriodDate: predictedNextPeriodDate,
      ovulationDate: addDays(predictedNextPeriodDate, -14),
      isPeriodDue: true,
      periodConfirmationNeeded: true,
      daysLate,
      confidenceScore: clamp(confidence, 0, 100),
      dataPoints: rawDates.length,
    };
  }

  // Within current cycle (period confirmed, not yet due)
  const dayOfCycle = daysSinceStart + 1;
  const daysUntilNextPeriod = -daysLate; // daysLate is negative here, so this is positive
  const ovulationDate = addDays(start, ovulationDay);

  let phase: Phase;
  let phaseDay: number;

  if (dayOfCycle <= periodLen) {
    phase = "Menstrual";
    phaseDay = dayOfCycle;
  } else if (dayOfCycle < ovulationDay - 1) {
    phase = "Follicular";
    phaseDay = dayOfCycle - periodLen;
  } else if (dayOfCycle <= ovulationDay + 1) {
    phase = "Ovulatory";
    phaseDay = dayOfCycle - (ovulationDay - 2);
  } else {
    phase = "Luteal";
    phaseDay = dayOfCycle - (ovulationDay + 1);
  }

  return {
    currentPhase: phase,
    dayOfCycle,
    cycleLength: cycleLen,
    phaseDay,
    daysUntilNextPeriod,
    nextPeriodDate: predictedNextPeriodDate,
    ovulationDate,
    isPeriodDue: false,
    periodConfirmationNeeded: false,
    daysLate: 0,
    confidenceScore: clamp(confidence, 0, 100),
    dataPoints: rawDates.length,
  };
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
