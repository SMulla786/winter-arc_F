import React, {useState} from 'react';
import {Controller, Control} from 'react-hook-form';
import {DownIcon} from '../../../icons';

interface Option {
  value: string;
  label: string;
}

interface GenericDropdownProps {
  name: string;
  label?: string;
  options: Option[];
  defaultOption?: string;
  control: Control<Record<string, unknown>>;
  disabled?: boolean;
  required?: boolean;
}

const GenericDropdown: React.FC<GenericDropdownProps> = ({
  name,
  label,
  options,
  defaultOption = '',
  control,
  disabled = false,
  required = false,
}) => {
  const [isOptionSelected, setIsOptionSelected] =
    useState<boolean>(!!defaultOption);

  return (
    <Controller
      name={name}
      control={control}
      render={({field: {onChange, onBlur, value, name}}) => (
        <div className="w-full">
          {label && (
            <label className="mb-2 block text-black dark:text-white">
              {label}
              <span className="text-lg font-bold text-red-600">
                &nbsp;{required && '*'}
              </span>
            </label>
          )}

          <div className="relative">
            <select
              name={name}
              value={value || ''}
              onChange={(e) => {
                setIsOptionSelected(true);
                onChange(e.target.value);
              }}
              onBlur={onBlur}
              disabled={disabled}
              className="w-full appearance-none rounded-md border border-stroke bg-transparent px-2 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:disabled:bg-black"
            >
              <option value="" disabled hidden>
                {defaultOption || `Select ${label}`}
              </option>
              {options?.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="text-black dark:text-white"
                >
                  {option.label}
                </option>
              ))}
            </select>

            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <DownIcon />
            </span>
          </div>
        </div>
      )}
    />
  );
};

export default GenericDropdown;
