import React from 'react';
import RawMaterialCategory from '@/components/Dish/RawMaterialCategory';
import DisplayRawMaterialCategory from '@/components/Dish/DisplayRawMaterialCategory';

const RawMaterialCategoryPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <RawMaterialCategory />
        </div>
        <div className="col-span-8">
          <DisplayRawMaterialCategory />
        </div>
      </div>
    </div>
  );
};

export default RawMaterialCategoryPage;
