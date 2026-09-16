// /* eslint-disable */
// import React from 'react';
// import {FaEdit, FaSave, FaTrash} from 'react-icons/fa';

// import SearchableDropdown from '../Dish/CustomDropdown/SearchableDropdown';
// import {Column, Row} from './types';

// interface Props {
//   columns: Column[];
//   rows: Row[];
//   rawmaterialOptions: any[];
//   processOptions: any[];
//   editColumnValues: {[k: number]: {people: string; kg: string}};
//   setEditColumnValues: React.Dispatch<
//     React.SetStateAction<{[k: number]: {people: string; kg: string}}>
//   >;
//   removeColumn: (id: number) => void;
//   toggleEditColumn: (id: number, people: string, kg: string) => void;
//   updateColumn: (id: number) => void;
//   handleQtyChange: (rowId: number, colId: number, v: string) => void;
//   setRows: React.Dispatch<React.SetStateAction<Row[]>>;
// }

// const RawMaterialsTable: React.FC<Props> = ({
//   columns,
//   rows,
//   rawmaterialOptions,
//   processOptions,
//   editColumnValues,
//   setEditColumnValues,
//   removeColumn,
//   toggleEditColumn,
//   updateColumn,
//   handleQtyChange,
//   setRows,
// }) => (
//   <div className="overflow-hidden rounded border border-stroke dark:border-strokedark">
//     <div className="overflow-x-auto">
//       <table className="min-w-max text-left text-sm">
//         <thead className="border-b border-stroke bg-gray-2 dark:border-strokedark dark:bg-meta-4">
//           <tr>
//             <th className="w-60 p-2">Raw Material</th>
//             <th className="w-60 p-2">Process</th>
//             {columns.map((col) => (
//               <th key={col.id} className="w-32 p-2 text-center">
//                 <div className="flex flex-col items-center space-y-3">
//                   {col.isEditing ? (
//                     <>
//                       {/* People */}
//                       <input
//                         type="text"
//                         placeholder="People"
//                         className="w-full rounded-md border border-stroke bg-transparent px-3 py-3 text-sm text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
//                         value={editColumnValues[col.id]?.people || col.people}
//                         onChange={(e) =>
//                           setEditColumnValues((p) => ({
//                             ...p,
//                             [col.id]: {
//                               ...p[col.id],
//                               people: e.target.value,
//                             },
//                           }))
//                         }
//                       />
//                       {/* Kg */}
//                       <input
//                         type="text"
//                         placeholder="Kg"
//                         className="w-full rounded-md border border-stroke bg-transparent px-3 py-3 text-sm text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
//                         value={editColumnValues[col.id]?.kg || col.kg}
//                         onChange={(e) =>
//                           setEditColumnValues((p) => ({
//                             ...p,
//                             [col.id]: {
//                               ...p[col.id],
//                               kg: e.target.value,
//                             },
//                           }))
//                         }
//                       />
//                       {/* Save */}
//                       <button
//                         type="button"
//                         onClick={() => updateColumn(col.id)}
//                         className="text-xs text-graydark dark:text-gray-2"
//                       >
//                         <FaSave className="h-3 w-3" />
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       <span>{col.people || 'People'}</span>
//                       <span>{col.kg || 'Kg'}</span>
//                       <div className="flex gap-2">
//                         <button
//                           type="button"
//                           onClick={() => removeColumn(col.id)}
//                           className="text-xs text-graydark dark:text-gray-2"
//                         >
//                           <FaTrash className="h-3 w-3" />
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() =>
//                             toggleEditColumn(col.id, col.people, col.kg)
//                           }
//                           className="text-xs text-graydark dark:text-gray-2"
//                         >
//                           <FaEdit className="h-3 w-3" />
//                         </button>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </th>
//             ))}
//           </tr>
//         </thead>

