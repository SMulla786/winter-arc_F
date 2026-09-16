import {
  formatDateForInput,
  formatQuantityDisplay,
  formatTimeForInput,
  LineItem,
} from '@/components/Event/subEvent/eventHelper';

import {
  FiAlertCircle,
  FiChevronDown,
  FiChevronRight,
  FiPlus,
} from 'react-icons/fi';

interface LineItemRowProps {
  item: LineItem;
  itemIndex: number;
  isCompletedView: boolean;
  vendorOptions: Array<{id: string; label: string}>;
  getVendorNameById: (vendorId?: string) => string;
  hasBreakdowns: boolean;
  isBreakdownExpanded: boolean;
  mainRowBg: string;
  updateLineItem: (lineId: string, updates: Partial<LineItem>) => void;
  addBreakdownRow: (parentItem: LineItem) => void;
  toggleBreakdown: (parentId: string) => void;
  currentPoStatus: 'PARTIAL' | 'COMPLETED' | null;
  isFirstOfMaterial: boolean;
}

const ExternalLineItemRow: React.FC<LineItemRowProps> = ({
  item,
  itemIndex,
  isCompletedView,
  vendorOptions,
  getVendorNameById,
  hasBreakdowns,
  isBreakdownExpanded,
  mainRowBg,
  updateLineItem,
  addBreakdownRow,
  toggleBreakdown,
  currentPoStatus,
  isFirstOfMaterial,
}) => {
  // Check if this specific row exceeds available
  const isRowOverAllocated =
    (item.quantity || 0) > (item.breakdownQuantity || 0);
  // Check if total (including breakdowns) exceeds available
  const isTotalOverAllocated = item.isOverAllocated || false;

  return (
    <tr
      className={`hover:bg-gray-100 dark:hover:bg-gray-700 ${mainRowBg} ${
        (item.error || item.requiredErrors) && !isCompletedView
          ? 'border-l-4 border-red-500'
          : ''
      } ${isTotalOverAllocated && !isCompletedView ? 'bg-red-50 dark:bg-red-900/20' : ''}`}
    >
      {/* Raw Material Name */}
      <td className="px-4 py-3">
        {isFirstOfMaterial ? (
          <div className="text-gray-800 text-sm font-medium dark:text-white">
            {item.name}
          </div>
        ) : (
          <div className="text-gray-400 text-sm italic">↳</div>
        )}
      </td>

      {/* Total Qty - Available Stock */}
      <td className="px-4 py-3">
        {isFirstOfMaterial ? (
          <div>
            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
              {formatQuantityDisplay(item.breakdownQuantity || 0)} {item.unit}
            </span>
          </div>
        ) : (
          <span className="select-none text-transparent">—</span>
        )}
      </td>

      {/* Ordered Qty */}
      <td className="px-4 py-3">
        {isCompletedView ? (
          <span className="text-sm font-medium">
            {formatQuantityDisplay(item.quantity)}
          </span>
        ) : (
          <div>
            <input
              type="number"
              step="any"
              value={formatQuantityDisplay(item.quantity)}
              onChange={(e) => {
                if (!isCompletedView) {
                  const newQuantity =
                    e.target.value === '' ? 0 : Number(e.target.value);
                  updateLineItem(item.id, {
                    quantity: newQuantity,
                  });
                }
              }}
              disabled={isCompletedView}
              className={`w-20 rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-black ${
                (item.error || item.requiredErrors) && !isCompletedView
                  ? 'border-red-300 bg-red-50'
                  : ''
              } ${isTotalOverAllocated && !isCompletedView ? 'border-red-500 bg-red-50' : ''} ${isCompletedView ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="0.0"
            />

            {/* Show total over-allocation error message */}
            {item.error && !isCompletedView && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <FiAlertCircle className="h-3 w-3" />
                {item.error}
              </div>
            )}

            {/* Show individual row warning */}
            {isRowOverAllocated && !item.error && !isCompletedView && (
              <div className="mt-1 flex items-center gap-1 text-xs text-orange-500">
                <FiAlertCircle className="h-3 w-3" />
                Exceeds available by{' '}
                {formatQuantityDisplay(
                  (item.quantity || 0) - (item.breakdownQuantity || 0),
                )}{' '}
                {item.unit}
              </div>
            )}
          </div>
        )}
      </td>

      {/* Particular Field */}
      <td className="px-3 py-3">
        {isCompletedView ? (
          <span className="text-sm">{item.particular || '-'}</span>
        ) : (
          <input
            type="text"
            value={item.particular || ''}
            onChange={(e) =>
              updateLineItem(item.id, {
                particular: e.target.value,
              })
            }
            disabled={isCompletedView}
            className={`w-full rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-black ${
              item.requiredErrors &&
              !isCompletedView &&
              item.requiredErrors.some((err) => err.includes('Particular'))
                ? 'border-red-300 bg-red-50'
                : ''
            } ${isCompletedView ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="Enter particular"
          />
        )}
      </td>

      {/* Package Type Field */}
      <td className="px-3 py-3">
        {isCompletedView ? (
          <span className="text-sm">{item.packageType || '-'}</span>
        ) : (
          <select
            value={item.packageType || ''}
            onChange={(e) =>
              updateLineItem(item.id, {
                packageType: e.target.value,
              })
            }
            disabled={isCompletedView}
            className={`w-full rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-black ${
              item.requiredErrors &&
              !isCompletedView &&
              item.requiredErrors.some((err) => err.includes('Package Type'))
                ? 'border-red-300 bg-red-50'
                : ''
            } ${isCompletedView ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">Select package type</option>
            <option value="LOOSE">Loose</option>
            <option value="PACKET">Packet</option>
            <option value="BOX">Box</option>
            <option value="CARTON">Carton</option>
          </select>
        )}
      </td>

      {/* Date Field */}
      <td className="px-3 py-3">
        {isCompletedView ? (
          <span className="text-sm">
            {item.date ? formatDateForInput(item.date) : '-'}
          </span>
        ) : (
          <>
            <input
              type="date"
              value={item.date || ''}
              onChange={(e) =>
                updateLineItem(item.id, {
                  date: e.target.value,
                })
              }
              disabled={isCompletedView}
              className={`w-30 rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-black ${
                item.requiredErrors &&
                !isCompletedView &&
                item.requiredErrors.some((err) => err.includes('Date'))
                  ? 'border-red-300 bg-red-50'
                  : ''
              } ${isCompletedView ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {item.requiredErrors &&
              !isCompletedView &&
              item.requiredErrors.some((err) => err.includes('Date')) && (
                <div className="mt-1 text-xs text-red-500">
                  Date is required
                </div>
              )}
          </>
        )}
      </td>

      {/* Time Field */}
      <td className="px-3 py-3">
        {isCompletedView ? (
          <span className="text-sm">
            {item.time ? formatTimeForInput(item.time) : '-'}
          </span>
        ) : (
          <>
            <input
              type="time"
              value={item.time || ''}
              onChange={(e) =>
                updateLineItem(item.id, {
                  time: e.target.value,
                })
              }
              disabled={isCompletedView}
              className={`w-20 rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-black ${
                item.requiredErrors &&
                !isCompletedView &&
                item.requiredErrors.some((err) => err.includes('Time'))
                  ? 'border-red-300 bg-red-50'
                  : ''
              } ${isCompletedView ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {item.requiredErrors &&
              !isCompletedView &&
              item.requiredErrors.some((err) => err.includes('Time')) && (
                <div className="mt-1 text-xs text-red-500">
                  Time is required
                </div>
              )}
          </>
        )}
      </td>

      {/* Location Field */}
      <td className="px-3 py-3">
        {isCompletedView ? (
          <span className="text-sm">{item.location || '-'}</span>
        ) : (
          <>
            <select
              value={item.location || ''}
              onChange={(e) =>
                updateLineItem(item.id, {
                  location: e.target.value,
                })
              }
              disabled={isCompletedView}
              className={`w-full rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-black ${
                item.requiredErrors &&
                !isCompletedView &&
                item.requiredErrors.some((err) => err.includes('Location'))
                  ? 'border-red-300 bg-red-50'
                  : ''
              } ${isCompletedView ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">Select location</option>
              <option value="event location">Event Location</option>
              <option value="central kitchen">Central Kitchen</option>
            </select>
            {item.requiredErrors &&
              !isCompletedView &&
              item.requiredErrors.some((err) => err.includes('Location')) && (
                <div className="mt-1 text-xs text-red-500">
                  Location is required
                </div>
              )}
          </>
        )}
      </td>

      {/* Vendor Field */}
      <td className="px-3 py-3">
        {isCompletedView ? (
          <span className="text-sm">
            {item.vendorName || getVendorNameById(item.vendorId) || '-'}
          </span>
        ) : (
          <>
            <select
              value={item.vendorId || ''}
              onChange={(e) => {
                const value = e.target.value;
                updateLineItem(item.id, {
                  vendorId: value || undefined,
                  vendorName: value ? getVendorNameById(value) : undefined,
                });
              }}
              disabled={isCompletedView}
              className={`w-full rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-black ${
                item.requiredErrors &&
                !isCompletedView &&
                item.requiredErrors.some((err) => err.includes('Vendor'))
                  ? 'border-red-300 bg-red-50'
                  : ''
              } ${isCompletedView ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">Select vendor</option>
              {vendorOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
              {vendorOptions.length === 0 && (
                <option value="" disabled>
                  No vendors available
                </option>
              )}
            </select>

            {item.requiredErrors &&
              !isCompletedView &&
              item.requiredErrors.some((err) => err.includes('Vendor')) && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <FiAlertCircle className="h-3 w-3" />
                  Vendor is required
                </div>
              )}
          </>
        )}
      </td>

      {/* Price Field */}
      <td className="px-3 py-3">
        {isCompletedView ? (
          <span className="text-sm">₹{(item.price || 0).toFixed(2)}</span>
        ) : (
          <input
            type="number"
            step="0.01"
            value={item.price || ''}
            onChange={(e) => {
              const newPrice =
                e.target.value === '' ? undefined : Number(e.target.value);
              updateLineItem(item.id, {
                price: newPrice,
              });
            }}
            disabled={isCompletedView}
            className={`w-20 rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-black ${
              isCompletedView ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            placeholder="0.00"
          />
        )}
      </td>

      {/* Total Amount Field */}
      <td className="px-3 py-3">
        <span className="text-sm font-medium dark:text-white">
          ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
        </span>
      </td>

      {/* Actions */}
      {!isCompletedView && (
        <td className="px-3 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => addBreakdownRow(item)}
              disabled={isCompletedView}
              className={`text-green-600 hover:text-green-800 ${
                isCompletedView ? 'cursor-not-allowed opacity-50' : ''
              }`}
              title="Add breakdown"
            >
              <FiPlus className="h-4 w-4" />
            </button>
            {hasBreakdowns && (
              <button
                onClick={() => toggleBreakdown(item.id)}
                className="text-blue-600 hover:text-blue-800"
                title={
                  isBreakdownExpanded
                    ? 'Collapse breakdown'
                    : 'Expand breakdown'
                }
              >
                {isBreakdownExpanded ? (
                  <FiChevronDown className="h-4 w-4" />
                ) : (
                  <FiChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
};

export default ExternalLineItemRow;
