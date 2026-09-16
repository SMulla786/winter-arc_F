import React, {useState} from 'react';
import DisplayDisposalCategoryCat from '@/components/CaterorDisposal/DisplayDisposalCategoryCat';
import DisposalCategoryCat from '@/components/CaterorDisposal/DisposalCategoryCat';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useAuthContext} from '@/context/AuthContext';

const DisposalCategoryManagementCat: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.disposalCategoryPage;
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
                Add Disposal Category
              </GenericButton>
            </div>
          )}
        </div>
      )}

      {/* Page Content */}
      {showForm ? <DisposalCategoryCat /> : <DisplayDisposalCategoryCat />}
    </div>
  );
};

export default DisposalCategoryManagementCat;
