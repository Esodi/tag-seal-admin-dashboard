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

            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.id, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const farmMap = new Map(farmsData.map((f: Farm) => [f.id, f.name]));
            const farmUuidMap = new Map(farmsData.map((f: Farm) => [f.uuid, f.name]));

            const enrichedData = transfersData.map((t: Transfer) => ({
                ...t,
                livestockName: t.livestockId ? livestockMap.get(t.livestockId) : '-',
                sourceFarmName: (t.sourceFarmId ? farmMap.get(t.sourceFarmId) : undefined) || (t.sourceFarmUuid ? farmUuidMap.get(t.sourceFarmUuid) : '-'),
                destinationFarmName: (t.destinationFarmId ? farmMap.get(t.destinationFarmId) : undefined) || (t.destinationFarmUuid ? farmUuidMap.get(t.destinationFarmUuid) : '-'),
            }));

            setData(enrichedData);

            setLivestock(livestockData.map((l: Livestock) => ({
                value: l.id,
                label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
            })));

            setFarms(farmsData.map((f: Farm) => ({
                value: f.uuid, // Using UUID for transfers as per typical requirements
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
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'livestockName', header: 'Livestock', accessorKey: 'livestockName' },
        {
            id: 'transferDate',
            header: 'Date',
            accessorFn: (row) => formatDate(row.transferDate),
        },
        { id: 'sourceFarmName', header: 'From', accessorKey: 'sourceFarmName' },
        { id: 'destinationFarmName', header: 'To', accessorKey: 'destinationFarmName' },
        { id: 'reason', header: 'Reason', accessorKey: 'reason' },
    ];

    const formFields: FormField<Partial<Transfer>>[] = [
        {
            name: 'livestockId',
            label: 'Livestock',
            type: 'select',
            required: true,
            options: livestock,
            placeholder: 'Select livestock',
        },
        {
            name: 'transferDate',
            label: 'Date',
            type: 'date',
            required: true,
        },
        {
            name: 'sourceFarmUuid',
            label: 'Source Farm',
            type: 'select',
            options: farms,
            placeholder: 'Select source farm',
        },
        {
            name: 'destinationFarmUuid',
            label: 'Destination Farm',
            type: 'select',
            required: true,
            options: farms,
            placeholder: 'Select destination farm',
        },
        {
            name: 'reason',
            label: 'Reason',
            type: 'text',
            placeholder: 'Reason for transfer',
        },
        {
            name: 'transportMethod',
            label: 'Transport Method',
            type: 'text',
            placeholder: 'e.g. Truck, Walking',
        },
        {
            name: 'notes',
            label: 'Notes',
            type: 'textarea',
            placeholder: 'Comments',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof TransferDisplay, label: 'ID' },
        { key: 'livestockName' as keyof TransferDisplay, label: 'Livestock' },
        { key: 'transferDate' as keyof TransferDisplay, label: 'Date', render: (val: unknown) => formatDate(String(val)) },
        { key: 'sourceFarmName' as keyof TransferDisplay, label: 'From' },
        { key: 'destinationFarmName' as keyof TransferDisplay, label: 'To' },
        { key: 'reason' as keyof TransferDisplay, label: 'Reason' },
        { key: 'transportMethod' as keyof TransferDisplay, label: 'Transport' },
        { key: 'notes' as keyof TransferDisplay, label: 'Notes' },
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
            formFields={formFields}
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
