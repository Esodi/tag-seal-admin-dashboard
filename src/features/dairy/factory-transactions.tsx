"use client";

import { useEffect, useState } from "react";
import { Banknote, Eye, MoreVertical, Receipt, Search, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardStatCard } from "@/components/ui/dashboard";
import {
  CustomViewDetailsDialog,
  DetailItem,
  DetailSection,
} from "@/components/ui/custom-view-details-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyCard } from "@/components/ui/empty-card";
import { Input } from "@/components/ui/input";
import { RecordPagination } from "@/components/ui/record-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { authenticatedFetch } from "@/lib/auth/session";
import { formatRecordDate } from "@/lib/resource-table";

type FactoryTransaction = {
  uuid: string;
  type: "batch" | "payment";
  amcos_name: string;
  centre_name?: string | null;
  reference: string;
  trip_number?: string | null;
  liters?: number | null;
  unit_price?: number | null;
  amount: number;
  status: string;
  notes?: string | null;
  paid_by_name?: string | null;
  occurred_at?: string | null;
};

type TransactionsResponse = {
  data: FactoryTransaction[];
  meta: {
    currentPage: number;
    lastPage: number;
    total: number;
    from: number;
    to: number;
    summary: {
      totalCredits: number;
      totalPaid: number;
      outstandingDebt: number;
    };
  };
};

const money = (value: number) =>
  `TZS ${Number(value || 0).toLocaleString("en-TZ", { maximumFractionDigits: 2 })}`;

export function FactoryTransactions({ factoryUuid }: { factoryUuid: string }) {
  const [result, setResult] = useState<TransactionsResponse | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewing, setViewing] = useState<FactoryTransaction | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setError("");
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const params = new URLSearchParams({
            type,
            sort,
            page: String(page),
            per_page: String(pageSize),
          });
          if (search.trim()) params.set("search", search.trim());
          const response = await authenticatedFetch(
            `/api/admin/dairy/factories/${encodeURIComponent(factoryUuid)}/transactions?${params}`,
            { signal: controller.signal, cache: "no-store" },
          );
          const payload = await response.json();
          if (!response.ok) {
            throw new Error(payload.message ?? "Transactions could not be loaded.");
          }
          if (!controller.signal.aborted) setResult(payload);
        } catch (err) {
          if (!controller.signal.aborted) {
            setError(
              err instanceof Error ? err.message : "Transactions could not be loaded.",
            );
          }
        }
      })();
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [factoryUuid, type, sort, page, pageSize, search, revision]);

  if (error) {
    return (
      <EmptyCard
        icon={Receipt}
        title="Could not load factory transactions"
        description={error}
        action={<Button onClick={() => setRevision((n) => n + 1)}>Try again</Button>}
      />
    );
  }

  if (!result) {
    return <Skeleton className="h-80 w-full" />;
  }

  const { data: rows, meta } = result;
  const summary = meta.summary;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <DashboardStatCard
          label={<>Total Milk Value</>}
          value={<StatNumber value={summary.totalCredits} prefix="TZS " />}
          note={<>Approved batches received from AMCOS</>}
          icon={Receipt}
        />
        <DashboardStatCard
          label={<>Paid to AMCOS</>}
          value={<StatNumber value={summary.totalPaid} prefix="TZS " />}
          note={<>Recorded factory settlement payments</>}
          icon={Banknote}
        />
        <DashboardStatCard
          label={<>Outstanding Debts</>}
          value={<StatNumber value={summary.outstandingDebt} prefix="TZS " />}
          note={<>Remaining balance owed to AMCOS</>}
          icon={Wallet}
        />
      </div>

      <TablePanel>
        <TableToolbar>
          <div className="relative min-w-0 flex-1 lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              aria-label="Search transactions"
              placeholder="Search AMCOS, batch or reference…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <Select
              value={type}
              onValueChange={(value) => {
                setType(value);
                setPage(1);
              }}
            >
              <SelectTrigger
                aria-label="Filter by transaction type"
                size="sm"
                className="h-8 w-auto min-w-36 font-normal"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">All transactions</SelectItem>
                <SelectItem value="batch">Milk batches</SelectItem>
                <SelectItem value="payment">AMCOS payments</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sort}
              onValueChange={(value) => {
                setSort(value);
                setPage(1);
              }}
            >
              <SelectTrigger
                aria-label="Sort transactions"
                size="sm"
                className="h-8 w-auto min-w-[9rem] font-normal"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="desc">Newest first</SelectItem>
                <SelectItem value="asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger
                aria-label="Rows per page"
                size="sm"
                className="h-8 w-auto min-w-[6.25rem] font-normal"
              >
                <span className="text-muted-foreground">Show</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {[10, 30, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </TableToolbar>

        {rows.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>AMCOS</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={`${row.type}-${row.uuid}`}>
                  <TableCell>{meta.from + index}</TableCell>
                  <TableCell className="font-medium">
                    {row.amcos_name}
                    {row.centre_name ? (
                      <p className="text-xs font-normal text-muted-foreground">
                        {row.centre_name}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={row.type === "payment" ? "default" : "secondary"}
                    >
                      {row.type === "payment" ? "AMCOS Payment" : "Milk Batch"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.reference || "—"}
                  </TableCell>
                  <TableCell>
                    {row.liters != null ? `${row.liters} L` : "—"}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {money(row.amount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={row.status === "paid" ? "active" : row.status}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatRecordDate(row.occurred_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Actions for ${row.reference}`}
                        >
                          <MoreVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setViewing(row)}>
                          <Eye />
                          View details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-5">
            <EmptyCard
              icon={Receipt}
              title="No factory transactions found"
              description="Approved milk batches and AMCOS settlement payments will appear here."
            />
          </div>
        )}

        <RecordPagination
          from={meta.from}
          to={meta.to}
          total={meta.total}
          page={meta.currentPage}
          pageCount={meta.lastPage}
          onPageChange={setPage}
        />
      </TablePanel>

      <CustomViewDetailsDialog
        open={Boolean(viewing)}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
        title="Transaction details"
        description={viewing?.amcos_name}
      >
        {viewing ? (
          <DetailSection title="Transaction summary">
            <DetailItem label="AMCOS">{viewing.amcos_name}</DetailItem>
            <DetailItem label="Type">
              {viewing.type === "payment" ? "AMCOS Payment" : "Milk Batch"}
            </DetailItem>
            <DetailItem label="Reference">{viewing.reference || "—"}</DetailItem>
            <DetailItem label="Amount">{money(viewing.amount)}</DetailItem>
            {viewing.liters != null ? (
              <DetailItem label="Accepted volume">{viewing.liters} L</DetailItem>
            ) : null}
            {viewing.unit_price != null ? (
              <DetailItem label="Unit price">{money(viewing.unit_price)}</DetailItem>
            ) : null}
            {viewing.trip_number ? (
              <DetailItem label="Trip">{viewing.trip_number}</DetailItem>
            ) : null}
            {viewing.paid_by_name ? (
              <DetailItem label="Recorded by">{viewing.paid_by_name}</DetailItem>
            ) : null}
            <DetailItem label="Date">
              {formatRecordDate(viewing.occurred_at)}
            </DetailItem>
            <DetailItem label="Notes" className="sm:col-span-2">
              {viewing.notes || "—"}
            </DetailItem>
          </DetailSection>
        ) : null}
      </CustomViewDetailsDialog>
    </div>
  );
}
