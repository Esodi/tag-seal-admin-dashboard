"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/ui/table-layout";

export function RecordPagination({ from, to, total, page, pageCount, onPageChange, disabled = false }: {
  from: number | null;
  to: number | null;
  total: number;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) {
  const lastPage = Math.max(1, pageCount);
  return (
    <TablePagination>
      <p role="status">Showing {total === 0 ? 0 : (from ?? 0)}–{total === 0 ? 0 : (to ?? 0)} of {total.toLocaleString("en-TZ")}</p>
      <nav aria-label="Table pagination" className="flex items-center gap-2">
        <Button type="button" variant="outline" size="icon-sm" aria-label="Previous page" disabled={disabled || page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}><ChevronLeft /></Button>
        <span className="px-2 tabular-nums">Page {page} of {lastPage}</span>
        <Button type="button" variant="outline" size="icon-sm" aria-label="Next page" disabled={disabled || page >= lastPage} onClick={() => onPageChange(Math.min(lastPage, page + 1))}><ChevronRight /></Button>
      </nav>
    </TablePagination>
  );
}
