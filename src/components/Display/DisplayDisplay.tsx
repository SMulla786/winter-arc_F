/* eslint-disable */
import React from 'react';
import GenericTable, {Column} from '../Forms/Table/GenericTable';
import {useAuthContext} from '@/context/AuthContext';
import {
  useGetAllDisplay,
  useDeleteDisplay,
} from '@/lib/react-query/queriesAndMutations/cateror/display';
import {confirmAlert} from 'react-confirm-alert';
import {Loader} from '../Loader/Loader';

const DisplayDisplay: React.FC = () => {
  const {user} = useAuthContext();
  const role = user?.role;

  const {data: response, isLoading, isError, error} = useGetAllDisplay();
  const {mutate: deleteDisplay} = useDeleteDisplay();

  const data =
    response?.map((item: any) => ({
      id: item.id,
      DisplayName: item.name,
      Image: item.image,
      Price: item.price || '0',
    })) || [];

  const columns: Column<(typeof data)[0]>[] = [
    {header: 'Display Name', accessor: 'DisplayName', sortable: true},
    {
      header: 'Image',
      accessor: 'Image',
      render: (item) => (
        <img
          src={item.Image}
          alt={item.DisplayName}
          className="h-12 w-12 rounded object-cover"
        />
      ),
    },
    {header: 'Price', accessor: 'Price', sortable: true},
  ];

  const handleDelete = (item: any) => {
    confirmAlert({
      customUI: ({onClose}) => (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-black shadow-md dark:bg-meta-4 dark:text-white">
            <h2 className="mb-4 text-xl font-semibold">Confirm to delete</h2>
            <p className="mb-6">
              Are you sure you want to delete{' '}
              <strong>{item.DisplayName}</strong>?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={async () => {
                  await deleteDisplay(item.id);
                  onClose();
                }}
                className="rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={onClose}
                className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 rounded px-4 py-2 text-black transition dark:text-white"
              >
                No
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  if (isLoading) return <Loader />;
  if (isError)
    return <div>Error: {error?.message || 'Failed to load data'}</div>;

  return (
    <GenericTable
      title="Displays"
      data={data}
      columns={columns}
      itemsPerPage={10}
      action={role === 'CATEROR'}
      onDelete={handleDelete}
    />
  );
};

export default DisplayDisplay;
