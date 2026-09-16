import React, {useState, useEffect, useRef, useCallback} from 'react';
import {useFormContext, Controller} from 'react-hook-form';
import {DownIcon, GlobeIcon, XIcon} from '../../../icons';
import {createPortal} from 'react-dom';

interface Option {
  value: string;
  label: string;
}

interface GenericMultiselectDropdownProps {
  name: string;
  label?: string;
  options: Option[];
  defaultOption?: string[];
  onChange?: (selectedOptions: string[]) => void;
}

const GenericMultiselectDropdown: React.FC<GenericMultiselectDropdownProps> = ({
  name,
  label,
  options,
  defaultOption = [],
  onChange,
}) => {
  const {control} = useFormContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>(
    'bottom',
  );
  const [dropdownCoords, setDropdownCoords] = useState<{
    top: number;
    left: number;
    width: number;
  }>({top: 0, left: 0, width: 0});

  const inputRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
  );

  // Calculate dropdown position
  const updateDropdownPosition = useCallback(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const estimatedHeight = Math.min(filteredOptions.length * 32 + 32, 240);
      const position = spaceBelow < estimatedHeight ? 'top' : 'bottom';
      setDropdownPosition(position);
      setDropdownCoords({
        top:
          position === 'bottom'
            ? rect.bottom + window.scrollY + 4
            : rect.top + window.scrollY - Math.min(estimatedHeight, 240) - 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen, filteredOptions.length]);

  // Recalculate position when open, scroll, or resize
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
      return () => {
        window.removeEventListener('scroll', updateDropdownPosition, true);
        window.removeEventListener('resize', updateDropdownPosition);
      };
    }
  }, [isOpen, updateDropdownPosition]);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultOption}
      render={({field}) => {
        const selectedValues = field.value || [];

        const handleSelect = (option: Option) => {
          const isSelected = selectedValues.includes(option.value);
          const newSelectedValues = isSelected
            ? selectedValues.filter((v) => v !== option.value)
            : [...selectedValues, option.value];

          field.onChange(newSelectedValues);
          setSearchTerm('');
          setIsOpen(false);
          onChange?.(newSelectedValues);
        };

        const handleRemoveOption = (value: string) => {
          const newSelectedValues = selectedValues.filter((v) => v !== value);
          field.onChange(newSelectedValues);
          onChange?.(newSelectedValues);
        };

        return (
          <div className="relative">
            {label && (
              <label className="mb-2.5 block text-black dark:text-white">
                {label}
              </label>
            )}

            {/* Selected tags - Adjusted for single line in table context */}
            <div
              className={
                selectedValues.length > 0
                  ? `bg-gray-50 dark:border-gray-600 dark:bg-gray-800 scrollbar-hide mb-1 flex min-h-[28px] flex-nowrap gap-1 overflow-x-auto p-1`
                  : 'hidden'
              }
            ></div>

            {/* Input */}
            <div
              ref={inputRef}
              className="relative bg-white dark:bg-form-input"
            >
              <span className="absolute left-4 top-1/2 -translate-y-1/2"></span>
              <input
                type="text"
                placeholder={`Search ${label}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className="w-full appearance-none rounded border border-stroke bg-transparent px-3 py-2 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2">
                <DownIcon className="text-gray-400 h-4 w-4" />
              </span>
            </div>

            {/* Dropdown (Portal) */}
            {isOpen &&
              createPortal(
                <div
                  style={{
                    position: 'absolute',
                    top: dropdownCoords.top,
                    left: dropdownCoords.left,
                    width: dropdownCoords.width,
                    zIndex: 9999,
                  }}
                  className="max-h-60 overflow-y-auto rounded border border-stroke bg-white shadow-lg dark:border-form-strokedark dark:bg-form-input"
                  role="listbox"
                >
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <div
                        key={option.value}
                        onClick={() => handleSelect(option)}
                        className={`border-gray-100 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 cursor-pointer border-b p-3 last:border-b-0 ${
                          selectedValues.includes(option.value)
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                            : ''
                        }`}
                      >
                        {option.label}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 p-3">
                      No options found
                    </div>
                  )}
                </div>,

                document.body,
              )}
            {selectedValues.map((value) => {
              const option = options.find((opt) => opt.value === value);
              return (
                option && (
                  <span
                    key={value}
                    className="inline-flex min-w-0 max-w-[120px] items-center truncate rounded-full bg-blue-200 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    title={option.label} // Tooltip for full name
                  >
                    <span className="truncate">{option.label}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(value)}
                      className="ml-1 flex-shrink-0 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </span>
                )
              );
            })}
          </div>
        );
      }}
    />
  );
};

export default GenericMultiselectDropdown;
