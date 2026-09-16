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
    router.navigate({to: '/Alldishes'}); // navigate to /Alldishes
  };

  return (
    <div className="mt-4 flex items-center justify-between gap-4">
      {/* ── Cancel button left ─────────────────────────────── */}
      <div className="flex gap-4">
        <GenericButton type="button" onClick={handleCancel}>
          Cancel
        </GenericButton>

        <GenericButton type="button" onClick={handleAddRow}>
          Add Row
        </GenericButton>
      </div>

      {/* ── Submit / Update button right ───────────────────── */}
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
  );
};

export default FormActions;
