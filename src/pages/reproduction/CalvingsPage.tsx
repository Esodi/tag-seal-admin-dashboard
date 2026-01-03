import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { calvingApi, livestockApi, calvingTypeApi, calvingProblemApi } from '../../services/api';
import { Calving, Livestock, CalvingType, CalvingProblem } from '../../types/entities';
import { formatDate } from '../../lib/utils';

// Extended type for display
interface CalvingDisplay extends Calving {
    livestockName?: string;
    calvingTypeName?: string;
    calvingProblemName?: string;
}

export function CalvingsPage() {
    const [data, setData] = useState<CalvingDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [cows, setCows] = useState<SelectOption[]>([]);
    const [calvingTypes, setCalvingTypes] = useState<SelectOption[]>([]);
    const [calvingProblems, setCalvingProblems] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [calvingData, livestockData, typesData, problemsData] = await Promise.all([
                calvingApi.list(),
                livestockApi.list(),
                calvingTypeApi.list(),
                calvingProblemApi.list(),
            ]);

            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.id, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const typeMap = new Map(typesData.map((t: CalvingType) => [t.id, t.name]));
            const problemMap = new Map(problemsData.map((p: CalvingProblem) => [p.id, p.name]));

            const enrichedData = calvingData.map((c: Calving) => ({
                ...c,
                livestockName: c.livestockId ? livestockMap.get(c.livestockId) : '-',
                calvingTypeName: c.calvingTypeId ? typeMap.get(c.calvingTypeId) : '-',
                calvingProblemName: c.calvingProblemId ? problemMap.get(c.calvingProblemId) : '-',
            }));

            setData(enrichedData);

            // Filter for female cattle if possible, but for now just all females + species filter via name if needed
            // Assuming 'female' is correctly set
            setCows(livestockData
                .filter((l: Livestock) => l.gender === 'female')
                .map((l: Livestock) => ({
                    value: l.id,
                    label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
                })));

            setCalvingTypes(typesData.map((t: CalvingType) => ({ value: t.id, label: t.name })));
            setCalvingProblems(problemsData.map((p: CalvingProblem) => ({ value: p.id, label: p.name })));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load calving records');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<CalvingDisplay>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'livestockName', header: 'Cow', accessorKey: 'livestockName' },
        {
            id: 'calvingDate',
            header: 'Date',
            accessorFn: (row) => formatDate(row.calvingDate),
        },
        { id: 'calfCount', header: 'Calves', accessorKey: 'calfCount', size: 100 },
        { id: 'calvingTypeName', header: 'Type', accessorKey: 'calvingTypeName' },
        {
            id: 'assistanceRequired',
            header: 'Assisted',
            accessorFn: (row) => row.assistanceRequired ? 'Yes' : 'No',
            size: 100
        },
    ];

    const formFields: FormField<Partial<Calving>>[] = [
        {
            name: 'livestockId',
            label: 'Cow',
            type: 'select',
            required: true,
            options: cows,
            placeholder: 'Select cow',
        },
        {
            name: 'calvingDate',
            label: 'Calving Date',
            type: 'date',
            required: true,
        },
        {
            name: 'calfCount',
            label: 'Total Calves',
            type: 'number',
            required: true,
            min: 1,
        },
        {
            name: 'maleCalfCount',
            label: 'Males',
            type: 'number',
            min: 0,
        },
        {
            name: 'femaleCalfCount',
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
            name: 'calvingTypeId',
            label: 'Calving Type',
            type: 'select',
            options: calvingTypes,
            placeholder: 'Select type',
        },
        {
            name: 'calvingProblemId',
            label: 'Problem (if any)',
            type: 'select',
            options: calvingProblems,
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
            placeholder: 'Comments',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof CalvingDisplay, label: 'ID' },
        { key: 'livestockName' as keyof CalvingDisplay, label: 'Cow' },
        { key: 'calvingDate' as keyof CalvingDisplay, label: 'Date', render: (val: unknown) => formatDate(String(val)) },
        { key: 'calfCount' as keyof CalvingDisplay, label: 'Total Calves' },
        { key: 'maleCalfCount' as keyof CalvingDisplay, label: 'Males' },
        { key: 'femaleCalfCount' as keyof CalvingDisplay, label: 'Females' },
        { key: 'stillbornCount' as keyof CalvingDisplay, label: 'Stillborn' },
        { key: 'calvingTypeName' as keyof CalvingDisplay, label: 'Type' },
        { key: 'calvingProblemName' as keyof CalvingDisplay, label: 'Problem' },
        { key: 'assistanceRequired' as keyof CalvingDisplay, label: 'Assisted', render: (val: unknown) => val ? 'Yes' : 'No' },
        { key: 'notes' as keyof CalvingDisplay, label: 'Notes' },
        { key: 'created_at' as keyof CalvingDisplay, label: 'Created At', render: (val: unknown) => formatDate(String(val)) },
    ];

    const handleCreate = async (item: Partial<Calving>) => {
        await calvingApi.create(item as Calving);
    };

    const handleUpdate = async (id: number | string, item: Partial<Calving>) => {
        await calvingApi.update(Number(id), item as Calving);
    };

    const handleDelete = async (id: number | string) => {
        await calvingApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Calving Records"
            description="Record cattle calving events"
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
            createLabel="Record Calving"
            createModalSize="lg"
            editModalSize="lg"
        />
    );
}

export default CalvingsPage;
