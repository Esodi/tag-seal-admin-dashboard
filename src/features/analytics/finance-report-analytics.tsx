"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "@/components/ui/chart-tooltip";
import { formatNumber, humanize } from "@/features/analytics/analytics-format";
import { AnalyticsCard, AnalyticsEmpty, ChartDownloadButton } from "@/features/analytics/components/analytics-ui";
import type { AnalyticsReport, AnalyticsReportKey } from "@/features/analytics/types";

const palette = ["#234e38", "#3f7c54", "#b38936", "#52738a", "#b4534b"];

/**
 * Interactive visual summary cards and charts for Finance, Bills, Vet Bills,
 * and Vet Practice Expenses inside the Reports view.
 */
export function FinanceReportAnalytics({
  reportKey,
  report,
}: {
  reportKey: AnalyticsReportKey;
  report: AnalyticsReport;
}) {
  if (!report.rows.length) return null;

  const isFinance = reportKey === "finance";
  const isExpenses = reportKey === "vetPracticeExpenses";
  const amountKey = isExpenses ? "totalCost" : "amount";
  const rows = report.rows;

  const totalAmount = rows.reduce((sum, row) => sum + Number(row[amountKey] ?? 0), 0);
  const settledRows = rows.filter((row) => {
    const status = String(row.status ?? "").toLowerCase();
    return status === "paid" || status === "received";
  });
  const settledAmount = settledRows.reduce((sum, row) => sum + Number(row[amountKey] ?? 0), 0);
  const pendingAmount = Math.max(0, totalAmount - settledAmount);

  const primaryGroupKey = isFinance ? "transactionType" : isExpenses ? "paymentMethod" : "status";
  const secondaryGroupKey = isFinance ? "source" : "paymentMethod";

  const primarySeries = aggregateSum(rows, primaryGroupKey, amountKey);
  const secondarySeries = aggregateSum(rows, secondaryGroupKey, amountKey);

  const primaryTitle = isFinance
    ? "Income vs expenditure"
    : isExpenses
      ? "Expenses by payment method"
      : "Bills by settlement status";
  const secondaryTitle = isFinance ? "Transactions by source" : "Amounts by payment method";

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard title="Records" description="Filtered period entries.">
          <p className="text-2xl font-semibold tabular-nums">{formatNumber(rows.length)}</p>
        </AnalyticsCard>
        <AnalyticsCard title="Total value" description="Combined amount in period.">
          <p className="text-2xl font-semibold tabular-nums">TZS {formatNumber(totalAmount)}</p>
        </AnalyticsCard>
        <AnalyticsCard title={isFinance ? "Settled / received" : "Paid"} description="Completed payments.">
          <p className="text-2xl font-semibold tabular-nums text-primary">TZS {formatNumber(settledAmount)}</p>
        </AnalyticsCard>
        <AnalyticsCard title="Pending / unpaid" description="Awaiting settlement.">
          <p className="text-2xl font-semibold tabular-nums">TZS {formatNumber(pendingAmount)}</p>
        </AnalyticsCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ReportBarChart
          chartId={`report-${reportKey}-primary`}
          title={primaryTitle}
          description="Grouped totals for the active date range and scope."
          data={primarySeries}
        />
        <ReportBarChart
          chartId={`report-${reportKey}-secondary`}
          title={secondaryTitle}
          description="Distribution across recorded categories."
          data={secondarySeries}
        />
      </div>
    </div>
  );
}

function ReportBarChart({
  chartId,
  title,
  description,
  data,
}: {
  chartId: string;
  title: string;
  description: string;
  data: Array<{ name: string; value: number }>;
}) {
  return (
    <AnalyticsCard
      title={title}
      description={description}
      action={data.length ? <ChartDownloadButton targetId={chartId} fileName={`tag-seal-${chartId}`} /> : undefined}
    >
      {data.length ? (
        <div id={chartId} className="h-72">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1, height: 1 }}>
            <BarChart data={data.slice(0, 8)} layout="vertical" margin={{ top: 4, right: 16, left: 24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={110} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
              <Tooltip content={<ChartTooltip unit="TZS" />} cursor={{ fill: "currentColor", opacity: 0.08, rx: 6 }} />
              <Bar dataKey="value" name="Amount (TZS)" radius={[0, 6, 6, 0]}>
                {data.slice(0, 8).map((item, idx) => (
                  <Cell key={item.name} fill={palette[idx % palette.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <AnalyticsEmpty title="No breakdown data" />
      )}
    </AnalyticsCard>
  );
}

function aggregateSum(
  rows: Array<Record<string, string | number | null>>,
  groupKey: string,
  amountKey: string,
): Array<{ name: string; value: number }> {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const raw = row[groupKey];
    const label = raw === null || raw === undefined || raw === "" ? "Unspecified" : humanize(String(raw));
    totals.set(label, (totals.get(label) ?? 0) + Number(row[amountKey] ?? 0));
  }
  return [...totals]
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value);
}
