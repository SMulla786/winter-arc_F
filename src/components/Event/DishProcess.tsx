/* eslint-disable  */
import React, {ReactNode, useState} from 'react';
import {BiChevronDown, BiChevronUp} from 'react-icons/bi';

interface RawMaterial {
  process: ReactNode;
  id: string;
  name: string;
  quantity: number;
  unit: string;
  dishKg: number;
  dishPrice: number;
}

interface Dish {
  id: string;
  name: string;
  preparation: number;
  rawMaterials: RawMaterial[];
  processes: any[]; // Optional - not used here
}

interface SubEvent {
  id: string;
  name: string;
  dishes: Dish[];
}

interface DishProcessPropTypes {
  subEvent: SubEvent;
}

const DishProcess: React.FC<DishProcessPropTypes> = ({subEvent}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [openDishId, setOpenDishId] = useState<string | null>(null);
  const [openSubEventId, setOpenSubEventId] = useState<string | null>(null);
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);

  console.log('====================================');
  console.log('SubEvent:', subEvent);
  console.log('====================================');

  return (
    <div className="border-gray-200 dark:border-gray-700 dark:bg-boxdar mt-2.5 rounded-lg shadow-sm">
      {/* Sub Event Header */}

      <div
        className="flex cursor-pointer items-center justify-between rounded-t-lg bg-blue-100 p-4 py-3 dark:bg-meta-4"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h2 className="text-gray-700 truncate text-xl font-semibold dark:text-white">
          {subEvent.name}
        </h2>
        <button
          key={subEvent.id}
          onClick={() =>
            setOpenSubEventId((prev) =>
              prev === subEvent.id ? null : subEvent.id,
            )
          }
          className={`whitespace-nowrap rounded border-b-2 px-4 py-2 text-sm transition-all duration-200 ${
            openSubEventId === subEvent.id
              ? 'border-blue-600 bg-sky-100 text-blue-600 dark:border-blue-400 dark:bg-blue-900 dark:text-blue-400'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300 border-transparent hover:border-blue-300 hover:text-blue-500 dark:bg-meta-4 dark:text-white dark:hover:text-blue-300'
          }`}
        >
          {subEvent.name}
        </button>
      </div>

      {/* Body */}
      {!isCollapsed && (
        <div className="flex p-4">
          {/* Dish List */}

          {subEvent.dishes.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 py-6 text-center">
              No dishes found
            </div>
          ) : (
            <div className="space-y-2 rounded border p-2">
              {subEvent.dishes.map((dish) => {
                const isSelected = openDishId === dish.id;
                return (
                  <button
                    key={dish.id}
                    onClick={() =>
                      setOpenDishId((prev) =>
                        prev === dish.id ? null : dish.id,
                      )
                    }
                    className={`block w-full rounded border-b-2 px-4 py-2 text-left text-sm transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-600 bg-sky-100 text-blue-600 dark:border-blue-400 dark:bg-blue-900 dark:text-blue-400'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300 border-transparent hover:border-blue-300 hover:text-blue-500 dark:bg-meta-4 dark:text-white dark:hover:text-blue-300'
                    }`}
                  >
                    {dish.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Raw Materials Table */}
          {openDishId && (
            <div className="overflow-x-auto rounded p-4">
              {(() => {
                const selectedDish = subEvent.dishes.find(
                  (d) => d.id === openDishId,
                );
                if (!selectedDish) return null;

                return selectedDish.rawMaterials &&
                  selectedDish.rawMaterials.length > 0 ? (
                  <table className="w-full table-fixed border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="bg-gray-100 text-gray-700 dark:text-gray-200 w-1/3 p-3 text-left font-semibold dark:bg-meta-4">
                          Raw Material
                        </th>
                        <th className="bg-gray-100 text-gray-700 dark:text-gray-200 w-1/3 p-3 text-left font-semibold dark:bg-meta-4">
                          Qty
                        </th>
                        <th className="bg-gray-100 text-gray-700 dark:text-gray-200 w-1/3 p-3 text-left font-semibold dark:bg-meta-4">
                          Dish Process
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDish.rawMaterials.map((rm) => (
                        <tr key={rm.id} className="dark:bg-gray-800">
                          <td className="text-gray-700 dark:text-gray-200 p-3">
                            {rm.name}
                          </td>
                          <td className="text-gray-700 dark:text-gray-200 p-3">
                            {parseFloat(rm.quantity).toFixed(2)} {rm.unit}
                          </td>
                          <td className="text-gray-700 dark:text-gray-200 p-3">
                            {rm.process}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400">
                    No raw materials for this dish.
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DishProcess;
