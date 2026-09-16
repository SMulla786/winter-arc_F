import React, {useState} from 'react';
import VendorRole from '@/components/CaterorSetting/VendorRole';
import VendorPage from './VendorPage';
import GenericButton from '@/components/Forms/Buttons/GenericButton';

type ManPowerTab = 'vendors' | 'roles';

const VendorManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ManPowerTab>('vendors');

  const getTabClasses = (isActive: boolean) => {
    const base =
      'transition-all duration-300 ease-in-out whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium cursor-pointer select-none';

    if (isActive) {
      return `${base} border-blue-600 bg-blue-100 text-blue-600
        dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-400`;
    }

    return `${base} border-transparent text-gray-500 hover:border-blue-300 hover:bg-blue-50
      dark:text-gray-400 dark:hover:border-blue-600 dark:hover:bg-blue-800/50`;
  };

  return (
    <div className="w-full">
      {/* TABS */}
      <div className="flex w-full items-center justify-between border-b border-stroke dark:border-strokedark">
        {/* Tabs */}
        <div className="scrollbar-hide flex gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('vendors')}
            className={getTabClasses(activeTab === 'vendors')}
          >
            Vendors
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={getTabClasses(activeTab === 'roles')}
          >
            Vendor Roles
          </button>
        </div>

        {/* Action Button */}
        <div className="pr-2">
          {activeTab === 'vendors' && (
            <GenericButton
              onClick={() => window.dispatchEvent(new Event('ADD_VENDOR'))}
            >
              Add Vendor
            </GenericButton>
          )}

          {activeTab === 'roles' && (
            <GenericButton
              onClick={() => window.dispatchEvent(new Event('ADD_ROLE'))}
            >
              Add Role
            </GenericButton>
          )}
        </div>
      </div>

      {/* CONTENT — HARD SWITCH */}
      <div className="mt-4">
        {activeTab === 'vendors' ? (
          <VendorPage key="vendors" />
        ) : (
          <VendorRole key="roles" />
        )}
      </div>
    </div>
  );
};

export default VendorManagementPage;
