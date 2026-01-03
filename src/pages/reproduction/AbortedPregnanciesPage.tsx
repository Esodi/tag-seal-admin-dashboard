import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { abortedPregnancyApi, livestockApi, pregnancyApi, reproductiveProblemApi } from '../../services/api';
import { AbortedPregnancy, Livestock, Pregnancy, ReproductiveProblem } from '../../types/entities';
import { formatDate } from '../../lib/utils';

// Extended type for display
interface AbortionDisplay extends AbortedPregnancy {
    livestockName?: string;
    problemName?: string;
}

export function AbortedPregnanciesPage() {
    const [data, setData] = useState<AbortionDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [females, setFemales] = useState<SelectOption[]>([]);
    const [pregnancies, setPregnancies] = useState<SelectOption[]>([]); // Could filter active ones
    const [problems, setProblems] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [abortionsData, livestockData, pregnanciesData, problemsData] = await Promise.all([
                abortedPregnancyApi.list(),
                livestockApi.list(),
                pregnancyApi.list(),
                reproductiveProblemApi.list(),
            ]);

            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.id, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const problemMap = new Map(problemsData.map((p: ReproductiveProblem) => [p.id, p.name]));

            const enrichedData = abortionsData.map((a: AbortedPregnancy) => ({
                ...a,
                livestockName: a.livestockId ? livestockMap.get(a.livestockId) : '-',
                problemName: a.reproductiveProblemId ? problemMap.get(a.reproductiveProblemId) : '-',
            }));

            setData(enrichedData);

            setFemales(livestockData
                .filter((l: Livestock) => l.gender === 'female')
                .map((l: Livestock) => ({
                    value: l.id,
                    label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
                })));

            // Ideally filter specifically for the selected livestock but for now list all
            // Or maybe just show ID and Date
            setPregnancies(pregnanciesData.map((p: Pregnancy) => ({
                value: p.id,
                label: `Pregnancy #${p.id} (${p.conceptionDate ? formatDate(p.conceptionDate) : 'No Date'})`
            })));

            setProblems(problemsData.map((p: ReproductiveProblem) => ({ value: p.id, label: p.name })));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load abortion records');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<AbortionDisplay>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'livestockName', header: 'Livestock', accessorKey: 'livestockName' },
        {
            id: 'abortionDate',
            header: 'Date',
            accessorFn: (row) => formatDate(row.abortionDate),
        },
        { id: 'problemName', header: 'Reproductive Problem', accessorKey: 'problemName' },
        { id: 'gestationStage', header: 'Gestation Stage', accessorKey: 'gestationStage' },
    ];

    const formFields: FormField<Partial<AbortedPregnancy>>[] = [
        {
            name: 'livestockId',
            label: 'Livestock',
            type: 'select',
            required: true,
            options: females,
            placeholder: 'Select livestock',
        },
        {
            name: 'pregnancyId',
            label: 'Related Pregnancy',
            type: 'select',
            options: pregnancies,
            placeholder: 'Select pregnancy',
        },
        {
            name: 'abortionDate',
            label: 'Abortion Date',
            type: 'date',
            required: true,
        },
        {
            name: 'reproductiveProblemId',
            label: 'Problem/Cause',
            type: 'select',
            options: problems,
            placeholder: 'Select problem',
        },
        {
            name: 'gestationStage',
            label: 'Gestation Stage',
            type: 'text',
            placeholder: 'e.g. 1st Trimester, 5 months',
        },
        {
            name: 'reason',
            label: 'Reason',
            type: 'textarea',
            placeholder: 'Describe the reason or circumstances',
        },
        {
            name: 'notes',
            label: 'Notes',
            type: 'textarea',
            placeholder: 'Additional comments',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof AbortionDisplay, label: 'ID' },
        { key: 'livestockName' as keyof AbortionDisplay, label: 'Livestock' },
        { key: 'abortionDate' as keyof AbortionDisplay, label: 'Date', render: (val: unknown) => formatDate(String(val)) },
        { key: 'problemName' as keyof AbortionDisplay, label: 'Problem' },
        { key: 'gestationStage' as keyof AbortionDisplay, label: 'Gestation Stage' },
        { key: 'reason' as keyof AbortionDisplay, label: 'Reason' },
        { key: 'notes' as keyof AbortionDisplay, label: 'Notes' },
        { key: 'created_at' as keyof AbortionDisplay, label: 'Created At', render: (val: unknown) => formatDate(String(val)) },
    ];

    const handleCreate = async (item: Partial<AbortedPregnancy>) => {
        await abortedPregnancyApi.create(item as AbortedPregnancy);
    };

    const handleUpdate = async (id: number | string, item: Partial<AbortedPregnancy>) => {
        await abortedPregnancyApi.update(Number(id), item as AbortedPregnancy);
    };

    const handleDelete = async (id: number | string) => {
        await abortedPregnancyApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Aborted Pregnancies"
            description="Record pregnancy losses"
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
            createLabel="Record Event"
            createModalSize="lg"
            editModalSize="lg"
        />
    );
}

export default AbortedPregnanciesPage;
