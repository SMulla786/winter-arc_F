import React, {useState, useEffect, useRef, useCallback, memo} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import {createPortal} from 'react-dom';
import {DownIcon} from '@/icons';

type Option = {
  label: string;
  value: string;
};

interface Props {
  name: string;
  options: Option[];
  placeholder?: string;
  value?: string[];
  onChange?: (selected: string[]) => void;
}

const OutSideMultiselectDropDown: React.FC<Props> = ({
  name,
  options,
  placeholder = 'Select',
  value = [],
  onChange,
}) => {
  const {control, setValue} = useFormContext();

  const watchedValue = useWatch({control, name});
  const selected: string[] = Array.isArray(watchedValue) ? watchedValue : value;

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [coords, setCoords] = useState({top: 0, left: 0, width: 0});

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );

  const valueToLabel = useCallback(
    (val: string) => options.find((o) => o.value === val)?.label ?? val,
    [options],
  );

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      )
        return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleValue = (val: string) => {
    const updated = selected.includes(val)
      ? selected.filter((v) => v !== val)
      : [...selected, val];

    setValue(name, updated, {shouldDirty: true});
    onChange?.(updated);
  };

  return (
    <>
      {/* Trigger */}
      <div
        ref={triggerRef}
        className="relative cursor-pointer bg-white dark:bg-form-input"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex min-h-[38px] flex-wrap items-center gap-2 rounded border-[1.5px] border-stroke px-3 py-1 dark:border-form-strokedark dark:bg-form-input">
          {selected.length === 0 && (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          )}

          {selected.map((val) => (
            <span
              key={val}
              className="dark:bg-gray-600 flex items-center gap-1 rounded bg-neutral-200 px-2 py-0.5 text-sm text-black dark:bg-meta-4 dark:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {valueToLabel(val)}
              <button
                type="button"
                className="ml-1 cursor-pointer text-xs font-bold"
                onClick={() => toggleValue(val)}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
          <DownIcon />
        </span>
      </div>

      {/* Dropdown */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'absolute',
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 9999,
            }}
            className="rounded border border-stroke bg-white shadow-lg dark:bg-form-input"
          >
            <input
              autoFocus
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-b border-stroke px-3 py-2 text-sm outline-none dark:border-form-strokedark dark:bg-form-input"
            />

            <div className="max-h-40 overflow-auto">
              {filteredOptions.length ? (
                filteredOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`hover:bg-gray-100 dark:hover:bg-gray-600 flex cursor-pointer items-center px-3 py-2 ${
                      selected.includes(opt.value)
                        ? 'bg-blue-50 dark:bg-blue-600'
                        : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(opt.value)}
                      onChange={() => toggleValue(opt.value)}
                      className="mr-2"
                    />
                    {opt.label}
                  </label>
                ))
              ) : (
                <div className="text-gray-500 p-2 text-sm">
                  No options found
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default memo(OutSideMultiselectDropDown);
