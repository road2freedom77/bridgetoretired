"use client";

import { useState, useMemo, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { trackCalculatorUsed, trackProCtaClick } from "@/lib/analytics";
import {
  calcRothLadder,
  formatCurrency,
  formatPct,
  type RothLadderInputs,
  type FilingStatus,
} from "@/lib/calc/rothLadder";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  currentAge: string;
  bridgeEndAge: string;
  iraBalance: string;
  annualSpend: string;
  otherIncome: string;
  filingStatus: FilingStatus;
  growthRate: string;
  taxableBalance: string;
}

const DEFAULT_FORM: FormState = {
  currentAge: "45",
  bridgeEndAge: "55",
  iraBalance: "800000",
  annualSpend: "60000",
  otherIncome: "0",
  filingStatus: "mfj",
  growthRate: "6",
  taxableBalance: "150000",
};

// ─── Pro gate component ───────────────────────────────────────────────────────

function ProGateOverlay() {
  return (
    <div className="pro-gate-overlay">
      <div className="pro-gate-inner">
        <div className="pro-gate-icon">🔒</div>
        <h3>Full Ladder Table — Pro Only</h3>
        <p>
          Unlock the complete year-by-year conversion schedule, ACA/MAGI
          impact warnings, shortfall alerts, and CSV export.
        </p>
        <a
          href="/pricing"
          className="btn-gold"
          onClick={() => trackProCtaClick("roth-ladder-calc-gate")}
        >
          Upgrade to Pro — $15/mo
        </a>
      </div>
    </div>
  );
}

// ─── Input field helper ───────────────────────────────────────────────────────

function InputRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="input-row">
      <label className="input-label">
        {label}
        {hint && <span className="input-hint">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RothLadderCalculator() {
  const { user } = useUser();
  const isPro = (user?.publicMetadata?.isPro as boolean) ?? false;

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [calculated, setCalculated] = useState(false);

  const track = useCallback(() => trackCalculatorUsed("roth-ladder-calculator"), []);

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const inputs: RothLadderInputs | null = useMemo(() => {
    const currentAge = parseInt(form.currentAge);
    const bridgeEndAge = parseInt(form.bridgeEndAge);
    const iraBalance = parseFloat(form.iraBalance.replace(/,/g, ""));
    const annualSpend = parseFloat(form.annualSpend.replace(/,/g, ""));
    const otherIncome = parseFloat(form.otherIncome.replace(/,/g, "") || "0");
    const growthRate = parseFloat(form.growthRate) / 100;
    const taxableBalance = parseFloat(form.taxableBalance.replace(/,/g, ""));

    if (
      isNaN(currentAge) || isNaN(bridgeEndAge) || isNaN(iraBalance) ||
      isNaN(annualSpend) || isNaN(growthRate) || isNaN(taxableBalance) ||
      currentAge < 30 || currentAge >= bridgeEndAge || bridgeEndAge > 65
    ) {
      return null;
    }

    return {
      currentAge,
      bridgeEndAge,
      iraBalance,
      annualSpend,
      otherIncome: isNaN(otherIncome) ? 0 : otherIncome,
      filingStatus: form.filingStatus,
      growthRate,
      taxableBalance,
    };
  }, [form]);

  const result = useMemo(() => {
    if (!inputs || !calculated) return null;
    return calcRothLadder(inputs);
  }, [inputs, calculated]);

  function handleCalculate() {
    if (inputs) {
      track();
      setCalculated(true);
    }
  }

  function handleExportCSV() {
    if (!result || !isPro) return;
    const headers = [
      "Year","Age","Conversion","Taxable Income","Federal Tax","Eff. Rate",
      "Rung Unlocking","Roth Basis Available","Taxable Balance","Gap Shortfall"
    ];
    const rows = result.rows.map((r) => [
      r.year, r.age,
      r.conversionAmount.toFixed(0),
      r.taxableIncome.toFixed(0),
      r.federalTax.toFixed(0),
      (r.effectiveRate * 100).toFixed(1) + "%",
      r.runsUnlocking ?? "—",
      r.rothBasisAvailable.toFixed(0),
      r.taxableBalanceRemaining.toFixed(0),
      r.shortfall.toFixed(0),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "roth-ladder.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="roth-calc">
      {/* ── Inputs ── */}
      <section className="calc-inputs">
        <h2 className="section-heading">Your Situation</h2>

        <div className="input-grid">
          <InputRow label="Current Age">
            <input
              type="number"
              className="calc-input"
              value={form.currentAge}
              min={30}
              max={58}
              onChange={(e) => set("currentAge", e.target.value)}
            />
          </InputRow>

          <InputRow
            label="Bridge-End Age"
            hint="When 59½, pension, or SS income begins"
          >
            <input
              type="number"
              className="calc-input"
              value={form.bridgeEndAge}
              min={35}
              max={65}
              onChange={(e) => set("bridgeEndAge", e.target.value)}
            />
          </InputRow>

          <InputRow label="Traditional IRA / 401k Balance">
            <input
              type="text"
              className="calc-input"
              value={form.iraBalance}
              onChange={(e) => set("iraBalance", e.target.value)}
              placeholder="800000"
            />
          </InputRow>

          <InputRow label="Annual Spend from Ladder">
            <input
              type="text"
              className="calc-input"
              value={form.annualSpend}
              onChange={(e) => set("annualSpend", e.target.value)}
              placeholder="60000"
            />
          </InputRow>

          <InputRow
            label="Other Taxable Income / Year"
            hint="Rental, part-time, dividends"
          >
            <input
              type="text"
              className="calc-input"
              value={form.otherIncome}
              onChange={(e) => set("otherIncome", e.target.value)}
              placeholder="0"
            />
          </InputRow>

          <InputRow
            label="Starting Taxable / Cash Balance"
            hint="Funds the critical 5-year gap"
          >
            <input
              type="text"
              className="calc-input"
              value={form.taxableBalance}
              onChange={(e) => set("taxableBalance", e.target.value)}
              placeholder="150000"
            />
          </InputRow>

          <InputRow label="Expected Annual Growth Rate (%)">
            <input
              type="number"
              className="calc-input"
              value={form.growthRate}
              min={1}
              max={12}
              step={0.5}
              onChange={(e) => set("growthRate", e.target.value)}
            />
          </InputRow>

          <InputRow label="Filing Status">
            <select
              className="calc-input"
              value={form.filingStatus}
              onChange={(e) => set("filingStatus", e.target.value as FilingStatus)}
            >
              <option value="mfj">Married Filing Jointly</option>
              <option value="single">Single</option>
            </select>
          </InputRow>
        </div>

        <button
          className="btn-calculate"
          onClick={handleCalculate}
          disabled={!inputs}
        >
          Build My Ladder
        </button>
        {!inputs && (
          <p className="input-error">
            Check your ages — current age must be less than bridge-end age (max 65).
          </p>
        )}
      </section>

      {/* ── Results ── */}
      {result && (
        <>
          {/* Summary cards */}
          <section className="summary-cards">
            <div className={`summary-card ${result.ladderFullyFunded ? "card-ok" : "card-warn"}`}>
              <div className="card-label">5-Year Gap Status</div>
              <div className="card-value">
                {result.ladderFullyFunded
                  ? "✅ Fully Funded"
                  : `⚠️ Shortfall: ${formatCurrency(result.gapShortfall)}`}
              </div>
              <div className="card-sub">
                {result.ladderFullyFunded
                  ? `Your ${formatCurrency(inputs!.taxableBalance)} covers years 1–5`
                  : `Add ${formatCurrency(result.gapShortfall)} more to taxable/cash`}
              </div>
            </div>

            <div className="summary-card">
              <div className="card-label">Est. Annual Tax (Yr 1)</div>
              <div className="card-value">{formatCurrency(result.estimatedAnnualTax)}</div>
              <div className="card-sub">Top bracket: {result.bracket}</div>
            </div>

            <div className="summary-card">
              <div className="card-label">Total Conversions</div>
              <div className="card-value">{formatCurrency(result.totalConversions)}</div>
              <div className="card-sub">Total tax paid: {formatCurrency(result.totalTaxPaid)}</div>
            </div>

            <div className="summary-card">
              <div className="card-label">IRA Balance (Final Year)</div>
              <div className="card-value">{formatCurrency(result.iraBalanceFinal)}</div>
              <div className="card-sub">After all modeled conversions</div>
            </div>
          </section>

          {/* Gap explainer callout */}
          <div className="gap-callout">
            <div className="gap-callout-icon">⏳</div>
            <div>
              <strong>The 5-Year Seasoning Gap</strong>
              <p>
                Each Roth conversion has its own 5-year clock. A conversion made
                today can&apos;t be withdrawn penalty-free until 5 years from now.
                Your taxable/cash account must cover all spending during{" "}
                <strong>years 1–5</strong> of the ladder. After that, each prior
                year&apos;s conversion unlocks on schedule.
              </p>
            </div>
          </div>

          {/* Year-by-year table — Pro gate */}
          <section className="table-section">
            <div className="table-header-row">
              <h2 className="section-heading">Year-by-Year Schedule</h2>
              {isPro && (
                <button className="btn-export" onClick={handleExportCSV}>
                  Export CSV
                </button>
              )}
            </div>

            <div className="table-wrapper" style={{ position: "relative" }}>
              {!isPro && <ProGateOverlay />}

              <div className={!isPro ? "table-blurred" : ""}>
                <table className="ladder-table">
                  <thead>
                    <tr>
                      <th>Yr</th>
                      <th>Age</th>
                      <th>Conversion</th>
                      <th>AGI</th>
                      <th>Fed Tax</th>
                      <th>Eff %</th>
                      <th>Rung Unlocks</th>
                      <th>Roth Basis</th>
                      <th>Taxable Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr
                        key={row.year}
                        className={
                          row.shortfall > 0
                            ? "row-shortfall"
                            : row.year <= 5
                            ? "row-gap"
                            : row.runsUnlocking !== null
                            ? "row-unlock"
                            : ""
                        }
                      >
                        <td>{row.year}</td>
                        <td>{row.age}</td>
                        <td>{formatCurrency(row.conversionAmount)}</td>
                        <td>{formatCurrency(row.taxableIncome)}</td>
                        <td>{formatCurrency(row.federalTax)}</td>
                        <td>{formatPct(row.effectiveRate)}</td>
                        <td>
                          {row.runsUnlocking !== null ? (
                            <span className="unlock-badge">
                              Yr {row.runsUnlocking} ({formatCurrency(
                                result.rows[row.runsUnlocking - 1]?.conversionAmount ?? 0
                              )})
                            </span>
                          ) : (
                            <span className="no-unlock">—</span>
                          )}
                        </td>
                        <td>{formatCurrency(row.rothBasisAvailable)}</td>
                        <td
                          className={
                            row.shortfall > 0 ? "cell-red" : "cell-normal"
                          }
                        >
                          {row.shortfall > 0
                            ? `⚠️ -${formatCurrency(row.shortfall)}`
                            : formatCurrency(row.taxableBalanceRemaining)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {!isPro && (
              <div className="free-summary">
                <h3>Free Tier Summary</h3>
                <p>
                  Based on your inputs, you&apos;d convert approximately{" "}
                  <strong>{formatCurrency(result.rows[0]?.conversionAmount ?? 0)}</strong>{" "}
                  per year, landing in the <strong>{result.bracket}</strong> bracket
                  with estimated annual tax of{" "}
                  <strong>{formatCurrency(result.estimatedAnnualTax)}</strong>.
                </p>
                <p>
                  {result.ladderFullyFunded
                    ? `Your ${formatCurrency(inputs!.taxableBalance)} in taxable assets appears sufficient to fund the 5-year gap.`
                    : `⚠️ You may be short by ${formatCurrency(result.gapShortfall)} to fund the 5-year gap — upgrade to Pro to see the full breakdown.`}
                </p>
                <p>
                  First rung unlocks in <strong>Year 6</strong> (age{" "}
                  {inputs!.currentAge + 5}).
                </p>
                <a
                  href="/pricing"
                  className="btn-gold-sm"
                  onClick={() => trackProCtaClick("roth-ladder-calc-upsell")}
                >
                  Upgrade to Pro for the full schedule →
                </a>
              </div>
            )}
          </section>

          {/* ACA / MAGI warning — Pro only */}
          {isPro && (inputs!.otherIncome + (result.rows[0]?.conversionAmount ?? 0)) > 100000 && (
            <div className="aca-warning">
              <strong>⚠️ ACA / MAGI Impact</strong>
              <p>
                Your estimated MAGI of{" "}
                <strong>
                  {formatCurrency(
                    inputs!.otherIncome + (result.rows[0]?.conversionAmount ?? 0)
                  )}
                </strong>{" "}
                may affect ACA marketplace premium tax credits. The 400% FPL cliff
                (≈ {form.filingStatus === "mfj" ? "$80k" : "$48k"} for a couple /
                individual) could eliminate subsidies entirely. Consider smaller
                conversions to stay under the threshold if you rely on ACA coverage.
              </p>
            </div>
          )}
        </>
      )}

      <style>{`
        .roth-calc {
          max-width: 900px;
          margin: 0 auto;
          font-family: var(--font-body, 'IBM Plex Mono', monospace);
          color: var(--ink, #1a1a2e);
        }

        .section-heading {
          font-family: var(--font-heading, 'Syne', sans-serif);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--navy, #1a1a2e);
          margin: 0 0 1.25rem;
        }

        /* Inputs */
        .calc-inputs {
          background: var(--surface, #fafafa);
          border: 1px solid var(--border, #e5e5e5);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .input-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem 1.5rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 640px) {
          .input-grid { grid-template-columns: 1fr; }
        }

        .input-row { display: flex; flex-direction: column; gap: 0.25rem; }

        .input-label {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--ink-muted, #555);
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .input-hint {
          font-size: 0.72rem;
          font-weight: 400;
          text-transform: none;
          color: var(--ink-light, #888);
        }

        .calc-input {
          padding: 0.55rem 0.75rem;
          border: 1px solid var(--border, #d0d0d0);
          border-radius: 5px;
          font-size: 0.92rem;
          font-family: inherit;
          background: #fff;
          color: var(--ink, #1a1a2e);
          transition: border-color 0.15s;
        }

        .calc-input:focus {
          outline: none;
          border-color: var(--gold, #e8b84b);
        }

        .input-error {
          font-size: 0.82rem;
          color: #c0392b;
          margin-top: 0.5rem;
        }

        .btn-calculate {
          background: var(--gold, #e8b84b);
          color: var(--navy, #1a1a2e);
          border: none;
          border-radius: 6px;
          padding: 0.75rem 1.75rem;
          font-size: 0.95rem;
          font-weight: 700;
          font-family: var(--font-heading, 'Syne', sans-serif);
          cursor: pointer;
          transition: opacity 0.15s;
        }

        .btn-calculate:hover { opacity: 0.88; }
        .btn-calculate:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Summary cards */
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 640px) {
          .summary-cards { grid-template-columns: 1fr; }
        }

        .summary-card {
          background: #fff;
          border: 1px solid var(--border, #e5e5e5);
          border-radius: 8px;
          padding: 1rem 1.25rem;
        }

        .card-ok { border-left: 4px solid #27ae60; }
        .card-warn { border-left: 4px solid #e67e22; }

        .card-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--ink-muted, #777);
          margin-bottom: 0.25rem;
        }

        .card-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--navy, #1a1a2e);
          margin-bottom: 0.2rem;
        }

        .card-sub { font-size: 0.78rem; color: var(--ink-light, #888); }

        /* Gap callout */
        .gap-callout {
          display: flex;
          gap: 1rem;
          background: #fffbf0;
          border: 1px solid #f0d080;
          border-left: 4px solid var(--gold, #e8b84b);
          border-radius: 6px;
          padding: 1rem 1.25rem;
          margin-bottom: 2rem;
          font-size: 0.88rem;
          line-height: 1.6;
          color: var(--ink, #1a1a2e);
        }

        .gap-callout-icon { font-size: 1.4rem; flex-shrink: 0; }
        .gap-callout p { margin: 0.4rem 0 0; }

        /* Table */
        .table-section { margin-bottom: 2rem; }

        .table-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .btn-export {
          background: transparent;
          border: 1px solid var(--gold, #e8b84b);
          color: var(--navy, #1a1a2e);
          padding: 0.4rem 1rem;
          border-radius: 5px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-export:hover { background: var(--gold, #e8b84b); }

        .table-wrapper { overflow-x: auto; border-radius: 8px; }
        .table-blurred { filter: blur(4px); user-select: none; pointer-events: none; }

        .ladder-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.83rem;
        }

        .ladder-table th {
          background: var(--navy, #1a1a2e);
          color: #fff;
          padding: 0.6rem 0.75rem;
          text-align: left;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        .ladder-table td {
          padding: 0.55rem 0.75rem;
          border-bottom: 1px solid #f0f0f0;
          white-space: nowrap;
        }

        .ladder-table tr:last-child td { border-bottom: none; }

        .row-gap { background: #fffbf0; }
        .row-shortfall { background: #fff0f0; }
        .row-unlock { background: #f0faf4; }

        .unlock-badge {
          background: #e8f5ee;
          color: #1e7e4a;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .no-unlock { color: #bbb; }
        .cell-red { color: #c0392b; font-weight: 600; }
        .cell-normal { color: var(--ink, #1a1a2e); }

        /* Pro gate overlay */
        .pro-gate-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(2px);
          border-radius: 8px;
        }

        .pro-gate-inner {
          background: #fff;
          border: 1px solid var(--gold, #e8b84b);
          border-radius: 10px;
          padding: 2rem 2.5rem;
          text-align: center;
          max-width: 360px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.12);
        }

        .pro-gate-icon { font-size: 2rem; margin-bottom: 0.75rem; }

        .pro-gate-inner h3 {
          font-family: var(--font-heading, 'Syne', sans-serif);
          font-size: 1.1rem;
          margin: 0 0 0.5rem;
          color: var(--navy, #1a1a2e);
        }

        .pro-gate-inner p {
          font-size: 0.85rem;
          color: var(--ink-muted, #666);
          margin: 0 0 1.25rem;
          line-height: 1.5;
        }

        .btn-gold {
          display: inline-block;
          background: var(--gold, #e8b84b);
          color: var(--navy, #1a1a2e);
          padding: 0.65rem 1.5rem;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.9rem;
          text-decoration: none;
          font-family: var(--font-heading, 'Syne', sans-serif);
        }

        .btn-gold:hover { opacity: 0.88; }

        .btn-gold-sm {
          display: inline-block;
          background: var(--gold, #e8b84b);
          color: var(--navy, #1a1a2e);
          padding: 0.5rem 1.1rem;
          border-radius: 5px;
          font-weight: 700;
          font-size: 0.83rem;
          text-decoration: none;
        }

        /* Free tier summary */
        .free-summary {
          background: var(--surface, #fafafa);
          border: 1px solid var(--border, #e5e5e5);
          border-radius: 8px;
          padding: 1.25rem 1.5rem;
          margin-top: 1.5rem;
          font-size: 0.88rem;
          line-height: 1.65;
        }

        .free-summary h3 {
          font-family: var(--font-heading, 'Syne', sans-serif);
          font-size: 1rem;
          margin: 0 0 0.75rem;
          color: var(--navy, #1a1a2e);
        }

        .free-summary p { margin: 0 0 0.6rem; }

        /* ACA warning */
        .aca-warning {
          background: #fff8e1;
          border: 1px solid #f0c040;
          border-left: 4px solid #e67e22;
          border-radius: 6px;
          padding: 1rem 1.25rem;
          font-size: 0.88rem;
          line-height: 1.6;
          margin-top: 1rem;
        }

        .aca-warning p { margin: 0.4rem 0 0; }
      `}</style>
    </div>
  );
}