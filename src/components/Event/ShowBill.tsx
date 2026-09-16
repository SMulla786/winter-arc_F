/*eslint-disable*/
import LeftBottom from '@/assets/images/Bill/LeftBottom.png';
import LeftTop from '@/assets/images/Bill/LeftTop.png';
import RightBottom from '@/assets/images/Bill/RightBottom.png';
import RightTop from '@/assets/images/Bill/RightTop.png';
import React, {useEffect, useRef, useState} from 'react';
import GenericButton from '../Forms/Buttons/GenericButton';
import {useGetPaymentDetails} from '@/lib/react-query/queriesAndMutations/cateror/paymentdetails';
import {useGetTerms} from '@/lib/react-query/queriesAndMutations/cateror/termcondition';
import {useAuthContext} from '@/context/AuthContext';
import {useReactToPrint} from 'react-to-print';
import {format} from 'date-fns';
import {useGetQuatationImage} from '@/lib/react-query/queriesAndMutations/cateror/quatation';
import TemplateCard1 from '../TemplatePage/TemplateCard1';
import TemplateCard2 from '../TemplatePage/TemplateCard2';
import TemplateCard3 from '../TemplatePage/TemplateCard3';
import TemplateCard4 from '../TemplatePage/TemplateCard4';
import TemplateCard5 from '../TemplatePage/TemplateCard5';
import TemplateCard6 from '../TemplatePage/TemplateCard6';
import {
  useGetBill,
  useGetGstBill,
} from '@/lib/react-query/queriesAndMutations/cateror/bill';
import {Route} from '@/routes/_app/_event/events.$id';
import TemplateCard7 from '../TemplatePage/TemplateCard7';
import TemplateCard8 from '../TemplatePage/TemplateCard8';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useGetTotalAmount} from '@/lib/react-query/queriesAndMutations/cateror/income';

// Function to group dishes by category and sort alphabetically
const groupAndSortDishes = (dishes: any[]) => {
  if (!dishes || dishes.length === 0) return new Map();

  const categoryMap = new Map<string, any[]>();

  dishes.forEach((dishItem) => {
    const categoryName = dishItem.dish?.category?.name || 'Other';
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, []);
    }
    categoryMap.get(categoryName)?.push(dishItem);
  });

  // Sort dishes within each category alphabetically by dish name
  categoryMap.forEach((dishesList, category) => {
    dishesList.sort((a, b) => {
      const nameA = a.dish?.name?.toLowerCase() || '';
      const nameB = b.dish?.name?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });
  });

  // Sort categories alphabetically
  const sortedCategories = new Map(
    Array.from(categoryMap.entries()).sort((a, b) => a[0].localeCompare(b[0])),
  );

  return sortedCategories;
};

// Utility functions for Indian date formatting
const formatIndianDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDateRange = (startDate: string, endDate: string) => {
  const formattedStart = formatIndianDate(startDate);
  const formattedEnd = formatIndianDate(endDate);
  return formattedStart === formattedEnd
    ? formattedStart
    : `${formattedStart} to ${formattedEnd}`;
};

interface SubEvent {
  dishes: {dish: {name: string; category: {name: string}}}[];
  package: {
    id: string;
    name: string;
    description: string | null;
    caterorId: string;
    createdAt: string; // or Date if you convert it
  };

  name: string;
  date: string;
  time: string;
  expectedCost: number;
  expectedPeople: number;
  actualPeople: number | null;
  discountGiven: number;
  finalPerPlate: number;
  biilingCost?: number;
  note?: string;
  SubeventAddonServices?: any[];
}

interface User {
  email: string;
  phoneNumber: string;
  fullname: string;
  gstin?: string;
}

interface Cateror {
  user: User;
  paymentDetails?: {
    gstin?: string;
  };
}

interface Client {
  user: User;
  address?: string;
}

interface EventData {
  name: string;
  startDate: string;
  endDate: string;
  cateror: Cateror;
  client: Client;
  subEvents: SubEvent[];
  paidAmount: number;
}
interface ExtraCost {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  eventId: string;
  subeventId: string | null;
  createdAt: string;
}

