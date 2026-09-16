import React, {useState} from 'react';
import {FiTag, FiUsers} from 'react-icons/fi';
import Additionalvendors from '@/components/FoodVender/Additionalvendors';
import AdditionalvendorCat from '@/components/FoodVender/AdditionalvendorCat';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import VendorRole from '@/components/CaterorSetting/VendorRole';
import VendorPage from './VendorPage';

const MenPowerManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'addrole' | 'addvendor'>(
    'addrole',
  );

  return (
    <div className="rounded-lg p-6">
      {/* Header with Buttons on Right */}
      <div className="mb-6 flex items-center">
        {/* Buttons on Right Side */}
        <div className="ml-auto flex gap-3">
          <GenericButton
            onClick={() => setActiveTab('addrole')}
            variant={activeTab === 'addrole' ? 'primary' : 'outline'}
            className="flex items-center gap-2"
          >
            Add Role
          </GenericButton>

          <GenericButton
            onClick={() => setActiveTab('addvendor')}
            variant={activeTab === 'addvendor' ? 'primary' : 'outline'}
            className="flex items-center gap-2"
          >
            Add Vendors
          </GenericButton>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'addrole' && <VendorRole />}
        {activeTab === 'addvendor' && <VendorPage />}
      </div>
    </div>
  );
};

export default MenPowerManagement;
