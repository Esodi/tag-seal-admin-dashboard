import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { inseminationApi, livestockApi, inseminationServiceApi, semenStrawTypeApi, heatTypeApi, vetApi } from '../../services/api';
import { Insemination, Livestock, InseminationService, SemenStrawType, HeatType, Vet } from '../../types/entities';
import { formatDate } from '../../lib/utils';

// Extended type for display
interface InseminationDisplay extends Insemination {
    livestockName?: string;
    serviceName?: string;
    strawTypeName?: string;
    heatTypeName?: string;
    technicianName?: string;
}

export function InseminationsPage() {
    const [data, setData] = useState<InseminationDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [females, setFemales] = useState<SelectOption[]>([]);
    const [services, setServices] = useState<SelectOption[]>([]);
    const [strawTypes, setStrawTypes] = useState<SelectOption[]>([]);
    const [heatTypes, setHeatTypes] = useState<SelectOption[]>([]);
    const [technicians, setTechnicians] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [
                inseminationsData,
                livestockData,
                servicesData,
                strawsData,
                heatsData,
                vetsData
            ] = await Promise.all([
                inseminationApi.list(),
                livestockApi.list(),
                inseminationServiceApi.list(),
                semenStrawTypeApi.list(),
                heatTypeApi.list(),
                vetApi.list(),
            ]);

            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.id, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const serviceMap = new Map(servicesData.map((s: InseminationService) => [s.id, s.name]));
            const strawMap = new Map(strawsData.map((s: SemenStrawType) => [s.id, s.name]));
            const heatMap = new Map(heatsData.map((h: HeatType) => [h.id, h.name]));
            const vetMap = new Map(vetsData.map((v: Vet) => [v.id, `${v.firstName} ${v.lastName}`]));

            const enrichedData = inseminationsData.map((i: Insemination) => ({
                ...i,
                livestockName: i.livestockId ? livestockMap.get(i.livestockId) : '-',
                serviceName: i.inseminationServiceId ? serviceMap.get(i.inseminationServiceId) : '-',
                strawTypeName: i.semenStrawTypeId ? strawMap.get(i.semenStrawTypeId) : '-',
                heatTypeName: i.heatTypeId ? heatMap.get(i.heatTypeId) : '-',
                technicianName: i.technicianId ? vetMap.get(i.technicianId) : '-',
            }));

            setData(enrichedData);

            setFemales(livestockData
                .filter((l: Livestock) => l.gender === 'female')
                .map((l: Livestock) => ({
                    value: l.id,
                    label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
                })));

            setServices(servicesData.map((s: InseminationService) => ({ value: s.id, label: s.name })));
            setStrawTypes(strawsData.map((s: SemenStrawType) => ({ value: s.id, label: s.name })));
            setHeatTypes(heatsData.map((h: HeatType) => ({ value: h.id, label: h.name })));
            setTechnicians(vetsData.map((v: Vet) => ({ value: v.id, label: `${v.firstName} ${v.lastName}` })));

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
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'livestockName', header: 'Female', accessorKey: 'livestockName' },
        {
            id: 'inseminationDate',
            header: 'Date',
            accessorFn: (row) => formatDate(row.inseminationDate),
        },
        { id: 'serviceName', header: 'Service', accessorKey: 'serviceName' },
        { id: 'technicianName', header: 'Technician', accessorKey: 'technicianName' },
        {
            id: 'successful',
            header: 'Successful',
            accessorFn: (row) => row.successful === undefined ? '-' : (row.successful ? 'Yes' : 'No'),
            size: 100
        },
    ];

    const formFields: FormField<Partial<Insemination>>[] = [
        {
            name: 'livestockId',
            label: 'Animal',
            type: 'select',
            required: true,
            options: females,
            placeholder: 'Select female',
        },
        {
            name: 'inseminationDate',
            label: 'Date',
            type: 'date',
            required: true,
        },
        {
            name: 'inseminationServiceId',
            label: 'Service Type',
            type: 'select',
            options: services,
            placeholder: 'Select service',
        },
        {
            name: 'semenStrawTypeId',
            label: 'Semen/Straw Type',
            type: 'select',
            options: strawTypes,
            placeholder: 'Select type',
        },
        {
            name: 'sireId',
            label: 'Sire / Bull / Straw ID',
            type: 'text',
            placeholder: 'Bull Name or Straw Code',
        },
        {
            name: 'technicianId',
            label: 'Technician / Vet',
            type: 'select',
            options: technicians,
            placeholder: 'Select technician',
        },
        {
            name: 'heatTypeId',
            label: 'Heat Signs',
            type: 'select',
            options: heatTypes,
            placeholder: 'Observed heat',
        },
        {
            name: 'successful',
            label: 'Successful?',
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
        { key: 'id' as keyof InseminationDisplay, label: 'ID' },
        { key: 'livestockName' as keyof InseminationDisplay, label: 'Animal' },
        { key: 'inseminationDate' as keyof InseminationDisplay, label: 'Date', render: (val: unknown) => formatDate(String(val)) },
        { key: 'serviceName' as keyof InseminationDisplay, label: 'Service' },
        { key: 'strawTypeName' as keyof InseminationDisplay, label: 'Straw Type' },
        { key: 'sireId' as keyof InseminationDisplay, label: 'Sire/Straw ID' },
        { key: 'technicianName' as keyof InseminationDisplay, label: 'Technician' },
        { key: 'heatTypeName' as keyof InseminationDisplay, label: 'Heat Sign' },
        { key: 'successful' as keyof InseminationDisplay, label: 'Successful', render: (val: unknown) => val === undefined ? '-' : (val ? 'Yes' : 'No') },
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
            formFields={formFields}
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