//         <tbody>
//           {rows
//             .slice()
//             .sort((a, b) => {
//               const aName =
//                 rawmaterialOptions.find((o) => o.value === a.rawMaterial)
//                   ?.label || '';
//               const bName =
//                 rawmaterialOptions.find((o) => o.value === b.rawMaterial)
//                   ?.label || '';
//               return aName.localeCompare(bName);
//             })
//             .map((row) => (
//               <tr key={row.id}>
//                 {/* Raw material dropdown */}
//                 <td className="w-60 p-2">
//                   <SearchableDropdown
//                     options={rawmaterialOptions}
//                     value={row.rawMaterial}
//                     onChange={(val) => {
//                       const opt = rawmaterialOptions.find(
//                         (o) => o.value === val,
//                       );
//                       setRows((prev) =>
//                         prev.map((r) =>
//                           r.id === row.id
//                             ? {
//                                 ...r,
//                                 rawMaterial: val,
//                                 unit: opt?.unit || '',
//                               }
//                             : r,
//                         ),
//                       );
//                     }}
//                     placeholder="Select Material"
//                   />
//                 </td>

//                 {/* Process dropdown */}
//                 <td className="w-60 p-2">
//                   <SearchableDropdown
//                     options={processOptions}
//                     value={row.process}
//                     onChange={(val) =>
//                       setRows((prev) =>
//                         prev.map((r) =>
//                           r.id === row.id ? {...r, process: val} : r,
//                         ),
//                       )
//                     }
//                   />
//                 </td>

//                 {/* Quantities */}
//                 {columns.map((col) => (
//                   <td key={col.id} className="w-40 p-2 text-center">
//                     <div className="relative">
//                       <input
//                         type="number"
//                         className="w-full rounded-md border border-stroke bg-transparent px-3 py-3 pr-10 text-sm text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
//                         value={parseFloat(
//                           parseFloat(row.quantities[col.id] || '0').toFixed(2),
//                         )}
//                         placeholder="Qty"
//                         onChange={(e) =>
//                           handleQtyChange(row.id, col.id, e.target.value)
//                         }
//                       />
//                       {row.unit && (
//                         <span className="text-gray-500 dark:text-gray-300 absolute right-2 top-1/2 -translate-y-1/2 text-xs">
//                           {row.unit}
//                         </span>
//                       )}
//                     </div>
//                   </td>
//                 ))}
//               </tr>
//             ))}
//         </tbody>
//       </table>
//     </div>
//   </div>
// );

// export default RawMaterialsTable;
/* eslint-disable */
import React from 'react';
import {FaEdit, FaSave, FaTrash} from 'react-icons/fa';

import {Column, Row} from './types';
import SearchableDropdown from '@/components/Dish/CustomDropdown/SearchableDropdown';

interface Props {
  columns: Column[];
  rows: Row[];
  rawmaterialOptions: any[];
  processOptions: any[];
  editColumnValues: {[k: number]: {people: string; kg: string}};
  setEditColumnValues: React.Dispatch<
    React.SetStateAction<{[k: number]: {people: string; kg: string}}>
  >;
  removeColumn: (id: number) => void;
  toggleEditColumn: (id: number, people: string, kg: string) => void;
  updateColumn: (id: number) => void;
  handleQtyChange: (rowId: number, colId: number, v: string) => void;
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
}

const RawMaterialsTable: React.FC<Props> = ({
  columns,
  rows,
  rawmaterialOptions,
  processOptions,
  editColumnValues,
  setEditColumnValues,
  removeColumn,
  toggleEditColumn,
  updateColumn,
  handleQtyChange,
  setRows,
}) => {
  const [rowToDelete, setRowToDelete] = React.useState<Row | null>(null);
  const [colToDelete, setColToDelete] = React.useState<Column | null>(null);

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
                              toggleEditColumn(col.id, col.people, col.kg)
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
            {rows
              .slice()
              .sort((a, b) => {
                const aName =
                  rawmaterialOptions.find((o) => o.value === a.rawMaterial)
                    ?.label || '';
                const bName =
                  rawmaterialOptions.find((o) => o.value === b.rawMaterial)
                    ?.label || '';
                return aName.localeCompare(bName);
              })
              .map((row) => (
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
                      placeholder="Select Material"
                    />
                  </td>

                  <td className="w-60 p-2">
                    <SearchableDropdown
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
                    <td key={col.id} className="w-40 p-2 text-center">
                      <div className="relative">
                        <input
                          type="number"
                          className="w-full rounded-md border border-stroke bg-transparent px-3 py-3 pr-10 text-sm text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                          value={parseFloat(
                            parseFloat(row.quantities[col.id] || '0').toFixed(
                              2,
                            ),
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

      {/* Modal for Row Delete */}
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

      {/* Modal for Column Delete */}
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
};

export default RawMaterialsTable;
