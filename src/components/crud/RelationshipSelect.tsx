import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

export interface RelationshipSelectProps {
    // Value
    value?: string | number | null;
    onChange: (value: string | number | null) => void;

    // Options
    options?: SelectOption[];
    loadOptions?: (search: string) => Promise<SelectOption[]>;

    // Display
    placeholder?: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    helpText?: string;

    // Behavior
    clearable?: boolean;
    searchable?: boolean;
    debounceMs?: number;

    // Styling
    className?: string;
}

export function RelationshipSelect({
    value,
    onChange,
    options: staticOptions,
    loadOptions,
    placeholder = 'Select...',
    label,
    required = false,
    disabled = false,
    error,
    helpText,
    clearable = true,
    searchable = true,
    debounceMs = 300,
    className,
}: RelationshipSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [options, setOptions] = useState<SelectOption[]>(staticOptions || []);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

    // Get selected option label
    const selectedOption = options.find((opt) => opt.value === value);

    // Load options when search changes
    useEffect(() => {
        if (!loadOptions) return;

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const results = await loadOptions(search);
                setOptions(results);
            } catch (err) {
                console.error('Failed to load options:', err);
            } finally {
                setLoading(false);
            }
        }, debounceMs);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [search, loadOptions, debounceMs]);

    // Update options when static options change
    useEffect(() => {
        if (staticOptions) {
            setOptions(staticOptions);
        }
    }, [staticOptions]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
        } else if (e.key === 'Enter' && !isOpen) {
            setIsOpen(true);
            e.preventDefault();
        }
    }, [isOpen]);

    // Filter options based on search (for static options)
    const filteredOptions = search && !loadOptions
        ? options.filter((opt) =>
            opt.label.toLowerCase().includes(search.toLowerCase())
        )
        : options;

    const handleSelect = (opt: SelectOption) => {
        if (opt.disabled) return;
        onChange(opt.value);
        setSearch('');
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        setSearch('');
    };

    return (
        <div className={cn('space-y-1', className)} ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <div
                    className={cn(
                        'flex items-center gap-2 w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 cursor-pointer',
                        'text-slate-900 dark:text-slate-100',
                        'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent',
                        disabled && 'bg-slate-100 dark:bg-slate-700 cursor-not-allowed',
                        error
                            ? 'border-red-500 focus-within:ring-red-500'
                            : 'border-slate-200 dark:border-slate-700'
                    )}
                    onClick={() => {
                        if (!disabled) {
                            setIsOpen(!isOpen);
                            if (!isOpen && inputRef.current) {
                                inputRef.current.focus();
                            }
                        }
                    }}
                >
                    {searchable ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={isOpen ? search : selectedOption?.label || ''}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                if (!isOpen) setIsOpen(true);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            disabled={disabled}
                            className="flex-1 bg-transparent outline-none placeholder-slate-400 disabled:cursor-not-allowed"
                        />
                    ) : (
                        <span className={cn('flex-1', !selectedOption && 'text-slate-400')}>
                            {selectedOption?.label || placeholder}
                        </span>
                    )}

                    <div className="flex items-center gap-1">
                        {loading && (
                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        )}
                        {clearable && value && !disabled && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="p-0.5 text-slate-400 hover:text-slate-600 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <ChevronDown
                            className={cn(
                                'w-4 h-4 text-slate-400 transition-transform',
                                isOpen && 'rotate-180'
                            )}
                        />
                    </div>
                </div>

                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-slate-500 text-center">
                                {loading ? 'Loading...' : 'No options found'}
                            </div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleSelect(opt)}
                                    disabled={opt.disabled}
                                    className={cn(
                                        'w-full px-3 py-2 text-left text-sm flex items-center gap-2',
                                        'hover:bg-slate-50 dark:hover:bg-slate-700',
                                        opt.disabled && 'opacity-50 cursor-not-allowed',
                                        value === opt.value && 'bg-primary-50 dark:bg-primary-900/20'
                                    )}
                                >
                                    {value === opt.value && (
                                        <Check className="w-4 h-4 text-primary-600" />
                                    )}
                                    <span className={value === opt.value ? '' : 'ml-6'}>
                                        {opt.label}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {helpText && !error && (
                <p className="text-xs text-slate-500">{helpText}</p>
            )}
            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}

// Cascading location select component
export interface CascadingLocationSelectProps {
    // Values
    countryId?: number | null;
    regionId?: number | null;
    districtId?: number | null;
    wardId?: number | null;
    villageId?: number | null;

    // Change handlers
    onCountryChange?: (id: number | null) => void;
    onRegionChange?: (id: number | null) => void;
    onDistrictChange?: (id: number | null) => void;
    onWardChange?: (id: number | null) => void;
    onVillageChange?: (id: number | null) => void;

    // Data loaders
    loadCountries: () => Promise<SelectOption[]>;
    loadRegions: (countryId: number) => Promise<SelectOption[]>;
    loadDistricts: (regionId: number) => Promise<SelectOption[]>;
    loadWards: (districtId: number) => Promise<SelectOption[]>;
    loadVillages: (wardId: number) => Promise<SelectOption[]>;

