import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { birthEventApi, livestockApi, birthTypeApi, birthProblemApi } from '../../services/api';
import { BirthEvent, Livestock, BirthType, BirthProblem } from '../../types/entities';
import { formatDate } from '../../lib/utils';

// Extended type for display
interface BirthEventDisplay extends BirthEvent {
    livestockName?: string;
    birthTypeName?: string;
    birthProblemName?: string;
}

export function BirthEventsPage() {
    const [data, setData] = useState<BirthEventDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [females, setFemales] = useState<SelectOption[]>([]);
    const [birthTypes, setBirthTypes] = useState<SelectOption[]>([]);
    const [birthProblems, setBirthProblems] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [eventsData, livestockData, typesData, problemsData] = await Promise.all([
                birthEventApi.list(),
                livestockApi.list(),
                birthTypeApi.list(),
                birthProblemApi.list(),
            ]);

            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.id, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const typeMap = new Map(typesData.map((t: BirthType) => [t.id, t.name]));
            const problemMap = new Map(problemsData.map((p: BirthProblem) => [p.id, p.name]));

            const enrichedData = eventsData.map((e: BirthEvent) => ({
                ...e,
                livestockName: e.livestockId ? livestockMap.get(e.livestockId) : '-',
                birthTypeName: e.birthTypeId ? typeMap.get(e.birthTypeId) : '-',
                birthProblemName: e.birthProblemId ? problemMap.get(e.birthProblemId) : '-',
            }));

            setData(enrichedData);

            setFemales(livestockData
                .filter((l: Livestock) => l.gender === 'female')
                .map((l: Livestock) => ({
                    value: l.id,
                    label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
                })));

            setBirthTypes(typesData.map((t: BirthType) => ({ value: t.id, label: t.name })));
            setBirthProblems(problemsData.map((p: BirthProblem) => ({ value: p.id, label: p.name })));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load birth events');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<BirthEventDisplay>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'livestockName', header: 'Mother', accessorKey: 'livestockName' },
        {
            id: 'birthDate',
            header: 'Date',
            accessorFn: (row) => formatDate(row.birthDate),
        },
        { id: 'offspringCount', header: 'Offspring', accessorKey: 'offspringCount', size: 100 },
        { id: 'birthTypeName', header: 'Type', accessorKey: 'birthTypeName' },
        {
            id: 'assistanceRequired',
            header: 'Assisted',
            accessorFn: (row) => row.assistanceRequired ? 'Yes' : 'No',
            size: 100
        },
    ];

    const formFields: FormField<Partial<BirthEvent>>[] = [
        {
            name: 'livestockId',
            label: 'Mother',
            type: 'select',
            required: true,
            options: females,
            placeholder: 'Select mother',
        },
        {
            name: 'birthDate',
            label: 'Birth Date',
            type: 'date',
            required: true,
        },
        {
            name: 'offspringCount',
            label: 'Total Offspring',
            type: 'number',
            required: true,
            min: 1,
        },
        {
            name: 'maleCount',
            label: 'Males',
            type: 'number',
            min: 0,
        },
        {
            name: 'femaleCount',
            label: 'Females',
            type: 'number',
            min: 0,
        },
        {
            name: 'stillbornCount',
            label: 'Stillborn',
            type: 'number',
            min: 0,
        },
        {
            name: 'birthTypeId',
            label: 'Birth Type',
            type: 'select',
            options: birthTypes,
            placeholder: 'Select type',
        },
        {
            name: 'birthProblemId',
            label: 'Problem (if any)',
            type: 'select',
            options: birthProblems,
            placeholder: 'Select problem',
        },
        {
            name: 'assistanceRequired',
            label: 'Assistance Required?',
            type: 'checkbox',
        },
        {
            name: 'notes',
            label: 'Notes',
            type: 'textarea',
            placeholder: 'Comments on the birth',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof BirthEventDisplay, label: 'ID' },
        { key: 'livestockName' as keyof BirthEventDisplay, label: 'Mother' },
        { key: 'birthDate' as keyof BirthEventDisplay, label: 'Date', render: (val: unknown) => formatDate(String(val)) },
        { key: 'offspringCount' as keyof BirthEventDisplay, label: 'Total Offspring' },
        { key: 'maleCount' as keyof BirthEventDisplay, label: 'Males' },
        { key: 'femaleCount' as keyof BirthEventDisplay, label: 'Females' },
        { key: 'stillbornCount' as keyof BirthEventDisplay, label: 'Stillborn' },
        { key: 'birthTypeName' as keyof BirthEventDisplay, label: 'Type' },
        { key: 'birthProblemName' as keyof BirthEventDisplay, label: 'Problem' },
        { key: 'assistanceRequired' as keyof BirthEventDisplay, label: 'Assisted', render: (val: unknown) => val ? 'Yes' : 'No' },
        { key: 'notes' as keyof BirthEventDisplay, label: 'Notes' },
        { key: 'created_at' as keyof BirthEventDisplay, label: 'Created At', render: (val: unknown) => formatDate(String(val)) },
    ];

    const handleCreate = async (item: Partial<BirthEvent>) => {
        await birthEventApi.create(item as BirthEvent);
    };

    const handleUpdate = async (id: number | string, item: Partial<BirthEvent>) => {
        await birthEventApi.update(Number(id), item as BirthEvent);
    };

    const handleDelete = async (id: number | string) => {
        await birthEventApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Birth Events"
            description="Record livestock births and outcomes"
            data={data}
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
            createLabel="Record Birth"
            createModalSize="lg"
            editModalSize="lg"
        />
    );
}

export default BirthEventsPage;
