import React, {useState} from 'react';
import AddRawMaterialCat from '@/components/Dish/AddRawMaterialCat';
import DisplayRawMaterialCateror from '@/components/Dish/DisplayRawMaterialCateror';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useAuthContext} from '@/context/AuthContext';

const AddRawMaterialCateror: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.rawMaterialPage;
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
                Add Raw Material
              </GenericButton>
            </div>
          )}
        </div>
      )}

      {/* Page Content */}
      {showForm ? <AddRawMaterialCat /> : <DisplayRawMaterialCateror />}
    </div>
  );
};

export default AddRawMaterialCateror;
