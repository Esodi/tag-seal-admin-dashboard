import React, { useState, useCallback } from 'react';
import { X, Plus, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DataTable, DataTableColumn, DataTableProps } from './DataTable';
import { FormBuilder, FormField } from './FormBuilder';

// Modal component
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, size = 'md', children }: ModalProps) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[90vw]',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className={cn(
                        'relative w-full bg-white dark:bg-slate-900 rounded-xl shadow-xl',
                        sizeClasses[size]
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 max-h-[70vh] overflow-y-auto">{children}</div>
                </div>
            </div>
        </div>
    );
}

// Delete confirmation dialog
interface DeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    loading?: boolean;
}

export function DeleteDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Delete',
    message = 'Are you sure you want to delete this item? This action cannot be undone.',
    loading = false,
}: DeleteDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            {title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            {message}
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {loading && (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                )}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Detail view component
interface DetailViewProps<T> {
    data: T;
    fields: { key: keyof T | string; label: string; render?: (value: unknown, data: T) => React.ReactNode }[];
    className?: string;
}

export function DetailView<T extends Record<string, unknown>>({
    data,
    fields,
    className,
}: DetailViewProps<T>) {
    return (
        <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
            {fields.map((field) => {
                const value = data[field.key as keyof T];
                return (
                    <div key={String(field.key)} className="space-y-1">
                        <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {field.label}
                        </dt>
                        <dd className="text-sm text-slate-900 dark:text-white">
                            {field.render ? field.render(value, data) : String(value ?? '-')}
                        </dd>
                    </div>
                );
            })}
        </div>
    );
}

// Main CrudPage component
export interface CrudPageProps<T extends { id: number | string }> {
    // Title and description
    title: string;
    description?: string;

    // Data
    data: T[];
    loading?: boolean;

    // Table configuration
    columns: DataTableColumn<T>[];
    tableProps?: Partial<DataTableProps<T>>;

    // Form configuration
    formFields: FormField<Partial<T>>[];
    formColumns?: 1 | 2 | 3 | 4;

    // Detail view configuration
    detailFields?: { key: keyof T | string; label: string; render?: (value: unknown, data: T) => React.ReactNode }[];

    // CRUD operations
    onCreate?: (data: Partial<T>) => Promise<void>;
    onUpdate?: (id: number | string, data: Partial<T>) => Promise<void>;
    onDelete?: (id: number | string) => Promise<void>;
    onBulkDelete?: (ids: (number | string)[]) => Promise<void>;

    // Callbacks
    onRefresh?: () => void;

    // Permissions (hide buttons if not allowed)
    canCreate?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    canView?: boolean;

    // Labels
    createLabel?: string;

    // Modal sizes
    createModalSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    editModalSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    viewModalSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

    // Error state
    error?: string;

    // Custom header actions
    headerActions?: React.ReactNode;
}

export function CrudPage<T extends { id: number | string }>({
    title,
    description,
    data,
    loading = false,
    columns,
    tableProps,
    formFields,
    formColumns = 2,
    detailFields,
    onCreate,
    onUpdate,
    onDelete,
    onBulkDelete,
    onRefresh,
    canCreate = true,
    canEdit = true,
    canDelete = true,
    canView = true,
    createLabel = 'Create New',
    createModalSize = 'lg',
    editModalSize = 'lg',
    viewModalSize = 'md',
    error,
    headerActions,
}: CrudPageProps<T>) {
    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Selected item for edit/view/delete
    const [selectedItem, setSelectedItem] = useState<T | null>(null);

    // Operation states
    const [submitLoading, setSubmitLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | undefined>();

    // Handle create
    const handleCreate = useCallback(async (formData: Partial<T>) => {
        if (!onCreate) return;
        setSubmitLoading(true);
        setSubmitError(undefined);
        try {
            await onCreate(formData);
            setShowCreateModal(false);
            onRefresh?.();
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Failed to create');
        } finally {
            setSubmitLoading(false);
        }
    }, [onCreate, onRefresh]);

    // Handle update
    const handleUpdate = useCallback(async (formData: Partial<T>) => {
        if (!onUpdate || !selectedItem) return;
        setSubmitLoading(true);
        setSubmitError(undefined);
        try {
            await onUpdate(selectedItem.id, formData);
            setShowEditModal(false);
            setSelectedItem(null);
            onRefresh?.();
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Failed to update');
        } finally {
            setSubmitLoading(false);
        }
    }, [onUpdate, selectedItem, onRefresh]);

    // Handle delete
    const handleDelete = useCallback(async () => {
        if (!onDelete || !selectedItem) return;
        setDeleteLoading(true);
        try {
            await onDelete(selectedItem.id);
            setShowDeleteDialog(false);
            setSelectedItem(null);
            onRefresh?.();
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
            setDeleteLoading(false);
        }
    }, [onDelete, selectedItem, onRefresh]);

    // Handle bulk delete
    const handleBulkDelete = useCallback(async (rows: T[]) => {
        if (!onBulkDelete) return;
        const ids = rows.map((r) => r.id);
        try {
            await onBulkDelete(ids);
            onRefresh?.();
        } catch (err) {
            console.error('Bulk delete failed:', err);
        }
    }, [onBulkDelete, onRefresh]);

    // Row actions
    const handleViewClick = useCallback((item: T) => {
        setSelectedItem(item);
        setShowViewModal(true);
    }, []);

    const handleEditClick = useCallback((item: T) => {
        setSelectedItem(item);
        setSubmitError(undefined);
        setShowEditModal(true);
    }, []);

    const handleDeleteClick = useCallback((item: T) => {
        setSelectedItem(item);
        setShowDeleteDialog(true);
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
                    {description && (
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{description}</p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {headerActions}
                    {canCreate && onCreate && (
                        <button
                            onClick={() => {
                                setSubmitError(undefined);
                                setShowCreateModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            {createLabel}
                        </button>
                    )}
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                    {error}
                </div>
            )}

            {/* Data Table */}
            <div className="card p-4">
                <DataTable
                    data={data}
                    columns={columns}
                    loading={loading}
                    onView={canView && detailFields ? handleViewClick : undefined}
                    onEdit={canEdit && onUpdate ? handleEditClick : undefined}
                    onDelete={canDelete && onDelete ? handleDeleteClick : undefined}
                    onBulkDelete={canDelete && onBulkDelete ? handleBulkDelete : undefined}
                    enableRowSelection={!!onBulkDelete}
                    {...tableProps}
                />
            </div>

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title={`Create ${title}`}
                size={createModalSize}
            >
                <FormBuilder
                    fields={formFields}
                    onSubmit={handleCreate}
                    onCancel={() => setShowCreateModal(false)}
                    submitLabel="Create"
                    columns={formColumns}
                    loading={submitLoading}
                    error={submitError}
                />
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedItem(null);
                }}
                title={`Edit ${title}`}
                size={editModalSize}
            >
                {selectedItem && (
                    <FormBuilder
                        fields={formFields}
                        initialValues={selectedItem as Partial<T>}
                        onSubmit={handleUpdate}
                        onCancel={() => {
                            setShowEditModal(false);
                            setSelectedItem(null);
                        }}
                        submitLabel="Save Changes"
                        columns={formColumns}
                        loading={submitLoading}
                        error={submitError}
                    />
                )}
            </Modal>

            {/* View Modal */}
            <Modal
                isOpen={showViewModal}
                onClose={() => {
                    setShowViewModal(false);
                    setSelectedItem(null);
                }}
                title={`${title} Details`}
                size={viewModalSize}
            >
                {selectedItem && detailFields && (
                    <DetailView data={selectedItem as unknown as Record<string, unknown>} fields={detailFields as { key: string; label: string; render?: (value: unknown, data: Record<string, unknown>) => React.ReactNode }[]} />
                )}
            </Modal>

            {/* Delete Confirmation */}
            <DeleteDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setSelectedItem(null);
                }}
                onConfirm={handleDelete}
                loading={deleteLoading}
            />
        </div>
    );
}

export default CrudPage;
