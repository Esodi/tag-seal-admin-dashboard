import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Remove the module declaration as we'll use the functional approach
// declare module 'jspdf' { ... }

export const exportToCSV = (data: any[], columns: { header: string; accessorKey?: string; accessorFn?: (row: any) => any }[], filename: string) => {
    const headers = columns.map((col) => col.header).join(',');
    const rows = data.map((row) => {
        return columns
            .map((col) => {
                const value = col.accessorKey
                    ? (row as any)[col.accessorKey]
                    : col.accessorFn
                        ? col.accessorFn(row)
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
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};

export const exportToExcel = (data: any[], columns: { header: string; accessorKey?: string; accessorFn?: (row: any) => any }[], filename: string) => {
    const formattedData = data.map((row) => {
        const obj: any = {};
        columns.forEach((col) => {
            const value = col.accessorKey
                ? (row as any)[col.accessorKey]
                : col.accessorFn
                    ? col.accessorFn(row)
                    : '';
            obj[col.header] = value;
        });
        return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPDF = (data: any[], columns: { header: string; accessorKey?: string; accessorFn?: (row: any) => any }[], filename: string) => {
    const doc = new jsPDF();

    const tableColumn = columns.map(c => c.header);
    const tableRows = data.map(row => {
        return columns.map(col => {
            return col.accessorKey
                ? (row as any)[col.accessorKey] // Remove string conversion to allow number formatting if needed, but autoTable handles it
                : col.accessorFn
                    ? col.accessorFn(row)
                    : '';
        });
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [79, 70, 229] }, // Tailwind primary-600 color
    });

    doc.text(`Report: ${filename}`, 14, 15);
    doc.save(`${filename}.pdf`);
};
