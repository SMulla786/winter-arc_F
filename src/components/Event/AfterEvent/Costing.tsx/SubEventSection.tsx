/* eslint-disable */
import {useAuthContext} from '@/context/AuthContext';
import {RateData} from '../../eventRateListComponents/types';
import CostSummaryCards from './CostSummaryCards';
import VendorAssignments from './VendorAssignment';
import FoodVendorAssignments from './FoodVendorAssignment';
import DisplayVendorSection from './DisplayVendorSection';
import AdditionalExpenses from './AdditionalExpenses';

interface SubEventSectionProps {
  subEventForm: RateData['subEvents'][0];
  collapsed: boolean;
  toggleCollapse: (subEventId: string) => void;
  calculateTotal: (subEventId: string) => number;
  calculateTotalRawMaterial: (
    subEventId: string,
    foodVendorAssignments: RateData['subEvents'][0]['foodVendorAssignments'],
  ) => number;
  calculateVendorTotal: (subEventId: string) => number;
  // calculateDisplayTotal: (subEventId: string) => number;
  calculateDisplayTotal?: (subEventId: string) => number;
  calculateSubtotal: (subEventId: string) => number;
  handleToggleIncludeRawMaterial: (
    subEventId: string,
    index: number,
    value: boolean,
  ) => void;
  calculateFoodVendorTotal: (subEventId: string) => number;
  vendorData: any;
  vendorRoleData: any;
  foodVendorData: any;
  subeventWiseDishRateList: any;
  extraInputs: any;
  setExtraInputs: any;
  vendorInputs: any;
  setVendorInputs: any;
  foodVendorInputs: any;
  setFoodVendorInputs: any;
  foodVendorAssignments: RateData['subEvents'][0]['foodVendorAssignments'];
  setFoodVendorAssignments: any;
  handleAddVendor: (subEventId: string) => void;
  handleRemoveVendor: (subEventId: string, index: number) => void;
  handleAddFoodVendor: (subEventId: string) => void;
  handleRemoveFoodVendor: (subEventId: string, index: number) => void;
  handleAddExtra: (subEventId: string) => void;
  handleRemoveExtra: (subEventId: string, index: number) => void;
  getAvailableVendors: () => any[];
  getAvailableVendorRoles: () => any[];
  getDishesForSubevent: (subEventId: string) => any[];
  formValues: RateData;
  setValue: any;
  saveSubevent: (subEventId: string) => Promise<void>;
  savingSubeventId: string | null;
  subEventRateList: any;
  perPlate: number;
  setPerPlate: React.Dispatch<React.SetStateAction<number>>;
  handleUpdateFoodVendor: () => any;
}

const SubEventSection = ({
  subEventForm,
  collapsed,
  calculateTotal,
  calculateTotalRawMaterial,
  calculateVendorTotal,
  calculateDisplayTotal,
  calculateFoodVendorTotal,
  calculateSubtotal,
  vendorRoleData,
}: SubEventSectionProps) => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.eventRateListPage;
  const role = user?.role;
  return (
    <div className="overflow-hidden rounded-md bg-white shadow-md dark:bg-black">
      <div className="from-gray-50 to-gray-100 flex cursor-pointer items-center justify-between border-b border-stroke bg-gradient-to-r p-5 dark:border-strokedark">
        <div className="flex items-center">
          <div className="mr-4 rounded-md bg-indigo-100 px-3 py-1 font-medium text-indigo-800">
            {subEventForm?.name}
          </div>
        </div>
        <div className="flex items-center">
          <span className="mr-4 text-lg font-bold">
            ₹{calculateTotal(subEventForm?.id).toFixed(2)}
          </span>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="px-6 py-2">
            <CostSummaryCards
              subEventForm={subEventForm}
              calculateTotalRawMaterial={calculateTotalRawMaterial}
              calculateVendorTotal={calculateVendorTotal}
              calculateDisplayTotal={calculateDisplayTotal}
              calculateFoodVendorTotal={calculateFoodVendorTotal}
              calculateSubtotal={calculateSubtotal}
              calculateTotal={calculateTotal}
              vendorRoleData={vendorRoleData}
            />
          </div>
          <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-3">
              <VendorAssignments subEventId={subEventForm?.id} />

              <FoodVendorAssignments subEventId={subEventForm?.id} />

              <DisplayVendorSection subEventId={subEventForm?.id} />

              <AdditionalExpenses subEventId={subEventForm?.id} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SubEventSection;
