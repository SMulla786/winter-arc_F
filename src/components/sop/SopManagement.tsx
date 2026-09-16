/*eslint-disable*/
import React, {useState, useMemo} from 'react';
import {Route} from '@/routes/_app/_event/events.$id';
import {useGetSOPManagement} from '@/lib/react-query/sop/sop';
import GenericTable from '../Forms/Table/GenericTable';

const SopManagement = () => {
  const {id: EventId} = Route.useParams();
  const {data: sopget, isLoading, isError} = useGetSOPManagement(EventId);

  // State for filters
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedWorkStatus, setSelectedWorkStatus] = useState<string>('all');
  const [selectedWorkDepartment, setSelectedWorkDepartment] =
    useState<string>('all');

  // Extract the actual data from the nested response structure
  const eventData = sopget?.data;
  const employees = eventData?.employees || [];
  const heads = eventData?.heads || [];
  const works = eventData?.works || [];

  // Create a mapping of employee names to departments
  const employeeDepartmentMap = useMemo(() => {
    const map = new Map();
    employees.forEach((emp) => {
      map.set(emp.fullname, emp.departmentName);
    });
    return map;
  }, [employees]);

  // Get unique departments for employees filter
  const departments = useMemo(() => {
    const depts = new Set(employees.map((emp) => emp.departmentName));
    return ['all', ...Array.from(depts)];
  }, [employees]);

  // Get unique roles for filter dropdown
  const roles = useMemo(() => {
    const roleSet = new Set(employees.map((emp) => emp.role));
    return ['all', ...Array.from(roleSet)];
  }, [employees]);

  // Get unique work statuses for filter dropdown
  const workStatuses = useMemo(() => {
    const statusSet = new Set(works.map((work) => work.status));
    return ['all', ...Array.from(statusSet)];
  }, [works]);

  // Get unique departments for work filter based on assigned employee's department
  const workDepartments = useMemo(() => {
    const depts = new Set<string>();
    works.forEach((work) => {
      if (work.assign?.fullname) {
        const dept = employeeDepartmentMap.get(work.assign.fullname);
        if (dept) {
          depts.add(dept);
        }
      }
    });
    return ['all', ...Array.from(depts)];
  }, [works, employeeDepartmentMap]);

  // Filter employees based on selected department and role
  const filteredEmployees = useMemo(() => {
    let filtered = [...employees];

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(
        (emp) => emp.departmentName === selectedDepartment,
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter((emp) => emp.role === selectedRole);
    }

    return filtered;
  }, [employees, selectedDepartment, selectedRole]);

  // Filter works based on status and department
  const filteredWorks = useMemo(() => {
    let filtered = [...works];

    if (selectedWorkStatus !== 'all') {
      filtered = filtered.filter((work) => work.status === selectedWorkStatus);
    }

    if (selectedWorkDepartment !== 'all') {
      filtered = filtered.filter((work) => {
        if (work.assign?.fullname) {
          const dept = employeeDepartmentMap.get(work.assign.fullname);
          return dept === selectedWorkDepartment;
        }
        return false;
      });
    }

    return filtered;
  }, [
    works,
    selectedWorkStatus,
    selectedWorkDepartment,
    employeeDepartmentMap,
  ]);

  // Reset filters
  const resetFilters = () => {
    setSelectedDepartment('all');
    setSelectedRole('all');
  };

  const resetWorkFilters = () => {
    setSelectedWorkStatus('all');
    setSelectedWorkDepartment('all');
  };

  // Define columns for employees table
  const employeeColumns = [
    {
      header: 'Full Name',
      accessor: 'fullname' as const,
      sortable: true,
      className: 'min-w-[150px]',
    },
    {
      header: 'Email',
      accessor: 'email' as const,
      sortable: true,
      className: 'min-w-[200px]',
    },
    {
      header: 'Phone Number',
      accessor: 'phoneNumber' as const,
      sortable: true,
      className: 'min-w-[150px]',
    },
    {
      header: 'Department',
      accessor: 'departmentName' as const,
      render: (item: any) => (
        <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
          {item.departmentName}
        </span>
      ),
      sortable: true,
      className: 'min-w-[120px]',
    },
    {
      header: 'Role',
      accessor: 'role' as const,
      render: (item: any) => (
        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
          {item.role}
        </span>
      ),
      sortable: true,
      className: 'min-w-[100px]',
    },
  ];

  // Define columns for works table
  const workColumns = [
    {
      header: 'Title',
      accessor: 'title' as const,
      sortable: true,
      className: 'min-w-[200px]',
    },
    {
      header: 'Description',
      accessor: 'description' as const,
      sortable: true,
      className: 'min-w-[250px]',
    },
    {
      header: 'End Date',
      accessor: 'endDate' as const,
      render: (item: any) => (
        <span>{new Date(item.endDate).toLocaleString()}</span>
      ),
      sortable: true,
      className: 'min-w-[150px]',
    },
    {
      header: 'Status',
      accessor: 'status' as const,
      render: (item: any) => (
        <span
          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
            item.status === 'PENDING'
              ? 'bg-yellow-100 text-yellow-800'
              : item.status === 'IN_PROGRESS'
                ? 'bg-blue-100 text-blue-800'
                : item.status === 'COMPLETED'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
          }`}
        >
          {item.status}
        </span>
      ),
      sortable: true,
      className: 'min-w-[120px]',
    },
    {
      header: 'Department',
      accessor: (item: any) => {
        const dept = employeeDepartmentMap.get(item.assign?.fullname);
        return dept || 'N/A';
      },
      render: (item: any) => {
        const dept = employeeDepartmentMap.get(item.assign?.fullname);
        return dept ? (
          <span className="inline-flex rounded-full bg-purple-100 px-2 text-xs font-semibold leading-5 text-purple-800">
            {dept}
          </span>
        ) : (
          <span className="text-gray-500">N/A</span>
        );
      },
      sortable: true,
      className: 'min-w-[120px]',
    },
    {
      header: 'Assigned To',
      accessor: (item: any) => item.assign?.fullname || 'N/A',
      sortable: true,
      className: 'min-w-[150px]',
    },
    {
      header: 'Assigned Email',
      accessor: (item: any) => item.assign?.email || 'N/A',
      sortable: true,
      className: 'min-w-[200px]',
    },
    {
      header: 'Assigned Phone',
      accessor: (item: any) => item.assign?.phoneNumber || 'N/A',
      sortable: true,
      className: 'min-w-[150px]',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-red-500">Error loading SOP data</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header Details Section - Two Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* SOP Details Card */}
        <div className="rounded-lg bg-white p-4 shadow-md dark:bg-meta-4 dark:text-white">
          <h2 className="text-gray-800 mb-3 border-b border-stroke pb-2 text-lg font-bold">
            SOP Details
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-gray-600 text-xs font-medium">Event Name:</p>
              <p className="text-gray-800 truncate text-sm font-semibold">
                {eventData?.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-xs font-medium">Description:</p>
              <p className="text-gray-800 truncate text-sm font-semibold">
                {eventData?.description || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-xs font-medium">Start Date:</p>
              <p className="text-gray-800 text-sm font-semibold">
                {eventData?.startDate
                  ? new Date(eventData.startDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-xs font-medium">End Date:</p>
              <p className="text-gray-800 text-sm font-semibold">
                {eventData?.endDate
                  ? new Date(eventData.endDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-xs font-medium">Priority:</p>
              <p
                className={`text-sm font-semibold ${
                  eventData?.priority === 'HIGH'
                    ? 'text-red-600'
                    : eventData?.priority === 'MEDIUM'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                }`}
              >
                {eventData?.priority || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-xs font-medium">Status:</p>
              <p
                className={`text-sm font-semibold ${
                  eventData?.status === 'PENDING'
                    ? 'text-yellow-600'
                    : eventData?.status === 'IN_PROGRESS'
                      ? 'text-blue-600'
                      : 'text-green-600'
                }`}
              >
                {eventData?.status || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Heads Card */}
        <div className="rounded-lg bg-white p-4 shadow-md dark:bg-meta-4 dark:text-white">
          <h2 className="text-gray-800 mb-3 border-b border-stroke pb-2 text-lg font-bold">
            Heads
          </h2>
          {heads.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {heads.map((head) => (
                <div key={head.id} className="border-b pb-2 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800 truncate text-sm font-semibold">
                      {head.fullname}
                    </span>
                    <span className="inline-flex rounded-full bg-purple-100 px-2 text-xs font-semibold leading-5 text-purple-800">
                      {head.role}
                    </span>
                  </div>
                  <div className="text-gray-600 truncate text-xs">
                    {head.email}
                  </div>
                  <div className="text-gray-600 text-xs">
                    {head.phoneNumber}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 py-2 text-center text-sm">
              No heads assigned
            </div>
          )}
        </div>
      </div>

      {/* Employees Section */}
      <div className="rounded-lg bg-white p-4 shadow-md dark:bg-black dark:text-white">
        <div className="mb-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-gray-800 text-lg font-bold">Employees</h2>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <label className="text-gray-700 text-xs font-medium">
                Department:
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="border-gray-300 rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-meta-4"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All' : dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-700 text-xs font-medium">Role:</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="border-gray-300 rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-meta-4"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role === 'all' ? 'All' : role}
                  </option>
                ))}
              </select>
            </div>
            {(selectedDepartment !== 'all' || selectedRole !== 'all') && (
              <button
                onClick={resetFilters}
                className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="max-h-[400px] overflow-auto">
          <GenericTable
            data={filteredEmployees}
            columns={employeeColumns}
            itemsPerPage={5}
            searchAble={true}
            title=""
            paginationOff={false}
          />
        </div>
      </div>

      {/* Works/Tasks Section */}
      <div className="rounded-lg bg-white p-4 shadow-md dark:bg-black dark:text-white">
        <div className="mb-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-gray-800 text-lg font-bold">Tasks & Works</h2>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <label className="text-gray-700 text-xs font-medium">
                Department:
              </label>
              <select
                value={selectedWorkDepartment}
                onChange={(e) => setSelectedWorkDepartment(e.target.value)}
                className="border-gray-300 rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-black dark:text-white"
              >
                {workDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-700 text-xs font-medium">
                Status:
              </label>
              <select
                value={selectedWorkStatus}
                onChange={(e) => setSelectedWorkStatus(e.target.value)}
                className="border-gray-300 rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-black dark:text-white"
              >
                {workStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All' : status}
                  </option>
                ))}
              </select>
            </div>
            {(selectedWorkStatus !== 'all' ||
              selectedWorkDepartment !== 'all') && (
              <button
                onClick={resetWorkFilters}
                className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="max-h-[500px] overflow-auto">
          <GenericTable
            data={filteredWorks}
            columns={workColumns}
            itemsPerPage={5}
            searchAble={true}
            title=""
            paginationOff={false}
          />
        </div>
      </div>
    </div>
  );
};

export default SopManagement;
