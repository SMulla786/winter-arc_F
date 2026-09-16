/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useState, useMemo} from 'react';
import {
  FiEye,
  FiCheck,
  FiCircle,
  FiX,
  FiChevronDown,
  FiSearch,
} from 'react-icons/fi';

interface HistoryListItem {
  id: string;
  listNo: number;
  from: string;
  to: string;
  createdAt: string;
  updatedAt: string;
  RawMaterialListSubEvents: any[];
  _count: {
    sendToVendors: number;
    purchases: number;
    RawMaterialListSubEvents: number;
  };
  vendorRawMaterials?: any[];
}

interface CustomRMHistoryProps {
  historyData: any;
  isHistoryLoading: boolean;
  onViewDetail: (historyId: string) => void;
}

const CustomHistoryList: React.FC<CustomRMHistoryProps> = ({
  historyData,
  isHistoryLoading,
  onViewDetail,
}) => {
  const [selectedListNo, setSelectedListNo] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Process history list and FILTER to show only items with EMPTY RawMaterialListSubEvents
  const baseFilteredHistoryList: HistoryListItem[] = React.useMemo(() => {
    if (!historyData?.data) return [];

    let rawList = [];

    if (Array.isArray(historyData.data)) {
      rawList = historyData.data;
    } else if (historyData.data.data && Array.isArray(historyData.data.data)) {
      rawList = historyData.data.data;
    }

    // Filter to ONLY include items where RawMaterialListSubEvents is EMPTY array
    const filtered = rawList.filter((item) => {
      const hasEmptySubEvents =
        Array.isArray(item.RawMaterialListSubEvents) &&
        item.RawMaterialListSubEvents.length === 0;
      return hasEmptySubEvents;
    });

    return filtered;
  }, [historyData]);

  // Get unique list numbers for dropdown
  const uniqueListNos = useMemo(() => {
    const listNos = baseFilteredHistoryList
      .map((item) => item.listNo)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => a - b);
    return listNos;
  }, [baseFilteredHistoryList]);

  // Filter list numbers based on search term
  const filteredListNos = useMemo(() => {
    if (!searchTerm.trim()) return uniqueListNos;

    return uniqueListNos.filter((listNo) =>
      listNo.toString().includes(searchTerm.trim()),
    );
  }, [uniqueListNos, searchTerm]);

  // Apply list number filter
  const filteredHistoryList: HistoryListItem[] = useMemo(() => {
    if (selectedListNo !== null) {
      return baseFilteredHistoryList.filter(
        (item) => item.listNo === selectedListNo,
      );
    }
    return baseFilteredHistoryList;
  }, [baseFilteredHistoryList, selectedListNo]);

  // Clear filter
  const clearFilter = () => {
    setSelectedListNo(null);
    setSearchTerm('');
  };

  // Handle list number selection
  const handleListNoSelect = (listNo: number) => {
    setSelectedListNo(listNo);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get completed stages for an item
  const getCompletedStages = (item: HistoryListItem): string[] => {
    const stages: string[] = [];

    if (item._count?.sendToVendors > 0) {
      stages.push('Raw Material');
    }

    const hasVendorRawMaterials =
      (Array.isArray(item.vendorRawMaterials) &&
        item.vendorRawMaterials.length > 0) ||
      (item._count?.vendorRawMaterials && item._count.vendorRawMaterials > 0);

    if (hasVendorRawMaterials) {
      stages.push('Tender');
    }

    if (item._count?.purchases > 0) {
      stages.push('Purchase Order');
    }

    return stages;
  };

  // Render stage pills
  const renderStages = (item: HistoryListItem) => {
    const completedStages = getCompletedStages(item);
    const allStages = ['Raw Material', 'Tender', 'Purchase Order'];

    return (
      <div className="flex items-center gap-1">
        {allStages.map((stage, index) => {
          const isCompleted = completedStages.includes(stage);
          const isLast = index === allStages.length - 1;

          return (
            <React.Fragment key={stage}>
              <div
                className={`flex items-center gap-1 ${isCompleted ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
              >
                {isCompleted ? (
                  <FiCheck className="h-4 w-4" />
                ) : (
                  <FiCircle className="h-4 w-4" />
                )}
                <span className="text-xs font-medium">{stage}</span>
              </div>
              {!isLast && (
                <div className="text-gray-300 dark:text-gray-600 mx-1">→</div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // Get stage summary text
  const getStageSummary = (item: HistoryListItem): string => {
    const completedStages = getCompletedStages(item);

    if (completedStages.length === 0) {
      return 'Draft';
    } else if (completedStages.length === 1) {
      return completedStages[0];
    } else if (completedStages.length === 2) {
      return `${completedStages[0]}, ${completedStages[1]}`;
    } else {
      return `${completedStages[0]}, ${completedStages[1]}, ${completedStages[2]}`;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        {/* Simple Dropdown Filter */}
        <div className="mt-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50 flex items-center gap-3 rounded-lg border border-stroke bg-white px-4 py-3 text-left transition-colors dark:border-strokedark dark:bg-meta-4"
              >
                <div className="flex items-center gap-3">
                  <FiChevronDown
                    className={`text-gray-400 dark:text-gray-500 h-5 w-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                  <div>
                    {selectedListNo ? (
                      <span className="text-gray-700 dark:text-gray-300">
                        List #{selectedListNo}
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">
                        Filter by List No
                      </span>
                    )}
                  </div>
                </div>
                {selectedListNo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilter();
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 ml-2"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                )}
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute left-0 z-50 mt-1 w-64 rounded-lg border border-stroke bg-white p-3 shadow-lg dark:border-strokedark dark:bg-meta-4">
                  <div className="space-y-3">
                    {/* Search Input */}
                    <div className="relative">
                      <FiSearch className="text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search list number..."
                        className="text-gray-900 placeholder:text-gray-500 dark:bg-gray-800 dark:placeholder:text-gray-400 w-full rounded-lg border border-stroke bg-white py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-strokedark dark:text-white"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* List No Section */}
                    <div className="max-h-60 overflow-y-auto">
                      {filteredListNos.length === 0 ? (
                        <div className="text-gray-500 dark:text-gray-400 py-3 text-center text-sm">
                          {searchTerm
                            ? 'No matching list numbers found'
                            : 'No list numbers available'}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {filteredListNos.map((listNo) => (
                            <button
                              key={listNo}
                              onClick={() => handleListNoSelect(listNo)}
                              className={`hover:bg-gray-100 dark:hover:bg-gray-700 w-full rounded px-3 py-2 text-left ${
                                selectedListNo === listNo
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">
                                  List #{listNo}
                                </span>
                                {selectedListNo === listNo && (
                                  <FiCheck className="h-4 w-4" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              {filteredHistoryList.length} result
              {filteredHistoryList.length !== 1 ? 's' : ''}
              {selectedListNo && ' (filtered)'}
            </div>
          </div>

          {/* Active Filter Display */}
          {selectedListNo && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                List #{selectedListNo}
                <button
                  onClick={clearFilter}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* Main Content */}
      {isHistoryLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              Loading history...
            </div>
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
          </div>
        </div>
      ) : filteredHistoryList.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-2">
            {selectedListNo
              ? `No results found for List #${selectedListNo}`
              : 'No custom raw materials history found'}
          </div>
          {selectedListNo && (
            <button
              onClick={clearFilter}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 mt-2 rounded-lg px-4 py-2 text-sm font-medium"
            >
              Clear filter
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-meta-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
              <thead className="h-16 rounded-t-md bg-blue-900 text-white dark:bg-blue-950">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    List No
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Stages
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke bg-white dark:divide-strokedark dark:bg-meta-4">
                {filteredHistoryList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3">
                      <div className="text-gray-800 text-sm font-medium dark:text-white">
                        #{item.listNo}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-gray-600 dark:text-gray-400">
                        {formatDate(item.createdAt)}
                      </div>
                      <div className="text-gray-400 dark:text-gray-500 text-xs">
                        {formatTime(item.createdAt)}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-gray-600 dark:text-gray-400">
                        {item._count?.sendToVendors || 0} items
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="mb-1">{renderStages(item)}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        {getStageSummary(item)}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => onViewDetail(item.id)}
                        className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
                        title="View Details"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomHistoryList;
