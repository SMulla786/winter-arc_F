import Priority from '@/components/Priority/Priority';
import React from 'react';

const PriorityManagement: React.FC = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <Priority />
        </div>
      </div>
    </div>
  );
};

export default PriorityManagement;
