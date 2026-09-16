import {useState} from 'react';
import {useNavigate} from '@tanstack/react-router';
import DisplayUtensilsCat from '@/components/CaterorUtensils/DisplayUtensilsCat';
import UtensilCat from '@/components/CaterorUtensils/UtensilCat';
import {useAuthContext} from '@/context/AuthContext';
import GenericButton from '@/components/Forms/Buttons/GenericButton';

const UtensilManagementCateror: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.utensilPage;
  const role = user?.role;

  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      {(role === 'CATEROR' || restriction === 'EDIT') && (
        <div className="mb-3 flex items-center justify-between">
          {/* Back Button (left side) */}
          <div>
            {showForm && (
              <button
                className="text-xl font-bold"
                onClick={() => setShowForm(false)}
              >
                ← Back
              </button>
            )}
          </div>

          {/* Right side buttons */}
          <div className="flex gap-2">
            {/* Add Utensil */}
            {!showForm && (
              <GenericButton onClick={() => setShowForm(true)}>
                Add Utensil
              </GenericButton>
            )}
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (role === 'CATEROR' || restriction === 'EDIT') && (
        <div className="col-span-8">
          <UtensilCat />
        </div>
      )}

      {/* Table / Display */}
      {!showForm && (
        <div className="col-span-8">
          <DisplayUtensilsCat />
        </div>
      )}
    </div>
  );
};

export default UtensilManagementCateror;
