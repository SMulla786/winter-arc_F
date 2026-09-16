import React from 'react';
import {FiAlertCircle, FiMinus} from 'react-icons/fi';
import {
  formatDateForInput,
  formatQuantityDisplay,
  formatTimeForInput,
  LineItem,
} from '@/components/Event/subEvent/eventHelper';

interface ExternalBreakdownRowProps {
  breakdown: LineItem;
  breakdownIndex: number;
  isCompletedView: boolean;
  vendorOptions: Array<{id: string; label: string}>;
  getVendorNameById: (vendorId?: string) => string;
  updateLineItem: (lineId: string, updates: Partial<LineItem>) => void;
  removeBreakdownRow: (breakdownId: string) => void;
  isFirstOfMaterial?: boolean;
  availableQuantity?: number; // Available quantity from main row
  currentTotalBreakdownQuantity?: number; // Sum of all breakdown quantities
}

const ExternalBreakdownRow: React.FC<ExternalBreakdownRowProps> = ({
  breakdown,
  breakdownIndex,
  isCompletedView,
  vendorOptions,
  getVendorNameById,
  updateLineItem,
  removeBreakdownRow,
  isFirstOfMaterial = false,
  availableQuantity = 0,
  currentTotalBreakdownQuantity = 0,
}) => {
  const breakdownBg =
    breakdownIndex % 2 === 0
      ? 'bg-white dark:bg-meta-4'
      : 'bg-gray-2 dark:bg-meta-3';

  const breakdownTotalAmount =
    (breakdown.price || 0) * (breakdown.quantity || 0);

  // Calculate total including this breakdown
  const totalIncludingThis = currentTotalBreakdownQuantity;

  // Check if this breakdown's quantity alone exceeds available quantity
  const isQuantityExceeded = breakdown.quantity > availableQuantity;

  // Check if total of all breakdowns exceeds available quantity
  const isTotalExceeded = totalIncludingThis > availableQuantity;

  // Check if total (including main row and other breakdowns) exceeds available
  const isTotalOverAllocated = breakdown.isOverAllocated || false;

  const handleQuantityChange = (newQuantity: number) => {
    // Calculate what the new total would be
    const newTotal =
      currentTotalBreakdownQuantity - (breakdown.quantity || 0) + newQuantity;

    let error = '';
    if (newQuantity < 0) {
      error = 'Quantity cannot be negative';
    } else if (newQuantity > availableQuantity) {
      error = `Quantity cannot exceed ${availableQuantity}`;
    } else if (newTotal > availableQuantity) {
      error = `Total breakdown quantity (${newTotal}) exceeds available (${availableQuantity})`;
    }

    updateLineItem(breakdown.id, {
      quantity: newQuantity,
      error: error || undefined,
    });
  };

  return (
    <tr
      key={breakdown.id}
      className={`hover:bg-gray-100 dark:hover:bg-gray-700 border-l-4 border-blue-300 ${breakdownBg} ${
        (breakdown.error || breakdown.requiredErrors) && !isCompletedView
          ? 'border-l-red-500'
          : ''
      } ${(isTotalExceeded || isTotalOverAllocated) && !isCompletedView ? 'bg-red-50 dark:bg-red-900/20' : ''}`}
    >
      {/* Empty cell for material name (indentation) */}
      <td className="px-4 py-3">
        <div className="text-gray-400 text-sm italic">↳</div>
      </td>

      {/* Total Qty - Empty for breakdown rows */}
      <td className="px-4 py-3">
        <span className="select-none text-transparent">—</span>
      </td>

      {/* Ordered Qty */}
      <td className="px-4 py-3">
        {isCompletedView ? (
          <span className="text-sm font-medium">
            {formatQuantityDisplay(breakdown.quantity)}
          </span>
        ) : (
          <div>
            <input
              type="number"
              step="any"
              value={formatQuantityDisplay(breakdown.quantity)}
              onChange={(e) => {
                const newQuantity =
                  e.target.value === '' ? 0 : Number(e.target.value);
                handleQuantityChange(newQuantity);
              }}
              disabled={isCompletedView}
              className={`w-20 rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-black ${
                breakdown.error && !isCompletedView
                  ? 'border-red-300 bg-red-50'
                  : ''
              } ${(isTotalExceeded || isTotalOverAllocated) && !isCompletedView ? 'border-red-500 bg-red-50' : ''} ${isCompletedView ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="0.0"
            />

            {/* Show quantity exceeded error message */}
            {breakdown.error && !isCompletedView && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <FiAlertCircle className="h-3 w-3" />
                {breakdown.error}
              </div>
            )}

            {/* Show warning if this breakdown alone exceeds available */}
            {!breakdown.error && isQuantityExceeded && !isCompletedView && (
              <div className="mt-1 flex items-center gap-1 text-xs text-orange-500">
                <FiAlertCircle className="h-3 w-3" />
                Quantity exceeds available ({availableQuantity})
              </div>
            )}

            {/* Show total exceed warning */}
            {!breakdown.error &&
              !isQuantityExceeded &&
              isTotalExceeded &&
              !isCompletedView && (
                <div className="mt-1 flex items-center gap-1 text-xs text-orange-500">
                  <FiAlertCircle className="h-3 w-3" />
                  Total breakdowns exceed available by{' '}
                  {formatQuantityDisplay(
                    totalIncludingThis - availableQuantity,
                  )}{' '}
                  {breakdown.unit}
                </div>
              )}
          </div>
        )}
      </td>

      {/* Breakdown Particular Field */}
      <td className="px-4 py-3">
        {isCompletedView ? (
          <span className="text-sm">{breakdown.particular || '-'}</span>
        ) : (
          <input
            type="text"
            value={breakdown.particular || ''}
            onChange={(e) =>
              updateLineItem(breakdown.id, {
                particular: e.target.value,
              })
            }
            disabled={isCompletedView}
            className={`w-full rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-black ${
              breakdown.requiredErrors &&
              !isCompletedView &&
              breakdown.requiredErrors.some((err) => err.includes('Particular'))
                ? 'border-red-300 bg-red-50'
                : ''
            } ${isCompletedView ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="Enter particular"
          />
        )}
      </td>

      {/* Breakdown Package Type Field */}
      <td className="px-4 py-3">
        {isCompletedView ? (
          <span className="text-sm">{breakdown.packageType || '-'}</span>
        ) : (
          <select
            value={breakdown.packageType || ''}
            onChange={(e) =>
              updateLineItem(breakdown.id, {
                packageType: e.target.value,
              })
            }
            disabled={isCompletedView}
            className={`w-full rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-black ${
              breakdown.requiredErrors &&
              !isCompletedView &&
              breakdown.requiredErrors.some((err) =>
                err.includes('Package Type'),
              )
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
      <td className="px-4 py-3">
        {isCompletedView ? (
          <span className="text-sm">
            {breakdown.date ? formatDateForInput(breakdown.date) : '-'}
          </span>
        ) : (
          <>
            <input
              type="date"
              value={breakdown.date || ''}
              onChange={(e) =>
                updateLineItem(breakdown.id, {
                  date: e.target.value,
                })
              }
              disabled={isCompletedView}
              className={`w-30 rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-black ${
                breakdown.requiredErrors &&
                !isCompletedView &&
                breakdown.requiredErrors.some((err) => err.includes('Date'))
                  ? 'border-red-300 bg-red-50'
                  : ''
              } ${isCompletedView ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {breakdown.requiredErrors &&
              !isCompletedView &&
              breakdown.requiredErrors.some((err) => err.includes('Date')) && (
                <div className="mt-1 text-xs text-red-500">
                  Date is required
                </div>
              )}
          </>
        )}
      </td>

      {/* Time Field */}
      <td className="px-4 py-3">
        {isCompletedView ? (
          <span className="text-sm">
            {breakdown.time ? formatTimeForInput(breakdown.time) : '-'}
          </span>
        ) : (
          <>
            <input
              type="time"
              value={breakdown.time || ''}
              onChange={(e) =>
                updateLineItem(breakdown.id, {
                  time: e.target.value,
                })
              }
              disabled={isCompletedView}
              className={`w-20 rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-black ${
                breakdown.requiredErrors &&
                !isCompletedView &&
                breakdown.requiredErrors.some((err) => err.includes('Time'))
                  ? 'border-red-300 bg-red-50'
                  : ''
              } ${isCompletedView ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {breakdown.requiredErrors &&
              !isCompletedView &&
              breakdown.requiredErrors.some((err) => err.includes('Time')) && (
                <div className="mt-1 text-xs text-red-500">
                  Time is required
                </div>
              )}
          </>
        )}
      </td>

      {/* Location Field */}
      <td className="px-4 py-3">
        {isCompletedView ? (
          <span className="text-sm">{breakdown.location || '-'}</span>
        ) : (
          <>
            <select
              value={breakdown.location || ''}
              onChange={(e) =>
                updateLineItem(breakdown.id, {
                  location: e.target.value,
                })
              }
              disabled={isCompletedView}
              className={`w-full rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-black ${
                breakdown.requiredErrors &&
                !isCompletedView &&
                breakdown.requiredErrors.some((err) => err.includes('Location'))
                  ? 'border-red-300 bg-red-50'
                  : ''
              } ${isCompletedView ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
              <option value="">Select location</option>
              <option value="event location">Event Location</option>
              <option value="central kitchen">Central Kitchen</option>
            </select>
            {breakdown.requiredErrors &&
              !isCompletedView &&
              breakdown.requiredErrors.some((err) =>
                err.includes('Location'),
              ) && (
                <div className="mt-1 text-xs text-red-500">
                  Location is required
                </div>
              )}
          </>
        )}
      </td>

      {/* Vendor Field */}
      <td className="px-4 py-3">
        {isCompletedView ? (
          <span className="text-sm">
            {breakdown.vendorName ||
              getVendorNameById(breakdown.vendorId) ||
              '-'}
          </span>
        ) : (
          <>
            <select
              value={breakdown.vendorId || ''}
              onChange={(e) => {
                const value = e.target.value;
                updateLineItem(breakdown.id, {
                  vendorId: value,
                });
              }}
              disabled={isCompletedView}
              className={`w-full rounded border border-stroke px-2 py-1 text-sm dark:border-strokedark dark:bg-black ${
                breakdown.requiredErrors &&
                !isCompletedView &&
                breakdown.requiredErrors.some((err) => err.includes('Vendor'))
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
            </select>
            {breakdown.requiredErrors &&
              !isCompletedView &&
              breakdown.requiredErrors.some((err) =>
                err.includes('Vendor'),
              ) && (
                <div className="mt-1 text-xs text-red-500">
                  Vendor is required
                </div>
              )}
          </>
        )}
      </td>

      {/* Price Field */}
      <td className="px-4 py-3">
        <span className="text-gray-600 text-sm">
          {breakdown.price ? `₹${breakdown.price.toFixed(2)}` : 'Inherited'}
        </span>
      </td>

      {/* Total Amount Field */}
      <td className="px-4 py-3">
        <span className="text-sm font-medium">
          ₹{breakdownTotalAmount.toFixed(2)}
        </span>
      </td>

      {/* Remove Button */}
      {!isCompletedView && (
        <td className="px-4 py-3">
          <button
            onClick={() => removeBreakdownRow(breakdown.id)}
            disabled={isCompletedView}
            className={`text-red-600 hover:text-red-800 ${
              isCompletedView ? 'cursor-not-allowed opacity-50' : ''
            }`}
            title="Remove breakdown"
          >
            <FiMinus className="h-4 w-4" />
          </button>
        </td>
      )}
    </tr>
  );
};

export default ExternalBreakdownRow;
