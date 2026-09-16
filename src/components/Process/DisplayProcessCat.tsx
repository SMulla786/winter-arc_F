import {useEffect, useState} from 'react';
import {useNavigate} from '@tanstack/react-router';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {useGetProcesses} from '@/lib/react-query/queriesAndMutations/cateror/process';
import {Process as APIProcess} from '@/types/cateror'; // Import the correct Process type
import {deleteProcess} from '@/lib/api/cateror/process';
import toast from 'react-hot-toast';
import {Loader} from '../Loader/Loader';
import {confirmAlert} from 'react-confirm-alert';
import {useAuthContext} from '@/context/AuthContext';

// Adjust your local type to match the API response or use the imported one directly
type Process = APIProcess;

const columns: Column<Process>[] = [
  {header: 'Process Name', accessor: 'name', sortable: true}, // Accessor should match the actual field ('name')
];

const DisplayProcessCat: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.rawMaterialProcessPage;
  const role = user?.role;

  const navigate = useNavigate();
  const [processData, setProcessData] = useState<Process[]>([]);
  const [languageId] = useState<string | undefined>(undefined);

  // Fetch processes from the API
  const {
    data: processesApiData,
    error,
    isLoading: isLoadingProcesses,
  } = useGetProcesses({languageId: languageId});

  // Update state with the fetched processes
  useEffect(() => {
    if (processesApiData?.data.processes) {
      setProcessData(processesApiData.data.processes as Process[]); // Cast to Process[] type if necessary
    } else if (error) {
      console.error('Error fetching processes:', error);
    }
  }, [processesApiData, error]);

  // Handle edit functionality
  const handleEdit = (item: Process) => {
    navigate({
      to: `/update/processCateror/${item.id}`, // Use the process ID for the route
    });
  };

  // Handle delete functionality
  const handleDelete = (item: Process) => {
    confirmAlert({
      customUI: ({onClose}) => (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-meta-4 bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-black shadow-md dark:bg-meta-4 dark:text-white">
            <h2 className="mb-4 text-xl font-semibold">Confirm to delete</h2>
            <p className="mb-6">
              Are you sure you want to delete process
              <strong>{item.name}</strong>?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={async () => {
                  try {
                    await deleteProcess(item.id);
                    toast.success(
                      `Process "${item.name}" deleted successfully.`,
                    );
                    setProcessData((prevData) =>
                      prevData.filter((process) => process.id !== item.id),
                    );
                    onClose();
                  } catch (error) {
                    console.error('Error deleting process:', error);
                    toast.error(
                      'This item is linked to other records and cannot be deleted.',
                    );
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

  // Show loading indicator while fetching data
  if (isLoadingProcesses) {
    return <Loader />;
  }

  return (
    <div>
      {/* Table displaying processes */}
      <GenericTable
        title="Raw Materail Process"
        data={processData}
        columns={columns}
        itemsPerPage={5}
        action={role === 'CATEROR' || restriction === 'EDIT'}
        onDelete={handleDelete} // Implement delete functionality
        onEdit={handleEdit}
        paginationOff
      />
    </div>
  );
};

export default DisplayProcessCat;
