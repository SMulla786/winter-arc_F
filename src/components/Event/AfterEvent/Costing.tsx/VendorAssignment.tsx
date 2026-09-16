/* eslint-disable */
import React, {useState} from 'react';
import {FiEdit} from 'react-icons/fi';
import {IoMdCheckmark} from 'react-icons/io';
import {RxCross2} from 'react-icons/rx';
import {useGetCostingManpower, useUpdateCostingManpower} from './costingHelper';

interface ManpowerDisplayProps {
  subEventId: string;
}

const ManpowerDisplay: React.FC<ManpowerDisplayProps> = ({subEventId}) => {
  const {
    data: manpowerData,
    isLoading,
    error,
  } = useGetCostingManpower(subEventId);

  const {mutateAsync: updateManpower} = useUpdateCostingManpower();

  const [editId, setEditId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  if (isLoading) {
    return (
      <div className="rounded-md border border-stroke p-4 text-center dark:border-strokedark">
        Loading manpower data...
      </div>
    );
  }

  if (error || !manpowerData) {
    return (
      <div className="rounded-md border border-stroke p-4 text-center text-red-600 dark:border-strokedark">
        Failed to load manpower data or no data available.
      </div>
    );
  }

  const handleEdit = (item: any) => {
    setEditId(item.id);
    setEditValues({
      transport: item.transport,
      quantity: item.quantity,
      actual: item.actual,
      rate: item.rate,
    });
  };

  const handleChange = (field: string, value: any) => {
    setEditValues((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (item: any) => {
    await updateManpower({
      id: item.id,
      data: {
        transport: Number(editValues.transport),
        quantity: Number(editValues.quantity),
        actual: editValues.actual === '' ? null : Number(editValues.actual),
        rate: Number(editValues.rate),
        totalAmount:
          Number(editValues.actual) * Number(editValues.rate) +
          Number(editValues.transport),
      },
    });

    setEditId(null);
    setEditValues({});
  };

  const handleCancel = () => {
    setEditId(null);
    setEditValues({});
  };

  return (
    <div className="rounded-md border border-stroke dark:border-strokedark">
      <div className="flex items-center justify-between border-b border-stroke bg-blue-50 px-4 py-2 dark:border-strokedark">
        <h3 className="font-semibold text-blue-900">Manpower Vendor</h3>
      </div>

      <div className="overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Vendor Name</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-center">Count</th>
              <th className="p-2 text-center">Actual Count</th>
              <th className="p-2 text-center">Rate</th>
              <th className="p-2 text-center">Transport</th>
              <th className="p-2 text-center">Total</th>
              <th className="p-2 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {manpowerData.map((item: any) => (
              <tr
                key={item.id}
                className="border-t border-stroke dark:border-strokedark"
              >
                <td className="p-2">{item.vendor || 'N/A'}</td>
                <td className="p-2">{item.role || 'N/A'}</td>

                {/* Count */}
                <td className="p-2 text-center">{item.quantity || 1}</td>

                {/* Actual */}
                <td className="p-2 text-center">
                  {editId === item.id ? (
                    <input
                      type="number"
                      value={editValues.actual ?? ''}
                      onChange={(e) => handleChange('actual', e.target.value)}
                      className="w-16 rounded border px-1 text-center"
                    />
                  ) : (
                    (item.actual ?? '-')
                  )}
                </td>

                {/* Rate */}
                <td className="p-2 text-center">
                  {editId === item.id ? (
                    <input
                      type="number"
                      value={editValues.rate ?? ''}
                      onChange={(e) => handleChange('rate', e.target.value)}
                      className="w-20 rounded border px-1 text-center"
                    />
                  ) : (
                    <>₹{Number(item.rate || 0).toFixed(2)}</>
                  )}
                </td>

                {/* Transport */}
                <td className="p-2 text-center">
                  {editId === item.id ? (
                    <input
                      type="number"
                      value={editValues.transport ?? ''}
                      onChange={(e) =>
                        handleChange('transport', e.target.value)
                      }
                      className="w-20 rounded border px-1 text-center"
                    />
                  ) : (
                    <>₹{Number(item.transport || 0).toFixed(2)}</>
                  )}
                </td>
                {/* Total */}
                <td className="p-2 text-center font-semibold">
                  ₹{Number(item.totalAmount || 0).toFixed(2)}
                </td>

                {/* Action */}
                <td className="p-2">
                  <div className="flex justify-center gap-2">
                    {editId === item.id ? (
                      <>
                        <button
                          onClick={() => handleSave(item)}
                          className="text-xs font-semibold text-green-600"
                        >
                          <IoMdCheckmark className="h-4 w-4 cursor-pointer text-graydark dark:text-gray-2" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-xs font-semibold text-red-600"
                        >
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManpowerDisplay;
