/* eslint-disable */
import {useEffect} from 'react';
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
  // 🔹 Get people count
  const getPeopleCount = () => {
    const subEvent =
      subEventRateList?.data?.event?.subEvents?.find(
        (se: any) => se.id === subEventForm?.id,
      ) || {};

    return subEvent.actualPeople || subEvent.expectedPeople || 1;
  };

  // 🔹 AUTO CALCULATED (PURE - NO PROFIT EFFECT)
  const getBasePerPlatePrice = () => {
    const peopleCount = getPeopleCount();

    const totalWithProfit = calculateTotal(subEventForm?.id);
    const profit = subEventForm?.profit || 0;

    // remove profit from total
    const baseTotal = totalWithProfit / (1 + profit / 100);

    return peopleCount > 0 ? baseTotal / peopleCount : 0;
  };

  // 🔹 WITH PROFIT (USED FOR FINAL CALCULATION)
  const getFinalPerPlateFromProfit = () => {
    const peopleCount = getPeopleCount();
    const total = calculateTotal(subEventForm?.id);

    return peopleCount > 0 ? total / peopleCount : 0;
  };

  // 🔹 Sync initial perPlate ONLY if empty
  useEffect(() => {
    if (perPlate && perPlate > 0) return;

    const calculated = getFinalPerPlateFromProfit();
    setPerPlate(Number(calculated.toFixed(2)));
  }, [subEventForm?.id]);

  // 🔹 Manual Final Per Plate Change
  const handlePerPlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (isNaN(value) || value < 0) return;

    setPerPlate(value);

    const people = getPeopleCount();
    const newTotal = value * people;

    const basePerPlate = getBasePerPlatePrice();
    const baseTotal = basePerPlate * people;

    const newProfit =
      baseTotal > 0 ? ((newTotal - baseTotal) / baseTotal) * 100 : 0;

    const subEventIndex = formValues.subEvents.findIndex(
      (se) => se.id === subEventForm?.id,
    );

    setValue(
      `subEvents.${subEventIndex}.profit`,
      Math.max(0, Math.round(newProfit)),
    );
  };

  // 🔹 Profit Change → updates Final Per Plate
  const handleProfitChange = (value: number) => {
    const subEventIndex = formValues.subEvents.findIndex(
      (se) => se.id === subEventForm?.id,
    );

    const newProfit = Math.max(0, value);
    setValue(`subEvents.${subEventIndex}.profit`, newProfit);

    const calculated = getFinalPerPlateFromProfit();
    setPerPlate(Number(calculated.toFixed(2)));
  };

  const autoPerPlate = Number(getBasePerPlatePrice().toFixed(2));

  return (
    <div className="from-gray-50 to-gray-100 rounded-md border border-stroke bg-gradient-to-br p-6 dark:border-strokedark">
      <h3 className="text-gray-800 mb-4 font-semibold">
        Pricing Configuration
      </h3>

      {/* Profit */}
      <div className="mb-6">
        <label className="text-gray-700 mb-2 block text-sm font-medium">
          Profit Margin (%)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="1"
            value={subEventForm?.profit ?? 0}
            onChange={(e) => handleProfitChange(Number(e.target.value))}
            className="w-full rounded-md border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-black"
          />
          <span>%</span>
        </div>
      </div>

      {/* Final Per Plate */}
      <div className="mb-6">
        <label className="text-gray-700 mb-2 block text-sm font-medium">
          Final Per Plate Price
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            ₹
          </div>
          <input
            type="number"
            min="0"
            step="0.01"
            value={perPlate}
            onChange={handlePerPlateChange}
            className="w-full rounded-md border border-stroke py-3 pl-8 pr-4 text-lg font-bold dark:border-strokedark dark:bg-black"
          />
        </div>
      </div>

      {/* Auto Calculated */}
      <div className="mb-6">
        <label className="text-gray-700 mb-2 block text-sm font-medium">
          Per Plate Price (auto calculated)
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            ₹
          </div>
          <input
            type="number"
            value={autoPerPlate}
            readOnly
            className="bg-gray-100 w-full rounded-md border border-stroke py-3 pl-8 pr-4 text-lg font-bold dark:border-strokedark dark:bg-black"
          />
        </div>
      </div>
    </div>
  );
};

export default PricingConfiguration;
