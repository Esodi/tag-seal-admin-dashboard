import React, { useState, useEffect, useMemo } from 'react';
import { Plus, GitGraph } from 'lucide-react';
import DataTable, { DataTableColumn } from '../components/crud/DataTable';
import { stageApi } from '../services/api';
import { Stage } from '../types/entities/livestock';

const Stages: React.FC = () => {
    const [data, setData] = useState<Stage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await stageApi.list();
            setData(result);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch stages');
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
            accessorFn: (row: Stage) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '-',
            size: 150
        },
    ] as DataTableColumn<Stage>[], []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <GitGraph className="w-8 h-8 text-primary-500" />
                        Stages
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage lifecycle stages for livestock.
                    </p>
                </div>
                <button
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Stage</span>
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
                    searchPlaceholder="Search stages..."
                    onView={(row) => console.log('View', row)}
                    onEdit={(row) => console.log('Edit', row)}
                    onDelete={(row) => console.log('Delete', row)}
                    enableExport={true}
                    exportFilename="stages"
                />
            </div>
        </div>
    );
};

export default Stages;
