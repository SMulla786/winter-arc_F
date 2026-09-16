import React, {useState} from 'react';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import IncomeExpenditureCat from '@/components/IncomeExpenditure/IncomeExpenditureCat';
import DisplayIncomeExpenditureCat from '@/components/IncomeExpenditure/DisplayIncomeExpenditureCat';
import {useAuthContext} from '@/context/AuthContext';

const IncomeExpenditureManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.incomeExpenditurePage;
  const role = user?.role;

  return (
    <div className="mx-auto">
      {/* Page Content */}
      {showForm ? (
        <div>
          <div className="mb-3 flex items-center">
            <button
              className="text-center text-xl font-bold"
              onClick={() => setShowForm(false)}
            >
              ← Back
            </button>
          </div>
          <IncomeExpenditureCat />
        </div>
      ) : (
        <DisplayIncomeExpenditureCat onAddClick={() => setShowForm(true)} />
      )}
    </div>
  );
};

export default IncomeExpenditureManagement;
