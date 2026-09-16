/* eslint-disable */
import React from 'react';
import {FaTrash} from 'react-icons/fa';
import SearchableDropdown from '../Dish/CustomDropdown/SearchableDropdown';
import {Column, Row} from './types';
import {FiPlus} from 'react-icons/fi';

interface Props {
  columns: Column[];
  rows: Row[];
  rawmaterialOptions: any[];
  processOptions: any[];
  removeColumn: (id: number) => void;
  handleQtyChange: (rowId: number, colId: number, v: string) => void;
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>; // ← Must be passed
}

const RawMaterialsTable: React.FC<Props> = ({
  columns,
  rows,
  rawmaterialOptions,
  processOptions,
  removeColumn,
  handleQtyChange,
  setRows,
  setColumns,
}) => {
  const [rowToDelete, setRowToDelete] = React.useState<Row | null>(null);
  const [colToDelete, setColToDelete] = React.useState<Column | null>(null);

  // Update column values directly
  const handleColumnChange = (
    colId: number,
    field: 'people' | 'kg',
    value: string,
  ) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === colId ? {...col, [field]: value} : col)),
    );
  };

  // Add new row right after the clicked row (or at the end if last)
  const handleAddRowAfter = (currentRowId: number) => {
    const newRow: Row = {
      id: Date.now(),
      rawMaterial: '',
      process: '',
      unit: '',
      quantities: {},
    };

    setRows((prev) => {
      const index = prev.findIndex((r) => r.id === currentRowId);
      if (index === -1) return [...prev, newRow]; // fallback

      const newRows = [...prev];
      newRows.splice(index + 1, 0, newRow); // insert after current row
      return newRows;
    });
  };

  return (
    <div className="overflow-hidden rounded border border-stroke dark:border-strokedark">
      <div className="overflow-x-auto">
        <table className="min-w-max text-left text-sm">
          <thead className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
            <tr>
              <th className="w-16 p-2"></th>
              <th className="w-60 p-2">Raw Material</th>
              <th className="w-60 p-2">Process</th>
              {columns.map((col) => (
                <th key={col.id} className="w-36 p-2 text-center">
                  <div className="flex flex-col items-center space-y-2 p-1">
                    <input
                      type="text"
                      placeholder="People"
                      className="w-full rounded-md border border-stroke bg-transparent px-3 py-2.5 text-sm text-black outline-none focus:border-blue-500 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      value={col.people || ''}
                      onChange={(e) =>
                        handleColumnChange(col.id, 'people', e.target.value)
                      }
                    />
                    <input
                      type="text"
                      placeholder="Kg"
                      className="w-full rounded-md border border-stroke bg-transparent px-3 py-2.5 text-sm text-black outline-none focus:border-blue-500 dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      value={col.kg || ''}
                      onChange={(e) =>
                        handleColumnChange(col.id, 'kg', e.target.value)
                      }
                    />

                    <button
                      type="button"
                      onClick={() => setColToDelete(col)}
                      className="mt-1 text-xs text-graydark dark:text-gray-2"
                    >
                      <FaTrash className="h-3 w-3" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => {
              const isLastRow = index === rows.length - 1;

              return (
                <tr key={row.id}>
                  <td className="w-20 p-3">
                    <div className="flex items-center gap-3">
                      {/* Delete Button - Show on ALL rows */}
                      <button
                        type="button"
                        onClick={() => setRowToDelete(row)}
                        className="text-graydark dark:text-gray-2 transition-colors "
                        title="Delete row"
                      >
                        <FaTrash className="h-3 w-3" />
                      </button>

                      {/* Add Button - Show ONLY on the LAST row */}
                      {isLastRow && (
                        <button
                          type="button"
                          onClick={() => handleAddRowAfter(row.id)}
                          className="text-graydark dark:text-gray-2 transition-colors "
                          title="Add new row below"
                        >
                          <FiPlus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="w-60 p-3">
                    <SearchableDropdown
                      options={rawmaterialOptions}
                      value={row.rawMaterial}
                      onChange={(val) => {
                        const opt = rawmaterialOptions.find(
                          (o) => o.value === val,
                        );
                        setRows((prev) =>
                          prev.map((r) =>
                            r.id === row.id
                              ? {...r, rawMaterial: val, unit: opt?.unit || ''}
                              : r,
                          ),
                        );
                      }}
                      placeholder="Select Raw Material"
                    />
                  </td>

                  <td className="w-60 p-3">
                    <SearchableDropdown
                      searchable={false}
                      options={processOptions}
                      value={row.process}
                      onChange={(val) =>
                        setRows((prev) =>
                          prev.map((r) =>
                            r.id === row.id ? {...r, process: val} : r,
                          ),
                        )
                      }
                    />
                  </td>

                  {columns.map((col) => (
                    <td key={col.id} className="w-40 p-3 text-center">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          className="w-full rounded-md border border-stroke bg-transparent px-3 py-3 pr-10 text-sm outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                          value={row.quantities[col.id] || ''}
                          placeholder="0.00"
                          onChange={(e) =>
                            handleQtyChange(row.id, col.id, e.target.value)
                          }
                        />
                        {row.unit && (
                          <span className="text-gray-500 dark:text-gray-300 absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                            {row.unit}
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Row Modal */}
      {rowToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded border bg-white p-6 text-center shadow-md dark:border-strokedark dark:bg-boxdark">
            <p className="text-gray-900 dark:text-gray-100 mb-4 font-semibold">
              Delete this row?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setRows((prev) =>
                    prev.filter((r) => r.id !== rowToDelete.id),
                  );
                  setRowToDelete(null);
                }}
                className="rounded bg-red-600 px-5 py-2 text-white hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={() => setRowToDelete(null)}
                className="bg-gray-300 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-100 rounded px-5 py-2"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Column Modal */}
      {colToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded border bg-white p-6 text-center shadow-md dark:border-strokedark dark:bg-boxdark">
            <p className="text-gray-900 dark:text-gray-100 mb-4 font-semibold">
              Delete this column (People + Kg)?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  removeColumn(colToDelete.id);
                  setColToDelete(null);
                }}
                className="rounded bg-red-600 px-5 py-2 text-white hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={() => setColToDelete(null)}
                className="bg-gray-300 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-100 rounded px-5 py-2"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RawMaterialsTable;
