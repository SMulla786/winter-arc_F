/* eslint-disable */
import {BiChevronDown, BiChevronUp, BiSave} from 'react-icons/bi';
import {RateData} from './types';
import CostSummaryCards from './CostSummaryCards';
import AdditionalExpenses from './AdditionalExpenses';
import FoodVendorAssignments from './FoodVendorAssignments';
import PricingConfiguration from './PricingConfiguration';
import SummarySection from './SummarySection';
import VendorAssignments from './VendorAssignments';
import {useAuthContext} from '@/context/AuthContext';
import DisplayVendorSection from './DisplayVendorSection';
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

interface SubEventSectionProps {
  calculateFuelDifference: (items: FuelItem[]) => FuelCalculationResult;
  subEventForm: RateData['subEvents'][0];
  collapsed: boolean;
  toggleCollapse: (subEventId: string) => void;
  calculateTotal: (subEventId: string) => number;
  calculateTotalRawMaterial: (
    subEventId: string,
    foodVendorAssignments: RateData['subEvents'][0]['foodVendorAssignments'],
  ) => number;
  calculateVendorTotal: (subEventId: string) => number;

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
  handleAddClubVendor: (subEventId: string) => void;
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
  defaultPerPlate: number;
  fixedPerPlate: number | null;
  setDefaultPerPlate: React.Dispatch<React.SetStateAction<number>>;
  handleUpdateFoodVendor: () => any;
  fuelItems: FuelItem[];
  subEventLength: number;
  transpotationDetails: any;
}

const SubEventSection = ({
  subEventForm,
  collapsed,
  toggleCollapse,
  calculateTotal,
  calculateTotalRawMaterial,
  calculateVendorTotal,
  calculateDisplayTotal,
  calculateFoodVendorTotal,
  handleToggleIncludeRawMaterial,
  calculateSubtotal,
  vendorData,
  vendorRoleData,
  foodVendorData,
  subeventWiseDishRateList,
  extraInputs,
  setExtraInputs,
  vendorInputs,
  setVendorInputs,
  foodVendorInputs,
  setFoodVendorInputs,
  foodVendorAssignments,
  setFoodVendorAssignments,
  handleAddVendor,
  handleRemoveVendor,
  handleAddFoodVendor,
  handleAddClubVendor,
  handleRemoveFoodVendor,
  handleAddExtra,
  handleRemoveExtra,
  getAvailableVendors,
  getAvailableVendorRoles,
  getDishesForSubevent,
  formValues,
  setValue,
  saveSubevent,
  savingSubeventId,
  subEventRateList,
  perPlate,
  setPerPlate,
  handleUpdateFoodVendor,
  fuelItems,
  subEventLength,
  calculateFuelDifference,
  transpotationDetails,
  defaultPerPlate,
  fixedPerPlate,
  setDefaultPerPlate,
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
              fuelItems={fuelItems}
              subEventLength={subEventLength}
              calculateFuelDifference={calculateFuelDifference}
              transpotationDetails={transpotationDetails}
            />
          </div>
          <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <VendorAssignments
                subEventForm={subEventForm}
                vendorData={vendorData}
                vendorRoleData={vendorRoleData}
                vendorInputs={vendorInputs}
                setVendorInputs={setVendorInputs}
                handleAddVendor={handleAddVendor}
                handleRemoveVendor={handleRemoveVendor}
                getAvailableVendors={getAvailableVendors}
                getAvailableVendorRoles={getAvailableVendorRoles}
                setValue={setValue} // ← Add this
                formValues={formValues}
              />

              <FoodVendorAssignments
                subEventForm={subEventForm}
                foodVendorData={foodVendorData}
                getDishesForSubevent={getDishesForSubevent}
                foodVendorAssignments={subEventForm.foodVendorAssignments || []}
                handleAddFoodVendor={(subEventId, isLabour, assignment) => {
                  // Reuse your existing handleAddFoodVendor logic, just pass the pre-built assignment
                  const updatedSubEvents = formValues.subEvents.map((se) =>
                    se.id === subEventId
                      ? {
                          ...se,
                          foodVendorAssignments: [
                            ...(se.foodVendorAssignments || []),
                            assignment,
                          ],
                        }
                      : se,
                  );
                  setValue('subEvents', updatedSubEvents);

                  // Recalculate raw material if food (not labour)
                  if (!isLabour) {
                    const idx = updatedSubEvents.findIndex(
                      (se) => se.id === subEventId,
                    );
                    const newRaw = calculateTotalRawMaterial(
                      subEventId,
                      updatedSubEvents[idx].foodVendorAssignments,
                    );
                    setValue(`subEvents.${idx}.rawMaterial`, newRaw);
                  }
                }}
                handleUpdateFoodVendor={handleUpdateFoodVendor}
                handleRemoveFoodVendor={handleRemoveFoodVendor}
                handleAddClubVendor={handleAddClubVendor}
              />

              {/* <DisplayVendorSection
                subEventForm={subEventForm}
                formValues={formValues}
                setValue={setValue}
              /> */}

              <AdditionalExpenses
                subEventForm={subEventForm}
                extraInputs={extraInputs}
                setExtraInputs={setExtraInputs}
                handleAddExtra={handleAddExtra}
                handleRemoveExtra={handleRemoveExtra}
                formValues={formValues}
                setValue={setValue}
              />
            </div>
            <div className="space-y-6">
              <PricingConfiguration
                subEventForm={subEventForm}
                formValues={formValues}
                setValue={setValue}
                calculateTotal={calculateTotal}
                subEventRateList={subEventRateList}
                perPlate={perPlate}
                setPerPlate={setPerPlate}
                defaultPerPlate={defaultPerPlate}
                fixedPerPlate={fixedPerPlate}
                setDefaultPerPlate={setDefaultPerPlate}
              />
              <SummarySection
                subEventForm={subEventForm}
                calculateTotalRawMaterial={calculateTotalRawMaterial}
                calculateVendorTotal={calculateVendorTotal}
                calculateDisplayTotal={calculateDisplayTotal}
                calculateFoodVendorTotal={calculateFoodVendorTotal}
                calculateSubtotal={calculateSubtotal}
                calculateTotal={calculateTotal}
              />
              {(role === 'CATEROR' || restriction === 'EDIT') && (
                <button
                  type="button"
                  onClick={() => saveSubevent(subEventForm?.id)}
                  disabled={savingSubeventId === subEventForm?.id}
                  className="flex w-full items-center justify-center rounded-md bg-gradient-to-r from-green-600 to-emerald-700 py-3 font-medium text-white transition-all hover:from-green-700 hover:to-emerald-800"
                >
                  {savingSubeventId === subEventForm?.id ? (
                    <>
                      <svg
                        className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <BiSave className="mr-2 text-lg" />
                      Save Pricing
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SubEventSection;
