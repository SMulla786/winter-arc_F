import {useState} from 'react';
import DisplayDisposalCat from '@/components/CaterorDisposal/DisplayDisposalCat';
import DisposalCateror from '@/components/CaterorDisposal/DisposalCateror';
import {useAuthContext} from '@/context/AuthContext';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useNavigate} from '@tanstack/react-router';

const DisposalManagementCat: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.disposalPage;
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

          {/* Add Button (right side) */}
          <div>
            {!showForm && (
              <GenericButton onClick={() => setShowForm(true)}>
                Add Disposal
              </GenericButton>
            )}
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (role === 'CATEROR' || restriction === 'EDIT') && (
        <div className="col-span-8">
          <DisposalCateror />
        </div>
      )}

      {/* Table / Display */}
      {!showForm && (
        <div className="col-span-8">
          <DisplayDisposalCat />
        </div>
      )}
    </div>
  );
};

export default DisposalManagementCat;
