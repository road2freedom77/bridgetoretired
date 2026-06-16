// lib/calc/rothLadder.ts
// Roth Conversion Ladder Calculator Engine
// Standalone — replaces/refactors lib/planner/rothLadder.ts

export type FilingStatus = "mfj" | "single";

export interface RothLadderInputs {
  currentAge: number;
  bridgeEndAge: number; // age when 59½ / other income kicks in
  iraBalance: number;
  annualSpend: number; // annual $ needed from ladder
  otherIncome: number; // pension, rental, part-time, etc.
  filingStatus: FilingStatus;
  growthRate: number; // decimal e.g. 0.06
  taxableBalance: number; // starting cash/taxable to fund the 5-yr gap
}

export interface RothLadderRow {
  year: number; // 1-indexed
  age: number;
  conversionAmount: number;
  taxableIncome: number; // otherIncome + conversion (above std deduction)
  federalTax: number;
  effectiveRate: number; // decimal
  runsUnlocking: number | null; // which year's conversion unlocks (year - 5)
  rothBasisAvailable: number; // cumulative unlocked basis
  taxableBalanceRemaining: number;
  gapFunded: boolean; // is this year's spend covered by taxable?
  shortfall: number; // > 0 means cash ran out
}

export interface RothLadderResult {
  rows: RothLadderRow[];
  totalTaxPaid: number;
  totalConversions: number;
  gapYears: number; // always 5
  gapShortfall: number; // 0 = fine, > 0 = need more cash
  iraBalanceFinal: number;
  ladderFullyFunded: boolean;
  // summary for free tier
  estimatedAnnualTax: number;
  bracket: string;
}

// ─── Tax tables (2024, inflate lazily) ───────────────────────────────────────

const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  mfj: 29200,
  single: 14600,
};

// Brackets: [rate, upToTaxableIncome]
// "taxable income" = AGI - standard deduction
const BRACKETS_MFJ: [number, number][] = [
  [0.10, 23200],
  [0.12, 94300],
  [0.22, 201050],
  [0.24, 383900],
  [0.32, 487450],
  [0.35, 731200],
  [0.37, Infinity],
];

const BRACKETS_SINGLE: [number, number][] = [
  [0.10, 11600],
  [0.12, 47150],
  [0.22, 100525],
  [0.24, 191950],
  [0.32, 243725],
  [0.35, 609350],
  [0.37, Infinity],
];

function getBrackets(fs: FilingStatus) {
  return fs === "mfj" ? BRACKETS_MFJ : BRACKETS_SINGLE;
}

function calcFederalTax(taxableIncome: number, fs: FilingStatus): number {
  if (taxableIncome <= 0) return 0;
  const brackets = getBrackets(fs);
  let tax = 0;
  let prev = 0;
  for (const [rate, ceiling] of brackets) {
    if (taxableIncome <= prev) break;
    const slice = Math.min(taxableIncome, ceiling) - prev;
    tax += slice * rate;
    prev = ceiling;
  }
  return Math.max(0, tax);
}

function topBracketLabel(taxableIncome: number, fs: FilingStatus): string {
  if (taxableIncome <= 0) return "0%";
  const brackets = getBrackets(fs);
  let prev = 0;
  for (const [rate, ceiling] of brackets) {
    if (taxableIncome <= ceiling) return `${(rate * 100).toFixed(0)}%`;
    prev = ceiling;
  }
  return "37%";
}

// ─── Core engine ─────────────────────────────────────────────────────────────

