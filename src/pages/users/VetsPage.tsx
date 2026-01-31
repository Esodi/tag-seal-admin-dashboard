import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { vetApi, locationApi } from '../../services/api';
import { Vet, Region, District } from '../../types/entities';
import { formatDate } from '../../lib/utils';

export function VetsPage() {
    const [vets, setVets] = useState<Vet[]>([]);
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
            const [vetsData, regionsData, districtsData, countriesData] = await Promise.all([
                vetApi.list(),
                locationApi.regions.list(),
                locationApi.districts.list(),
                locationApi.countries.list(),
            ]);
            setVets(vetsData);
            setCountries(countriesData.map((c: any) => ({ value: c.id, label: c.name })));
            setRegions(regionsData.map((r: Region) => ({ value: r.id, label: r.name })));
            setDistricts(districtsData.map((d: District) => ({ value: d.id, label: d.name })));
            setRegionsMap(new Map(regionsData.map((r: Region) => [r.id, r.name])));
            setDistrictsMap(new Map(districtsData.map((d: District) => [d.id, d.name])));
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
        { id: 'referenceNo', header: 'Reference No', accessorKey: 'referenceNo' as keyof Vet },
        {
            id: 'name',
            header: 'Name',
            accessorFn: (row) => row.fullName || `${row.firstName || ''} ${row.middleName || ''} ${row.lastName || ''}`.trim() || '-',
        },
        { id: 'phoneNumber', header: 'Phone', accessorKey: 'phoneNumber' as keyof Vet },
        { id: 'medicalLicenseNo', header: 'License No', accessorKey: 'medicalLicenseNo' as keyof Vet },
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

    const formFields: FormField<Partial<Vet>>[] = [
        {
            name: 'referenceNo' as keyof Vet,
            label: 'Reference Number',
            type: 'text',
            placeholder: 'Auto-generated if empty',
        },
        {
            name: 'medicalLicenseNo' as keyof Vet,
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
            name: 'phoneNumber' as keyof Vet,
            label: 'Phone',
            type: 'tel',
            required: true,
            placeholder: '+255 XXX XXX XXX',
        },
        {
            name: 'gender' as keyof Vet,
            label: 'Gender',
            type: 'select',
            required: true,
            options: [
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
            ],
        },
        {
            name: 'dateOfBirth' as keyof Vet,
            label: 'Date of Birth',
            type: 'date',
        },
        {
            name: 'specialization' as keyof Vet,
            label: 'Specialization',
            type: 'text',
            placeholder: 'e.g., Large Animals, Small Animals',
        },
        {
            name: 'countryId' as keyof Vet,
            label: 'Country',
            type: 'select',
            options: countries,
            placeholder: 'Select country',
        },
        {
            name: 'regionId' as keyof Vet,
            label: 'Region',
            type: 'select',
            options: regions,
            placeholder: 'Select region',
        },
        {
            name: 'districtId' as keyof Vet,
            label: 'District',
            type: 'select',
            options: districts,
            placeholder: 'Select district',
        },
        {
            name: 'status' as keyof Vet,
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
        { key: 'id' as keyof Vet, label: 'ID' },
        { key: 'referenceNo' as keyof Vet, label: 'Reference Number' },
        { key: 'medicalLicenseNo' as keyof Vet, label: 'License Number' },
        {
            key: 'name' as const,
            label: 'Full Name',
            render: (_: unknown, data: Vet) =>
                data.fullName || `${data.firstName || ''} ${data.middleName || ''} ${data.lastName || ''}`.trim() || '-',
        },
        { key: 'phoneNumber' as keyof Vet, label: 'Phone' },
        { key: 'email' as keyof Vet, label: 'Email' },
        { key: 'specialization' as keyof Vet, label: 'Specialization' },
        {
            key: 'regionId' as keyof Vet,
            label: 'Region',
            render: (value: unknown) => regionsMap.get(Number(value)) || '-',
        },
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
