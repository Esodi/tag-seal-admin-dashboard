import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { systemUserApi, locationApi } from '../../services/api';
import { SystemUser } from '../../types/entities';
import { formatDate } from '../../lib/utils';

export function SystemUsersPage() {
    const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [regions, setRegions] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [usersData, regionsData] = await Promise.all([
                systemUserApi.list({ role: 'systemUser' }),
                locationApi.regions.list(),
            ]);

            setSystemUsers(usersData);
            setRegions(regionsData.map(r => ({ value: r.id, label: r.name })));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load system users');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<SystemUser>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        {
            id: 'name',
            header: 'Name',
            accessorFn: (row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-',
        },
        { id: 'email', header: 'Email', accessorKey: 'email' },
        { id: 'phone', header: 'Phone', accessorKey: 'phone' },
        {
            id: 'accessLevel',
            header: 'Access Level',
            accessorKey: 'accessLevel',
            cell: ({ getValue }) => {
                const level = String(getValue());
                const levelColors: Record<string, string> = {
                    admin: 'badge-danger',
                    manager: 'badge-warning',
                    viewer: 'badge-info',
                };
                return (
                    <span className={`badge ${levelColors[level] || 'badge-secondary'}`}>
                        {level}
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

    const formFields: FormField<Partial<SystemUser>>[] = [
        {
            name: 'firstName',
            label: 'First Name',
            type: 'text',
            required: true,
            placeholder: 'Enter first name',
        },
        {
            name: 'lastName',
            label: 'Last Name',
            type: 'text',
            required: true,
            placeholder: 'Enter last name',
        },
        {
            name: 'email',
            label: 'Email',
            type: 'email',
            required: true,
            placeholder: 'admin@example.com',
        },
        {
            name: 'phone',
            label: 'Phone',
            type: 'tel',
            placeholder: '+255 XXX XXX XXX',
        },
        {
            name: 'accessLevel',
            label: 'Access Level',
            type: 'select',
            required: true,
            options: [
                { value: 'admin', label: 'Administrator' },
                { value: 'manager', label: 'Manager' },
                { value: 'viewer', label: 'Viewer' },
            ],
        },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'active', label: 'Active' },
                { value: 'notActive', label: 'Inactive' },
            ],
            defaultValue: 'active',
        },
        {
            name: 'regionId',
            label: 'Assigned Region',
            type: 'select',
            options: regions,
            placeholder: 'Select region (optional)',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof SystemUser, label: 'ID' },
        {
            key: 'name' as const,
            label: 'Full Name',
            render: (_: unknown, data: SystemUser) => `${data.firstName || ''} ${data.lastName || ''}`.trim() || '-',
        },
        { key: 'email' as keyof SystemUser, label: 'Email' },
        { key: 'phone' as keyof SystemUser, label: 'Phone' },
        { key: 'accessLevel' as keyof SystemUser, label: 'Access Level' },
        { key: 'status' as keyof SystemUser, label: 'Status' },
        {
            key: 'created_at' as keyof SystemUser,
            label: 'Created',
            render: (value: unknown) => value ? formatDate(String(value)) : '-',
        },
    ];

    const handleCreate = async (data: Partial<SystemUser>) => {
        await systemUserApi.create(data as SystemUser);
    };

    const handleUpdate = async (id: number | string, data: Partial<SystemUser>) => {
        await systemUserApi.update(Number(id), data as SystemUser);
    };

    const handleDelete = async (id: number | string) => {
        await systemUserApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="System Users"
            description={`Admin panel users - ${systemUsers.length} records`}
            data={systemUsers}
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
            createLabel="Add System User"
            createModalSize="lg"
            editModalSize="lg"
        />
    );
}

export default SystemUsersPage;
