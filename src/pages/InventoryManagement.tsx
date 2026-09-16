import Inventory from '@/components/Inventory/Inventory';
import React from 'react';

const InventoryManagement: React.FC = () => {
  return (
    <div className="">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <Inventory />
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
