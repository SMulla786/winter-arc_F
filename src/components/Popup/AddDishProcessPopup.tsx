/* eslint-disable */
import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {processSchema} from '@/lib/validation/processSchema';
import {useAddProcess} from '@/lib/react-query/queriesAndMutations/cateror/process';
import {useState} from 'react';
import {Loader} from '../Loader/Loader';

type FormValues = z.infer<typeof processSchema>;

interface AddDishProcessPopupProps {
  onClose: () => void; // pass from parent
}

const AddDishProcessPopup: React.FC<AddDishProcessPopupProps> = ({onClose}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const methods = useForm<FormValues>({
    defaultValues: {
      name: '',
    },
  });

  const {mutateAsync: addProcess, isPending} = useAddProcess();

  const onSubmit = async (data: FormValues) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await addProcess({name: data.name});
      //   setSuccessMessage('Process added successfully');

      // Reload the page after success
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      if (
        error.response?.status === 409 ||
        error.response?.data?.message === 'Process already exists'
      ) {
        setErrorMessage('Process already exists');
      } else {
        // setErrorMessage('An error occurred while adding the process');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-boxdark">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <h1 className="text-lg font-semibold">Add New Process</h1>

            <GenericInputField
              name="name"
              label="Process Name"
              placeholder="Enter process"
            />

            {errorMessage && <p className="text-red-600">{errorMessage}</p>}
            {successMessage && (
              <p className="text-green-600">{successMessage}</p>
            )}

            <div className="flex justify-end space-x-2">
              <GenericButton
                type="button"
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-black"
              >
                Cancel
              </GenericButton>
              <GenericButton type="submit" disabled={isPending}>
                {isPending ? 'Loading...' : 'Save'}
              </GenericButton>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default AddDishProcessPopup;
