/* eslint-disable */
import React, {
  useCallback,
  useEffect,
  ReactNode,
  useMemo,
  useState,
} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {z} from 'zod';
import {useReactToPrint} from 'react-to-print';
import {useRef} from 'react';

// Components
import ShowQuotation from '@/components/Quatation/ShowQuatation';
import SubEventQuatation from '../Event/SubEventQuatation';
import GenericTable, {Column} from '../Forms/Table/GenericTable';
import {Loader} from '../Loader/Loader';

// Hooks and Queries
import {useAuthContext} from '@/context/AuthContext';
import {useGetClientById} from '@/lib/react-query/queriesAndMutations/cateror/client';
import {
  useGetDishes,
  useGetCaterorById,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {
  useCreateExtraCost,
  useDeleteExtraCost,
  useGetExtraCost,
  useGetQuotation,
  useUpdateQuotation,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {
  useAddGstDetails,
  useGetQuatation,
} from '@/lib/react-query/queriesAndMutations/cateror/quatation';

// Schemas and Types
import {createQuotationSchema} from '@/lib/validations/qoutation';
import {Route} from '@/routes/_app/_event/events.$id';
import toast from 'react-hot-toast';
import GenericButton from '../Forms/Buttons/GenericButton';
import {sub} from 'date-fns';

type FormValues = z.infer<typeof createQuotationSchema>;

interface SubEvent {
  SubEventName: string;
  Dish: string;
  Cost: number;
  People: number;
  Category: string;
  Menu: string;
  total: number;
  date: string;
  time: string;
  place: string;
}

interface Charge {
  id?: string;
  name: string;
  amount: number;
  description: string;
}
interface SubEventUpdate {
  date: string | number | Date;
  time: string | number | Date;
  address: string;
  name: ReactNode;
  id: string;
  finalAmount: number;
  expectedCost: number | null;
  expectedPeople: number;
  actualPeople: number;
  perPlate: number;
  fixedPerPlate: number | null;
  dishes: Array<{
    dish: {name: string; category: {name: string}};
    subEventId: string;
  }>;
}

const Quotation: React.FC = () => {
  const {user} = useAuthContext();
  const [showPrint, setShowPrint] = useState(false);

  const restriction = user?.employeeRestriction?.quotation;
  const role = user?.role;
  const {id: eventId} = Route.useParams();
  const [paidAmount, setPaidAmount] = useState(0);
  console.log('paidAmount', paidAmount);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const formMethods = useForm<Charge>({
    defaultValues: {name: '', amount: 0, description: 'No Description'},
  });

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Quotation-${Math.random().toString(36).substring(7)}`,
  });

  // Data Fetching
  const {
    data: quotation,
    isLoading: isQuotationLoading,
    refetch,
  } = useGetQuatation(eventId);

  console.log('quotationnnn////////////////', quotation);
  const {data: dishesResponse, isLoading: isDishesLoading} = useGetDishes();
  const {data: gscaterorData, isLoading: isCaterorLoading} = useGetCaterorById(
    user?.caterorId ?? '',
  );
  const {data: extraCostData, isLoading: isExtraCostLoading} =
    useGetExtraCost(eventId);
  const {
    data: quotationData,
    isLoading: isQuotationDataLoading,
    refetch: quotationRefetch,
  } = useGetQuotation(eventId);

  console.log('quotaionnn data....', quotationData);
  const {data: client, isLoading: isClientLoading} = useGetClientById(
    quotation?.event?.clientId ?? '',
  );
  // const [isGstApplied, setIsGstApplied] = useState<boolean | null>(null);
  const {mutate: addGstDetails, isPending} = useAddGstDetails(eventId);
  // Mutations
  const {mutate: createExtraCost, isPending: isExtraCostPending} =
    useCreateExtraCost();
  const {mutateAsync: deleteExtraCost} = useDeleteExtraCost();
  const {mutateAsync: updateQuotation, isPending: isUpdatePending} =
    useUpdateQuotation(eventId as string);

  // Set initial paid amount when data loads
  useEffect(() => {
    if (isInitialLoad && quotationData?.data?.event?.paidAmount !== undefined) {
      setPaidAmount(quotationData.data.event.paidAmount);
      setIsInitialLoad(false);
    }
  }, [quotationData?.data?.event?.paidAmount, isInitialLoad]);

  const [billAmount, setBillAmount] = useState<number>(0);

  const [isGst, setIsGst] = useState<boolean>(false);
  const [quotationGST, setQuotationGST] = useState<number>(5);
  const [quotationCGST, setCgst] = useState<number>(0);
  const [quotationSGST, setSgst] = useState<number>(0);
  const [finalBillAmount, setFinalBillAmount] = useState<number>(0);
  const [pendingChanges, setPendingChanges] = useState<
    {id: string; cost: number; perPlate: number}[]
  >([]);
  const [newCost, setNewCost] = useState<{id: string; cost: number}[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  console.log('new cost', newCost);
  const eventData = quotationData?.data?.event;
  const total = useMemo(() => {
    if (!eventData?.subEvents?.length) return 0;

    return eventData.subEvents.reduce((sum, subEvent) => {
      const maxPeople = Math.max(
        Number(subEvent.actualPeople) || 0,
        Number(subEvent.expectedPeople) || 0,
      );
      const currentCost =
        subEvent?.perPlate !== 0 &&
        subEvent?.perPlate !== null &&
        subEvent?.perPlate !== undefined
          ? subEvent?.perPlate
          : subEvent?.fixedPerPlate;
      const perPlate = currentCost * maxPeople;

      return sum + perPlate;
    }, 0);
  }, [eventData]);

  const totalAddonsAmount = eventData?.subEvents?.reduce(
    (eventSum: number, subEvent: any) => {
      if (!subEvent.SubeventAddonServices) return eventSum;
      const subEventTotal = subEvent.SubeventAddonServices.reduce(
        (addonSum: number, addon: any) =>
          addon.addonService?.price
            ? addonSum + addon.addonService.price
            : addonSum,
        0,
      );
      return eventSum + subEventTotal;
    },
    0,
  );

  useEffect(() => {
    setBillAmount(total + totalAddonsAmount);
  }, [total, totalAddonsAmount]);

  useEffect(() => {
    if (quotationData?.data?.event) {
      const event = quotationData.data.event;
      if (event.quotationGST !== undefined) {
        setQuotationGST(event.quotationGST);

        if (event.quotationGST > 0) {
          setIsGst(true);
        }
      } else {
        setIsGst(false);
      }
    }
  }, [quotationData]);

  const calculateGST = (amount: number, gstPercent: number) => {
    const totalGst = (amount * gstPercent) / 100;
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    const finalAmount = amount + totalGst;
    return {
      cgst,
      sgst,
      finalAmount,
    };
  };

  const checkDishName = useCallback(
    (dishId: string) => {
      if (!dishesResponse?.data?.dishes) return 'Unknown Dish';
      const dish = dishesResponse.data.dishes.find(
        (dish: {id: string}) => dish.id === dishId,
      );
      return dish?.name || 'Unknown Dish';
    },
    [dishesResponse?.data?.dishes],
  );

  // Calculate total people
  const totalPeople = useMemo(() => {
    const subEvents = quotation?.event?.subEvents;
    if (!Array.isArray(subEvents)) return 0;
    const total = subEvents.reduce(
      (sum: number, subEvent: {expectedPeople: number}) =>
        sum + (subEvent.expectedPeople || 0),
      0,
    );
    return total;
  }, [quotation?.event?.subEvents]);

  // Calculate price per person
  const pricePerPerson = useMemo(() => {
    if (!quotationData?.data?.event?.finalAmount || totalPeople === 0) return 0;
    return quotationData.data.event.finalAmount / totalPeople;
  }, [quotationData?.data?.event?.finalAmount, totalPeople]);

  // Transform quotation data
  const mappedQuotation = useMemo(() => {
    const subEvents = quotation?.event?.subEvents;
    if (!Array.isArray(subEvents)) return [];
    return subEvents.map((item: any) => {
      const dishes = Array.isArray(item.dishes) ? item.dishes : [];
      const menu =
        dishes.length > 0
          ? dishes.map((dish: any) => checkDishName(dish.dishId)).join(', ')
          : 'N/A';

      const people = item.expectedPeople || 0;
      const totalCost = pricePerPerson * people;

      return {
        SubEventName: item?.name || 'N/A',
        Category: item.dishes?.[0]?.dish?.category?.name || 'N/A',
        Menu: menu,
        Cost: pricePerPerson,
        People: people,
        total: totalCost,
        date: item.date ? new Date(item.date).toLocaleDateString() : 'N/A',
        time: item.time ? new Date(item.time).toLocaleTimeString() : 'N/A',
        place: item.address || 'N/A',
      };
    });
  }, [quotation?.event?.subEvents, checkDishName, pricePerPerson]);

  // Memoize calculated values
  const quotationAmount = useMemo(() => {
    return quotationData?.data?.event?.quotationAmount || 0;
  }, [quotationData?.data?.event?.quotationAmount]);

  const totalExtraCost = useMemo(() => {
    if (!extraCostData?.data || !Array.isArray(extraCostData.data)) return 0;
    return extraCostData.data.reduce(
      (acc, curr) => acc + (curr.amount || 0),
      0,
    );
  }, [extraCostData?.data]);

  const totalAmount = useMemo(
    () => quotationData?.data?.event?.finalAmount || 0,
    [quotationData?.data?.event?.finalAmount],
  );

  const pendingAmount = useMemo(
    () => totalAmount - paidAmount,
    [totalAmount, paidAmount],
  );

  const handleChargeDelete = useCallback(
    async (charge: Charge) => {
      if (charge.id) await deleteExtraCost(charge.id);
    },
    [deleteExtraCost],
  );

  const handleSubmitCharge = useCallback(
    (data: Charge) => {
      if (!data.name || !data.amount) return;

      createExtraCost({
        EventId: eventId,
        name: data.name,
        amount: Number(data.amount),
        description: data.description || 'No Description',
      });
      formMethods.reset();
    },
    [createExtraCost, eventId, formMethods],
  );
  useEffect(() => {
    if (isGst) {
      const {cgst, sgst, finalAmount} = calculateGST(billAmount, quotationGST);
      setCgst(cgst);
      setSgst(sgst);
      setFinalBillAmount(finalAmount);
    } else {
      setCgst(0);
      setSgst(0);
      setFinalBillAmount(billAmount);
    }
  }, [quotationGST, billAmount, isGst]);
  const handleSubmit = () => {
    const costPayload =
      quotation?.event?.subEvents?.map((each: any) => {
        const costItem = newCost.find((c) => c.id === each.id);
        console.log('cost item....', costItem);
        const perPlate = costItem?.cost;
        const totalCost = perPlate * each.expectedPeople;
        return {
          id: each.id,
          perPlate: perPlate,
          cost: totalCost,
        };
      }) || [];

    const gstPayload = {
      quotationGST: Number(quotationGST),
      quotationCGST: Number(quotationCGST),
      quotationSGST: Number(quotationSGST),
      isGST: isGst,
      subeventCost: costPayload,
    };
    console.log('Cost payload:', costPayload);
    addGstDetails({data: gstPayload});
  };

  const ClientDetails = () => (
    <div className="dark:border-form-strokedark dark:text-white">
      <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-blue-800 to-indigo-900 text-xl font-bold text-white">
        <h1 className="rounded-t-lg p-8 text-xl font-semibold text-white">
          Quotation
        </h1>
        <div className="rounded-full bg-blue-900/50 p-2">
          <button
            onClick={() => {
              handlePrint();
              setShowPrint(true);
            }}
            className="flex items-center gap-2 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
          >
            Download Quotation
          </button>
        </div>
      </div>
    </div>
  );

  if (
    isQuotationLoading ||
    isDishesLoading ||
    isCaterorLoading ||
    isClientLoading ||
    isQuotationDataLoading ||
    isExtraCostLoading
  ) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <div className="">
      <ClientDetails />
      <SubEventQuatation
        editingIndex={editingIndex}
        newCost={newCost}
        setEditingIndex={setEditingIndex}
        setNewCost={setNewCost}
        data={quotation}
        refetch={refetch}
      />
      {/* GST Details Section */}
      <div className="mt-4 w-full rounded-lg bg-white px-6 py-2 shadow dark:bg-black">
        <h3 className="text-gray-800 mb-2 text-lg font-semibold dark:text-white">
          GST Details
        </h3>

        <div className="flex flex-col justify-between">
          <div className="flex w-full flex-wrap items-end gap-4">
            {/* GST Label and Radio Buttons */}
            <div className="flex w-full flex-col sm:w-auto">
              <p className="text-sm text-black dark:text-white">GST</p>
              <div className="flex flex-col items-start sm:flex-row sm:items-center">
                <div className="flex items-center">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={isGst}
                      onChange={() => setIsGst(true)}
                      className="h-4 w-4"
                    />
                    Yes
                  </label>

                  <label className="ml-2 flex items-center gap-1">
                    <input
                      type="radio"
                      checked={!isGst}
                      onChange={() => {
                        setIsGst(false);
                        setQuotationGST(0);
                      }}
                      className="h-4 w-4"
                    />
                    No
                  </label>
                </div>
              </div>
            </div>

            {/* GST Percentage Input */}
            {isGst && (
              <div className="w-full sm:w-1/2 md:w-1/6">
                <label className="text-gray-700 block text-sm font-medium dark:text-white">
                  GST (%)
                </label>
                <input
                  type="number"
                  value={quotationGST ?? 5}
                  onChange={(e) => {
                    const value = Number(e.target.value) || 0;
                    if (value > 100) {
                      toast.error('GST percentage cannot exceed 100%');
                      return;
                    }
                    setQuotationGST(value);
                  }}
                  // className="border-gray-300 w-full rounded-md border px-2 py-1 text-sm text-black focus:outline-none dark:border-strokedark dark:bg-transparent dark:text-white"
                  className="text-gray-900 border-gray-300 dark:border-gray-600 w-full rounded-md border px-2 py-1 text-sm focus:outline-none dark:border-strokedark dark:bg-transparent dark:text-white"
                />
              </div>
            )}

            {/* CGST */}
            {isGst && quotationGST !== null && (
              <div className="w-full sm:w-1/2 md:w-1/6">
                <label className="text-gray-700 block text-sm font-medium dark:text-white">
                  CGST
                </label>
                <input
                  type="number"
                  value={quotationCGST?.toFixed(2) ?? ''}
                  readOnly
                  className="text-gray-900 border-gray-300 dark:border-gray-600 w-full rounded-md border px-2 py-1 text-sm focus:outline-none dark:border-strokedark dark:bg-transparent dark:text-white"
                />
              </div>
            )}

            {/* SGST */}
            {isGst && quotationGST !== null && (
              <div className="w-full sm:w-1/2 md:w-1/6">
                <label className="text-gray-700 block text-sm font-medium dark:text-white">
                  SGST
                </label>
                <input
                  type="number"
                  value={quotationSGST?.toFixed(2) ?? ''}
                  readOnly
                  className="text-gray-900 border-gray-300 dark:border-gray-600 w-full rounded-md border px-2 py-1 text-sm focus:outline-none dark:border-strokedark dark:bg-transparent dark:text-white"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="my-6 flex items-center justify-end">
        <div className="mt-2 flex w-full justify-end sm:mt-0 sm:w-auto">
          {(role === 'CATEROR' || restriction === 'EDIT') && (
            <GenericButton
              onClick={() => {
                handleSubmit();
              }}
              disabled={isPending}
              className="w-full rounded bg-blue-500 px-4 py-1 text-white sm:w-auto"
            >
              {isPending ? 'Submitting...' : 'Save Quotation'}
            </GenericButton>
          )}
        </div>
      </div>

      <div className="hidden">
        <h1 className="rounded-lg bg-blue-900 p-8 text-4xl font-bold text-white">
          Quotation Details
        </h1>
        {showPrint && (
          <ShowQuotation
            image={
              gscaterorData?.data?.image ||
              '/src/assets/images/logo/Menubook.png'
            }
            totalAmount={totalAmount}
            pendingAmount={pendingAmount}
            paidAmount={paidAmount}
            mappedQuatation={mappedQuotation}
            eventData={quotationData?.data?.event}
            totalExtraCost={totalExtraCost}
            charges={extraCostData?.data || []}
            isGstApplied={isGst}
            quotationGST={quotationGST}
            quotationCGST={quotationCGST}
            quotationSGST={quotationSGST}
            quotationColor={gscaterorData?.data?.quotationColor || 'blue'}
            quatationDesign={gscaterorData?.data?.quatationDesign || 'default'}
            printRef={printRef}
            quotation={quotation}
          />
        )}
      </div>
    </div>
  );
};

export default Quotation;
