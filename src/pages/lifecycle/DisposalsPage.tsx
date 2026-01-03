import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { disposalApi, livestockApi, disposalTypeApi } from '../../services/api';
import { Disposal, Livestock, DisposalType } from '../../types/entities';
import { formatDate } from '../../lib/utils';

// Extended type for display
interface DisposalDisplay extends Disposal {
    livestockName?: string;
    typeName?: string;
}

export function DisposalsPage() {
    const [data, setData] = useState<DisposalDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [livestock, setLivestock] = useState<SelectOption[]>([]);
    const [types, setTypes] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [disposalsData, livestockData, typesData] = await Promise.all([
                disposalApi.list(),
                livestockApi.list(),
                disposalTypeApi.list(),
            ]);

            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.id, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const typeMap = new Map(typesData.map((t: DisposalType) => [t.id, t.name]));

            const enrichedData = disposalsData.map((d: Disposal) => ({
                ...d,
                livestockName: d.livestockId ? livestockMap.get(d.livestockId) : '-',
                typeName: d.disposalTypeId ? typeMap.get(d.disposalTypeId) : '-',
            }));

            setData(enrichedData);

            setLivestock(livestockData.map((l: Livestock) => ({
                value: l.id,
                label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
            })));

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
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'livestockName', header: 'Livestock', accessorKey: 'livestockName' },
        {
            id: 'disposalDate',
            header: 'Date',
            accessorFn: (row) => formatDate(row.disposalDate),
        },
        { id: 'typeName', header: 'Type', accessorKey: 'typeName' },
        { id: 'reason', header: 'Reason', accessorKey: 'reason' },
        {
            id: 'salePrice',
            header: 'Price',
            accessorFn: (row) => row.salePrice ? `${row.salePrice.toLocaleString()}` : '-',
            size: 100
        },
    ];

    const formFields: FormField<Partial<Disposal>>[] = [
        {
            name: 'livestockId',
            label: 'Livestock',
            type: 'select',
            required: true,
            options: livestock,
            placeholder: 'Select livestock',
        },
        {
            name: 'disposalDate',
            label: 'Date',
            type: 'date',
            required: true,
        },
        {
            name: 'disposalTypeId',
            label: 'Disposal Type',
            type: 'select',
            required: true,
            options: types,
            placeholder: 'Select type (Sold, Dead, etc.)',
        },
        {
            name: 'reason',
            label: 'Reason',
            type: 'text',
            placeholder: 'Specific reason',
        },
        {
            name: 'salePrice',
            label: 'Sale Price (if sold)',
            type: 'number',
            min: 0,
        },
        {
            name: 'buyerName',
            label: 'Buyer Name',
            type: 'text',
        },
        {
            name: 'buyerContact',
            label: 'Buyer Contact',
            type: 'text',
        },
        {
            name: 'slaughterLocation',
            label: 'Slaughter Location',
            type: 'text',
        },
        {
            name: 'notes',
            label: 'Notes',
            type: 'textarea',
            placeholder: 'Comments',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof DisposalDisplay, label: 'ID' },
        { key: 'livestockName' as keyof DisposalDisplay, label: 'Livestock' },
        { key: 'disposalDate' as keyof DisposalDisplay, label: 'Date', render: (val: unknown) => formatDate(String(val)) },
        { key: 'typeName' as keyof DisposalDisplay, label: 'Type' },
        { key: 'reason' as keyof DisposalDisplay, label: 'Reason' },
        { key: 'salePrice' as keyof DisposalDisplay, label: 'Price' },
        { key: 'buyerName' as keyof DisposalDisplay, label: 'Buyer' },
        { key: 'buyerContact' as keyof DisposalDisplay, label: 'Buyer Contact' },
        { key: 'slaughterLocation' as keyof DisposalDisplay, label: 'Slaughter Loc' },
        { key: 'notes' as keyof DisposalDisplay, label: 'Notes' },
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
            formFields={formFields}
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
