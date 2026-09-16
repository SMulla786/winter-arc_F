/*eslint-disable*/
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useRouter} from '@tanstack/react-router';
import React from 'react';

interface Props {
  handleAddRow: () => void;
  handleDeleteRow: () => void;
  rows: any[];
  isBusy: boolean;
  isUpdateMode: boolean;
}

const FormActions: React.FC<Props> = ({
  handleAddRow,
  handleDeleteRow,
  rows,
  isBusy,
  isUpdateMode,
}) => {
  const router = useRouter();

  const handleCancel = () => {
    router.navigate({to: '/Alldishes'});
  };

  return (
    <div className="mt-4 flex items-center justify-between gap-4">
      {/* ── Left side buttons ─────────────────────────────── */}
      <div className="flex gap-4">
        {/* <button
          type="button"
          onClick={handleAddRow}
          className="text-blue-600 underline"
        >
          Add Row +
        </button> */}
      </div>

      {/* ── Right side buttons ───────────────────── */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleCancel}
          className="border-gray-300 hover:bg-gray-50 mx-1 rounded border bg-white px-6 py-1 text-black transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <GenericButton type="submit" disabled={isBusy}>
          {isBusy
            ? isUpdateMode
              ? 'Updating…'
              : 'Submitting…'
            : isUpdateMode
              ? 'Update'
              : 'Submit'}
        </GenericButton>
      </div>
    </div>
  );
};

export default FormActions;
