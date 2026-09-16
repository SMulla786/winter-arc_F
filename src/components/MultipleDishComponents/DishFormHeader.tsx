import SearchInputWithSuggestions from '@/components/Forms/Input/GenericInputFieldList';
import React from 'react';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericSearchDropdown from '../Forms/SearchDropDown/GenericSearchDropdown';
import GenericTextArea from '../Forms/TextArea/GenericTextArea';
import GenericInputField from '../Forms/Input/GenericInputField';

interface Props {
  dishes: {id: string; name: string}[];
  dishId: string;
  categoryOptions: {value: string; label: string}[];
  onDishSearch: (id: string) => void;
  addColumn: () => void;
}

const DishFormHeader: React.FC<Props> = ({
  dishes,
  dishId,
  categoryOptions,
  onDishSearch,
  addColumn,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Dish Name */}
      <div className="w-full">
        <SearchInputWithSuggestions
          name="name"
          label="Dish Name"
          placeholder="Search or type dish name"
          suggestions={dishes}
          onDishSearch={onDishSearch}
          defaultValue={dishId ? dishId : ''}
        />
      </div>

      {/* Dish Category */}
      <div className="w-full">
        <GenericSearchDropdown
          label="Dish Category"
          name="dishCategory"
          options={categoryOptions}
        />
      </div>

      {/* Dish Type */}
      <div className="w-full">
        <GenericSearchDropdown
          label="Dish Type"
          name="vegNonveg"
          options={[
            {label: 'VEG', value: 'VEG'},
            {label: 'NON VEG', value: 'NONVEG'},
          ]}
        />
      </div>
      <div className="w-full">
        <GenericSearchDropdown
          name="unit"
          label="Unit"
          options={[
            {label: 'kg', value: 'KILOGRAM'},
            {label: 'bottle', value: 'BOTTLE'},
            {label: 'gm', value: 'GRAM'},
            {label: 'ltr', value: 'LITRE'},
            {label: 'pcs', value: 'PIECE'},
            {label: 'meter', value: 'METER'},
          ]}
        />
      </div>

      <div className="w-full">
        <GenericInputField name="portionSize" label="Portion Size" />
      </div>

      {/* Description */}
      <div className="col-span-1 md:col-span-2">
        <GenericTextArea
          rows={2}
          name="description"
          label="Dish Description"
          placeholder="Enter dish description"
        />
      </div>
      {/* Add Column Button */}
      <div className="col-span-2 flex justify-end">
        <button
          type="button"
          onClick={addColumn}
          className="text-blue-600 underline"
        >
          <span className="mr-2">+ Column</span>
        </button>
      </div>
    </div>
  );
};

export default DishFormHeader;
