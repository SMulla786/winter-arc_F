import React, {useState} from 'react';
import PackageCreate from '@/components/Package/PackageCreate';
import DisplayPackage from '@/pages/DisplayPackage';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useAuthContext} from '@/context/AuthContext';

const PackageManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.packagePage;
  const role = user?.role;

  const handlePackageCreated = () => {
    setShowForm(false); // This will navigate back to DisplayPackage
  };

  return (
    <div className="mx-auto">
      {/* Action Buttons */}
      {(role === 'CATEROR' || restriction === 'EDIT') && (
        <div className="flex items-center justify-between px-4 py-2">
          {showForm ? (
            <button
              className="text-base font-bold"
              onClick={() => setShowForm(false)}
            >
              ← Back to Packages
            </button>
          ) : (
            <div className="flex w-full justify-end">
              <GenericButton onClick={() => setShowForm(true)}>
                Add Package
              </GenericButton>
            </div>
          )}
        </div>
      )}

      {/* Page Content */}
      {showForm ? (
        <PackageCreate onSuccess={handlePackageCreated} />
      ) : (
        <DisplayPackage />
      )}
    </div>
  );
};

export default PackageManagement;
