import AddLanguage from '@/components/Language/AddLanguage';
import DisplayLanguage from '@/components/Language/DisplayLanguage';
import React from 'react';

const LanguageManagement: React.FC = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <AddLanguage />
        </div>
        <div className="col-span-8">
          <DisplayLanguage />
        </div>
      </div>
    </div>
  );
};

export default LanguageManagement;
