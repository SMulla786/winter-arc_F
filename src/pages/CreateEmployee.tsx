import React, {useState} from 'react';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useAuthContext} from '@/context/AuthContext';
import CreateEmployee from '@/components/Employeepanel/CreateEmploye'; // Your Expense Form component
import DisplayEmployee from '@/components/Employeepanel/DisplayEmployee'; // Your table display component

const CreateEmployeManagment: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.employeePage;
  const role = user?.role;

  return (
    <div className="mx-auto">
      {/* Action Buttons */}
      {(role === 'CATEROR' || restriction === 'EDIT') && (
        <div className="mb-3 flex items-center justify-end">
          {showForm ? (
            <div className="w-full">
              <button
                className="text-center text-xl font-bold"
                onClick={() => setShowForm(false)}
              >
                ← Back
              </button>
            </div>
          ) : (
            <GenericButton onClick={() => setShowForm(true)}>
              Add Employee
            </GenericButton>
          )}
        </div>
      )}

      {/* Page Content */}
      {showForm ? <CreateEmployee /> : <DisplayEmployee />}
    </div>
  );
};

export default CreateEmployeManagment;
