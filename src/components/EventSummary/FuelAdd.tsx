import React, {useState, useEffect, useMemo} from 'react';
import {FiEdit} from 'react-icons/fi';
import {IoMdCheckmark} from 'react-icons/io';
import {RxCross2} from 'react-icons/rx';
import {
  useAddFuel,
  useGetFuel,
  useUpdateFuel,
} from '@/lib/react-query/queriesAndMutations/cateror/eventsummary';
import {Route} from '@/routes/_app/_event/events.$id';
import {useGetFuels} from '@/lib/react-query/Fuelmaster/fuelmaster';

type FuelItem = {
  id?: string;
  name: 'GAS' | 'COAL';
  quantity: number;
  price: number;
  total: number;
  actualQuantity?: number | null;
  actualPrice?: number | null;
  actualTotal?: number | null;
  paid?: number;
  isPaid?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// Define the fixed structure we always want to show
const FIXED_FUEL_TYPES: ('GAS' | 'COAL')[] = ['GAS', 'COAL'];

const FuelAdd: React.FC = () => {
  const {id} = Route.useParams();
  const eventId = id as string;

  // --- Queries & Mutations ---
  const {
    data: eventFuelData,
    isLoading: eventFuelLoading,
    refetch,
  } = useGetFuel(eventId);
  const {mutate: addFuel} = useAddFuel(eventId);
  const {mutate: updateFuel} = useUpdateFuel();
  const {data: defaultFuelPrices, isLoading: defaultPricesLoading} =
    useGetFuels();

  // --- State ---
  const [editingType, setEditingType] = useState<'GAS' | 'COAL' | null>(null);
  const [fuelItems, setFuelItems] = useState<FuelItem[]>([]);
  const [defaultPrices, setDefaultPrices] = useState<Map<string, number>>(
    new Map(),
  );

  // Unified Form Data
  const [formData, setFormData] = useState<Partial<FuelItem>>({
    quantity: 0,
    price: 0,
    total: 0,
  });

  // Load default fuel prices from API
  useEffect(() => {
    if (defaultFuelPrices && Array.isArray(defaultFuelPrices)) {
      const priceMap = new Map<string, number>();
      defaultFuelPrices.forEach((item) => {
        if (item.name === 'GAS' || item.name === 'COAL') {
          priceMap.set(item.name, item.price);
        }
      });
      setDefaultPrices(priceMap);
      // console.log('Default prices loaded:', Object.fromEntries(priceMap));
    }
  }, [defaultFuelPrices]);

  // Update fuel items when event fuel data changes
  useEffect(() => {
    console.log('Event Fuel Data:', eventFuelData);

    let eventData: FuelItem[] = [];
    if (eventFuelData && Array.isArray(eventFuelData)) {
      eventData = eventFuelData;
    } else if (eventFuelData?.data && Array.isArray(eventFuelData.data)) {
      eventData = eventFuelData.data;
    }

    const mergedItems = FIXED_FUEL_TYPES.map((type) => {
      const existingItem = eventData.find((item) => item.name === type);
      const defaultPrice = defaultPrices.get(type) || 0;

      if (existingItem) {
        // Use existing event data
        return existingItem;
      } else {
        return {
          name: type,
          quantity: 0,
          price: defaultPrice,
          total: 0,
        };
      }
    });

    setFuelItems(mergedItems);
    console.log('Merged fuel items:', mergedItems);
  }, [eventFuelData, defaultPrices]);

  // --- Helpers ---
  const resetForm = () => {
    setEditingType(null);
    setFormData({quantity: 0, price: 0, total: 0});
  };

  const calculateTotal = (qty: number, prc: number) => {
    return (qty || 0) * (prc || 0);
  };

  const getDefaultPrice = (type: string): number => {
    return defaultPrices.get(type) || 0;
  };

  // --- Handlers ---
  const handleEditClick = (item: FuelItem) => {
    setEditingType(item.name);
    setFormData({
      name: item.name,
      quantity: item.quantity || 0,
      price: item.price || getDefaultPrice(item.name),
      total: item.total || 0,
    });
  };

  const handleSave = () => {
    if (!editingType) return;

    // Validation
    if (formData.quantity === undefined || formData.price === undefined) {
      alert('Please fill Quantity and Price.');
      return;
    }

    const quantity = Number(formData.quantity);
    const price = Number(formData.price);
    const total = calculateTotal(quantity, price);

    const payload = {
      name: editingType,
      quantity: quantity,
      price: price,
      total: total,
      eventId: eventId,
    };

    // Check if this fuel type already exists in the DB to decide Update vs Add
    const existingItem = fuelItems.find((i) => i.name === editingType);

    if (existingItem && existingItem.id) {
      // UPDATE existing entry
      updateFuel(
        {
          id: existingItem.id,
          data: payload,
        },
        {
          onSuccess: () => {
            refetch();
            resetForm();
          },
          onError: (error) => {
            console.error('Error updating fuel:', error);
            alert('Failed to update fuel data. Please try again.');
          },
        },
      );
    } else {
      // CREATE new entry
      addFuel(payload, {
        onSuccess: () => {
          refetch();
          resetForm();
        },
        onError: (error) => {
          console.error('Error adding fuel:', error);
          alert('Failed to add fuel data. Please try again.');
        },
      });
    }
  };

  // Loading state
  if (eventFuelLoading || defaultPricesLoading) {
    return <div className="py-8 text-center">Loading fuel data...</div>;
  }

  return (
    <div className="rounded-md border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="border-b border-stroke bg-blue-50 px-4 py-2 dark:border-strokedark dark:bg-meta-4">
        <h3 className="font-semibold text-blue-900 dark:text-white">
          Fuel Details
        </h3>
      </div>

      {/* Content */}
      <div className="overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-meta-4">
            <tr>
              <th className="p-2 text-left font-medium">Fuel Type</th>
              <th className="p-2 text-center font-medium">Quantity (KG)</th>
              <th className="p-2 text-center font-medium">
                Price per Unit (₹)
              </th>
              <th className="p-2 text-center font-medium">Total (₹)</th>
              <th className="p-2 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {FIXED_FUEL_TYPES.map((type) => {
              // Get the item to render (either from API or default)
              const existingData = fuelItems.find((item) => item.name === type);

              const itemToRender: FuelItem = existingData || {
                name: type,
                quantity: 0,
                price: getDefaultPrice(type),
                total: 0,
              };

              const isEditing = editingType === type;
              const defaultPrice = getDefaultPrice(type);

              return (
                <tr
                  key={type}
                  className="border-t border-stroke dark:border-strokedark"
                >
                  {/* Fuel Type (Static) */}
                  <td className="p-2 font-medium text-black dark:text-white">
                    {type}
                  </td>

                  {/* Quantity */}
                  <td className="p-2 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.quantity || 0}
                        onChange={(e) => {
                          const qty = Number(e.target.value) || 0;
                          const price = formData.price || defaultPrice;
                          setFormData({
                            ...formData,
                            quantity: qty,
                            total: calculateTotal(qty, price),
                          });
                        }}
                        className="w-24 rounded border border-stroke px-2 py-1 text-center outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      />
                    ) : (
                      <span className="text-black dark:text-white">
                        {itemToRender.quantity || 0}
                      </span>
                    )}
                  </td>

                  {/* Price */}
                  <td className="p-2 text-center">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price || defaultPrice}
                          onChange={(e) => {
                            const price = Number(e.target.value) || 0;
                            const quantity = formData.quantity || 0;
                            setFormData({
                              ...formData,
                              price: price,
                              total: calculateTotal(quantity, price),
                            });
                          }}
                          className="w-24 rounded border border-stroke px-2 py-1 text-center outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
                        />
                        {formData.price === defaultPrice &&
                          formData.price !== 0 && (
                            <span className="text-gray-500 text-xs">
                              (Default)
                            </span>
                          )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-black dark:text-white">
                          ₹{itemToRender.price || defaultPrice}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Total */}
                  <td className="p-2 text-center font-semibold text-black dark:text-white">
                    ₹
                    {isEditing
                      ? (formData.total || 0).toFixed(2)
                      : (
                          (itemToRender.quantity || 0) *
                          (itemToRender.price || defaultPrice)
                        ).toFixed(2)}
                  </td>

                  {/* Actions */}
                  <td className="p-2 text-center">
                    {isEditing ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={handleSave}
                          title="Save"
                          className="rounded p-1 hover:bg-green-50"
                        >
                          <IoMdCheckmark className="h-5 w-5 text-green-600 hover:scale-110" />
                        </button>
                        <button
                          onClick={resetForm}
                          title="Cancel"
                          className="rounded p-1 hover:bg-red-50"
                        >
                          <RxCross2 className="h-5 w-5 text-red-600 hover:scale-110" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleEditClick(itemToRender)}
                          title="Edit"
                          className="hover:bg-gray-100 rounded p-1"
                        >
                          <FiEdit className="h-4 w-4 text-graydark hover:text-primary dark:text-gray-2" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Info message about default prices */}
        {/* {defaultPrices.size > 0 && (
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <p>Default prices: GAS: ₹{defaultPrices.get('GAS') || 0}/KG, COAL: ₹{defaultPrices.get('COAL') || 0}/KG</p>
            <p className="mt-1">* Default prices are applied when no specific price is set for this event.</p>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default FuelAdd;
