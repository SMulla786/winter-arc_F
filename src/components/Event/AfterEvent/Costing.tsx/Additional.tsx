/* eslint-disable */
import React, {useState, useEffect} from 'react';
import {Route} from '@/routes/_app/_event/events.$id';
import {useGetExtra, useUpdateExtra} from './costingHelper';
import {FiEdit, FiCheck} from 'react-icons/fi';

interface AdditionalItem {
  id?: string | number;
  vendor: string;
  particular: string;
  quantity: number | string;
  price: number | string;
  total: number | string;
}

const Additional: React.FC = () => {
  const {id: eventId} = Route.useParams();
  const {data = []} = useGetExtra(eventId);
  const {mutateAsync: updateExtra} = useUpdateExtra();

  /* ---------------- STATE FOR EDIT MODE ---------------- */
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedItem, setEditedItem] = useState<AdditionalItem>({
    quantity: '',
    price: '',
    total: '',
  });

  /* ---------------- LIVE CALCULATIONS ---------------- */
  useEffect(() => {
    if (editedItem.quantity && editedItem.price) {
      const total = Number(editedItem.quantity) * Number(editedItem.price);
      setEditedItem((prev) => ({
        ...prev,
        total: total.toString(),
      }));
    }
  }, [editedItem.quantity, editedItem.price]);

  /* ---------------- UPDATE ADDITIONAL ITEM ---------------- */
  const handleItemUpdate = async (itemId: string | number) => {
    await updateExtra({
      id: itemId,
      data: {
        actualQuantity: Number(editedItem.quantity),
        actualPrice: Number(editedItem.price),
        actualTotal: Number(editedItem.quantity) * Number(editedItem.price),
      },
    });
    setEditingItemId(null); // Exit edit mode
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-md border border-stroke bg-white">
        <div className="flex items-center justify-between border-b border-stroke bg-blue-50 px-4 py-2 dark:border-strokedark">
          <h3 className="font-semibold text-blue-900">Additional Extras</h3>
        </div>

        {/* Additional Items Table */}

        <div className="overflow-x-auto bg-white p-4 dark:border-strokedark dark:bg-black dark:text-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:border-strokedark dark:bg-black dark:text-white">
              <tr>
                <th className="p-2 text-left">Vendor</th>
                <th className="p-2 text-left">Particular</th>
                <th className="p-2 text-left">Quantity</th>
                <th className="p-2 text-left">Price (₹)</th>
                <th className="p-2 text-left">Total (₹)</th>
                <th className="p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:border-strokedark dark:bg-meta-4 dark:text-white">
              {data.length > 0 ? (
                data.map((item: any) => (
                  <tr
                    key={item.id}
                    className="border-t border-stroke dark:border-strokedark"
                  >
                    <td className="p-2">{item.vendorName}</td>
                    <td className="p-2">{item.particular || '-'}</td>
                    <td className="p-2">
                      {editingItemId === item.id ? (
                        <input
                          type="number"
                          value={editedItem.quantity || item.actualQuantity}
                          onChange={(e) =>
                            setEditedItem({
                              ...editedItem,
                              quantity: e.target.value,
                            })
                          }
                          className="w-24 rounded border px-2 py-1"
                        />
                      ) : (
                        item.actualQuantity || item.quantity
                      )}
                    </td>
                    <td className="p-2">
                      {editingItemId === item.id ? (
                        <input
                          type="number"
                          value={editedItem.price || item.actualPrice}
                          onChange={(e) =>
                            setEditedItem({
                              ...editedItem,
                              price: e.target.value,
                            })
                          }
                          className="w-24 rounded border px-2 py-1"
                        />
                      ) : (
                        `₹${item.actualPrice || item.price}`
                      )}
                    </td>
                    <td className="p-2">
                      ₹{editedItem.total || item.actualTotal || item.total}
                    </td>
                    <td className="p-2">
                      {editingItemId === item.id ? (
                        <button
                          onClick={() => handleItemUpdate(item.id)}
                          className="text-graydark dark:text-gray-2"
                        >
                          <FiCheck className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingItemId(item.id); // Enable edit mode
                            setEditedItem({
                              quantity: item.actualQuantity || item.quantity,
                              price: item.actualPrice || item.price,
                              total: item.actualTotal || item.total,
                            }); // Set initial values for the inputs
                          }}
                          className="text-graydark dark:text-gray-2"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-gray-500 px-6 py-10 text-center"
                  >
                    No additional items added
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Additional;
