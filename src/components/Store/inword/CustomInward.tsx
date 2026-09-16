/* eslint-disable */
import React, {useState, useMemo} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import Select from 'react-select';
import GenericButton from '../../Forms/Buttons/GenericButton';
import {
  useGetRawMaterialCategoriesCat,
  useGetRawMaterialsCateror,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {
  useGetVendorsPo,
  useSubmitCustomStore,
} from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
import {FiChevronDown, FiChevronUp, FiSearch, FiX} from 'react-icons/fi';
import {FaTrash} from 'react-icons/fa';
import {Material, SelectedMaterial} from '../storeTypes';
import {useAuthContext} from '@/context/AuthContext';
import {has} from 'lodash';

const customSchema = z.object({
  category: z.string().optional(),
});

type CustomFormValues = z.infer<typeof customSchema>;

interface CustomInwardProps {
  hasEditAccess?: boolean;
}

const CustomInward: React.FC<CustomInwardProps> = ({
  hasEditAccess: propHasEditAccess,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<
    SelectedMaterial[]
  >([]);
  const [materialQuantities, setMaterialQuantities] = useState<
    Record<string, number>
  >({});
  const [materialVendors, setMaterialVendors] = useState<
    Record<string, string>
  >({});
  const [materialReasons, setMaterialReasons] = useState<
    Record<string, string>
  >({});
  const [materialPrices, setMaterialPrices] = useState<Record<string, number>>(
    {},
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {control, handleSubmit, reset, watch} = useForm<CustomFormValues>({
    resolver: zodResolver(customSchema),
    defaultValues: {category: ''},
  });

  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.inwordStore;
  const role = user?.role;

  const hasEditAccess =
    propHasEditAccess !== undefined
      ? propHasEditAccess
      : role === 'CATEROR' || restriction === 'EDIT';
  const currentCategory = watch('category');

  const {data: rawMaterialCategories} = useGetRawMaterialCategoriesCat();
  const {data: rawMaterial, isLoading} = useGetRawMaterialsCateror();
  const {data: vendors} = useGetVendorsPo();
  const {mutate: submitCustomPO, isPending} = useSubmitCustomStore();

  const categoryOptions =
    rawMaterialCategories?.data?.map((c: any) => ({
      label: c.name,
      value: c.id,
    })) || [];

  const vendorOptions =
    vendors?.map((v: any) => ({
      label: v.name,
      value: v.id,
    })) || [];

  const availableMaterials: Material[] = useMemo(
    () => rawMaterial?.data?.rawMaterials || [],
    [rawMaterial],
  );

  const dropdownMaterials = useMemo(() => {
    const filtered = currentCategory
      ? availableMaterials.filter((m) => m.category?.id === currentCategory)
      : availableMaterials;

    const map = new Map<string, Material>();
    filtered.forEach((m) => map.set(m.id, m));
    selectedMaterials.forEach((m) => map.set(m.id, m as Material));

    const result = Array.from(map.values());

    if (searchQuery.trim()) {
      return result.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.category?.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return result;
  }, [availableMaterials, currentCategory, selectedMaterials, searchQuery]);

  const handleMaterialToggle = (materialId: string) => {
    const material = availableMaterials.find((m) => m.id === materialId);
    if (!material) return;

    setSelectedMaterialIds((prev) => {
      if (prev.includes(materialId)) {
        setSelectedMaterials((p) => p.filter((m) => m.id !== materialId));
        return prev.filter((id) => id !== materialId);
      }

      const now = new Date();
      const newMat: SelectedMaterial = {
        ...material,
        quantity: 1,
        date: now.toISOString().split('T')[0],
        time: now.toISOString(),
        venue: 'Store',
        price: material.amount,
      };

      setSelectedMaterials((p) => [...p, newMat]);
      setMaterialQuantities((p) => ({...p, [materialId]: 1}));
      setMaterialVendors((p) => ({
        ...p,
        [materialId]: vendorOptions[0]?.value || '',
      }));
      setMaterialPrices((p) => ({...p, [materialId]: material.amount || 0}));
      setMaterialReasons((p) => ({...p, [materialId]: ''}));

      return [...prev, materialId];
    });

    setErrorMessage('');
  };

  const handleRemoveMaterial = (id: string) => {
    setSelectedMaterials((p) => p.filter((m) => m.id !== id));
    setSelectedMaterialIds((p) => p.filter((mid) => mid !== id));
  };

  const onSubmit = async () => {
    if (!selectedMaterials.length) {
      setErrorMessage('Please select at least one material');
      return;
    }

    const payload = selectedMaterials.map((m) => ({
      materialId: m.id,
      quantity: materialQuantities[m.id] || 1,
      price: materialPrices[m.id] || 0,
      vendorId: materialVendors[m.id],
      reason: materialReasons[m.id] || '',
      date: m.date,
      time: m.time,
      venue: m.venue,
    }));

    submitCustomPO(
      {materials: payload, type: 'INWORD'},
      {
        onSuccess: () => {
          setSuccessMessage('Custom materials added successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
          reset();
          setSelectedMaterials([]);
          setSelectedMaterialIds([]);
          setSearchQuery('');
        },
      },
    );
  };

  return (
    <div className="text-black dark:text-white">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Custom Material Inward</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Add materials to store inventory
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMessage && (
          <div className="rounded border-l-4 border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded border-l-4 border-green-500 bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
            {successMessage}
          </div>
        )}

        {/* Category */}
        <div className="bg-gray-50 rounded-md p-3 dark:bg-meta-4">
          <label className="text-gray-600 dark:text-gray-300 mb-1 block text-xs font-medium">
            Filter by Category
          </label>
          <Controller
            name="category"
            control={control}
            render={({field}) => {
              const isDark =
                typeof window !== 'undefined' &&
                document.documentElement.classList.contains('dark');

              return (
                <Select
                  {...field}
                  options={categoryOptions}
                  value={
                    categoryOptions.find((o) => o.value === field.value) || null
                  }
                  onChange={(v: any) => field.onChange(v?.value)}
                  placeholder="Select Category"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      minHeight: '36px',
                      fontSize: '0.875rem',
                      borderRadius: '6px',
                      backgroundColor: isDark ? '#1f2937' : '#ffffff', // dark:bg-form-input
                      borderColor: state.isFocused
                        ? '#3b82f6'
                        : isDark
                          ? '#374151'
                          : '#d1d5db',
                      boxShadow: 'none',
                      ':hover': {
                        borderColor: state.isFocused
                          ? '#3b82f6'
                          : isDark
                            ? '#4b5563'
                            : '#9ca3af',
                      },
                    }),

                    menu: (base) => ({
                      ...base,
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      borderRadius: '6px',
                      zIndex: 20,
                    }),

                    menuList: (base) => ({
                      ...base,
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      padding: '4px',
                    }),

                    option: (base, state) => ({
                      ...base,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      backgroundColor: state.isSelected
                        ? '#3b82f6'
                        : state.isFocused
                          ? isDark
                            ? '#374151'
                            : '#f3f4f6'
                          : 'transparent',
                      color: state.isSelected
                        ? '#ffffff'
                        : isDark
                          ? '#e5e7eb'
                          : '#111827',
                    }),

                    singleValue: (base) => ({
                      ...base,
                      color: isDark ? '#e5e7eb' : '#111827',
                    }),

                    input: (base) => ({
                      ...base,
                      color: isDark ? '#e5e7eb' : '#111827',
                    }),

                    placeholder: (base) => ({
                      ...base,
                      color: isDark ? '#9ca3af' : '#6b7280',
                    }),

                    indicatorSeparator: () => ({
                      display: 'none',
                    }),

                    dropdownIndicator: (base) => ({
                      ...base,
                      color: isDark ? '#9ca3af' : '#6b7280',
                      ':hover': {
                        color: isDark ? '#e5e7eb' : '#111827',
                      },
                    }),
                  }}
                />
              );
            }}
          />
        </div>

        {/* Materials */}
        <div className="border-gray-200 overflow-hidden rounded-lg border dark:border-strokedark">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-gray-50 flex w-full items-center justify-between px-3 py-2 dark:bg-meta-4"
          >
            <span className="text-sm font-medium">
              Select Materials ({selectedMaterialIds.length})
            </span>
            {isDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          {isDropdownOpen && (
            <div className="border-gray-200 border-t bg-white p-3 dark:border-strokedark dark:bg-boxdark">
              <div className="relative mb-2">
                <FiSearch className="text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search materials..."
                  className="border-gray-300 w-full rounded-md border bg-white py-1.5 pl-8 pr-7 text-sm text-black outline-none dark:border-strokedark dark:bg-form-input dark:text-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <FiX />
                  </button>
                )}
              </div>

              {isLoading ? (
                <p className="py-4 text-center text-sm">Loading...</p>
              ) : (
                <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2 lg:grid-cols-3">
                  {dropdownMaterials.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleMaterialToggle(m.id)}
                      className={`cursor-pointer rounded-md border p-2 text-sm ${
                        selectedMaterialIds.includes(m.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 hover:border-gray-300 dark:hover:border-gray-500 dark:border-strokedark'
                      }`}
                    >
                      <div className="font-medium">{m.name}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        {m.category?.name} • ₹{m.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        {selectedMaterials.length > 0 && (
          <div className="border-gray-200 overflow-hidden rounded-lg border bg-white dark:border-strokedark dark:bg-boxdark">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-meta-4">
                <tr>
                  <th className="text-gray-600 dark:text-gray-300 px-4 py-2 text-left">
                    Material
                  </th>
                  <th className="px-4 py-2">Qty</th>
                  <th className="px-4 py-2">Vendor</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2">Reason</th>
                  {hasEditAccess && <th className="px-4 py-2">Action</th>}
                </tr>
              </thead>
              <tbody>
                {selectedMaterials.map((m) => (
                  <tr
                    key={m.id}
                    className="border-gray-200 border-t dark:border-strokedark"
                  >
                    <td className="px-4 py-2">{m.name}</td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="1"
                        value={materialQuantities[m.id] || 1}
                        onChange={(e) =>
                          setMaterialQuantities((p) => ({
                            ...p,
                            [m.id]: Number(e.target.value),
                          }))
                        }
                        className="border-gray-300 w-20 rounded-md border bg-white px-2 py-1 text-black dark:border-strokedark dark:bg-form-input dark:text-white"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={materialVendors[m.id]}
                        onChange={(e) =>
                          setMaterialVendors((p) => ({
                            ...p,
                            [m.id]: e.target.value,
                          }))
                        }
                        className="rounded border-[1.7px] border-stroke bg-white px-3 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      >
                        {vendorOptions.map((v) => (
                          <option key={v.value} value={v.value}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={materialPrices[m.id]}
                        onChange={(e) =>
                          setMaterialPrices((p) => ({
                            ...p,
                            [m.id]: Number(e.target.value),
                          }))
                        }
                        className="border-gray-300 w-24 rounded-md border bg-white px-2 py-1 text-black dark:border-strokedark dark:bg-form-input dark:text-white"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={materialReasons[m.id]}
                        onChange={(e) =>
                          setMaterialReasons((p) => ({
                            ...p,
                            [m.id]: e.target.value,
                          }))
                        }
                        className="border-gray-300 w-full rounded-md border bg-white px-2 py-1 text-black dark:border-strokedark dark:bg-form-input dark:text-white"
                      />
                    </td>
                    {hasEditAccess && (
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterial(m.id)}
                          className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Actions */}
        {hasEditAccess && (
          <div className="border-gray-200 flex justify-end gap-2 border-t pt-3 dark:border-strokedark">
            <button
              type="button"
              onClick={() => {
                reset();
                setSelectedMaterials([]);
                setSelectedMaterialIds([]);
                setSearchQuery('');
                setErrorMessage('');
              }}
              className="border-gray-300 hover:bg-gray-50 rounded-md border px-4 py-2 text-sm dark:border-strokedark dark:hover:bg-meta-4"
            >
              Cancel
            </button>

            <GenericButton
              type="submit"
              disabled={isPending || selectedMaterials.length === 0}
              className="rmx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save Custom Inward'}
            </GenericButton>
          </div>
        )}
      </form>
    </div>
  );
};

export default CustomInward;
