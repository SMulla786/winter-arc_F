import ExtraDish from '@/components/Package/ExtraDish';
import React from 'react';

const ExtraDishes = () => {
  return (
    <div className="mx-auto max-w-full">
      /{' '}
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <ExtraDish />
        </div>
      </div>
    </div>
  );
};

export default ExtraDishes;
