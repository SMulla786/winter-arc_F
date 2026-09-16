/*eslint-disable*/
import {eventValidationSchema} from '@/lib/validation/eventSchema';
import {zodResolver} from '@hookform/resolvers/zod';
import React, {useEffect, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import toast from 'react-hot-toast';
import {FormValues} from '../MultipleDishComponents/types';
import {
  useAddGstBill,
  useGetGstBill,
} from '@/lib/react-query/queriesAndMutations/cateror/bill';
import {useAuthContext} from '@/context/AuthContext';

type BillDetails = {
  billCount: number;
  isgst: boolean;
  gstPercentage: number | null;
  cgst: number | null;
  sgst: number | null;
  billAmount: number | null;
  finalAmount?: number | null;
  receiptName?: string;
};

interface Option {
  label: string;
  value: string;
}

interface SeparateBillsProps {
  billDetails: BillDetails[];
  billName: Option[];
  totalAmount: number;
  setBillDetails: React.Dispatch<React.SetStateAction<BillDetails[]>>;
  eventId: string;
  // eventData: any;
  addOnsTotal: number;
  totalExtraCost: number;
  discountAmount: number;
  // totalAmount: number;
  totalBillAmount: number;
  setBillGSTData: React.Dispatch<React.SetStateAction<any>>;
}

const SeparateBill: React.FC<SeparateBillsProps> = ({
  billDetails,
  billName,
  totalAmount,
  setBillDetails,
  eventId,
  setBillGSTData,
  eventData,
  addOnsTotal,
  totalExtraCost,
  discountAmount,
  totalBillAmount,
  // totalAmount,
}) => {
  console.log('all total ======', totalAmount);
  console.log('raw material cost=====', totalBillAmount);
  console.log('extra ======', totalExtraCost);
  console.log('discount======', discountAmount);
  console.log('addonn======', addOnsTotal);

  const calculateGST = (baseAmount: number, gstPercentage: number) => {
    const halfPercent = gstPercentage / 2;
    const cgst = (baseAmount * halfPercent) / 100;
    const sgst = (baseAmount * halfPercent) / 100;
    const finalAmount = baseAmount + cgst + sgst;
    return {cgst, sgst, finalAmount};
  };

  const methods = useForm<FormValues>({
    resolver: zodResolver(eventValidationSchema),
    defaultValues: {},
  });
  const {mutate: addGstBill, isPending} = useAddGstBill(eventId);
  const {data: getGstBill} = useGetGstBill(eventId);
  console.log('...............', getGstBill);
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.bill;
  const role = user?.role;
  const handleBillCountChange = (newCount: number) => {
    setBillDetails((prev) => {
      const updated = [...prev];
      updated[0] = {...updated[0], billCount: newCount};
      return updated;
    });
  };

  useEffect(() => {
    if (!eventData?.quotationGST) return; // no quotation GST → do nothing
    if (!billDetails || billDetails.length === 0) return;

    const bill = billDetails[0];

    // If GST already applied manually OR saved GST exists, DO NOT override
    const savedGstExists =
      getGstBill?.bills?.some((b: any) => b.GST > 0) ?? false;

    if (bill.isgst || (bill.gstPercentage ?? 0) > 0 || savedGstExists) {
      return; // user already set GST or GST exists in backend
    }

    // Otherwise, apply quotationGST
    setBillDetails((prev) => {
      const updated = [...prev];

      updated[0].isgst = true;
      updated[0].gstPercentage = eventData.quotationGST;

      const {cgst, sgst, finalAmount} = calculateGST(
        totalAmount,
        eventData.quotationGST,
      );

      updated[0].cgst = cgst;
      updated[0].sgst = sgst;
      updated[0].finalAmount = finalAmount;

      return updated;
    });
  }, [eventData?.quotationGST, getGstBill, totalAmount]);

  // inside the useEffect in SeparateBill.tsx
  useEffect(() => {
    const count = billDetails[0]?.billCount || 1;

    setBillDetails((prev) => {
      let updated = [...prev];

      // Ensure array length matches bill count
      while (updated.length < count) {
        updated.push({
          billCount: 1,
          isgst: false,
          gstPercentage: null,
          cgst: null,
          sgst: null,
          billAmount: 0,
          finalAmount: null,
        });
      }

      updated = updated.map((bill, index) => {
        if (index !== 0) return bill;

        const baseAmount = totalAmount;
        const {isgst, gstPercentage} = bill;

        if (isgst && gstPercentage !== null) {
          const {cgst, sgst, finalAmount} = calculateGST(
            baseAmount,
            gstPercentage,
          );

          return {
            ...bill,
            billAmount: baseAmount,
            cgst,
            sgst,
            finalAmount,
          };
        }

        return {
          ...bill,
          billAmount: baseAmount,
          cgst: 0,
          sgst: 0,
          finalAmount: baseAmount,
        };
      });

      return updated.slice(0, count);
    });
  }, [totalAmount, billDetails[0]?.billCount]);

  // useEffect(() => {
  //   const count = billDetails[0]?.billCount || 1;
  //   setBillDetails((prev) => {
  //     let updated = [...prev];

  //     // Add missing bills if count increased
  //     while (updated.length < count) {
  //       updated.push({
  //         billCount: 1,
  //         isgst: false,
  //         gstPercentage: null,
  //         cgst: null,
  //         sgst: null,
  //         billAmount: 0,
  //         finalAmount: null,
  //       });
  //     }

  //     // Update bill amounts according to totalAmount
  //     updated = updated.map((bill, idx) => {
  //       // If it’s the first bill, set it to totalAmount
  //       if (idx === 0) {
  //         const amount = totalAmount; // don't subtract CGST/SGST

  //         return {
  //           ...bill,
  //           billAmount: amount,
  //           finalAmount: bill.isgst
  //             ? calculateGST(amount, bill.gstPercentage || 0).finalAmount
  //             : amount,
  //         };
  //       }
  //       return bill;
  //     });

  //     // if (
  //     //   updated.length > 0 &&
  //     //   (updated[0].billAmount === null || updated[0].billAmount === 0)
  //     // ) {
  //     //   updated[0].billAmount = totalAmount;
  //     //   updated[0].finalAmount = totalAmount;
  //     // }

  //     return updated.slice(0, count);
  //   });
  // }, [billDetails[0]?.billCount, totalAmount, setBillDetails]);

  const handleSubmit = () => {
    const billsData = billDetails.map((bill) => {
      const billAmount = Number(bill.billAmount) || 0;
      const safeTotal = Number(totalAmount) || 0;

      const amountPercentage =
        safeTotal > 0 ? Math.round((billAmount / safeTotal) * 100) : 0;

      return {
        amountPercentage,
        isGST: bill.isgst,
        SGST: Math.round(bill.sgst ?? 0),
        CGST: Math.round(bill.cgst ?? 0),
        GST: bill.gstPercentage ?? 0,
      };
    });

    setBillGSTData(billsData);
    addGstBill({bills: billsData});
  };

  useEffect(() => {
    const billsData = billDetails.map((bill) => {
      const billAmount = Number(bill.billAmount) || 0;
      const safeTotal = Number(totalAmount) || 0;

      const amountPercentage =
        safeTotal > 0 ? Math.round((billAmount / safeTotal) * 100) : 0;

      return {
        amountPercentage, // ✅ always a number
        isGST: bill.isgst,
        SGST: Math.round(bill.sgst ?? 0),
        CGST: Math.round(bill.cgst ?? 0),
        GST: bill.gstPercentage ?? 0,
      };
    });

    setBillGSTData(billsData);
  }, [billDetails, totalAmount, setBillGSTData]);

  // const [totalAddonsAmount, setTotalAddonsAmount] = useState(0);
  // useEffect(() => {
  //   const subEvents = eventData?.subEvents || [];

  //   const filteredSubEvents = subEvents.filter(
  //     (subEvent: any) =>
  //       subEvent.SubeventAddonServices &&
  //       subEvent.SubeventAddonServices.length > 0,
  //   );

  //   const total = filteredSubEvents.reduce(
  //     (sum, subEvent) =>
  //       sum +
  //       subEvent.SubeventAddonServices.reduce(
  //         (addonSum: number, addon: any) =>
  //           addonSum + (addon.addonService?.price || 0),
  //         0,
  //       ),
  //     0,
  //   );

  //   setTotalAddonsAmount(total);
  // }, [eventData?.subEvents]);

  return (
    <div>
      {/* Bill counter UI */}
      {/* <div className="mt-4 bg-white p-4 dark:bg-boxdark">
          <div className="flex justify-between bg-blue-100 p-4 text-xl font-bold dark:bg-meta-4">
            <p>Number of Bills</p>
          </div>

          <div className="mt-4 flex items-center">
            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 rounded-l-md px-3 py-2"
              onClick={() =>
                handleBillCountChange(Math.max(1, billDetails[0].billCount - 1))
              }
            >
              -
            </button>

            <input
              type="number"
              min="1"
              value={billDetails[0].billCount}
              onChange={(e) =>
                handleBillCountChange(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="border-gray-300 w-16 rounded-md border border-stroke bg-transparent px-2 py-1 text-center text-sm text-black outline-none"
            />

            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 rounded-r-md px-3 py-2"
              onClick={() => handleBillCountChange(billDetails[0].billCount + 1)}
            >
              +
            </button>
          </div>
        </div> */}

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit}>
          {billDetails.map((bill, index) => (
            <div key={index} className="mt-4 bg-white dark:bg-boxdark">
              {/* <div className="flex justify-between bg-blue-100 p-4 text-xl font-bold">
                  <p>Change Bill Details {index + 1}</p>
                </div> */}

              {/* Dropdown for Receipt Name */}
              {/* <div className="col-span-6 mt-3">
                  <label className="text-gray-700 block text-sm font-medium">
                    Receipt Name
                  </label>
                  <select
                    value={bill.receiptName || ''}
                    onChange={(e) => {
                      const updated = [...billDetails];
                      updated[index].receiptName = e.target.value;
                      setBillDetails(updated);
                    }}
                    className="border-gray-300 w-full rounded-md border border-stroke bg-transparent p-1 px-2 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="">Select Receipt</option>
                    {billName.map((option, i) => (
                      <option key={i} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div> */}

              {/* <div className="grid grid-cols-12 gap-4"> */}
              {/* <div className="col-span-6 mt-3">
                    <p className="text-gray-700 block text-sm font-medium">
                      Total Amount: {totalAmount}
                    </p>
                  </div> */}

              {/* Bill Amount */}
              {/* <div className="col-span-6 mt-3">
                    <label className="text-gray-700 block text-sm font-medium">
                      Bill Amount
                    </label>
                    <input
                      type="number"
                      // value={totalBillAmount ?? ''}
                      value={totalAmount ?? 0}
                      // value={totalAmount}
                      className="border-gray-300 w-full rounded-md border border-stroke px-2 py-1 text-sm text-black outline-none"
                      onChange={(e) => {
                        const value = Number(e.target.value) || 0;
                        const updated = [...billDetails];

                        // Check if total entered exceeds totalAmount
                        const totalEntered = updated.reduce(
                          (sum, b, i) =>
                            sum + (i === index ? value : b.billAmount || 0),
                          0,
                        );

                        if (totalEntered > totalAmount) {
                          toast.error(
                            'Total of all bills cannot exceed Total Amount after discount',
                          );
                          return;
                        }

                        updated[index].billAmount = value;

                        if (
                          updated[index].isgst &&
                          updated[index].gstPercentage
                        ) {
                          const {cgst, sgst, finalAmount} = calculateGST(
                            value,
                            updated[index].gstPercentage!,
                          );
                          updated[index].cgst = cgst;
                          updated[index].sgst = sgst;
                          updated[index].finalAmount = finalAmount;
                        } else {
                          updated[index].finalAmount = value;
                          updated[index].cgst = 0;
                          updated[index].sgst = 0;
                        }

                        setBillDetails(updated);
                      }}
                    />
                  </div> */}

              {/* GST Radio */}
              {/* </div> */}
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
                              checked={bill.isgst}
                              onChange={() => {
                                const updated = [...billDetails];
                                updated[index].isgst = true;
                                updated[index].gstPercentage = 5;
                                const {cgst, sgst, finalAmount} = calculateGST(
                                  totalAmount || 0,
                                  5,
                                );
                                updated[index].cgst = cgst;
                                updated[index].sgst = sgst;
                                updated[index].finalAmount = finalAmount;
                                setBillDetails(updated);
                              }}
                              className="h-4 w-4"
                            />
                            Yes
                          </label>

                          <label className="ml-2 flex items-center gap-1">
                            <input
                              type="radio"
                              checked={!bill.isgst}
                              onChange={() => {
                                const updated = [...billDetails];
                                updated[index].isgst = false;
                                updated[index].gstPercentage = null;
                                updated[index].cgst = null;
                                updated[index].sgst = null;
                                updated[index].finalAmount =
                                  updated[index].billAmount;
                                setBillDetails(updated);
                              }}
                              className="h-4 w-4"
                            />
                            No
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* GST Percentage Input */}
                    {bill.isgst && (
                      <div className="w-full sm:w-1/2 md:w-1/6">
                        <label className="text-gray-700 block text-sm font-medium dark:text-white">
                          GST (%)
                        </label>
                        <input
                          type="number"
                          value={bill.gstPercentage ?? 5}
                          className="text-gray-900 border-gray-300 dark:border-gray-600 w-full rounded-md border px-2 py-1 text-sm focus:outline-none dark:border-strokedark dark:bg-transparent dark:text-white"
                          onChange={(e) => {
                            const value = Number(e.target.value) || 0;
                            if (value > 100) {
                              toast.error('GST percentage cannot exceed 100%');
                              return;
                            }
                            const updated = [...billDetails];
                            updated[index].gstPercentage = value;
                            const {cgst, sgst, finalAmount} = calculateGST(
                              totalAmount || 0,
                              value,
                            );
                            updated[index].cgst = cgst;
                            updated[index].sgst = sgst;
                            updated[index].finalAmount = finalAmount;
                            setBillDetails(updated);
                          }}
                        />
                      </div>
                    )}

                    {/* CGST */}
                    {bill.isgst && bill.gstPercentage !== null && (
                      <div className="w-full sm:w-1/2 md:w-1/6">
                        <label className="text-gray-700 block text-sm font-medium dark:text-white">
                          CGST
                        </label>
                        <input
                          type="number"
                          value={bill.cgst?.toFixed(2) ?? ''}
                          readOnly
                          className="text-gray-900 border-gray-300 dark:border-gray-600 w-full rounded-md border px-2 py-1 text-sm focus:outline-none dark:border-strokedark dark:bg-transparent dark:text-white"
                        />
                      </div>
                    )}

                    {/* SGST */}
                    {bill.isgst && bill.gstPercentage !== null && (
                      <div className="w-full sm:w-1/2 md:w-1/6">
                        <label className="text-gray-700 block text-sm font-medium dark:text-white">
                          SGST
                        </label>
                        <input
                          type="number"
                          value={bill.sgst?.toFixed(2) ?? ''}
                          readOnly
                          className="text-gray-900 border-gray-300 dark:border-gray-600 w-full rounded-md border px-2 py-1 text-sm focus:outline-none dark:border-strokedark dark:bg-transparent dark:text-white"
                        />
                      </div>
                    )}

                    {/* Submit Button */}
                    {/* <div className="mt-2 flex w-full justify-end sm:mt-0 sm:w-auto">
                      {(role === 'CATEROR' || restriction === 'EDIT') && (
                        <GenericButton
                          onClick={handleSubmit}
                          disabled={isPending}
                          className="w-full rounded bg-blue-500 px-4 py-1 text-white sm:w-auto"
                        >
                          {isPending ? 'Submitting...' : 'Submit Bills'}
                        </GenericButton>
                      )}
                    </div> */}
                  </div>

                  {/* Total Bill Amount */}
                  {/* {bill.isgst && (
                    <div className="mt-3">
                      <p className="text-gray-700 text-sm font-medium dark:text-white">
                        Bill Amount: {bill.finalAmount?.toFixed(2) ?? 0}
                      </p>
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          ))}
        </form>
      </FormProvider>
    </div>
  );
};

export default SeparateBill;

// import {eventValidationSchema} from '@/lib/validation/eventSchema';
// import {zodResolver} from '@hookform/resolvers/zod';
// import React, {useEffect} from 'react';
// import {FormProvider, useForm} from 'react-hook-form';
// import toast from 'react-hot-toast';
// import {FormValues} from '../MultipleDishComponents/types';
// import {
//   useAddGstBill,
//   useGetGstBill,
// } from '@/lib/react-query/queriesAndMutations/cateror/bill';
// import GenericButton from '../Forms/Buttons/GenericButton';
// import {useAuthContext} from '@/context/AuthContext';

// type BillDetails = {
//   billCount: number;
//   isgst: boolean;
//   gstPercentage: number | null;
//   cgst: number | null;
//   sgst: number | null;
//   billAmount: number | null;
//   finalAmount?: number | null;
//   receiptName?: string;
// };

// interface Option {
//   label: string;
//   value: string;
// }

// interface SeparateBillsProps {
//   billDetails: BillDetails[];
//   billName: Option[];
//   totalAmount: number;
//   setBillDetails: React.Dispatch<React.SetStateAction<BillDetails[]>>;
//   eventId: string;
//   eventData: any;
//   addOnsTotal: number;
//   totalExtraCost: number;
//   discountAmount: number;
//   totalBillAmount: number;
// }

// const SeparateBill: React.FC<SeparateBillsProps> = ({
//   billDetails,
//   billName,
//   totalAmount,
//   setBillDetails,
//   eventId,
//   eventData,
//   addOnsTotal,
//   totalExtraCost,
//   discountAmount,
//   totalBillAmount,
// }) => {
//   const methods = useForm<FormValues>({
//     resolver: zodResolver(eventValidationSchema),
//     defaultValues: {},
//   });

//   const {mutate: addGstBill, isPending} = useAddGstBill(eventId);
//   const {data: getGstBill} = useGetGstBill(eventId);
//   const {user} = useAuthContext();
//   const restriction = user?.employeeRestriction?.bill;
//   const role = user?.role;

//   // Helper function to calculate GST amounts
//   const calculateGST = (baseAmount: number, gstPercentage: number) => {
//     const halfPercent = gstPercentage / 2;
//     const cgst = (baseAmount * halfPercent) / 100;
//     const sgst = (baseAmount * halfPercent) / 100;
//     const finalAmount = baseAmount + cgst + sgst;
//     return {cgst, sgst, finalAmount};
//   };

//   const handleBillCountChange = (newCount: number) => {
//     setBillDetails((prev) => {
//       const updated = [...prev];
//       updated[0] = {...updated[0], billCount: newCount};
//       return updated;
//     });
//   };

//   // Sync bill details when count or total changes
//   useEffect(() => {
//     const count = billDetails[0]?.billCount || 1;
//     setBillDetails((prev) => {
//       let updated = [...prev];

//       // Add missing bills if count increased
//       while (updated.length < count) {
//         updated.push({
//           billCount: 1,
//           isgst: false,
//           gstPercentage: null,
//           cgst: null,
//           sgst: null,
//           billAmount: 0,
//           finalAmount: null,
//         });
//       }

//       // Update first bill with totalAmount
//       updated = updated.map((bill, idx) => {
//         if (idx === 0) {
//           const amount = totalAmount;
//           return {
//             ...bill,
//             billAmount: amount,
//             finalAmount: bill.isgst
//               ? calculateGST(amount, bill.gstPercentage || 0).finalAmount
//               : amount,
//           };
//         }
//         return bill;
//       });

//       return updated.slice(0, count);
//     });
//   }, [billDetails[0]?.billCount, totalAmount, setBillDetails]);

//   const handleSubmit = () => {
//     const billsData = billDetails.map((bill) => ({
//       amountPercentage: Math.round((bill.billAmount! / totalAmount) * 100),
//       isGST: bill.isgst,
//       SGST: Math.round(bill.sgst || 0),
//       CGST: Math.round(bill.cgst || 0),
//       GST: bill.gstPercentage ?? eventData?.quotationGST ?? 0, // default GST from eventData
//     }));

//     addGstBill({bills: billsData});
//   };

//   return (
//     <div>
//       <FormProvider {...methods}>
//         <form onSubmit={handleSubmit}>
//           {billDetails.map((bill, index) => (
//             <div key={index} className="mt-4 bg-white p-4 dark:bg-boxdark">
//               <div className="mt- w-full">
//                 <h3 className="text-gray-800 mb-2 text-lg font-semibold dark:text-white">
//                   GST Details
//                 </h3>
//                 <div className="flex w-full items-end gap-4">
//                   {/* GST Yes/No Radio */}
//                   <div className="flex flex-col">
//                     <p className="text-sm text-black dark:text-white">GST</p>
//                     <div className="flex items-center">
//                       <label className="mr-4 flex items-center">
//                         <input
//                           type="radio"
//                           checked={bill.isgst || eventData?.quotationGST > 0}
//                           onChange={() => {
//                             const updated = [...billDetails];
//                             updated[index].isgst = true;
//                             updated[index].gstPercentage =
//                               eventData?.quotationGST ?? 5; // Default from eventData

//                             const gstRate = updated[index].gstPercentage ?? 0;

//                             const {cgst, sgst, finalAmount} = calculateGST(
//                               totalAmount || 0,
//                               gstRate,
//                             );
//                             updated[index].cgst = cgst;
//                             updated[index].sgst = sgst;
//                             updated[index].finalAmount = finalAmount;

//                             setBillDetails(updated);
//                           }}
//                           className="mr-1 h-4 w-4"
//                         />
//                         Yes
//                       </label>

//                       <label className="flex items-center">
//                         <input
//                           type="radio"
//                           checked={
//                             !bill.isgst &&
//                             !eventData?.quotationGST &&
//                             eventData?.quatationGST === 0
//                           }
//                           onChange={() => {
//                             const updated = [...billDetails];
//                             updated[index] = {
//                               ...updated[index],
//                               isgst: false,
//                               gstPercentage: null,
//                               cgst: null,
//                               sgst: null,
//                               finalAmount: totalAmount,
//                             };
//                             setBillDetails(updated);
//                           }}
//                           className="mr-1 h-4 w-4"
//                         />
//                         No
//                       </label>
//                     </div>
//                   </div>

//                   {/* GST Percentage Input */}
//                   {bill.isgst && (
//                     <div className="flex-0.5">
//                       <label className="text-gray-700 block text-sm font-medium">
//                         GST (%)
//                       </label>
//                       <input
//                         type="number"
//                         value={
//                           bill.gstPercentage !== null
//                             ? bill.gstPercentage
//                             : eventData?.quotationGST || 0
//                         }
//                         className="border-gray-300 w-full rounded-md border px-2 py-1 text-sm text-black outline-none"
//                         onChange={(e) => {
//                           const value = Number(e.target.value) || 0;
//                           const updated = [...billDetails];

//                           if (value > 100) {
//                             toast.error('GST percentage cannot exceed 100%');
//                             return;
//                           }

//                           updated[index].gstPercentage = value;

//                           const {cgst, sgst, finalAmount} = calculateGST(
//                             totalAmount || 0,
//                             value,
//                           );
//                           updated[index].cgst = cgst;
//                           updated[index].sgst = sgst;
//                           updated[index].finalAmount = finalAmount;

//                           setBillDetails(updated);
//                         }}
//                       />
//                     </div>
//                   )}

//                   {/* CGST */}
//                   {bill.isgst && (
//                     <div className="flex-0.5">
//                       <label className="text-gray-700 block text-sm font-medium">
//                         CGST
//                       </label>
//                       <input
//                         type="number"
//                         value={bill.cgst?.toFixed(2) ?? ''}
//                         readOnly
//                         className="bg-gray-100 border-gray-300 w-full rounded-md border px-2 py-1 text-sm text-black outline-none"
//                       />
//                     </div>
//                   )}

//                   {/* SGST */}
//                   {bill.isgst && (
//                     <div className="flex-0.5">
//                       <label className="text-gray-700 block text-sm font-medium">
//                         SGST
//                       </label>
//                       <input
//                         type="number"
//                         value={bill.sgst?.toFixed(2) ?? ''}
//                         readOnly
//                         className="bg-gray-100 border-gray-300 w-full rounded-md border px-2 py-1 text-sm text-black outline-none"
//                       />
//                     </div>
//                   )}
//                 </div>

//                 {/* Total Bill Amount */}
//                 {bill.isgst && (
//                   <div className="mt-3">
//                     <p className="text-gray-700 text-sm font-medium">
//                       Bill Amount: {bill.finalAmount?.toFixed(2) ?? totalAmount}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}

//           {(role === 'CATEROR' || restriction === 'EDIT') && (
//             <div className="mt-4 flex items-center justify-end">
//               <GenericButton
//                 onClick={handleSubmit}
//                 disabled={isPending}
//                 className="rounded bg-blue-500 px-4 py-2 text-white"
//               >
//                 {isPending ? 'Submitting...' : 'Submit Bills'}
//               </GenericButton>
//             </div>
//           )}
//         </form>
//       </FormProvider>
//     </div>
//   );
// };

// export default SeparateBill;
