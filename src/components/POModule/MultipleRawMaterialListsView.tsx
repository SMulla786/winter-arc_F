// components/views/MultipleRawMaterialListsView.tsx
import React, {useState, useMemo} from 'react';
import {FiEye, FiChevronDown, FiSearch} from 'react-icons/fi';
import GenericTable from '../Forms/Table/GenericTable';

interface HistoryItem {
  id: string;
  listNo: number;
  from: string;
  to: string;
  caterorId: string;
  createdAt: string;
  updatedAt: string;
  type: 'dish' | 'raw-material';
  title?: string;
  description?: string;
  status?: 'active' | 'completed' | 'draft';
}

interface MultipleRawMaterialListsViewProps {
  data: HistoryItem[];
  isLoading: boolean;
  isError: boolean;
  onViewHistory: (item: HistoryItem) => void;
  formatDate: (dateString: string, format: string) => string;
}

export const MultipleRawMaterialListsView: React.FC<
  MultipleRawMaterialListsViewProps
> = ({data, isLoading, isError, onViewHistory, formatDate}) => {
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dropdownSearch, setDropdownSearch] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Handle dropdown selection
  const handleDropdownSelect = (listId: string) => {
    setSelectedListId(listId);
    const selectedItem = data.find((item) => item.id === listId);
    if (selectedItem) {
      onViewHistory(selectedItem);
    }
    setIsDropdownOpen(false);
    setDropdownSearch('');
  };

  // Filter data based on search and status
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.listNo.toString().includes(searchQuery) ||
        (item.title &&
          item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description &&
          item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  // Filter for dropdown search
  const filteredDropdownData = useMemo(() => {
    return data.filter((item) => {
      const searchLower = dropdownSearch.toLowerCase();
      const listNoStr = item.listNo.toString();
      const fromDate = formatDate(item.from, 'dd/MM/yyyy');
      const toDate = formatDate(item.to, 'dd/MM/yyyy');

      return (
        listNoStr.includes(dropdownSearch) ||
        fromDate.toLowerCase().includes(searchLower) ||
        toDate.toLowerCase().includes(searchLower) ||
        (item.title && item.title.toLowerCase().includes(searchLower))
      );
    });
  }, [data, dropdownSearch, formatDate]);

  // Define columns for GenericTable
  const columns: Column<HistoryItem>[] = [
    {
      header: 'List No',
      accessor: 'listNo',
      render: (item) => (
        <div className="text-gray-900 font-bold dark:text-white">
          #{item.listNo}
        </div>
      ),
      className: 'min-w-[100px]',
    },
    {
      header: 'Date Range',
      accessor: 'from',
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-gray-900 font-medium dark:text-white">
            {formatDate(item.from, 'dd/MM/yyyy')}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            to {formatDate(item.to, 'dd/MM/yyyy')}
          </span>
        </div>
      ),
      className: 'min-w-[150px]',
    },
    {
      header: 'Created Date',
      accessor: 'createdAt',
      render: (item) => (
        <div>
          <div className="text-gray-900 dark:text-white">
            {formatDate(item.createdAt, 'dd/MM/yyyy')}
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            {formatDate(item.createdAt, 'hh:mm a')}
          </div>
        </div>
      ),
      className: 'min-w-[120px]',
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (item) => (
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onViewHistory(item)}
            className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
            title="View Details"
          >
            <FiEye className="h-4 w-4" />
          </button>
        </div>
      ),
      action: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading lists...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-red-600 dark:text-red-400">
          Error loading lists. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Stats and Dropdown */}
      <div className="bg-white p-3 dark:bg-black">
        <div className="mb-6">
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Searchable Dropdown */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm font-medium">
                Quick Select List
              </label>
              <div className="relative">
                <div className="relative">
                  <FiSearch className="text-gray-400 absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform" />
                  <input
                    type="text"
                    placeholder="Search lists by #, date range..."
                    className="border-gray-300 dark:border-gray-600 w-full rounded-md border py-2 pl-10 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-meta-4 dark:text-white"
                    value={dropdownSearch}
                    onChange={(e) => {
                      setDropdownSearch(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                  />
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="text-gray-400 dark:text-gray-300 absolute right-3 top-1/2 -translate-y-1/2 transform"
                  >
                    <FiChevronDown className="h-5 w-5" />
                  </button>
                </div>
                {isDropdownOpen && (
                  <div className="border-gray-300 dark:border-gray-600 absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg dark:bg-meta-4">
                    <div className="max-h-60 overflow-y-auto py-1">
                      {filteredDropdownData.length === 0 ? (
                        <div className="text-gray-500 dark:text-gray-400 px-3 py-2 text-sm">
                          No lists found
                        </div>
                      ) : (
                        filteredDropdownData.map((item) => (
                          <button
                            key={item.id}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 w-full px-3 py-2 text-left text-sm dark:text-white"
                            onClick={() => handleDropdownSelect(item.id)}
                          >
                            <div className="font-medium">
                              List #{item.listNo}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 mt-1 text-xs">
                              {formatDate(item.from, 'dd/MM/yyyy')} -{' '}
                              {formatDate(item.to, 'dd/MM/yyyy')}
                            </div>
                            {item.title && (
                              <div className="text-gray-500 dark:text-gray-400 truncate text-xs">
                                {item.title}
                              </div>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search Input */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm font-medium">
                Search Lists
              </label>
              <div className="relative">
                <FiSearch className="text-gray-400 absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform" />
                <input
                  type="text"
                  placeholder="Search by list No"
                  className="border-gray-300 dark:border-gray-600 w-full rounded-md border py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-meta-4 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generic Table Component */}
      <GenericTable<HistoryItem>
        data={filteredData}
        columns={columns}
        title="All Raw Material Lists"
        searchAble={false}
        action={false}
        paginationOff={true}
        onView={onViewHistory}
      />

      {/* Table Info Footer */}
      {filteredData.length > 0 && (
        <div className="dark:bg-gray-800 rounded-lg bg-white p-4 shadow">
          <div className="flex items-center justify-between">
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              Showing {filteredData.length} of {data.length} lists
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              Last updated:{' '}
              {data.length > 0
                ? formatDate(data[0].updatedAt, 'dd/MM/yyyy hh:mm a')
                : 'Never'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
