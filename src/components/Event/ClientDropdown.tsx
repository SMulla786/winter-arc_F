import React, {useState} from 'react';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericSearchDropdown from '../Forms/SearchDropDown/GenericSearchDropdown';

interface ClientDropdownProps {
  FormattedClients: {value: string; label: string}[];
  setClientSearchText: (text: string) => void;
  navigateToCustomer: () => void;
}

const ClientDropdown: React.FC<ClientDropdownProps> = ({
  FormattedClients,
  setClientSearchText,
  navigateToCustomer,
}) => {
  const [searchText, setSearchText] = useState('');

  return (
    <div className="relative w-full">
      <GenericSearchDropdown
        name="client"
        label="Client"
        options={FormattedClients}
        onSearchTextChange={(text) => {
          setSearchText(text);
          setClientSearchText(text);
        }}
      />

      {/* Show "Add Customer" only when user typed something that doesn't match any label */}
      {searchText.trim() !== '' &&
        !FormattedClients.some((c) =>
          c.label.toLowerCase().includes(searchText.toLowerCase()),
        ) && (
          <div className="absolute z-20 mt-2 w-full rounded border border-stroke bg-white shadow-lg dark:bg-form-input">
            <div className="text-gray-500 dark:text-gray-400 p-2">
              No clients found.
            </div>
            <div className="border-gray-200 dark:border-gray-700 items-center justify-center border-t p-2">
              <GenericButton onClick={navigateToCustomer}>
                Add Customer
              </GenericButton>
            </div>
          </div>
        )}
    </div>
  );
};

export default ClientDropdown;
