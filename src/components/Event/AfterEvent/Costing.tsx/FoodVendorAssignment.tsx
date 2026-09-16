/* eslint-disable */
import React, {useState} from 'react';
import toast from 'react-hot-toast';
import {FiEdit} from 'react-icons/fi';
import {IoMdCheckmark} from 'react-icons/io';
import {RxCross2} from 'react-icons/rx';
import {
  useGetFoodLabour,
  useGetFoodVendor,
  useUpdateFoodLabour,
  useUpdateFoodVendor,
} from './costingHelper';

// ======================== FOOD VENDOR (Raw Materials) ========================
interface FoodVendorDisplayProps {
  subEventId: string;
}

const FoodVendorDisplay: React.FC<FoodVendorDisplayProps> = ({subEventId}) => {
  const {
    data: vendorData = [],
    isLoading,
    error,
  } = useGetFoodVendor(subEventId);

  const {mutateAsync: updateVendor} = useUpdateFoodVendor();

  const [editId, setEditId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  if (isLoading) {
    return (
      <div className="rounded-md border border-stroke p-4 text-center dark:border-strokedark">
        Loading food vendors...
      </div>
    );
  }

  if (error || !vendorData) {
    return (
      <div className="rounded-md border border-stroke p-4 text-center text-red-600 dark:border-strokedark">
        Failed to load food vendor data.
      </div>
    );
  }

  const handleEdit = (item: any) => {
    setEditId(item.id);
    setEditValues({
      actual: item.actual ?? '',
      price: item.actualPrice || 0,
      preparation: item.preparation || 0,
      transport: item.actualTransport || 0,
    });
  };

  const handleChange = (field: string, value: any) => {
    setEditValues((prev: any) => ({...prev, [field]: value}));
  };

  const handleSave = async (item: any) => {
    const price = Number(editValues.price) || 0;
    const preparation = Number(editValues.preparation) || 0;
    const transport = Number(editValues.transport) || 0;
    const total = price * preparation + transport;
    const actual = editValues.actual === '' ? null : Number(editValues.actual);

    try {
      await updateVendor({
        id: item.id,
        data: {
          rate: price,
          preparation,
          transport,
          actual,
          total,
        },
      });
      toast.success('Food vendor updated successfully');
    } catch (err) {
      toast.error('Failed to update food vendor');
    }

    setEditId(null);
    setEditValues({});
  };

  const handleCancel = () => {
    setEditId(null);
    setEditValues({});
  };

  return (
    <div className="rounded-md border border-stroke dark:border-strokedark">
      <div className="flex items-center justify-between border-b border-stroke bg-green-50 px-4 py-2 dark:border-strokedark">
        <h3 className="font-semibold text-green-950">Food Vendor</h3>
      </div>

      <div className="overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Vendor</th>
              <th className="p-2 text-left">Dish</th>
              <th className="p-2 text-center">Preparation</th>
              <th className="p-2 text-center">Count</th>
              <th className="p-2 text-center">Actual Count</th>
              <th className="p-2 text-center">Price</th>
              <th className="p-2 text-center">Transport</th>
              <th className="p-2 text-center">Total</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendorData.map((item: any) => {
              const isEditing = editId === item.id;
              const displayTotal =
                ((isEditing
                  ? (editValues.price ?? item.actualPrice)
                  : item.actualPrice) || 0) *
                  ((isEditing
                    ? (editValues.actual ?? item.actual)
                    : item.actual) || 0) +
                ((isEditing
                  ? (editValues.transport ?? item.actualTransport)
                  : item.actualTransport) || 0);

              return (
                <tr
                  key={item.id}
                  className="border-t border-stroke dark:border-strokedark"
                >
                  <td className="p-2">{item.vendor || 'N/A'}</td>
                  <td className="p-2">{item.dishName || 'N/A'}</td>
                  {/* Preparation - Editable */}
                  <td className="p-2 text-center">{item.preparation || 0}</td>

                  {/* Order Qty */}
                  <td className="p-2 text-center">{item.expected || 0}</td>

                  {/* Actual Qty - Editable */}
                  <td className="p-2 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={editValues.actual ?? ''}
                        onChange={(e) => handleChange('actual', e.target.value)}
                        className="w-20 rounded border px-1 text-center"
                        placeholder="Actual"
                      />
                    ) : (
                      (item.actual ?? '-')
                    )}
                  </td>

                  {/* Price - Editable */}
                  <td className="p-2 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editValues.price ?? ''}
                        onChange={(e) => handleChange('price', e.target.value)}
                        className="w-24 rounded border px-1 text-center"
                      />
                    ) : (
                      <>₹{(item.actualPrice || item.price || 0).toFixed(2)}</>
                    )}
                  </td>

                  {/* Transport - Editable */}
                  <td className="p-2 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editValues.transport ?? ''}
                        onChange={(e) =>
                          handleChange('transport', e.target.value)
                        }
                        className="w-24 rounded border px-1 text-center"
                      />
                    ) : (
                      <>
                        ₹
                        {(item.actualTransport || item.transport || 0).toFixed(
                          2,
                        )}
                      </>
                    )}
                  </td>

                  {/* Total */}
                  <td className="p-2 text-center font-semibold">
                    ₹{displayTotal || 0}
                  </td>

                  {/* Actions */}
                  <td className="p-2">
                    <div className="flex justify-center gap-2">
                      {isEditing ? (
                        <>
                          <button onClick={() => handleSave(item)}>
                            <IoMdCheckmark className="h-4 w-4 cursor-pointer text-graydark dark:text-gray-2" />
                          </button>
                          <button onClick={handleCancel}>
                            <RxCross2 className="h-4 w-4 cursor-pointer text-graydark dark:text-gray-2" />
                          </button>
                        </>
                      ) : (
                        <>
                          <FiEdit
                            onClick={() => handleEdit(item)}
                            className="h-4 w-4 cursor-pointer text-graydark dark:text-gray-2"
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {vendorData.length === 0 && (
          <div className="text-gray-500 py-8 text-center">
            No food vendors assigned yet.
          </div>
        )}
      </div>
    </div>
  );
};

