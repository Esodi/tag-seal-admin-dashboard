import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

// Field types
export type FieldType =
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'textarea'
    | 'select'
    | 'async-select'
    | 'date'
    | 'datetime'
    | 'checkbox'
    | 'toggle'
    | 'file'
    | 'hidden';

// Field configuration
export interface FormField<T = unknown> {
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    hidden?: boolean;

    // Validation
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    validate?: (value: unknown, formData: T) => string | undefined;

    // Select options
    options?: { value: string | number; label: string }[];

    // Async select
    loadOptions?: (search: string) => Promise<{ value: string | number; label: string }[]>;

    // Layout
    colSpan?: 1 | 2 | 3 | 4;
    className?: string;

    // Conditional visibility
    showWhen?: (formData: T) => boolean;

    // Help text
    helpText?: string;

    // Default value
    defaultValue?: unknown;
}

// Form props
export interface FormBuilderProps<T extends Record<string, unknown>> {
    fields: FormField<T>[];
    initialValues?: Partial<T>;
    onSubmit: (data: T) => Promise<void> | void;
    onCancel?: () => void;

    // Labels
    submitLabel?: string;
    cancelLabel?: string;

    // Layout
    columns?: 1 | 2 | 3 | 4;

    // State
    loading?: boolean;
    error?: string;

    // Styling
    className?: string;
}

// Validation result
interface ValidationErrors {
    [key: string]: string;
}

