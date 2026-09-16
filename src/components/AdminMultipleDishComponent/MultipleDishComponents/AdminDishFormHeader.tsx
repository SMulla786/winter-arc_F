import React from 'react';
import SearchInputWithSuggestions from '@/components/Forms/Input/GenericInputFieldList';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import GenericSearchDropdown from '@/components/Forms/SearchDropDown/GenericSearchDropdown';
import GenericTextArea from '@/components/Forms/TextArea/GenericTextArea';
interface Props {
  dishes: {id: string; name: string}[];
  dishId: string;
  categoryOptions: {value: string; label: string}[];
  onDishSearch: (id: string) => void;
  addColumn: () => void;
  languagesOptions: {value: string; label: string}[];
}

const AdminDishFormHeader: React.FC<Props> = ({
  dishes,
  dishId,
  categoryOptions,
  onDishSearch,
  addColumn,
  languagesOptions,
}) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    {/* Language - Moved to top and made required */}
    <div className="w-full">
      <GenericSearchDropdown
        name="languageId"
        label="Language *"
        options={languagesOptions}
        required
      />
    </div>

    {/* Dish Name - Only show when language is selected */}
    <div className="w-full">
      <SearchInputWithSuggestions
        name="name"
        label="Dish Name"
        placeholder="Search or type a dish name"
        suggestions={dishes}
        onDishSearch={onDishSearch}
        defaultValue={dishId ? dishId : ''}
        disabled={!languagesOptions.length}
      />
    </div>

    {/* Dish Category - Auto-populated when dish is selected */}
    <div className="w-full">
      <GenericSearchDropdown
        label="Dish Category"
        name="dishCategory"
        options={categoryOptions}
        disabled={categoryOptions.length === 0} // Disable if no categories for selected language
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

    {/* Dish Description (span full width) */}
    <div className="col-span-1 md:col-span-2">
      <GenericTextArea
        rows={2}
        name="description"
        label="Dish Description"
        placeholder="Enter dish description"
      />
    </div>

    {/* Add Column Button (span full width but aligned right) */}
    <div className="col-span-1 flex justify-end md:col-span-2">
      <GenericButton type="button" onClick={addColumn}>
        <span className="mr-2">+</span>Column
      </GenericButton>
    </div>
  </div>
);
export default AdminDishFormHeader;
