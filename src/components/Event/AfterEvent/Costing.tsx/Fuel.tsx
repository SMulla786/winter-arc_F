/* eslint-disable */
import React, {useState, useEffect} from 'react';
import {useGetFuel, useUpdateFuel} from './costingHelper';
import {Route} from '@/routes/_app/_event/events.$id';
import {FiEdit, FiCheck} from 'react-icons/fi';

interface FuelItem {
  id?: string | number;
  fuelType: string;
  quantity: number | string;
  price: number | string;
  total: number | string;
}

const Fuel: React.FC = () => {
  const {id: eventId} = Route.useParams();
  const {data: fueldata = []} = useGetFuel(eventId);
  const {mutateAsync: updateFuel} = useUpdateFuel();

  /* ---------------- STATE FOR EDIT MODE ---------------- */
  const [editingFuelId, setEditingFuelId] = useState<string | null>(null);
  const [editedFuelItem, setEditedFuelItem] = useState<FuelItem>({
    quantity: '',
    price: '',
    total: '',
  });

  /* ---------------- LIVE CALCULATIONS ---------------- */
  useEffect(() => {
    if (editedFuelItem.quantity && editedFuelItem.price) {
      const total =
        Number(editedFuelItem.quantity) * Number(editedFuelItem.price);
      setEditedFuelItem((prev) => ({
        ...prev,
        total: total.toString(),
      }));
    }
  }, [editedFuelItem.quantity, editedFuelItem.price]);

  /* ---------------- UPDATE FUEL ITEM ---------------- */
  const handleFuelUpdate = async (fuelId: string | number) => {
    await updateFuel({
      id: fuelId,
      data: {
        actualQuantity: Number(editedFuelItem.quantity),
        actualPrice: Number(editedFuelItem.price),
        actualTotal:
          Number(editedFuelItem.quantity) * Number(editedFuelItem.price),
      },
    });
    setEditingFuelId(null); // Exit edit mode
  };

  return (
    <div className="flex flex-col gap-6 dark:border-strokedark dark:bg-black dark:text-white">
      <div className="flex items-center justify-between border-b border-stroke bg-blue-50 px-4 py-2 dark:border-strokedark">
        <h3 className="font-semibold text-blue-900">Fuel Details</h3>
      </div>
      <div className="rounded-md border border-stroke bg-white">
        {/* Fuel Table */}
        <div className="overflow-x-auto p-4 dark:bg-black">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:border-strokedark dark:bg-black dark:text-white">
              <tr>
                <th className="p-2 text-left">Fuel Type</th>
                <th className="p-2 text-left">Quantity</th>
                <th className="p-2 text-left">Price (₹)</th>
                <th className="p-2 text-left">Total (₹)</th>
                <th className="p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:border-strokedark dark:bg-meta-4 dark:text-white">
              {fueldata.length > 0 ? (
                fueldata.map((fuel: any) => (
                  <tr
                    key={fuel.id}
                    className="border-t border-stroke dark:border-strokedark"
                  >
                    <td className="p-2">{fuel.name}</td>
                    <td className="p-2">
                      {editingFuelId === fuel.id ? (
                        <input
                          type="number"
                          value={editedFuelItem.quantity || fuel.actualQuantity}
                          onChange={(e) =>
                            setEditedFuelItem({
                              ...editedFuelItem,
                              quantity: e.target.value,
                            })
                          }
                          className="w-24 rounded border px-2 py-1 dark:bg-meta-4"
                        />
                      ) : (
                        fuel.actualQuantity || fuel.quantity
                      )}
                    </td>
                    <td className="p-2">
                      {editingFuelId === fuel.id ? (
                        <input
                          type="number"
                          value={editedFuelItem.price || fuel.actualPrice}
                          onChange={(e) =>
                            setEditedFuelItem({
                              ...editedFuelItem,
                              price: e.target.value,
                            })
                          }
                          className="w-24 rounded border px-2 py-1"
                        />
                      ) : (
                        `₹${fuel.actualPrice || fuel.price}`
                      )}
                    </td>
                    <td className="p-2">
                      ₹{editedFuelItem.total || fuel.actualTot || fuel.total}
                    </td>
                    <td className="p-2">
                      {editingFuelId === fuel.id ? (
                        <button
                          onClick={() => handleFuelUpdate(fuel.id)}
                          className="text-graydark dark:text-gray-2"
                        >
                          <FiCheck className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingFuelId(fuel.id); // Enable edit mode
                            setEditedFuelItem({
                              quantity: fuel.actualQuantity,
                              price: fuel.actualPrice,
                              total: fuel.actualTotal,
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
                    colSpan={5}
                    className="text-gray-500 px-6 py-10 text-center"
                  >
                    No fuel data added
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

export default Fuel;
