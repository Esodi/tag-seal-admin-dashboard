"use client";

import { FinancePreview } from "./finance-preview";
import { printReport, reportDate } from "@/lib/report-print";

import { DashboardStatCard } from "@/components/ui/dashboard";
import { useCallback, useEffect, useRef, useState } from "react";
import { Calendar, FileText, Printer, RefreshCw, RotateCcw, Search } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/ui/empty-card";
import { Field, FieldLabel } from "@/components/ui/field";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatNumber } from "@/components/ui/stat-number";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePanel, TableToolbar } from "@/components/ui/table-layout";
import { RecordPagination } from "@/components/ui/record-pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomViewDetailsDialog, DetailItem, DetailSection } from "@/components/ui/custom-view-details-dialog";
import type {
  FinanceReportRow,
  IncomeExpenditureReportResponse,
} from "@/features/finance/types";
import { authenticatedFetch } from "@/lib/auth/session";

function formatTzs(value?: number | null) {
  const num = Number(value ?? 0);
  return `TZS ${num.toLocaleString("en-TZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function IncomeExpenditureDashboard({
  initialData,
  initialError,
}: {
  initialData: IncomeExpenditureReportResponse | null;
  initialError?: string;
}) {
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Dar_es_Salaam" });
  const startOfMonthStr = `${todayStr.slice(0, 8)}01`;

  const [data, setData] = useState<IncomeExpenditureReportResponse | null>(
    initialData,
  );
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const [fromDate, setFromDate] = useState(
    initialData?.filters.fromDate ?? startOfMonthStr,
  );
  const [toDate, setToDate] = useState(
    initialData?.filters.toDate ?? todayStr,
  );
  const [farmUuid, setFarmUuid] = useState(
    initialData?.filters.farmUuid ?? "",
  );
  const [farmerId, setFarmerId] = useState(
    initialData?.filters.farmerId ? String(initialData.filters.farmerId) : "",
  );
  const [search, setSearch] = useState(initialData?.filters.search ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [activeTab, setActiveTab] = useState<"income" | "expense" | "bills">(
    "income",
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("desc");
  const [viewing, setViewing] = useState<FinanceReportRow | null>(null);
  const didMount = useRef(false);
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  useEffect(() => setPage(1), [activeTab, pageSize, sort, data]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 280);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadReport = useCallback(
    async (
      nextFrom = fromDate,
      nextTo = toDate,
      nextFarm = farmUuid,
      nextFarmer = farmerId,
      nextSearch = debouncedSearch,
    ) => {
      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;
      if (!nextFrom || !nextTo || nextFrom > nextTo) { setError("Choose a valid date range: the end must be on or after the start."); setLoading(false); return; }
      setLoading(true);
      setError(undefined);
      const params = new URLSearchParams({
        fromDate: nextFrom,
        toDate: nextTo,
        search: nextSearch,
      });
      if (nextFarm) params.set("farmUuid", nextFarm);
      if (nextFarmer) params.set("farmerId", nextFarmer);

      try {
        const response = await authenticatedFetch(
          `/api/admin/finance/income-expenditure?${params.toString()}`,
          { cache: "no-store", signal: controller.signal },
        );
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.status === false) {
          throw new Error(
            payload?.message ?? "Unable to load Income & Expenditure report.",
          );
        }
        if (!controller.signal.aborted) setData(payload.data);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Income & Expenditure report.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [debouncedSearch, farmUuid, farmerId, fromDate, toDate],
  );

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    void loadReport(fromDate, toDate, farmUuid, farmerId, debouncedSearch);
  }, [debouncedSearch, farmUuid, farmerId, fromDate, loadReport, toDate]);

  const applyPreset = (preset: "month" | "week" | "today" | "reset") => {
    const now = new Date(`${todayStr}T12:00:00Z`);
    const today = now.toLocaleDateString("en-CA", { timeZone: "Africa/Dar_es_Salaam" });
    if (preset === "today") {
      setFromDate(today);
      setToDate(today);
    } else if (preset === "week") {
      const day = now.getUTCDay();
      const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setUTCDate(diff)).toISOString().slice(0, 10);
      setFromDate(monday);
      setToDate(today);
    } else if (preset === "month") {
      setFromDate(`${today.slice(0, 8)}01`);
      setToDate(today);
    } else {
      setFromDate(`${today.slice(0, 8)}01`);
      setToDate(today);
      setFarmUuid("");
      setFarmerId("");
      setSearch("");
    }
  };

  const farmOptions = [
    { value: "", label: "All farms" },
    ...(data?.options.farms ?? []).map((f) => ({
      value: f.value,
      label: f.description ? `${f.label} · ${f.description}` : f.label,
    })),
  ];

  const farmerOptions = [
    { value: "", label: "All farmers" },
    ...(data?.options.farmers ?? []).map((f) => ({
      value: f.value,
      label: f.description ? `${f.label} · ${f.description}` : f.label,
    })),
  ];

  const summary = data?.summary;
  const incomeRows = data?.incomeRows ?? [];
  const expenseRows = data?.expenseRows ?? [];
  const billRows = data?.billRows ?? [];

  const reportRows = activeTab === "income" ? incomeRows : activeTab === "expense" ? expenseRows : billRows;
  const orderedRows = [...reportRows].sort((a, b) => sort === "desc" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
  const pageCount = Math.max(1, Math.ceil(orderedRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const offset = (currentPage - 1) * pageSize;
  const visibleRows = orderedRows.slice(offset, offset + pageSize);

  const renderReportTable = (rows: FinanceReportRow[], isBills = false) => {
    if (loading) {
      return (
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      );
    }

    if (rows.length === 0) {
      return (
        <EmptyCard
          icon={FileText}
          title="No transactions in selected period"
          description="Try expanding the date range or clearing the farm, farmer or search filters."
        />
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">#</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>{isBills ? "Bill No" : "Source Type"}</TableHead>
              <TableHead>
                {isBills ? "Extension Officer" : "Reference"}
              </TableHead>
              <TableHead>Farm</TableHead>
              <TableHead>Farmer</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={`${reportDate(row.date, true)}-${idx}`}>
                <TableCell className="tabular-nums text-muted-foreground">{offset + idx + 1}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {reportDate(row.date, true)}
                </TableCell>
                <TableCell>
                  {isBills ? (
                    <span className="font-mono text-xs font-semibold">
                      {row.billNo}
                    </span>
                  ) : (
                    <Badge variant="outline" className="uppercase">
                      {row.type}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs">
                  {isBills ? row.officer : row.reference}
                </TableCell>
                <TableCell className="font-medium">{row.farm}</TableCell>
                <TableCell>{row.farmer}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="uppercase">
                    {row.subject}
                  </Badge>
                </TableCell>
                <TableCell className="tabular-nums">{row.quantity}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatTzs(row.amount)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => setViewing(row)}>View details</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const reportFilters = (<div className="border-b p-5">      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Field>
              <FieldLabel htmlFor="report-from">From date</FieldLabel>
              <Input
                type="date"
                id="report-from"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="report-to">To date</FieldLabel>
              <Input
                type="date"
                id="report-to"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Farm</FieldLabel>
              <FormSelect
                value={farmUuid}
                onValueChange={setFarmUuid}
                options={farmOptions}
                placeholder="All farms"
                searchable
              />
            </Field>
            <Field>
              <FieldLabel>Farmer</FieldLabel>
              <FormSelect
                value={farmerId}
                onValueChange={setFarmerId}
                options={farmerOptions}
                placeholder="All farmers"
                searchable
              />
            </Field>
            <Field className="order-first">
              <FieldLabel htmlFor="report-search">Search</FieldLabel>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="report-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Bill no, reference, notes…"
                  className="pl-9"
                />
              </div>
            </Field>
          </div>
</div>);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardHeader
        parent="Finance & Billing" parentHref="/dashboard/finance"
        title="Income & Expenditure Report"
        description="Consolidated farm revenue, disposal sales, transfers, service bills and operational expenditure."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset("month")}
            >
              <Calendar className="size-4" />
              This Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset("week")}
            >
              This Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset("today")}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset("reset")}
            >
              <RotateCcw className="size-4" />
              Reset
            </Button>
            <Button
              size="sm" disabled={loading || Boolean(error) || !data}
              onClick={() => {
                printReport("Income & Expenditure Report", `Period: ${reportDate(data?.filters.fromDate)} – ${reportDate(data?.filters.toDate)}\nIncome: ${formatTzs(summary?.totalIncome)} • Expenditure: ${formatTzs(summary?.totalExpenditure)} • Balance: ${formatTzs(summary?.net)}\nLimited preview: up to 250 records per source contribute to totals; up to 100 rows per section are included.\nFarm: ${farmOptions.find(option => option.value === data?.filters.farmUuid)?.label || "All farms"} • Farmer: ${farmerOptions.find(option => option.value === String(data?.filters.farmerId ?? ""))?.label || "All farmers"}`, [
                  { title: "Income", rows: incomeRows }, { title: "Expenditure", rows: expenseRows }, { title: "Bills", rows: billRows },
                ].map(section => ({ title: section.title, columns: ["Date (EAT)", "Reference", "Farm", "Farmer", "Subject", "Quantity", "Amount", "Status", "Notes"], rows: section.rows.map(row => [reportDate(row.date, true), row.billNo || row.reference, row.farm, row.farmer, row.subject, row.quantity, formatTzs(row.amount), row.status, row.notes]) })));
              }}
            >
              <Printer className="size-4" />
              Print report
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard label="Total Income" value={<StatNumber value={summary?.totalIncome ?? 0} prefix="TZS " />} note={`${summary?.totalIncomeRows ?? 0} revenue transactions`} />
        <DashboardStatCard label="Total Expenditure" value={<StatNumber value={summary?.totalExpenditure ?? 0} prefix="TZS " />} note={`${summary?.totalExpenseRows ?? 0} expense transactions`} />
        <DashboardStatCard label="Net Balance" value={<span className={(summary?.net ?? 0) < 0 ? "text-danger" : undefined}>{formatTzs(summary?.net ?? 0)}</span>} note={(summary?.net ?? 0) >= 0 ? "Net surplus for period" : "Net deficit for period"} />
        <DashboardStatCard label="Transactions" value={<StatNumber value={(summary?.totalIncomeRows ?? 0) + (summary?.totalExpenseRows ?? 0)} />} note={`Income: ${summary?.totalIncomeRows ?? 0} · Expenses: ${summary?.totalExpenseRows ?? 0}`} />
      </div>

      {summary && <FinancePreview title="Income & expenditure preview" description="Comparison for the selected report period. Totals reflect the limited report dataset." money values={[{ label: "Income", value: summary.totalIncome }, { label: "Expenditure", value: summary.totalExpenditure }]} />}
      {error ? (
        <div className="space-y-4">{reportFilters}

        <EmptyCard
          icon={FileText}
          title="Unable to load Income & Expenditure Report"
          description={error}
          action={
            <Button size="sm" onClick={() => void loadReport()}>
              <RefreshCw />
              Try again
            </Button>
          }
        />
        </div>
      ) : (
        <TablePanel aria-busy={loading}>
          <TableToolbar>
            <Select value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}><SelectTrigger aria-label="Report section" className="w-56"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="income">Income transactions</SelectItem><SelectItem value="expense">Expenditure transactions</SelectItem><SelectItem value="bills">Bills preview</SelectItem></SelectContent></Select>
            <div className="flex flex-wrap gap-2 lg:ml-auto">
              <Select value={sort} onValueChange={setSort}><SelectTrigger aria-label="Sort records" size="sm" className="h-8 w-auto min-w-36 font-normal"><SelectValue /></SelectTrigger><SelectContent align="end"><SelectItem value="desc">Newest first</SelectItem><SelectItem value="asc">Oldest first</SelectItem></SelectContent></Select>
              <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}><SelectTrigger aria-label="Rows per page" size="sm" className="h-8 w-auto min-w-24 font-normal"><span className="text-muted-foreground">Show</span><SelectValue /></SelectTrigger><SelectContent align="end">{[10, 30, 50, 100].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent></Select>
            </div>
          </TableToolbar>
          {reportFilters}
          <p className="border-b bg-muted/20 px-5 py-3 text-xs text-muted-foreground">Limited report preview: up to 250 records per source contribute to the summary; each section displays up to 100 rows. Narrow the date range to review smaller periods.</p>
          {renderReportTable(visibleRows, activeTab === "bills")}
          <RecordPagination from={reportRows.length ? offset + 1 : 0} to={offset + visibleRows.length} total={reportRows.length} page={currentPage} pageCount={pageCount} onPageChange={setPage} disabled={loading} />
        </TablePanel>
      )}
      <CustomViewDetailsDialog open={Boolean(viewing)} onOpenChange={(open) => { if (!open) setViewing(null); }} title="Transaction details" description="Financial record from the selected report period.">
        {viewing && <><DetailSection title="Transaction"><DetailItem label="Reference">{viewing.billNo || viewing.reference || "—"}</DetailItem><DetailItem label="Date">{reportDate(viewing.date, true)}</DetailItem><DetailItem label="Farm">{viewing.farm}</DetailItem><DetailItem label="Farmer">{viewing.farmer}</DetailItem><DetailItem label="Source">{viewing.type || "Bill"}</DetailItem><DetailItem label="Status"><StatusBadge status={viewing.status} /></DetailItem></DetailSection><DetailSection title="Amount & details"><DetailItem label="Amount">{formatTzs(viewing.amount)}</DetailItem><DetailItem label="Quantity">{viewing.quantity}</DetailItem><DetailItem label="Subject">{viewing.subject}</DetailItem><DetailItem label="Officer">{viewing.officer || "—"}</DetailItem><DetailItem label="Notes" className="sm:col-span-2">{viewing.notes || "—"}</DetailItem></DetailSection></>}
      </CustomViewDetailsDialog>
    </div>
  );
}

