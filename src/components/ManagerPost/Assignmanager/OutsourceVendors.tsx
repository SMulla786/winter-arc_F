/* eslint-disable */
import React, {useState} from 'react';
import {
  useGetOutSourceVendor,
  useUpdateOutSourceVendor,
} from './staffSummaryapi';

interface OutSourceVendorProps {
  subeventId: string;
}

const OutsourceVendors: React.FC<OutSourceVendorProps> = ({subeventId}) => {
  const {
    data: response,
    isLoading,
    isError,
  } = useGetOutSourceVendor(subeventId);

  console.log('Outsource Vendors Response:', response);
  const {mutateAsync: updateOutSourceVendor} =
    useUpdateOutSourceVendor(subeventId);
  const [counts, setCounts] = useState<Record<string, number>>({});

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading vendors</div>;

  const items = response?.data?.data || response || [];
  if (items.length === 0) return <div>No outsourced vendors found</div>;

  // Sort by Vendor first, then by Category to determine "first" consistently
  const sortedItems = [...items].sort((a: any, b: any) => {
    const venA = a.foodVendor?.name || 'No Vendor';
    const venB = b.foodVendor?.name || 'No Vendor';
    if (venA !== venB) return venA.localeCompare(venB);

    const catA = a.dish?.category?.name || 'Uncategorized';
    const catB = b.dish?.category?.name || 'Uncategorized';
    return catA.localeCompare(catB);
  });

  // Determine the first category for each vendor
  const vendorFirstCategory: Record<string, string> = {};
  sortedItems.forEach((item: any) => {
    const vendorName = item.foodVendor?.name || 'No Vendor';
    const categoryName = item.dish?.category?.name || 'Uncategorized';
    if (!vendorFirstCategory[vendorName]) {
      vendorFirstCategory[vendorName] = categoryName;
    }
  });

  // Build rows
  const rows: any[] = [];
  let currentVendor = '';
  let vendorSpan = 0;

  sortedItems.forEach((item: any) => {
    console.log('Processing item:', item);
    const vendorName = item.foodVendor?.name || 'No Vendor';
    const isRawCalc = item?.rawMaterialCalculation === true;
    const vendorLabel = `${vendorName} (${isRawCalc ? 'V' : 'L'})`;
    const counterName = vendorFirstCategory[vendorName];

    const isNewVendor = vendorName !== currentVendor;

    // Close previous vendor span
    if (isNewVendor && vendorSpan > 0) {
      rows[rows.length - vendorSpan].vendorRowSpan = vendorSpan;
    }

    if (isNewVendor) {
      currentVendor = vendorName;
      vendorSpan = 0;
    }

    vendorSpan++;

    rows.push({
      ...item,
      vendorLabel,
      counterName,
      isFirstInVendor: isNewVendor,
      vendorRowSpan: 0,
    });
  });

  // Final span assignment
  if (vendorSpan > 0) {
    rows[rows.length - vendorSpan].vendorRowSpan = vendorSpan;
  }

  const handleCountChange = (itemId: string, value: string) => {
    const num = parseInt(value, 10) || 0;
    setCounts((prev) => ({...prev, [itemId]: num}));
  };

  return (
    <div className="my-6">
      {/* Header Section */}
      <div className="mb-4 rounded-sm bg-gradient-to-r from-red-50 to-red-100 shadow-sm">
        <div className="px-4 py-1">
          <h1 className="text-gray-800 text-lg font-bold dark:text-red-900">
            Outsource Vendors
          </h1>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden overflow-x-auto">
        <table className="min-w-full">
          <thead className="from-gray-50 to-gray-100 bg-gradient-to-r">
            <tr className="bg-gray-2 dark:bg-graydark">
              <th className="text-gray-700 px-6 py-2 text-center text-sm font-semibold tracking-wider">
                Counter Name
              </th>
              <th className="text-gray-700 px-6 py-2 text-left text-sm font-semibold tracking-wider">
                Dish
              </th>
              <th className="text-gray-700 px-6 py-2 text-center text-sm font-semibold tracking-wider">
                Count
              </th>
              <th className="text-gray-700 px-6 py-2 text-center text-sm font-semibold tracking-wider">
                Vendor Name
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-boxdark">
            {rows.map((row, index) => {
              const currentCount = counts[row.id] ?? row?.count ?? 0;

              // 🔹 check if this is the last row of this vendor
              const isLastOfVendor =
                row.isFirstInVendor && row.vendorRowSpan > 0
                  ? index + row.vendorRowSpan - 1 === index
                  : rows[index + 1]?.foodVendor?.name !== row.foodVendor?.name;

              return (
                <React.Fragment key={row.id}>
                  <tr className="hover:bg-gray-50 transition-colors duration-150">
                    {/* Counter */}
                    {row.isFirstInVendor && (
                      <td
                        className="bg-gray-50 px-6"
                        rowSpan={row.vendorRowSpan}
                      >
                        <div className="flex justify-center">
                          <span className="text-sm font-semibold">
                            {row.counterName} counter
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Dish */}
                    <td className="px-6">
                      <span className="text-sm font-medium">
                        {row.dish?.name || 'Unknown Dish'}
                      </span>
                    </td>

                    {/* Count */}
                    <td className="px-6 text-center">
                      <input
                        type="number"
                        min="0"
                        value={currentCount}
                        onChange={(e) =>
                          handleCountChange(row.id, e.target.value)
                        }
                        className="mt-1 h-8 w-20 rounded-sm border border-stroke px-3 text-center dark:border-strokedark dark:bg-boxdark"
                      />
                    </td>

                    {/* Vendor */}
                    {row.isFirstInVendor && (
                      <td
                        className="px-6 text-center"
                        rowSpan={row.vendorRowSpan}
                      >
                        <span className="text-sm font-semibold">
                          {row.vendorLabel}
                        </span>
                      </td>
                    )}
                  </tr>

                  {/* 🔥 Divider only after one counter finishes */}
                  {isLastOfVendor && (
                    <tr>
                      <td colSpan={4}>
                        <div className="my-2 h-[1.5px] bg-gray-2 dark:bg-strokedark" />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={async () => {
            const payload = Object.entries(counts).map(([id, count]) => ({
              dishId: id,
              count,
            }));

            if (payload.length === 0) return;

            try {
              await updateOutSourceVendor(payload);
              console.log('Outsource vendor counts updated');
            } catch (err) {
              console.error('Failed to update outsource vendor counts', err);
            }
          }}
          disabled={isLoading}
          className="mx-1 rounded bg-primary px-6 py-1.5 text-sm text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default OutsourceVendors;
