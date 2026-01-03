import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { farmUserApi, farmApi, userApi } from '../../services/api';
import { FarmUser, Farm, User } from '../../types/entities';
import { formatDate } from '../../lib/utils';

interface FarmUserDisplay extends FarmUser {
    farmName?: string;
    userName?: string;
}

export function FarmUsersPage() {
    const [farmUsers, setFarmUsers] = useState<FarmUserDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [farms, setFarms] = useState<SelectOption[]>([]);
    const [users, setUsers] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [farmUsersData, farmsData, usersData] = await Promise.all([
                farmUserApi.list(),
                farmApi.list(),
                userApi.list(),
            ]);

            // Build lookup maps
            const farmMap = new Map(farmsData.map((f: Farm) => [f.id, f.name]));
            const userMap = new Map(usersData.map((u: User) => [u.id, u.username]));

            // Enrich farm users with names
            const enrichedData = farmUsersData.map((fu: FarmUser) => ({
                ...fu,
                farmName: farmMap.get(fu.farmId) || 'Unknown Farm',
                userName: userMap.get(fu.userId) || 'Unknown User',
            }));

            setFarmUsers(enrichedData);
            setFarms(farmsData.map((f: Farm) => ({ value: f.id, label: `${f.name} (${f.referenceNo || f.uuid.slice(0, 8)})` })));
            setUsers(usersData.map((u: User) => ({ value: u.id, label: `${u.username} (${u.email || ''})` })));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load farm users');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<FarmUserDisplay>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'farmName', header: 'Farm', accessorKey: 'farmName' },
        { id: 'userName', header: 'User', accessorKey: 'userName' },
        {
            id: 'role',
            header: 'Role',
            accessorKey: 'role',
            cell: ({ getValue }) => {
                const role = String(getValue());
                const roleColors: Record<string, string> = {
                    owner: 'badge-success',
                    manager: 'badge-warning',
                    worker: 'badge-info',
                    viewer: 'badge-secondary',
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

    const formFields: FormField<Partial<FarmUser>>[] = [
        {
            name: 'farmId',
            label: 'Farm',
            type: 'select',
            required: true,
            options: farms,
            placeholder: 'Select farm',
        },
        {
            name: 'userId',
            label: 'User',
            type: 'select',
            required: true,
            options: users,
            placeholder: 'Select user',
        },
        {
            name: 'role',
            label: 'Role',
            type: 'select',
            required: true,
            options: [
                { value: 'owner', label: 'Owner' },
                { value: 'manager', label: 'Manager' },
                { value: 'worker', label: 'Worker' },
                { value: 'viewer', label: 'Viewer' },
            ],
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
        { key: 'id' as keyof FarmUserDisplay, label: 'ID' },
        { key: 'farmName' as keyof FarmUserDisplay, label: 'Farm' },
        { key: 'userName' as keyof FarmUserDisplay, label: 'User' },
        { key: 'role' as keyof FarmUserDisplay, label: 'Role' },
        { key: 'status' as keyof FarmUserDisplay, label: 'Status' },
        {
            key: 'created_at' as keyof FarmUserDisplay,
            label: 'Assigned',
            render: (value: unknown) => value ? formatDate(String(value)) : '-',
        },
    ];

    const handleCreate = async (data: Partial<FarmUser>) => {
        await farmUserApi.create(data as FarmUser);
    };

    const handleUpdate = async (id: number | string, data: Partial<FarmUser>) => {
        await farmUserApi.update(Number(id), data as FarmUser);
    };

    const handleDelete = async (id: number | string) => {
        await farmUserApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Farm Users"
            description={`User-Farm assignments - ${farmUsers.length} records`}
            data={farmUsers}
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
            createLabel="Assign User to Farm"
            createModalSize="md"
            editModalSize="md"
        />
    );
}

export default FarmUsersPage;
