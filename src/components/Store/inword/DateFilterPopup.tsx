import React, {useEffect, useRef, useState} from 'react';
import {FiX, FiCalendar} from 'react-icons/fi';

interface Props {
  fromDate: string;
  toDate: string;
  setFromDate: (d: string) => void;
  setToDate: (d: string) => void;
  clearFilters: () => void;
  filteredCount: number;
  totalCount: number;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  filterType: {event: boolean; po: boolean};
  setFilterType: React.Dispatch<
    React.SetStateAction<{event: boolean; po: boolean}>
  >;
}

const DateFilterPopup: React.FC<Props> = ({
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  clearFilters,
  filteredCount,
  totalCount,
  onClose,
  triggerRef,
  filterType,
  setFilterType,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, triggerRef]);

  const [position, setPosition] = useState({top: 0, left: 0});

  useEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
  }, [triggerRef]);

  return (
    <div className="fixed inset-0 z-40" style={{pointerEvents: 'none'}}>
      <div
        ref={popupRef}
        className="absolute w-80 rounded-lg border border-stroke bg-white shadow-lg"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          pointerEvents: 'auto',
        }}
      >
        <div className="border-b border-stroke px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-gray-600 text-sm" />
              <h3 className="text-gray-800 text-sm font-semibold">
                Filter by Date
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-lg"
            >
              <FiX />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4 space-y-3">
            <div>
              <label className="text-gray-700 mb-1 block text-xs font-medium">
                From
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded border border-stroke bg-white p-2 text-xs outline-none focus:border-primary"
                max={toDate || undefined}
              />
            </div>
            <div>
              <label className="text-gray-700 mb-1 block text-xs font-medium">
                To
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded border border-stroke bg-white p-2 text-xs outline-none focus:border-primary"
                min={fromDate || undefined}
              />
            </div>
          </div>

          <div className="bg-gray-50 mb-4 rounded border border-stroke p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-xs">Showing</div>
                <div className="text-gray-800 font-bold">{filteredCount}</div>
              </div>
              <div className="text-gray-400">/</div>
              <div>
                <div className="text-gray-600 text-xs">Total</div>
                <div className="text-gray-800 font-bold">{totalCount}</div>
              </div>
              <div className="text-gray-400">•</div>
              <button
                onClick={() => {
                  clearFilters();
                  onClose();
                }}
                className="text-xs font-medium text-red-600 hover:text-red-800"
              >
                Clear All
              </button>
            </div>
            {fromDate && toDate && (
              <div className="mt-2 border-t border-stroke pt-2">
                <div className="text-gray-700 text-xs font-medium">
                  {new Date(fromDate).toLocaleString(undefined, {
                    month: 'short',
                    day: '2-digit',
                  })}{' '}
                  - {new Date(toDate).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="text-gray-700 mb-2 block text-xs font-medium">
              Filter by Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-gray-700 flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={filterType.event}
                  onChange={(e) =>
                    setFilterType((prev) => ({
                      ...prev,
                      event: e.target.checked,
                    }))
                  }
                  className="h-3 w-3"
                />
                Event
              </label>
              <label className="text-gray-700 flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={filterType.po}
                  onChange={(e) =>
                    setFilterType((prev) => ({...prev, po: e.target.checked}))
                  }
                  className="h-3 w-3"
                />
                PO
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded bg-primary py-2 text-xs font-medium text-white transition-colors hover:bg-primary/90"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateFilterPopup;
