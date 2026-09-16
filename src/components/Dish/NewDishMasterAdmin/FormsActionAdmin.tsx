/* eslint-disable */
import React from 'react';
import GenericButton from '@/components/Forms/Buttons/GenericButton';

export default function FormActionsAdmin({
  handleAddRow,
  handleDeleteRow,
  rows,
}: {
  handleAddRow: () => void;
  handleDeleteRow: () => void;
  rows: any[];
}) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="flex gap-2">
        <GenericButton type="button" onClick={handleAddRow}>
          + Row
        </GenericButton>
        <GenericButton type="button" onClick={handleDeleteRow}>
          - Row
        </GenericButton>
      </div>

      <div className="text-gray-500 text-sm">
        Rows: <strong>{rows.length}</strong>
      </div>
    </div>
  );
}
