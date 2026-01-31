import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { dryoffApi, livestockApi, farmApi } from '../../services/api';
import { Dryoff, Livestock, Farm } from '../../types/entities';
import { formatDate } from '../../lib/utils';

// Extended type for display
interface DryoffDisplay extends Dryoff {
    livestockName?: string;
    farmName?: string;
}

export function DryoffsPage() {
    const [data, setData] = useState<DryoffDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [livestock, setLivestock] = useState<SelectOption[]>([]);
    const [farms, setFarms] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [dryoffsData, livestockData, farmsData] = await Promise.all([
                dryoffApi.list(),
                livestockApi.list(),
                farmApi.list(),
            ]);

            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.uuid, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const farmMap = new Map(farmsData.map((f: Farm) => [f.uuid, f.name]));

            const enrichedData = dryoffsData.map((d: Dryoff) => ({
                ...d,
                livestockName: d.livestockUuid ? livestockMap.get(d.livestockUuid) : '-',
                farmName: d.farmUuid ? farmMap.get(d.farmUuid) : '-',
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
        { id: 'uuid', header: 'UUID', accessorKey: 'uuid', size: 100 },
        { id: 'livestockName', header: 'Cow', accessorKey: 'livestockName' },
        { id: 'farmName', header: 'Farm', accessorKey: 'farmName' },
        {
            id: 'eventDate',
            header: 'Dryoff Date',
            accessorFn: (row) => row.eventDate ? formatDate(row.eventDate) : (row.created_at ? formatDate(row.created_at) : '-'),
        },
        {
            id: 'expectedCalvingDate',
            header: 'Expected Calving',
            accessorFn: (row) => row.expectedCalvingDate ? formatDate(row.expectedCalvingDate) : '-',
        },
        { id: 'reason', header: 'Reason', accessorKey: 'reason' },
    ];

    const formFields: FormField<Dryoff>[] = [
        {
            name: 'farmUuid' as keyof Dryoff,
            label: 'Farm',
            type: 'select',
            required: true,
            options: farms,
            placeholder: 'Select farm',
        },
        {
            name: 'livestockUuid' as keyof Dryoff,
            label: 'Cow',
            type: 'select',
            required: true,
            options: livestock,
            placeholder: 'Select cow',
        },
        {
            name: 'eventDate' as keyof Dryoff,
            label: 'Dryoff Date',
            type: 'date',
            required: true,
        },
        {
            name: 'expectedCalvingDate' as keyof Dryoff,
            label: 'Expected Calving Date',
            type: 'date',
        },
        {
            name: 'reason' as keyof Dryoff,
            label: 'Reason',
            type: 'text',
            placeholder: 'e.g. End of lactation, Health issue',
        },
        {
            name: 'remarks' as keyof Dryoff,
            label: 'Remarks',
            type: 'textarea',
            placeholder: 'Comments',
        },
    ];

    const detailFields = [
        { key: 'uuid' as keyof DryoffDisplay, label: 'UUID' },
        { key: 'livestockName' as keyof DryoffDisplay, label: 'Cow' },
        { key: 'farmName' as keyof DryoffDisplay, label: 'Farm' },
        { key: 'eventDate' as keyof DryoffDisplay, label: 'Dryoff Date', render: (val: unknown) => val ? formatDate(String(val)) : '-' },
        { key: 'expectedCalvingDate' as keyof DryoffDisplay, label: 'Expected Calving', render: (val: unknown) => val ? formatDate(String(val)) : '-' },
        { key: 'reason' as keyof DryoffDisplay, label: 'Reason' },
        { key: 'remarks' as keyof DryoffDisplay, label: 'Remarks' },
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
            formFields={formFields as any}
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
