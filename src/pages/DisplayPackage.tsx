/* eslint-disable */
import React from 'react';
import {useNavigate} from '@tanstack/react-router';
import {confirmAlert} from 'react-confirm-alert';
import {Loader} from '@/components/Loader/Loader';
import {Column} from '@/types';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {
  useDeletePackage,
  useGetAllPackage,
} from '@/lib/react-query/package/displaypackage';
import {useAuthContext} from '@/context/AuthContext';

type Package = {
  id: string;
  packageName: string;
  packageType: string;
  priceRanges: {from: number; to: number; price: number}[];
};

const DisplayPackage: React.FC = () => {
  const navigate = useNavigate();
  const {data: response, isLoading, isError, error} = useGetAllPackage();

  console.log('UUU', response);
  const {mutate: deletePackage} = useDeletePackage();
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.packagePage;
  const role = user?.role;

  const data: Package[] =
    response?.map((item: any) => ({
      id: item.id,
      packageName: item.name || 'N/A',
      packageType: item.packageType || 'N/A',
      priceRanges: (item.range || []).map((r: any) => ({
        from: r.from,
        to: r.to,
        price: r.price,
      })),
    })) || [];

  const columns: Column<Package>[] = [
    {
      header: 'Package Name',
      accessor: 'packageName',
      cellClassName: 'font-medium',
    },
    {
      header: 'Type',
      accessor: 'packageType',
      render: (item) => (
        <span
          className={`inline-flex rounded-full py-1 text-xs font-semibold uppercase tracking-wider ${
            item.packageType === 'VEG'
              ? 'text-green-800 dark:bg-green-900/40 dark:text-green-300'
              : 'text-red-800 dark:bg-red-900/40 dark:text-red-300'
          }`}
        >
          {item.packageType}
        </span>
      ),
    },
    {
      header: 'Price Range (People)',
      accessor: 'priceRanges',
      cellClassName: 'min-w-[180px]',
      render: (item) => (
        <div className="space-y-2">
          {item.priceRanges.length > 0 ? (
            item.priceRanges.map((range, index) => (
              <div
                key={index}
                className="bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded px-3 py-2 text-sm font-medium"
              >
                {range.from} - {range.to}
                <span className="text-gray-600 dark:text-gray-400 ml-1 text-xs">
                  people
                </span>
              </div>
            ))
          ) : (
            <span className="text-gray-500 text-sm">No range set</span>
          )}
        </div>
      ),
    },
    {
      header: 'Cost per Person',
      accessor: 'priceRanges',
      cellClassName: 'min-w-[160px]',
      render: (item) => (
        <div className="space-y-2">
          {item.priceRanges.length > 0 ? (
            item.priceRanges.map((range, index) => (
              <div
                key={index}
                className="rounded bg-blue-50 px-3 py-2 text-left text-sm font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                ₹{range.price?.toLocaleString()}
              </div>
            ))
          ) : (
            <span className="text-gray-500 text-sm">—</span>
          )}
        </div>
      ),
    },
  ];

  const handleEdit = (item: Package) => {
    navigate({to: `/packages/updatepackage/${item.id}`});
  };

  const handleDelete = (item: Package) => {
    confirmAlert({
      customUI: ({onClose}) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl dark:bg-boxdark">
            <h2 className="mb-4 text-2xl font-bold text-red-600">
              Delete Package?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-8">
              Are you sure you want to delete{' '}
              <strong>{item.packageName}</strong>? This action is permanent.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg px-6 py-3 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deletePackage(item.id);
                    onClose();
                  } catch (err) {
                    console.error('Delete failed:', err);
                    onClose();
                  }
                }}
                className="rounded-lg bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  if (isLoading) return <Loader />;
  if (isError)
    return (
      <div className="p-10 text-center text-xl text-red-600">
        Error: {error?.message || 'Failed to load packages'}
      </div>
    );

  return (
    <div className="mx-auto">
      {/* <h1 className="mb-6 text-3xl font-bold text-black dark:text-white">
        Package List
      </h1> */}
      <GenericTable
        data={data}
        columns={columns}
        itemsPerPage={15}
        action={role === 'CATEROR' || restriction === 'EDIT'}
        onEdit={handleEdit}
        title="Package List"
        onDelete={handleDelete}
        rowClassName="hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors"
      />
    </div>
  );
};

export default DisplayPackage;
