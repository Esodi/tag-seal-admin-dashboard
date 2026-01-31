import React, { useState, useEffect, useMemo } from 'react';
import { Plus, TestTube } from 'lucide-react';
import DataTable, { DataTableColumn } from '../components/crud/DataTable';
import { testResultApi } from '../services/api';
import { TestResult } from '../types/entities/lifecycle';

const TestResults: React.FC = () => {
    const [data, setData] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await testResultApi.list();
            setData(result);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch test results');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = useMemo(() => [
        { id: 'id', header: 'ID', accessorKey: 'id', enableSorting: true, size: 80 },
        { id: 'name', header: 'Name', accessorKey: 'name', enableSorting: true },
        {
            id: 'created_at',
            header: 'Created At',
            accessorFn: (row: TestResult) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '-',
            size: 150
        },
    ] as DataTableColumn<TestResult>[], []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <TestTube className="w-8 h-8 text-primary-500" />
                        Test Results
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage possible results for health tests.
                    </p>
                </div>
                <button
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Test Result</span>
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <DataTable
                    data={data}
                    columns={columns}
                    loading={loading}
                    searchPlaceholder="Search test results..."
                    onView={(row) => console.log('View', row)}
                    onEdit={(row) => console.log('Edit', row)}
                    onDelete={(row) => console.log('Delete', row)}
                    enableExport={true}
                    exportFilename="test_results"
                />
            </div>
        </div>
    );
};

export default TestResults;
