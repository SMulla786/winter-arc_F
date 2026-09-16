import React, {useState} from 'react';
import GenericSearchDropdown from '../Forms/SearchDropDown/GenericSearchDropdown';
import {useNavigate} from '@tanstack/react-router';
import {Route} from '@/routes/_app/_dish/AddrawMaterailCat';

const OrderPageDropdown = () => {
  const [selected, setSelected] = useState('');
  const navigate = useNavigate();

  const handleChange = (value: string) => {
    setSelected(value);

    if (value === 'AddNew') {
      navigate({to: Route.addRawMaterialCat});
    }
  };

  return (
    <div className="space-y-6">
      <GenericSearchDropdown
        name="rawMaterial"
        label="Order Page"
        options={[
          {value: 'Other', label: 'Other'},
          {value: 'AddNew', label: 'Add new'},
        ]}
        onChange={handleChange}
      />
    </div>
  );
};

export default OrderPageDropdown;
