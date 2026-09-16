import React, {useState} from 'react';
import CreateCounter from './CreateCounter';
import CounterDisplay from './CounterDisplay';
import {useAuthContext} from '@/context/AuthContext';
import {Loader} from '../Loader/Loader';

const CounterManagement: React.FC = () => {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editId, setEditId] = useState<string | null>(null);
  const {user} = useAuthContext();

  // Show loader while user data is loading
  if (!user) {
    return <Loader />;
  }

  const restriction = user?.employeeRestriction?.counterpage;
  const role = user?.role;

  console.log('employeeRestriction', user?.employeeRestriction);
  console.log('counter restriction', restriction);

  // Check if user has edit permission
  const hasEditPermission = role === 'CATEROR' || restriction === 'EDIT';

  // When clicking ADD NEW
  const handleAddNew = () => {
    setEditId(null);
    setView('create');
  };

  // When clicking EDIT in table
  const handleEdit = (id: string) => {
    setEditId(id);
    setView('edit');
  };

  // Return back to list after save or cancel
  const handleBackToList = () => {
    setView('list');
    setEditId(null);
  };

  return (
    <div className="mx-2">
      {/* ---------------- LIST VIEW ---------------- */}
      {view === 'list' && (
        <>
          {/* Only show "Add New" button if user has permission */}
          {(role === 'CATEROR' || restriction === 'EDIT') && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={handleAddNew}
                className="rounded bg-blue-800 px-4 py-1.5 text-white"
              >
                Add New
              </button>
            </div>
          )}

          {/* Always show the table, but pass permission to control actions */}
          <CounterDisplay onEdit={handleEdit} canEdit={hasEditPermission} />
        </>
      )}

      {/* ---------------- CREATE VIEW ---------------- */}
      {view === 'create' && (
        <CreateCounter
          mode="create"
          onBack={handleBackToList}
          canEdit={hasEditPermission}
        />
      )}

      {/* ---------------- EDIT VIEW ---------------- */}
      {view === 'edit' && (
        <CreateCounter
          mode="edit"
          counterId={editId}
          onBack={handleBackToList}
          canEdit={hasEditPermission}
        />
      )}
    </div>
  );
};

export default CounterManagement;
