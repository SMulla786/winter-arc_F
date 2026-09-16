/*eslint-disable */
import React from 'react';

const RawMaterialRow = React.memo(
  ({
    rm,
    index,
    onChange,
  }: {
    rm: any;
    index: number;
    onChange: (index: number, value: string) => void;
  }) => {
    return (
      <tr className={`text-center ${rm.quantity === 0 ? 'text-red-500' : ''}`}>
        <td className="p-1">{rm.rawMaterial}</td>

        <td className="p-1">
          <input
            type="number"
            defaultValue={
              rm.quantity % 1 === 0
                ? rm.quantity
                : Number(rm.quantity).toFixed(3)
            }
            onBlur={(e) => onChange(index, e.target.value)}
            className={`w-[15] rounded border-[1.7px] border-stroke px-3 py-2`}
          />
        </td>

        <td className="p-1">{rm.unit}</td>
        <td className="p-1">{rm.process || 'Select Process'}</td>
      </tr>
    );
  },
);
export default RawMaterialRow;
