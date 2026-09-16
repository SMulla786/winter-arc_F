import Caterer from '@/components/Caterer/Cateror';
import DisplayCateror from '@/components/Caterer/DisplayCateror';
import React from 'react';

const CatererManagement: React.FC = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <Caterer />
        </div>
        <div className="col-span-8">
          <DisplayCateror />
        </div>
      </div>
    </div>
  );
};

export default CatererManagement;
