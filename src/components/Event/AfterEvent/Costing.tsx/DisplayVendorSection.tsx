/* eslint-disable */
import React, {useState} from 'react';
import {FiEdit} from 'react-icons/fi';
import {MdDelete} from 'react-icons/md';
import {IoMdCheckmark} from 'react-icons/io';
import {RxCross2} from 'react-icons/rx';
import {useGetDisplayVendor, useUpdateDisplayVendor} from './costingHelper'; // Adjust path if needed
import toast from 'react-hot-toast';

interface DisplayVendorDisplayProps {
  subEventId: string;
}

const DisplayVendorDisplay: React.FC<DisplayVendorDisplayProps> = ({
  subEventId,
}) => {
  const {
    data: displayData = [],
    isLoading,
    error,
  } = useGetDisplayVendor(subEventId);

  const {mutateAsync: updateDisplay} = useUpdateDisplayVendor();

  const [editId, setEditId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  if (isLoading) {
    return (
      <div className="rounded-md border border-stroke p-4 text-center dark:border-strokedark">
        Loading display vendors...
      </div>
    );
  }

  if (error || !displayData) {
    return (
      <div className="rounded-md border border-stroke p-4 text-center text-red-600 dark:border-strokedark">
        Failed to load display vendor data or no data available.
      </div>
    );
  }

  const handleEdit = (item: any) => {
    setEditId(item.id);
    setEditValues({
      quantity: item.quantity || 1,
      actual: item.actual ?? '',
      price: item.actualPrice || 0,
    });
  };

  const handleChange = (field: string, value: any) => {
    setEditValues((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (item: any) => {
    const quantity = Number(editValues.quantity) || 1;
    const price = Number(editValues.price) || 0;
    const total = editValues.actual * price;
    const actual = editValues.actual === '' ? null : Number(editValues.actual);

    try {
      await updateDisplay({
        id: item.id,
        data: {
          quantity,
          rate: price,
          totalAmount: total,
          actual,
        },
      });
    } catch (err) {
      console.error('Failed to update display vendor');
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
      <div className="flex items-center justify-between border-b border-stroke bg-purple-50 px-4 py-2 dark:border-strokedark">
        <h3 className="font-semibold text-purple-950">Display Vendors</h3>
      </div>

      <div className="overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Vendor</th>
              <th className="p-2 text-left">Display</th>
              <th className="p-2 text-center">Count</th>
              <th className="p-2 text-center">Actual Count</th>
              <th className="p-2 text-center">Price</th>
              <th className="p-2 text-center">Total</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {displayData.map((item: any) => {
              const isEditing = editId === item.id;

              const displayTotal =
                ((isEditing
                  ? (editValues.actual ?? item.actual)
                  : item.actual) || 0) *
                ((isEditing
                  ? (editValues.price ?? item.actualPrice)
                  : item.actualPrice) || 0);

              return (
                <tr
                  key={item.id}
                  className="border-t border-stroke dark:border-strokedark"
                >
                  {/* Vendor Name */}
                  <td className="p-2">{item.vendor || 'N/A'}</td>

                  {/* Display Name */}
                  <td className="p-2">{item.display || 'N/A'}</td>

                  {/* Quantity - Editable */}
                  <td className="p-2 text-center">{item.quantity || 0}</td>

                  {/* Actual Count - Editable */}
                  <td className="p-2 text-center">
                    {' '}
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editValues.actual ?? ''}
                        onChange={(e) => handleChange('actual', e.target.value)}
                        className="w-24 rounded border px-1 text-center"
                      />
                    ) : (
                      <>{item.actual || 0}</>
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
                      <>₹{(item.actualPrice || 0).toFixed(2)}</>
                    )}
                  </td>

                  {/* Total - Auto-calculated */}
                  <td className="p-2 text-center font-semibold">
                    ₹{item.actualTotalPrice.toFixed(2)}
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

        {displayData.length === 0 && (
          <div className="text-gray-500 py-8 text-center">
            No display vendors assigned yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplayVendorDisplay;
