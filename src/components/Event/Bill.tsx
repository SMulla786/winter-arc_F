/*eslint-disable*/
import {useAuthContext} from '@/context/AuthContext';
import {useInvoice} from '@/context/InvoiceContext';
import {
  useCreateExtraCost,
  useDeleteExtraCost,
  useGetExtraCost,
  useGetQuotation,
  useUpdateQuotation,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {
  useGetCaterorById,
  useGetDishes,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useGetBill} from '@/lib/react-query/queriesAndMutations/cateror/bill';
import {createQuotationSchema} from '@/lib/validations/qoutation';
import {Route} from '@/routes/_app/_event/events.$id';
import 'jspdf-autotable';
import React, {useEffect, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {z} from 'zod';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericTable, {Column} from '../Forms/Table/GenericTable';
import ShowBill from './ShowBill';
import {SubEventBill} from './SubEventBill';
import {Loader} from '../Loader/Loader';
import {useGetDetails} from '@/lib/react-query/queriesAndMutations/cateror/details';
import toast from 'react-hot-toast';
import SeparateBill from './separateBill';
import {BiInfoCircle} from 'react-icons/bi';
import {MdDelete} from 'react-icons/md';
import {useReactToPrint} from 'react-to-print';
import {useRef} from 'react';
import {FiPlus} from 'react-icons/fi';

type FormValues = z.infer<typeof createQuotationSchema>;

type Charges = {
  id: string;
  name: string;
  amount: number;
  description: string;
};

const Bill: React.FC = () => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Bill-${Math.random().toString(36).substring(7)}`,
  });

  const [charges, setCharges] = useState<Charges[]>([]);
  const [quotationAmount, setQuotationAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [pendingAmount, setPendingAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [finalTotalAmt, setFinalTotalAmt] = useState<number>(0);

  const [totalExtraCost, setTotalExtraCost] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const {data: BillNameChange} = useGetDetails();
  const [addOnsTotal, setAddOnsTotal] = useState(0);
  const [totalBillAmount, setTotalBillAmount] = useState(0);
  const [showAddChargeForm, setShowAddChargeForm] = useState(false);
  const [newCharge, setNewCharge] = useState({name: '', amount: 0});
  const [billGSTData, setBillGSTData] = useState<any>(null);
  const methods = useForm<Charges>({
    defaultValues: {description: 'No Description'},
  });

  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.bill;
  const role = user?.role;
  const {id: EventId} = Route.useParams();
  const {data: billData, refetch, isLoading} = useGetBill(EventId);

  const {data: dishesResponse} = useGetDishes();

  const {data: caterorData} = useGetCaterorById(user?.caterorId ?? '');
  const {mutate: ExtraCost, isPending} = useCreateExtraCost();
  const {data: ExtracostData, isSuccess} = useGetExtraCost(EventId);

  const {mutateAsync: DeleteExtraCost} = useDeleteExtraCost();
  const {data: QuotationData} = useGetQuotation(EventId);

  const {mutateAsync: updateQuotation, isPending: isUpdating} =
    useUpdateQuotation(EventId as string);
  const {invoices} = useInvoice();

  const matchedInvoice = invoices.find(
    (invoice) => invoice.eventId === EventId,
  );

  type BillDetails = {
    billCount: number;
    isgst: boolean;
    gstPercentage: number | null;
    cgst: number | null;
    sgst: number | null;
    billAmount: number | null;
    finalAmount?: number | null;
  };

  const [billDetails, setBillDetails] = useState<BillDetails[]>([
    {
      billCount: 1,
      isgst: false,
      gstPercentage: null,
      cgst: null,
      sgst: null,
      billAmount: null,
      finalAmount: null,
    },
  ]);

  useEffect(() => {
    if (billData) {
      setQuotationAmount(billData?.finalAmount || 0);
      setPaidAmount(billData?.paidAmount || 0);
    }
  }, [billData]);

  useEffect(() => {
    setDiscountAmount(QuotationData?.data?.event?.discountGiven || 0);
  }, [QuotationData]);

  useEffect(() => {
    if (billData?.subEvents) {
      let total = billData.subEvents.reduce((sum: number, each: any) => {
        const peopleCount = each.actualPeople ?? each.expectedPeople ?? 0;
        let packagePrice = each.package && (each.perPlate || null);
        const eventCost = packagePrice
          ? packagePrice
          : each.finalPerPlate * peopleCount;
        return sum + eventCost;
      }, 0);

      const final =
        totalBillAmount + totalExtraCost + addOnsTotal - discountAmount;
      setFinalTotalAmt(final);
    }
  }, [billData, totalExtraCost, discountAmount, addOnsTotal, totalBillAmount]);

  useEffect(() => {
    const totalCalculatedAmount = totalAmount - paidAmount;
    setPendingAmount(totalCalculatedAmount);
  }, [totalAmount, paidAmount]);

  useEffect(() => {
    if (isSuccess && ExtracostData?.data?.length > 0) {
      setCharges(ExtracostData?.data);
    }
    const formattedExtracostTotal =
      ExtracostData?.data?.reduce(
        (prev: number, current: {amount: number}) => prev + current.amount,
        0,
      ) || 0;
    setTotalExtraCost(formattedExtracostTotal);
  }, [isSuccess, ExtracostData]);

  const mappedQuatation =
    billData?.subEvents?.map((item: any) => {
      const peopleCount = item.actualPeople || item.expectedPeople;
      return {
        SubEventName: item.name,
        Category: 'N/A',
        Menu: 'N/A',
        Cost: item.finalAmount,
        People: peopleCount,
        ActualPeople: item.actualPeople,
      };
    }) || [];

  const handleDeleteCharge = (item: Charges) => {
    DeleteExtraCost(item.id, {
      onSuccess: () => {
        setCharges((prev) => prev.filter((c) => c.id !== item.id));
        refetch();
        toast.success('Charge deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete charge');
      },
    });
  };

  const [billName, setBillName] = useState<{label: string; value: string}[]>(
    [],
  );

  useEffect(() => {
    if (BillNameChange) {
      const options = BillNameChange.map((each: any) => ({
        label: each.name,
        value: each.id,
      }));
      setBillName(options);
    }
  }, [BillNameChange]);

  useEffect(() => {
    if (billData?.eventBills?.[0]?.GST) {
      setBillDetails(
        billDetails.map((bill, i) =>
          i === 0
            ? {
                ...bill,
                isgst: true,
                gstPercentage: billData?.eventBills?.[0].GST,
                cgst: billData?.eventBills?.[0].CGST,
                sgst: billData?.eventBills?.[0].SGST,
              }
            : bill,
        ),
      );
    }
  }, [billData]);

  if (isPending || isLoading) {
    return <Loader />;
  }

  const handleAddCharge = () => {
    if (!newCharge.name || !newCharge.name.trim()) {
      toast.error('Charge name is required');
      return;
    }

    if (newCharge.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    const payload = {
      EventId: EventId,
      name: newCharge.name,
      amount: Number(newCharge.amount),
      description: 'No Description',
    };

    ExtraCost(payload, {
      onSuccess: (res) => {
        setCharges((prev) => [res.data, ...prev]);
        setNewCharge({name: '', amount: 0});
        setShowAddChargeForm(false);
        methods.reset();
        toast.success('Charge added successfully');
      },
      onError: (error) => {
        toast.error('Failed to add charge');
      },
    });
  };

  // Define columns for GenericTable
  const chargeColumns: Column<Charges>[] = [
    {
      header: 'Charge Name',
      accessor: 'name',
      className: 'font-medium',
    },
    {
      header: 'Amount',
      accessor: (item: Charges) => `₹${item.amount.toLocaleString('en-IN')}`,
      className: 'font-bold text-right',
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (item: Charges) => (
        <button
          onClick={() => handleDeleteCharge(item)}
          className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
          title="Delete"
        >
          <MdDelete className="h-4 w-4" />
        </button>
      ),
    },
  ];

  // Create a wrapper component for the extra charges section
  const ExtraChargesSection = () => (
    <div className="rounded-sm border border-stroke bg-white px-4 pb-2 pt-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          Extra Charges
        </h2>
        {!showAddChargeForm && (
          <button
            onClick={() => setShowAddChargeForm(true)}
            className="hover:bg-gray-50 flex items-center gap-2 rounded border border-stroke bg-white px-3 py-1.5 text-sm font-medium text-black transition-colors dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:bg-meta-5"
          >
            <FiPlus size={16} />
            Add Charge
          </button>
        )}
      </div>

      {/* Add New Charge Form */}
      {showAddChargeForm && (
        <div className="bg-gray-50 mb-4 rounded-lg border border-stroke p-4 dark:border-strokedark dark:bg-meta-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Charge Name *
              </label>
              <input
                type="text"
                value={newCharge.name}
                onChange={(e) =>
                  setNewCharge({...newCharge, name: e.target.value})
                }
                className="w-full rounded border border-stroke bg-white px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
                placeholder="Enter charge name"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Amount *
              </label>
              <input
                type="number"
                value={newCharge.amount || ''}
                onChange={(e) =>
                  setNewCharge({
                    ...newCharge,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full rounded border border-stroke bg-white px-3 py-2 text-right text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
                placeholder="0"
                min="0"
                step="100"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleAddCharge}
                className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                Add Charge
              </button>
              <button
                onClick={() => {
                  setShowAddChargeForm(false);
                  setNewCharge({name: '', amount: 0});
                }}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Charges Table */}
      {charges.length > 0 ? (
        <GenericTable
          data={charges}
          columns={chargeColumns}
          paginationOff={true}
          itemsPerPage={10}
        />
      ) : (
        !showAddChargeForm && (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No extra charges added. Click "Add Charge" to get started.
            </p>
          </div>
        )
      )}

      {/* Discount Section */}
      <div className="mt-4 rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-red-700 dark:text-red-400">
              Discount Amount
            </span>
            <span className="text-red-500">(-)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-red-700 dark:text-red-400">
              ₹
            </span>
            <input
              type="number"
              value={discountAmount}
              onChange={(e) =>
                setDiscountAmount(parseFloat(e.target.value) || 0)
              }
              className="w-32 rounded-lg border-2 border-red-500 bg-white px-3 py-2 text-right text-lg font-bold text-red-700 outline-none focus:ring-2 focus:ring-red-500 dark:bg-form-input dark:text-red-400"
              min="0"
              step="100"
            />
          </div>
        </div>
      </div>

      {/* Summary Section */}
      {charges.length > 0 && (
        <div className="bg-gray-50 mt-4 rounded-lg p-4 dark:bg-meta-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Subtotal:</span>
              <span className="font-semibold">
                ₹
                {charges
                  .reduce((sum, c) => sum + c.amount, 0)
                  .toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-sm text-red-600">
              <span className="font-medium">Discount:</span>
              <span className="font-semibold">
                -₹{discountAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between border-t border-stroke pt-2 text-lg font-bold">
              <span>Total Charges:</span>
              <span>
                ₹
                {Math.max(
                  charges.reduce((sum, c) => sum + c.amount, 0) -
                    discountAmount,
                  0,
                ).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="bg-white dark:bg-meta-4 dark:text-white">
        <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-blue-800 to-indigo-900 p-6 text-xl font-bold text-white">
          <h1 className="font-semibold">Bill</h1>
          <div className="rounded-full bg-blue-900/50">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
            >
              Download Bill
            </button>
          </div>
        </div>
      </div>

      <SubEventBill
        data={billData}
        QuotationData={QuotationData}
        refetch={refetch}
      />

      {/* Extra Charges Section */}
      <ExtraChargesSection />

      <SeparateBill
        billDetails={billDetails}
        billName={billName}
        setBillDetails={setBillDetails}
        totalAmount={finalTotalAmt}
        eventId={EventId}
        eventData={QuotationData?.data.event}
        addOnsTotal={addOnsTotal}
        totalExtraCost={totalExtraCost}
        discountAmount={discountAmount}
        totalBillAmount={totalBillAmount}
        setBillGSTData={setBillGSTData}
      />

      <div className="my-6 flex items-center justify-end px-6">
        {(role === 'CATEROR' || restriction === 'EDIT') && (
          <button
            onClick={() => {
              const cgst = Number(billGSTData?.[0]?.CGST || 0);
              const sgst = Number(billGSTData?.[0]?.SGST || 0);
              const b = totalBillAmount;
              const c = totalExtraCost;
              const d = addOnsTotal;
              const cg = cgst;
              const sg = sgst;
              const sumAll = b + c + d + cg + sg;
              const final = sumAll - discountAmount;

              const payload = {
                bills: {
                  bills: [billGSTData?.[0] || {}],
                },
                quotation: {
                  quotationAmount,
                  finalAmount: final,
                  paidAmount,
                  balance: pendingAmount,
                  discountGiven: discountAmount,
                },
              };

              updateQuotation(payload, {
                onSuccess: () => {
                  setShowAddChargeForm(false);
                  refetch();
                  toast.success('Bill saved successfully');
                },
                onError: () => {
                  toast.error('Failed to save bill');
                },
              });

              setBillDetails((prev) =>
                prev.map((bill, index) =>
                  index === 0
                    ? {
                        ...bill,
                        finalAmount: finalTotalAmt,
                        cgst:
                          bill.gstPercentage != null
                            ? finalTotalAmt * (bill.gstPercentage / 200)
                            : 0,
                        sgst:
                          bill.gstPercentage != null
                            ? finalTotalAmt * (bill.gstPercentage / 200)
                            : 0,
                      }
                    : bill,
                ),
              );
            }}
            disabled={isUpdating}
            className="hover:bg-primary-dark rounded-lg bg-primary px-6 py-2 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdating ? 'Saving...' : 'Save Bill'}
          </button>
        )}
      </div>

      <div className="hidden">
        {QuotationData &&
          billDetails.map((bill, index) => (
            <ShowBill
              key={index}
              image={
                caterorData?.data?.image ||
                '/src/assets/images/logo/Menubook.png'
              }
              extraCostData={ExtracostData?.data}
              mappedQuatation={mappedQuatation}
              eventData={QuotationData?.data.event}
              totalAmount={finalTotalAmt}
              discountAmount={discountAmount}
              invoices={matchedInvoice?.invoiceNo || 'N/A'}
              totalExtraCost={totalExtraCost}
              refetch={refetch}
              bill={bill}
              index={index}
              billDetails={billDetails}
              setAddOnsTotal={setAddOnsTotal}
              addOnsTotal={addOnsTotal}
              setTotalBillAmount={setTotalBillAmount}
              TotalExtraCost={totalExtraCost}
              printRef={printRef}
            />
          ))}
      </div>
    </>
  );
};

export default Bill;
