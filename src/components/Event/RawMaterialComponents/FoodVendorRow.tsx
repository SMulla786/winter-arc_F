/*eslint-disable*/
import React from 'react';

interface FoodVendorRowProps {
  dish: any;
  index: number;
}

const FoodVendorRow: React.FC<FoodVendorRowProps> = ({dish}) => {
  return (
    <tr className="border-gray-300 dark:border-gray-700 align-middle">
      {/* Dish Name */}
      <td className="px-4 py-2 text-center">
        <input
          type="text"
          className="w-full border-none bg-transparent text-center text-black dark:text-white"
          disabled
          value={dish.dishName || ''}
        />
      </td>

      {/* Unit */}
      <td className="px-4 py-2 text-center text-black dark:text-white">
        {dish.unit || '-'}
      </td>

      {/* Order Qty */}
      <td className="px-4 py-2 text-center text-black dark:text-white">
        {dish.expected || dish.orderQty || '-'}
      </td>

      {/* Preparation Qty */}
      <td className="px-4 py-2 text-center text-black dark:text-white">
        {dish.preparation || '-'}
      </td>

      {/* Food Vendor */}
      <td className="px-4 py-2 text-center">
        <input
          type="text"
          className="w-full border-none bg-transparent text-center text-black dark:text-white"
          disabled
          value={dish.foodVendorName || ''}
        />
      </td>
    </tr>
  );
};

export default FoodVendorRow;
