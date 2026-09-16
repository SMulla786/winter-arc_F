import React, {useState, useEffect} from 'react';
import CreateClient from '@/components/client/CreateClient';
import DisplayClient from '@/components/client/DisplayClient';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useAuthContext} from '@/context/AuthContext';
import {useLocation} from '@tanstack/react-router';

const ClientManagement: React.FC = () => {
  const location = useLocation();

  // FIX: Initialize based on location state
  const [showForm, setShowForm] = useState(
    location.state?.showCreateForm || false,
  );

  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.clientPage;
  const role = user?.role;

  // FIX: Listen for location state changes
  useEffect(() => {
    if (location.state?.showCreateForm) {
      setShowForm(true);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // FIX: Also check for prefilled name from EventModal
  useEffect(() => {
    if (location.state?.clientSearchText) {
      // The name will be passed to CreateClient via prefilledName prop
      console.log('Received search text:', location.state.clientSearchText);
    }
  }, [location.state?.clientSearchText]);

  return (
    <div className="mx-auto">
      {/* Action Buttons */}
      {(role === 'CATEROR' || restriction === 'EDIT') && (
        <div className="mb-3 flex items-center justify-between">
          {showForm ? (
            // When form is shown, show back button on left
            <button
              type="button"
              className="text-left text-xl font-bold"
              onClick={() => setShowForm(false)}
            >
              ← Back
            </button>
          ) : (
            // When display page is shown, show add button on right side only
            <div className="flex w-full justify-end">
              <GenericButton onClick={() => setShowForm(true)}>
                Add Client
              </GenericButton>
            </div>
          )}
        </div>
      )}

      {/* Page Content */}
      {showForm ? (
        <CreateClient
          setShowForm={setShowForm}
          prefilledName={location.state?.clientSearchText} // PASS THE PREFILLED NAME
        />
      ) : (
        <DisplayClient />
      )}
    </div>
  );
};

export default ClientManagement;
