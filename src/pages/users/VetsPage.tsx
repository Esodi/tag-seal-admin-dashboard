import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { vetApi } from '../../services/api';
import { Vet } from '../../types/entities';
import { formatDate } from '../../lib/utils';

export function VetsPage() {
    const [vets, setVets] = useState<Vet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const vetsData = await vetApi.list();
            setVets(vetsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load veterinarians');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<Vet>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'vetNo', header: 'Vet No', accessorKey: 'vetNo' as keyof Vet },
        {
            id: 'name',
            header: 'Name',
            accessorFn: (row) => `${row.firstName || ''} ${row.middleName || ''} ${row.lastName || ''}`.trim() || '-',
        },
        { id: 'phone', header: 'Phone', accessorKey: 'phone' },
        { id: 'licenseNo', header: 'License No', accessorKey: 'licenseNo' },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ getValue }) => {
                const status = String(getValue()).toLowerCase();
                return (
                    <span className={`badge ${status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {status}
                    </span>
                );
            },
        },
    ];

    const formFields: FormField<Partial<Vet>>[] = [
        {
            name: 'vetNo' as keyof Vet,
            label: 'Vet Number',
            type: 'text',
            placeholder: 'Auto-generated if empty',
        },
        {
            name: 'licenseNo',
            label: 'License Number',
            type: 'text',
            required: true,
            placeholder: 'Professional license number',
        },
        {
            name: 'firstName',
            label: 'First Name',
            type: 'text',
            required: true,
            placeholder: 'Enter first name',
        },
        {
            name: 'middleName',
            label: 'Middle Name',
            type: 'text',
            placeholder: 'Enter middle name',
        },
        {
            name: 'lastName',
            label: 'Last Name',
            type: 'text',
            required: true,
            placeholder: 'Enter last name',
        },
        {
            name: 'phone',
            label: 'Phone',
            type: 'tel',
            required: true,
            placeholder: '+255 XXX XXX XXX',
        },
        {
            name: 'email',
            label: 'Email',
            type: 'email',
            placeholder: 'vet@example.com',
        },
        {
            name: 'specialization',
            label: 'Specialization',
            type: 'text',
            placeholder: 'e.g., Large Animals, Small Animals',
        },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
            ],
            defaultValue: 'active',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof Vet, label: 'ID' },
        { key: 'vetNo' as keyof Vet, label: 'Vet Number' },
        { key: 'licenseNo' as keyof Vet, label: 'License Number' },
        {
            key: 'name' as const,
            label: 'Full Name',
            render: (_: unknown, data: Vet) =>
                `${data.firstName || ''} ${data.middleName || ''} ${data.lastName || ''}`.trim() || '-',
        },
        { key: 'phone' as keyof Vet, label: 'Phone' },
        { key: 'email' as keyof Vet, label: 'Email' },
        { key: 'specialization' as keyof Vet, label: 'Specialization' },
        { key: 'status' as keyof Vet, label: 'Status' },
        {
            key: 'created_at' as keyof Vet,
            label: 'Created',
            render: (value: unknown) => value ? formatDate(String(value)) : '-',
        },
    ];

    const handleCreate = async (data: Partial<Vet>) => {
        await vetApi.create(data as Vet);
    };

    const handleUpdate = async (id: number | string, data: Partial<Vet>) => {
        await vetApi.update(Number(id), data as Vet);
    };

    const handleDelete = async (id: number | string) => {
        await vetApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Veterinarians"
            description={`Registered vets - ${vets.length} records`}
            data={vets}
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
            createLabel="Add Veterinarian"
            createModalSize="lg"
            editModalSize="lg"
        />
    );
}

export default VetsPage;
