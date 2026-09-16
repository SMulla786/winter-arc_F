import GenericButton from '@/components/Forms/Buttons/GenericButton';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import {useAuthContext} from '@/context/AuthContext';
import {manpowerSchema} from '@/lib/validation/manpowerSchema';
import {zodResolver} from '@hookform/resolvers/zod';
import React from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {z} from 'zod';

type FormValues = z.infer<typeof manpowerSchema>;

const AddManPower = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(manpowerSchema),
  });

  const {user} = useAuthContext();
  console.log('====================================');
  console.log('User:', user?.caterorId);
  console.log('====================================');

  const onSubmit = (data: FormValues) => {
    const formatted = {
      caterorId: user?.caterorId ?? '',
      manpower: Object.entries(data).map(([key, value]) => ({
        label: key,
        price: value,
      })),
    };

    console.log('Submitted:', formatted);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-8 dark:bg-black"
      >
        <h1 className="mb-4 text-xl font-semibold">Add Man Power</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {label: 'Cooks', name: 'cooks'},
            {label: 'Female Waiters', name: 'femaleWaiters'},
            {label: 'Helpers', name: 'helpers'},
            {label: 'Waiters', name: 'waiters'},
            {label: 'Washers', name: 'washers'},
            {label: 'Manager', name: 'manager'},
          ].map((field) => (
            <div
              key={field.name}
              className="dark:border-gray-700 rounded-xl border p-4"
            >
              <GenericInputField
                name={field.name}
                label={field.label}
                type="text"
                placeholder="Enter price"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <GenericButton type="submit">Save</GenericButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default AddManPower;
