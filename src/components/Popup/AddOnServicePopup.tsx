import GenericButton from '@/components/Forms/Buttons/GenericButton';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {useAuthContext} from '@/context/AuthContext';
import {
  useDeleteAddOnService,
  useGetAddOnServices,
  useSaveAddonService,
  useUpdateAddOnService,
} from '@/lib/react-query/queriesAndMutations/cateror/addonservice';
import {addOnServiceSchema} from '@/lib/validation/addonserviceSchema';

import {zodResolver} from '@hookform/resolvers/zod';
import {useEffect, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {z} from 'zod';

type formValues = z.infer<typeof addOnServiceSchema>;

type serviceRow = {
  id: string;
  name: string;
  price: number;
};

type AddOnServicePopup = {
  name: string;
  price: number;
};

interface AddOnServicePopupProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const colums: Column<AddOnServicePopup>[] = [
  {header: 'Name', accessor: 'name', sortable: true},
  {header: 'Price', accessor: 'price'},
];

const AddOnServicePopup: React.FC<AddOnServicePopupProps> = ({
  onSuccess,
  onClose,
}) => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.AddOnServicePopupPage;
  const role = user?.role;
  const adminId = user?.id ?? '';

  const methods = useForm<formValues>({
    resolver: zodResolver(addOnServiceSchema),
  });
  const {data: allAddOnServicePopups} = useGetAddOnServices(adminId);

  const [AddOnServicePopupEditId, setAddOnServicePopupEditId] = useState<
    string | null
  >(null);
  const {mutateAsync: saveAddOnServicePopup, isPending: isAdding} =
    useSaveAddonService(adminId);

  const {mutateAsync: deleteAddOnServicePopup} = useDeleteAddOnService(adminId);

  const {mutateAsync: updateAddOnServicePopup, isPending: isUpdating} =
    useUpdateAddOnService(user?.id || '');

  useEffect(() => {
    if (AddOnServicePopupEditId) {
      const editAddOnServicePopup = allAddOnServicePopups?.find(
        (e) => e.id === AddOnServicePopupEditId,
      );
      if (editAddOnServicePopup) {
        methods.reset({
          name: editAddOnServicePopup.name,
          price: editAddOnServicePopup.price,
        });
      }
    }
  }, [AddOnServicePopupEditId, allAddOnServicePopups, methods]);

  const onSubmit = async (data: formValues) => {
    try {
      if (AddOnServicePopupEditId) {
        await updateAddOnServicePopup({
          id: AddOnServicePopupEditId,
          data: data,
        });
        methods.reset({
          name: '',
          price: 0,
        });
        setAddOnServicePopupEditId(null);

        // Reload the page on success
        window.location.reload();

        // Call onSuccess callback if provided
        if (onSuccess) onSuccess();
      } else {
        await saveAddOnServicePopup(data);
        methods.reset();

        // Reload the page on success
        window.location.reload();

        // Call onSuccess callback if provided
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = (id: string) => {
    const confirmed = confirm(
      'Are you sure you want to delete this AddOnServicePopup',
    );
    if (confirmed) {
      deleteAddOnServicePopup(id);
    }
  };

  const handleEdit = (row: serviceRow) => {
    setAddOnServicePopupEditId(row.id);
  };

  return (
    <div className="space-y-4 p-4">
      {(role === 'CATEROR' || restriction === 'EDIT') && (
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="space-y-8 bg-white p-8 dark:bg-black"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {AddOnServicePopupEditId
                  ? 'Edit AddOn Service'
                  : 'Add Addon Service'}
              </h2>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
              <div className="col-span-12 md:col-span-6">
                <GenericInputField
                  name="name"
                  label="Addon Service"
                  placeholder="Enter Addon Service"
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <GenericInputField
                  name="price"
                  label="Price"
                  placeholder="Enter Price"
                  type="number"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-300 hover:bg-gray-400 rounded-md px-4 py-2"
                >
                  Cancel
                </button>
              )}
              <GenericButton type="submit">
                {isAdding || isUpdating ? 'Saving...' : 'Save'}
              </GenericButton>
            </div>
          </form>
        </FormProvider>
      )}
    </div>
  );
};

export default AddOnServicePopup;
