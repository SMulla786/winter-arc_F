/* eslint-disable */
import React from 'react';
import Select from 'react-select';

type Option = {label: string; value: string; [k: string]: any};

export default function SharedSelect({
  value,
  options,
  onChange,
  placeholder,
  isLoading,
}: {
  value: Option | null;
  options: Option[];
  onChange: (o: Option | null) => void;
  placeholder?: string;
  isLoading?: boolean;
}) {
  return (
    <Select
      value={value}
      options={options}
      onChange={onChange}
      placeholder={placeholder}
      isLoading={isLoading}
      className="basic-single"
      classNamePrefix="select"
    />
  );
}
