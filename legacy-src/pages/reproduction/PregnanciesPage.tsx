import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { pregnancyApi, livestockApi } from '../../services/api';
import { Pregnancy, Livestock } from '../../types/entities';
import { formatDate } from '../../lib/utils';

// Extended type for display
interface PregnancyDisplay extends Pregnancy {
    livestockName?: string;
    fatherName?: string;
}

export function PregnanciesPage() {
    const [data, setData] = useState<PregnancyDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [females, setFemales] = useState<SelectOption[]>([]);
    const [males, setMales] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [pregnanciesData, livestockData] = await Promise.all([
                pregnancyApi.list(),
                livestockApi.list(),
            ]);

            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.uuid, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const uuidToNameMap = new Map(livestockData.map((l: Livestock) => [l.uuid, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));

            const enrichedData = pregnanciesData.map((p: Pregnancy) => ({
                ...p,
                livestockName: (p.livestock?.name || (p.livestockUuid ? livestockMap.get(p.livestockUuid) : undefined)) || '-',
                fatherName: p.fatherUuid ? uuidToNameMap.get(p.fatherUuid) : '-',
            }));

            setData(enrichedData);

            setFemales(livestockData
                .filter((l: Livestock) => l.gender === 'female')
                .map((l: Livestock) => ({
                    value: l.uuid,
                    label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
                })));

            setMales(livestockData
                .filter((l: Livestock) => l.gender === 'male')
                .map((l: Livestock) => ({
                    value: l.uuid,
                    label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
                })));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load pregnancies');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<PregnancyDisplay>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'livestockName', header: 'Mother', accessorKey: 'livestockName' },
        {
            id: 'conceptionDate',
            header: 'Conception Date',
            accessorFn: (row) => formatDate(row.conceptionDate || ''),
        },
        {
            id: 'expectedDeliveryDate',
            header: 'Expected Delivery',
            accessorFn: (row) => formatDate(row.expectedDeliveryDate || ''),
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ getValue }) => {
                const val = String(getValue() || '').toLowerCase();
                const colors: Record<string, string> = {
                    confirmed: 'badge-success',
                    suspected: 'badge-warning',
                    delivered: 'badge-info',
                    aborted: 'badge-danger',
                };
                return <span className={`badge ${colors[val] || 'badge-secondary'}`}>{val || '-'}</span>;
            },
        },
        { id: 'fatherName', header: 'Sire/Father', accessorKey: 'fatherName' },
    ];

    const formFields: FormField<Partial<Pregnancy>>[] = [
        {
            name: 'livestockUuid' as any,
            label: 'Mother',
            type: 'select',
            required: true,
            options: females,
            placeholder: 'Select mother',
        },
        {
            name: 'fatherUuid',
            label: 'Father (Optional)',
            type: 'select',
            options: males,
            placeholder: 'Select father if known',
        },
        {
            name: 'conceptionDate',
            label: 'Conception Date',
            type: 'date',
        },
        {
            name: 'expectedDeliveryDate',
            label: 'Expected Delivery',
            type: 'date',
        },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            required: true,
            options: [
                { value: 'suspected', label: 'Suspected' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'aborted', label: 'Aborted' },
            ],
            defaultValue: 'suspected',
        },
        {
            name: 'notes',
            label: 'Notes',
            type: 'textarea',
            placeholder: 'Ultrasonography notes, etc.',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof PregnancyDisplay, label: 'ID' },
        { key: 'livestockName' as keyof PregnancyDisplay, label: 'Mother' },
        { key: 'fatherName' as keyof PregnancyDisplay, label: 'Father' },
        { key: 'conceptionDate' as keyof PregnancyDisplay, label: 'Conception', render: (val: unknown) => formatDate(String(val)) },
        { key: 'expectedDeliveryDate' as keyof PregnancyDisplay, label: 'Due Date', render: (val: unknown) => formatDate(String(val)) },
        { key: 'actualDeliveryDate' as keyof PregnancyDisplay, label: 'Delivery Date', render: (val: unknown) => formatDate(String(val)) },
        { key: 'status' as keyof PregnancyDisplay, label: 'Status' },
        { key: 'notes' as keyof PregnancyDisplay, label: 'Notes' },
        { key: 'created_at' as keyof PregnancyDisplay, label: 'Created At', render: (val: unknown) => formatDate(String(val)) },
    ];

    const handleCreate = async (item: Partial<Pregnancy>) => {
        await pregnancyApi.create(item as Pregnancy);
    };

    const handleUpdate = async (id: number | string, item: Partial<Pregnancy>) => {
        await pregnancyApi.update(Number(id), item as Pregnancy);
    };

    const handleDelete = async (id: number | string) => {
        await pregnancyApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Pregnancies"
            description="Track livestock pregnancies and due dates"
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
            createLabel="Record Pregnancy"
            createModalSize="lg"
            editModalSize="lg"
        />
    );
}

export default PregnanciesPage;
