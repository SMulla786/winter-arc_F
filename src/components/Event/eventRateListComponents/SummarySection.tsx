// import {RateData} from './types';

// interface SummarySectionProps {
//   subEventForm: RateData['subEvents'][0];
//   calculateTotalRawMaterial: (
//     subEventId: string,
//     foodVendorAssignments: RateData['subEvents'][0]['foodVendorAssignments'],
//   ) => number;
//   calculateVendorTotal: (subEventId: string) => number;
//   calculateFoodVendorTotal: (subEventId: string) => number;
//   calculateSubtotal: (subEventId: string) => number;
//   calculateTotal: (subEventId: string) => number;
// }

// const SummarySection = ({
//   subEventForm,
//   calculateTotalRawMaterial,
//   calculateVendorTotal,
//   calculateFoodVendorTotal,
//   calculateSubtotal,
//   calculateTotal,
// }: SummarySectionProps) => {
//   return (
//     <div className="rounded-md border border-blue-100 bg-blue-50 p-5 dark:border-strokedark dark:bg-black">
//       <h3 className="text-gray-800 mb-3 font-semibold">Summary</h3>
//       <ul className="space-y-2 text-sm">
//         <li className="flex justify-between">
//           <span className="text-gray-600">Raw Materials:</span>
//           <span>
//             ₹
//             {calculateTotalRawMaterial(
//               subEventForm.id,
//               subEventForm.foodVendorAssignments,
//             ).toFixed(2)}
//           </span>
//         </li>
//         <li className="flex justify-between">
//           <span className="text-gray-600">Vendor Costs:</span>
//           <span>₹{calculateVendorTotal(subEventForm.id).toFixed(2)}</span>
//         </li>
//         <li className="flex justify-between">
//           <span className="text-gray-600">Food Vendor Costs:</span>
//           <span>₹{calculateFoodVendorTotal(subEventForm.id).toFixed(2)}</span>
//         </li>

//         <li className="flex justify-between">
//           <span className="text-gray-600">Extra Costs:</span>
//           <span>
//             ₹
//             {subEventForm.extraCost
//               .reduce((sum, extra) => sum + extra.amount, 0)
//               .toFixed(2)}
//           </span>
//         </li>
//         <li className="flex justify-between border-t border-blue-100 pt-2 dark:border-strokedark">
//           <span className="font-medium">Subtotal:</span>
//           <span className="font-medium">
//             ₹{calculateSubtotal(subEventForm.id).toFixed(2)}
//           </span>
//         </li>
//         <li className="flex justify-between">
//           <span className="font-medium">Profit ({subEventForm.profit}%):</span>
//           <span className="font-medium">
//             ₹
//             {(
//               (calculateSubtotal(subEventForm.id) * subEventForm.profit) /
//               100
//             ).toFixed(2)}
//           </span>
//         </li>
//         <li className="flex justify-between border-t border-blue-100 pt-2 font-bold dark:border-strokedark">
//           <span>Total Price:</span>
//           <span className="text-lg">
//             ₹{calculateTotal(subEventForm.id).toFixed(2)}
//           </span>
//         </li>
//       </ul>
//     </div>
//   );
// };

// export default SummarySection;

// SummarySection.tsx
import {RateData} from './types';

interface SummarySectionProps {
  subEventForm: RateData['subEvents'][0];
  calculateTotalRawMaterial: (
    subEventId: string,
    foodVendorAssignments: RateData['subEvents'][0]['foodVendorAssignments'],
  ) => number;
  calculateVendorTotal: (subEventId: string) => number;
  calculateFoodVendorTotal: (subEventId: string) => number;
  calculateSubtotal: (subEventId: string) => number;
  calculateTotal: (subEventId: string) => number;
  calculateDisplayTotal: (subEventId: string) => number;
}

const SummarySection = ({
  subEventForm,
  calculateTotalRawMaterial,
  calculateVendorTotal,
  calculateFoodVendorTotal,
  calculateSubtotal,
  calculateTotal,
  calculateDisplayTotal,
}: SummarySectionProps) => {
  return (
    <div className="rounded-md border border-blue-100 bg-blue-50 p-5 dark:border-strokedark dark:bg-black">
      <h3 className="text-gray-800 mb-3 font-semibold">Summary</h3>
      <ul className="space-y-2 text-sm">
        <li className="flex justify-between">
          <span className="text-gray-600">Raw Materials:</span>
          <span>
            ₹
            {calculateTotalRawMaterial(
              subEventForm?.id,
              subEventForm?.foodVendorAssignments,
            ).toFixed(2)}
          </span>
        </li>
        <li className="flex justify-between">
          <span className="text-gray-600">Vendor Costs:</span>
          <span>₹{calculateVendorTotal(subEventForm?.id).toFixed(2)}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-gray-600">Food Vendor Costs:</span>
          <span>₹{calculateFoodVendorTotal(subEventForm?.id).toFixed(2)}</span>
        </li>

        <li className="flex justify-between">
          <span className="text-gray-600">Display Costs:</span>
          <span>₹{calculateDisplayTotal(subEventForm?.id).toFixed(2)}</span>
        </li>

        <li className="flex justify-between">
          <span className="text-gray-600">Extra Costs:</span>
          <span>
            ₹
            {subEventForm?.subeventExtraCosts
              .reduce((sum, extra) => sum + extra.price * extra.quantity, 0)
              .toFixed(2)}
          </span>
        </li>
        <li className="flex justify-between border-t border-blue-100 pt-2 dark:border-strokedark">
          <span className="font-medium">Subtotal:</span>
          <span className="font-medium">
            ₹{calculateSubtotal(subEventForm?.id).toFixed(2)}
          </span>
        </li>
        <li className="flex justify-between">
          <span className="font-medium">Profit ({subEventForm?.profit}%):</span>
          <span className="font-medium">
            ₹
            {(
              (calculateSubtotal(subEventForm?.id) * subEventForm?.profit) /
              100
            ).toFixed(2)}
          </span>
        </li>
        <li className="flex justify-between border-t border-blue-100 pt-2 font-bold dark:border-strokedark">
          <span>Total Price:</span>
          <span className="text-lg">
            ₹{calculateTotal(subEventForm?.id).toFixed(2)}
          </span>
        </li>
      </ul>
    </div>
  );
};

export default SummarySection;
