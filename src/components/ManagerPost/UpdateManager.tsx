import React, {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useMatch, useNavigate, useLocation} from '@tanstack/react-router';

import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';

import {
  useGetManagerPostById,
  useUpdateManagerPost,
} from '@/lib/react-query/queriesAndMutations/cateror/managerpost';
import {managerpostSchema} from '@/lib/validation/managerpostSchema';

type FormValues = z.infer<typeof managerpostSchema>;

const UpdateManager = () => {
  const location = useLocation();
  const passedName = location.state?.name as string | undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const {params} = useMatch('/_app/updatemanager/$id' as any);
  const {id = ''} = params as {id: string};

  const navigate = useNavigate();

  const {data: managerpostbyid, isLoading} = useGetManagerPostById(id);
  const {mutate: updateManagerPost} = useUpdateManagerPost();

  const methods = useForm<FormValues>({
    resolver: zodResolver(managerpostSchema),
    defaultValues: {
      name: passedName || '',
    },
  });

  // If API returns updated value, override
  useEffect(() => {
    if (managerpostbyid?.data?.name) {
      methods.reset({
        name: managerpostbyid.data.name,
      });
    }
  }, [managerpostbyid, methods]);

  const onSubmit = (data: FormValues) => {
    updateManagerPost({
      id,
      name: data.name,
    });
    navigate({to: '/managerpost'});
  };

  return (
    <div className="bg-white p-8 dark:bg-black">
      <GenericButton
        type="button"
        className="mb-4"
        onClick={() => navigate({to: '/managerpost'})}
      >
        ← Back
      </GenericButton>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            <GenericInputField name="name" label="Name" disabled={isLoading} />
          </div>
          <div className="flex justify-end">
            <GenericButton
              type="submit"
              className="mt-4 items-end"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Update'}
            </GenericButton>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default UpdateManager;
