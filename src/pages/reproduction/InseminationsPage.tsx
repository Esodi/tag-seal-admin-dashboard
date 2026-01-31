import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { inseminationApi, livestockApi, inseminationServiceApi, semenStrawTypeApi, heatTypeApi, farmApi } from '../../services/api';
import { Insemination, Livestock, InseminationService, SemenStrawType, HeatType, Farm } from '../../types/entities';
import { formatDate } from '../../lib/utils';

// Extended type for display
interface InseminationDisplay extends Insemination {
    livestockName?: string;
    farmName?: string;
    serviceName?: string;
    strawTypeName?: string;
}

export function InseminationsPage() {
    const [data, setData] = useState<InseminationDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [livestock, setLivestock] = useState<SelectOption[]>([]);
    const [farms, setFarms] = useState<SelectOption[]>([]);
    const [services, setServices] = useState<SelectOption[]>([]);
    const [strawTypes, setStrawTypes] = useState<SelectOption[]>([]);
    const [heatTypes, setHeatTypes] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [
                inseminationsData,
                livestockData,
                farmsData,
                servicesData,
                strawsData,
                heatsData
            ] = await Promise.all([
                inseminationApi.list(),
                livestockApi.list(),
                farmApi.list(),
                inseminationServiceApi.list(),
                semenStrawTypeApi.list(),
                heatTypeApi.list(),
            ]);

            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.uuid, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const farmMap = new Map(farmsData.map((f: Farm) => [f.uuid, f.name]));
            const serviceMap = new Map(servicesData.map((s: InseminationService) => [s.id, s.name]));
            const strawMap = new Map(strawsData.map((s: SemenStrawType) => [s.id, s.name]));

            const enrichedData = inseminationsData.map((i: Insemination) => ({
                ...i,
                livestockName: i.livestockUuid ? livestockMap.get(i.livestockUuid) : '-',
                farmName: i.farmUuid ? farmMap.get(i.farmUuid) : '-',
                serviceName: i.inseminationServiceId ? serviceMap.get(i.inseminationServiceId) : '-',
                strawTypeName: i.semenStrawTypeId ? strawMap.get(i.semenStrawTypeId) : '-',
            }));

            setData(enrichedData);

            setLivestock(livestockData
                .map((l: Livestock) => ({
                    value: l.uuid,
                    label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
                })));

            setFarms(farmsData.map((f: Farm) => ({ value: f.uuid, label: f.name })));
            setServices(servicesData.map((s: InseminationService) => ({ value: s.id, label: s.name })));
            setStrawTypes(strawsData.map((s: SemenStrawType) => ({ value: s.id, label: s.name })));
            setHeatTypes(heatsData.map((h: HeatType) => ({ value: h.id, label: h.name })));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load insemination records');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<InseminationDisplay>[] = [
        { id: 'uuid', header: 'UUID', accessorKey: 'uuid', size: 100 },
        { id: 'livestockName', header: 'Animal', accessorKey: 'livestockName' },
        { id: 'farmName', header: 'Farm', accessorKey: 'farmName' },
        {
            id: 'inseminationDate',
            header: 'Date',
            accessorFn: (row) => row.inseminationDate ? formatDate(row.inseminationDate) : '-',
        },
        { id: 'serviceName', header: 'Service', accessorKey: 'serviceName' },
        { id: 'bullCode', header: 'Bull Code', accessorKey: 'bullCode' },
    ];

    const formFields: FormField<Insemination>[] = [
        {
            name: 'farmUuid' as keyof Insemination,
            label: 'Farm',
            type: 'select',
            required: true,
            options: farms,
            placeholder: 'Select farm',
        },
        {
            name: 'livestockUuid' as keyof Insemination,
            label: 'Animal',
            type: 'select',
            required: true,
            options: livestock,
            placeholder: 'Select livestock',
        },
        {
            name: 'inseminationDate' as keyof Insemination,
            label: 'Insemination Date',
            type: 'date',
            required: true,
        },
        {
            name: 'inseminationServiceId' as keyof Insemination,
            label: 'Service Type',
            type: 'select',
            options: services,
            placeholder: 'Select service',
        },
        {
            name: 'semenStrawTypeId' as keyof Insemination,
            label: 'Semen/Straw Type',
            type: 'select',
            options: strawTypes,
            placeholder: 'Select type',
        },
        {
            name: 'currentHeatTypeId' as keyof Insemination,
            label: 'Heat Signs',
            type: 'select',
            options: heatTypes,
            placeholder: 'Observed heat',
        },
        {
            name: 'bullCode' as keyof Insemination,
            label: 'Bull Code',
            type: 'text',
        },
        {
            name: 'bullBreed' as keyof Insemination,
            label: 'Bull Breed',
            type: 'text',
        },
        {
            name: 'semenProductionDate' as keyof Insemination,
            label: 'Semen Production Date',
            type: 'date',
        },
        {
            name: 'productionCountry' as keyof Insemination,
            label: 'Production Country',
            type: 'text',
        },
        {
            name: 'semenBatchNumber' as keyof Insemination,
            label: 'Semen Batch Number',
            type: 'text',
        },
        {
            name: 'notes' as keyof Insemination,
            label: 'Notes',
            type: 'textarea',
            placeholder: 'Comments',
        },
    ];

    const detailFields = [
        { key: 'uuid' as keyof InseminationDisplay, label: 'UUID' },
        { key: 'livestockName' as keyof InseminationDisplay, label: 'Animal' },
        { key: 'farmName' as keyof InseminationDisplay, label: 'Farm' },
        { key: 'inseminationDate' as keyof InseminationDisplay, label: 'Date', render: (val: unknown) => val ? formatDate(String(val)) : '-' },
        { key: 'serviceName' as keyof InseminationDisplay, label: 'Service' },
        { key: 'strawTypeName' as keyof InseminationDisplay, label: 'Straw Type' },
        { key: 'bullCode' as keyof InseminationDisplay, label: 'Bull Code' },
        { key: 'bullBreed' as keyof InseminationDisplay, label: 'Bull Breed' },
        { key: 'semenProductionDate' as keyof InseminationDisplay, label: 'Production Date', render: (val: unknown) => val ? formatDate(String(val)) : '-' },
        { key: 'productionCountry' as keyof InseminationDisplay, label: 'Production Country' },
        { key: 'semenBatchNumber' as keyof InseminationDisplay, label: 'Batch Number' },
        { key: 'notes' as keyof InseminationDisplay, label: 'Notes' },
        { key: 'created_at' as keyof InseminationDisplay, label: 'Created At', render: (val: unknown) => formatDate(String(val)) },
    ];

    const handleCreate = async (item: Partial<Insemination>) => {
        await inseminationApi.create(item as Insemination);
    };

    const handleUpdate = async (id: number | string, item: Partial<Insemination>) => {
        await inseminationApi.update(Number(id), item as Insemination);
    };

    const handleDelete = async (id: number | string) => {
        await inseminationApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Inseminations"
            description="Record breeding/insemination events"
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
            createLabel="Record Insemination"
            createModalSize="lg"
            editModalSize="lg"
        />
    );
}

export default InseminationsPage;
