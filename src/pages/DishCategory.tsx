import React from 'react';
import DishCategory from '@/components/Dish/DishCategory';
import DisplayDishCategory from '@/components/Dish/DisplayDishCategory';

const DishCategoryPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <DishCategory />
        </div>
        <div className="col-span-8">
          <DisplayDishCategory />
        </div>
      </div>
    </div>
  );
};

export default DishCategoryPage;
