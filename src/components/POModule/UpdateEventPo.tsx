/*eslint-disable*/
import React, {useState, useMemo, useEffect} from 'react';
import {useNavigate} from '@tanstack/react-router';
import {format} from 'date-fns';
import toast from 'react-hot-toast';
import {
  FiSave,
  FiX,
  FiArrowLeft,
  FiPlus,
  FiMinus,
  FiChevronDown,
} from 'react-icons/fi';
import {
  useUpdateEventPo,
  useGetVendorsPo,
  useEventById,
} from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
import {useQueryClient} from '@tanstack/react-query';
// import {GenericTable, Column} from '../Forms/Table/GenericTable';
import {Route} from '@/routes/_app/_po/updatevent.$id';

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  category: string;
  date?: string;
  time?: string;
  location?: string;
  eventId: string;
  eventName: string;
  subeventId: string;
  subeventName: string;
  subeventDate?: string;
  vendorId?: string;
  vendorName?: string;
  breakdown?: QuantityBreakdown[];
}

interface QuantityBreakdown {
  id: string;
  quantity: number;
  time: string;
  date: string;
  location: string;
  vendorId?: string;
  vendorName?: string;
}

interface VendorApiType {
  id: string;
  name: string;
}

const UpdateEventPo: React.FC = () => {
  const {id} = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /* ---------- State ---------- */
  const [tableData, setTableData] = useState<RawMaterial[]>([]);
  const [editingItem, setEditingItem] = useState<RawMaterial | null>(null);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [vendorSelections, setVendorSelections] = useState<
    Record<string, string>
  >({});
  const [breakdownItem, setBreakdownItem] = useState<RawMaterial | null>(null);
  const [breakdownQuantities, setBreakdownQuantities] = useState<
    QuantityBreakdown[]
  >([]);
  const [locations] = useState<string[]>(['Store', 'Venue']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  /* ---------- API hooks ---------- */
  const {data: eventpoData, isLoading: isLoadingEventData} = useEventById(id);
  console.log('updateee', eventpoData);
  const {mutate: updateMutation, isPending: isUpdating} = useUpdateEventPo();
  const {data: vendorsResponse, isLoading: isVendorsLoading} =
    useGetVendorsPo();

  console.log('Event Data:', eventpoData);

  // Default vendors
  const defaultVendors: VendorApiType[] = [
    {id: '1', name: 'Fresh Foods Supplier'},
  ];

  const vendors: VendorApiType[] = useMemo(() => {
    if (vendorsResponse) {
      return Array.isArray(vendorsResponse)
        ? vendorsResponse
        : vendorsResponse?.data && Array.isArray(vendorsResponse.data)
          ? vendorsResponse.data
          : defaultVendors;
    }
    return defaultVendors;
  }, [vendorsResponse]);

  /* ---------- Helper Functions ---------- */
  const formatTimeForAPI = (timeString: string): string => {
    if (timeString.includes('T')) {
      return timeString;
    }
    if (timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return date.toISOString();
    }
    return new Date().toISOString();
  };

  const formatDateForAPI = (dateString: string): string => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  /* ---------- Data Processing ---------- */
  const processedData = useMemo(() => {
    if (!eventpoData?.data?.materials) {
      console.log('No materials data found');
      return [];
    }

    try {
      const materials = eventpoData.data.materials;
      console.log('Processing materials:', materials);

      return materials.map((item: any, index: number): RawMaterial => {
        const defaultVendor = vendors[index % vendors.length];
        return {
          id:
            item.rawmaterialId ||
            item.materialId ||
            `temp-${index}-${Date.now()}`,
          name: item.rawmaterialName || item.materialName || 'Unknown Material',
          unit: item.unit || 'GRAM',
          quantity: Number(item.quantity) || 0,
          category: item.category || 'Uncategorized',
          date: item.date || new Date().toISOString().split('T')[0],
          time: item.time || '09:00',
          subeventDate: item.subeventDate || item.date,
          location: item.location || item.venue || 'Store',
          eventId: item.eventId || id,
          eventName:
            item.eventName || eventpoData?.data?.name || 'Unknown Event',
          subeventId: item.subeventId || '',
          subeventName: item.subeventName || 'Unknown Sub-event',
          vendorId: item.vendorId || defaultVendor.id,
          vendorName: item.vendorName || defaultVendor.name,
          breakdown: item.breakdown || [],
        };
      });
    } catch (error) {
      console.error('Error processing data:', error);
      return [];
    }
  }, [id, vendors, eventpoData]);

  useEffect(() => {
    if (processedData && processedData.length > 0) {
      console.log('Setting table data:', processedData);
      setTableData(processedData);

      const initialVendorSelections: Record<string, string> = {};
      const initialEditingState: Record<string, boolean> = {};

      processedData.forEach((item: RawMaterial) => {
        if (item.id) {
          initialVendorSelections[item.id] = item.vendorId || '';
          initialEditingState[item.id] = false;
        }
      });

      setVendorSelections(initialVendorSelections);
      setIsEditing(initialEditingState);
      toast.success(`Loaded ${processedData.length} raw materials for update`);
    } else {
      console.log('No processed data available');
      setTableData([]);
    }
  }, [processedData]);

  /* ---------- Click Outside for Dropdown ---------- */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.querySelector('.category-dropdown');
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ---------- Edit Handlers ---------- */
  const handleStartEdit = (item: RawMaterial) => {
    setEditingItem({...item});
    setIsEditing((prev) => ({
      ...prev,
      [item.id]: true,
    }));
  };

  const handleSaveEdit = (itemId: string) => {
    if (!editingItem) return;

    const updatedData = tableData.map((tableItem) =>
      tableItem.id === itemId ? {...editingItem} : tableItem,
    );

    setTableData(updatedData);
    setIsEditing((prev) => ({
      ...prev,
      [itemId]: false,
    }));
    setEditingItem(null);
    toast.success('Changes saved locally');
  };

  const handleCancelEdit = (itemId: string) => {
    setIsEditing((prev) => ({
      ...prev,
      [itemId]: false,
    }));
    setEditingItem(null);
  };

  const handleFieldChange = (field: keyof RawMaterial, value: any) => {
    if (editingItem) {
      setEditingItem((prev) => (prev ? {...prev, [field]: value} : null));
    }
  };

  /* ---------- Vendor Selection Handler ---------- */
  const handleVendorChange = (materialId: string, vendorId: string) => {
    setVendorSelections((prev) => ({
      ...prev,
      [materialId]: vendorId,
    }));

    const selectedVendor = vendors.find((v) => v.id === vendorId);
    if (selectedVendor) {
      setTableData((prev) =>
        prev.map((item) =>
          item.id === materialId
            ? {
                ...item,
                vendorId: selectedVendor.id,
                vendorName: selectedVendor.name,
              }
            : item,
        ),
      );
    }
  };

  /* ---------- Update Single Material ---------- */
  const handleUpdateMaterial = (materialId: string) => {
    const materialToUpdate = tableData.find((item) => item.id === materialId);
    if (!materialToUpdate) {
      toast.error('Material not found');
      return;
    }

    if (materialToUpdate.quantity <= 0) {
      toast.error('Quantity must be positive');
      return;
    }

    const updatePayload = {
      eventId: id,
      eventName: materialToUpdate.eventName,
      materials: [
        {
          materialId: materialToUpdate.id,
          materialName: materialToUpdate.name,
          vendorId: materialToUpdate.vendorId,
          vendorName: materialToUpdate.vendorName,
          unit: materialToUpdate.unit,
          quantity: materialToUpdate.quantity,
          category: materialToUpdate.category,
          subeventId: materialToUpdate.subeventId,
          subeventName: materialToUpdate.subeventName,
          date: formatDateForAPI(
            materialToUpdate.subeventDate ||
              materialToUpdate.date ||
              new Date().toISOString().split('T')[0],
          ),
          time: formatTimeForAPI(materialToUpdate.time || '09:00'),
          venue: materialToUpdate.location || 'Store',
        },
      ],
    };

    updateMutation(
      {id, data: updatePayload},
      {
        onSuccess: () => {
          toast.success('Material updated successfully!');
          queryClient.invalidateQueries({
            queryKey: ['event', id],
          });
          setIsEditing((prev) => ({
            ...prev,
            [materialId]: false,
          }));
        },
        onError: (error: any) => {
          toast.error(
            `Failed to update material: ${error.message || 'Unknown error'}`,
          );
        },
      },
    );
  };

  /* ---------- Update All Materials ---------- */
  const handleUpdateAllData = () => {
    if (tableData.length === 0) {
      toast.error('No data to update');
      return;
    }

    const materialsWithoutVendors = tableData.filter(
      (item) => !item.vendorId || !item.vendorName,
    );
    if (materialsWithoutVendors.length > 0) {
      toast.error('Please select vendors for all materials before updating');
      return;
    }

    const invalidMaterials = tableData.filter(
      (item) => item.quantity <= 0 || !item.date || !item.subeventId,
    );
    if (invalidMaterials.length > 0) {
      toast.error(
        'Please ensure all materials have valid quantities, dates, and subevent IDs',
      );
      return;
    }

    const payload = {
      eventId: id,
      eventName:
        tableData[0]?.eventName || eventpoData?.data?.name || 'Unknown Event',
      materials: tableData.flatMap((item) => {
        if (item.breakdown && item.breakdown.length > 0) {
          return item.breakdown.map((breakdown) => ({
            materialId: item.id,
            materialName: item.name,
            vendorId: breakdown.vendorId || item.vendorId,
            vendorName: breakdown.vendorName || item.vendorName,
            unit: item.unit,
            quantity: breakdown.quantity,
            category: item.category,
            subeventId: item.subeventId,
            subeventName: item.subeventName,
            date: formatDateForAPI(
              breakdown.date ||
                item.subeventDate ||
                item.date ||
                new Date().toISOString().split('T')[0],
            ),
            time: formatTimeForAPI(breakdown.time || item.time || '09:00'),
            venue: breakdown.location || item.location || 'Store',
          }));
        } else {
          return {
            materialId: item.id,
            materialName: item.name,
            vendorId: item.vendorId,
            vendorName: item.vendorName,
            unit: item.unit,
            quantity: item.quantity,
            category: item.category,
            subeventId: item.subeventId,
            subeventName: item.subeventName,
            date: formatDateForAPI(
              item.subeventDate ||
                item.date ||
                new Date().toISOString().split('T')[0],
            ),
            time: formatTimeForAPI(item.time || '09:00'),
            venue: item.location || 'Store',
          };
        }
      }),
    };

    updateMutation(
      {id, data: payload},
      {
        onSuccess: () => {
          toast.success('All materials updated successfully!');
          queryClient.invalidateQueries({
            queryKey: ['event', id],
          });
        },
        onError: (error: any) => {
          toast.error(
            `Failed to update materials: ${error.message || 'Unknown error'}`,
          );
        },
      },
    );
  };

  /* ---------- Breakdown Handlers ---------- */
  const handleBreakdownItem = (item: RawMaterial) => {
    setBreakdownItem(item);
    if (item.breakdown && item.breakdown.length > 0) {
      setBreakdownQuantities([...item.breakdown]);
    } else {
      setBreakdownQuantities([
        {
          id: `breakdown-${Date.now()}`,
          quantity: item.quantity,
          time: item.time || '09:00',
          date:
            item.subeventDate ||
            item.date ||
            new Date().toISOString().split('T')[0],
          location: item.location || 'Store',
          vendorId: item.vendorId,
          vendorName: item.vendorName,
        },
      ]);
    }
  };

  const handleSaveBreakdown = () => {
    if (!breakdownItem) return;

    const totalBreakdownQuantity = breakdownQuantities.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    if (totalBreakdownQuantity !== breakdownItem.quantity) {
      toast.error(
        `Total breakdown quantity (${totalBreakdownQuantity}) must match original quantity (${breakdownItem.quantity})`,
      );
      return;
    }

    const invalidBreakdowns = breakdownQuantities.filter(
      (breakdown) => breakdown.quantity <= 0,
    );
    if (invalidBreakdowns.length > 0) {
      toast.error('All breakdown quantities must be positive');
      return;
    }

    const updatedData = tableData.map((item) =>
      item.id === breakdownItem.id
        ? {
            ...item,
            breakdown: [...breakdownQuantities],
          }
        : item,
    );
    setTableData(updatedData);
    setBreakdownItem(null);
    setBreakdownQuantities([]);
    toast.success('Breakdown saved successfully');
  };

  const addBreakdownEntry = () => {
    setBreakdownQuantities((prev) => [
      ...prev,
      {
        id: `breakdown-${Date.now()}-${prev.length}`,
        quantity: 0,
        time: '09:00',
        date:
          breakdownItem?.subeventDate ||
          breakdownItem?.date ||
          new Date().toISOString().split('T')[0],
        location: 'Store',
        vendorId: breakdownItem?.vendorId,
        vendorName: breakdownItem?.vendorName,
      },
    ]);
  };

  const removeBreakdownEntry = (id: string) => {
    if (breakdownQuantities.length <= 1) {
      toast.error('At least one breakdown entry is required');
      return;
    }
    setBreakdownQuantities((prev) => prev.filter((item) => item.id !== id));
  };

  const updateBreakdownEntry = (
    id: string,
    field: keyof QuantityBreakdown,
    value: any,
  ) => {
    setBreakdownQuantities((prev) =>
      prev.map((item) => (item.id === id ? {...item, [field]: value} : item)),
    );
  };

  /* ---------- Category Filter ---------- */
  const uniqueCategories = useMemo(
    () => Array.from(new Set(tableData.map((item) => item.category))),
    [tableData],
  );

  const filteredTableData = useMemo(
    () =>
      tableData.filter(
        (item) =>
          selectedCategories.length === 0 ||
          selectedCategories.includes(item.category),
      ),
    [tableData, selectedCategories],
  );

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const selectAllCategories = () => {
    setSelectedCategories([...uniqueCategories]);
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  /* ---------- Table Columns ---------- */
  const tableColumns: Column<RawMaterial>[] = [
    {
      header: 'Category',
      accessor: 'category',
      render: (item: RawMaterial) =>
        isEditing[item.id] ? (
          <input
            type="text"
            value={editingItem?.category || ''}
            onChange={(e) => handleFieldChange('category', e.target.value)}
            className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-2 py-1 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary"
          />
        ) : (
          item.category
        ),
    },
    {
      header: 'Material Name',
      accessor: 'name',
      render: (item: RawMaterial) =>
        isEditing[item.id] ? (
          <input
            type="text"
            value={editingItem?.name || ''}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-2 py-1 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary"
          />
        ) : (
          item.name
        ),
    },
    {
      header: 'Vendor Name',
      accessor: 'vendorName',
      render: (item: RawMaterial) => (
        <select
          value={vendorSelections[item.id] || ''}
          onChange={(e) => handleVendorChange(item.id, e.target.value)}
          className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          disabled={isVendorsLoading}
        >
          <option value="">Select Vendor</option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.name}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      render: (item: RawMaterial) => (
        <div className="space-y-2">
          {isEditing[item.id] ? (
            <input
              type="number"
              value={editingItem?.quantity || 0}
              onChange={(e) =>
                handleFieldChange('quantity', parseFloat(e.target.value) || 0)
              }
              className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-2 py-1 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary"
              min="0"
              step="0.01"
            />
          ) : (
            <div className="font-medium">
              {item.quantity} {item.unit}
            </div>
          )}
          {item.breakdown && item.breakdown.length > 0 && (
            <div className="text-gray-500 space-y-1 text-xs">
              {item.breakdown.map((breakdown, index) => (
                <div
                  key={breakdown.id}
                  className="flex items-center justify-between gap-4"
                >
                  <span>Part {index + 1}:</span>
                  <span className="font-medium">
                    {breakdown.quantity} {item.unit}
                  </span>
                  <span className="text-gray-400">{breakdown.time}</span>
                  <span className="text-gray-400">
                    {format(new Date(breakdown.date), 'dd/MM/yyyy')}
                  </span>
                  <span className="text-gray-400">{breakdown.location}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: (item: RawMaterial) => (
        <div className="flex items-center gap-1">
          {isEditing[item.id] ? (
            <>
              <button
                onClick={() => handleUpdateMaterial(item.id)}
                disabled={isUpdating}
                className="disabled:bg-gray-400 flex items-center gap-1 rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                title="Save Changes"
              >
                <FiSave className="h-3 w-3" />
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => handleCancelEdit(item.id)}
                className="bg-gray-600 hover:bg-gray-700 flex items-center gap-1 rounded px-2 py-1 text-xs text-white"
                title="Cancel Edit"
              >
                <FiX className="h-3 w-3" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleStartEdit(item)}
                className="flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                title="Edit Material"
              >
                <FiSave className="h-3 w-3" />
                Edit
              </button>
              <button
                onClick={() => handleBreakdownItem(item)}
                className="flex items-center gap-1 rounded bg-purple-600 px-2 py-1 text-xs text-white hover:bg-purple-700"
                title="Breakdown Quantity"
              >
                <FiPlus className="h-3 w-3" />
                Break
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  /* ---------- Render Breakdown Modal ---------- */
  const renderBreakdownModal = () => {
    if (!breakdownItem) return null;

    const totalBreakdownQuantity = breakdownQuantities.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const remainingQuantity = breakdownItem.quantity - totalBreakdownQuantity;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="dark:bg-gray-800 mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 dark:border-black dark:bg-black">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-gray-900 text-lg font-semibold dark:text-white">
              Breakdown Quantity
            </h3>
            <button
              onClick={() => setBreakdownItem(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 rounded bg-blue-50 p-3 dark:bg-blue-900/20">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                Original Quantity: {breakdownItem.quantity} {breakdownItem.unit}
              </span>
              <span
                className={`font-medium ${remainingQuantity === 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                Remaining: {remainingQuantity} {breakdownItem.unit}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {breakdownQuantities.map((breakdown, index) => (
              <div
                key={breakdown.id}
                className="border-gray-200 dark:border-gray-600 rounded-lg border p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-medium">Part {index + 1}</h4>
                  <button
                    onClick={() => removeBreakdownEntry(breakdown.id)}
                    className="text-red-600 hover:text-red-800"
                    disabled={breakdownQuantities.length <= 1}
                  >
                    <FiMinus className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={breakdown.quantity}
                      onChange={(e) =>
                        updateBreakdownEntry(
                          breakdown.id,
                          'quantity',
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
                      Time
                    </label>
                    <input
                      type="time"
                      value={breakdown.time}
                      onChange={(e) =>
                        updateBreakdownEntry(
                          breakdown.id,
                          'time',
                          e.target.value,
                        )
                      }
                      className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
                      Date
                    </label>
                    <input
                      type="date"
                      value={
                        breakdown.date
                          ? format(new Date(breakdown.date), 'yyyy-MM-dd')
                          : ''
                      }
                      onChange={(e) =>
                        updateBreakdownEntry(
                          breakdown.id,
                          'date',
                          e.target.value,
                        )
                      }
                      className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
                      Location
                    </label>
                    <select
                      value={breakdown.location}
                      onChange={(e) =>
                        updateBreakdownEntry(
                          breakdown.id,
                          'location',
                          e.target.value,
                        )
                      }
                      className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between">
            <button
              onClick={addBreakdownEntry}
              className="disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition-colors dark:bg-primary"
            >
              <FiPlus className="h-4 w-4" />
              Add Part
            </button>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setBreakdownItem(null)}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveBreakdown}
              disabled={remainingQuantity !== 0}
              className="disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition-colors dark:bg-primary"
            >
              <FiSave className="h-4 w-4" />
              Save Breakdown
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            <button
              onClick={() => navigate({to: '/po'})}
              className="bg-gray-600 hover:bg-gray-700 flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-colors"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>
        </div>

        <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-md dark:border-black dark:bg-black">
          {/* Action Buttons */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-gray-900 text-xl font-bold dark:text-white">
                Raw Materials
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {tableData.length} items loaded • Edit individual items or
                update all at once
              </p>
            </div>
            <button
              onClick={handleUpdateAllData}
              disabled={
                isUpdating || tableData.length === 0 || isVendorsLoading
              }
              className="disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center gap-2 rounded-lg bg-yellow-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-yellow-700"
            >
              {isUpdating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                  Updating All...
                </>
              ) : (
                <>
                  <FiSave className="h-4 w-4" />
                  Update All Data
                </>
              )}
            </button>
          </div>

          {/* Loading States */}
          {isLoadingEventData && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
              <span className="text-gray-600 dark:text-gray-400 ml-3">
                Loading event data...
              </span>
            </div>
          )}
          {isVendorsLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
              <span className="text-gray-600 dark:text-gray-400 ml-3">
                Loading vendors...
              </span>
            </div>
          )}

          {/* Data Loaded */}
          {!isLoadingEventData && !isVendorsLoading && tableData.length > 0 && (
            <>
              {/* Category Filter */}
              <div className="category-dropdown mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="whitespace-nowrap font-medium text-black dark:text-white">
                    Category:
                  </span>
                  <div className="relative w-full sm:w-auto">
                    <button
                      onClick={() =>
                        setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                      }
                      className="hover:bg-gray-50 flex w-full min-w-[160px] items-center justify-between gap-2 rounded-lg border border-stroke bg-white px-3 py-2 dark:border-strokedark dark:bg-form-input dark:hover:bg-meta-4 sm:min-w-[200px]"
                    >
                      <span className="truncate text-sm text-black dark:text-white">
                        {selectedCategories.length === 0
                          ? 'Select Categories'
                          : `${selectedCategories.length} selected`}
                      </span>
                      <FiChevronDown
                        className={`text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isCategoryDropdownOpen && (
                      <div className="absolute left-0 top-full z-10 mt-1 w-full min-w-[160px] rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-form-input sm:w-64">
                        <div className="border-b border-stroke p-2 dark:border-strokedark">
                          <div className="mb-2 flex items-center justify-between">
                            <button
                              onClick={selectAllCategories}
                              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                            >
                              Select All
                            </button>
                            <button
                              onClick={clearAllCategories}
                              className="text-xs text-red-600 hover:text-red-800 dark:text-red-400"
                            >
                              Clear All
                            </button>
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {uniqueCategories.map((category) => (
                              <label
                                key={category}
                                className="hover:bg-gray-100 flex cursor-pointer items-center gap-2 rounded p-2 dark:hover:bg-meta-4"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.includes(
                                    category,
                                  )}
                                  onChange={() =>
                                    handleCategoryChange(category)
                                  }
                                  className="rounded border-stroke text-blue-600 focus:ring-blue-500 dark:border-strokedark"
                                />
                                <span className="text-sm text-black dark:text-white">
                                  {category}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Table */}
              <GenericTable
                data={filteredTableData}
                columns={tableColumns}
                itemsPerPage={10}
                searchAble={true}
              />
            </>
          )}

          {/* No Data */}
          {!isLoadingEventData &&
            !isVendorsLoading &&
            tableData.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No raw material data found for this event.
                </p>
              </div>
            )}
        </div>
      </div>

      {/* Breakdown Modal */}
      {renderBreakdownModal()}
    </div>
  );
};

export default UpdateEventPo;
