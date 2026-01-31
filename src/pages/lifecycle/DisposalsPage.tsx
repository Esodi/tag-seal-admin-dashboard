import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { disposalApi, livestockApi, farmApi, disposalTypeApi } from '../../services/api';
import { Disposal, Livestock, Farm, DisposalType } from '../../types/entities';
import { formatDate } from '../../lib/utils';

// Extended type for display
interface DisposalDisplay extends Disposal {
    livestockName?: string;
    farmName?: string;
    typeName?: string;
}

export function DisposalsPage() {
    const [data, setData] = useState<DisposalDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [livestock, setLivestock] = useState<SelectOption[]>([]);
    const [farms, setFarms] = useState<SelectOption[]>([]);
    const [types, setTypes] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [disposalsData, livestockData, farmsData, typesData] = await Promise.all([
                disposalApi.list(),
                livestockApi.list(),
                farmApi.list(),
                disposalTypeApi.list(),
            ]);

            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.uuid, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const farmMap = new Map(farmsData.map((f: Farm) => [f.uuid, f.name]));
            const typeMap = new Map(typesData.map((t: DisposalType) => [t.id, t.name]));

            const enrichedData = disposalsData.map((d: Disposal) => ({
                ...d,
                livestockName: d.livestockUuid ? livestockMap.get(d.livestockUuid) : '-',
                farmName: d.farmUuid ? farmMap.get(d.farmUuid) : '-',
                typeName: d.disposalTypeId ? typeMap.get(d.disposalTypeId) : '-',
            }));

            setData(enrichedData);

            setLivestock(livestockData.map((l: Livestock) => ({
                value: l.uuid,
                label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
            })));

            setFarms(farmsData.map((f: Farm) => ({ value: f.uuid, label: f.name })));
            setTypes(typesData.map((t: DisposalType) => ({ value: t.id, label: t.name })));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load disposal records');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<DisposalDisplay>[] = [
        { id: 'uuid', header: 'UUID', accessorKey: 'uuid', size: 100 },
        { id: 'livestockName', header: 'Livestock', accessorKey: 'livestockName' },
        { id: 'farmName', header: 'Farm', accessorKey: 'farmName' },
        {
            id: 'eventDate',
            header: 'Date',
            accessorFn: (row) => row.eventDate ? formatDate(row.eventDate) : (row.created_at ? formatDate(row.created_at) : '-'),
        },
        { id: 'typeName', header: 'Type', accessorKey: 'typeName' },
        { id: 'status', header: 'Status', accessorKey: 'status' },
    ];

    const formFields: FormField<Disposal>[] = [
        {
            name: 'farmUuid' as keyof Disposal,
            label: 'Farm',
            type: 'select',
            required: true,
            options: farms,
            placeholder: 'Select farm',
        },
        {
            name: 'livestockUuid' as keyof Disposal,
            label: 'Livestock',
            type: 'select',
            required: true,
            options: livestock,
            placeholder: 'Select livestock',
        },
        {
            name: 'eventDate' as keyof Disposal,
            label: 'Date',
            type: 'date',
            required: true,
        },
        {
            name: 'disposalTypeId' as keyof Disposal,
            label: 'Disposal Type',
            type: 'select',
            required: true,
            options: types,
            placeholder: 'Select type (Sold, Dead, etc.)',
        },
        {
            name: 'reasons' as keyof Disposal,
            label: 'Reasons',
            type: 'text',
            placeholder: 'Specific reason',
        },
        {
            name: 'remarks' as keyof Disposal,
            label: 'Remarks',
            type: 'textarea',
            placeholder: 'Comments',
        },
        {
            name: 'status' as keyof Disposal,
            label: 'Status',
            type: 'select',
            options: [
                { value: 'completed', label: 'Completed' },
                { value: 'pending', label: 'Pending' },
                { value: 'failed', label: 'Failed' },
            ],
            defaultValue: 'completed',
        },
    ];

    const detailFields = [
        { key: 'uuid' as keyof DisposalDisplay, label: 'UUID' },
        { key: 'livestockName' as keyof DisposalDisplay, label: 'Livestock' },
        { key: 'farmName' as keyof DisposalDisplay, label: 'Farm' },
        { key: 'eventDate' as keyof DisposalDisplay, label: 'Date', render: (val: unknown) => val ? formatDate(String(val)) : '-' },
        { key: 'typeName' as keyof DisposalDisplay, label: 'Type' },
        { key: 'reasons' as keyof DisposalDisplay, label: 'Reason' },
        { key: 'remarks' as keyof DisposalDisplay, label: 'Remarks' },
        { key: 'status' as keyof DisposalDisplay, label: 'Status' },
        { key: 'created_at' as keyof DisposalDisplay, label: 'Created At', render: (val: unknown) => formatDate(String(val)) },
    ];

    const handleCreate = async (item: Partial<Disposal>) => {
        await disposalApi.create(item as Disposal);
    };

    const handleUpdate = async (id: number | string, item: Partial<Disposal>) => {
        await disposalApi.update(Number(id), item as Disposal);
    };

    const handleDelete = async (id: number | string) => {
        await disposalApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Disposal Records"
            description="Track livestock exits (Sales, Death, etc.)"
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
            createLabel="Record Disposal"
            createModalSize="lg"
            editModalSize="lg"
        />
    );
}

export default DisposalsPage;
