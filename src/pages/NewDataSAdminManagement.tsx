import NewDataSuperAdmin from '@/components/NewData/NewDataSuperAdmin';
import React from 'react';

const NewDataSAdminManagement: React.FC = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <NewDataSuperAdmin />
        </div>
      </div>
    </div>
  );
};

export default NewDataSAdminManagement;
