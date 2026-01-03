import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../components/crud';
import { farmApi, farmerApi, locationApi, referenceApi } from '../services/api';
import { Farm, Farmer, LegalStatus } from '../types/entities';
import { formatDate } from '../lib/utils';

export function FarmRegistry() {
    const [farms, setFarms] = useState<Farm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    // Reference data for dropdowns
    const [farmers, setFarmers] = useState<SelectOption[]>([]);
    const [countries, setCountries] = useState<SelectOption[]>([]);
    const [regions, setRegions] = useState<SelectOption[]>([]);
    const [districts, setDistricts] = useState<SelectOption[]>([]);
    const [wards, setWards] = useState<SelectOption[]>([]);
    const [villages, setVillages] = useState<SelectOption[]>([]);
    const [legalStatuses, setLegalStatuses] = useState<SelectOption[]>([]);

    // Lookup maps for displaying names
    const [farmersMap, setFarmersMap] = useState<Map<number, string>>(new Map());
    const [regionsMap, setRegionsMap] = useState<Map<number, string>>(new Map());
    const [districtsMap, setDistrictsMap] = useState<Map<number, string>>(new Map());
    const [legalStatusesMap, setLegalStatusesMap] = useState<Map<number, string>>(new Map());

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [farmsData, farmersData, countriesData, regionsData, districtsData, legalStatusesData] = await Promise.all([
                farmApi.list(),
                farmerApi.list(),
                locationApi.countries.list(),
                locationApi.regions.list(),
                locationApi.districts.list(),
                referenceApi.legalStatuses.list(),
            ]);

            setFarms(farmsData);

            // Build farmer options with full name
            const farmerOptions = farmersData.map(f => ({
                value: f.id,
                label: `${f.firstName} ${f.middleName || ''} ${f.surname}`.trim() + (f.farmerNo ? ` (${f.farmerNo})` : ''),
            }));
            setFarmers(farmerOptions);
            setFarmersMap(new Map(farmersData.map(f => [f.id, `${f.firstName} ${f.surname}`])));

            setCountries(countriesData.map(c => ({ value: c.id, label: c.name })));
            setRegions(regionsData.map(r => ({ value: r.id, label: r.name })));
            setDistricts(districtsData.map(d => ({ value: d.id, label: d.name })));
            setLegalStatuses(legalStatusesData.map(l => ({ value: l.id, label: l.name })));

            // Build lookup maps
            setRegionsMap(new Map(regionsData.map(r => [r.id, r.name])));
            setDistrictsMap(new Map(districtsData.map(d => [d.id, d.name])));
            setLegalStatusesMap(new Map(legalStatusesData.map(l => [l.id, l.name])));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load farms');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<Farm>[] = [
        { id: 'referenceNo', header: 'Farm Ref', accessorKey: 'referenceNo', size: 120 },
        { id: 'name', header: 'Farm Name', accessorKey: 'name' },
        {
            id: 'farmer',
            header: 'Owner',
            accessorFn: (row) => farmersMap.get(row.farmerId) || '-',
        },
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
            id: 'size',
            header: 'Size',
            accessorFn: (row) => row.size ? `${row.size} ${row.sizeUnit || 'ha'}` : '-',
        },
        {
            id: 'legalStatus',
            header: 'Legal Status',
            accessorFn: (row) => legalStatusesMap.get(row.legalStatusId || 0) || '-',
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ getValue }) => {
                const status = String(getValue()).toLowerCase();
                return (
                    <span className={`badge ${status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                        {status}
                    </span>
                );
            },
        },
    ];

    const formFields: FormField<Partial<Farm>>[] = [
        // Basic Information
        {
            name: 'name',
            label: 'Farm Name',
            type: 'text',
            required: true,
            placeholder: 'Enter farm name',
        },
        {
            name: 'farmerId',
            label: 'Farm Owner',
            type: 'select',
            required: true,
            options: farmers,
            placeholder: 'Select farmer',
        },
        {
            name: 'referenceNo',
            label: 'Reference Number',
            type: 'text',
            placeholder: 'Auto-generated if empty',
            helpText: 'Leave blank to auto-generate',
        },
        {
            name: 'regionalRegNo',
            label: 'Regional Reg. Number',
            type: 'text',
            placeholder: 'Regional registration number',
        },

        // Size and Location
        {
            name: 'size',
            label: 'Farm Size',
            type: 'number',
            placeholder: 'Enter size',
            min: 0,
        },
        {
            name: 'sizeUnit',
            label: 'Size Unit',
            type: 'select',
            options: [
                { value: 'ha', label: 'Hectares (ha)' },
                { value: 'acres', label: 'Acres' },
                { value: 'sqm', label: 'Square Meters' },
            ],
            defaultValue: 'ha',
        },

        // GPS Coordinates
        {
            name: 'latitudes',
            label: 'Latitude',
            type: 'text',
            placeholder: '-6.7924',
        },
        {
            name: 'longitudes',
            label: 'Longitude',
            type: 'text',
            placeholder: '39.2083',
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
            placeholder: 'Enter physical address or directions',
            colSpan: 2,
        },

        // Legal and Status
        {
            name: 'legalStatusId',
            label: 'Legal Status',
            type: 'select',
            options: legalStatuses,
            placeholder: 'Select legal status',
        },
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
            ],
            defaultValue: 'Active',
        },
    ];

    const detailFields = [
        { key: 'referenceNo' as keyof Farm, label: 'Reference Number' },
        { key: 'regionalRegNo' as keyof Farm, label: 'Regional Reg. Number' },
        { key: 'name' as keyof Farm, label: 'Farm Name' },
        {
            key: 'farmerId' as keyof Farm,
            label: 'Owner',
            render: (value: unknown) => farmersMap.get(Number(value)) || '-',
        },
        {
            key: 'size' as keyof Farm,
            label: 'Farm Size',
            render: (value: unknown, data: Farm) => value ? `${value} ${data.sizeUnit || 'ha'}` : '-',
        },
        {
            key: 'legalStatusId' as keyof Farm,
            label: 'Legal Status',
            render: (value: unknown) => legalStatusesMap.get(Number(value)) || '-',
        },
        { key: 'latitudes' as keyof Farm, label: 'Latitude' },
        { key: 'longitudes' as keyof Farm, label: 'Longitude' },
        {
            key: 'regionId' as keyof Farm,
            label: 'Region',
            render: (value: unknown) => regionsMap.get(Number(value)) || '-',
        },
        {
            key: 'districtId' as keyof Farm,
            label: 'District',
            render: (value: unknown) => districtsMap.get(Number(value)) || '-',
        },
        { key: 'physicalAddress' as keyof Farm, label: 'Physical Address' },
        { key: 'status' as keyof Farm, label: 'Status' },
        {
            key: 'created_at' as keyof Farm,
            label: 'Registered',
            render: (value: unknown) => value ? formatDate(String(value)) : '-',
        },
    ];

    const handleCreate = async (data: Partial<Farm>) => {
        await farmApi.create(data);
    };

    const handleUpdate = async (id: number | string, data: Partial<Farm>) => {
        await farmApi.update(Number(id), data);
    };

    const handleDelete = async (id: number | string) => {
        await farmApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Farm Registry"
            description={`Registered farms - ${farms.length.toLocaleString()} records`}
            data={farms}
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
            createLabel="Add Farm"
            createModalSize="xl"
            editModalSize="xl"
            viewModalSize="lg"
            tableProps={{
                searchPlaceholder: 'Search by name, reference, or owner...',
                enableRowSelection: true,
            }}
        />
    );
}

export default FarmRegistry;
