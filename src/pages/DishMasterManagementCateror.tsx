import DishMasterCateror from '@/components/Dish/DishMasterCateror';
import UpdateDishMasterCateror from '@/components/Dish/UpdateDishMasterCateror';
// import DisplayDish from '@/components/Dish/DisplayDish';
import React from 'react';

const DishMasterManagementCateror: React.FC = () => {
  const [selectedTab, setSelectedTab] = React.useState('CreateNew');
  return (
    <div className="mx-8">
      <h1 className="mb-4 text-2xl font-bold">Add New Dish </h1>
      <nav className="text-gray-500 border-gray-200 dark:text-gray-400 dark:border-gray-700 border-b text-center text-sm font-medium">
        <ul className="-mb-px flex flex-wrap">
          <li className="me-2">
            <button
              className={`hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 inline-block rounded-t-lg border-b-2 p-4 ${
                selectedTab === 'CreateNew'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                  : 'border-b-2 border-transparent'
              }`}
              onClick={() => setSelectedTab('CreateNew')}
            >
              Create New{' '}
            </button>
          </li>
          <li className="me-2">
            <button
              className={`hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 inline-block rounded-t-lg border-b-2 p-4 ${
                selectedTab === 'Displayexisting'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                  : 'border-b-2 border-transparent'
              }`}
              onClick={() => setSelectedTab('Displayexisting')}
            >
              Display Existing
            </button>
          </li>
        </ul>
      </nav>
      <div className="mt-6">
        {selectedTab === 'CreateNew' && <DishMasterCateror />}
        {selectedTab === 'Displayexisting' && <UpdateDishMasterCateror />}
        <div className="col-span-8"></div>
      </div>
    </div>
  );
};

export default DishMasterManagementCateror;
