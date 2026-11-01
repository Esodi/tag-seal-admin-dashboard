import { Database } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
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
}: {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string | number;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbar?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-none">
      {toolbar ? <div className="border-b p-4">{toolbar}</div> : null}
      {rows.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={getRowId(row)}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
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
      {footer ? (
        <div className="border-t px-4 py-3 text-xs text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </Card>
  );
}
