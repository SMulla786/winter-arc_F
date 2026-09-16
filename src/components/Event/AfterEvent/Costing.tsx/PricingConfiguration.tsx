/* eslint-disable */
import {Controller} from 'react-hook-form';
import {useState, useEffect} from 'react';
import {RateData} from './types';

interface PricingConfigurationProps {
  subEventForm: RateData['subEvents'][0];
  formValues: RateData;
  setValue: any;
  calculateTotal: (subEventId: string) => number;
  subEventRateList: any;
  perPlate: number;
  setPerPlate: React.Dispatch<React.SetStateAction<number>>;
}

const PricingConfiguration = ({
  subEventForm,
  formValues,
  setValue,
  calculateTotal,
  subEventRateList,
  perPlate,
  setPerPlate,
}: PricingConfigurationProps) => {
  // Local state to manage per plate price input
  const [perPlatePrice, setPerPlatePrice] = useState<string>('');

  // Calculate initial per plate price and sync with form state

  const calculatePerPlatePrice = () => {
    const actualPeople =
      subEventRateList?.data?.event?.subEvents?.find(
        (se: any) => se.id === subEventForm?.id,
      )?.actualPeople || 0;
    const expectedPeople =
      subEventRateList?.data?.event?.subEvents?.find(
        (se: any) => se.id === subEventForm?.id,
      )?.expectedPeople || 1;
    const total = calculateTotal(subEventForm?.id);
    return (total / (actualPeople || expectedPeople)).toFixed(2);
  };

  // Initialize per plate price on mount or when subEventForm changes
  useEffect(() => {
    const calculated = calculatePerPlatePrice();
    setPerPlatePrice(calculated);
    setPerPlate(Number(calculated));
  }, [subEventForm, subEventRateList, calculateTotal]);

  // Handle manual per plate price change and calculate profit margin
  const handlePerPlatePriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = e.target.value;
    setPerPlate(Number(newValue));
    setPerPlatePrice(newValue); // Update local state

    if (newValue === '' || isNaN(Number(newValue))) {
      return; // Don't update profit if input is empty or invalid
    }

    const newPerPlatePrice = Number(newValue);
    const actualPeople =
      subEventRateList?.data?.event?.subEvents?.find(
        (se: any) => se.id === subEventForm?.id,
      )?.actualPeople || 0;
    const expectedPeople =
      subEventRateList?.data?.event?.subEvents?.find(
        (se: any) => se.id === subEventForm?.id,
      )?.expectedPeople || 1;
    const people = actualPeople || expectedPeople;

    // Calculate total from per plate price
    const newTotal = newPerPlatePrice * people;
    // Calculate subtotal (total without profit)
    const subtotal =
      calculateTotal(subEventForm?.id) / (1 + subEventForm?.profit / 100);
    // Calculate new profit margin percentage
    const newProfitMargin = ((newTotal - subtotal) / subtotal) * 100;
    // Allow any positive profit margin, remove the 100% cap
    const boundedProfitMargin = Math.max(0, newProfitMargin);

    // Update form profit margin as an integer
    const subEventIndex = formValues.subEvents.findIndex(
      (se) => se.id === subEventForm?.id,
    );
    setValue(
      `subEvents.${subEventIndex}.profit`,
      Math.round(boundedProfitMargin),
    );
  };

  // Handle profit margin change (from input only)
  const handleProfitChange = (value: number) => {
    const subEventIndex = formValues.subEvents.findIndex(
      (se) => se.id === subEventForm?.id,
    );
    const newProfit = Math.max(0, value);

    setValue(`subEvents.${subEventIndex}.profit`, newProfit);

    // Recalculate per plate price based on new profit
    const newPerPlate = calculatePerPlatePrice();
    setPerPlatePrice(newPerPlate); // Update input field
    setPerPlate(Number(newPerPlate)); // Sync updated value to state
  };

  return (
    <div className="from-gray-50 to-gray-100 rounded-md border border-stroke bg-gradient-to-br p-6 dark:border-strokedark">
      <h3 className="text-gray-800 mb-4 font-semibold">
        Pricing Configuration
      </h3>
      <div className="mb-6">
        <label className="text-gray-700 mb-2 block text-sm font-medium">
          Profit Margin (%)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={subEventForm?.profit}
            onChange={(e) => {
              const value = Number(e.target.value);
              // Allow any positive value, no upper limit
              handleProfitChange(value >= 0 ? value : 0);
            }}
            className="w-full rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
          />
          <span className="text-sm font-medium">%</span>
        </div>
      </div>
      <div className="mb-6">
        <label className="text-gray-700 mb-2 block text-sm font-medium">
          Per Plate Price
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500">₹</span>
          </div>
          <input
            type="number"
            min="0"
            step="0.01"
            value={perPlatePrice}
            onChange={handlePerPlatePriceChange}
            className="text-gray-800 w-full rounded-md border border-stroke bg-white py-3 pl-8 pr-4 text-lg font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
          />
        </div>
      </div>
    </div>
  );
};

export default PricingConfiguration;
