import React, {useState} from 'react';
import RawMaterialCategoryCateror from '@/components/Dish/RawMaterialCategoryCateror';
import DisplayRawMaterialCategoryCat from '@/components/Dish/DisplayRawMaterialCategoryCat';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useAuthContext} from '@/context/AuthContext';

const RawMaterialCategoryCat: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const {user} = useAuthContext();
  const role = user?.role;
  const restriction = user?.employeeRestriction?.rawMaterialCategoryPage;

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
                Add Raw Material Category
              </GenericButton>
            </div>
          )}
        </div>
      )}

      {/* Page Content */}
      {showForm ? (
        <RawMaterialCategoryCateror />
      ) : (
        <DisplayRawMaterialCategoryCat />
      )}
    </div>
  );
};

export default RawMaterialCategoryCat;