    // Which levels to show
    showCountry?: boolean;
    showRegion?: boolean;
    showDistrict?: boolean;
    showWard?: boolean;
    showVillage?: boolean;

    // Required levels
    requiredLevels?: ('country' | 'region' | 'district' | 'ward' | 'village')[];

    disabled?: boolean;
    className?: string;
}

export function CascadingLocationSelect({
    countryId,
    regionId,
    districtId,
    wardId,
    villageId,
    onCountryChange,
    onRegionChange,
    onDistrictChange,
    onWardChange,
    onVillageChange,
    loadCountries,
    loadRegions,
    loadDistricts,
    loadWards,
    loadVillages,
    showCountry = true,
    showRegion = true,
    showDistrict = true,
    showWard = true,
    showVillage = true,
    requiredLevels = [],
    disabled = false,
    className,
}: CascadingLocationSelectProps) {
    const [countries, setCountries] = useState<SelectOption[]>([]);
    const [regions, setRegions] = useState<SelectOption[]>([]);
    const [districts, setDistricts] = useState<SelectOption[]>([]);
    const [wards, setWards] = useState<SelectOption[]>([]);
    const [villages, setVillages] = useState<SelectOption[]>([]);

    // Load countries on mount
    useEffect(() => {
        if (showCountry) {
            loadCountries().then(setCountries).catch(console.error);
        }
    }, [showCountry, loadCountries]);

    // Load regions when country changes
    useEffect(() => {
        if (countryId && showRegion) {
            loadRegions(countryId).then(setRegions).catch(console.error);
        } else {
            setRegions([]);
        }
    }, [countryId, showRegion, loadRegions]);

    // Load districts when region changes
    useEffect(() => {
        if (regionId && showDistrict) {
            loadDistricts(regionId).then(setDistricts).catch(console.error);
        } else {
            setDistricts([]);
        }
    }, [regionId, showDistrict, loadDistricts]);

    // Load wards when district changes
    useEffect(() => {
        if (districtId && showWard) {
            loadWards(districtId).then(setWards).catch(console.error);
        } else {
            setWards([]);
        }
    }, [districtId, showWard, loadWards]);

    // Load villages when ward changes
    useEffect(() => {
        if (wardId && showVillage) {
            loadVillages(wardId).then(setVillages).catch(console.error);
        } else {
            setVillages([]);
        }
    }, [wardId, showVillage, loadVillages]);

    // Handle cascading clears
    const handleCountryChange = (id: string | number | null) => {
        const numId = id ? Number(id) : null;
        onCountryChange?.(numId);
        onRegionChange?.(null);
        onDistrictChange?.(null);
        onWardChange?.(null);
        onVillageChange?.(null);
    };

    const handleRegionChange = (id: string | number | null) => {
        const numId = id ? Number(id) : null;
        onRegionChange?.(numId);
        onDistrictChange?.(null);
        onWardChange?.(null);
        onVillageChange?.(null);
    };

    const handleDistrictChange = (id: string | number | null) => {
        const numId = id ? Number(id) : null;
        onDistrictChange?.(numId);
        onWardChange?.(null);
        onVillageChange?.(null);
    };

    const handleWardChange = (id: string | number | null) => {
        const numId = id ? Number(id) : null;
        onWardChange?.(numId);
        onVillageChange?.(null);
    };

    const handleVillageChange = (id: string | number | null) => {
        const numId = id ? Number(id) : null;
        onVillageChange?.(numId);
    };

    return (
        <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
            {showCountry && (
                <RelationshipSelect
                    label="Country"
                    value={countryId}
                    onChange={handleCountryChange}
                    options={countries}
                    placeholder="Select country"
                    required={requiredLevels.includes('country')}
                    disabled={disabled}
                />
            )}
            {showRegion && (
                <RelationshipSelect
                    label="Region"
                    value={regionId}
                    onChange={handleRegionChange}
                    options={regions}
                    placeholder="Select region"
                    required={requiredLevels.includes('region')}
                    disabled={disabled || !countryId}
                />
            )}
            {showDistrict && (
                <RelationshipSelect
                    label="District"
                    value={districtId}
                    onChange={handleDistrictChange}
                    options={districts}
                    placeholder="Select district"
                    required={requiredLevels.includes('district')}
                    disabled={disabled || !regionId}
                />
            )}
            {showWard && (
                <RelationshipSelect
                    label="Ward"
                    value={wardId}
                    onChange={handleWardChange}
                    options={wards}
                    placeholder="Select ward"
                    required={requiredLevels.includes('ward')}
                    disabled={disabled || !districtId}
                />
            )}
            {showVillage && (
                <RelationshipSelect
                    label="Village"
                    value={villageId}
                    onChange={handleVillageChange}
                    options={villages}
                    placeholder="Select village"
                    required={requiredLevels.includes('village')}
                    disabled={disabled || !wardId}
                />
            )}
        </div>
    );
}

export default RelationshipSelect;
