import DisplayIncomeExpenditureHead from '@/components/IncomeExpenditure/DisplayIncomeExpenditureHead';
import IncomeExpenditureHead from '@/components/IncomeExpenditure/IncomeExpenditureHead';
import React from 'react';

const IncomeHeadManagement: React.FC = () => {
  return (
    <div className="mx-auto max-w-270">
      <div className="grid grid-cols-8 gap-8">
        <div className="col-span-8">
          <IncomeExpenditureHead />
        </div>
        <div className="col-span-8">
          <DisplayIncomeExpenditureHead />
        </div>
      </div>
    </div>
  );
};
export default IncomeHeadManagement;
