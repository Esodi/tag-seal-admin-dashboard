import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { locationApi } from '../../services/api';
import { Country } from '../../types/entities';

export function CountriesPage() {
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const data = await locationApi.countries.list();
            setCountries(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load countries');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<Country>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Country Name', accessorKey: 'name' },
    ];

    const formFields: FormField<Partial<Country>>[] = [
        {
            name: 'name',
            label: 'Country Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Tanzania',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof Country, label: 'ID' },
        { key: 'name' as keyof Country, label: 'Country Name' },
    ];

    const handleCreate = async (data: Partial<Country>) => {
        await locationApi.countries.create(data as Country);
    };

    const handleUpdate = async (id: number | string, data: Partial<Country>) => {
        await locationApi.countries.update(Number(id), data as Country);
    };

    const handleDelete = async (id: number | string) => {
        await locationApi.countries.delete(Number(id));
    };

    return (
        <CrudPage
            title="Countries"
            description="Manage country records in the system"
            data={countries}
            loading={loading}
            error={error}
            columns={columns}
            formFields={formFields}
            detailFields={detailFields}
            formColumns={1}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onRefresh={fetchData}
            createLabel="Add Country"
            createModalSize="sm"
            editModalSize="sm"
        />
    );
}

export default CountriesPage;
