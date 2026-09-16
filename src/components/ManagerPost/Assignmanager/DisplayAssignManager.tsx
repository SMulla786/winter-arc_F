import React from 'react';
import {useGetAssignManagerPostById} from '@/lib/react-query/queriesAndMutations/cateror/managerpost';
import {Route} from '@/routes/_app/_event/events.$id';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';

// ✅ Define TypeScript interface for each row
interface AssignManagerData {
  managerPostName: string;
  employeeName: string;
}

const DisplayAssignManager = () => {
  const {id: EventId} = Route.useParams();

  // ✅ Fetch data
  const {
    data: assignManagerPost,
    isLoading,
    error,
  } = useGetAssignManagerPostById(EventId);
  console.log('getassignmangerdata', assignManagerPost);

  // ✅ Prepare table columns
  const columns: Column<AssignManagerData>[] = [
    {
      header: 'Manager Name',
      accessor: 'managerPostName',
    },
    {
      header: 'Employee Name',
      accessor: 'employeeName',
    },
  ];

  // ✅ Extract safe data array
  const tableData: AssignManagerData[] = assignManagerPost?.data ?? [];

  return (
    <div className="rounded-lg bg-white p-8 shadow-md dark:bg-black">
      <h2 className="text-gray-800 dark:text-gray-200 mb-4 text-xl font-semibold">
        Assigned Managers
      </h2>

      {/* ✅ Show loading / error states */}
      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">Failed to load data</p>
      ) : tableData.length === 0 ? (
        <p className="text-gray-500">No records found</p>
      ) : (
        <GenericTable columns={columns} data={tableData} />
      )}
    </div>
  );
};

export default DisplayAssignManager;
