import React, {useState} from 'react';
import {FaEdit, FaSave, FaTrash} from 'react-icons/fa';

type Column = {
  id: number;
  people: string;
  kg: string;
  isEditing?: boolean;
};

type Row = {
  id: number;
  rawMaterial?: string;
  process?: string;
  unit?: string;
  name?: string;
  quantities: Record<number | string, string>;
};

export default function RawMaterialsTableAdmin({
  columns,
  rows,
  rawmaterialOptions,
  processOptions,
  editColumnValues,
  setEditColumnValues,
  removeColumn,
  startEditColumn,
  cancelEditColumn,
  updateColumn,
  handleQtyChange,
  setRows,
  handleRawMaterialChange,
  handleProcessChange,
}: {
  columns: Column[];
  rows: Row[];
  rawmaterialOptions: {value: string | number; label: string; unit?: string}[];
  processOptions: {value: string | number; label: string}[];
  editColumnValues: Record<number, {people: string; kg: string}>;
  setEditColumnValues: React.Dispatch<
    React.SetStateAction<Record<number, {people: string; kg: string}>>
  >;
  removeColumn: (id: number) => void;
  startEditColumn: (id: number, people: string, kg: string) => void;
  cancelEditColumn: (id: number) => void;
  updateColumn: (id: number) => void;
  handleQtyChange: (rowId: number, colId: number, value: string) => void;
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
  handleRawMaterialChange: (rowId: number, value: string) => void;
  handleProcessChange: (rowId: number, value: string) => void;
}) {
  const [rowToDelete, setRowToDelete] = useState<Row | null>(null);
  const [colToDelete, setColToDelete] = useState<Column | null>(null);

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
                <th key={col.id} className="w-32 p-2 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    {col.isEditing ? (
                      <>
                        <input
                          type="text"
                          placeholder="People"
                          className="w-full rounded-md border border-stroke bg-transparent px-3 py-3 text-sm text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                          value={editColumnValues[col.id]?.people || col.people}
                          onChange={(e) =>
                            setEditColumnValues((p) => ({
                              ...p,
                              [col.id]: {
                                ...p[col.id],
                                people: e.target.value,
                              },
                            }))
                          }
                        />
                        <input
                          type="text"
                          placeholder="Kg"
                          className="w-full rounded-md border border-stroke bg-transparent px-3 py-3 text-sm text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                          value={editColumnValues[col.id]?.kg || col.kg}
                          onChange={(e) =>
                            setEditColumnValues((p) => ({
                              ...p,
                              [col.id]: {
                                ...p[col.id],
                                kg: e.target.value,
                              },
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() => updateColumn(col.id)}
                          className="text-xs text-graydark dark:text-gray-2"
                        >
                          <FaSave className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span>{col.people || 'People'}</span>
                        <span>{col.kg || 'Kg'}</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setColToDelete(col)}
                            className="text-xs text-graydark dark:text-gray-2"
                          >
                            <FaTrash className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              startEditColumn(col.id, col.people, col.kg)
                            }
                            className="text-xs text-graydark dark:text-gray-2"
                          >
                            <FaEdit className="h-3 w-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="w-16 p-2">
                  <button
                    type="button"
                    onClick={() => setRowToDelete(row)}
                    className="text-xs text-graydark dark:text-gray-2"
                  >
                    <FaTrash className="h-3 w-3" />
                  </button>
                </td>
                <td className="w-60 p-2">
                  <select
                    className="w-full rounded-md border border-stroke bg-transparent px-3 py-3 text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    value={row.rawMaterial ?? ''}
                    onChange={(e) =>
                      handleRawMaterialChange(row.id, e.target.value)
                    }
                  >
                    <option value="">Select Material</option>
                    {rawmaterialOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="w-60 p-2">
                  <select
                    className="w-full rounded-md border border-stroke bg-transparent px-3 py-3 text-sm dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    value={row.process ?? ''}
                    onChange={(e) =>
                      handleProcessChange(row.id, e.target.value)
                    }
                  >
                    <option value="">Select Process</option>
                    {processOptions.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </td>

                {columns.map((col) => (
                  <td key={col.id} className="w-40 p-2 text-center">
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full rounded-md border border-stroke bg-transparent px-3 py-3 pr-10 text-sm text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        value={parseFloat(
                          parseFloat(row.quantities[col.id] || '0').toFixed(2),
                        )}
                        placeholder="Qty"
                        onChange={(e) =>
                          handleQtyChange(row.id, col.id, e.target.value)
                        }
                      />
                      {row.unit && (
                        <span className="text-gray-500 dark:text-gray-300 absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                          {row.unit}
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Row Delete Modal */}
      {rowToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="border-gray-200 rounded border bg-white p-6 text-center shadow-md dark:border-strokedark dark:bg-boxdark">
            <p className="text-gray-900 dark:text-gray-100 mb-4 font-semibold">
              Are you sure you want to delete this row?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setRows((prev) =>
                    prev.filter((r) => r.id !== rowToDelete.id),
                  );
                  setRowToDelete(null);
                }}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 dark:hover:bg-red-500"
              >
                Yes
              </button>
              <button
                onClick={() => setRowToDelete(null)}
                className="bg-gray-300 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 rounded px-4 py-2"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Column Delete Modal */}
      {colToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="border-gray-200 rounded border bg-white p-6 text-center shadow-md dark:border-strokedark dark:bg-boxdark">
            <p className="text-gray-900 dark:text-gray-100 mb-4 font-semibold">
              Are you sure you want to delete this column?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  removeColumn(colToDelete.id);
                  setColToDelete(null);
                }}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 dark:hover:bg-red-500"
              >
                Yes
              </button>
              <button
                onClick={() => setColToDelete(null)}
                className="bg-gray-300 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 rounded px-4 py-2"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
