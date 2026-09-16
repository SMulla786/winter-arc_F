import PackageCreate from '@/components/Package/PackageCreate';
import React from 'react';

const CreatePackage = () => {
  return (
    <div className="mx-auto max-w-full">
      {' '}
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <PackageCreate />
        </div>
      </div>
    </div>
  );
};

export default CreatePackage;
