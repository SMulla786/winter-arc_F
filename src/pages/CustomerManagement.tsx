import CustomerList from '@/components/Customer/CustomerList';
import React from 'react';

const CustomerManagement: React.FC = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <CustomerList />
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement;
