"use client";

import { Database } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { RecordPagination } from "@/components/ui/record-pagination";
import { cn } from "@/lib/utils";
import { TablePanel, TableToolbar, TablePagination } from "@/components/ui/table-layout";
import { EmptyCard } from "@/components/ui/empty-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type DataTableColumn<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  emptyTitle = "No records found",
  emptyDescription = "Records will appear here when they are available.",
  toolbar,
  footer,
  pagination,
  rowNumberStart,
  selection,
}: {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string | number;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbar?: ReactNode;
  footer?: ReactNode;
  pagination?: ComponentProps<typeof RecordPagination>;
  rowNumberStart?: number;
  selection?: { ids: Set<string | number>; onChange: (ids: Set<string | number>) => void };
}) {
  return (
    <TablePanel>
      {toolbar ? <TableToolbar className="[&>*]:w-full">{toolbar}</TableToolbar> : null}
      {rows.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              {selection && <TableHead className="w-12"><Checkbox aria-label="Select all records on this page" checked={rows.every((row) => selection.ids.has(getRowId(row))) ? true : rows.some((row) => selection.ids.has(getRowId(row))) ? "indeterminate" : false} onCheckedChange={(checked) => selection.onChange(checked === true ? new Set(rows.map(getRowId)) : new Set())} /></TableHead>}
              {rowNumberStart !== undefined && <TableHead className="w-14">#</TableHead>}
              {columns.map((column) => (
                <TableHead key={column.key} className={cn(column.key === "actions" && "w-24 text-right", column.className)}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={getRowId(row)} data-state={selection?.ids.has(getRowId(row)) ? "selected" : undefined}>
                {selection && <TableCell><Checkbox aria-label={`Select record ${getRowId(row)}`} checked={selection.ids.has(getRowId(row))} onCheckedChange={(checked) => { const next = new Set(selection.ids); if (checked === true) next.add(getRowId(row)); else next.delete(getRowId(row)); selection.onChange(next); }} /></TableCell>}
                {rowNumberStart !== undefined && <TableCell className="text-muted-foreground tabular-nums">{rowNumberStart + index}</TableCell>}
                {columns.map((column) => (
                  <TableCell key={column.key} className={cn(column.key === "actions" && "text-right", column.className)}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="p-4">
          <EmptyCard
            icon={Database}
            title={emptyTitle}
            description={emptyDescription}
          />
        </div>
      )}
      {pagination ? <RecordPagination {...pagination} /> : footer ? (
        <TablePagination className="[&>*]:w-full">
          {footer}
        </TablePagination>
      ) : null}
    </TablePanel>
  );
}
