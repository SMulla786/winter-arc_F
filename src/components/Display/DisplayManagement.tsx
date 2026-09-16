import React, {useState} from 'react';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useAuthContext} from '@/context/AuthContext';
import DisplayForm from './DisplayForm';
import DisplayDisplay from './DisplayDisplay';

const DisplayManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const {user} = useAuthContext();
  const role = user?.role;

  return (
    <div className="mx-auto">
      {role === 'CATEROR' && (
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
              Add Display
            </GenericButton>
          )}
        </div>
      )}

      {showForm ? <DisplayForm /> : <DisplayDisplay />}
    </div>
  );
};

export default DisplayManagement;
