import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { milkingApi, livestockApi, milkingMethodApi } from '../../services/api';
import { Milking, Livestock, MilkingMethod } from '../../types/entities';
import { formatDate } from '../../lib/utils';

// Extended type for display
interface MilkingDisplay extends Milking {
    livestockName?: string;
    methodName?: string;
}

export function MilkingsPage() {
    const [data, setData] = useState<MilkingDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [cows, setCows] = useState<SelectOption[]>([]);
    const [methods, setMethods] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [milkingsData, livestockData, methodsData] = await Promise.all([
                milkingApi.list(),
                livestockApi.list(),
                milkingMethodApi.list(),
            ]);

            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.id, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const methodMap = new Map(methodsData.map((m: MilkingMethod) => [m.id, m.name]));

            const enrichedData = milkingsData.map((m: Milking) => ({
                ...m,
                livestockName: m.livestockId ? livestockMap.get(m.livestockId) : '-',
                methodName: m.milkingMethodId ? methodMap.get(m.milkingMethodId) : '-',
            }));

            setData(enrichedData);

            setCows(livestockData
                .filter((l: Livestock) => l.gender === 'female') // Only cows
                .map((l: Livestock) => ({
                    value: l.id,
                    label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
                })));

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
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'livestockName', header: 'Cow', accessorKey: 'livestockName' },
        {
            id: 'milkingDate',
            header: 'Date',
            accessorFn: (row) => formatDate(row.milkingDate),
        },
        { id: 'milkingTime', header: 'Time', accessorKey: 'milkingTime' },
        {
            id: 'quantity',
            header: 'Qty',
            accessorFn: (row) => `${row.quantity} ${row.quantityUnit || 'L'}`,
        },
        { id: 'quality', header: 'Quality', accessorKey: 'quality' },
    ];

    const formFields: FormField<Partial<Milking>>[] = [
        {
            name: 'livestockId',
            label: 'Cow',
            type: 'select',
            required: true,
            options: cows,
            placeholder: 'Select cow',
        },
        {
            name: 'milkingDate',
            label: 'Date',
            type: 'date',
            required: true,
        },
        {
            name: 'milkingTime',
            label: 'Time of Day',
            type: 'select',
            options: [
                { value: 'morning', label: 'Morning' },
                { value: 'afternoon', label: 'Afternoon' },
                { value: 'evening', label: 'Evening' },
            ],
            defaultValue: 'morning',
        },
        {
            name: 'quantity',
            label: 'Quantity',
            type: 'number',
            required: true,
            min: 0,
        },
        {
            name: 'quantityUnit',
            label: 'Unit',
            type: 'select',
            options: [
                { value: 'L', label: 'Liters' },
                { value: 'kg', label: 'kg' },
                { value: 'gal', label: 'Gallons' },
            ],
            defaultValue: 'L',
        },
        {
            name: 'milkingMethodId',
            label: 'Method',
            type: 'select',
            options: methods,
            placeholder: 'Select method',
        },
        {
            name: 'quality',
            label: 'Quality Check',
            type: 'text',
            placeholder: 'e.g. Good, High SC count',
        },
        {
            name: 'notes',
            label: 'Notes',
            type: 'textarea',
            placeholder: 'Comments',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof MilkingDisplay, label: 'ID' },
        { key: 'livestockName' as keyof MilkingDisplay, label: 'Cow' },
        { key: 'milkingDate' as keyof MilkingDisplay, label: 'Date', render: (val: unknown) => formatDate(String(val)) },
        { key: 'milkingTime' as keyof MilkingDisplay, label: 'Time' },
        { key: 'quantity' as keyof MilkingDisplay, label: 'Quantity' },
        { key: 'quantityUnit' as keyof MilkingDisplay, label: 'Unit' },
        { key: 'methodName' as keyof MilkingDisplay, label: 'Method' },
        { key: 'quality' as keyof MilkingDisplay, label: 'Quality' },
        { key: 'notes' as keyof MilkingDisplay, label: 'Notes' },
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
            formFields={formFields}
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
