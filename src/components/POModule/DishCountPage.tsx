import React, {useState} from 'react';
import TotalDishCountList from './TotalDishCountList';
import TotalRawMAterialOrder from '@/components/POModule/TotalRawMAterialOrder';
import PO from './PO';
import Custommodule from './Custommodule';
import RawListEditWrapper from './RawListEditWrapper';
import AllPomoduleHistory from './AllPomoduleHistory';
import {useAuthContext} from '@/context/AuthContext';

const DishCountPage = () => {
  const [activeComponent, setActiveComponent] = useState('TotalDishCountList');
  const [innerComponent, setInnerComponent] = useState('list');
  const [listEditId, setListEditId] = useState('');

  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.dishCountandRMOrder;
  const role = user?.role;

  // Check if user has access to the module
  const hasAccess =
    role === 'CATEROR' || restriction === 'EDIT' || restriction === 'VIEW';

  // If no access at all, show message
  if (!hasAccess) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-gray-700 dark:text-gray-300 text-xl font-semibold">
          Access Denied
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          You don't have permission to access this module.
        </p>
      </div>
    );
  }

  return (
    <div className="border-b border-[#eee] dark:border-strokedark">
      {/* TABS - Updated Design */}
      <div className="border-gray-200 dark:border-gray-700 border-b md:mx-7">
        <nav className="flex space-x-8" aria-label="Tabs">
          {/* Dish Count tab - Only show if user has access */}
          {(role === 'CATEROR' ||
            restriction === 'EDIT' ||
            restriction === 'VIEW') && (
            <button
              className={`px-1 py-4 text-sm font-medium transition-colors duration-200 ${
                activeComponent === 'TotalDishCountList'
                  ? 'border-b-2 border-blue-600 bg-blue-100 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveComponent('TotalDishCountList')}
            >
              Dish Count & Raw Material Order
            </button>
          )}

          {/* Custom PO tab - Only show if user has edit access (CATEROR or EDIT) */}
          {(role === 'CATEROR' || restriction === 'EDIT') && (
            <button
              className={`px-1 py-4 text-sm font-medium transition-colors duration-200 ${
                activeComponent === 'PO'
                  ? 'border-b-2 border-blue-600 bg-blue-100 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveComponent('PO')}
            >
              Custom PO
            </button>
          )}

          {/* History tab - Show if user has any access (VIEW, EDIT, or CATEROR) */}
          {(role === 'CATEROR' || restriction === 'EDIT') && (
            <button
              className={`px-1 py-4 text-sm font-medium transition-colors duration-200 ${
                activeComponent === 'history'
                  ? 'border-b-2 border-blue-600 bg-blue-100 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveComponent('history')}
            >
              History
            </button>
          )}
        </nav>
      </div>

      {/* TAB CONTENT */}
      <div className="mt-0">
        {/* 1️⃣ Dish Count tab */}
        {activeComponent === 'TotalDishCountList' && (
          <>
            {innerComponent === 'list' && (
              <TotalDishCountList
                setInnerComponent={setInnerComponent}
                setListEditId={setListEditId}
                // Pass restriction to child component for further control
              />
            )}

            {innerComponent === 'rawListWrapper' && (
              <RawListEditWrapper
                listId={listEditId}
                // hasEditAccess={hasEditAccess}
              />
            )}
          </>
        )}

        {/* Only show Custom PO if user has edit access */}
        {activeComponent === 'PO' &&
          (role === 'CATEROR' || restriction === 'EDIT') && <Custommodule />}

        {/* Only show History if user has any access */}
        {activeComponent === 'history' &&
          (role === 'CATEROR' || restriction === 'EDIT') && (
            <AllPomoduleHistory />
          )}
      </div>
    </div>
  );
};

export default DishCountPage;
