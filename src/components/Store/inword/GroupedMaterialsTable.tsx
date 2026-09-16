import React from 'react';
import {LineItem} from '../types';
import {
  formatQuantityDisplay,
  formatDateDisplay,
  formatTimeDisplay,
} from './helpers';

export default function GroupedMaterialsTable({
  grouped,
  onQtyChange,
  onToggleCategory,
  expandedCategories,
  onToggleBreakdown,
  expandedBreakdowns,
}: {
  grouped: Record<string, LineItem[]>;
  onQtyChange: (id: string, qty: number) => void;
  onToggleCategory: (cat: string) => void;
  expandedCategories: Record<string, boolean>;
  onToggleBreakdown: (id: string) => void;
  expandedBreakdowns: Record<string, boolean>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-blue-900 text-white">
          <tr>
            <th className="p-2">R.M.</th>
            <th className="p-2">Vendor</th>
            <th className="p-2">PO Qty</th>
            <th className="p-2">Unit</th>
            <th className="p-2">Price</th>
            <th className="p-2">Recv Qty</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Diff</th>
            <th className="p-2">Date</th>
            <th className="p-2">Time</th>
            <th className="p-2">Venue</th>
            <th className="p-2">Total Amt</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(grouped).map((category) => {
            const items = grouped[category];
            const isExpanded = expandedCategories[category] !== false;
            return (
              <React.Fragment key={category}>
                <tr className="bg-gray-100 font-bold">
                  <td
                    colSpan={13}
                    className="cursor-pointer p-3"
                    onClick={() => onToggleCategory(category)}
                  >
                    {category} ({items.length})
                  </td>
                </tr>

                {isExpanded &&
                  items.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="p-2">{m.name}</td>
                      <td className="p-2">{m.vendorName}</td>
                      <td className="p-2">
                        {formatQuantityDisplay(m.poQuantity)}
                      </td>
                      <td className="p-2">{m.unit}</td>
                      <td className="p-2">₹{(m.price || 0).toFixed(2)}</td>
                      <td className="p-2">{m.totalReceived ?? 0}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="any"
                          value={formatQuantityDisplay(m.quantity)}
                          onChange={(e) =>
                            onQtyChange(m.id, Number(e.target.value) || 0)
                          }
                          className="w-20 rounded border px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        {(m.quantity - (m.poQuantity || 0)).toFixed(2)}
                      </td>
                      <td className="p-2">{formatDateDisplay(m.date)}</td>
                      <td className="p-2">{formatTimeDisplay(m.time)}</td>
                      <td className="p-2">{m.venue || '-'}</td>
                      <td className="p-2">
                        ₹{((m.price || 0) * (m.quantity || 0)).toFixed(2)}
                      </td>
                      <td className="p-2">
                        {m.isBreakdown ? (
                          <button
                            onClick={() => onToggleBreakdown(m.parentId!)}
                            className="text-sm"
                          >
                            Toggle
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
