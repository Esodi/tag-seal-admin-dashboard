import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { userApi, locationApi } from '../../services/api';
import { User } from '../../types/entities';
import { formatDate } from '../../lib/utils';

export function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [regions, setRegions] = useState<SelectOption[]>([]);
    const [regionsMap, setRegionsMap] = useState<Map<number, string>>(new Map());

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [usersData, regionsData] = await Promise.all([
                userApi.list(),
                locationApi.regions.list(),
            ]);

            setUsers(usersData);
            setRegions(regionsData.map(r => ({ value: r.id, label: r.name })));
            setRegionsMap(new Map(regionsData.map(r => [r.id, r.name])));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<User>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'username', header: 'Username', accessorKey: 'username' },
        { id: 'email', header: 'Email', accessorKey: 'email' },
        { id: 'phone', header: 'Phone', accessorKey: 'phone' },
        {
            id: 'role',
            header: 'Role',
            accessorKey: 'role',
            cell: ({ getValue }) => {
                const role = String(getValue());
                const roleColors: Record<string, string> = {
                    systemUser: 'badge-info',
                    extensionOfficer: 'badge-success',
                    farmer: 'badge-warning',
                    vet: 'badge-secondary',
                };
                return (
                    <span className={`badge ${roleColors[role] || 'badge-secondary'}`}>
                        {role}
                    </span>
                );
            },
        },
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

    const formFields: FormField<Partial<User>>[] = [
        {
            name: 'username',
            label: 'Username',
            type: 'text',
            required: true,
            placeholder: 'Enter username',
        },
        {
            name: 'email',
            label: 'Email',
            type: 'email',
            required: true,
            placeholder: 'user@example.com',
        },
        {
            name: 'phone',
            label: 'Phone',
            type: 'tel',
            placeholder: '+255 XXX XXX XXX',
        },
        {
            name: 'password',
            label: 'Password',
            type: 'password',
            required: true,
            placeholder: 'Enter password',
            helpText: 'Minimum 8 characters',
        },
        {
            name: 'role',
            label: 'Role',
            type: 'select',
            required: true,
            options: [
                { value: 'systemUser', label: 'System User' },
                { value: 'extensionOfficer', label: 'Extension Officer' },
                { value: 'farmer', label: 'Farmer' },
                { value: 'vet', label: 'Veterinarian' },
            ],
        },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' },
            ],
            defaultValue: 'active',
        },
        {
            name: 'regionId',
            label: 'Region',
            type: 'select',
            options: regions,
            placeholder: 'Select region (optional)',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof User, label: 'ID' },
        { key: 'uuid' as keyof User, label: 'UUID' },
        { key: 'username' as keyof User, label: 'Username' },
        { key: 'email' as keyof User, label: 'Email' },
        { key: 'phone' as keyof User, label: 'Phone' },
        { key: 'role' as keyof User, label: 'Role' },
        { key: 'status' as keyof User, label: 'Status' },
        {
            key: 'regionId' as keyof User,
            label: 'Region',
            render: (value: unknown) => regionsMap.get(Number(value)) || '-',
        },
        {
            key: 'created_at' as keyof User,
            label: 'Created',
            render: (value: unknown) => value ? formatDate(String(value)) : '-',
        },
    ];

    const handleCreate = async (data: Partial<User>) => {
        await userApi.create(data as User);
    };

    const handleUpdate = async (id: number | string, data: Partial<User>) => {
        await userApi.update(Number(id), data as User);
    };

    const handleDelete = async (id: number | string) => {
        await userApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Users"
            description={`All system users - ${users.length} records`}
            data={users}
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
            createLabel="Add User"
            createModalSize="lg"
            editModalSize="lg"
        />
    );
}

export default UsersPage;
