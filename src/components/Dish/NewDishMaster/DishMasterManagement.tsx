import React, {useState} from 'react';
import MultipleDishAdd from './MultipleDishAdd';
import NewDishMaster from './NewDishMaster';
import {useAuthContext} from '@/context/AuthContext';
// import SingleDishAdd from './SingleDishAdd'; // Uncomment when you create this

const DishMasterManagement = () => {
  const {user} = useAuthContext();
  const isFreePlan = user?.plan === 'BASIC';

  return (
    <div>
      {' '}
      <div className="flex items-center justify-between">
        <h2 className="text-gray-900 text-xl font-bold dark:text-white">
          Create Dish
        </h2>
      </div>
      <div className="rounded bg-white p-4 shadow dark:bg-black">
        {isFreePlan ? <NewDishMaster /> : <MultipleDishAdd />}
      </div>
    </div>
  );
};

export default DishMasterManagement;
