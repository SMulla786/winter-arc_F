/*eslint-disable*/
import React, {useState} from 'react';
import {createPortal} from 'react-dom';
import GenericDropdown from '../Forms/DropDown/GenericDropDown';
import {FormProvider, useForm} from 'react-hook-form';
import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import {
  useAddVendorPay,
  usePayPendingVendorManpower,
} from '@/lib/react-query/queriesAndMutations/cateror/vendorManpower';

interface VendorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  subEvents: {id: string; name: string}[];
  id: string;
}

const VendorPopup: React.FC<VendorPopupProps> = ({
  isOpen,
  onClose,
  subEvents,
  id,
}) => {
  const [subEventId, setSubEventId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const methods = useForm<{id: string; amount: number}>();
  const {control} = methods;
  const {mutateAsync: vendorPay} = useAddVendorPay();
  // const {mutate: payPendingVendorManpower} = usePayPendingVendorManpower();
  if (!isOpen) return null;

  const onSubmit = (data: any) => {
    vendorPay({amount: Number(data.amount), id: id});

    onClose();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-meta-4">
            <h2 className="mb-4 text-lg font-semibold">Pay Vendor</h2>

            {/* Dropdown for subevent */}
            {/* <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">
                Select Sub Event
              </label>
              <GenericDropdown
                name="subEventId"
                label="Select Sub Event"
                options={subEvents.map((s) => ({label: s.name, value: s.id}))}
                control={control}
              />
            </div> */}

            {/* Amount input */}
            <div className="mb-4">
              <GenericInputField
                name="amount"
                type="number"
                placeholder="Enter amount"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <GenericButton
                onClick={onClose}
                className="bg-gray-400 hover:bg-gray-500 rounded px-4 py-2 text-white"
              >
                Cancel
              </GenericButton>
              <GenericButton
                type="submit"
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Submit
              </GenericButton>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default VendorPopup;
