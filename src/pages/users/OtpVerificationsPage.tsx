import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn } from '../../components/crud';
import { otpVerificationApi } from '../../services/api';
import { OtpVerification } from '../../types/entities';
import { formatDate } from '../../lib/utils';

export function OtpVerificationsPage() {
    const [verifications, setVerifications] = useState<OtpVerification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const data = await otpVerificationApi.list();
            setVerifications(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load verifications');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<OtpVerification>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'phone', header: 'Phone', accessorKey: 'phone' },
        { id: 'otp', header: 'OTP Code', accessorKey: 'otp' },
        {
            id: 'expiresAt',
            header: 'Expires At',
            accessorFn: (row) => row.expiresAt ? formatDate(row.expiresAt) : '-'
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'id', // Dummy accessor
            cell: ({ row }) => {
                const expires = new Date(row.original.expiresAt);
                const now = new Date();
                const isExpired = now > expires;
                return (
                    <span className={`badge ${isExpired ? 'badge-danger' : 'badge-success'}`}>
                        {isExpired ? 'Expired' : 'Active'}
                    </span>
                );
            },
            enableSorting: false,
        },
    ];

    const detailFields = [
        { key: 'id' as keyof OtpVerification, label: 'ID' },
        { key: 'phone' as keyof OtpVerification, label: 'Phone' },
        { key: 'otp' as keyof OtpVerification, label: 'OTP Code' },
        {
            key: 'expiresAt' as keyof OtpVerification,
            label: 'Expires At',
            render: (value: unknown) => value ? formatDate(String(value)) : '-',
        },
        {
            key: 'created_at' as keyof OtpVerification,
            label: 'Created',
            render: (value: unknown) => value ? formatDate(String(value)) : '-',
        },
    ];

    const handleDelete = async (id: number | string) => {
        await otpVerificationApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="OTP Verifications"
            description={`SMS verification codes - ${verifications.length} records`}
            data={verifications}
            loading={loading}
            error={error}
            columns={columns}
            formFields={[]} // Read-only mostly
            detailFields={detailFields}
            onDelete={handleDelete}
            onRefresh={fetchData}
        />
    );
}

export default OtpVerificationsPage;
