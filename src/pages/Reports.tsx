import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    FileText,
    FileSpreadsheet,
    FileDown,
    Beef,
    Building2,
    Users,
    Heart,
    ScrollText,
    ArrowRight,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { DataTable, DataTableColumn } from '../components/crud/DataTable';
import {
    livestockApi,
    farmApi,
    userApi,
    healthLogApi,
    referenceApi
} from '../services/api';
import { formatDate } from '../lib/utils';

// Report Categories
const REPORT_CATEGORIES = [
    {
        id: 'livestock',
        name: 'Livestock Inventory Report',
        category: 'Livestock',
        description: 'Complete list of all registered animals with their current status.',
        icon: Beef,
        fetchData: () => livestockApi.list(),
        filename: 'livestock_inventory_report'
    },
    {
        id: 'farms',
        name: 'Farm Directory Report',
        category: 'Farms',
        description: 'Overview of all registered farms and their locations.',
        icon: Building2,
        fetchData: () => farmApi.list(),
        filename: 'farm_directory_report'
    },
    {
        id: 'users',
        name: 'System User Audit',
        category: 'Users',
        description: 'Comprehensive list of administrative and field users.',
        icon: Users,
        fetchData: () => userApi.list(),
        filename: 'system_user_audit'
    },
    {
        id: 'vaccinations',
        name: 'Vaccination History',
        category: 'Health',
        description: 'Detailed log of all vaccinations administered across farms.',
        icon: Heart,
        fetchData: () => healthLogApi.vaccinations.list(),
        filename: 'vaccination_history_report'
    },
];

