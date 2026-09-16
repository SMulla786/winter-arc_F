/* eslint-disable */
import React, {useState, useEffect, useMemo} from 'react';
import {FormProvider, useForm, useFieldArray} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {
  useAssignManagerPost,
  useGetManagerPost,
  useGetManagerPostById,
} from '@/lib/react-query/queriesAndMutations/cateror/managerpost';
import {useGetAllEmployee} from '@/lib/react-query/queriesAndMutations/cateror/Employee/employee';
import {PlusIcon, XMarkIcon} from '@heroicons/react/24/outline';
import GenericDropdown from '@/components/Forms/DropDown/GenericDropDown';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {MdDelete} from 'react-icons/md';

const managerRowSchema = z.object({
  managerId: z.string().min(1, 'Manager is required'),
  employeeId: z.string().min(1, 'Employee is required'),
  managerPostName: z.string().optional(),
  employeeName: z.string().optional(),
});

const managerArraySchema = z.object({
  managers: z.array(managerRowSchema).default([]),
});

type ManagerFormValues = {
  managers: {
    managerId: string;
    employeeId: string;
    managerPostName?: string;
    employeeName?: string;
  }[];
};

interface ManagerAssignmentProps {
  subevent: any;
  subeventId: string;
}

type ManagerRow = {
  id: string;
  managerId: string;
  employeeId: string;
  managerPostName?: string;
  employeeName?: string;
  index: number;
};

const ManagerAssignment: React.FC<ManagerAssignmentProps> = ({
  subevent,
  subeventId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {mutate: assignManagerMutate} = useAssignManagerPost();
  const {data: allemploye} = useGetAllEmployee();
  const {data: allmanager} = useGetManagerPost();
  const {data: getmanagerdata} = useGetManagerPostById(subeventId || '');

  const managerMethods = useForm<ManagerFormValues>({
    resolver: zodResolver(managerArraySchema),
    defaultValues: {
      managers: [{managerId: '', employeeId: ''}],
    },
  });

  const {
    fields: managerFields,
    append: appendManager,
    remove: removeManager,
  } = useFieldArray({
    control: managerMethods.control,
    name: 'managers',
  });

  const managerOptions = useMemo(() => {
    const baseOptions =
      allmanager?.data?.map((m: any) => ({
        value: m.id,
        label: m.name,
      })) ?? [];

    const existingManagers =
      getmanagerdata?.data?.map((assignment: any) => ({
        value: assignment.postId,
        label: assignment.managerPostName || `Manager (${assignment.postId})`,
      })) ?? [];

    const labelToOption = new Map<string, {value: string; label: string}>();
    baseOptions.forEach((opt) => labelToOption.set(opt.label, opt));
    existingManagers.forEach((opt) => {
      if (!labelToOption.has(opt.label)) labelToOption.set(opt.label, opt);
    });

    return Array.from(labelToOption.values());
  }, [allmanager?.data, getmanagerdata?.data]);

  const employeeOptions = useMemo(
    () =>
      allemploye?.data?.map((e: any) => ({
        value: e.id,
        label: e.fullname,
      })) ?? [],
    [allemploye?.data],
  );

  // Prepare table data
  const tableData = useMemo(() => {
    return managerFields.map((field, index) => ({
      id: field.id,
      managerId: field.managerId,
      employeeId: field.employeeId,
      managerPostName: field.managerPostName,
      employeeName: field.employeeName,
      index: index,
    }));
  }, [managerFields]);

  useEffect(() => {
    if (getmanagerdata?.data && getmanagerdata.data.length > 0) {
      const managerNameToId = new Map(
        allmanager?.data?.map((m: any) => [m.name, m.id]) || [],
      );

      const managersData = getmanagerdata.data.map((assignment: any) => {
        const postId =
          managerNameToId.get(assignment.managerPostName) || assignment.postId;
        return {
          managerId: postId,
          employeeId: assignment.employeeId,
          managerPostName: assignment.managerPostName,
          employeeName: assignment.employeeName,
        };
      });

      managerMethods.reset({
        managers:
          managersData.length > 0
            ? managersData
            : [{managerId: '', employeeId: ''}],
      });
    } else {
      managerMethods.reset({managers: [{managerId: '', employeeId: ''}]});
    }
  }, [subeventId, getmanagerdata, managerMethods, allmanager?.data]);

  const onSubmitManagers = async () => {
    if (!subeventId) return;

    const {managers} = managerMethods.getValues();
    const validManagers = managers.filter((m) => m.managerId && m.employeeId);

    setIsSubmitting(true);
    const payload = validManagers.map((m) => ({
      managerPostId: m.managerId,
      employeeId: m.employeeId,
    }));

    assignManagerMutate(
      {id: subeventId, data: payload},
      {
        onSuccess: () => setIsSubmitting(false),
        onError: (error) => {
          console.error(error);
          setIsSubmitting(false);
        },
      },
    );
  };

  const handleDeleteManager = (index: number) => {
    removeManager(index);
  };

  const handleManagerRoleChange = (index: number, value: string) => {
    managerMethods.setValue(`managers.${index}.managerId`, value);
  };

  const handleEmployeeChange = (index: number, value: string) => {
    managerMethods.setValue(`managers.${index}.employeeId`, value);
  };

  // Table columns definition
  const columns: Column<ManagerRow>[] = [
    {
      header: 'Manager Role',
      accessor: 'managerId',
      render: (item) => (
        <GenericDropdown
          name={`managers.${item.index}.managerId`}
          control={managerMethods.control}
          options={managerOptions}
          defaultOption="Select Manager's Role"
        />
      ),
    },
    {
      header: 'Manager',
      accessor: 'employeeId',
      render: (item) => (
        <GenericDropdown
          name={`managers.${item.index}.employeeId`}
          control={managerMethods.control}
          options={employeeOptions}
          defaultOption="Select Manager"
        />
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleDeleteManager(item.index)}
            className="p-1 text-graydark transition-colors dark:text-gray-2"
            title="Remove Manager"
          >
            <MdDelete className="h-4 w-4" />
          </button>
          {item.index === managerFields.length - 1 && (
            <button
              type="button"
              onClick={() => appendManager({managerId: '', employeeId: ''})}
              className="p-1 text-graydark transition-colors dark:text-gray-2"
              title="Add New Manager Assignment"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <FormProvider {...managerMethods}>
      <div className="mb-2 bg-blue-100">
        <h1 className="px-4 py-1 text-lg font-semibold text-graydark dark:text-blue-900">
          Manager Assignments
        </h1>
      </div>
      <form>
        {/* Using GenericTable component */}
        <GenericTable
          data={tableData}
          columns={columns}
          searchAble={false}
          paginationOff={true}
          //   itemsPerPage={10}
        />

        {managerFields.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No manager assignments yet. Add a manager to get started.
            </p>
            <button
              type="button"
              onClick={() => appendManager({managerId: '', employeeId: ''})}
              className="mt-4 rounded bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
            >
              Add First Manager
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          <GenericButton
            type="button"
            onClick={onSubmitManagers}
            disabled={isSubmitting}
            className="rounded bg-blue-500 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Saving...</span>
              </div>
            ) : (
              `Save`
            )}
          </GenericButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default ManagerAssignment;
