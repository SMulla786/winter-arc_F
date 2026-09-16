// components/raw-material/HistoryTable.tsx
import React from 'react';
import {FiEye} from 'react-icons/fi';

interface HistoryItem {
  id: string;
  listNo: number;
  from: string;
  to: string;
  caterorId: string;
  createdAt: string;
  updatedAt: string;
  type: 'dish' | 'raw-material';
}

interface HistoryTableProps {
  data: HistoryItem[];
  onViewHistory: (item: HistoryItem) => void;
  formatDate: (dateString: string, format: string) => string;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  data,
  onViewHistory,
  formatDate,
}) => {
  // If no data, show empty state
  if (data.length === 0) {
    return (
      <div className="border-gray-200 dark:border-gray-700 rounded-lg border p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          No raw material lists available.
        </p>
      </div>
    );
  }

  return (
    <div className="border-gray-200 dark:border-gray-700 rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-gray-900 px-4 py-3 text-left text-sm font-medium dark:text-white">
                List #
              </th>
              <th className="text-gray-900 px-4 py-3 text-left text-sm font-medium dark:text-white">
                Date Range
              </th>
              <th className="text-gray-900 px-4 py-3 text-left text-sm font-medium dark:text-white">
                Created
              </th>
              <th className="text-gray-900 px-4 py-3 text-left text-sm font-medium dark:text-white">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-gray-200 dark:divide-gray-700 divide-y">
            {data.map((history) => (
              <tr
                key={history.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-black dark:text-white">
                    #{history.listNo}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-gray-600 dark:text-gray-300">
                    {formatDate(history.from, 'dd/MM/yyyy')} -{' '}
                    {formatDate(history.to, 'dd/MM/yyyy')}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-gray-600 dark:text-gray-300">
                    {formatDate(history.createdAt, 'dd/MM/yyyy')}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onViewHistory(history)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="View Details"
                  >
                    <FiEye className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show total count */}
      <div className="border-gray-200 dark:border-gray-700 border-t px-4 py-3">
        <div className="text-gray-700 dark:text-gray-300 text-sm">
          Showing <span className="font-semibold">{data.length}</span> list
          {data.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};
