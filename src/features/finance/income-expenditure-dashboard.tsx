"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  FileText,
  Landmark,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const todayStr = new Date().toISOString().slice(0, 10);
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
  const didMount = useRef(false);

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
          { cache: "no-store" },
        );
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.status === false) {
          throw new Error(
            payload?.message ?? "Unable to load Income & Expenditure report.",
          );
        }
        setData(payload.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Income & Expenditure report.",
        );
      } finally {
        setLoading(false);
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
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    if (preset === "today") {
      setFromDate(today);
      setToDate(today);
    } else if (preset === "week") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff)).toISOString().slice(0, 10);
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

  const renderReportTable = (rows: FinanceReportRow[], isBills = false) => {
    if (loading && rows.length === 0) {
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
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Date</TableHead>
              <TableHead>{isBills ? "Bill No" : "Source Type"}</TableHead>
              <TableHead>
                {isBills ? "Extension Officer" : "Reference"}
              </TableHead>
              <TableHead>Farm</TableHead>
              <TableHead>Farmer</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={`${row.date}-${idx}`}>
                <TableCell className="text-xs text-muted-foreground">
                  {row.date}
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
                <TableCell className="font-semibold tabular-nums">
                  {formatTzs(row.amount)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                  {row.notes || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardHeader
        eyebrow="Finance & Billing"
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
              size="sm"
              onClick={() => {
                if (typeof window !== "undefined") window.print();
              }}
            >
              <Printer className="size-4" />
              Print report
            </Button>
          </div>
        }
      />

      <Card className="border-border/70 shadow-none">
        <CardContent className="p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Field>
              <FieldLabel>From date</FieldLabel>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>To date</FieldLabel>
              <Input
                type="date"
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
            <Field>
              <FieldLabel>Search</FieldLabel>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Bill no, reference, notes…"
                  className="pl-9"
                />
              </div>
            </Field>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-success/25 bg-success/[0.025] shadow-none">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Total Income
              </p>
              <span className="grid size-9 place-items-center rounded-xl bg-success/15 text-success">
                <ArrowUpRight className="size-4" />
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight">
              <StatNumber
                value={Math.round(summary?.totalIncome ?? 0)}
                prefix="TZS "
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary?.totalIncomeRows ?? 0} revenue transactions
            </p>
          </CardContent>
        </Card>

        <Card className="border-warning/25 bg-warning/[0.025] shadow-none">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Total Expenditure
              </p>
              <span className="grid size-9 place-items-center rounded-xl bg-warning/15 text-warning">
                <ArrowDownRight className="size-4" />
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight">
              <StatNumber
                value={Math.round(summary?.totalExpenditure ?? 0)}
                prefix="TZS "
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary?.totalExpenseRows ?? 0} expense transactions
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Net Balance
              </p>
              <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <Landmark className="size-4" />
              </span>
            </div>
            <div
              className={`mt-3 text-2xl font-bold tracking-tight ${(summary?.net ?? 0) < 0 ? "text-danger" : "text-foreground"}`}
            >
              {formatTzs(summary?.net ?? 0)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {(summary?.net ?? 0) >= 0
                ? "Net surplus for period"
                : "Net deficit for period"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Transactions
              </p>
              <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-4" />
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight">
              <StatNumber
                value={
                  (summary?.totalIncomeRows ?? 0) +
                  (summary?.totalExpenseRows ?? 0)
                }
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Income: {summary?.totalIncomeRows ?? 0} · Expenses:{" "}
              {summary?.totalExpenseRows ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {error ? (
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
      ) : (
        <Card className="border-border/70 shadow-none">
          <CardContent className="space-y-4 p-5">
            <Tabs
              value={activeTab}
              onValueChange={(next) =>
                setActiveTab(next as "income" | "expense" | "bills")
              }
            >
              <TabsList>
                <TabsTrigger value="income">
                  Income Transactions
                  <Badge
                    variant="secondary"
                    className="ml-2 px-1.5 py-0 text-[10px]"
                  >
                    {incomeRows.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="expense">
                  Expenditure Transactions
                  <Badge
                    variant="secondary"
                    className="ml-2 px-1.5 py-0 text-[10px]"
                  >
                    {expenseRows.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="bills">
                  Bills Preview
                  <Badge
                    variant="secondary"
                    className="ml-2 px-1.5 py-0 text-[10px]"
                  >
                    {billRows.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="income" className="mt-4">
                {renderReportTable(incomeRows, false)}
              </TabsContent>
              <TabsContent value="expense" className="mt-4">
                {renderReportTable(expenseRows, false)}
              </TabsContent>
              <TabsContent value="bills" className="mt-4">
                {renderReportTable(billRows, true)}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

