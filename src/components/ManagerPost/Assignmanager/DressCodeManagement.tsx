/*eslint-disable*/
import React, {useState, useMemo, useCallback, useEffect} from 'react';
import {FormProvider, useForm, useFieldArray} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {PlusIcon, XMarkIcon} from '@heroicons/react/24/outline';
import GenericDropdown from '@/components/Forms/DropDown/GenericDropDown';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {
  useGetDressCode,
  useAssignDressCode,
  useGetAssignedDressCode,
} from '@/lib/react-query/queriesAndMutations/cateror/dresscode';
import toast from 'react-hot-toast';
import {
  useGetAllKitchenVendorManpowerRole,
  useGetAllVendorManpowerRole,
} from '@/lib/react-query/queriesAndMutations/cateror/vendorManpower';
import {MdDelete} from 'react-icons/md';

// Schema for dress code assignment
const dressCodeRowSchema = z.object({
  roleId: z.string().min(1, 'Role is required'),
  dressId: z.string().min(1, 'Dress Code is required'),
});

const dressCodeArraySchema = z.object({
  dressCodes: z.array(dressCodeRowSchema).default([]),
});

interface DressCodeData {
  id: string;
  name: string;
}

interface DressCodeAssignmentProps {
  subevent: any;
  subeventId: string;
}

type DressCodeRow = {
  id: string;
  roleId: string;
  dressId: string;
  roleName?: string;
  dressCodeName?: string;
  index: number;
};