export function ReportsPage() {
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedReport = useMemo(() =>
        REPORT_CATEGORIES.find(r => r.id === selectedReportId) || null,
        [selectedReportId]);

    // Reference Maps for better data display (simplified for reports)
    const [speciesMap, setSpeciesMap] = useState<Map<number, string>>(new Map());
    const [breedsMap, setBreedsMap] = useState<Map<number, string>>(new Map());

    const loadReferenceData = useCallback(async () => {
        try {
            const [s, b] = await Promise.all([
                referenceApi.species.list(),
                referenceApi.breeds.list()
            ]);
            setSpeciesMap(new Map(s.map(i => [i.id, i.name])));
            setBreedsMap(new Map(b.map(i => [i.id, i.name])));
        } catch (e) {
            console.error('Failed to load reference data for reports', e);
        }
    }, []);

    useEffect(() => {
        loadReferenceData();
    }, [loadReferenceData]);

    const handleGenerateReport = useCallback(async (reportId: string) => {
        const report = REPORT_CATEGORIES.find(r => r.id === reportId);
        if (!report) return;

        setSelectedReportId(reportId);
        setLoading(true);
        setError(null);
        setData([]);

        try {
            const result = await report.fetchData();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch report data');
        } finally {
            setLoading(false);
        }
    }, []);

    // Column Definitions based on category
    const columns = useMemo(() => {
        if (selectedReportId === 'livestock') {
            return [
                { id: 'uuid', header: 'UUID', accessorFn: (row: any) => (row.uuid || '').slice(0, 8) },
                { id: 'tag', header: 'Tag ID', accessorFn: (row: any) => row.identificationNumber || row.identification_number || row.barcodeTagId || row.barcode_tag_id || '-' },
                { id: 'name', header: 'Name', accessorFn: (row: any) => row.name || '-' },
                { id: 'species', header: 'Species', accessorFn: (row: any) => row.species?.name || row.species_name || speciesMap.get(Number(row.speciesId || row.species_id)) || 'Unknown' },
                { id: 'breed', header: 'Breed', accessorFn: (row: any) => row.breed?.name || row.breed_name || breedsMap.get(Number(row.breedId || row.breed_id)) || 'Unknown' },
                { id: 'gender', header: 'Gender', accessorFn: (row: any) => row.gender || '-' },
                { id: 'status', header: 'Status', accessorFn: (row: any) => row.status || '-' },
                { id: 'dob', header: 'DOB', accessorFn: (row: any) => (row.dateOfBirth || row.date_of_birth) ? formatDate(row.dateOfBirth || row.date_of_birth) : '-' },
            ] as DataTableColumn<any>[];
        }
        if (selectedReportId === 'farms') {
            return [
                { id: 'name', header: 'Farm Name', accessorKey: 'name' },
                { id: 'ref', header: 'Reference No', accessorFn: (row: any) => row.referenceNo || row.reference_no || '-' },
                { id: 'type', header: 'Farm Type', accessorFn: (row: any) => row.farmType || row.farm_type || '-' },
                { id: 'size', header: 'Total Area', accessorFn: (row: any) => row.totalArea || row.total_area || '-' },
                { id: 'status', header: 'Status', accessorKey: 'status' },
                { id: 'created', header: 'Registered', accessorFn: (row: any) => formatDate(row.created_at) },
            ] as DataTableColumn<any>[];
        }
        if (selectedReportId === 'users') {
            return [
                { id: 'username', header: 'Username', accessorKey: 'username' },
                { id: 'name', header: 'Full Name', accessorFn: (row: any) => `${row.firstName || row.first_name || ''} ${row.surname || ''}`.trim() || row.username },
                { id: 'email', header: 'Email', accessorKey: 'email' },
                { id: 'role', header: 'Role', accessorKey: 'role' },
                { id: 'status', header: 'Status', accessorKey: 'status' },
            ] as DataTableColumn<any>[];
        }
        if (selectedReportId === 'vaccinations') {
            return [
                { id: 'date', header: 'Date', accessorFn: (row: any) => formatDate(row.vaccinationDate || row.vaccination_date) },
                { id: 'tag', header: 'Livestock ID', accessorFn: (row: any) => row.livestockIdentificationNumber || row.livestock_identification_number || row.livestockId || row.livestock_id || '-' },
                { id: 'vaccine', header: 'Vaccine', accessorFn: (row: any) => row.vaccineName || row.vaccine_name || '-' },
                { id: 'batch', header: 'Batch No', accessorFn: (row: any) => row.batchNumber || row.batch_number || '-' },
                { id: 'dose', header: 'Dose (ml)', accessorKey: 'dose' },
            ] as DataTableColumn<any>[];
        }
        return [];
    }, [selectedReportId, speciesMap, breedsMap]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Exportable Reports</h1>
                    <p className="text-slate-500 dark:text-slate-400">Professional reporting module for data audit and extraction.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium">
                    <ScrollText className="w-4 h-4" />
                    Live Data Mode
                </div>
            </div>

            {!selectedReportId ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {REPORT_CATEGORIES.map((report) => (
                        <div
                            key={report.id}
                            className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-all group cursor-pointer"
                            onClick={() => handleGenerateReport(report.id)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                    <report.icon className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    <FileDown className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
                                    <FileSpreadsheet className="w-4 h-4 text-slate-300 group-hover:text-green-500 transition-colors" />
                                    <FileText className="w-4 h-4 text-slate-300 group-hover:text-red-500 transition-colors" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{report.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{report.description}</p>
                            <div className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium">
                                Generate Data Preview
                                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedReportId(null)}
                                className="p-1 px-3 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg transition-all"
                            >
                                ← Back to Reports
                            </button>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedReport?.name}</h2>
                        </div>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                                <p className="text-slate-500 font-medium">Compiling report data...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
                                    <AlertCircle className="w-10 h-10 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">API Connection Error</h3>
                                    <p className="text-slate-500 max-w-md mt-1">{error}</p>
                                </div>
                                <button
                                    onClick={() => handleGenerateReport(selectedReportId)}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                                >
                                    Retry Connection
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-4 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 rounded-lg flex items-start gap-3">
                                    <FileDown className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="text-primary-900 dark:text-primary-200 font-bold mb-0.5">Report Ready for Export</p>
                                        <p className="text-primary-700 dark:text-primary-300">
                                            Found {data.length} records. Use the buttons below to export as **CSV, Excel, or PDF**.
                                            The export will include all filtered data currently visible in the preview.
                                        </p>
                                    </div>
                                </div>

                                <DataTable
                                    data={data}
                                    columns={columns}
                                    exportFilename={selectedReport?.filename || 'report'}
                                    enableExport={true}
                                    loading={loading}
                                    emptyMessage="No records found for this report criteria."
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReportsPage;
