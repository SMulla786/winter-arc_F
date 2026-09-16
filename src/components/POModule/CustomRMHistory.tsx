/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {FiArrowLeft, FiPlus, FiEye, FiCheck, FiCircle} from 'react-icons/fi';

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
  // Add vendor raw materials count if available
  vendorRawMaterials?: any[];
}

interface CustomRMHistoryProps {
  historyData: any;
  isHistoryLoading: boolean;
  onBack: () => void;
  onViewDetail: (historyId: string) => void;
  onCreateNew: () => void;
}

const CustomRMHistory: React.FC<CustomRMHistoryProps> = ({
  historyData,
  isHistoryLoading,
  onBack,
  onViewDetail,
  onCreateNew,
}) => {
  // Process history list and FILTER to show only items with EMPTY RawMaterialListSubEvents
  const filteredHistoryList: HistoryListItem[] = React.useMemo(() => {
    if (!historyData?.data) return [];

    let rawList = [];

    if (Array.isArray(historyData.data)) {
      rawList = historyData.data;
    } else if (historyData.data.data && Array.isArray(historyData.data.data)) {
      rawList = historyData.data.data;
    }

    console.log('Total items in raw data:', rawList.length);

    // Filter to ONLY include items where RawMaterialListSubEvents is EMPTY array
    const filtered = rawList.filter((item) => {
      // Check if RawMaterialListSubEvents exists and is an empty array
      const hasEmptySubEvents =
        Array.isArray(item.RawMaterialListSubEvents) &&
        item.RawMaterialListSubEvents.length === 0;

      console.log(
        `Item ${item.listNo}: RawMaterialListSubEvents =`,
        item.RawMaterialListSubEvents,
      );
      console.log(
        `Item ${item.listNo}: hasEmptySubEvents = ${hasEmptySubEvents}`,
      );

      return hasEmptySubEvents;
    });

    console.log('Filtered items (with empty sub-events):', filtered.length);
    console.log('Filtered list:', filtered);

    return filtered;
  }, [historyData]);

  // Format date
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

    // Stage 1: Raw Material (if sendToVendors count > 0)
    if (item._count?.sendToVendors > 0) {
      stages.push('Raw Material');
    }

    // Stage 2: Tender (if vendorRawMaterials exists and has items)
    // Check both vendorRawMaterials array and _count if available
    const hasVendorRawMaterials =
      (Array.isArray(item.vendorRawMaterials) &&
        item.vendorRawMaterials.length > 0) ||
      (item._count?.vendorRawMaterials && item._count.vendorRawMaterials > 0);

    if (hasVendorRawMaterials) {
      stages.push('Tender');
    }

    // Stage 3: Purchase Order (if purchases count > 0)
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
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-gray-900 text-xl font-semibold dark:text-white">
            Custom Raw Materials History
          </h2>
        </div>
        {/* <button
          onClick={onCreateNew}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <FiPlus className="h-4 w-4" />
          Create New
        </button> */}
      </div>

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
            No custom raw materials history found
          </div>
          <div className="text-gray-400 dark:text-gray-500 mb-4 text-sm">
            (Only showing lists without sub-events)
          </div>
          <button
            onClick={onCreateNew}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Create New List
          </button>
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

export default CustomRMHistory;
