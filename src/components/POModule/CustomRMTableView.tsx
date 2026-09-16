/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {FiTrash2, FiPlus} from 'react-icons/fi';

interface CategoryWiseData {
  category: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    inventory_value: number;
    category: string;
  }>;
  totalQuantity: number;
  totalInventoryValue: number;
}

interface CustomRMTableViewProps {
  customRawMaterialData: any;
  getCategoryWiseData: CategoryWiseData[];
  onClearData: () => void;
  onViewHistory: () => void;
  onCreateNew: () => void;
}

const CustomRMTableView: React.FC<CustomRMTableViewProps> = ({
  customRawMaterialData,
  getCategoryWiseData,
  onClearData,
  onViewHistory,
  onCreateNew,
}) => {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-gray-900 text-xl font-semibold dark:text-white">
          Raw Materials
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClearData}
            className="border-gray-300 dark:border-gray-600 flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
            Clear Data
          </button>
          <button
            type="button"
            onClick={onCreateNew}
            className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create New
          </button>
        </div>
      </div>

      {/* Category-wise Table */}
      <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-meta-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
            <thead className="h-16 rounded-t-md bg-blue-900 text-white dark:bg-blue-950">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Material Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Unit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke bg-white dark:divide-strokedark dark:bg-meta-4">
              {getCategoryWiseData.map((categoryData) => (
                <React.Fragment key={categoryData.category}>
                  {/* Category Header */}
                  <tr className="bg-gray-2 font-bold text-black dark:bg-meta-4 dark:text-white">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-800 dark:text-white">
                            {categoryData.category}
                          </span>
                          <span className="text-gray-600 dark:text-gray-300 text-sm">
                            ({categoryData.items.length} items)
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Category Items */}
                  {categoryData.items.map((item, itemIndex) => (
                    <tr
                      key={`${item.id}-${itemIndex}`}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-3">
                        {/* Empty for category column */}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-800 text-sm font-medium dark:text-white">
                          {item.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-600 dark:text-gray-400">
                          {item.quantity}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-600 dark:text-gray-400">
                          {item.unit}
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CustomRMTableView;
