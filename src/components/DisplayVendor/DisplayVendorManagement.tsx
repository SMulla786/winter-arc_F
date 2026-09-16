/*eslint-disable*/
import {useEffect, useState} from 'react';
import GenericTable from '../Forms/Table/GenericTable';
import UpdateDisplayVendorForm from './UpdateDisplayVendorForm';
import DisplayVendorForm from './DisplayVendorForm';
import {
  useDeleteDisplayVendor,
  useGetAllDisplayVendor,
} from '@/lib/react-query/queriesAndMutations/cateror/displayVendor';
import {useNavigate} from '@tanstack/react-router';
import {useAuthContext} from '@/context/AuthContext';

const DisplayVendorManagement = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [editableVendor, setEditableVendor] = useState<any>(null);
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.displayvendorpage;
  const role = user?.role;
  const Columns = [
    // {header: 'Vendor Name', accessor: 'name'},
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
      render: (row: any) => (
        <span
          className="cursor-pointer text-blue-600"
          onClick={() => {
            navigate({to: `/displayvendorhistory/${row.id}`});
            // console.log('row:', row);
          }}
        >
          {row.name}
        </span>
      ),
    },
    {header: 'Phone', accessor: 'phone'},
    {header: 'Address', accessor: 'address'},
  ];

  const {
    data: vendorsResponse,
    isLoading: isVendorsLoading,
    refetch: refetchVendors,
    isRefetching: isRefetchingVendors,
  } = useGetAllDisplayVendor();
  console.log('vendorsResponse', vendorsResponse);

  const {mutate: deleteVendor} = useDeleteDisplayVendor();

  useEffect(() => {
    refetchVendors();
  }, [refetchVendors, vendorsResponse]);

  const handleShow = (row) => {
    // setShowForm(true);
    navigate({to: `/displayvendorhistoryshow/${row.id}`});
  };

  return (
    <div>
      {/* <table className="w-full min-w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="px-4 py-3 font-medium text-black dark:text-white">
                Vendor Name
              </th>
              <th className="px-4 py-3 font-medium text-black dark:text-white">
                Phone
              </th>
              <th className="px-4 py-3 font-medium text-black dark:text-white">
                Display Name
              </th>
              <th className="px-4 py-3 font-medium text-black dark:text-white">
                Price
              </th>
              <th className="px-4 py-3 font-medium text-black dark:text-white">
                Image
              </th>
            </tr>
          </thead>
        </table> */}
      {!showUpdateForm && !showCreateForm && (
        <>
          <div className="bg-white p-6 dark:border-strokedark dark:bg-boxdark">
            {/* Header section with button */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-gray-800 dark:text-gray-100 text-lg font-semibold">
                Display Vendors
              </h2>
              {(role === 'CATEROR' || restriction === 'VIEW') && (
                <button
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 dark:focus:ring-offset-boxdark"
                  onClick={() => setShowCreateForm(true)}
                >
                  + Add New Vendor
                </button>
              )}
            </div>

            {/* Table */}
            <GenericTable
              columns={Columns}
              data={vendorsResponse || []}
              action={role === 'CATEROR' || restriction === 'EDIT'}
              onEdit={(item) => {
                setEditableVendor(item);
                setShowUpdateForm(true);
                console.log('Item:', item);
              }}
              onDelete={(item) => {
                deleteVendor(item?.id);
              }}
              onView={(row) => handleShow(row)}
            />
          </div>
        </>
      )}

      {showCreateForm && !showUpdateForm && (
        <DisplayVendorForm
          onClose={() => {
            setShowCreateForm(false);
          }}
        />
      )}

      {showUpdateForm && editableVendor && !showCreateForm && (
        <UpdateDisplayVendorForm
          vendor={editableVendor}
          onClose={() => setShowUpdateForm(false)}
        />
      )}
    </div>
  );
};

export default DisplayVendorManagement;
function useAuthcontext(): {user: any} {
  throw new Error('Function not implemented.');
}
