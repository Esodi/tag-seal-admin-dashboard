import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { dryoffApi, livestockApi } from '../../services/api';
import { Dryoff, Livestock } from '../../types/entities';
import { formatDate } from '../../lib/utils';

// Extended type for display
interface DryoffDisplay extends Dryoff {
    livestockName?: string;
}

export function DryoffsPage() {
    const [data, setData] = useState<DryoffDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [cows, setCows] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [dryoffsData, livestockData] = await Promise.all([
                dryoffApi.list(),
                livestockApi.list(),
            ]);

            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.id, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));

            const enrichedData = dryoffsData.map((d: Dryoff) => ({
                ...d,
                livestockName: d.livestockId ? livestockMap.get(d.livestockId) : '-',
            }));

            setData(enrichedData);

            setCows(livestockData
                .filter((l: Livestock) => l.gender === 'female') // Only cows dry off
                .map((l: Livestock) => ({
                    value: l.id,
                    label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
                })));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load dryoff records');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<DryoffDisplay>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'livestockName', header: 'Cow', accessorKey: 'livestockName' },
        {
            id: 'dryoffDate',
            header: 'Dryoff Date',
            accessorFn: (row) => formatDate(row.dryoffDate),
        },
        {
            id: 'expectedCalvingDate',
            header: 'Expected Calving',
            accessorFn: (row) => row.expectedCalvingDate ? formatDate(row.expectedCalvingDate) : '-',
        },
        { id: 'reason', header: 'Reason', accessorKey: 'reason' },
    ];

    const formFields: FormField<Partial<Dryoff>>[] = [
        {
            name: 'livestockId',
            label: 'Cow',
            type: 'select',
            required: true,
            options: cows,
            placeholder: 'Select cow',
        },
        {
            name: 'dryoffDate',
            label: 'Dryoff Date',
            type: 'date',
            required: true,
        },
        {
            name: 'expectedCalvingDate',
            label: 'Expected Calving Date',
            type: 'date',
        },
        {
            name: 'reason',
            label: 'Reason',
            type: 'text',
            placeholder: 'e.g. End of lactation, Health issue',
        },
        {
            name: 'notes',
            label: 'Notes',
            type: 'textarea',
            placeholder: 'Comments',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof DryoffDisplay, label: 'ID' },
        { key: 'livestockName' as keyof DryoffDisplay, label: 'Cow' },
        { key: 'dryoffDate' as keyof DryoffDisplay, label: 'Dryoff Date', render: (val: unknown) => formatDate(String(val)) },
        { key: 'expectedCalvingDate' as keyof DryoffDisplay, label: 'Expected Calving', render: (val: unknown) => val ? formatDate(String(val)) : '-' },
        { key: 'reason' as keyof DryoffDisplay, label: 'Reason' },
        { key: 'notes' as keyof DryoffDisplay, label: 'Notes' },
        { key: 'created_at' as keyof DryoffDisplay, label: 'Created At', render: (val: unknown) => formatDate(String(val)) },
    ];

    const handleCreate = async (item: Partial<Dryoff>) => {
        await dryoffApi.create(item as Dryoff);
    };

    const handleUpdate = async (id: number | string, item: Partial<Dryoff>) => {
        await dryoffApi.update(Number(id), item as Dryoff);
    };

    const handleDelete = async (id: number | string) => {
        await dryoffApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Dryoff Records"
            description="Track drying off events for dairy cattle"
            data={data}
            loading={loading}
            error={error}
            columns={columns}
            formFields={formFields}
            detailFields={detailFields}
            formColumns={2}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onRefresh={fetchData}
            createLabel="Record Dryoff"
            createModalSize="lg"
            editModalSize="lg"
        />
    );
}

export default DryoffsPage;
