/* eslint-disable */
import React from 'react';
import {FiEdit, FiEye} from 'react-icons/fi';
import {MdDelete} from 'react-icons/md';
import {GrFormNext, GrFormPrevious} from 'react-icons/gr';

type Button<T> = {
  label: string;
  onClick: (item: T) => void;
  className?: string;
  icon?: React.ReactNode;
};

export type Column<T> = {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  render?: (item: T) => React.ReactNode;
  className?: string;
  buttons?: Button<T>[];
  sortable?: boolean;
  onCellClick?: (item: T) => void;
  groupable?: boolean; // Column can be grouped
};

type GroupedGenericTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  groupBy: (keyof T)[]; // support multiple columns
  itemsPerPage?: number;
  searchAble?: boolean;
  title?: string;
  action?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  paginationOff?: boolean;
};

const GroupedGenericTable = <T extends Record<string, any>>({
  data,
  columns,
  groupBy,
  itemsPerPage = 5,
  searchAble,
  title,
  action,
  onEdit,
  onDelete,
  onView,
  paginationOff = false,
}: GroupedGenericTableProps<T>) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);

  // FIXED: Ensure data is always an array
  const safeData = React.useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  // Search handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Sorting
  const sortedData = React.useMemo(() => {
    const sortableData = [...safeData];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        const aValue =
          typeof sortConfig.key === 'function'
            ? (sortConfig.key as any)(a)
            : a[sortConfig.key];
        const bValue =
          typeof sortConfig.key === 'function'
            ? (sortConfig.key as any)(b)
            : b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [safeData, sortConfig]);

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'asc'
    ) {
      direction = 'desc';
    }
    setSortConfig({key, direction});
  };

  // Filtered data
  const filteredData = React.useMemo(() => {
    return sortedData.filter((item) =>
      columns.some((col) => {
        const value =
          typeof col.accessor === 'function'
            ? col.accessor(item)
            : item[col.accessor];
        return value
          ?.toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }),
    );
  }, [sortedData, columns, searchQuery]);

  // Recursive grouping function - FIXED: Handle undefined data
  const groupDataRecursive = (
    data: T[],
    keys: (keyof T)[],
    level = 0,
  ): any[] => {
    if (level >= keys.length || !Array.isArray(data) || data.length === 0) {
      return data || [];
    }

    const grouped: Record<string, T[]> = {};
    const key = keys[level];

    data.forEach((item) => {
      if (item && key in item) {
        const groupValue = String(item[key] ?? 'N/A');
        if (!grouped[groupValue]) grouped[groupValue] = [];
        grouped[groupValue].push(item);
      }
    });

    return Object.entries(grouped).map(([groupName, items]) => ({
      groupName,
      items: groupDataRecursive(items, keys, level + 1),
    }));
  };

  const renderRows = (grouped: any[], level = 0): React.ReactNode => {
    if (!Array.isArray(grouped) || grouped.length === 0) {
      return (
        <tr>
          <td
            colSpan={columns.length + (action ? 1 : 0)}
            className="text-gray-500 px-3 py-2 text-center"
          >
            No data available
          </td>
        </tr>
      );
    }

    return grouped.flatMap((group, groupIndex) => {
      // FIXED: Check if group and group.items exist and are arrays
      if (!group || !Array.isArray(group.items) || group.items.length === 0) {
        return null;
      }

      // Check if items are raw rows (object with accessor keys) or further groups
      const isLeaf =
        typeof group.items[0] !== 'object' ||
        !groupBy.some((k) => group.items[0] && k in group.items[0]);

      if (isLeaf) {
        return group.items.map((item: T, rowIndex: number) => (
          <tr
            key={`${level}-${rowIndex}`}
            className="even:bg-gray-50 dark:even:bg-gray-800 text-sm"
          >
            {columns.map((col, colIndex) => {
              if (!item) return null;

              const value =
                typeof col.accessor === 'function'
                  ? col.accessor(item)
                  : item[col.accessor];
              const isGroupColumn =
                typeof col.accessor === 'string' &&
                groupBy[level] === col.accessor;

              if (isGroupColumn && rowIndex === 0) {
                return (
                  <td
                    key={colIndex}
                    rowSpan={group.items.length}
                    className="border-b border-[#eee] px-3 py-2 text-center align-middle font-semibold dark:border-strokedark"
                  >
                    {col.render ? col.render(item) : value}
                  </td>
                );
              } else if (isGroupColumn) {
                return null;
              }

              return (
                <td
                  key={colIndex}
                  className="border-b border-[#eee] px-3 py-2 dark:border-strokedark"
                >
                  {col.render ? col.render(item) : value}
                </td>
              );
            })}

            {action && (
              <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">
                <div className="flex items-center justify-center space-x-2 py-1.5">
                  {onView && (
                    <button
                      onClick={() => onView(item)}
                      className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
                    >
                      <FiEye className="h-4 w-4" />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item)}
                      className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
                    >
                      <FiEdit className="h-4 w-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item)}
                      className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
                    >
                      <MdDelete className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            )}
          </tr>
        ));
      } else {
        // Recursive call for nested groups
        return renderRows(group.items, level + 1);
      }
    });
  };

  const groupedData = React.useMemo(() => {
    return groupDataRecursive(filteredData, groupBy);
  }, [filteredData, groupBy]);

  // Pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="rounded-sm border border-stroke bg-white px-4 pb-2 pt-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-6">
      {title && <h2 className="mb-3 text-lg font-semibold">{title}</h2>}

      {searchAble && (
        <div className="mb-3 flex justify-between">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>
      )}

      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-left dark:bg-meta-4">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`min-w-[120px] px-3 py-2.5 font-medium text-black dark:text-white ${col.className || ''}`}
                  onClick={
                    col.sortable
                      ? () => handleSort(col.accessor as keyof T)
                      : undefined
                  }
                  style={{cursor: col.sortable ? 'pointer' : 'default'}}
                >
                  <div className="text-sm">
                    {col.header}{' '}
                    {sortConfig?.key === col.accessor
                      ? sortConfig.direction === 'asc'
                        ? '↑'
                        : '↓'
                      : null}
                  </div>
                </th>
              ))}
              {action && (
                <th className="min-w-[100px] px-3 py-2.5 text-center text-sm">
                  Action
                </th>
              )}
            </tr>
          </thead>

          <tbody>{renderRows(groupedData)}</tbody>
        </table>
      </div>

      {!paginationOff && totalItems > 0 && (
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <div className="space-x-2">
            <button
              className="hover:bg-gray-100 rounded p-1.5 disabled:opacity-50 dark:hover:bg-meta-4"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <GrFormPrevious className="h-4 w-4" />
            </button>
            <button
              className="hover:bg-gray-100 rounded p-1.5 disabled:opacity-50 dark:hover:bg-meta-4"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <GrFormNext className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupedGenericTable;
