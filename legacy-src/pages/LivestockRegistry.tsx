import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../components/crud';
import { livestockApi, farmApi, referenceApi } from '../services/api';
import { Livestock } from '../types/entities';
import { formatDate } from '../lib/utils';

export function LivestockRegistry() {
    const [livestock, setLivestock] = useState<Livestock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    // Reference data for dropdowns
    const [farms, setFarms] = useState<SelectOption[]>([]);
    const [species, setSpecies] = useState<SelectOption[]>([]);
    const [breeds, setBreeds] = useState<SelectOption[]>([]);
    const [livestockTypes, setLivestockTypes] = useState<SelectOption[]>([]);
    const [obtainedMethods, setObtainedMethods] = useState<SelectOption[]>([]);

    // Parent livestock for mother/father selection
    const [maleLivestock, setMaleLivestock] = useState<SelectOption[]>([]);
    const [femaleLivestock, setFemaleLivestock] = useState<SelectOption[]>([]);

    // Lookup maps for displaying names
    const [farmsMap, setFarmsMap] = useState<Map<string, string>>(new Map());
    const [speciesMap, setSpeciesMap] = useState<Map<number, string>>(new Map());
    const [breedsMap, setBreedsMap] = useState<Map<number, string>>(new Map());
    const [livestockTypesMap, setLivestockTypesMap] = useState<Map<number, string>>(new Map());

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [
                livestockData,
                farmsData,
                speciesData,
                breedsData,
                livestockTypesData,
                obtainedMethodsData,
            ] = await Promise.all([
                livestockApi.list(),
                farmApi.list(),
                referenceApi.species.list(),
                referenceApi.breeds.list(),
                referenceApi.livestockTypes.list(),
                referenceApi.livestockObtainedMethods.list(),
            ]);

            setLivestock(livestockData);

            // Build farm options
            const farmOptions = farmsData.map(f => ({
                value: f.uuid,
                label: `${f.name} (${f.referenceNo || f.uuid.slice(0, 8)})`,
            }));
            setFarms(farmOptions);
            setFarmsMap(new Map(farmsData.map(f => [f.uuid, f.name])));

            // Build reference options
            setSpecies(speciesData.map(s => ({ value: s.id, label: s.name })));
            setBreeds(breedsData.map(b => ({ value: b.id, label: b.name })));
            setLivestockTypes(livestockTypesData.map(t => ({ value: t.id, label: t.name })));
            setObtainedMethods(obtainedMethodsData.map(m => ({ value: m.id, label: m.name })));

            // Build lookup maps
            setSpeciesMap(new Map(speciesData.map(s => [s.id, s.name])));
            setBreedsMap(new Map(breedsData.map(b => [b.id, b.name])));
            setLivestockTypesMap(new Map(livestockTypesData.map(t => [t.id, t.name])));

            // Build parent livestock options
            const males = livestockData
                .filter(l => l.gender === 'male')
                .map(l => ({
                    value: l.uuid,
                    label: `${l.name || l.identificationNumber || l.uuid.slice(0, 8)} (${speciesData.find(s => s.id === l.speciesId)?.name || 'Unknown'})`,
                }));
            const females = livestockData
                .filter(l => l.gender === 'female')
                .map(l => ({
                    value: l.uuid,
                    label: `${l.name || l.identificationNumber || l.uuid.slice(0, 8)} (${speciesData.find(s => s.id === l.speciesId)?.name || 'Unknown'})`,
                }));
            setMaleLivestock(males);
            setFemaleLivestock(females);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load livestock');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<Livestock>[] = [
        {
            id: 'id',
            header: 'Tag ID',
            accessorFn: (row) => row.identificationNumber || row.barcodeTagId || row.rfidTagId || row.dummyTagId || row.uuid.slice(0, 8),
            size: 120,
        },
        {
            id: 'name',
            header: 'Name',
            accessorKey: 'name',
            cell: ({ getValue }) => (getValue() as string) || <span className="text-slate-400">Unnamed</span>,
        },
        {
            id: 'species',
            header: 'Species',
            accessorFn: (row) => speciesMap.get(row.speciesId || 0) || '-',
        },
        {
            id: 'breed',
            header: 'Breed',
            accessorFn: (row) => breedsMap.get(row.breedId || 0) || '-',
        },
        {
            id: 'type',
            header: 'Type',
            accessorFn: (row) => livestockTypesMap.get(row.livestockTypeId || 0) || '-',
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
            id: 'farm',
            header: 'Farm',
            accessorFn: (row) => farmsMap.get(row.farmUuid) || '-',
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ getValue }) => {
                const status = String(getValue());
                const statusColors: Record<string, string> = {
                    Alive: 'badge-success',
                    Active: 'badge-success',
                    Dead: 'badge-danger',
                    Sold: 'badge-warning',
                    Transferred: 'badge-info',
                    Slaughtered: 'badge-secondary',
                };
                return (
                    <span className={`badge ${statusColors[status] || 'badge-secondary'}`}>
                        {status}
                    </span>
                );
            },
        },
    ];

    const formFields: FormField<Partial<Livestock>>[] = [
        // Basic Information
        {
            name: 'farmUuid',
            label: 'Farm',
            type: 'select',
            required: true,
            options: farms,
            placeholder: 'Select farm',
        },
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            placeholder: 'Enter livestock name (optional)',
        },

        // Tag IDs
        {
            name: 'identificationNumber',
            label: 'Identification Number',
            type: 'text',
            placeholder: 'Main identification number',
        },
        {
            name: 'barcodeTagId',
            label: 'Barcode Tag ID',
            type: 'text',
            placeholder: 'Barcode tag ID',
        },
        {
            name: 'rfidTagId',
            label: 'RFID Tag ID',
            type: 'text',
            placeholder: 'RFID tag ID',
        },
        {
            name: 'dummyTagId',
            label: 'Temporary Tag ID',
            type: 'text',
            placeholder: 'Temporary/dummy tag ID',
        },

        // Classification
        {
            name: 'speciesId',
            label: 'Species',
            type: 'select',
            required: true,
            options: species,
            placeholder: 'Select species',
        },
        {
            name: 'breedId',
            label: 'Breed',
            type: 'select',
            options: breeds,
            placeholder: 'Select breed',
        },
        {
            name: 'livestockTypeId',
            label: 'Livestock Type',
            type: 'select',
            options: livestockTypes,
            placeholder: 'Select type (dairy, beef, etc.)',
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

        // Birth and Origin
        {
            name: 'dateOfBirth',
            label: 'Date of Birth',
            type: 'date',
        },
        {
            name: 'livestockObtainedMethodId',
            label: 'How Obtained',
            type: 'select',
            options: obtainedMethods,
            placeholder: 'Select method',
        },
        {
            name: 'dateFirstEnteredToFarm',
            label: 'Date Entered Farm',
            type: 'date',
        },
        {
            name: 'weightAsOnRegistration',
            label: 'Weight at Registration (kg)',
            type: 'number',
            min: 0,
            placeholder: 'Weight in kilograms',
        },

        // Parentage
        {
            name: 'motherUuid',
            label: 'Mother',
            type: 'select',
            options: femaleLivestock,
            placeholder: 'Select mother (optional)',
        },
        {
            name: 'fatherUuid',
            label: 'Father',
            type: 'select',
            options: maleLivestock,
            placeholder: 'Select father (optional)',
        },

        // Physical Characteristics
        {
            name: 'primaryColor',
            label: 'Primary Color',
            type: 'text',
            placeholder: 'e.g., Black, Brown, White',
        },
        {
            name: 'secondaryColor',
            label: 'Secondary Color',
            type: 'text',
            placeholder: 'e.g., Spotted, Mixed',
        },

        // Status
        {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'Alive', label: 'Alive' },
                { value: 'Active', label: 'Active' },
                { value: 'Dead', label: 'Dead' },
                { value: 'Sold', label: 'Sold' },
                { value: 'Transferred', label: 'Transferred' },
                { value: 'Slaughtered', label: 'Slaughtered' },
            ],
            defaultValue: 'Alive',
        },
    ];

    const detailFields = [
        {
            key: 'uuid' as keyof Livestock,
            label: 'UUID',
            render: (value: unknown) => String(value).slice(0, 8) + '...',
        },
        { key: 'identificationNumber' as keyof Livestock, label: 'ID Number' },
        { key: 'barcodeTagId' as keyof Livestock, label: 'Barcode Tag' },
        { key: 'rfidTagId' as keyof Livestock, label: 'RFID Tag' },
        { key: 'name' as keyof Livestock, label: 'Name' },
        { key: 'gender' as keyof Livestock, label: 'Gender' },
        {
            key: 'speciesId' as keyof Livestock,
            label: 'Species',
            render: (value: unknown) => speciesMap.get(Number(value)) || '-',
        },
        {
            key: 'breedId' as keyof Livestock,
            label: 'Breed',
            render: (value: unknown) => breedsMap.get(Number(value)) || '-',
        },
        {
            key: 'livestockTypeId' as keyof Livestock,
            label: 'Type',
            render: (value: unknown) => livestockTypesMap.get(Number(value)) || '-',
        },
        {
            key: 'farmUuid' as keyof Livestock,
            label: 'Farm',
            render: (value: unknown) => farmsMap.get(String(value)) || '-',
        },
        {
            key: 'dateOfBirth' as keyof Livestock,
            label: 'Date of Birth',
            render: (value: unknown) => value ? formatDate(String(value)) : '-',
        },
        { key: 'weightAsOnRegistration' as keyof Livestock, label: 'Weight at Registration (kg)' },
        { key: 'primaryColor' as keyof Livestock, label: 'Primary Color' },
        { key: 'secondaryColor' as keyof Livestock, label: 'Secondary Color' },
        { key: 'status' as keyof Livestock, label: 'Status' },
        {
            key: 'created_at' as keyof Livestock,
            label: 'Registered',
            render: (value: unknown) => value ? formatDate(String(value)) : '-',
        },
    ];

    const handleCreate = async (data: Partial<Livestock>) => {
        await livestockApi.create(data as unknown as Livestock);
    };

    const handleUpdate = async (id: number | string, data: Partial<Livestock>) => {
        await livestockApi.update(Number(id), data);
    };

    const handleDelete = async (id: number | string) => {
        await livestockApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Livestock Registry"
            description={`Registered livestock - ${livestock.length.toLocaleString()} animals`}
            data={livestock}
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
            createLabel="Add Livestock"
            createModalSize="xl"
            editModalSize="xl"
            viewModalSize="lg"
            tableProps={{
                searchPlaceholder: 'Search by tag ID, name, or species...',
                enableRowSelection: true,
            }}
        />
    );
}

export default LivestockRegistry;