// Individual field component
function FormFieldComponent<T>({
    field,
    value,
    error,
    onChange,
    formData,
}: {
    field: FormField<T>;
    value: unknown;
    error?: string;
    onChange: (name: string, value: unknown) => void;
    formData: Record<string, unknown>;
}) {
    const [asyncOptions, setAsyncOptions] = useState<{ value: string | number; label: string }[]>([]);
    const [asyncLoading, setAsyncLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Load async options
    useEffect(() => {
        if (field.type === 'async-select' && field.loadOptions) {
            const loadData = async () => {
                setAsyncLoading(true);
                try {
                    const options = await field.loadOptions!(searchTerm);
                    setAsyncOptions(options);
                } catch (err) {
                    console.error('Failed to load options:', err);
                } finally {
                    setAsyncLoading(false);
                }
            };
            loadData();
        }
    }, [field.type, field.loadOptions, searchTerm]);

    // Check visibility
    if (field.hidden) return null;
    if (field.showWhen && !field.showWhen(formData as T)) return null;

    const baseInputClass = cn(
        'w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800',
        'text-slate-900 dark:text-slate-100 placeholder-slate-400',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        'disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed',
        error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-slate-200 dark:border-slate-700'
    );

    const renderField = () => {
        switch (field.type) {
            case 'hidden':
                return (
                    <input
                        type="hidden"
                        name={field.name}
                        value={String(value ?? '')}
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        name={field.name}
                        value={String(value ?? '')}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        required={field.required}
                        minLength={field.minLength}
                        maxLength={field.maxLength}
                        rows={4}
                        className={cn(baseInputClass, 'resize-y')}
                    />
                );

            case 'select':
                return (
                    <select
                        name={field.name}
                        value={String(value ?? '')}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        disabled={field.disabled}
                        required={field.required}
                        className={baseInputClass}
                    >
                        <option value="">{field.placeholder || 'Select...'}</option>
                        {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );

            case 'async-select':
                return (
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={field.placeholder || 'Type to search...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={baseInputClass}
                            disabled={field.disabled}
                        />
                        {asyncLoading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                        {asyncOptions.length > 0 && searchTerm && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
                                {asyncOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(field.name, opt.value);
                                            setSearchTerm(opt.label);
                                        }}
                                        className={cn(
                                            'w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700',
                                            value === opt.value && 'bg-primary-50 dark:bg-primary-900/20'
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'checkbox':
                return (
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name={field.name}
                            checked={Boolean(value)}
                            onChange={(e) => onChange(field.name, e.target.checked)}
                            disabled={field.disabled}
                            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                            {field.placeholder}
                        </span>
                    </div>
                );

            case 'toggle':
                return (
                    <button
                        type="button"
                        onClick={() => onChange(field.name, !value)}
                        disabled={field.disabled}
                        className={cn(
                            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                            value ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600',
                            field.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        <span
                            className={cn(
                                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                value ? 'translate-x-6' : 'translate-x-1'
                            )}
                        />
                    </button>
                );

            case 'file':
                return (
                    <input
                        type="file"
                        name={field.name}
                        onChange={(e) => onChange(field.name, e.target.files?.[0] || null)}
                        disabled={field.disabled}
                        className={cn(
                            baseInputClass,
                            'file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0',
                            'file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700',
                            'hover:file:bg-primary-100'
                        )}
                    />
                );

            case 'date':
                return (
                    <input
                        type="date"
                        name={field.name}
                        value={String(value ?? '')}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        disabled={field.disabled}
                        required={field.required}
                        min={field.min ? String(field.min) : undefined}
                        max={field.max ? String(field.max) : undefined}
                        className={baseInputClass}
                    />
                );

            case 'datetime':
                return (
                    <input
                        type="datetime-local"
                        name={field.name}
                        value={String(value ?? '')}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        disabled={field.disabled}
                        required={field.required}
                        className={baseInputClass}
                    />
                );

            default:
                return (
                    <input
                        type={field.type}
                        name={field.name}
                        value={String(value ?? '')}
                        onChange={(e) => onChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        required={field.required}
                        minLength={field.minLength}
                        maxLength={field.maxLength}
                        min={field.min}
                        max={field.max}
                        pattern={field.pattern?.source}
                        className={baseInputClass}
                    />
                );
        }
    };

    // Hidden fields don't need labels
    if (field.type === 'hidden') {
        return renderField();
    }

    return (
        <div
            className={cn(
                'space-y-1',
                field.colSpan === 2 && 'sm:col-span-2',
                field.colSpan === 3 && 'sm:col-span-3',
                field.colSpan === 4 && 'sm:col-span-4',
                field.className
            )}
        >
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField()}
            {field.helpText && !error && (
                <p className="text-xs text-slate-500">{field.helpText}</p>
            )}
            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </p>
            )}
        </div>
    );
}

// Main FormBuilder component
export function FormBuilder<T extends Record<string, unknown>>({
    fields,
    initialValues = {},
    onSubmit,
    onCancel,
    submitLabel = 'Save',
    cancelLabel = 'Cancel',
    columns = 2,
    loading = false,
    error,
    className,
}: FormBuilderProps<T>) {
    // Initialize form data with defaults
    const getInitialData = useCallback(() => {
        const data: Record<string, unknown> = {};
        fields.forEach((field) => {
            if (field.name in initialValues) {
                data[field.name] = initialValues[field.name as keyof typeof initialValues];
            } else if (field.defaultValue !== undefined) {
                data[field.name] = field.defaultValue;
            } else if (field.type === 'checkbox' || field.type === 'toggle') {
                data[field.name] = false;
            } else {
                data[field.name] = '';
            }
        });
        return data as T;
    }, [fields, initialValues]);

    const [formData, setFormData] = useState<T>(getInitialData);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when initialValues change
    useEffect(() => {
        setFormData(getInitialData());
    }, [getInitialData]);

    // Handle field change
    const handleChange = useCallback((name: string, value: unknown) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when field is modified
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [errors]);

    // Validate all fields
    const validate = useCallback((): boolean => {
        const newErrors: ValidationErrors = {};

        fields.forEach((field) => {
            const value = formData[field.name as keyof T];

            // Skip hidden or conditionally hidden fields
            if (field.hidden) return;
            if (field.showWhen && !field.showWhen(formData)) return;

            // Required check
            if (field.required && (value === undefined || value === null || value === '')) {
                newErrors[field.name] = `${field.label} is required`;
                return;
            }

            // Custom validation
            if (field.validate) {
                const customError = field.validate(value, formData);
                if (customError) {
                    newErrors[field.name] = customError;
                    return;
                }
            }

            // String validations
            if (typeof value === 'string') {
                if (field.minLength && value.length < field.minLength) {
                    newErrors[field.name] = `${field.label} must be at least ${field.minLength} characters`;
                    return;
                }
                if (field.maxLength && value.length > field.maxLength) {
                    newErrors[field.name] = `${field.label} must be at most ${field.maxLength} characters`;
                    return;
                }
                if (field.pattern && !field.pattern.test(value)) {
                    newErrors[field.name] = `${field.label} format is invalid`;
                    return;
                }
            }

            // Number validations
            if (field.type === 'number' && typeof value === 'number') {
                if (field.min !== undefined && value < field.min) {
                    newErrors[field.name] = `${field.label} must be at least ${field.min}`;
                    return;
                }
                if (field.max !== undefined && value > field.max) {
                    newErrors[field.name] = `${field.label} must be at most ${field.max}`;
                    return;
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [fields, formData]);

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } catch (err) {
            console.error('Form submit error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    };

    return (
        <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
            {/* Error banner */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Fields grid */}
            <div className={cn('grid gap-4', gridCols[columns])}>
                {fields.map((field) => (
                    <FormFieldComponent
                        key={field.name}
                        field={field}
                        value={formData[field.name as keyof T]}
                        error={errors[field.name]}
                        onChange={handleChange}
                        formData={formData as Record<string, unknown>}
                    />
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting || loading}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {cancelLabel}
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    {(isSubmitting || loading) && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}

export default FormBuilder;
