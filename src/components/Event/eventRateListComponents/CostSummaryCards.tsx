/* eslint-disable */
import {useState} from 'react';
import {RateData} from './types';
import {FiInfo} from 'react-icons/fi';

export type FuelItem = {
  id: string;
  eventId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  paid: number;
  isPaid: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};
export type FuelCalculationResult = {
  gasTotal: number;
  coalTotal: number;
  difference: number;
  gasPercentage: number;
  coalPercentage: number;
};
interface CostSummaryCardsProps {
  calculateFuelDifference: (items: FuelItem[]) => FuelCalculationResult;
  subEventForm?: RateData['subEvents'][0];
  calculateTotalRawMaterial: (
    subEventId?: string,
    foodVendorAssignments?: RateData['subEvents'][0]['foodVendorAssignments'],
  ) => number;
  calculateDisplayTotal: (subEventId: string) => number;
  vendorRoleData?: RateData['vendorRoles'];
  fuelItems: FuelItem[];
  subEventLength: number;
  transpotationDetails: any;
}

const CostSummaryCards = ({
  subEventForm,
  calculateTotalRawMaterial,
  calculateDisplayTotal,
  calculateFuelDifference,
  vendorRoleData,
  fuelItems,
  subEventLength,
  transpotationDetails,
}: CostSummaryCardsProps) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const getFuelCost = (): number => {
    if (!fuelItems?.length || !subEventLength) return 0;

    const subtotal = fuelItems.reduce(
      (sum: number, item) => sum + item.total,
      0,
    );

    return subtotal / subEventLength;
  };

  // Additional Vendors Cost (from subeventExtraCosts - all categories except FUEL/TRANSPORTATION if needed, but usually all extras)
  const additionalCost = subEventForm.subeventExtraCosts.reduce(
    (sum, extra) => sum + extra.price * extra.quantity,
    0,
  );

  // Display Vendors Cost
  const displayCost = calculateDisplayTotal(subEventForm?.id || '');

  // Total Overhead
  const overheadCost = additionalCost + displayCost;

  // Percentages
  const additionalPercent =
    overheadCost > 0 ? ((additionalCost / overheadCost) * 100).toFixed(1) : 0;

  const displayPercent =
    overheadCost > 0 ? ((displayCost / overheadCost) * 100).toFixed(1) : 0;

  // === LABOUR COST BREAKDOWN ===

  // 1. Manpower Vendors - Service
  const serviceManpowerCost =
    subEventForm?.vendorAssignments
      .filter((assignment) => {
        const role = vendorRoleData?.find(
          (r: any) => r.id === assignment.roleId,
        );
        return role?.roleType === 'SERVICE';
      })
      .reduce((sum, assignment) => {
        return (
          sum +
          (assignment.count || 0) * (assignment.price || 0) +
          (assignment.transport || 0)
        );
      }, 0) || 0;

  // 2. Manpower Vendors - Kitchen
  const kitchenManpowerCost =
    subEventForm?.vendorAssignments
      .filter((assignment) => {
        const role = vendorRoleData?.find(
          (r: any) => r.id === assignment.roleId,
        );
        return role?.roleType === 'KITCHEN';
      })
      .reduce((sum, assignment) => {
        return (
          sum +
          (assignment.count || 0) * (assignment.price || 0) +
          (assignment.transport || 0)
        );
      }, 0) || 0;

  console.log('ding dong', subEventForm?.foodVendorAssignments);

  // 3. Food Labour (from FoodVendorAssignments where includeRawMaterial === false)
  const foodLabourCost =
    subEventForm?.foodVendorAssignments
      .filter((fv) => fv.includeRawMaterial === false)
      .reduce((sum, fv) => sum + (fv.price || 0), 0) || 0;

  // === NEW: PACKAGE VENDOR COST ===
  const packageVendorCost =
    subEventForm?.foodVendorAssignments
      .filter(
        (fv) =>
          fv.isClubVendor === true ||
          subEventForm.foodVendorAssignments?.find(
            (v) => v.foodVendorId === fv.foodVendorId,
          )?.isClubVendor === true,
      )
      .reduce((sum, fv) => sum + (fv.price || 0), 0) || 0;

  // Total Labour
  const totalLabourCost =
    serviceManpowerCost +
    kitchenManpowerCost +
    foodLabourCost +
    packageVendorCost;

  // Percentages of total labour
  const getLabourPercent = (amount: number) =>
    totalLabourCost > 0 ? ((amount / totalLabourCost) * 100).toFixed(1) : 0;

  // === MATERIAL COST BREAKDOWN ===

  // 1. Pure Raw Material (after exclusions)
  const rawMaterialOnly = calculateTotalRawMaterial(
    subEventForm?.id,
    subEventForm?.foodVendorAssignments,
  );

  // 2. Food Vendor cost where raw material IS included (i.e., actual food cost paid to vendors)
  const foodVendorMaterialCost =
    subEventForm?.foodVendorAssignments
      .filter((fv) => fv.includeRawMaterial === true) // Only food, not labour
      .reduce((sum, fv) => sum + (fv.price || 0), 0) || 0;

  // Total Material Cost (should match what you already display)
  const materialCost = rawMaterialOnly + foodVendorMaterialCost;

  // Percentages
  const rawMaterialPercent =
    materialCost > 0 ? ((rawMaterialOnly / materialCost) * 100).toFixed(1) : 0;

  const foodVendorPercent =
    materialCost > 0
      ? ((foodVendorMaterialCost / materialCost) * 100).toFixed(1)
      : 0;

  const InfoButton = ({
    id,
    children,
    color,
    borderColor,
  }: {
    id: string;
    children: React.ReactNode;
    color?: string;
    borderColor?: string;
  }) => (
    <div
      className="absolute right-2 top-2"
      onMouseEnter={() => setActiveTooltip(id)}
      onMouseLeave={() => setActiveTooltip(null)}
    >
      <FiInfo className="text-gray-500 hover:text-gray-700 cursor-pointer text-sm" />

      {activeTooltip === id && (
        <div
          className={`${borderColor} absolute right-0 top-5 w-52 rounded-md border ${color} p-3 text-xs shadow-lg dark:border-strokedark dark:bg-black`}
        >
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
      {/* Material Cost */}
      <div className="relative rounded-l-lg rounded-r-lg border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-black">
        <InfoButton
          id="material"
          color={'bg-blue-50'}
          borderColor={'border-blue-200'}
        >
          <p className="mb-1 font-semibold">Material Cost</p>
          <ul className="list-none">
            <li className="flex justify-between">
              <span>Raw Material</span>
              <span>
                <span>
                  ₹{rawMaterialOnly.toFixed(0)} | {rawMaterialPercent}%
                </span>
              </span>
            </li>
            <li className="flex justify-between">
              <span>Disposable </span>
              <span>
                {' '}
                ₹{0} | {0}%
              </span>
            </li>
            <li className="flex justify-between">
              <span>Outsource </span>
              <span>
                {' '}
                ₹{0} | {0}%
              </span>
            </li>
            <li className="flex justify-between">
              <span>Food Vendor </span>
              <span>
                <span>
                  ₹{foodVendorMaterialCost.toFixed(0)} | {foodVendorPercent}%
                </span>
              </span>
            </li>
          </ul>
        </InfoButton>

        <p className="text-gray-600 text-sm">Material Cost</p>
        <p className="text-base font-bold">₹{materialCost.toFixed(2)}</p>
      </div>

      {/* Fuel Cost */}
      <div className="relative rounded-l-lg rounded-r-lg border-l-4 border-red-500 bg-red-50 p-4 dark:bg-black">
        <InfoButton
          id="fuel"
          color={'bg-red-50'}
          borderColor={'border-red-200'}
        >
          <p className="mb-1 font-semibold">Fuel Cost</p>
          <ul className="list-none">
            <li className="flex justify-between">
              <span>Gas </span>
              <span>
                ₹{calculateFuelDifference(fuelItems)?.gasTotal.toFixed(2)} |{' '}
                {calculateFuelDifference(fuelItems)?.gasPercentage.toFixed(2)}%
              </span>
            </li>
            <li className="flex justify-between">
              <span>Coal </span>
              <span>
                ₹{calculateFuelDifference(fuelItems)?.coalTotal.toFixed(2)} |{' '}
                {calculateFuelDifference(fuelItems)?.coalPercentage.toFixed(2)}%
              </span>
            </li>
          </ul>
        </InfoButton>

        <p className="text-gray-600 text-sm">Fuel Cost</p>
        <p className="text-base font-bold">₹{getFuelCost().toFixed(2)}</p>
      </div>

      {/* Transportation Cost */}
      <div className="relative rounded-l-lg rounded-r-lg border-l-4 border-amber-500 bg-amber-50 p-4 dark:bg-black">
        <InfoButton
          id="transportation"
          color={'bg-amber-50'}
          borderColor={'border-amber-200'}
        >
          <p className="mb-1 font-semibold">Transportation Cost</p>
          <ul className="list-none">
            <li className="flex justify-between">
              <span>Inhouse </span>
              <span>
                ₹{transpotationDetails?.inHouseTotal?.toFixed(2)} |{' '}
                {transpotationDetails?.inPercentage?.toFixed(2)}%
              </span>
            </li>
            <li className="flex justify-between">
              <span>Outsource </span>
              <span>
                ₹{transpotationDetails?.outHouseTotal?.toFixed(2)} |{' '}
                {transpotationDetails?.outPercentage?.toFixed(2)}%
              </span>
            </li>
          </ul>
        </InfoButton>
        <p className="text-gray-600 text-sm">Transportation Cost</p>
        <p className="text-base font-bold">
          ₹{transpotationDetails?.total?.toFixed(2)}
        </p>
      </div>
      {/* Labour Cost */}
      <div className="relative rounded-lg border-l-4 border-green-500 bg-green-50 p-4 dark:bg-black">
        <InfoButton
          id="labour"
          color="bg-green-100"
          borderColor="border-green-300"
        >
          <p className="mb-2 font-semibold">Labour Cost Breakdown</p>
          <ul className="space-y-1">
            <li className="flex justify-between">
              <span>Service</span>
              <span>
                ₹{serviceManpowerCost.toFixed(0)} |{' '}
                {getLabourPercent(serviceManpowerCost)}%
              </span>
            </li>
            <li className="flex justify-between">
              <span>Kitchen</span>
              <span>
                ₹{kitchenManpowerCost.toFixed(0)} |{' '}
                {getLabourPercent(kitchenManpowerCost)}%
              </span>
            </li>
            <li className="flex justify-between">
              <span>Food Labour</span>
              <span>
                ₹{foodLabourCost.toFixed(0)} |{' '}
                {getLabourPercent(foodLabourCost)}%
              </span>
            </li>
            <li className="flex justify-between">
              <span>Package Vendor</span>
              <span>
                ₹{packageVendorCost.toFixed(0)} |{' '}
                {getLabourPercent(packageVendorCost)}%
              </span>
            </li>
          </ul>
        </InfoButton>
        <p className="text-gray-600 text-sm">Labour Cost</p>
        <p className="text-xl font-bold">₹{totalLabourCost.toFixed(0)}</p>
      </div>

      {/* Overhead Cost */}
      <div className="relative rounded-lg border-l-4 border-purple-500 bg-purple-50 p-4 dark:bg-black">
        <InfoButton
          id="overhead"
          color="bg-purple-100"
          borderColor="border-purple-300"
        >
          <p className="mb-2 font-semibold">Overhead Cost Breakdown</p>
          <ul className="space-y-1">
            <li className="flex justify-between">
              <span>Additional</span>
              <span>
                ₹{additionalCost.toFixed(0)} | {additionalPercent}%
              </span>
            </li>
            <li className="flex justify-between">
              <span>Display </span>
              <span>
                ₹{displayCost.toFixed(0)} | {displayPercent}%
              </span>
            </li>
          </ul>
        </InfoButton>
        <p className="text-gray-600 text-sm">Overhead Cost</p>
        <p className="text-xl font-bold">₹{overheadCost.toFixed(0)}</p>
      </div>
    </div>
  );
};

export default CostSummaryCards;
