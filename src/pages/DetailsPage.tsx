import React, {useState} from 'react';
import DisplayDetails from '@/components/CaterorSetting/DisplayDetails';
import Details from '@/components/CaterorSetting/Details';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useAuthContext} from '@/context/AuthContext';

const DetailsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.detailsPage;
  const role = user?.role;

  return (
    <div className="mx-auto">
      {/* Action Buttons */}
      {(role === 'CATEROR' || restriction === 'EDIT') && (
        <div className="mb-3 flex items-center justify-end">
          {showForm ? (
            <div className="w-full">
              <button
                className="text-left text-xl font-bold"
                onClick={() => setShowForm(false)}
              >
                ← Back
              </button>
            </div>
          ) : (
            <div className="flex w-full justify-end">
              <GenericButton onClick={() => setShowForm(true)}>
                Add Details
              </GenericButton>
            </div>
          )}
        </div>
      )}

      {/* Page Content */}
      {showForm ? <Details /> : <DisplayDetails />}
    </div>
  );
};

export default DetailsPage;
