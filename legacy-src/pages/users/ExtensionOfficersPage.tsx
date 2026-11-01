import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { extensionOfficerApi, locationApi } from '../../services/api';
import { ExtensionOfficer, Region, District } from '../../types/entities';
import { formatDate } from '../../lib/utils';

export function ExtensionOfficersPage() {
    const [officers, setOfficers] = useState<ExtensionOfficer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [countries, setCountries] = useState<SelectOption[]>([]);
    const [regions, setRegions] = useState<SelectOption[]>([]);
    const [districts, setDistricts] = useState<SelectOption[]>([]);
    const [regionsMap, setRegionsMap] = useState<Map<number, string>>(new Map());
    const [districtsMap, setDistrictsMap] = useState<Map<number, string>>(new Map());

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [officersData, regionsData, districtsData, countriesData] = await Promise.all([
                extensionOfficerApi.list(),
                locationApi.regions.list(),
                locationApi.districts.list(),
                locationApi.countries.list(),
            ]);

            setOfficers(officersData);
            setCountries(countriesData.map((c: any) => ({ value: c.id, label: c.name })));
            setRegions(regionsData.map((r: Region) => ({ value: r.id, label: r.name })));
            setDistricts(districtsData.map((d: District) => ({ value: d.id, label: d.name })));
            setRegionsMap(new Map(regionsData.map((r: Region) => [r.id, r.name])));
            setDistrictsMap(new Map(districtsData.map((d: District) => [d.id, d.name])));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load extension officers');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<ExtensionOfficer>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'officerNo', header: 'Officer No', accessorKey: 'officerNo' },
        {
            id: 'name',
            header: 'Name',
            accessorFn: (row) => `${row.firstName || ''} ${row.middleName || ''} ${row.lastName || ''}`.trim() || '-',
        },
        { id: 'phone', header: 'Phone', accessorKey: 'phone' },
        {
            id: 'region',
            header: 'Region',
            accessorFn: (row) => regionsMap.get(row.regionId || 0) || '-',
        },
        {
            id: 'district',
            header: 'District',
            accessorFn: (row) => districtsMap.get(row.districtId || 0) || '-',
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

    const formFields: FormField<Partial<ExtensionOfficer>>[] = [
        {
            name: 'officerNo',
            label: 'Officer Number',
            type: 'text',
            placeholder: 'Auto-generated if empty',
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
            name: 'gender',
            label: 'Gender',
            type: 'select',
            required: true,
            options: [
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
            ],
        },
        {
            name: 'password',
            label: 'Password',
            type: 'password',
            required: true,
            placeholder: 'Min 6 characters',
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
            placeholder: 'officer@example.com',
        },
        {
            name: 'countryId',
            label: 'Country',
            type: 'select',
            required: true,
            options: countries,
            placeholder: 'Select country',
        },
        {
            name: 'regionId',
            label: 'Assigned Region',
            type: 'select',
            required: true,
            options: regions,
            placeholder: 'Select region',
        },
        {
            name: 'districtId',
            label: 'Assigned District',
            type: 'select',
            options: districts,
            placeholder: 'Select district',
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
    ];

    const detailFields = [
        { key: 'id' as keyof ExtensionOfficer, label: 'ID' },
        { key: 'officerNo' as keyof ExtensionOfficer, label: 'Officer Number' },
        {
            key: 'name' as const,
            label: 'Full Name',
            render: (_: unknown, data: ExtensionOfficer) =>
                `${data.firstName || ''} ${data.middleName || ''} ${data.lastName || ''}`.trim() || '-',
        },
        { key: 'phone' as keyof ExtensionOfficer, label: 'Phone' },
        { key: 'email' as keyof ExtensionOfficer, label: 'Email' },
        {
            key: 'regionId' as keyof ExtensionOfficer,
            label: 'Region',
            render: (value: unknown) => regionsMap.get(Number(value)) || '-',
        },
        {
            key: 'districtId' as keyof ExtensionOfficer,
            label: 'District',
            render: (value: unknown) => districtsMap.get(Number(value)) || '-',
        },
        { key: 'status' as keyof ExtensionOfficer, label: 'Status' },
        {
            key: 'created_at' as keyof ExtensionOfficer,
            label: 'Created',
            render: (value: unknown) => value ? formatDate(String(value)) : '-',
        },
    ];

    const handleCreate = async (data: Partial<ExtensionOfficer>) => {
        await extensionOfficerApi.create(data as ExtensionOfficer);
    };

    const handleUpdate = async (id: number | string, data: Partial<ExtensionOfficer>) => {
        await extensionOfficerApi.update(Number(id), data as ExtensionOfficer);
    };

    const handleDelete = async (id: number | string) => {
        await extensionOfficerApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Extension Officers"
            description={`Field officers - ${officers.length} records`}
            data={officers}
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
            createLabel="Add Extension Officer"
            createModalSize="lg"
            editModalSize="lg"
        />
    );
}

export default ExtensionOfficersPage;
