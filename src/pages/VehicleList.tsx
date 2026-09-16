/* eslint-disable */
import AddVehicle from '@/components/EventSummary/AddVehicle';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {useAuthContext} from '@/context/AuthContext';
import {Loader} from '@/components/Loader/Loader';
import {
  useDeleteVehicle,
  useGetVehicles,
} from '@/lib/react-query/queriesAndMutations/cateror/eventsummary';
import React, {useState} from 'react';
import {FaCar} from 'react-icons/fa6';

const VehicleList = () => {
  const {user} = useAuthContext();
  const {data: vehiclesData} = useGetVehicles();
  const {mutate: deleteVehicle} = useDeleteVehicle();
  const [showUpdate, setShowUpdate] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);

  // Show loader while user data is loading
  if (!user) {
    return <Loader />;
  }

  const restriction = user?.employeeRestriction?.vehiclepage; // Assuming 'vehiclepage' is the restriction key
  const role = user?.role;

  console.log('employeeRestriction', user?.employeeRestriction);
  console.log('vehicle restriction', restriction);

  // Check if user has edit permission
  const hasEditPermission = role === 'CATEROR' || restriction === 'EDIT';

  const handleEdit = (vehicle: any) => {
    if (hasEditPermission) {
      setShowUpdate(true);
      setCurrentVehicle(vehicle);
    }
  };

  const handleDelete = (id: string) => {
    if (hasEditPermission) {
      deleteVehicle({id});
    }
  };

  return (
    <div>
      {!showUpdate && (
        <>
          {/* Only show AddVehicle component if user has edit permission */}
          {hasEditPermission && (
            <div className="mb-3">
              <AddVehicle />
            </div>
          )}

          {vehiclesData && vehiclesData.length > 0 ? (
            <GenericTable
              data={vehiclesData}
              paginationOff
              columns={[
                {header: 'Vehicle Name', accessor: 'vehicleName'},
                {header: 'Vehicle Number', accessor: 'vehicleNumber'},
                {header: 'Fuel Per Km', accessor: 'fuelPerKm'},
              ]}
              action={hasEditPermission} // Only show action buttons if user can edit
              onEdit={
                hasEditPermission ? (vehicle) => handleEdit(vehicle) : undefined
              }
              onDelete={
                hasEditPermission
                  ? (vehicle) => handleDelete(vehicle.id)
                  : undefined
              }
            />
          ) : (
            <div className="text-gray-500 flex flex-col items-center justify-center py-10">
              <FaCar />
              <p className="text-lg font-medium">No vehicles found</p>
              <p className="text-gray-400 text-sm">
                {hasEditPermission
                  ? 'Add a vehicle to get started'
                  : 'No vehicles available to view'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Show update form only if user has edit permission */}
      {showUpdate && hasEditPermission && (
        <AddVehicle
          currentVehicle={currentVehicle}
          showUpdate={showUpdate}
          setShowUpdate={setShowUpdate}
        />
      )}

      {/* Show message if trying to access update without permission */}
      {showUpdate && !hasEditPermission && (
        <div className="p-8 text-center">
          <p className="mb-4 text-red-500">
            You don't have permission to edit vehicles.
          </p>
          <button
            onClick={() => setShowUpdate(false)}
            className="bg-gray-300 rounded px-4 py-2"
          >
            Back to List
          </button>
        </div>
      )}
    </div>
  );
};

export default VehicleList;
