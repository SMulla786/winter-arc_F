import React, {useState, useEffect, useRef} from 'react';
import {useFormContext, Controller, useWatch} from 'react-hook-form';
import {IoIosArrowDown, IoIosArrowUp} from 'react-icons/io';
import ReactDOM from 'react-dom';

interface Option {
  value: string;
  label: string;
}

interface DropdownOutsideProps {
  name: string;
  label?: string;
  options: Option[];
  defaultValue?: string; // should be the value, not label
  disabled?: boolean;
}

const DropdownOutside: React.FC<DropdownOutsideProps> = ({
  name,
  label,
  options,
  defaultValue = '',
  disabled = false,
}) => {
  const {control} = useFormContext();
  const watchedValue = useWatch({name, control});

  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync search term with selected value
  useEffect(() => {
    if (watchedValue) {
      const selectedOption = options.find(
        (option) => option.value === watchedValue,
      );
      if (selectedOption) setSearchTerm(selectedOption.label);
    }
  }, [watchedValue, options]);

  // Debounce search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 200);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
  );

  const scrollToOption = (index: number) => {
    const optionsContainer = document.getElementById(`${name}-dropdown-portal`);
    if (optionsContainer && index >= 0 && index < filteredOptions.length) {
      const optionElement = optionsContainer.children[index] as HTMLElement;
      if (optionElement)
        optionElement.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
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
                onChange(selected.value); // set value in form
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

        // Compute portal position
        const rect = inputRef.current?.getBoundingClientRect();
        const portalStyle: React.CSSProperties = rect
          ? {
              position: 'absolute',
              top: rect.bottom + window.scrollY,
              left: rect.left + window.scrollX,
              width: rect.width,
              maxHeight: 200,
              overflowY: 'auto',
              background: 'white',
              border: '1px solid #ccc',
              borderRadius: 4,
              zIndex: 9999,
            }
          : {};

        return (
          <div className="relative">
            {label && (
              <label className="mb-2 block text-black dark:text-white">
                {label}
              </label>
            )}
            <div className="relative bg-white dark:bg-form-input">
              <input
                type="text"
                ref={inputRef}
                placeholder={`Search ${label || ''}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={handleInputClick}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-md border border-stroke bg-transparent px-2 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:disabled:bg-black"
                aria-expanded={isOpen}
                aria-haspopup="true"
                disabled={disabled}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2">
                {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </span>

              {isOpen &&
                rect &&
                ReactDOM.createPortal(
                  <div
                    id={`${name}-dropdown-portal`}
                    style={portalStyle}
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
                  </div>,
                  document.body,
                )}
            </div>
          </div>
        );
      }}
    />
  );
};

export default DropdownOutside;
