/*eslint-disable*/
import React, {useEffect, useState} from 'react';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericTable, {Column} from '../Forms/Table/GenericTable';

import {useAuthContext} from '@/context/AuthContext';
import {useNavigate} from '@tanstack/react-router';

import FoodVendorForm from './FoodVendorForm';
import LabourVendorForm from './LabourVendorForm';

import {useDeleteFoodVendor, useGetAllFoodVendors} from './foodvendorapi';
import MaharajManagement from '@/pages/MaharajManagement';
import ClubVendorForm from './ClubVendorForm';
import {useLocation} from '@tanstack/react-router';

type VendorTab = 'food' | 'labour' | 'inhouse' | 'club';

type FoodVendor = {
  id?: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  rawMaterialCalculation?: boolean;
  dailySalary?: number;
  transport?: number;
  isClubVendor?: boolean | null;
  packages?: any[];
  foodvendorPackages?: any[]; // Add this to match the API response
};

const FoodVendorPage: React.FC = () => {
  const navigate = useNavigate();
  const {user} = useAuthContext();

  const role = user?.role;
  const restriction = user?.employeeRestriction?.rawMaterialPage;
  const canEdit = role === 'CATEROR' || restriction === 'EDIT';

  const [activeTab, setActiveTab] = useState<VendorTab>('food');
  const [formState, setFormState] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<FoodVendor | null>(null);

  const {mutateAsync: deleteFoodVendor} = useDeleteFoodVendor();
  const {data, isSuccess, isFetching} = useGetAllFoodVendors();

  const allFoodVendors: FoodVendor[] = Array.isArray(data) ? data : [];

  const foodVendors = allFoodVendors.filter(
    (v) => v.rawMaterialCalculation === true && v.isClubVendor !== true,
  );

  const labourVendors = allFoodVendors.filter(
    (v) => v.rawMaterialCalculation === false,
  );

  const clubVendors = allFoodVendors.filter((v) => v.isClubVendor === true);

  const location = useLocation();

  useEffect(() => {
    const state = location.state as any;
    if (state?.activeTab) {
      setActiveTab(state.activeTab as VendorTab);

      navigate({to: '/foodvendor', replace: true, state: {}});
    }
  }, [location.state, navigate]);

  const currentVendors =
    activeTab === 'food'
      ? foodVendors
      : activeTab === 'labour'
        ? labourVendors
        : activeTab === 'club'
          ? clubVendors
          : [];

  const openForm = (vendor?: FoodVendor) => {
    setEditingVendor(vendor || null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingVendor(null);
  };

  const handleDelete = (row: {id: string}) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      deleteFoodVendor(row.id);
    }
  };

  const handleEdit = (row: FoodVendor) => {
    console.log('Editing vendor:', row);

    // Pass the entire vendor object, not just packages
    const vendorWithBasicInfo = {
      ...row, // This includes name, phone, address, email
      id: row.id,
      // The packages will be fetched by useGetClubVendor hook
    };

    // Determine the type based on vendor properties
    if (row.isClubVendor === true) {
      setActiveTab('club');
      setEditingVendor(vendorWithBasicInfo);
    } else if (typeof row.rawMaterialCalculation === 'boolean') {
      const type: VendorTab = row.rawMaterialCalculation ? 'food' : 'labour';
      setActiveTab(type);
      setEditingVendor(vendorWithBasicInfo);
    }

    setShowForm(true);
  };

  // const handleView = (row: FoodVendor) => {
  //   navigate({to: `/foodvendorhistoryshow/${row.id}`});
  // };

  // CORRECTED: Update the columns for club vendors to show better package information
  const getColumns = (): Column<FoodVendor>[] => {
    const baseColumns: Column<FoodVendor>[] = [
      {
        header: 'Name',
        accessor: 'name',
        sortable: true,
        render: (row) => (
          <span
            className="cursor-pointer text-blue-600 hover:underline"
            onClick={() =>
              canEdit && navigate({to: `/foodvendorhistory/${row.id}`})
            }
          >
            {row.name}
          </span>
        ),
      },
      {header: 'Address', accessor: 'address'},
      {header: 'Phone', accessor: 'phone'},
      {header: 'Email', accessor: 'email'},
    ];

    return baseColumns;
  };

  // Add a loading state specifically for club vendors
  if (isFetching) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading vendor data...
          </p>
        </div>
      </div>
    );
  }
  const columns = getColumns();

  const getTabClasses = (
    color: 'blue' | 'green' | 'purple',
    isActive: boolean,
  ) => {
    const base =
      'transition-all duration-300 ease-in-out whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium cursor-pointer select-none';

    if (isActive) {
      return `${base} border-${color}-600 bg-${color}-100 text-${color}-600 shadow-sm
        dark:border-${color}-500 dark:bg-${color}-900/30 dark:text-${color}-400`;
    }

    return `${base} border-transparent text-gray-500 hover:border-${color}-300 hover:bg-${color}-50
      dark:text-gray-400 dark:hover:border-${color}-600 dark:hover:bg-${color}-800/50`;
  };

  if (isFetching) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      {canEdit && !showForm && (
        <div className="flex items-center justify-between">
          <h1 className="px-2 text-xl font-bold">Vendor Management</h1>

          {activeTab === 'food' && (
            <GenericButton onClick={() => openForm()}>
              Add Food Vendor
            </GenericButton>
          )}

          {activeTab === 'labour' && (
            <GenericButton onClick={() => openForm()}>
              Add Labour Vendor
            </GenericButton>
          )}

          {activeTab === 'inhouse' && (
            <GenericButton
              onClick={() => setFormState(true)}
              className="btn-outline"
            >
              Add Inhouse Vendor
            </GenericButton>
          )}

          {activeTab === 'club' && (
            <GenericButton onClick={() => openForm()}>
              Add Package Vendor
            </GenericButton>
          )}
        </div>
      )}

      {/* TABS (EventManagement-style) */}
      <div className="flex w-full items-center border-b border-stroke dark:border-strokedark">
        <div className="scrollbar-hide w-full flex-1 overflow-x-auto">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('food')}
              className={getTabClasses('blue', activeTab === 'food')}
            >
              Food Vendors
            </button>

            <button
              onClick={() => setActiveTab('labour')}
              className={getTabClasses('green', activeTab === 'labour')}
            >
              Food Labour
            </button>

            <button
              onClick={() => setActiveTab('inhouse')}
              className={getTabClasses('purple', activeTab === 'inhouse')}
            >
              Inhouse Maharaj
            </button>

            <button
              onClick={() => setActiveTab('club')}
              className={getTabClasses('purple', activeTab === 'club')}
            >
              Package Vendors
            </button>
          </div>
        </div>
      </div>
      {/* BACK */}
      {showForm && (
        <button
          onClick={closeForm}
          className="btn btn-ghost text-base font-bold"
        >
          ← Back to List
        </button>
      )}
      {/* CONTENT */}
      {activeTab === 'inhouse' ? (
        <MaharajManagement
          formState={activeTab === 'inhouse' ? formState : false}
        />
      ) : (
        !showForm && (
          <GenericTable
            title={
              activeTab === 'food'
                ? 'Food Vendors'
                : activeTab === 'labour'
                  ? 'Labour Vendors'
                  : 'Package Vendors'
            }
            columns={columns}
            data={isSuccess ? currentVendors : []}
            itemsPerPage={15}
            action={canEdit}
            onDelete={handleDelete}
            onEdit={handleEdit}
            // onView={handleView}
          />
        )
      )}

      {/* FORMS */}
      {showForm && canEdit && activeTab === 'food' && (
        <FoodVendorForm
          vendor={editingVendor}
          onSuccess={closeForm}
          onCancel={closeForm}
        />
      )}

      {showForm && canEdit && activeTab === 'labour' && (
        <LabourVendorForm
          vendor={editingVendor}
          onSuccess={closeForm}
          onCancel={closeForm}
        />
      )}

      {showForm && canEdit && activeTab === 'club' && (
        <ClubVendorForm
          vendor={editingVendor}
          onSuccess={closeForm}
          onCancel={closeForm}
        />
      )}
    </div>
  );
};

export default FoodVendorPage;
