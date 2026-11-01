import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { milkingApi, livestockApi, farmApi, milkingMethodApi } from '../../services/api';
import { Milking, Livestock, Farm, MilkingMethod } from '../../types/entities';
import { formatDate } from '../../lib/utils';

// Extended type for display
interface MilkingDisplay extends Milking {
    livestockName?: string;
    farmName?: string;
    methodName?: string;
}

export function MilkingsPage() {
    const [data, setData] = useState<MilkingDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [livestock, setLivestock] = useState<SelectOption[]>([]);
    const [farms, setFarms] = useState<SelectOption[]>([]);
    const [methods, setMethods] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [milkingsData, livestockData, farmsData, methodsData] = await Promise.all([
                milkingApi.list(),
                livestockApi.list(),
                farmApi.list(),
                milkingMethodApi.list(),
            ]);

            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.uuid, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const farmMap = new Map(farmsData.map((f: Farm) => [f.uuid, f.name]));
            const methodMap = new Map(methodsData.map((m: MilkingMethod) => [m.id, m.name]));

            const enrichedData = milkingsData.map((m: Milking) => ({
                ...m,
                livestockName: m.livestockUuid ? livestockMap.get(m.livestockUuid) : '-',
                farmName: m.farmUuid ? farmMap.get(m.farmUuid) : '-',
                methodName: m.milkingMethodId ? methodMap.get(m.milkingMethodId) : '-',
            }));

            setData(enrichedData);

            setLivestock(livestockData
                .filter((l: Livestock) => {
                    const g = l.gender?.toLowerCase();
                    return g === 'female';
                })
                .map((l: Livestock) => ({
                    value: l.uuid,
                    label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
                })));

            setFarms(farmsData.map((f: Farm) => ({ value: f.uuid, label: f.name })));
            setMethods(methodsData.map((m: MilkingMethod) => ({ value: m.id, label: m.name })));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load milking records');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<MilkingDisplay>[] = [
        { id: 'uuid', header: 'UUID', accessorKey: 'uuid', size: 100 },
        { id: 'livestockName', header: 'Cow', accessorKey: 'livestockName' },
        { id: 'farmName', header: 'Farm', accessorKey: 'farmName' },
        {
            id: 'eventDate',
            header: 'Date',
            accessorFn: (row) => row.eventDate ? formatDate(row.eventDate) : (row.created_at ? formatDate(row.created_at) : '-'),
        },
        { id: 'session', header: 'Session', accessorKey: 'session' },
        {
            id: 'amount',
            header: 'Amount',
            accessorFn: (row) => row.amount ? `${row.amount} L` : '-',
        },
    ];

    const formFields: FormField<Milking>[] = [
        {
            name: 'farmUuid' as keyof Milking,
            label: 'Farm',
            type: 'select',
            required: true,
            options: farms,
            placeholder: 'Select farm',
        },
        {
            name: 'livestockUuid' as keyof Milking,
            label: 'Cow',
            type: 'select',
            required: true,
            options: livestock,
            placeholder: 'Select cow',
        },
        {
            name: 'eventDate' as keyof Milking,
            label: 'Date',
            type: 'date',
            required: true,
        },
        {
            name: 'session' as keyof Milking,
            label: 'Session',
            type: 'select',
            options: [
                { value: 'morning', label: 'Morning' },
                { value: 'evening', label: 'Evening' },
                { value: 'night', label: 'Night' },
                { value: 'midnight', label: 'Midnight' },
            ],
            defaultValue: 'morning',
        },
        {
            name: 'amount' as keyof Milking,
            label: 'Amount (Leters)',
            type: 'text',
            required: true,
        },
        {
            name: 'milkingMethodId' as keyof Milking,
            label: 'Method',
            type: 'select',
            options: methods,
            placeholder: 'Select method',
        },
        {
            name: 'lactometerReading' as keyof Milking,
            label: 'Lactometer Reading',
            type: 'text',
        },
        {
            name: 'remarks' as keyof Milking,
            label: 'Remarks',
            type: 'textarea',
            placeholder: 'Comments',
        },
    ];

    const detailFields = [
        { key: 'uuid' as keyof MilkingDisplay, label: 'UUID' },
        { key: 'livestockName' as keyof MilkingDisplay, label: 'Cow' },
        { key: 'farmName' as keyof MilkingDisplay, label: 'Farm' },
        { key: 'eventDate' as keyof MilkingDisplay, label: 'Date', render: (val: unknown) => val ? formatDate(String(val)) : '-' },
        { key: 'session' as keyof MilkingDisplay, label: 'Session' },
        { key: 'amount' as keyof MilkingDisplay, label: 'Amount' },
        { key: 'methodName' as keyof MilkingDisplay, label: 'Method' },
        { key: 'lactometerReading' as keyof MilkingDisplay, label: 'Lactometer' },
        { key: 'remarks' as keyof MilkingDisplay, label: 'Remarks' },
        { key: 'created_at' as keyof MilkingDisplay, label: 'Created At', render: (val: unknown) => formatDate(String(val)) },
    ];

    const handleCreate = async (item: Partial<Milking>) => {
        await milkingApi.create(item as Milking);
    };

    const handleUpdate = async (id: number | string, item: Partial<Milking>) => {
        await milkingApi.update(Number(id), item as Milking);
    };

    const handleDelete = async (id: number | string) => {
        await milkingApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Milking Records"
            description="Track milk production"
            data={data}
            loading={loading}
            error={error}
            columns={columns}
            formFields={formFields as any}
            detailFields={detailFields}
            formColumns={2}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onRefresh={fetchData}
            createLabel="Record Milking"
            createModalSize="lg"
            editModalSize="lg"
        />
    );
}

export default MilkingsPage;
