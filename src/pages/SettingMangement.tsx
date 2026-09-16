import Setting from '@/components/Settings/Setting';
import React from 'react';

const SettingManagement: React.FC = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <Setting />
        </div>
      </div>
    </div>
  );
};

export default SettingManagement;
