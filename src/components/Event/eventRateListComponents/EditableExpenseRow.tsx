/* eslint-disable */
import {useState} from 'react';
import {BiTrash} from 'react-icons/bi';

interface EditableExpenseRowProps {
  extra: any;
  index: number;
  subEventId: string;
  formValues: any;
  setValue: any;
  onRemove: (subEventId: string, index: number) => void;
}

const EditableExpenseRow = ({
  extra,
  index,
  subEventId,
  formValues,
  setValue,
  onRemove,
}: EditableExpenseRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(extra.amount.toString());

  const handleSave = () => {
    const subEventIndex = formValues.subEvents.findIndex(
      (se: any) => se.id === subEventId,
    );
    const updatedExtraCost = [...formValues.subEvents[subEventIndex].extraCost];
    updatedExtraCost[index].amount = Number(editedValue) || 0;

    setValue(`subEvents.${subEventIndex}.extraCost`, updatedExtraCost);
    setIsEditing(false);
  };

  return (
    <tr className="border-t">
      <td className="py-3 font-medium">{extra.name}</td>
      <td className="py-3 text-right font-medium">
        {isEditing ? (
          <div className="relative">
            <span className="text-gray-500 absolute left-3 top-2.5">₹</span>
            <input
              type="number"
              value={editedValue}
              onChange={(e) => setEditedValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
              className="w-24 rounded-md border border-stroke px-3 py-1 pl-8 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
              min="0"
              step="0.01"
            />
          </div>
        ) : (
          <span
            className="hover:bg-gray-100 cursor-pointer rounded px-2 py-1"
            onClick={() => {
              setEditedValue(extra.amount.toString());
              setIsEditing(true);
            }}
          >
            ₹{extra.amount.toFixed(2)}
          </span>
        )}
      </td>
      <td className="py-3 text-right">
        <button
          onClick={() => onRemove(subEventId, index)}
          className="text-gray-400 hover:text-red-500"
        >
          <BiTrash size={16} />
        </button>
      </td>
    </tr>
  );
};

export default EditableExpenseRow;
