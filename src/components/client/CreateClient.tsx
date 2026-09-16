import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {useEffect, useRef, useState} from 'react';
import {clientValidationSchema} from '@/lib/validation/clientSchemas';
import GenericTextArea from '../Forms/TextArea/GenericTextArea';
import {useCreateClient} from '@/lib/react-query/queriesAndMutations/cateror/client';
import {Loader} from '../Loader/Loader';
import {FiPlus, FiMinus} from 'react-icons/fi';
import {useLocation} from '@tanstack/react-router';

type FormValues = z.infer<typeof clientValidationSchema>;

type CreateClientProps = {
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
  prefilledName?: string; // ADD THIS
};

const CreateClient: React.FC<CreateClientProps> = ({
  setShowForm,
  prefilledName,
}) => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(clientValidationSchema),
  });

  const {reset} = methods;
  const {
    mutate: CreateClient,
    isSuccess,
    isPending,
    isError,
  } = useCreateClient();

  const location = useLocation();
  const clientSearchText =
    prefilledName || location.state?.clientSearchText || '';
  console.log('Prefilled text from EventModal:', clientSearchText);

  const [showDateFields, setShowDateFields] = useState(false);

  useEffect(() => {
    if (clientSearchText) {
      methods.setValue('fullname', clientSearchText);
    }
  }, [clientSearchText, methods]);

  useEffect(() => {
    if (clientSearchText) {
      methods.setValue('fullname', clientSearchText);
    }
  }, [clientSearchText, methods]);

  const generateRandomNumbers = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const onSubmit = (data: FormValues) => {
    console.log(data);

    const generatedEmail = `client${data.phoneNo}${generateRandomNumbers()}@gmail.com`;

    CreateClient({
      fullname: data.fullname,
      address: data.address,
      username: data.phoneNo,
      email: generatedEmail || 'default@gmail.com',
      phoneNumber: data.phoneNo,
      secondaryPhoneNumber: data.secondaryPhoneNo
        ? data.secondaryPhoneNo
        : undefined,
      caste: data.caste ? data.caste : '',
      birthday: showDateFields && data.birthday ? data.birthday : undefined,
      anniversary:
        showDateFields && data.anniversary ? data.anniversary : undefined,
      panNumber: showDateFields && data.panNumber ? data.panNumber : undefined,
      gstNumber: showDateFields && data.gstNumber ? data.gstNumber : undefined,
      companyName:
        showDateFields && data.companyName ? data.companyName : undefined,
      companyAddress:
        showDateFields && data.companyAddress ? data.companyAddress : undefined,
    });
    console.log(data);
  };

  useEffect(() => {
    if (isSuccess) {
      reset();
      setShowDateFields(false);
      setShowForm(false);
    }
    if (isError) {
      reset();
    }
  }, [isSuccess, reset, isError]);

  const toggleDateFields = () => {
    setShowDateFields(!showDateFields);
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-8 bg-white p-8 dark:bg-black"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
          <h1 className="col-span-12 mb-4 text-lg font-semibold">
            Create Client
          </h1>

          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="fullname"
              label="Client Name"
              placeholder="Enter Client Name"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="caste"
              label="Caste"
              placeholder="Enter Caste"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="phoneNo"
              label="Phone No"
              placeholder="Enter Phone No"
              type="number"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <GenericInputField
              name="secondaryPhoneNo"
              label="Secondary Phone No"
              placeholder="Enter Secondary Phone No"
              type="number"
            />
          </div>

          {/* Add Button for Date Fields */}
          <div className="col-span-12">
            <button
              type="button"
              onClick={toggleDateFields}
              className="flex items-center rounded-lg border border-blue-500 bg-blue-50 px-2 text-sm text-blue-600 transition-colors hover:bg-blue-100 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
            >
              {showDateFields ? (
                <>
                  <FiMinus className="h-3 w-3" />
                  Hide info
                </>
              ) : (
                <>
                  <FiPlus className="h-3 w-3" />
                  More info
                </>
              )}
            </button>
          </div>

          {/* Conditionally Rendered Date Fields */}
          {showDateFields && (
            <>
              <div className="col-span-12 md:col-span-6">
                <GenericInputField
                  name="birthday"
                  label="Birthday"
                  placeholder="Select Birthday"
                  type="date"
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <GenericInputField
                  name="anniversary"
                  label="Anniversary Date"
                  placeholder="Select Anniversary Date"
                  type="date"
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <GenericInputField
                  name="panNumber"
                  label="Pan Number"
                  placeholder="Pan Number "
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <GenericInputField
                  name="gstNumber"
                  label="GST Number"
                  placeholder="GST Number"
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <GenericInputField
                  name="companyName"
                  label="Company Name"
                  placeholder="Company Name"
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <GenericInputField
                  name="companyAddress"
                  label="Company Address"
                  placeholder="Company Address"
                />
              </div>
            </>
          )}

          <div className="col-span-12 md:col-span-12">
            <GenericTextArea
              name="address"
              label="Client Address"
              placeholder="Enter Address"
            />
          </div>
        </div>

        {/* Form Buttons */}
        <div className="flex justify-end space-x-4">
          <GenericButton type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save'}
          </GenericButton>
        </div>
      </form>
    </FormProvider>
  );
};

export default CreateClient;
