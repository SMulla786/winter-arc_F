import React from 'react';

import {LineItem} from '@/components/Event/subEvent/eventHelper';
import ExternalHistoryCategoryHeader from './ExternalHistoryCategoryHeader';
import ExternalHistoryLineItemRow from './ExternalHistoryLineItemRow';
import ExternalHistoryBreakdownRow from './ExternalHistoryBreakdownRow';

interface EventPoTableProps {
  groupedItems: {[category: string]: LineItem[]};
  expandedCategories: {[key: string]: boolean};
  expandedBreakdowns: {[key: string]: boolean};
  categoryConfigs: {
    [category: string]: {
      date: string;
      time: string;
      location: string;
      vendorId?: string;
    };
  };
  currentPoStatus: 'PARTIAL' | 'COMPLETED' | null;
  isViewMode: boolean;
  hasPartialData: boolean;
  getVendorOptions: (
    category: string,
    categoryId?: string,
  ) => Array<{id: string; label: string}>;
  getVendorNameById: (vendorId?: string) => string;
  getBreakdownItems: (parentId: string) => LineItem[];
  updateLineItem: (lineId: string, updates: Partial<LineItem>) => void;
  updateCategoryConfig: (
    category: string,
    field: string,
    value: string,
  ) => void;
  applyCategoryConfig: (category: string) => void;
  addBreakdownRow: (parentItem: LineItem) => void;
  removeBreakdownRow: (breakdownId: string) => void;
  toggleCategory: (category: string) => void;
  toggleBreakdown: (parentId: string) => void;
}

const ExternalPoHistoryTable: React.FC<EventPoTableProps> = ({
  groupedItems,
  expandedCategories,
  expandedBreakdowns,
  categoryConfigs,
  currentPoStatus,
  isViewMode,
  hasPartialData,
  getVendorOptions,
  getVendorNameById,
  getBreakdownItems,
  updateLineItem,
  updateCategoryConfig,
  applyCategoryConfig,
  addBreakdownRow,
  removeBreakdownRow,
  toggleCategory,
  toggleBreakdown,
}) => {
  const isCompletedView = isViewMode && currentPoStatus === 'COMPLETED';

  return (
    <div className="mt-6">
      <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-meta-4">
        <div className="dark:bg-gray-800 bg-blue-50 px-4 py-3 dark:bg-meta-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-800 text-lg font-semibold dark:text-white">
              {isViewMode && currentPoStatus === 'COMPLETED'
                ? 'View Purchase Order'
                : currentPoStatus === 'PARTIAL'
                  ? 'Edit Draft Purchase Order'
                  : 'Create New Purchase Order'}{' '}
              (
              {Object.keys(groupedItems).reduce(
                (total, category) => total + groupedItems[category].length,
                0,
              )}
              items)
            </h3>
          </div>
          {hasPartialData && currentPoStatus === 'PARTIAL' && !isViewMode && (
            <div className="mt-2 rounded bg-yellow-50 p-2">
              <p className="text-sm text-yellow-700">
                <strong>Saved Draft Loaded:</strong> You have a saved draft. All
                fields are editable. When ready, click "Generate PO" to
                finalize.
              </p>
            </div>
          )}
          {isViewMode && currentPoStatus === 'COMPLETED' && (
            <div className="mt-2 rounded bg-green-50 p-2">
              <p className="text-sm text-green-700">
                <strong>Purchase Order Generated:</strong> This PO has been
                finalized and is in view-only mode.
              </p>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
            <thead className="h-16 rounded-t-md bg-blue-900 text-white dark:bg-blue-950">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold"
                >
                  R.M.
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold"
                >
                  Qty
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold"
                >
                  Particular
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold"
                >
                  Package Type
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold"
                >
                  Time
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold"
                >
                  Location
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold"
                >
                  Vendor
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-semibold"
                >
                  Total Amt
                </th>
                {!isCompletedView && (
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke bg-white dark:divide-strokedark dark:bg-boxdark">
              {Object.keys(groupedItems).map((category, categoryIndex) => (
                <React.Fragment key={category}>
                  <ExternalHistoryCategoryHeader
                    category={category}
                    itemCount={groupedItems[category].length}
                    isExpanded={expandedCategories[category]}
                    config={categoryConfigs[category]}
                    isCompletedView={isCompletedView}
                    getVendorOptions={getVendorOptions}
                    updateCategoryConfig={updateCategoryConfig}
                    applyCategoryConfig={applyCategoryConfig}
                    toggleCategory={toggleCategory}
                  />
                  {/* Inside EventPoTable.tsx, replace the mapping of main items with this: */}
                  {expandedCategories[category] &&
                    groupedItems[category]
                      .filter((item) => !item.isBreakdown)
                      // Sort items by name (already done in groupedItems) + stable order
                      .sort((a, b) => a.name.localeCompare(b.name)) // redundant but safe
                      .map((item, itemIndex, array) => {
                        const vendorOptions = getVendorOptions(
                          item.category,
                          item.categoryId,
                        );
                        const breakdownItems = getBreakdownItems(item.id);
                        const isBreakdownExpanded = expandedBreakdowns[item.id];
                        const hasBreakdowns = breakdownItems.length > 0;

                        // Determine if this is the first occurrence of this raw material in the category
                        const isFirstOfMaterial =
                          currentPoStatus === 'PARTIAL' ||
                          currentPoStatus === 'COMPLETED'
                            ? itemIndex === 0 ||
                              array[itemIndex - 1]?.rawmaterialId !==
                                item.rawmaterialId
                            : true; // Always show name/total in new PO mode

                        const mainRowBg =
                          itemIndex % 2 === 0
                            ? 'bg-white dark:bg-boxdark'
                            : 'bg-gray-2 dark:bg-meta-4';

                        return (
                          <React.Fragment key={item.id}>
                            <ExternalHistoryLineItemRow
                              item={item}
                              itemIndex={itemIndex}
                              isCompletedView={isCompletedView}
                              vendorOptions={vendorOptions}
                              getVendorNameById={getVendorNameById}
                              hasBreakdowns={hasBreakdowns}
                              isBreakdownExpanded={isBreakdownExpanded}
                              mainRowBg={mainRowBg}
                              updateLineItem={updateLineItem}
                              addBreakdownRow={addBreakdownRow}
                              toggleBreakdown={toggleBreakdown}
                              currentPoStatus={currentPoStatus}
                              isFirstOfMaterial={isFirstOfMaterial} // ← NEW PROP
                            />
                            {isBreakdownExpanded &&
                              breakdownItems.map(
                                (breakdown, breakdownIndex) => (
                                  <ExternalHistoryBreakdownRow
                                    key={breakdown.id}
                                    breakdown={breakdown}
                                    breakdownIndex={breakdownIndex}
                                    isCompletedView={isCompletedView}
                                    vendorOptions={vendorOptions}
                                    getVendorNameById={getVendorNameById}
                                    updateLineItem={updateLineItem}
                                    removeBreakdownRow={removeBreakdownRow}
                                    // For breakdowns: never show material name/total
                                    isFirstOfMaterial={false}
                                  />
                                ),
                              )}
                          </React.Fragment>
                        );
                      })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExternalPoHistoryTable;
