import React, {useState} from 'react';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useAuthContext} from '@/context/AuthContext';
import Cutlery from './Cutlery';
import DisplayCutlery from './DisplayCutlery';

const CutleryManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const {user} = useAuthContext();
  const role = user?.role;
  const restriction = user?.employeeRestriction?.cutlerypage;

  return (
    <div className="mx-auto">
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
              Add Cutlery
            </GenericButton>
          )}
        </div>
      )}

      {showForm ? <Cutlery /> : <DisplayCutlery />}
    </div>
  );
};

export default CutleryManagement;
