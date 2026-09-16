/* eslint-disable */
import {
  useAddAdditional,
  useDeleteAdditional,
  useGetAdditional,
  useUpdateAdditional,
} from '@/lib/react-query/queriesAndMutations/cateror/eventsummary';
import {Route} from '@/routes/_app/_event/events.$id';
import {useState} from 'react';
import {FiEdit} from 'react-icons/fi';
import {IoMdCheckmark} from 'react-icons/io';
import {MdDelete} from 'react-icons/md';
import {RxCross2} from 'react-icons/rx';

type AdditionalExtraItem = {
  vendorName: string;
  particular: string;
  price: number;
  quantity: number;
  total: number;
  isPaid?: boolean;
};

const AdditionalExtra = () => {
  const {id} = Route.useParams();
  const eventId = id as string;

  // --- Queries & Mutations ---
  const {mutate: addAdditional} = useAddAdditional(eventId);
  const {data: additionalData} = useGetAdditional(eventId);
  const {mutate: updateAdditional} = useUpdateAdditional();
  const {mutate: deleteAdditional} = useDeleteAdditional();

  // --- State ---
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Unified form state for both Adding and Editing
  const [formData, setFormData] = useState<Partial<AdditionalExtraItem>>({
    vendorName: '',
    particular: '',
    price: 0,
    quantity: 1,
    total: 0,
  });

  const additionalList = Array.isArray(additionalData) ? additionalData : [];

  // --- Helpers ---
  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      vendorName: '',
      particular: '',
      price: 0,
      quantity: 1,
      total: 0,
    });
  };

  const calculateTotal = (qty: number, prc: number) => {
    return (qty || 0) * (prc || 0);
  };

  // --- Handlers ---
  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setIsAdding(false);
    setFormData({
      vendorName: item.vendorName,
      particular: item.particular,
      price: item.price,
      quantity: item.quantity,
      total: item.total,
    });
  };

  const handleSave = () => {
    if (
      !formData.vendorName ||
      !formData.particular ||
      (formData.quantity ?? 0) < 1
    ) {
      alert('Please fill Vendor, Particular and valid Quantity.');
      return;
    }

    const payload = {
      vendorName: formData.vendorName,
      particular: formData.particular,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      total: calculateTotal(Number(formData.quantity), Number(formData.price)),
    };

    if (editingId) {
      updateAdditional({id: editingId, data: payload});
    } else {
      // @ts-ignore - The hook might expect specific types, mostly compatible
      addAdditional(payload);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this additional?')) {
      deleteAdditional({id});
    }
  };

  const handlePaymentStatus = (id: string) => {
    if (window.confirm('Are you sure you want to pay this additional?')) {
      updateAdditional({id, data: {isPaid: true}});
    }
  };

  return (
    <div className="rounded-md border border-stroke bg-white dark:border-strokedark dark:bg-black">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stroke bg-blue-50 px-4 py-2 dark:border-strokedark dark:bg-black">
        <h3 className="font-semibold text-blue-900 dark:text-secondary">
          Additional Extras
        </h3>
        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="rounded px-3 py-1 text-sm font-bold text-blue-900 underline hover:text-blue-700 dark:text-secondary"
        >
          Add New
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Vendor</th>
              <th className="p-2 text-left">Particular</th>
              <th className="p-2 text-center">Quantity</th>
              <th className="p-2 text-center">Price (₹)</th>
              <th className="p-2 text-center">Total (₹)</th>
              <th className="p-2 text-center">Payment</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* ================= ADD ROW ================= */}
            {isAdding && (
              <tr className="bg-blue-50 dark:bg-black">
                <td className="p-2">
                  <input
                    type="text"
                    placeholder="Vendor Name"
                    value={formData.vendorName}
                    onChange={(e) =>
                      setFormData({...formData, vendorName: e.target.value})
                    }
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    placeholder="Particular"
                    value={formData.particular}
                    onChange={(e) =>
                      setFormData({...formData, particular: e.target.value})
                    }
                    className="w-full rounded border px-2 py-1 dark:bg-black"
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => {
                      const qty = Number(e.target.value);
                      setFormData({
                        ...formData,
                        quantity: qty,
                        total: calculateTotal(qty, formData.price || 0),
                      });
                    }}
                    className="w-16 rounded border px-2 py-1 text-center dark:bg-black"
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => {
                      const prc = Number(e.target.value);
                      setFormData({
                        ...formData,
                        price: prc,
                        total: calculateTotal(formData.quantity || 0, prc),
                      });
                    }}
                    className="w-20 rounded border px-2 py-1 text-center dark:bg-black"
                  />
                </td>
                <td className="p-2 text-center font-bold">
                  ₹{formData.total?.toFixed(2)}
                </td>
                <td className="text-gray-500 p-2 text-center text-xs">
                  Pending
                </td>
                <td className="p-2 text-center">
                  <div className="flex justify-center gap-2">
                    <IoMdCheckmark
                      onClick={handleSave}
                      className="h-5 w-5 cursor-pointer text-green-600"
                      title="Save"
                    />
                    <RxCross2
                      onClick={resetForm}
                      className="h-5 w-5 cursor-pointer text-red-600"
                      title="Cancel"
                    />
                  </div>
                </td>
              </tr>
            )}

            {/* ================= DATA ROWS ================= */}
            {additionalList.length > 0
              ? additionalList.map((item: any) => {
                  const isEditing = editingId === item.id;
                  return (
                    <tr
                      key={item.id}
                      className="border-t border-stroke dark:border-strokedark"
                    >
                      {/* Vendor */}
                      <td className="p-2">
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.vendorName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                vendorName: e.target.value,
                              })
                            }
                            className="w-full rounded border px-2 py-1 dark:bg-black"
                          />
                        ) : (
                          item.vendorName
                        )}
                      </td>

                      {/* Particular */}
                      <td className="p-2">
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.particular}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                particular: e.target.value,
                              })
                            }
                            className="w-full rounded border px-2 py-1 dark:bg-black"
                          />
                        ) : (
                          item.particular
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="p-2 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => {
                              const qty = Number(e.target.value);
                              setFormData({
                                ...formData,
                                quantity: qty,
                                total: calculateTotal(qty, formData.price || 0),
                              });
                            }}
                            className="w-16 rounded border px-2 py-1 text-center dark:bg-black"
                          />
                        ) : (
                          item.quantity
                        )}
                      </td>

                      {/* Price */}
                      <td className="p-2 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => {
                              const prc = Number(e.target.value);
                              setFormData({
                                ...formData,
                                price: prc,
                                total: calculateTotal(
                                  formData.quantity || 0,
                                  prc,
                                ),
                              });
                            }}
                            className="w-20 rounded border px-2 py-1 text-center dark:bg-black"
                          />
                        ) : (
                          `₹${item.price}`
                        )}
                      </td>

                      {/* Total */}
                      <td className="p-2 text-center font-semibold">
                        ₹
                        {isEditing
                          ? formData.total?.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : item.total?.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                      </td>

                      {/* Payment Status */}
                      <td className="p-2 text-center">
                        {item.isPaid ? (
                          <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-300">
                            PAID
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePaymentStatus(item.id)}
                            disabled={isEditing}
                            className="rounded border border-green-600 px-2 py-0.5 text-xs font-medium text-green-600 hover:bg-green-50 disabled:opacity-50 dark:border-green-500"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-2 text-center">
                        {isEditing ? (
                          <div className="flex justify-center gap-2">
                            <IoMdCheckmark
                              onClick={handleSave}
                              className="h-4 w-4 cursor-pointer text-green-600"
                            />
                            <RxCross2
                              onClick={resetForm}
                              className="h-4 w-4 cursor-pointer text-red-600"
                            />
                          </div>
                        ) : (
                          <div className="flex justify-center gap-2">
                            {!item.isPaid && (
                              <FiEdit
                                onClick={() => handleEditClick(item)}
                                className="h-4 w-4 cursor-pointer text-graydark hover:text-blue-600 dark:text-gray-2"
                              />
                            )}
                            <MdDelete
                              onClick={() => handleDelete(item.id)}
                              className="h-4 w-4 cursor-pointer text-graydark hover:text-red-600 dark:text-gray-2"
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              : !isAdding && (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-gray-500 py-4 text-center text-sm"
                    >
                      No additional extras added yet.
                    </td>
                  </tr>
                )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdditionalExtra;
