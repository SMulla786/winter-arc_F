import React, {useState} from 'react';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useAuthContext} from '@/context/AuthContext';
import UtensilCategoryCat from '@/components/CaterorUtensils/UtensilCategoryCat';
import DisplayUtensilCategoryCat from '@/components/CaterorUtensils/DisplayUtensilCategoryCat';
import CutlerymasterCat from './CutlerymasterCat';
import CutelryMasterDisplay from './CutelryMasterDisplay';

const CutleryCatManagment: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.utensilCategoryPage;
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
                Add Cutlery Category
              </GenericButton>
            </div>
          )}
        </div>
      )}

      {/* Page Content */}
      {showForm ? <CutlerymasterCat /> : <CutelryMasterDisplay />}
    </div>
  );
};

export default CutleryCatManagment;