export function calcRothLadder(inputs: RothLadderInputs): RothLadderResult {
  const {
    currentAge,
    bridgeEndAge,
    iraBalance,
    annualSpend,
    otherIncome,
    filingStatus,
    growthRate,
    taxableBalance,
  } = inputs;

  const stdDed = STANDARD_DEDUCTION[filingStatus];
  const yearsToModel = Math.max(bridgeEndAge - currentAge + 2, 12); // at least 12 yrs

  const rows: RothLadderRow[] = [];
  let remainingIRA = iraBalance;
  let remainingTaxable = taxableBalance;
  let cumulativeRothBasis = 0;
  let totalTaxPaid = 0;
  let totalConversions = 0;
  let gapShortfall = 0;

  // Track each year's conversion amount so we can unlock it 5 years later
  const conversionHistory: number[] = [];

  for (let y = 1; y <= yearsToModel; y++) {
    const age = currentAge + y - 1;
    const isBeyondBridge = age >= bridgeEndAge;

    // ── How much Roth basis unlocks this year? ────────────────────────────
    // Year y unlocks the conversion made in year (y-5), i.e. conversionHistory[y-6]
    const unlockingYear = y - 5; // the year whose conversion unlocks
    const unlockAmount = unlockingYear >= 1 ? (conversionHistory[unlockingYear - 1] ?? 0) : 0;
    cumulativeRothBasis += unlockAmount;

    // ── Determine conversion amount ───────────────────────────────────────
    // Strategy: convert enough each year so the rung unlocking in 5 years
    // covers annualSpend. Also fill brackets up to 22% MFJ / 22% single.
    // Simple approach: convert (annualSpend + estimated tax) each year,
    // targeting to fill the 12% bracket at minimum.
    
    let conversionTarget = annualSpend + annualSpend * 0.15; // rough tax cushion

    // Don't convert more than IRA has
    conversionTarget = Math.min(conversionTarget, remainingIRA);

    // After bridge end, no need to keep converting unless IRA still has funds
    if (isBeyondBridge && cumulativeRothBasis >= annualSpend * (y - (bridgeEndAge - currentAge))) {
      conversionTarget = 0;
    }

    const conversionAmount = Math.max(0, conversionTarget);
    conversionHistory.push(conversionAmount);

    if (conversionAmount > 0) {
      remainingIRA = remainingIRA * (1 + growthRate) - conversionAmount;
      remainingIRA = Math.max(0, remainingIRA);
    } else {
      remainingIRA = remainingIRA * (1 + growthRate);
    }

    // ── Tax on this year's conversion ─────────────────────────────────────
    const agi = otherIncome + conversionAmount;
    const taxableIncome = Math.max(0, agi - stdDed);
    const federalTax = calcFederalTax(taxableIncome, filingStatus);
    const effectiveRate = agi > 0 ? federalTax / agi : 0;

    totalTaxPaid += federalTax;
    totalConversions += conversionAmount;

    // ── Gap funding (years 1-5) ────────────────────────────────────────────
    // The ladder produces nothing until year 6. Taxable pays for spending.
    const isGapYear = y <= 5;
    let shortfall = 0;
    let gapFunded = false;

    if (isGapYear) {
      const needed = annualSpend + federalTax; // spend + taxes come from taxable
      if (remainingTaxable >= needed) {
        remainingTaxable -= needed;
        gapFunded = true;
      } else {
        shortfall = needed - remainingTaxable;
        gapShortfall += shortfall;
        remainingTaxable = 0;
        gapFunded = false;
      }
    } else {
      // Ladder covers spend; taxes still come from taxable or Roth gains
      remainingTaxable = Math.max(0, remainingTaxable * (1 + growthRate) - federalTax);
    }

    rows.push({
      year: y,
      age,
      conversionAmount,
      taxableIncome,
      federalTax,
      effectiveRate,
      runsUnlocking: unlockingYear >= 1 ? unlockingYear : null,
      rothBasisAvailable: cumulativeRothBasis,
      taxableBalanceRemaining: remainingTaxable,
      gapFunded,
      shortfall,
    });
  }

  // ── Summary metrics ───────────────────────────────────────────────────────
  const firstYearConv = rows[0]?.conversionAmount ?? 0;
  const firstYearAGI = otherIncome + firstYearConv;
  const firstYearTaxable = Math.max(0, firstYearAGI - stdDed);
  const estimatedAnnualTax = calcFederalTax(firstYearTaxable, filingStatus);
  const bracket = topBracketLabel(firstYearTaxable, filingStatus);

  const ladderFullyFunded = gapShortfall === 0;

  return {
    rows,
    totalTaxPaid,
    totalConversions,
    gapYears: 5,
    gapShortfall,
    iraBalanceFinal: remainingIRA,
    ladderFullyFunded,
    estimatedAnnualTax,
    bracket,
  };
}

// ─── Helpers for UI ──────────────────────────────────────────────────────────

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}