import React, {useState, useEffect, useRef} from 'react';
import {useFormContext, Controller, useWatch} from 'react-hook-form';
import {IoIosArrowDown, IoIosArrowUp} from 'react-icons/io';

interface Option {
  value: string;
  label: string;
}

interface GenericSearchDropdownProps {
  name: string;
  label?: string;
  options: Option[];
  defaultOption?: string;
  disabled?: boolean;
  onSearchTextChange?: (text: string) => void;
}

const GenericSearchDropdown: React.FC<GenericSearchDropdownProps> = ({
  name,
  label,
  options,
  defaultOption = '',
  disabled = false,
  onSearchTextChange,
}) => {
  const {control} = useFormContext();
  const watchedValue = useWatch({name, control});

  const [searchTerm, setSearchTerm] = useState<string>(defaultOption);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Ensure options is always an array and filter out any invalid options
  const validOptions = React.useMemo(() => {
    return (options || []).filter(
      (option) =>
        option &&
        typeof option.label === 'string' &&
        option.label.trim() !== '',
    );
  }, [options]);

  // Sync search term with selected value
  useEffect(() => {
    const selectedOption = validOptions.find(
      (option) => option.value === watchedValue,
    );
    setSearchTerm(selectedOption ? selectedOption.label : '');
  }, [watchedValue, validOptions]);

  // Debounce the search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] =
    useState<string>(searchTerm);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredOptions = validOptions.filter((option) =>
    option.label.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
  );

  // Scroll to highlighted option
  const scrollToOption = (index: number) => {
    if (optionsRef.current && index >= 0 && index < filteredOptions.length) {
      const optionElement = optionsRef.current.children[index] as HTMLElement;
      if (optionElement) {
        optionElement.scrollIntoView({behavior: 'smooth', block: 'nearest'});
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultOption}
      render={({field: {onChange, value}}) => {
        const handleInputClick = () => {
          setSearchTerm('');
          setIsOpen(true);
          setHighlightedIndex(-1);
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            setIsOpen(true);
            return;
          }

          switch (e.key) {
            case 'ArrowDown':
              e.preventDefault();
              setHighlightedIndex((prev) => {
                const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
                scrollToOption(next);
                return next;
              });
              break;

            case 'ArrowUp':
              e.preventDefault();
              setHighlightedIndex((prev) => {
                const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
                scrollToOption(next);
                return next;
              });
              break;

            case 'Enter':
              e.preventDefault();
              if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                const selected = filteredOptions[highlightedIndex];
                onChange(selected.value);
                setSearchTerm(selected.label);
                setIsOpen(false);
                setHighlightedIndex(-1);
              }
              break;

            case 'Escape':
              e.preventDefault();
              setIsOpen(false);
              setHighlightedIndex(-1);
              break;
          }
        };

        return (
          <div className="relative" ref={dropdownRef}>
            {label && (
              <label className="mb-2.5 block text-black dark:text-white">
                {label}
              </label>
            )}

            <div className="relative bg-white dark:bg-form-input">
              <input
                type="text"
                placeholder={`Search ${label}`}
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  if (onSearchTextChange) {
                    onSearchTextChange(value);
                  }
                }}
                onClick={handleInputClick}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-md border border-stroke bg-transparent px-2 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:disabled:bg-black"
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-controls={`${name}-dropdown`}
                disabled={disabled}
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2">
                {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </span>

              {isOpen && (
                <div
                  id={`${name}-dropdown`}
                  ref={optionsRef}
                  className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded border border-stroke bg-white shadow-lg dark:bg-form-input"
                  role="listbox"
                >
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option, index) => (
                      <div
                        key={option.value}
                        onMouseDown={() => {
                          onChange(option.value);
                          setSearchTerm(option.label);
                          setIsOpen(false);
                        }}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer p-2 ${
                          highlightedIndex === index
                            ? 'bg-gray dark:bg-graydark'
                            : ''
                        }`}
                        role="option"
                        aria-selected={value === option.value}
                      >
                        {option.label}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 p-2">
                      No options found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      }}
    />
  );
};

export default GenericSearchDropdown;
