/* eslint-disable */
import React, {useEffect, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericTable, {Column} from '../Forms/Table/GenericTable';
import {addFoodVendorSchema} from '@/lib/validation/foodvendorSchema';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  useAddFoodVendor,
  useDeleteDisplayFoodVendor,
  useGetDsiplayFoodVendor,
  useUpdateDisplayFoodVendor,
} from '@/lib/react-query/queriesAndMutations/cateror/foodvendor';
import {useAuthContext} from '@/context/AuthContext';
import toast from 'react-hot-toast';
import {useNavigate} from '@tanstack/react-router';

type formValues = z.infer<typeof addFoodVendorSchema>;

type displayVendorRow = {
  id: string;
  name: string;
  phone: string;
  amount: number;
  image?: string;
};

type displayVendor = {
  name: string;
  phone: string;
  amount: number;
  image?: string;
};

const DisplayVendor: React.FC = () => {
  const navigate = useNavigate();
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.rawMaterialPage;
  const role = user?.role;

  const columns: Column<displayVendor>[] = [
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
    },
    {header: 'Phone', accessor: 'phone'},
    {header: 'Amount', accessor: 'amount'},
    {
      header: 'Image',
      accessor: 'image',
      render: (row) =>
        row.image ? (
          <img
            src={row.image}
            alt="Vendor"
            className="h-12 w-12 rounded-full border object-cover"
          />
        ) : (
          <span className="text-gray-400">No Image</span>
        ),
    },
  ];

  const methods = useForm<formValues>({
    resolver: zodResolver(addFoodVendorSchema),
  });

  const {mutateAsync: addDisplayVendor} = useAddFoodVendor();
  const {mutateAsync: deleteDisplayVendor} = useDeleteDisplayFoodVendor(
    user?.id!,
  );
  const {data: allDisplayVendors} = useGetDsiplayFoodVendor(user?.id!);
  const {mutateAsync: updateDisplayVendor} = useUpdateDisplayFoodVendor(
    user?.id!,
  );

  const [editVendorId, setEditVendorId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (editVendorId) {
      const vendorToEdit = allDisplayVendors?.find(
        (v) => v.id === editVendorId,
      );
      if (vendorToEdit) {
        methods.reset({
          name: vendorToEdit.name,
          phone: vendorToEdit.phone,
          amount: vendorToEdit.amount,
        });
        setPreviewImage(vendorToEdit.image || null);
        setShowForm(true);
      }
    }
  }, [editVendorId, allDisplayVendors, methods]);

  const onSubmit = async (data: formValues) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      const imageFile = methods.getValues('image');
      if (imageFile && imageFile[0]) {
        formData.append('image', imageFile[0]);
      }

      if (editVendorId) {
        await updateDisplayVendor({id: editVendorId, data: formData});
        toast.success('Display Vendor updated successfully');
        setEditVendorId(null);
      } else {
        await addDisplayVendor(formData);
        toast.success('Display Vendor created successfully');
      }

      methods.reset();
      setShowForm(false);
      setPreviewImage(null);
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      deleteDisplayVendor(id);
    }
  };

  const handleEdit = (row: displayVendorRow) => {
    setEditVendorId(row.id);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  return (
    <div className="space-y-4">
      {(role === 'CATEROR' || restriction === 'EDIT') && (
        <div className="mb-3 flex items-center justify-between">
          <div>
            {showForm && (
              <button
                className="text-xl font-bold"
                onClick={() => {
                  setShowForm(false);
                  setEditVendorId(null);
                  methods.reset();
                  setPreviewImage(null);
                }}
              >
                ← Back
              </button>
            )}
          </div>

          <div>
            {!showForm && (
              <GenericButton onClick={() => setShowForm(true)}>
                Add Display Vendor
              </GenericButton>
            )}
          </div>
        </div>
      )}

      {showForm && (role === 'CATEROR' || restriction === 'EDIT') && (
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="space-y-8 rounded-lg bg-white p-8 shadow-md dark:bg-black"
          >
            <h2 className="text-gray-800 dark:text-gray-200 text-lg font-semibold">
              {editVendorId ? 'Edit Display Vendor' : 'Add Display Vendor'}
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
              <div className="col-span-12 md:col-span-6">
                <GenericInputField
                  name="name"
                  label="Vendor Name"
                  placeholder="Enter vendor name"
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <GenericInputField
                  name="phone"
                  label="Phone Number"
                  placeholder="Enter 10-digit phone number"
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <GenericInputField
                  name="amount"
                  label="Amount"
                  placeholder="Enter vendor amount"
                />
              </div>

              {/* Image Upload */}
              <div className="col-span-12 md:col-span-6">
                <label className="mb-1.5 block text-sm text-black dark:text-white">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  {...methods.register('image')}
                  onChange={handleImageChange}
                  className="text-gray-900 dark:bg-gray-800 w-full rounded-md bg-white p-2 text-sm dark:text-white"
                />
                {previewImage && (
                  <div className="mt-3">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="h-24 w-24 border object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <GenericButton type="submit">
                {editVendorId ? 'Update' : 'Save'}
              </GenericButton>
            </div>
          </form>
        </FormProvider>
      )}

      {!showForm && (
        <div className="mt-12">
          <GenericTable
            title="Existing Display Vendors"
            columns={columns}
            itemsPerPage={15}
            data={allDisplayVendors || []}
            action={role === 'CATEROR' || restriction === 'EDIT'}
            onDelete={(row) => handleDelete(row.id)}
            onEdit={(row) => handleEdit(row)}
          />
        </div>
      )}
    </div>
  );
};

export default DisplayVendor;
