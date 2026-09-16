// components/raw-material/ListSelectionDropdown.tsx
import React from 'react';
import {FiChevronDown} from 'react-icons/fi';

interface HistoryItem {
  id: string;
  listNo: number;
  from: string;
  to: string;
}

interface ListSelectionDropdownProps {
  data: HistoryItem[];
  onSelect: (id: string) => void;
  formatDate: (dateString: string, format: string) => string;
}

export const ListSelectionDropdown: React.FC<ListSelectionDropdownProps> = ({
  data,
  onSelect,
  formatDate,
}) => {
  if (data.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-sm">
        No lists available
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm font-medium">
        Select Raw Material List
      </label>
      <select
        className="border-gray-300 dark:border-gray-600 dark:bg-gray-800 w-full rounded-md border px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        onChange={(e) => onSelect(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>
          Select a raw material list...
        </option>
        {data.map((item) => (
          <option key={item.id} value={item.id}>
            List #{item.listNo} ({formatDate(item.from, 'dd/MM/yyyy')} -{' '}
            {formatDate(item.to, 'dd/MM/yyyy')})
          </option>
        ))}
      </select>
      <div className="text-gray-500 pointer-events-none absolute inset-y-0 right-3 top-8 flex items-center px-2">
        <FiChevronDown className="h-5 w-5" />
      </div>
    </div>
  );
};