interface ShowQuotationProps {
  image: string;
  mappedQuatation: any[];
  eventData: EventData;
  setShowQuotation?: (show: boolean) => void;
  totalAmount: number;
  discountAmount: number;
  invoices: string;
  extraCostData: ExtraCost[];
  totalExtraCost: number;
  refetch?: () => void;
  quotationColor: string;
  quatationDesign: string;
  bill: {
    billAmount?: number;
    gstPercentage?: number;
    cgst?: number;
    sgst?: number;
    finalAmount?: number;
  };
  index: number;
  billDetails?: any;
  setAddOnsTotal: (total: number) => void;
  setTotalBillAmount: (amount: number) => void;
  TotalExtraCost: number;
  printRef: React.RefObject<HTMLDivElement>;
}

const ShowBill: React.FC<ShowQuotationProps> = ({
  extraCostData,
  image,
  mappedQuatation,
  eventData,
  totalAmount,
  discountAmount,
  invoices,
  totalExtraCost,
  quotationColor,
  quatationDesign,
  bill,
  index,
  billDetails,
  setAddOnsTotal,
  setTotalBillAmount,
  TotalExtraCost,
  printRef,
}) => {
  const [loading, setLoading] = useState(false);
  const quotationRef = useRef<HTMLDivElement>(null);
  const formattedDate = formatIndianDate(new Date().toISOString());

  const {user} = useAuthContext();
  const id = user?.caterorId ?? '';
  const {data: termsResponse} = useGetTerms(id);
  const {data: paymentData} = useGetPaymentDetails(id);
  const {data: quotationImage, isLoading} = useGetQuatationImage(id);
  const {id: EventId} = Route.useParams();
  const {data: billData} = useGetBill(EventId);
  const userId = user?.caterorId;
  const {data} = useGetCaterorById(userId!);
  const caterorData = data?.data;
  const {data: getGstBill, refetch: refetchGST} = useGetGstBill(EventId);

  const [finalCGST, setFinalCGST] = useState(0);
  const [finalSGST, setFinalSGST] = useState(0);
  const {data: Total} = useGetTotalAmount(EventId);
  useEffect(() => {
    if (billDetails?.[0]?.gst > 0) {
      setFinalCGST(billDetails?.[0]?.cgst || 0);
      setFinalSGST(billDetails?.[0]?.sgst || 0);
    } else if (getGstBill?.eventBills?.[0]) {
      setFinalCGST(getGstBill.eventBills[0].CGST || 0);
      setFinalSGST(getGstBill.eventBills[0].SGST || 0);
    }
  }, [getGstBill, billDetails, refetchGST]);

  const templates: any = {
    template7: <TemplateCard7 />,
    template8: <TemplateCard8 />,
  };

  const subTotal = eventData?.subEvents?.reduce((sum, subEvent) => {
    const expected = subEvent?.expectedPeople || 0;
    const actual = subEvent?.actualPeople || 0;

    const maxPeople = Math.max(expected, actual);
    const perPlate = subEvent?.finalPerPlate;

    return sum + perPlate * maxPeople;
  }, 0);

  const finalTotal = subTotal + (totalExtraCost || 0) - (discountAmount || 0);
  const pendingAmount = Math.max(0, finalTotal - (eventData?.paidAmount || 0));

  if (!eventData?.subEvents || eventData?.subEvents?.length === 0) {
    return <div className="text-center">No bill data available.</div>;
  }

  let billAmount = 0;

  const addOnsTotal = eventData.subEvents.reduce((sum, item) => {
    const addons = item.SubeventAddonServices;

    if (Array.isArray(addons)) {
      const totalPrice = addons.reduce((addonSum, addon) => {
        const price = addon.addonService?.price || 0;
        return addonSum + price;
      }, 0);
      return sum + totalPrice;
    }

    return sum;
  }, 0);

  setAddOnsTotal(addOnsTotal);

  return (
    <div className="w-full">
      <div
        className="border-gray-400 w-full bg-white p-4 text-black shadow-lg dark:bg-boxdark"
        ref={printRef}
      >
        <div className="relative text-[#222529] dark:text-white">
          {templates[quotationImage?.quatationDesign]}
        </div>

        <div className="mb-2 py-2 text-center">
          <h1 className="font-croissant text-2xl font-extrabold text-[#343a40] sm:text-3xl">
            {finalSGST || finalCGST > 0 ? 'Tax Invoice' : 'Cash Invoice'}
          </h1>
        </div>
        {/* Header */}

        {eventData && (
          <div className="">
            {/* Client & Event Info Row - Compact Version */}
            <div className="mt-2 flex flex-col justify-between gap-6 sm:flex-row">
              {/* CLIENT INFORMATION - LEFT SIDE */}
              <div className="w-full px-2 sm:w-1/2">
                <div className="">
                  <p className="font-croissant text-sm font-bold text-[#6F7F65]">
                    Client Information
                  </p>
                </div>

                <div className="">
                  <span className="w-24 gap-2 font-croissant text-sm font-bold text-[#6F7F65]">
                    Name:{' '}
                  </span>
                  <span className="font-lora text-sm font-semibold text-[#343a40]">
                    {billData?.client.name || 'N/A'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-1">
                  <div>
                    <span className="w-24 font-croissant text-sm font-bold text-[#6F7F65]">
                      Phone:{' '}
                    </span>
                    <span className="font-lora text-sm font-semibold text-[#343a40]">
                      {billData?.client?.phoneNumber || 'N/A'}
                    </span>
                  </div>

                  <div>
                    <span className="w-24 font-croissant text-sm font-bold text-[#6F7F65]">
                      Address:{' '}
                    </span>
                    <span className="font-lora text-sm font-semibold text-[#343a40]">
                      {billData?.client?.address || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* EVENT INFORMATION - RIGHT SIDE */}
              <div className="flex w-full justify-end sm:w-1/2">
                <div className="px-2 text-right">
                  <div className="">
                    <p className="font-croissant text-sm font-bold text-[#6F7F65]">
                      Event Information
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="font-croissant text-sm font-bold text-[#6F7F65]">
                        Name:{' '}
                      </span>
                      <span className="ml-2 font-lora text-sm font-semibold text-[#343a40]">
                        {eventData.name}
                      </span>
                    </div>
                    <div>
                      <span className="font-croissant text-sm font-bold text-[#6F7F65]">
                        Date:{' '}
                      </span>
                      <span className="ml-2 font-lora text-sm font-semibold text-[#343a40]">
                        {formatDateRange(
                          eventData.startDate,
                          eventData.endDate,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mt-2 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#6F7F57] text-white">
                    <th className="px-2 py-1 text-left font-croissant">
                      Date & Time
                    </th>
                    <th className="px-2 py-1 text-left font-croissant">
                      Sub-Event
                    </th>
                    <th className="px-4 py-3 text-left font-croissant">
                      Menu Items
                    </th>
                    <th className="px-2 py-1 text-right font-croissant">
                      Note
                    </th>
                    <th className="px-2 py-1 text-right font-croissant">
                      Cost (per person)
                    </th>
                    <th className="px-2 py-1 text-right font-croissant">
                      People
                    </th>
                    <th className="px-2 py-1 text-right font-croissant">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {eventData.subEvents.map((item, index) => {
                    const maxPeople = Math.max(
                      item.expectedPeople || 0,
                      item.actualPeople || 0,
                    );
                    // const perPersonCost =
                    //   item.perPlate || item.finalPerPlate || 0;
                    let perPersonCost =
                      (item?.package && item?.perPlate) ||
                      item.finalPerPlate ||
                      0;
                    // const matchingRange = item?.package?.packageRange?.find(
                    //   (range: any) =>
                    //     maxPeople >= range.from && maxPeople <= range.to,
                    // );
                    // const amount =
                    //   matchingRange?.price || maxPeople * perPersonCost;
                    const amount =
                      // (item?.package && item?.perPlate) ||
                      maxPeople * perPersonCost;
                    billAmount = amount + billAmount;
                    setTotalBillAmount(billAmount);

                    // Group dishes by category
                    const groupedDishes = groupAndSortDishes(item.dishes);

                    return (
                      <React.Fragment key={`subevent-${index}`}>
                        <tr
                          className={
                            index % 2 === 0 ? 'bg-[#f8f9f6]' : 'bg-white'
                          }
                        >
                          <td className="px-2 py-1 font-lora text-sm text-[#343a40]">
                            {item.date
                              ? format(new Date(item.date), 'dd/MM/yy')
                              : 'N/A'}
                            <br />
                            {item.time
                              ? format(new Date(item.time), 'hh:mm a')
                              : 'N/A'}
                          </td>
                          <td className="px-4 py-3 font-lora text-sm text-[#343a40]">
                            {item.name || 'N/A'}
                          </td>
                          <td className="px-2 py-1">
                            {item?.package?.name && (
                              <div className="mb-2">
                                <span className="font-semibold uppercase text-green-700 dark:text-green-400">
                                  ({item?.package?.name})
                                </span>
                              </div>
                            )}
                            {groupedDishes.size > 0 ? (
                              <div className="space-y-3">
                                {Array.from(groupedDishes.entries()).map(
                                  ([categoryName, categoryDishes]) => (
                                    <div key={categoryName}>
                                      <div className="mb-1 font-bold text-[#6F7F65] dark:text-[#8F9F85]">
                                        {categoryName}
                                      </div>
                                      <ul className="ml-2 list-inside list-disc">
                                        {categoryDishes.map(
                                          (dish: any, i: number) => (
                                            <li
                                              key={`menu-${i}`}
                                              className="pl-2 -indent-4 font-lora text-sm text-[#343a40]"
                                            >
                                              {dish.dish.name}
                                            </li>
                                          ),
                                        )}
                                      </ul>
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : (
                              <div className="font-lora text-sm text-[#343a40]">
                                No menu items
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-1 text-right font-lora text-[#343a40]">
                            <span className="flex-1">
                              {item.note == ''
                                ? ''
                                : item.note
                                  ? item.note
                                  : ''}
                            </span>
                          </td>

                          <td className="px-2 py-1 text-right font-lora text-[#343a40]">
                            ₹{perPersonCost.toFixed(2)}
                          </td>
                          <td className="px-2 py-1 text-right font-lora text-[#343a40]">
                            {maxPeople}
                          </td>
                          <td className="px-2 py-1 text-right font-lora text-[#343a40]">
                            ₹{amount.toFixed(2)}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Addons Table */}
            {addOnsTotal > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#6F7F57] text-white">
                      <th className="px-2 py-1 text-left font-croissant">
                        Date
                      </th>
                      <th className="px-2 py-1 text-left font-croissant">
                        Sub-Event
                      </th>
                      <th className="px-2 py-1 text-left font-croissant">
                        AddOns / Charges
                      </th>
                      <th className="px-4 py-3 text-right font-croissant">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventData.subEvents
                      .filter(
                        (subEvent) =>
                          subEvent.SubeventAddonServices &&
                          subEvent.SubeventAddonServices.length > 0,
                      )
                      .map((subEvent, index) => {
                        const addonsAmount =
                          subEvent.SubeventAddonServices.reduce(
                            (sum, addon) =>
                              sum + (addon.addonService?.price || 0),
                            0,
                          );

                        return (
                          <tr
                            key={`subevent-${index}`}
                            className={
                              index % 2 === 0 ? 'bg-[#f8f9f6]' : 'bg-white'
                            }
                          >
                            <td className="px-4 py-3 font-lora text-sm text-[#343a40]">
                              {subEvent.date
                                ? format(new Date(subEvent.date), 'dd/MM/yy')
                                : 'N/A'}
                              <br />
                              {subEvent.time
                                ? format(new Date(subEvent.time), 'hh:mm a')
                                : 'N/A'}
                            </td>
                            <td className="px-4 py-3 font-lora text-sm text-[#343a40]">
                              {subEvent.name || 'N/A'}
                            </td>
                            <td className="px-4 py-3 font-lora text-sm text-[#343a40]">
                              {subEvent.SubeventAddonServices.map(
                                (addon, i) => (
                                  <div key={`addon-${i}`} className="text-sm">
                                    {addon.addonService.name}
                                  </div>
                                ),
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-lora text-[#343a40]">
                              {subEvent.SubeventAddonServices.map(
                                (addon, i) => (
                                  <div key={`addon-${i}`} className="text-sm">
                                    {addon.addonService?.price || 0}
                                  </div>
                                ),
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}

            {/* extra cost tablee */}
            {extraCostData.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#6F7F57] text-white">
                      <th className="px-2 py-1 text-left font-croissant">
                        Date
                      </th>
                      <th className="px-2 py-1 text-left font-croissant">
                        Charge Name
                      </th>

                      <th className="px-4 py-3 text-right font-croissant">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {extraCostData.map((extra, index) => {
                      return (
                        <tr key={index}>
                          <td className="px-2 py-1 font-lora text-[#343a40]">
                            {extra?.createdAt}
                          </td>
                          <td className="px-2 py-1 font-lora text-[#343a40]">
                            {extra?.name}
                          </td>

                          <td className="px-2 py-1 text-right font-lora text-[#343a40]">
                            {extra?.amount}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary Section */}
            <div className="mt-8 flex flex-col-reverse sm:flex-row">
              <div className="mt-2 w-full sm:mt-0 sm:w-1/2">
                <div className="rounded-lg bg-[#f1f3ee] p-4">
                  <h3 className="mb-2 font-croissant text-sm font-bold text-[#6F7F65]">
                    Payment Information
                  </h3>
                  <div className="">
                    <p className="font-lora text-[#343a40]">
                      <span className="text-sm font-semibold">
                        Account Holder:
                      </span>{' '}
                      {paymentData?.data?.AccountHolderName || 'N/A'}
                    </p>
                    <p className="font-lora text-[#343a40]">
                      <span className="text-sm font-semibold">Bank Name:</span>{' '}
                      {paymentData?.data?.BankName || 'N/A'}
                    </p>
                    <p className="font-lora text-[#343a40]">
                      <span className="text-sm font-semibold">
                        Account Number:
                      </span>{' '}
                      {paymentData?.data?.AccountNo || 'N/A'}
                    </p>
                    <p className="font-lora text-[#343a40]">
                      <span className="text-sm font-semibold">IFSC Code:</span>{' '}
                      {paymentData?.data?.IFSC || 'N/A'}
                    </p>
                    <p className="font-lora text-[#343a40]">
                      <span className="text-sm font-semibold">UPI ID:</span>{' '}
                      {paymentData?.data?.upi || 'N/A'}
                    </p>
                    <div className="font-lora text-[#343a40]">
                      <p className="text-sm font-semibold">
                        GST:{' '}
                        {eventData?.cateror?.user?.gstin ||
                          eventData?.cateror?.paymentDetails?.gstin ||
                          'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-1/2 sm:pl-8">
                <div className="rounded-lg border border-[#e0e0e0] p-4">
                  <h3 className="mb-2 font-croissant text-sm font-bold text-[#6F7F65]">
                    Summary
                  </h3>
                  <div className="">
                    {!bill?.billAmount && index == 0 && (
                      <div className="flex justify-between font-lora text-sm text-[#343a40]">
                        <span>Sub Total:</span>
                        <span>₹{subTotal.toFixed(2)}</span>
                      </div>
                    )}

                    {totalExtraCost > 0 && !bill?.billAmount && index == 0 && (
                      <div className="flex justify-between font-lora text-sm text-[#343a40]">
                        <span>Extra Cost:</span>
                        <span>₹{totalExtraCost.toFixed(2)}</span>
                      </div>
                    )}

                    {bill?.billAmount > 0 && (
                      <div className="flex justify-between font-lora text-sm text-[#343a40]">
                        <span>Bill Amount:</span>
                        <span>₹{billAmount.toFixed(2)}</span>
                      </div>
                    )}

                    {bill?.billAmount && (
                      <div className="flex justify-between font-lora text-sm text-[#343a40]">
                        <span>Extra Amount:</span>
                        <span>₹{TotalExtraCost.toFixed(2)}</span>
                      </div>
                    )}

                    {addOnsTotal > 0 && (
                      <div className="flex justify-between font-lora text-sm text-[#343a40]">
                        <span>Add Ons:</span>
                        <span>₹{addOnsTotal.toFixed(2)}</span>
                      </div>
                    )}

                    {discountAmount > 0 && (
                      <div className="flex justify-between font-lora text-sm text-[#343a40]">
                        <span>Discount:</span>
                        <span>-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    {bill?.billAmount && (
                      <div className="flex justify-between font-lora text-sm text-[#343a40]">
                        <span>CGST:</span>
                        <span>₹{finalCGST.toFixed(2)}</span>
                      </div>
                    )}

                    {bill?.billAmount && (
                      <div className="flex justify-between font-lora text-sm text-[#343a40]">
                        <span>SGST:</span>
                        <span>₹{finalSGST.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="my-2 border-t border-[#e0e0e0]"></div>

                    <div className="flex justify-between font-lora text-sm text-[#343a40]">
                      <span>Paid:</span>
                      <span>₹{Total?.paid.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between font-lora text-sm text-[#343a40]">
                      <span>Pending:</span>
                      <span>
                        ₹
                        {(
                          Number(addOnsTotal) +
                          Number(billAmount) +
                          Number(TotalExtraCost) +
                          Number(finalCGST) +
                          Number(finalSGST) -
                          Number(discountAmount) -
                          Number(Total?.paid)
                        ).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between font-lora text-sm font-semibold text-[#343a40]">
                      <span>Total Amount:</span>
                      <span>
                        ₹
                        {(
                          Number(addOnsTotal) +
                          Number(billAmount) +
                          Number(TotalExtraCost) +
                          Number(finalCGST) +
                          Number(finalSGST) -
                          Number(discountAmount)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mt-2 border-t border-[#e0e0e0] px-2 pt-2">
              <h3 className="mb-2 font-croissant text-sm font-bold text-[#6F7F65]">
                Terms & Conditions
              </h3>
              <ul className="list-inside list-disc space-y-1 font-lora text-sm text-[#343a40]">
                {termsResponse?.data?.map((term: any, index: number) => (
                  <li key={`term-${index}`}>{term.terms}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Signatures */}
        <div className="mt-12 flex justify-between px-2">
          <div className="text-center">
            <div className="mb-1 h-0.5 w-32 bg-[#6F7F65]"></div>
            <p className="font-croissant text-[#6F7F65]">Customer Signature</p>
          </div>
          <div className="text-center">
            <div className="mb-1 h-0.5 w-32 bg-[#6F7F65]"></div>
            <p className="font-croissant text-[#6F7F65]">
              {data?.data?.user?.fullname}
            </p>
            <p className="font-croissant text-sm text-[#6F7F65]">
              Authorized Signature
            </p>
          </div>
        </div>
      </div>

      {/* Download Button */}
      {/* <div className="mt-8 flex justify-center">
        <GenericButton
          onClick={handlePrint}
          className="rounded-lg bg-[#009E60] px-8 py-3 text-white transition-colors hover:bg-[#007b4e] focus:outline-none focus:ring-2 focus:ring-[#009E60] focus:ring-opacity-50"
          disabled={loading}
        >
          {loading ? 'Generating PDF...' : 'Download Bill'}
        </GenericButton>
      </div> */}
    </div>
  );
};

export default ShowBill;