// ======================== FOOD LABOUR ========================
interface FoodLabourDisplayProps {
  subEventId: string;
}

const FoodLabourDisplay: React.FC<FoodLabourDisplayProps> = ({subEventId}) => {
  const {
    data: labourData = [],
    isLoading,
    error,
  } = useGetFoodLabour(subEventId);

  const {mutateAsync: updateLabour} = useUpdateFoodLabour();

  const [editId, setEditId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  if (isLoading) {
    return (
      <div className="rounded-md border border-stroke p-4 text-center dark:border-strokedark">
        Loading food labour...
      </div>
    );
  }

  if (error || !labourData) {
    return (
      <div className="rounded-md border border-stroke p-4 text-center text-red-600 dark:border-strokedark">
        Failed to load food labour data.
      </div>
    );
  }

  const handleEdit = (item: any) => {
    setEditId(item.id);
    setEditValues({
      actual: item.actual ?? '',
      price: item.actualPrice || 0, // Salary
      count: item.count || 0,
      transport: item.actualTransport || 0,
    });
  };

  const handleChange = (field: string, value: any) => {
    setEditValues((prev: any) => ({...prev, [field]: value}));
  };

  const handleSave = async (item: any) => {
    const salary = Number(item.singlePrice) || 0;
    const count = Number(editValues.count) || 0;
    const transport = Number(editValues.transport) || 0;
    const total = salary * editValues.actual + editValues.transport;
    const actual = editValues.actual === '' ? null : Number(editValues.actual);

    try {
      await updateLabour({
        id: item.id,
        data: {
          rate: salary,
          count,
          transport,
          actual,
          total,
        },
      });
    } catch (err) {
      console.error('Failed to update food labour');
    }

    setEditId(null);
    setEditValues({});
  };

  const handleCancel = () => {
    setEditId(null);
    setEditValues({});
  };

  return (
    <div className="rounded-md border border-stroke dark:border-strokedark">
      <div className="flex items-center justify-between border-b border-stroke bg-red-50 px-4 py-2 dark:border-strokedark">
        <h3 className="font-semibold text-red-950">Food Labour</h3>
      </div>

      <div className="overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Vendor</th>
              <th className="p-2 text-left">Dish</th>
              <th className="p-2 text-center">Salary</th>
              <th className="p-2 text-center">Count</th>
              <th className="p-2 text-center">Actual Count</th>
              <th className="p-2 text-center">Transport</th>
              <th className="p-2 text-center">Total</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {labourData.map((item: any) => {
              const isEditing = editId === item.id;
              const displayTotal =
                ((isEditing
                  ? (editValues.actualPrice ?? item.actualPrice)
                  : item.actualPrice) || 0) *
                  ((isEditing
                    ? (editValues.actual ?? item.actual)
                    : item.actual) || 0) +
                ((isEditing
                  ? (editValues.actualTransport ?? item.actualTransport)
                  : item.actualTransport) || 0);

              return (
                <tr
                  key={item.id}
                  className="border-t border-stroke dark:border-strokedark"
                >
                  <td className="p-2">{item.vendor || 'N/A'}</td>
                  <td className="p-2">{item.dishName || 'N/A'}</td>

                  {/* Salary (price field) - Editable */}
                  <td className="p-2 text-center">
                    {<>₹{(item.singlePrice || 0).toFixed(2)}</>}
                  </td>

                  {/* Count - Editable */}
                  <td className="p-2 text-center">{item.count || 0}</td>

                  {/* Actual Count - Editable */}
                  <td className="p-2 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={editValues.actual ?? ''}
                        onChange={(e) => handleChange('actual', e.target.value)}
                        className="w-20 rounded border px-1 text-center"
                        placeholder="Actual"
                      />
                    ) : (
                      (item.actual ?? '-')
                    )}
                  </td>

                  {/* Transport - Editable */}
                  <td className="p-2 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editValues.transport ?? ''}
                        onChange={(e) =>
                          handleChange('transport', e.target.value)
                        }
                        className="w-24 rounded border px-1 text-center"
                      />
                    ) : (
                      <>₹{(item.actualTransport || 0).toFixed(2)}</>
                    )}
                  </td>

                  {/* Total */}
                  <td className="p-2 text-center font-semibold">
                    ₹{displayTotal.toFixed(2)}
                  </td>

                  {/* Actions */}
                  <td className="p-2">
                    <div className="flex justify-center gap-2">
                      {isEditing ? (
                        <>
                          <button onClick={() => handleSave(item)}>
                            <IoMdCheckmark className="h-4 w-4 cursor-pointer text-graydark dark:text-gray-2" />
                          </button>
                          <button onClick={handleCancel}>
                            <RxCross2 className="h-4 w-4 cursor-pointer text-graydark dark:text-gray-2" />
                          </button>
                        </>
                      ) : (
                        <>
                          <FiEdit
                            onClick={() => handleEdit(item)}
                            className="h-4 w-4 cursor-pointer text-graydark dark:text-gray-2"
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {labourData.length === 0 && (
          <div className="text-gray-500 py-8 text-center">
            No food labour assigned yet.
          </div>
        )}
      </div>
    </div>
  );
};

// ======================== MAIN COMPONENT ========================
interface FoodVendorAssignmentsProps {
  subEventId: string;
}

const FoodVendorAssignments: React.FC<FoodVendorAssignmentsProps> = ({
  subEventId,
}) => {
  return (
    <div className="space-y-8">
      <FoodVendorDisplay subEventId={subEventId} />
      <FoodLabourDisplay subEventId={subEventId} />
    </div>
  );
};

export default FoodVendorAssignments;
