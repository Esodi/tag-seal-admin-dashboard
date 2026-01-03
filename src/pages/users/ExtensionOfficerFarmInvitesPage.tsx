import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { extensionOfficerFarmInviteApi, extensionOfficerApi, farmApi } from '../../services/api';
import { ExtensionOfficerFarmInvite, ExtensionOfficer, Farm } from '../../types/entities';
import { formatDate } from '../../lib/utils';

interface ExtensionOfficerFarmInviteDisplay extends ExtensionOfficerFarmInvite {
    officerName?: string;
    farmName?: string;
}

export function ExtensionOfficerFarmInvitesPage() {
    const [invites, setInvites] = useState<ExtensionOfficerFarmInviteDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [officers, setOfficers] = useState<SelectOption[]>([]);
    const [farms, setFarms] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [invitesData, officersData, farmsData] = await Promise.all([
                extensionOfficerFarmInviteApi.list(),
                extensionOfficerApi.list(),
                farmApi.list(),
            ]);

            const officerMap = new Map(officersData.map((o: ExtensionOfficer) => [o.id, `${o.firstName} ${o.lastName}`]));
            const farmMap = new Map(farmsData.map((f: Farm) => [f.id, f.name]));

            const enrichedData = invitesData.map((i: ExtensionOfficerFarmInvite) => ({
                ...i,
                officerName: officerMap.get(i.extensionOfficerId) || 'Unknown Officer',
                // Note: ExtensionOfficerFarmInvite uses farmId, but the property might be misnamed in local type if it was copied from backend differently. 
                // Based on type def, it is farmId?: number.
                farmName: i.farmId ? farmMap.get(i.farmId) : 'Unknown Farm',
            }));

            setInvites(enrichedData);
            setOfficers(officersData.map((o: ExtensionOfficer) => ({
                value: o.id,
                label: `${o.firstName} ${o.lastName} (${o.officerNo || '-'})`
            })));
            setFarms(farmsData.map((f: Farm) => ({
                value: f.id,
                label: `${f.name} (${f.referenceNo || f.uuid.slice(0, 8)})`
            })));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load invites');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<ExtensionOfficerFarmInviteDisplay>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'officerName', header: 'Officer', accessorKey: 'officerName' },
        { id: 'farmName', header: 'Farm', accessorKey: 'farmName' },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ getValue }) => {
                const status = String(getValue()).toLowerCase();
                const colors: Record<string, string> = {
                    pending: 'badge-warning',
                    accepted: 'badge-success',
                    rejected: 'badge-danger',
                };
                return (
                    <span className={`badge ${colors[status] || 'badge-secondary'}`}>
                        {status}
                    </span>
                );
            },
        },
        {
            id: 'date',
            header: 'Date',
            accessorFn: (row) => formatDate(row.created_at || ''),
        },
    ];

    const formFields: FormField<Partial<ExtensionOfficerFarmInvite>>[] = [
        {
            name: 'extensionOfficerId',
            label: 'Extension Officer',
            type: 'select',
            required: true,
            options: officers,
            placeholder: 'Select officer',
        },
        {
            name: 'farmId',
            label: 'Farm',
            type: 'select',
            required: true,
            options: farms,
            placeholder: 'Select farm',
        },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'pending', label: 'Pending' },
                { value: 'accepted', label: 'Accepted' },
                { value: 'rejected', label: 'Rejected' },
            ],
            defaultValue: 'pending',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof ExtensionOfficerFarmInvite, label: 'ID' },
        { key: 'officerName' as keyof ExtensionOfficerFarmInviteDisplay, label: 'Officer' },
        { key: 'farmName' as keyof ExtensionOfficerFarmInviteDisplay, label: 'Farm' },
        { key: 'status' as keyof ExtensionOfficerFarmInvite, label: 'Status' },
        {
            key: 'created_at' as keyof ExtensionOfficerFarmInviteDisplay,
            label: 'Created At',
            render: (value: unknown) => value ? formatDate(String(value)) : '-',
        },
    ];

    const handleCreate = async (data: Partial<ExtensionOfficerFarmInvite>) => {
        await extensionOfficerFarmInviteApi.create(data as ExtensionOfficerFarmInvite);
    };

    const handleUpdate = async (id: number | string, data: Partial<ExtensionOfficerFarmInvite>) => {
        await extensionOfficerFarmInviteApi.update(Number(id), data as ExtensionOfficerFarmInvite);
    };

    const handleDelete = async (id: number | string) => {
        await extensionOfficerFarmInviteApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Farm Invites"
            description={`Extension officer invites to farms - ${invites.length} records`}
            data={invites}
            loading={loading}
            error={error}
            columns={columns}
            formFields={formFields}
            detailFields={detailFields}
            formColumns={1}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onRefresh={fetchData}
            createLabel="Create Invite"
            createModalSize="md"
            editModalSize="md"
        />
    );
}

export default ExtensionOfficerFarmInvitesPage;
