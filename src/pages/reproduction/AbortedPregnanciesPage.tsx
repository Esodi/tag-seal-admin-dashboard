import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { abortedPregnancyApi, livestockApi, farmApi, pregnancyApi, reproductiveProblemApi } from '../../services/api';
import { AbortedPregnancy, Livestock, Farm, Pregnancy, ReproductiveProblem } from '../../types/entities';
import { formatDate } from '../../lib/utils';

// Extended type for display
interface AbortionDisplay extends AbortedPregnancy {
    livestockName?: string;
    farmName?: string;
    problemName?: string;
}

export function AbortedPregnanciesPage() {
    const [data, setData] = useState<AbortionDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [livestock, setLivestock] = useState<SelectOption[]>([]);
    const [farms, setFarms] = useState<SelectOption[]>([]);
    const [pregnancies, setPregnancies] = useState<SelectOption[]>([]);
    const [problems, setProblems] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [abortionsData, livestockData, farmsData, pregnanciesData, problemsData] = await Promise.all([
                abortedPregnancyApi.list(),
                livestockApi.list(),
                farmApi.list(),
                pregnancyApi.list(),
                reproductiveProblemApi.list(),
            ]);

            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.uuid, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const farmMap = new Map(farmsData.map((f: Farm) => [f.uuid, f.name]));
            const problemMap = new Map(problemsData.map((p: ReproductiveProblem) => [p.id, p.name]));

            const enrichedData = abortionsData.map((a: AbortedPregnancy) => ({
                ...a,
                livestockName: a.livestockUuid ? livestockMap.get(a.livestockUuid) : '-',
                farmName: a.farmUuid ? farmMap.get(a.farmUuid) : '-',
                problemName: a.reproductiveProblemId ? problemMap.get(a.reproductiveProblemId) : '-',
            }));

            setData(enrichedData);

            setLivestock(livestockData
                .filter((l: Livestock) => {
                    const g = l.gender?.toLowerCase();
                    return g === 'female';
                })
                .map((l: Livestock) => ({
                    value: l.uuid,
                    label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
                })));

            setFarms(farmsData.map((f: Farm) => ({ value: f.uuid, label: f.name })));

            setPregnancies(pregnanciesData.map((p: Pregnancy) => ({
                value: p.uuid,
                label: `Pregnancy (${p.conceptionDate ? formatDate(p.conceptionDate) : 'No Date'})`
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
        { id: 'uuid', header: 'UUID', accessorKey: 'uuid', size: 100 },
        { id: 'livestockName', header: 'Livestock', accessorKey: 'livestockName' },
        { id: 'farmName', header: 'Farm', accessorKey: 'farmName' },
        {
            id: 'eventDate',
            header: 'Abortion Date',
            accessorFn: (row) => row.eventDate ? formatDate(row.eventDate) : (row.created_at ? formatDate(row.created_at) : '-'),
        },
        { id: 'problemName', header: 'Reproductive Problem', accessorKey: 'problemName' },
        { id: 'gestationStage', header: 'Gestation Stage', accessorKey: 'gestationStage' },
    ];

    const formFields: FormField<AbortedPregnancy>[] = [
        {
            name: 'farmUuid' as keyof AbortedPregnancy,
            label: 'Farm',
            type: 'select',
            required: true,
            options: farms,
            placeholder: 'Select farm',
        },
        {
            name: 'livestockUuid' as keyof AbortedPregnancy,
            label: 'Livestock',
            type: 'select',
            required: true,
            options: livestock,
            placeholder: 'Select livestock',
        },
        {
            name: 'pregnancyUuid' as keyof AbortedPregnancy,
            label: 'Related Pregnancy',
            type: 'select',
            options: pregnancies,
            placeholder: 'Select pregnancy',
        },
        {
            name: 'eventDate' as keyof AbortedPregnancy,
            label: 'Abortion Date',
            type: 'date',
            required: true,
        },
        {
            name: 'reproductiveProblemId' as keyof AbortedPregnancy,
            label: 'Problem/Cause',
            type: 'select',
            options: problems,
            placeholder: 'Select problem',
        },
        {
            name: 'gestationStage' as keyof AbortedPregnancy,
            label: 'Gestation Stage',
            type: 'text',
            placeholder: 'e.g. 1st Trimester, 5 months',
        },
        {
            name: 'reasons' as keyof AbortedPregnancy,
            label: 'Reasons',
            type: 'textarea',
            placeholder: 'Describe the reason or circumstances',
        },
        {
            name: 'remarks' as keyof AbortedPregnancy,
            label: 'Remarks',
            type: 'textarea',
            placeholder: 'Additional comments',
        },
    ];

    const detailFields = [
        { key: 'uuid' as keyof AbortionDisplay, label: 'UUID' },
        { key: 'livestockName' as keyof AbortionDisplay, label: 'Livestock' },
        { key: 'farmName' as keyof AbortionDisplay, label: 'Farm' },
        { key: 'eventDate' as keyof AbortionDisplay, label: 'Date', render: (val: unknown) => val ? formatDate(String(val)) : '-' },
        { key: 'problemName' as keyof AbortionDisplay, label: 'Problem' },
        { key: 'gestationStage' as keyof AbortionDisplay, label: 'Gestation Stage' },
        { key: 'reasons' as keyof AbortionDisplay, label: 'Reason' },
        { key: 'remarks' as keyof AbortionDisplay, label: 'Remarks' },
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
            formFields={formFields as any}
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