const DressCodeManagement: React.FC<DressCodeAssignmentProps> = ({
  subevent,
  subeventId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get dress codes
  const {data: dressCodesData, isLoading: isLoadingDressCodes} =
    useGetDressCode();

  const {mutate: saveDressCodeAssignments} = useAssignDressCode(subeventId);
  const {data: dressCodeAssignments} = useGetAssignedDressCode(subeventId);
  const {data: VendorRoleData} = useGetAllKitchenVendorManpowerRole(subeventId);

  const dressCodeMethods = useForm({
    resolver: zodResolver(dressCodeArraySchema),
    defaultValues: {
      dressCodes: [{roleId: '', dressId: ''}],
    },
  });

  // Watch form changes to update dropdown options
  const watchDressCodes = dressCodeMethods.watch('dressCodes');

  useEffect(() => {
    if (!dressCodeAssignments || dressCodeAssignments.length === 0) return;

    const mappedDressCodes = dressCodeAssignments.map((item: any) => ({
      roleId: item.manPowerRoleId,
      dressId: item.dressId,
    }));

    dressCodeMethods.reset({
      dressCodes: mappedDressCodes,
    });
  }, [dressCodeAssignments, dressCodeMethods]);

  const {
    fields: dressCodeFields,
    append: appendDressCode,
    remove: removeDressCode,
  } = useFieldArray({
    control: dressCodeMethods.control,
    name: 'dressCodes',
  });

  // Extract dress codes array safely from response
  const dressCodesList: DressCodeData[] = React.useMemo(() => {
    if (!dressCodesData) return [];

    if (Array.isArray(dressCodesData)) {
      return dressCodesData;
    }

    if (dressCodesData.data && Array.isArray(dressCodesData.data)) {
      return dressCodesData.data;
    }

    if (dressCodesData.dressCodes && Array.isArray(dressCodesData.dressCodes)) {
      return dressCodesData.dressCodes;
    }

    return [];
  }, [dressCodesData]);

  // Get vendor roles from VendorRoleData
  const getAvailableVendorRoles = () => {
    if (!VendorRoleData) return [];
    console.log('VendorRoleData', VendorRoleData);

    if (Array.isArray(VendorRoleData)) {
      return VendorRoleData;
    }

    return VendorRoleData?.data || [];
  };

  // Role options from VendorRoleData
  const roleOptions = useMemo(() => {
    const vendorRoles = getAvailableVendorRoles();

    // Get selected role IDs to filter out already assigned roles (optional)
    const selectedRoleIds =
      watchDressCodes
        ?.map((item) => item?.roleId)
        .filter((id) => id && id !== '') || [];

    return (
      vendorRoles
        // .filter((role: any) => !selectedRoleIds.includes(role.id))
        .map((role: any) => ({
          value: role.id,
          label: role.name,
        }))
    );
  }, [VendorRoleData, watchDressCodes]);

  // Function to get dress code options for a specific row
  const getDressCodeOptionsForRow = useCallback(
    (currentIndex: number) => {
      if (!dressCodesList || dressCodesList.length === 0) {
        return [];
      }

      // Get all dress codes selected in other rows
      const selectedDressCodeIds =
        watchDressCodes
          ?.filter((_, index) => index !== currentIndex)
          .map((item) => item?.dressId)
          .filter((id) => id && id !== '') || [];

      // Filter out dress codes that are already selected in other rows
      const availableDressCodes = dressCodesList.filter(
        (dressCode: DressCodeData) =>
          !selectedDressCodeIds.includes(dressCode.id),
      );

      return availableDressCodes.map((dressCode: DressCodeData) => ({
        value: dressCode.id,
        label: dressCode.name,
      }));
    },
    [dressCodesList, watchDressCodes],
  );

  // Get role name by ID
  const getRoleName = useCallback(
    (roleId: string) => {
      if (!roleId) return 'Select Role';
      const role = getAvailableVendorRoles().find((r: any) => r.id === roleId);
      return role?.name || 'Unknown Role';
    },
    [VendorRoleData],
  );

  // Get dress code name by ID
  const getDressCodeName = useCallback(
    (dressId: string) => {
      if (!dressId) return 'Select Dress Code';
      const dressCode = dressCodesList.find(
        (d: DressCodeData) => d.id === dressId,
      );
      return dressCode?.name || 'Unknown Dress Code';
    },
    [dressCodesList],
  );

  // Prepare table data
  const tableData = useMemo((): DressCodeRow[] => {
    return dressCodeFields.map((field, index) => {
      const dressCode = watchDressCodes?.[index];

      return {
        id: field.id,
        roleId: dressCode?.roleId || '',
        dressId: dressCode?.dressId || '',
        roleName: getRoleName(dressCode?.roleId || ''),
        dressCodeName: getDressCodeName(dressCode?.dressId || ''),
        index: index,
      };
    });
  }, [dressCodeFields, watchDressCodes, getRoleName, getDressCodeName]);

  // Form submission
  const onSubmitDressCodes = async () => {
    const isValid = await dressCodeMethods.trigger();
    if (!isValid) {
      toast.error('Please fix form errors before submitting');
      return;
    }

    if (!subeventId) {
      toast.error('Subevent ID is required');
      return;
    }

    const {dressCodes} = dressCodeMethods.getValues();
    const validDressCodes = dressCodes.filter((dc) => dc.roleId && dc.dressId);

    if (validDressCodes.length === 0) {
      toast.error('No valid dress code assignments to save');
      return;
    }

    setIsSubmitting(true);

    const payload = validDressCodes.map((dc) => ({
      roleId: dc.roleId,
      dressId: dc.dressId,
    }));

    saveDressCodeAssignments(payload, {
      onSuccess: () => {
        setIsSubmitting(false);
        // toast.success('Dress code assignments saved successfully!');
      },
      onError: (error: any) => {
        console.error('Failed to assign dress codes:', error);
        toast.error(
          error.response?.data?.message ||
            'Failed to save dress code assignments',
        );
        setIsSubmitting(false);
      },
    });
  };

  const handleDeleteDressCode = (index: number) => {
    if (dressCodeFields.length > 1) {
      removeDressCode(index);
    } else {
      // If it's the last row, reset it instead of removing
      dressCodeMethods.setValue(`dressCodes.${index}.roleId`, '');
      dressCodeMethods.setValue(`dressCodes.${index}.dressId`, '');
    }
  };

  const handleAddNewRow = () => {
    appendDressCode({roleId: '', dressId: ''});
  };

  // Table columns definition
  const columns = [
    {
      header: 'Role',
      accessor: 'roleId',
      render: (item: DressCodeRow) => (
        <div className="space-y-1">
          <GenericDropdown
            name={`dressCodes.${item.index}.roleId`}
            control={dressCodeMethods.control}
            options={roleOptions}
            placeholder="Select Role"
            rules={{required: 'Role is required'}}
            defaultOption="Select Role"
          />
          {dressCodeMethods.formState.errors.dressCodes?.[item.index]
            ?.roleId && (
            <p className="text-xs text-red-500">
              {
                dressCodeMethods.formState.errors.dressCodes[item.index]?.roleId
                  ?.message
              }
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Dress Code',
      accessor: 'dressId',
      render: (item: DressCodeRow) => {
        const dressCodeOptions = getDressCodeOptionsForRow(item.index);

        return (
          <div className="space-y-1">
            <GenericDropdown
              name={`dressCodes.${item.index}.dressId`}
              control={dressCodeMethods.control}
              options={dressCodeOptions}
              placeholder="Select Dress Code"
              rules={{required: 'Dress Code is required'}}
              defaultOption={
                dressCodeOptions.length === 0
                  ? 'No available dress codes'
                  : 'Select Dress Code'
              }
              disabled={dressCodeOptions.length === 0}
            />
            {dressCodeMethods.formState.errors.dressCodes?.[item.index]
              ?.dressId && (
              <p className="text-xs text-red-500">
                {
                  dressCodeMethods.formState.errors.dressCodes[item.index]
                    ?.dressId?.message
                }
              </p>
            )}
            {dressCodeOptions.length === 0 &&
              !dressCodeMethods.formState.errors.dressCodes?.[item.index]
                ?.dressId && (
                <p className="text-xs text-amber-600">
                  All dress codes have been assigned. Remove assignments from
                  other rows to assign here.
                </p>
              )}
          </div>
        );
      },
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (item: DressCodeRow) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleDeleteDressCode(item.index)}
            className="p-1 text-graydark transition-colors hover:text-red-500 dark:text-gray-2"
            title="Remove Dress Code Assignment"
            disabled={isSubmitting}
          >
            <MdDelete className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleAddNewRow}
            className="p-1 text-graydark transition-colors hover:text-green-500 dark:text-gray-2"
            disabled={isSubmitting}
            title="Add New Assignment"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const isLoading = isSubmitting || isLoadingDressCodes;

  if (isLoadingDressCodes) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading dress code data...</span>
      </div>
    );
  }

  return (
    <FormProvider {...dressCodeMethods}>
      <div className="mb-2 bg-violet-50">
        <h1 className="px-4 py-1 text-lg font-semibold text-graydark dark:text-violet-900">
          Dress Code Assignment
        </h1>
      </div>
      <form>
        {/* Table Section */}
        {dressCodeFields.length > 0 && (
          <GenericTable
            data={tableData}
            columns={columns}
            searchAble={false}
            paginationOff={true}
          />
        )}

        {/* Empty State */}
        {dressCodeFields.length === 0 && (
          <div className="border-gray-300 mt-4 rounded-lg border-2 border-dashed py-12 text-center">
            <div className="text-gray-400 mb-3">
              <PlusIcon className="mx-auto h-12 w-12" />
            </div>
            <p className="text-gray-500 mb-4 text-lg">
              No dress code assignments yet.
            </p>
            <p className="text-gray-400 mb-6 text-sm">
              Add a role and dress code assignment to get started.
            </p>
            <button
              type="button"
              onClick={handleAddNewRow}
              className="rounded bg-green-500 px-6 py-2 text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            >
              Add First Assignment
            </button>
          </div>
        )}

        {/* Footer with Save Button */}
        {dressCodeFields.length > 0 && (
          <div className="mt-6 flex justify-end">
            <GenericButton
              type="button"
              onClick={onSubmitDressCodes}
              disabled={isLoading}
              className="rounded bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Saving Assignments...</span>
                </div>
              ) : (
                'Save Assignments'
              )}
            </GenericButton>
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default DressCodeManagement;
