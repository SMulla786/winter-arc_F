import React from 'react';
import GenericTable, {Column} from '../Forms/Table/GenericTable';
import {useNavigate} from '@tanstack/react-router';
import {
  useGetAllMaharaj,
  useGetMaharajById,
} from '@/lib/react-query/queriesAndMutations/cateror/maharaj';
import {useDeleteMaharaj} from '@/lib/react-query/queriesAndMutations/cateror/maharaj'; // Adjust the import path as necessary
import {Loader} from '../Loader/Loader';
import {confirmAlert} from 'react-confirm-alert';
import {useAuthContext} from '@/context/AuthContext';

const DisplayMaharaj: React.FC = () => {
  type Maharaj = {
    id: string;
    Name: string;
    PhoneNumber: string;
    Specialization: string;
    Experience: string | null;
    Address: string;
  };

  type maharaj = {
    id: string;
    caterorId: string;
    isAvailable: boolean;
    specialization: string[];
    address: string;
    experience: string | null;
    createdAt: string;
    updatedAt: string;
    email: string;
    username: string;
    fullname: string;
    phoneNumber: string;
    secondaryPhoneNumber: string | null;
  };
  const {user} = useAuthContext();
  const {data: response, isLoading, isError, error} = useGetAllMaharaj();

  const {mutate: deleteMaharaj} = useDeleteMaharaj();

  const restriction = user?.employeeRestriction?.maharajPage;
  const role = user?.role;

  const data: Maharaj[] =
    response?.map((item: maharaj) => ({
      id: item.id,
      Name: item.fullname,
      PhoneNumber: item.phoneNumber,
      Specialization: item.specialization.join(', '),
      Experience: item.experience ? item.experience.toString() : 'N/A',
      Address: item.address,
    })) || [];
  // console.log('data', data);

  const columns: Column<Maharaj>[] = [
    {
      header: 'Name',
      accessor: 'Name',
      render: (item) => (
        <span
          className="cursor-pointer text-blue-600 hover:underline"
          onClick={() => {
            if (role === 'CATEROR' || restriction === 'EDIT') {
              navigate({to: `/maharaj/maharajdata/${item.id}`});
            }
          }}
        >
          {item.Name}
        </span>
      ),
      sortable: true,
    },
    {header: 'Phone Number', accessor: 'PhoneNumber', sortable: true},

    {header: 'Address', accessor: 'Address', sortable: true},
  ];

  const navigate = useNavigate();

  const handleEdit = (item: Maharaj) => {
    navigate({
      to: `/update/maharaj/${item.id}`,
    });
  };

  const handleDelete = (item: Maharaj) => {
    confirmAlert({
      customUI: ({onClose}) => (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-meta-4 bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-black shadow-md dark:bg-meta-4 dark:text-white">
            <h2 className="mb-4 text-xl font-semibold">Confirm to delete</h2>
            <p className="mb-6">
              Are you sure you want to delete Maharaj{' '}
              <strong>{item.Name}</strong>?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={async () => {
                  try {
                    await deleteMaharaj(item.id);
                    onClose();
                  } catch (error) {
                    console.error('Error deleting Maharaj:', error);
                    onClose();
                  }
                }}
                className="rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={onClose}
                className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded px-4 py-2 text-black transition dark:text-white"
              >
                No
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  // Handle error state
  if (isError) {
    return <div>Error: {error?.message || 'Failed to load maharajs'}</div>;
  }

  return (
    <>
      <GenericTable
        title="Maharaj"
        data={data}
        columns={columns}
        itemsPerPage={15}
        action={role === 'CATEROR' || restriction === 'EDIT'}
        onDelete={handleDelete} // Pass the delete handler
        onEdit={handleEdit}
      />
    </>
  );
};

export default DisplayMaharaj;
