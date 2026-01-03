import { useState, useMemo, useCallback } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    ColumnDef,
    Row,
} from '@tanstack/react-table';
import {
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    Download,
    Columns,
    Trash2,
    Edit,
    Eye,
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Types
export interface DataTableColumn<T> {
    id: string;
    header: string;
    accessorKey?: keyof T | string;
    accessorFn?: (row: T) => unknown;
    cell?: (info: { row: Row<T>; getValue: () => unknown }) => React.ReactNode;
    enableSorting?: boolean;
    enableFiltering?: boolean;
    size?: number;
    meta?: {
        className?: string;
        align?: 'left' | 'center' | 'right';
    };
}

export interface DataTableProps<T> {
    data: T[];
    columns: DataTableColumn<T>[];
    loading?: boolean;

    // Search & Filter
    searchPlaceholder?: string;
    globalFilter?: string;
    onGlobalFilterChange?: (value: string) => void;

    // Pagination
    pageSize?: number;
    pageSizeOptions?: number[];

    // Selection
    enableRowSelection?: boolean;
    onRowSelectionChange?: (selectedRows: T[]) => void;

    // Actions
    onView?: (row: T) => void;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;

    // Bulk actions
    onBulkDelete?: (rows: T[]) => void;

    // Export
    enableExport?: boolean;
    exportFilename?: string;

    // Empty state
    emptyMessage?: string;

    // Styling
    className?: string;
    compact?: boolean;
}

export function DataTable<T extends { id: number | string }>({
    data,
    columns,
    loading = false,
    searchPlaceholder = 'Search...',
    globalFilter: externalFilter,
    onGlobalFilterChange,
    pageSize: initialPageSize = 10,
    pageSizeOptions = [10, 25, 50, 100],
    enableRowSelection = false,
    onRowSelectionChange,
    onView,
    onEdit,
    onDelete,
    onBulkDelete,
    enableExport = true,
    exportFilename = 'export',
    emptyMessage = 'No data found',
    className,
    compact = false,
}: DataTableProps<T>) {
    // State
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [internalFilter, setInternalFilter] = useState('');
    const [showColumnToggle, setShowColumnToggle] = useState(false);

    const globalFilterValue = externalFilter ?? internalFilter;
    const setGlobalFilter = onGlobalFilterChange ?? setInternalFilter;

    // Convert columns to react-table format
    const tableColumns = useMemo<ColumnDef<T>[]>(() => {
        const cols: ColumnDef<T>[] = [];

        // Selection column
        if (enableRowSelection) {
            cols.push({
                id: 'select',
                header: ({ table }) => (
                    <input
                        type="checkbox"
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={table.getToggleAllPageRowsSelectedHandler()}
                    />
                ),
                cell: ({ row }) => (
                    <input
                        type="checkbox"
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                    />
                ),
                size: 40,
            });
        }

        // Data columns
        columns.forEach((col) => {
            cols.push({
                id: col.id,
                header: col.header,
                accessorKey: col.accessorKey as string,
                accessorFn: col.accessorFn,
                cell: col.cell
                    ? (info) => col.cell!({ row: info.row, getValue: info.getValue })
                    : undefined,
                enableSorting: col.enableSorting !== false,
                size: col.size,
                meta: col.meta,
            });
        });

        // Actions column
        if (onView || onEdit || onDelete) {
            cols.push({
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <div className="flex items-center gap-1">
                        {onView && (
                            <button
                                onClick={() => onView(row.original)}
                                className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                title="View"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                        )}
                        {onEdit && (
                            <button
                                onClick={() => onEdit(row.original)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(row.original)}
                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ),
                size: 100,
                enableSorting: false,
            });
        }

        return cols;
    }, [columns, enableRowSelection, onView, onEdit, onDelete]);

    // Table instance
    const table = useReactTable({
        data,
        columns: tableColumns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter: globalFilterValue,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageSize: initialPageSize },
        },
    });

    // Handle row selection change
    const selectedRows = useMemo(() => {
        return table.getSelectedRowModel().rows.map((row) => row.original);
    }, [table.getSelectedRowModel().rows]);

    // Export to CSV
    const exportToCSV = useCallback(() => {
        const headers = columns.map((col) => col.header).join(',');
        const rows = table.getFilteredRowModel().rows.map((row) => {
            return columns
                .map((col) => {
                    const value = col.accessorKey
                        ? (row.original as Record<string, unknown>)[col.accessorKey as string]
                        : col.accessorFn
                            ? col.accessorFn(row.original)
                            : '';
                    // Escape quotes and wrap in quotes if contains comma
                    const stringValue = String(value ?? '').replace(/"/g, '""');
                    return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
                })
                .join(',');
        });

        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${exportFilename}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }, [columns, table, exportFilename]);

    // Notify parent of selection changes
    useMemo(() => {
        onRowSelectionChange?.(selectedRows);
    }, [selectedRows, onRowSelectionChange]);

    return (
        <div className={cn('space-y-4', className)}>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={globalFilterValue}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Bulk delete */}
                    {enableRowSelection && selectedRows.length > 0 && onBulkDelete && (
                        <button
                            onClick={() => onBulkDelete(selectedRows)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete ({selectedRows.length})
                        </button>
                    )}

                    {/* Column visibility toggle */}
                    <div className="relative">
                        <button
                            onClick={() => setShowColumnToggle(!showColumnToggle)}
                            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Toggle columns"
                        >
                            <Columns className="w-4 h-4" />
                        </button>
                        {showColumnToggle && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                                {table.getAllLeafColumns().map((column) => {
                                    if (column.id === 'select' || column.id === 'actions') return null;
                                    return (
                                        <label
                                            key={column.id}
                                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={column.getIsVisible()}
                                                onChange={column.getToggleVisibilityHandler()}
                                                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">
                                                {typeof column.columnDef.header === 'string'
                                                    ? column.columnDef.header
                                                    : column.id}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Export */}
                    {enableExport && (
                        <button
                            onClick={exportToCSV}
                            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Export to CSV"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className={cn(
                                            'px-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider',
                                            compact ? 'py-2' : 'py-3',
                                            header.column.getCanSort() && 'cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-700'
                                        )}
                                        style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center gap-1">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() && (
                                                <span className="text-slate-400">
                                                    {header.column.getIsSorted() === 'asc' ? (
                                                        <ChevronUp className="w-4 h-4" />
                                                    ) : header.column.getIsSorted() === 'desc' ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronsUpDown className="w-4 h-4 opacity-50" />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                        {loading ? (
                            <tr>
                                <td colSpan={tableColumns.length} className="px-4 py-8 text-center">
                                    <div className="flex items-center justify-center gap-2 text-slate-500">
                                        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                        <span>Loading...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={tableColumns.length}
                                    className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className={cn(
                                        'hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
                                        row.getIsSelected() && 'bg-primary-50 dark:bg-primary-900/20'
                                    )}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className={cn(
                                                'px-4 text-sm text-slate-700 dark:text-slate-300',
                                                compact ? 'py-2' : 'py-3'
                                            )}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                    {Math.min(
                        (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                        table.getFilteredRowModel().rows.length
                    )}{' '}
                    of {table.getFilteredRowModel().rows.length} results
                </div>

                <div className="flex items-center gap-2">
                    {/* Page size selector */}
                    <select
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                        className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>
                                {size} per page
                            </option>
                        ))}
                    </select>

                    {/* Pagination controls */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                            className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                            title="First page"
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                            title="Previous page"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <span className="px-3 py-1 text-sm text-slate-700 dark:text-slate-300">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </span>

                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                            title="Next page"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                            className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                            title="Last page"
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DataTable;
