import React, {useEffect, useState} from 'react';
import DisplayMaharaj from '@/components/Maharaj/DisplayMaharaj';
import Maharaj from '@/components/Maharaj/Maharaj';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useAuthContext} from '@/context/AuthContext';

interface MaharajManagementProps {
  formState: boolean;
  // other props...
}
const MaharajManagement: React.FC<MaharajManagementProps> = ({
  formState,
  ...rest
}) => {
  const [showForm, setShowForm] = useState(false);
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.maharajPage;
  const role = user?.role;

  useEffect(() => {
    setShowForm(formState);
  }, [formState]);

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
            // <GenericButton onClick={() => setShowForm(true)}>
            //   Add Maharaj
            // </GenericButton>
            <></>
          )}
        </div>
      )}

      {/* Page Content */}
      {showForm ? <Maharaj /> : <DisplayMaharaj />}
    </div>
  );
};

export default MaharajManagement;
