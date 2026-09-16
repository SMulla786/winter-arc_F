import React from 'react';
import {FiChevronDown, FiChevronRight} from 'react-icons/fi';

interface CategoryHeaderProps {
  category: string;
  itemCount: number;
  isExpanded: boolean;
  config?: {
    date: string;
    time: string;
    location: string;
    vendorId?: string;
  };
  isCompletedView: boolean;
  getVendorOptions: (
    category: string,
    categoryId?: string,
  ) => Array<{id: string; label: string}>;
  updateCategoryConfig: (
    category: string,
    field: string,
    value: string,
  ) => void;
  applyCategoryConfig: (category: string) => void;
  toggleCategory: (category: string) => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  category,
  itemCount,
  isExpanded,
  config,
  isCompletedView,
  getVendorOptions,
  updateCategoryConfig,
  applyCategoryConfig,
  toggleCategory,
}) => {
  return (
    <tr className="bg-gray-2 px-4 py-4 font-bold text-black dark:bg-meta-4 dark:text-white">
      <td colSpan={isCompletedView ? 10 : 11} className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div
            className="flex cursor-pointer items-center gap-2"
            onClick={() => toggleCategory(category)}
          >
            {isExpanded ? (
              <FiChevronDown className="h-4 w-4" />
            ) : (
              <FiChevronRight className="h-4 w-4" />
            )}
            <span className="text-gray-800 font-semibold dark:text-white">
              {category}
            </span>
            <span className="text-gray-600 dark:text-gray-300 text-sm">
              ({itemCount} items)
            </span>
          </div>
          {!isCompletedView && isExpanded && (
            <div
              className="flex items-center gap-2 text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-xs">Date:</span>
                <input
                  type="date"
                  value={config?.date || ''}
                  onChange={(e) =>
                    updateCategoryConfig(category, 'date', e.target.value)
                  }
                  disabled={isCompletedView}
                  className={`rounded border border-stroke px-2 py-1 text-xs dark:border-strokedark dark:bg-black ${
                    isCompletedView ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-xs">Time:</span>
                <input
                  type="time"
                  value={config?.time || ''}
                  onChange={(e) =>
                    updateCategoryConfig(category, 'time', e.target.value)
                  }
                  disabled={isCompletedView}
                  className={`w-30 rounded border border-stroke px-2 py-1 text-xs dark:border-strokedark dark:bg-black ${
                    isCompletedView ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-xs">Location:</span>
                <select
                  value={config?.location || ''}
                  onChange={(e) =>
                    updateCategoryConfig(category, 'location', e.target.value)
                  }
                  disabled={isCompletedView}
                  className={`rounded border border-stroke px-2 py-1 text-xs dark:border-strokedark dark:bg-black ${
                    isCompletedView ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Select location</option>
                  <option value="event location">Event Location</option>
                  <option value="central kitchen">Central Kitchen</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-xs">Vendor:</span>
                <select
                  value={config?.vendorId || ''}
                  onChange={(e) =>
                    updateCategoryConfig(category, 'vendorId', e.target.value)
                  }
                  disabled={isCompletedView}
                  className={`rounded border border-stroke px-2 py-1 text-xs dark:border-strokedark dark:bg-black ${
                    isCompletedView ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Select vendor</option>
                  {getVendorOptions(category).map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  applyCategoryConfig(category);
                }}
                disabled={isCompletedView}
                className={`rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 ${
                  isCompletedView ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                Apply to All
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default CategoryHeader;
