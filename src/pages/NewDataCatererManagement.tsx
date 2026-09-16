import NewDataCaterer from '@/components/NewData/NewDataCaterer';
import React from 'react';

const NewDataCatererManagement: React.FC = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <NewDataCaterer />
        </div>
      </div>
    </div>
  );
};

export default NewDataCatererManagement;
