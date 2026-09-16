import React, {useState, useRef, useEffect} from 'react';
import {useController, useFormContext} from 'react-hook-form';

interface Option {
  value: string;
  label: string;
}

interface CustomMultiselectDropdownProps {
  name: string;
  label?: string;
  options: Option[];
  defaultOption?: string[];
  className?: string;
  placeholder?: string;
}

const CustomMultiselectDropdown: React.FC<CustomMultiselectDropdownProps> = ({
  name,
  label,
  options,
  defaultOption = [],
  className = '',
  placeholder = 'Select options...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {control} = useFormContext();

  const {field} = useController({
    name,
    control,
    defaultValue: defaultOption,
  });

  const selectedValues = field.value || [];

  // Filter options based on search
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Separate selected and unselected options
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value),
  );

  const unselectedOptions = filteredOptions.filter(
    (option) => !selectedValues.includes(option.value),
  );

  const toggleOption = (optionValue: string) => {
    const newValue = selectedValues.includes(optionValue)
      ? selectedValues.filter((val: string) => val !== optionValue)
      : [...selectedValues, optionValue];

    field.onChange(newValue);
  };

  const removeSelectedOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = selectedValues.filter(
      (val: string) => val !== optionValue,
    );
    field.onChange(newValue);
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    field.onChange([]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm font-medium">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <div
        className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 min-h-[42px] cursor-pointer rounded-lg border bg-white p-2 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-2">
          {selectedOptions.length === 0 ? (
            <span className="text-gray-500 dark:text-gray-400 py-1 text-sm">
              {placeholder}
            </span>
          ) : (
            selectedOptions.map((option) => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-100 px-2 py-1 text-sm text-blue-800 dark:border-blue-700 dark:bg-blue-800 dark:text-blue-200"
              >
                {option.label}
                <button
                  type="button"
                  onClick={(e) => removeSelectedOption(option.value, e)}
                  className="flex h-4 w-4 items-center justify-center text-xs font-bold hover:text-blue-600 focus:outline-none dark:hover:text-blue-400"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        {selectedOptions.length > 0 && (
          <div className="border-gray-200 dark:border-gray-600 mt-2 flex items-center justify-between border-t pt-2">
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              {selectedOptions.length} selected
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-red-500 hover:text-red-700 focus:outline-none dark:text-red-400 dark:hover:text-red-300"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="dark:bg-gray-800 border-gray-300 dark:border-gray-600 absolute z-50 mt-1 flex max-h-80 w-full flex-col overflow-hidden rounded-lg border bg-white shadow-lg">
          {/* Search Input */}
          <div className="border-gray-200 dark:border-gray-600 border-b p-3">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 placeholder-gray-500 dark:placeholder-gray-400 w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          {/* Options Container */}
          <div className="flex-1 overflow-auto">
            {/* Selected Options - AT THE TOP */}
            {selectedOptions.length > 0 && (
              <div className="border-gray-200 dark:border-gray-600 border-b">
                <div className="bg-gray-50 dark:bg-gray-700 sticky top-0 px-3 py-2">
                  <span className="text-gray-600 dark:text-gray-300 text-xs font-semibold uppercase tracking-wide">
                    Selected ({selectedOptions.length})
                  </span>
                </div>
                {selectedOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex cursor-pointer items-center border-b border-blue-50 px-4 py-3 last:border-b-0 hover:bg-blue-50 dark:border-blue-900/50 dark:hover:bg-blue-900"
                    onClick={() => toggleOption(option.value)}
                  >
                    <div className="mr-3 flex h-5 w-5 items-center justify-center rounded border-2 border-blue-500 bg-blue-500">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-900 flex-1 text-sm font-medium dark:text-white">
                      {option.label}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSelectedOption(option.value, e);
                      }}
                      className="text-gray-400 p-1 hover:text-red-500 focus:outline-none dark:hover:text-red-400"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Available Options */}
            <div>
              {unselectedOptions.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 sticky top-0 border-b px-3 py-2">
                  <span className="text-gray-600 dark:text-gray-300 text-xs font-semibold uppercase tracking-wide">
                    Available ({unselectedOptions.length})
                  </span>
                </div>
              )}
              {unselectedOptions.length > 0 ? (
                unselectedOptions.map((option) => (
                  <div
                    key={option.value}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-100 dark:border-gray-600 flex cursor-pointer items-center border-b px-4 py-3 last:border-b-0"
                    onClick={() => toggleOption(option.value)}
                  >
                    <div className="border-gray-300 dark:border-gray-500 mr-3 h-5 w-5 rounded border-2" />
                    <span className="text-gray-700 dark:text-gray-300 flex-1 text-sm">
                      {option.label}
                    </span>
                  </div>
                ))
              ) : searchTerm ? (
                <div className="px-4 py-8 text-center">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No results found for "
                    <span className="font-medium">{searchTerm}</span>"
                  </p>
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No options available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 border-t p-3">
            <div className="text-gray-500 dark:text-gray-400 flex items-center justify-between text-xs">
              <span>
                {selectedOptions.length} of {options.length} selected
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomMultiselectDropdown;
