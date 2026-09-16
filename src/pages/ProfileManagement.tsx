import React from 'react';
import Breadcrumb from '@/components/Breadcrumbs';
import {Profile} from '@/components/Profile';

const ProfileManagement: React.FC = () => {
  return (
    <div className="mx-auto">
      <Breadcrumb />
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <Profile />
        </div>
      </div>
    </div>
  );
};

export default ProfileManagement;
