/* eslint-disable */
import React, {useState, useMemo, useCallback, useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import Select from 'react-select';
import GenericButton from '../../Forms/Buttons/GenericButton';
import {
  useSubmitEventPOInward,
  useGetHistory,
} from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
import {useAllPO, usePOByPOId} from '../storeApi';
import {
  FiChevronDown,
  FiChevronRight,
  FiAlertCircle,
  FiShoppingCart,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {useAuthContext} from '@/context/AuthContext';

interface LineItem {
  id: string;
  materialId: string;
  name: string;
  unit: string;
  category: string;
  vendorId: string;
  vendorName: string;
  poQuantity: number;
  requiredQty: number;
  quantity: number;
  date: string;
  time: string;
  venue: string;
  price: number;
  error?: string;
  requiredErrors?: string[];
  alreadyInInventory?: any[];
  totalReceived?: number;
  isBreakdown?: boolean;
  parentId?: string;
  breakdownQuantity?: number;
  totalAmount?: number;
  submitMainRow?: boolean;
}

const poSchema = z.object({
  poId: z.string().min(1, 'PO is required'),
});

type POFormValues = z.infer<typeof poSchema>;

// Define PO type options for filter
const PO_TYPE_OPTIONS = [
  {value: 'all', label: 'All PO Types'},
  {value: 'custom', label: 'Custom PO'},
  {value: 'event', label: 'Event PO'},
  {value: 'multiple', label: 'Multiple Raw Material PO'},
];

const formatTimeForAPI = (timeString: string): string => {
  if (!timeString) return new Date().toISOString();
  if (timeString.includes('T')) return timeString;
  if (timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date.toISOString();
  }
  return new Date().toISOString();
};

const formatDateForAPI = (dateString: string): string => {
  if (!dateString || dateString.trim() === '') {
    return '';
  }

  try {
    if (dateString.includes('/')) {
      const [month, day, year] = dateString.split('/');
      if (month && day && year) {
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
        );
        return date.toISOString().split('T')[0];
      }
    }

    if (dateString.includes('-')) {
      return dateString;
    }

    return '';
  } catch {
    return '';
  }
};

const formatQuantityDisplay = (quantity: number | undefined | null): string => {
  if (quantity === undefined || quantity === null || isNaN(quantity)) {
    return '';
  }

  const q = parseFloat(quantity.toString());

  // If it's a whole number, show as integer (no decimal)
  if (Number.isInteger(q)) {
    return q.toString();
  }

  // Otherwise show up to 3 decimal places and remove trailing zeros
  return q.toFixed(3).replace(/\.?0+$/, '');
};

const formatDisplayValue = (value: string): string => {
  if (!value || value.trim() === '') return '-';
  return value;
};

const formatTimeDisplay = (timeString: string): string => {
  if (!timeString || timeString.trim() === '') return '-';

  try {
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } else if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes.padStart(2, '0')} ${ampm}`;
    }
    return timeString;
  } catch {
    return '-';
  }
};

const formatDateDisplay = (dateString: string): string => {
  if (!dateString || dateString.trim() === '') return '-';

  try {
    if (dateString.includes('T')) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } else {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  } catch {
    return '-';
  }
};

interface POInwardProps {
  hasEditAccess?: boolean;
}

const POInward: React.FC<POInwardProps> = ({
  hasEditAccess: propHasEditAccess,
}) => {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [poNumber, setPoNumber] = useState<string>('');
  const [selectedPOType, setSelectedPOType] = useState<string>('all');
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandedBreakdowns, setExpandedBreakdowns] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedInventory, setSelectedInventory] = useState<any | null>(null);

  const methods = useForm<POFormValues>({
    resolver: zodResolver(poSchema),
    defaultValues: {poId: ''},
  });
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.inwordStore;
  const role = user?.role;

  const hasEditAccess =
    propHasEditAccess !== undefined
      ? propHasEditAccess
      : role === 'CATEROR' || restriction === 'EDIT';

  const {handleSubmit, setValue, watch} = methods;
  const {mutate: submitEventPO, isPending: isSubmittingEventPO} =
    useSubmitEventPOInward();
  const {data: allPOData} = useAllPO();
  const {data: poData} = usePOByPOId(poNumber);
  const {refetch: refetchHistory} = useGetHistory();

  // Filter PO data based on selected type and exclude COMPLETED status
  const filteredPOData = useMemo(() => {
    if (!allPOData) return [];

    return allPOData.filter((po: any) => {
      // Exclude POs with COMPLETED status
      if (po.status === 'COMPLETED') {
        return false;
      }

      switch (selectedPOType) {
        case 'custom':
          return !po.eventId;
        case 'event':
          return po.eventId && !po.RMlistId;
        case 'multiple':
          return po.RMlistId;
        case 'all':
        default:
          return true;
      }
    });
  }, [allPOData, selectedPOType]);

  const poOptions = useMemo(() => {
    if (!filteredPOData) return [];

    return filteredPOData.map((po: any) => {
      let formattedDateTime = '';
      if (po.Date) {
        const date = new Date(po.Date);
        formattedDateTime = date.toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      }

      let typeIndicator = '';
      if (!po.eventId) {
        typeIndicator = '[Custom]';
      } else if (po.RMlistId) {
        typeIndicator = '[Multi-RM]';
      } else {
        typeIndicator = '[Event]';
      }

      const statusIndicator = po.status ? `[${po.status}]` : '';

      return {
        label: `PO#${po.poNumber} ${typeIndicator} ${statusIndicator} - ${po.eventName || 'Event'} (${formattedDateTime})`,
        value: po.poNumber.toString(),
        rawData: po,
      };
    });
  }, [filteredPOData]);

  // Toggle category expansion
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  const toggleBreakdown = useCallback((parentId: string) => {
    setExpandedBreakdowns((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  }, []);

  // Build table data with grouping
  const groupedPOMaterials = useMemo(() => {
    if (!lineItems || lineItems.length === 0) return {};

    const groupedByCategory: Record<string, LineItem[]> = {};

    lineItems.forEach((item) => {
      if (!item.isBreakdown) {
        if (!groupedByCategory[item.category]) {
          groupedByCategory[item.category] = [];
        }
        groupedByCategory[item.category].push(item);
      }
    });

    return groupedByCategory;
  }, [lineItems]);

  const getBreakdownItems = useCallback(
    (parentId: string) => {
      return lineItems.filter(
        (item) => item.parentId === parentId && item.isBreakdown,
      );
    },
    [lineItems],
  );

  // Initialize line items when poData changes
  useEffect(() => {
    if (poData?.materials && poData.materials.length > 0) {
      const materials = poData.materials;
      const initialLineItems: LineItem[] = [];

      materials.forEach((mat: any, index: number) => {
        const totalReceived = mat.alreadyInInventory?.reduce(
          (acc: number, inv: any) => acc + (inv.quantity || 0),
          0,
        );

        // Create main material row
        const mainItem: LineItem = {
          id: `${mat.materialId}-${index}`,
          materialId: mat.materialId,
          name: mat.materialName,
          category: mat.categoryName || 'Uncategorized',
          unit: mat.unit,
          vendorId: mat.vendorId || '',
          vendorName: mat.vendorName || '-',
          poQuantity: mat.quantity || 0,
          requiredQty: mat.quantity || 0,
          quantity: 0,
          date: mat.date,
          time: mat.time,
          venue: mat.venue,
          price: mat.price || 0,
          isBreakdown: false,
          breakdownQuantity: mat.quantity || 0,
          submitMainRow: true,
          totalAmount: (mat.price || 0) * (mat.quantity || 0),
          alreadyInInventory: mat.alreadyInInventory,
          totalReceived: totalReceived || 0,
        };

        initialLineItems.push(mainItem);

        // If the material has breakdowns from API, add them
        if (mat.breakdowns && Array.isArray(mat.breakdowns)) {
          mat.breakdowns.forEach((breakdown: any, bIndex: number) => {
            const breakdownId = `breakdown-${mat.materialId}-${index}-${bIndex}`;

            // Format time for breakdown
            const breakdownTime = breakdown.time || mat.time;
            let formattedTime = '';

            if (breakdownTime.includes('T')) {
              try {
                const timeDate = new Date(breakdownTime);
                const hours = String(timeDate.getHours()).padStart(2, '0');
                const minutes = String(timeDate.getMinutes()).padStart(2, '0');
                formattedTime = `${hours}:${minutes}`;
              } catch (e) {
                formattedTime = '';
              }
            } else if (breakdownTime.match(/^\d{1,2}:\d{2}$/)) {
              formattedTime = breakdownTime;
            } else {
              formattedTime = breakdownTime;
            }

            const breakdownItem: LineItem = {
              id: breakdownId,
              materialId: mat.materialId,
              name: breakdown.materialName || mat.materialName,
              category: mat.categoryName || 'Uncategorized',
              vendorId: mat.vendorId || '',
              vendorName: mat.vendorName || '-',
              unit: mat.unit,
              poQuantity: 0,
              requiredQty: 0,
              quantity: breakdown.quantity || 0,
              date: breakdown.date || mat.date,
              time: formattedTime,
              venue: breakdown.venue || mat.venue,
              price: mat.price || 0,
              isBreakdown: true,
              parentId: mainItem.id,
              breakdownQuantity: breakdown.quantity || 0,
              totalAmount: (mat.price || 0) * (breakdown.quantity || 0),
              totalReceived: 0,
            };

            initialLineItems.push(breakdownItem);
          });
        }
      });

      setLineItems(initialLineItems);
      setHasChanges(false);
      setErrorMessage('');

      // Expand all categories by default
      const categories = [
        ...new Set(initialLineItems.map((item) => item.category)),
      ];
      const initialExpanded: {[key: string]: boolean} = {};
      categories.forEach((category) => {
        initialExpanded[category] = true;
      });
      setExpandedCategories(initialExpanded);
    }
  }, [poData]);

  const validateRequiredFields = useCallback((item: LineItem): string[] => {
    const errors: string[] = [];

    if (item.quantity > 0) {
      if (!item.date || item.date.trim() === '') {
        errors.push('Date is required');
      }

      if (!item.time || item.time.trim() === '') {
        errors.push('Time is required');
      }

      if (!item.venue || item.venue.trim() === '') {
        errors.push('Venue is required');
      }
    }

    return errors;
  }, []);

  const validateOrderQuantity = useCallback((item: LineItem): string | null => {
    const totalQuantity = item.breakdownQuantity || 0;
    const userQuantity = item.quantity || 0;

    if (userQuantity > totalQuantity) {
      return `This quantity (${formatQuantityDisplay(userQuantity)}) is greater than total available quantity (${formatQuantityDisplay(totalQuantity)})`;
    }

    return null;
  }, []);

  const validateBreakdownAgainstTotal = useCallback(
    (breakdownItem: LineItem, parentItem: LineItem): string | null => {
      const totalQuantity = parentItem.breakdownQuantity || 0;
      const breakdownQuantity = breakdownItem.quantity || 0;

      if (breakdownQuantity > totalQuantity) {
        return `Breakdown quantity (${formatQuantityDisplay(breakdownQuantity)}) exceeds total available quantity (${formatQuantityDisplay(totalQuantity)})`;
      }

      return null;
    },
    [],
  );

  const validateBreakdownQuantities = useCallback(
    (parentItem: LineItem, breakdownItems: LineItem[]) => {
      const totalBreakdownQty = breakdownItems.reduce(
        (sum, b) => sum + (b.quantity || 0),
        0,
      );
      const parentUserQty = parentItem.quantity || 0;
      const totalAvailableQty = parentItem.breakdownQuantity || 0;
      const combinedTotal = parentUserQty + totalBreakdownQty;

      if (combinedTotal > totalAvailableQty) {
        return `Combined quantity (${formatQuantityDisplay(combinedTotal)}) exceeds total available quantity (${formatQuantityDisplay(totalAvailableQty)})`;
      }

      return null;
    },
    [],
  );

  const updateLineItem = useCallback(
    (lineId: string, updates: Partial<LineItem>) => {
      setLineItems((prev) =>
        prev.map((li) => {
          if (li.id === lineId) {
            const updatedItem = {
              ...li,
              ...updates,
              error: undefined,
              requiredErrors: undefined,
            };

            if (updates.quantity !== undefined || updates.price !== undefined) {
              const quantity =
                updates.quantity !== undefined ? updates.quantity : li.quantity;
              const price =
                updates.price !== undefined ? updates.price : li.price;
              updatedItem.totalAmount = (price || 0) * (quantity || 0);
            }

            const requiredErrors = validateRequiredFields(updatedItem);
            if (requiredErrors.length > 0) {
              updatedItem.requiredErrors = requiredErrors;
            } else {
              updatedItem.requiredErrors = undefined;
            }

            if (!li.isBreakdown) {
              const quantityError = validateOrderQuantity(updatedItem);
              if (quantityError) {
                updatedItem.error = quantityError;
              }
            }

            if (li.isBreakdown && li.parentId) {
              const parentItem = prev.find((item) => item.id === li.parentId);
              if (parentItem) {
                const breakdownTotalError = validateBreakdownAgainstTotal(
                  updatedItem,
                  parentItem,
                );
                if (breakdownTotalError) {
                  updatedItem.error = breakdownTotalError;
                }
              }
            }

            setTimeout(() => {
              setLineItems((current) => {
                let parent: LineItem | undefined;
                if (li.isBreakdown && li.parentId) {
                  parent = current.find((item) => item.id === li.parentId);
                } else if (!li.isBreakdown) {
                  parent = current.find((item) => item.id === lineId);
                }

                if (parent) {
                  const breakdownItems = current.filter(
                    (item) => item.parentId === parent!.id && item.isBreakdown,
                  );
                  const breakdownError = validateBreakdownQuantities(
                    parent,
                    breakdownItems,
                  );

                  if (breakdownError) {
                    return current.map((item) =>
                      (item.parentId === parent!.id && item.isBreakdown) ||
                      item.id === parent!.id
                        ? {...item, error: breakdownError}
                        : item,
                    );
                  } else {
                    return current.map((item) =>
                      (item.parentId === parent!.id && item.isBreakdown) ||
                      item.id === parent!.id
                        ? {...item, error: undefined}
                        : item,
                    );
                  }
                }

                return current;
              });
            }, 0);

            return updatedItem;
          }
          return li;
        }),
      );
      setHasChanges(true);
      setErrorMessage('');
    },
    [
      validateOrderQuantity,
      validateBreakdownQuantities,
      validateBreakdownAgainstTotal,
      validateRequiredFields,
    ],
  );

  const handlePOSelect = (selected: any) => {
    if (selected?.value) {
      setPoNumber(selected.value);
      setValue('poId', selected.value);
      setLineItems([]);
      setHasChanges(false);
      setErrorMessage('');
      setExpandedCategories({});
      setExpandedBreakdowns({});
    }
  };

  const handlePOTypeChange = (selected: any) => {
    setSelectedPOType(selected.value);
    setPoNumber('');
    setValue('poId', '');
    setLineItems([]);
    setHasChanges(false);
  };

  // Get count of each PO type for display (excluding COMPLETED)
  const poTypeCounts = useMemo(() => {
    if (!allPOData) return {all: 0, custom: 0, event: 0, multiple: 0};

    const nonCompletedPOs = allPOData.filter(
      (po: any) => po.status !== 'COMPLETED',
    );

    const counts = {
      all: nonCompletedPOs.length,
      custom: nonCompletedPOs.filter((po: any) => !po.eventId).length,
      event: nonCompletedPOs.filter((po: any) => po.eventId && !po.RMlistId)
        .length,
      multiple: nonCompletedPOs.filter((po: any) => po.RMlistId).length,
    };

    return counts;
  }, [allPOData]);

  // Submit function
  const onSubmit = async () => {
    try {
      if (lineItems.length === 0) {
        setErrorMessage('No materials to submit');
        return;
      }

      const itemsWithErrors: LineItem[] = [];

      lineItems.forEach((item) => {
        if (item.quantity > 0) {
          const requiredErrors = validateRequiredFields(item);
          if (requiredErrors.length > 0) {
            itemsWithErrors.push({...item, requiredErrors});
          }
        }
      });

      if (itemsWithErrors.length > 0) {
        setLineItems((prev) =>
          prev.map((item) => {
            const errorItem = itemsWithErrors.find((e) => e.id === item.id);
            if (errorItem) {
              return {...item, requiredErrors: errorItem.requiredErrors};
            }
            return item;
          }),
        );

        setErrorMessage('Please fill all required fields before submitting');
        return;
      }

      const quantityErrors = lineItems.some(
        (item) =>
          !item.isBreakdown && item.quantity > (item.breakdownQuantity || 0),
      );

      if (quantityErrors) {
        toast.error(
          'Some quantities exceed available limits. Please check the quantity fields.',
        );
        return;
      }

      const itemsToSubmit: LineItem[] = [];

      lineItems.forEach((item) => {
        if (item.quantity <= 0) {
          return;
        }

        if (!item.isBreakdown && item.submitMainRow !== false) {
          if (item.quantity > 0) {
            itemsToSubmit.push(item);
          }
        }

        if (item.isBreakdown) {
          if (item.quantity > 0) {
            itemsToSubmit.push(item);
          }
        }
      });

      if (itemsToSubmit.length === 0) {
        setErrorMessage(
          'No valid items to submit. Please enter quantity for at least one item.',
        );
        return;
      }

      const materialsWithReceived = itemsToSubmit.map((item) => ({
        materialId: item.materialId,
        quantity: item.quantity,
        received: item.poQuantity,
        price: item.price || 0,
        date: formatDateForAPI(item.date),
        time: formatTimeForAPI(item.time),
        venue: item.venue,
      }));

      await submitEventPO(
        {
          materials: materialsWithReceived,
          type: 'INWORD',
          poId: poData?.purchaseId || '',
          poNumber: Number(poNumber),
        },
        {
          onSuccess: () => {
            setSuccessMessage('PO Inward submitted successfully!');
            setTimeout(() => setSuccessMessage(''), 4000);
            setPoNumber('');
            setLineItems([]);
            setHasChanges(false);
            refetchHistory();
          },
          onError: (err: any) => {
            setErrorMessage(err.response?.data?.message || 'Submission failed');
          },
        },
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="relative">
      {/* Error / Success Messages */}
      {errorMessage && (
        <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900 dark:text-red-200">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 rounded bg-green-100 p-3 text-sm text-green-700 dark:bg-green-900 dark:text-green-200">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Filter Section */}
        <div className="rounded-lg border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-meta-4">
          <h3 className="text-gray-800 mb-3 text-lg font-semibold dark:text-white">
            Filter Purchase Orders
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium">PO Type Filter</label>
              <Select
                options={PO_TYPE_OPTIONS.map((option) => ({
                  ...option,
                  label: `${option.label} (${poTypeCounts[option.value as keyof typeof poTypeCounts] || 0})`,
                }))}
                value={PO_TYPE_OPTIONS.find(
                  (option) => option.value === selectedPOType,
                )}
                onChange={handlePOTypeChange}
                placeholder="Filter by PO Type"
                className="basic-single"
                classNamePrefix="select"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium">Select PO</label>
              <Select
                options={poOptions}
                value={poOptions.find((option) => option.value === poNumber)}
                onChange={handlePOSelect}
                placeholder="Select PO Number"
                isDisabled={poOptions.length === 0}
                className="basic-single"
                classNamePrefix="select"
              />
              {poOptions.length === 0 && (
                <div className="mt-1 text-xs text-red-500">
                  No POs found for the selected filter
                </div>
              )}
            </div>
          </div>

          {/* PO Type Legend */}
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="flex items-center gap-1 text-xs">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-gray-600 dark:text-gray-300">
                Custom PO: {poTypeCounts.custom}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-gray-600 dark:text-gray-300">
                Event PO: {poTypeCounts.event}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              <span className="text-gray-600 dark:text-gray-300">
                Multiple RM PO: {poTypeCounts.multiple}
              </span>
            </div>
          </div>
        </div>

        {/* Main Table Section - Display Only */}
        {Object.keys(groupedPOMaterials).length > 0 ? (
          <div className="mt-6">
            <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-meta-4">
              <div className="dark:bg-gray-800 bg-blue-50 px-4 py-3 dark:bg-meta-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-800 text-lg font-semibold dark:text-white">
                    PO Inward Materials (
                    {lineItems.filter((item) => !item.isBreakdown).length})
                  </h3>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    PO #{poNumber} •{' '}
                    {selectedPOType !== 'all' &&
                      PO_TYPE_OPTIONS.find(
                        (opt) => opt.value === selectedPOType,
                      )?.label}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
                  <thead className="h-16 rounded-t-md bg-blue-900 text-white dark:bg-blue-950">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        R.M.
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Vendor
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        PO Qty
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Unit
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Recv Qty
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Qty
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Diff
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Time
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Venue
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-sm font-semibold"
                      >
                        Total Amt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="dark:bg-gray-800 divide-y divide-stroke bg-white dark:divide-strokedark">
                    {Object.keys(groupedPOMaterials).map(
                      (category, categoryIndex) => {
                        const materials = groupedPOMaterials[category];
                        const isExpanded =
                          expandedCategories[category] !== false;

                        return (
                          <React.Fragment key={category}>
                            {/* Category Header Row */}
                            <tr className="bg-gray-2 px-4 py-4 font-bold text-black dark:bg-meta-4 dark:text-white">
                              <td colSpan={13} className="px-4 py-3">
                                <div className="flex items-center justify-between">
                                  <div
                                    className="flex cursor-pointer items-center gap-2"
                                    onClick={() => toggleCategory(category)}
                                  >
                                    {isExpanded ? (
                                      <FiChevronDown className="h-4 w-4" />
                                    ) : (
                                      <FiChevronRight className="h-4 w-4" />
                                    )}
                                    <span className="text-gray-800 font-semibold dark:text-white">
                                      {category}
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-300 text-sm">
                                      ({materials.length} items)
                                    </span>
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* Category Items - Only show when expanded */}
                            {isExpanded &&
                              materials.map((material, materialIndex) => {
                                const breakdownItems = getBreakdownItems(
                                  material.id,
                                );
                                const isBreakdownExpanded =
                                  expandedBreakdowns[material.id];
                                const hasBreakdowns = breakdownItems.length > 0;
                                const mainRowBg =
                                  materialIndex % 2 === 0
                                    ? 'bg-white'
                                    : 'bg-gray-50/30';
                                const diff =
                                  material.quantity - material.poQuantity;

                                return (
                                  <React.Fragment key={material.id}>
                                    <tr
                                      className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${mainRowBg} ${
                                        material.error ||
                                        material.requiredErrors
                                          ? 'border-l-4 border-red-500'
                                          : ''
                                      }`}
                                    >
                                      <td className="px-4 py-3">
                                        <div className="text-gray-800 text-sm font-medium dark:text-white">
                                          {material.name}
                                        </div>
                                      </td>

                                      <td className="px-4 py-3">
                                        <div className="text-gray-600 dark:text-gray-300">
                                          {material.vendorName}
                                        </div>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className="rounded bg-blue-50 px-2 py-1 text-sm font-medium">
                                          {formatQuantityDisplay(
                                            material.poQuantity,
                                          ) || '0'}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <div className="text-gray-600 dark:text-gray-300">
                                          {material.unit}
                                        </div>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className="text-gray-800 dark:text-white">
                                          ₹{material.price || 0}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setSelectedInventory(material)
                                          }
                                          className="text-sm text-blue-600 underline hover:text-blue-800"
                                        >
                                          {material.totalReceived ?? 0}
                                        </button>
                                      </td>

                                      <td className="px-4 py-3">
                                        <div>
                                          <input
                                            type="number"
                                            step="any"
                                            value={formatQuantityDisplay(
                                              material.quantity,
                                            )}
                                            onChange={(e) => {
                                              const newQuantity =
                                                e.target.value === ''
                                                  ? 0
                                                  : Number(e.target.value);
                                              updateLineItem(material.id, {
                                                quantity: newQuantity,
                                              });
                                            }}
                                            className={`border-gray-300 w-20 rounded border px-2 py-1 text-sm ${
                                              material.error ||
                                              (material.requiredErrors &&
                                                material.requiredErrors.some(
                                                  (err) =>
                                                    err.includes('Quantity') ||
                                                    err.includes('quantity'),
                                                ))
                                                ? 'border-red-300 bg-red-50'
                                                : ''
                                            }`}
                                            placeholder="0.0"
                                          />
                                          {material.error && (
                                            <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                              <FiAlertCircle className="h-3 w-3" />
                                              {material.error}
                                            </div>
                                          )}
                                        </div>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span
                                          className={`text-sm font-medium ${
                                            diff < 0
                                              ? 'text-red-500'
                                              : diff > 0
                                                ? 'text-green-500'
                                                : 'text-gray-500'
                                          }`}
                                        >
                                          {diff > 0 ? '+' : ''}
                                          {formatQuantityDisplay(diff)}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className="text-gray-800 text-sm dark:text-white">
                                          {formatDateDisplay(material.date)}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className="text-gray-800 text-sm dark:text-white">
                                          {formatTimeDisplay(material.time)}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className="text-gray-800 text-sm dark:text-white">
                                          {formatDisplayValue(material.venue)}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                          ₹
                                          {(
                                            (material.price || 0) *
                                            (material.quantity || 0)
                                          ).toFixed(2)}
                                        </span>
                                      </td>

                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                          {hasBreakdowns && (
                                            <button
                                              onClick={() =>
                                                toggleBreakdown(material.id)
                                              }
                                              className="text-blue-600 hover:text-blue-800"
                                              title={
                                                isBreakdownExpanded
                                                  ? 'Collapse breakdown'
                                                  : 'Expand breakdown'
                                              }
                                              type="button"
                                            >
                                              {isBreakdownExpanded ? (
                                                <FiChevronDown className="h-4 w-4" />
                                              ) : (
                                                <FiChevronRight className="h-4 w-4" />
                                              )}
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>

                                    {isBreakdownExpanded &&
                                      breakdownItems.map(
                                        (breakdown, breakdownIndex) => {
                                          const breakdownDiff =
                                            breakdown.quantity; // For breakdown, diff is just the quantity
                                          const breakdownBg =
                                            breakdownIndex % 2 === 0
                                              ? 'bg-white'
                                              : 'bg-gray-50/30';

                                          return (
                                            <tr
                                              key={breakdown.id}
                                              className={`hover:bg-gray-100 dark:hover:bg-gray-700 border-l-4 border-blue-300 ${breakdownBg} ${
                                                breakdown.error ||
                                                breakdown.requiredErrors
                                                  ? 'border-l-red-500'
                                                  : ''
                                              }`}
                                            >
                                              <td className="px-4 py-3">
                                                <div className="text-gray-800 pl-4 text-sm font-medium dark:text-white">
                                                  └─ {breakdown.name}
                                                </div>
                                              </td>

                                              <td className="px-4 py-3">
                                                <div className="text-gray-600 dark:text-gray-300">
                                                  {breakdown.vendorName}
                                                </div>
                                              </td>

                                              <td className="px-4 py-3">
                                                <span className="text-gray-500 text-xs">
                                                  Breakdown
                                                </span>
                                              </td>

                                              <td className="px-4 py-3">
                                                <div className="text-gray-600 dark:text-gray-300">
                                                  {breakdown.unit}
                                                </div>
                                              </td>

                                              <td className="px-4 py-3">
                                                <span className="text-gray-600 text-sm">
                                                  ₹
                                                  {breakdown.price?.toFixed(
                                                    2,
                                                  ) || '0.00'}
                                                </span>
                                              </td>

                                              <td className="px-4 py-3">
                                                <span className="text-gray-500 text-xs">
                                                  -
                                                </span>
                                              </td>

                                              <td className="px-4 py-3">
                                                <div>
                                                  <input
                                                    type="number"
                                                    step="any"
                                                    value={formatQuantityDisplay(
                                                      breakdown.quantity,
                                                    )}
                                                    onChange={(e) => {
                                                      const newQuantity =
                                                        e.target.value === ''
                                                          ? 0
                                                          : Number(
                                                              e.target.value,
                                                            );
                                                      updateLineItem(
                                                        breakdown.id,
                                                        {
                                                          quantity: newQuantity,
                                                        },
                                                      );
                                                    }}
                                                    className={`border-gray-300 w-20 rounded border px-2 py-1 text-sm ${
                                                      breakdown.error
                                                        ? 'border-red-300 bg-red-50'
                                                        : ''
                                                    }`}
                                                    placeholder="0.0"
                                                  />
                                                  {breakdown.error && (
                                                    <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                                      <FiAlertCircle className="h-3 w-3" />
                                                      {breakdown.error}
                                                    </div>
                                                  )}
                                                </div>
                                              </td>

                                              <td className="px-4 py-3">
                                                <span
                                                  className={`text-sm font-medium ${
                                                    breakdownDiff > 0
                                                      ? 'text-green-500'
                                                      : 'text-gray-500'
                                                  }`}
                                                >
                                                  +
                                                  {formatQuantityDisplay(
                                                    breakdownDiff,
                                                  )}
                                                </span>
                                              </td>

                                              <td className="px-4 py-3">
                                                <span className="text-gray-600 text-sm">
                                                  {formatDateDisplay(
                                                    breakdown.date,
                                                  )}
                                                </span>
                                              </td>

                                              <td className="px-4 py-3">
                                                <span className="text-gray-600 text-sm">
                                                  {formatTimeDisplay(
                                                    breakdown.time,
                                                  )}
                                                </span>
                                              </td>

                                              <td className="px-4 py-3">
                                                <span className="text-gray-600 text-sm">
                                                  {formatDisplayValue(
                                                    breakdown.venue,
                                                  )}
                                                </span>
                                              </td>

                                              <td className="px-4 py-3">
                                                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                  ₹
                                                  {(
                                                    (breakdown.price || 0) *
                                                    (breakdown.quantity || 0)
                                                  ).toFixed(2)}
                                                </span>
                                              </td>
                                            </tr>
                                          );
                                        },
                                      )}
                                  </React.Fragment>
                                );
                              })}
                          </React.Fragment>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Submit Button */}
            {hasEditAccess && (
              <div className="mt-6 flex justify-end">
                <GenericButton
                  type="submit"
                  disabled={
                    isSubmittingEventPO ||
                    !poNumber ||
                    Object.keys(groupedPOMaterials).length === 0 ||
                    !hasChanges
                  }
                  className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmittingEventPO ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                      Saving...
                    </>
                  ) : (
                    <>Submit Inward</>
                  )}
                </GenericButton>
              </div>
            )}
          </div>
        ) : (
          poNumber && (
            <div className="rounded bg-yellow-50 p-8 text-center">
              <p className="text-lg text-yellow-600">
                No materials found for PO #{poNumber}.
              </p>
            </div>
          )
        )}
      </form>

      {/* Inventory History Popup */}
      {selectedInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="dark:bg-gray-800 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-gray-800 dark:text-gray-100 mb-2 text-lg font-semibold">
              {selectedInventory.name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Category: {selectedInventory.category}
            </p>

            <table className="text-gray-700 dark:text-gray-200 w-full border text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="border px-3 py-2">Date & Time</th>
                  <th className="border px-3 py-2">Quantity</th>
                  <th className="border px-3 py-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedInventory.alreadyInInventory?.length > 0 ? (
                  selectedInventory.alreadyInInventory.map((entry: any) => (
                    <tr key={entry.id}>
                      <td className="border px-3 py-2">
                        {new Date(entry.createdAt)
                          .toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })
                          .replace(/ /g, ' ')}
                      </td>
                      <td className="border px-3 py-2">
                        {entry.quantity} {selectedInventory.unit}
                      </td>
                      <td className="border px-3 py-2">₹{entry.price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-gray-400 px-3 py-3 text-center"
                    >
                      No inventory history
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="mt-4 flex justify-between text-sm">
              <div className="text-gray-600 dark:text-gray-300">
                <strong>Total Received:</strong>{' '}
                {selectedInventory.totalReceived} {selectedInventory.unit}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedInventory(null)}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POInward;
