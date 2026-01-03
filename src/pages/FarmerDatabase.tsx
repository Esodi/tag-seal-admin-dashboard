import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../components/crud';
import { farmerApi, locationApi, referenceApi } from '../services/api';
import { Farmer } from '../types/entities';
import { formatDate } from '../lib/utils';

export function FarmerDatabase() {
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    // Reference data for dropdowns
    const [countries, setCountries] = useState<SelectOption[]>([]);
    const [regions, setRegions] = useState<SelectOption[]>([]);
    const [districts, setDistricts] = useState<SelectOption[]>([]);
    const [wards] = useState<SelectOption[]>([]);
    const [villages] = useState<SelectOption[]>([]);
    const [identityCardTypes, setIdentityCardTypes] = useState<SelectOption[]>([]);
    const [schoolLevels, setSchoolLevels] = useState<SelectOption[]>([]);

    // For displaying names in table
    const [regionsMap, setRegionsMap] = useState<Map<number, string>>(new Map());
    const [districtsMap, setDistrictsMap] = useState<Map<number, string>>(new Map());

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [farmersData, countriesData, regionsData, districtsData, idTypesData, schoolLevelsData] = await Promise.all([
                farmerApi.list(),
                locationApi.countries.list(),
                locationApi.regions.list(),
                locationApi.districts.list(),
                referenceApi.identityCardTypes.list(),
                referenceApi.schoolLevels.list(),
            ]);

            setFarmers(farmersData);
            setCountries(countriesData.map(c => ({ value: c.id, label: c.name })));
            setRegions(regionsData.map(r => ({ value: r.id, label: r.name })));
            setDistricts(districtsData.map(d => ({ value: d.id, label: d.name })));
            setIdentityCardTypes(idTypesData.map(t => ({ value: t.id, label: t.name })));
            setSchoolLevels(schoolLevelsData.map(l => ({ value: l.id, label: l.name })));

            // Build lookup maps
            setRegionsMap(new Map(regionsData.map(r => [r.id, r.name])));
            setDistrictsMap(new Map(districtsData.map(d => [d.id, d.name])));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load farmers');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<Farmer>[] = [
        { id: 'farmerNo', header: 'Farmer ID', accessorKey: 'farmerNo', size: 120 },
        {
            id: 'name',
            header: 'Name',
            accessorFn: (row) => `${row.firstName} ${row.middleName || ''} ${row.surname}`.trim(),
        },
        { id: 'phone1', header: 'Phone', accessorKey: 'phone1' },
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
            id: 'gender',
            header: 'Gender',
            accessorKey: 'gender',
            cell: ({ getValue }) => {
                const gender = getValue() as string;
                return (
                    <span className={`badge ${gender === 'male' ? 'badge-info' : 'badge-warning'}`}>
                        {gender}
                    </span>
                );
            },
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ getValue }) => {
                const status = getValue() as string;
                return (
                    <span className={`badge ${status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                        {status}
                    </span>
                );
            },
        },
    ];

    const formFields: FormField<Partial<Farmer>>[] = [
        // Personal Information
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
            placeholder: 'Enter middle name (optional)',
        },
        {
            name: 'surname',
            label: 'Surname',
            type: 'text',
            required: true,
            placeholder: 'Enter surname',
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
            name: 'dateOfBirth',
            label: 'Date of Birth',
            type: 'date',
        },
        {
            name: 'farmerNo',
            label: 'Farmer Number',
            type: 'text',
            placeholder: 'Auto-generated if empty',
            helpText: 'Leave blank to auto-generate',
        },

        // Contact Information
        {
            name: 'phone1',
            label: 'Primary Phone',
            type: 'tel',
            required: true,
            placeholder: '+255 XXX XXX XXX',
        },
        {
            name: 'phone2',
            label: 'Secondary Phone',
            type: 'tel',
            placeholder: '+255 XXX XXX XXX',
        },
        {
            name: 'email',
            label: 'Email',
            type: 'email',
            placeholder: 'farmer@example.com',
        },

        // Identity
        {
            name: 'identityCardTypeId',
            label: 'ID Card Type',
            type: 'select',
            options: identityCardTypes,
            placeholder: 'Select ID type',
        },
        {
            name: 'identityNumber',
            label: 'ID Number',
            type: 'text',
            placeholder: 'Enter ID number',
        },
        {
            name: 'schoolLevelId',
            label: 'Education Level',
            type: 'select',
            options: schoolLevels,
            placeholder: 'Select education level',
        },

        // Location (cascading)
        {
            name: 'countryId',
            label: 'Country',
            type: 'select',
            options: countries,
            placeholder: 'Select country',
        },
        {
            name: 'regionId',
            label: 'Region',
            type: 'select',
            options: regions,
            placeholder: 'Select region',
        },
        {
            name: 'districtId',
            label: 'District',
            type: 'select',
            options: districts,
            placeholder: 'Select district',
        },
        {
            name: 'wardId',
            label: 'Ward',
            type: 'select',
            options: wards,
            placeholder: 'Select ward',
        },
        {
            name: 'villageId',
            label: 'Village',
            type: 'select',
            options: villages,
            placeholder: 'Select village',
        },
        {
            name: 'physicalAddress',
            label: 'Physical Address',
            type: 'textarea',
            placeholder: 'Enter physical address',
            colSpan: 2,
        },

        // Other
        {
            name: 'farmerOrganizationMembership',
            label: 'Organization Membership',
            type: 'text',
            placeholder: 'Farmer organization name',
        },
        {
            name: 'farmerType',
            label: 'Farmer Type',
            type: 'select',
            options: [
                { value: 'individual', label: 'Individual' },
                { value: 'commercial', label: 'Commercial' },
                { value: 'cooperative', label: 'Cooperative' },
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
        { key: 'farmerNo' as keyof Farmer, label: 'Farmer ID' },
        {
            key: 'name' as const,
            label: 'Full Name',
            render: (_: unknown, data: Farmer) => `${data.firstName} ${data.middleName || ''} ${data.surname}`.trim(),
        },
        { key: 'gender' as keyof Farmer, label: 'Gender' },
        {
            key: 'dateOfBirth' as keyof Farmer,
            label: 'Date of Birth',
            render: (value: unknown) => value ? formatDate(String(value)) : '-',
        },
        { key: 'phone1' as keyof Farmer, label: 'Primary Phone' },
        { key: 'phone2' as keyof Farmer, label: 'Secondary Phone' },
        { key: 'email' as keyof Farmer, label: 'Email' },
        {
            key: 'identityCardTypeId' as keyof Farmer,
            label: 'ID Type',
            render: (value: unknown) => {
                const type = identityCardTypes.find(t => t.value === value);
                return type?.label || '-';
            },
        },
        { key: 'identityNumber' as keyof Farmer, label: 'ID Number' },
        {
            key: 'regionId' as keyof Farmer,
            label: 'Region',
            render: (value: unknown) => regionsMap.get(Number(value)) || '-',
        },
        {
            key: 'districtId' as keyof Farmer,
            label: 'District',
            render: (value: unknown) => districtsMap.get(Number(value)) || '-',
        },
        { key: 'physicalAddress' as keyof Farmer, label: 'Address' },
        { key: 'farmerOrganizationMembership' as keyof Farmer, label: 'Organization' },
        { key: 'status' as keyof Farmer, label: 'Status' },
        {
            key: 'created_at' as keyof Farmer,
            label: 'Registered',
            render: (value: unknown) => value ? formatDate(String(value)) : '-',
        },
    ];

    const handleCreate = async (data: Partial<Farmer>) => {
        await farmerApi.create(data as any);
    };

    const handleUpdate = async (id: number | string, data: Partial<Farmer>) => {
        await farmerApi.update(Number(id), data as any);
    };

    const handleDelete = async (id: number | string) => {
        await farmerApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Farmer Database"
            description={`Registered farmers - ${farmers.length.toLocaleString()} records`}
            data={farmers}
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
            createLabel="Add Farmer"
            createModalSize="xl"
            editModalSize="xl"
            viewModalSize="lg"
            tableProps={{
                searchPlaceholder: 'Search by name, ID, or phone...',
                enableRowSelection: true,
            }}
        />
    );
}

export default FarmerDatabase;
