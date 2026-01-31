import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { transferApi, livestockApi, farmApi } from '../../services/api';
import { Transfer, Livestock, Farm } from '../../types/entities';
import { formatDate } from '../../lib/utils';

// Extended type for display
interface TransferDisplay extends Transfer {
    livestockName?: string;
    sourceFarmName?: string;
    destinationFarmName?: string;
}

export function TransfersPage() {
    const [data, setData] = useState<TransferDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [livestock, setLivestock] = useState<SelectOption[]>([]);
    const [farms, setFarms] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [transfersData, livestockData, farmsData] = await Promise.all([
                transferApi.list(),
                livestockApi.list(),
                farmApi.list(),
            ]);

            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.uuid, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const farmMap = new Map(farmsData.map((f: Farm) => [f.uuid, f.name]));

            const enrichedData = transfersData.map((t: Transfer) => ({
                ...t,
                livestockName: t.livestockUuid ? livestockMap.get(t.livestockUuid) : '-',
                sourceFarmName: t.farmUuid ? farmMap.get(t.farmUuid) : '-',
                destinationFarmName: t.toFarmUuid ? farmMap.get(t.toFarmUuid) : '-',
            }));

            setData(enrichedData);

            setLivestock(livestockData.map((l: Livestock) => ({
                value: l.uuid,
                label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
            })));

            setFarms(farmsData.map((f: Farm) => ({
                value: f.uuid,
                label: f.name
            })));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load transfer records');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<TransferDisplay>[] = [
        { id: 'uuid', header: 'UUID', accessorKey: 'uuid', size: 100 },
        { id: 'livestockName', header: 'Livestock', accessorKey: 'livestockName' },
        {
            id: 'transferDate',
            header: 'Transfer Date',
            accessorFn: (row) => row.transferDate ? formatDate(row.transferDate) : '-',
        },
        { id: 'sourceFarmName', header: 'From', accessorKey: 'sourceFarmName' },
        { id: 'destinationFarmName', header: 'To', accessorKey: 'destinationFarmName' },
        { id: 'status', header: 'Status', accessorKey: 'status' },
    ];

    const formFields: FormField<Transfer>[] = [
        {
            name: 'farmUuid' as keyof Transfer,
            label: 'Source Farm',
            type: 'select',
            required: true,
            options: farms,
            placeholder: 'Select source farm',
        },
        {
            name: 'livestockUuid' as keyof Transfer,
            label: 'Livestock',
            type: 'select',
            required: true,
            options: livestock,
            placeholder: 'Select livestock',
        },
        {
            name: 'toFarmUuid' as keyof Transfer,
            label: 'Destination Farm',
            type: 'select',
            required: true,
            options: farms,
            placeholder: 'Select destination farm',
        },
        {
            name: 'transferDate' as keyof Transfer,
            label: 'Transfer Date',
            type: 'date',
            required: true,
        },
        {
            name: 'eventDate' as keyof Transfer,
            label: 'Event Date (Metadata)',
            type: 'date',
            required: true,
        },
        {
            name: 'transporterId' as keyof Transfer,
            label: 'Transporter ID/Name',
            type: 'text',
        },
        {
            name: 'price' as keyof Transfer,
            label: 'Price',
            type: 'number',
        },
        {
            name: 'reason' as keyof Transfer,
            label: 'Reason',
            type: 'text',
            placeholder: 'Reason for transfer',
        },
        {
            name: 'status' as keyof Transfer,
            label: 'Status',
            type: 'select',
            options: [
                { value: 'active', label: 'Active' },
                { value: 'pending', label: 'Pending' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
            ],
            defaultValue: 'active',
        },
        {
            name: 'remarks' as keyof Transfer,
            label: 'Remarks',
            type: 'textarea',
            placeholder: 'Comments',
        },
    ];

    const detailFields = [
        { key: 'uuid' as keyof TransferDisplay, label: 'UUID' },
        { key: 'livestockName' as keyof TransferDisplay, label: 'Livestock' },
        { key: 'transferDate' as keyof TransferDisplay, label: 'Transfer Date', render: (val: unknown) => val ? formatDate(String(val)) : '-' },
        { key: 'sourceFarmName' as keyof TransferDisplay, label: 'From' },
        { key: 'destinationFarmName' as keyof TransferDisplay, label: 'To' },
        { key: 'transporterId' as keyof TransferDisplay, label: 'Transporter' },
        { key: 'price' as keyof TransferDisplay, label: 'Price' },
        { key: 'reason' as keyof TransferDisplay, label: 'Reason' },
        { key: 'status' as keyof TransferDisplay, label: 'Status' },
        { key: 'remarks' as keyof TransferDisplay, label: 'Remarks' },
        { key: 'created_at' as keyof TransferDisplay, label: 'Created At', render: (val: unknown) => formatDate(String(val)) },
    ];

    const handleCreate = async (item: Partial<Transfer>) => {
        await transferApi.create(item as Transfer);
    };

    const handleUpdate = async (id: number | string, item: Partial<Transfer>) => {
        await transferApi.update(Number(id), item as Transfer);
    };

    const handleDelete = async (id: number | string) => {
        await transferApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Livestock Transfers"
            description="Track movement of livestock between farms"
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
            createLabel="Record Transfer"
            createModalSize="lg"
            editModalSize="lg"
        />
    );
}

export default TransfersPage;
