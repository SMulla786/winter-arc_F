/* eslint-disable */
import {useAuthContext} from '@/context/AuthContext';
import {
  useDeleteKItchenManpower,
  useGetAllVendorManpowerRole,
  useGetKItchenManpower,
  useGetVendorManpower,
  useNewKItchenManpower,
  useUpdateKItchenManpower,
} from '@/lib/react-query/queriesAndMutations/cateror/vendorManpower';
import {Save, X} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';
import {FiEdit} from 'react-icons/fi';
import {MdDelete} from 'react-icons/md';

interface KitchenManpowerItem {
  id?: string;
  vendorId?: string;
  employeeId?: string;
  serviceId: string;
  quantity: number;
  price: number;
  transport: number;
  total?: number;
  vendor?: {id: string; name: string};
  role?: {id: string; name: string};
}

interface VendorAssignmentsProps {
  subeventId: string;
}

const Menpowerkitchen = ({subeventId}: VendorAssignmentsProps) => {
  const {user} = useAuthContext();

  // Data fetching
  const {data: kitchenData = [], isLoading: isLoadingKitchenData} =
    useGetKItchenManpower(subeventId);

  const {data: vendorManpowerData} = useGetVendorManpower();
  const {data: VendorRoleData} = useGetAllVendorManpowerRole();

  const {mutateAsync: createKitchenManpower} =
    useNewKItchenManpower(subeventId);
  const {mutateAsync: updateKitchenManpower} = useUpdateKItchenManpower();
  const {mutateAsync: deleteKitchenManpower} = useDeleteKItchenManpower();

  const [items, setItems] = useState<KitchenManpowerItem[]>([]);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [editedData, setEditedData] = useState<Partial<KitchenManpowerItem>>(
    {},
  );

  // Sync fetched data
  useEffect(() => {
    if (!isLoadingKitchenData && kitchenData) {
      const mapped = kitchenData.map((item: any) => ({
        id: item.id,
        vendorId: item.vendorId || item.manpowerVendorId,
        employeeId: item.employeeId,
        serviceId: item.serviceId || item.roleId,
        quantity: item.quantity || item.count || 0,
        price: item.price || 0,
        transport: item.transport || item.transport || 0,
        total: item.total,
        vendor: item.vendor,
        role: item.role,
      }));
      setItems(mapped);
    }
  }, [kitchenData, isLoadingKitchenData]);

  const getAvailableVendors = () =>
    Array.isArray(vendorManpowerData)
      ? vendorManpowerData
      : vendorManpowerData?.data || [];

  const getAvailableRoles = () =>
    Array.isArray(VendorRoleData) ? VendorRoleData : VendorRoleData?.data || [];

  const vendorOptions = useMemo(() => {
    return getAvailableVendors().map((v: any) => ({
      value: v.id,
      label: `${v.name} (Vendor)`,
    }));
  }, [vendorManpowerData]);

  const roleOptions = useMemo(() => {
    return getAvailableRoles()
      .filter((r: any) => r.roleType === 'KITCHEN')
      .map((r: any) => ({
        value: r.id,
        label: r.name,
      }));
  }, [VendorRoleData]);

  const getVendorName = (vendorId?: string) => {
    if (!vendorId) return '-';
    const vendor = getAvailableVendors().find((v: any) => v.id === vendorId);
    return vendor?.name || 'Unknown Vendor';
  };

  const getRoleName = (serviceId: string) => {
    if (!serviceId) return '-';
    const role = getAvailableRoles().find((r: any) => r.id === serviceId);
    return role?.name || 'Unknown Role';
  };

  const startEdit = (item: KitchenManpowerItem) => {
    setEditingId(item.id || 'new');
    setEditedData({...item});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedData({});
    if (editingId === 'new') {
      setItems(items.slice(1)); // Remove the new row (assumed at index 0)
    }
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const nameA = getVendorName(a.vendorId).toLowerCase();
      const nameB = getVendorName(b.vendorId).toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [items, vendorManpowerData]);

  const saveEdit = async () => {
    if (
      !editedData.serviceId ||
      !editedData.quantity ||
      editedData.quantity < 1
    ) {
      alert('Please select a role and enter quantity ≥ 1');
      return;
    }

    const quantity = Number(editedData.quantity);
    const price = Number(editedData.price || 0);
    const transport = Number(editedData.transport || 0);
    const total = quantity * price + transport;

    const payload = {
      ...(editingId !== 'new' && {id: editingId as string}),
      vendorId: editedData.vendorId || undefined,
      employeeId: editedData.employeeId,
      serviceId: editedData.serviceId,
      quantity,
      price,
      transport: transport, // fixed typo in key to match backend
      total,
    };

    try {
      if (editingId === 'new') {
        await createKitchenManpower(payload); // expects array
      } else {
        await updateKitchenManpower(payload as any);
      }
      cancelEdit();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm('Are you sure you want to delete this kitchen staff assignment?')
    ) {
      return;
    }

    try {
      await deleteKitchenManpower(id);
      // Optimistically remove from UI
      setItems(items.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const addNewRow = () => {
    const newItem: KitchenManpowerItem = {
      serviceId: '',
      quantity: 1,
      price: 0,
      transport: 0,
      total: 0,
    };
    setItems([newItem, ...items]);
    setEditingId('new');
    setEditedData({...newItem});
  };

  const isEditingRow = (itemId?: string) => {
    return editingId === itemId || (editingId === 'new' && !itemId);
  };

  if (isLoadingKitchenData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <span className="text-gray-600 ml-3">
          Loading kitchen manpower data...
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white pb-8 pt-2 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-6 flex items-center justify-between bg-pink-50 px-4">
        <h1 className="text-lg font-semibold text-black dark:text-pink-900">
          Kitchen Staff Assignments
        </h1>
        <button
          onClick={addNewRow}
          className="flex items-center gap-2 rounded px-2 py-1.5 text-sm font-bold text-pink-900 underline"
        >
          Add New
        </button>
      </div>

      <div className="overflow-x-auto px-2">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-2 dark:bg-meta-4">
              <th className="px-4 py-3 text-left text-sm font-medium">
                Vendor
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Transport
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
              <th className="px-4 py-3 text-center text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedItems?.length === 0 && (
              <tr>
                <td colSpan={7} className="text-gray-500 py-12 text-center">
                  No kitchen staff assignments yet. Click "Add New" to create
                  one.
                </td>
              </tr>
            )}

            {sortedItems?.map((item, index) => {
              const isRowEditing = isEditingRow(item.id);
              const displayQuantity = isRowEditing
                ? (editedData.quantity ?? 0)
                : item.quantity;
              const displayPrice = isRowEditing
                ? (editedData.price ?? 0)
                : item.price;
              const displaytransport = isRowEditing
                ? (editedData.transport ?? 0)
                : (item.transport ?? 0);
              const total =
                Number(displayQuantity) * Number(displayPrice) +
                Number(displaytransport);

              return (
                <tr
                  key={item.id || `new-${index}`}
                  className="border-b border-stroke text-sm dark:border-strokedark"
                >
                  <td className="px-4 py-4">
                    {isRowEditing ? (
                      <select
                        value={editedData.vendorId || ''}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            vendorId: e.target.value || undefined,
                          })
                        }
                        className="w-full rounded border border-stroke bg-transparent px-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      >
                        <option value="">Select vendor (optional)</option>
                        {vendorOptions.map(
                          (opt: {value: string; label: string}) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ),
                        )}
                      </select>
                    ) : (
                      getVendorName(item.vendorId) || '-'
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {isRowEditing ? (
                      <select
                        value={editedData.serviceId || ''}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            serviceId: e.target.value,
                          })
                        }
                        className="w-full rounded border border-stroke bg-transparent px-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      >
                        <option value="">Select role</option>
                        {roleOptions.map(
                          (opt: {value: string; label: string}) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ),
                        )}
                      </select>
                    ) : (
                      getRoleName(item.serviceId)
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {isRowEditing ? (
                      <input
                        type="number"
                        min="1"
                        value={editedData.quantity ?? ''}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            quantity: Number(e.target.value) || 1,
                          })
                        }
                        className="w-24 rounded border border-stroke bg-transparent px-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      />
                    ) : (
                      item.quantity
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {isRowEditing ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editedData.price ?? ''}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            price: Number(e.target.value),
                          })
                        }
                        className="w-28 rounded border border-stroke bg-transparent px-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      />
                    ) : (
                      `₹${item.price.toFixed(2)}`
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {isRowEditing ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editedData.transport ?? ''}
                        onChange={(e) =>
                          setEditedData({
                            ...editedData,
                            transport: Number(e.target.value),
                          })
                        }
                        className="w-28 rounded border border-stroke bg-transparent px-3 text-black outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      />
                    ) : (
                      `₹${(item.transport ?? 0).toFixed(2)}`
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <span className="bg-gray-100 inline-block rounded px-3 py-1 font-medium dark:bg-meta-4">
                      ₹{total.toFixed(2)}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      {isRowEditing ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="text-graydark dark:text-gray-2"
                            title="Save"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-graydark dark:text-gray-2"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {/* Delete during edit (only if it's an existing record) */}
                          {item.id && (
                            <button
                              onClick={() => item.id && handleDelete(item.id)}
                              className="text-graydark dark:text-gray-2"
                              title="Delete"
                            >
                              <MdDelete className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(item)}
                            className="text-graydark dark:text-gray-2"
                            title="Edit"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                          {/* Delete in view mode */}
                          {item.id && (
                            <button
                              onClick={() => handleDelete(item.id!)}
                              className="text-graydark dark:text-gray-2"
                              title="Delete"
                            >
                              <MdDelete className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Menpowerkitchen;
