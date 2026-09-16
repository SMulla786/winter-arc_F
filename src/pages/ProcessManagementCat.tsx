import React, {useState} from 'react';
import DisplayProcessCat from '@/components/Process/DisplayProcessCat';
import ProcessCat from '@/components/Process/ProcessCat';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useAuthContext} from '@/context/AuthContext';

const ProcessManagementCat: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.rawMaterialProcessPage;
  const role = user?.role;

  return (
    <div className="mx-auto">
      {/* Action Buttons */}
      {(role === 'CATEROR' || restriction === 'EDIT') && (
        <div className="mb-3 flex items-center justify-between">
          {showForm ? (
            <button
              className="text-left text-xl font-bold"
              onClick={() => setShowForm(false)}
            >
              ← Back
            </button>
          ) : (
            <div className="flex w-full justify-end">
              <GenericButton onClick={() => setShowForm(true)}>
                Add Process
              </GenericButton>
            </div>
          )}
        </div>
      )}

      {/* Page Content */}
      {showForm ? <ProcessCat /> : <DisplayProcessCat />}
    </div>
  );
};

export default ProcessManagementCat;
