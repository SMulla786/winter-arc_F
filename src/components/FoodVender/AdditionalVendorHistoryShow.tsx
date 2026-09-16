/* eslint-disable */
import React, {useMemo, useState} from 'react';
import {Route} from '@/routes/_app/_vendor/additionalvendorhistoryshow.$id';
import {useGetAdditionalVendorAllHistory} from '@/lib/react-query/queriesAndMutations/cateror/additionalVendor';
import {
  Calendar,
  IndianRupee,
  MapPin,
  Utensils,
  X,
  Clock,
  ClipboardList,
  User,
} from 'lucide-react';
import {FaArrowLeft} from 'react-icons/fa';
import {useRouter} from '@tanstack/react-router';

const AdditionalVendorHistoryShow = () => {
  const {id} = Route.useParams();
  const route = useRouter();

  const {
    data: history = [],
    isLoading,
    isError,
  } = useGetAdditionalVendorAllHistory(id);

  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const format = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const now = new Date();

  const [dateFilter, setDateFilter] = useState({
    from: format(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: format(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  });

  const formatCurrency = (amount: number | undefined) => {
    if (amount == null) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const toggleOpen = (id: string, type: string) => {
    if (type === 'PAYMENT') {
      setOpenIds((prev) => ({...prev, [id]: !prev[id]}));
    }
  };

  // ------ FILTERING ------
  const filtered = useMemo(() => {
    return history
      .filter((it: any) => {
        if (!dateFilter.from && !dateFilter.to) return true;

        const d = new Date(it.createdAt);
        const from = dateFilter.from ? new Date(dateFilter.from) : null;
        const to = dateFilter.to ? new Date(dateFilter.to) : null;

        if (from && d < from) return false;
        if (to && d > to) return false;

        return true;
      })
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [history, dateFilter]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc: any, it: any) => {
        acc.count++;
        acc.total += Number(it.totalAmount || 0);
        return acc;
      },
      {count: 0, total: 0},
    );
  }, [filtered]);

  // ---------- Loading ----------
  if (isLoading)
    return (
      <div className="text-gray-500 flex min-h-screen items-center justify-center">
        Loading history...
      </div>
    );

  if (isError)
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        Failed to load history
      </div>
    );

  return (
    <div className="dark:bg-dark min-h-screen p-4">
      {/* HEADER */}
      <h1 className="text-gray-900 mb-4 flex items-center gap-2 text-lg font-semibold">
        <FaArrowLeft
          className="cursor-pointer"
          onClick={() => route.history.back()}
        />
        Additional Vendor Payment History
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* LEFT SIDE LIST */}
        <div className="space-y-3 lg:col-span-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl bg-white p-10 text-center shadow">
              <div className="bg-gray-100 mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full">
                <Utensils className="text-gray-500 h-10 w-10" />
              </div>
              <h3 className="text-gray-800 text-lg font-semibold">
                No entries found
              </h3>
            </div>
          ) : (
            filtered.map((item: any) => {
              const isOpen = openIds[item.id];

              return (
                <article
                  key={item.id}
                  onClick={() => toggleOpen(item.id, item.type)}
                  className="cursor-pointer rounded-2xl bg-white p-5 shadow-sm ring-1 ring-blue-200 hover:shadow-md dark:bg-boxdark"
                >
                  {/* TOP SUMMARY */}
                  <div className="flex gap-4">
                    <div className="rounded-full bg-blue-50 p-3 ring-1 ring-blue-200">
                      <IndianRupee className="h-5 w-5 text-blue-700" />
                    </div>

                    <div className="flex w-full justify-between">
                      <div>
                        <p className="text-gray-800 text-sm font-medium">
                          {item.type}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(item.createdAt).toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-gray-500 text-sm">Total</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(item.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* EXPANDED DETAILS */}
                  {isOpen &&
                    item.eventVendorHistories?.map((evh: any, idx: number) => {
                      const extra = evh.subeventExtraCost;
                      const subEvent = extra?.subEvent;
                      const event = subEvent?.event;

                      return (
                        <div
                          key={idx}
                          className="border-gray-200 mt-3 border-t pt-3"
                        >
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                            {/* EVENT & SUBEVENT DETAILS */}
                            <h4 className="text-gray-900 flex items-center gap-2 text-sm font-semibold">
                              <ClipboardList className="text-gray-500 h-4 w-4" />
                              Event: {event?.name || '-'}
                            </h4>

                            <div className="text-gray-700 ml-6 mt-1 flex flex-wrap gap-3 text-xs">
                              <p>
                                <MapPin className="text-gray-400 mr-1 inline h-3 w-3" />
                                {subEvent?.address || '-'}
                              </p>
                              <p>
                                <Calendar className="text-gray-400 mr-1 inline h-3 w-3" />
                                {new Date(subEvent?.date).toLocaleDateString(
                                  'en-IN',
                                )}
                                {' • '}
                                {new Date(subEvent?.time).toLocaleTimeString(
                                  'en-IN',
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  },
                                )}
                              </p>
                              <p>
                                <Clock className="text-gray-400 mr-1 inline h-3 w-3" />
                                {new Date(event?.startDate).toLocaleDateString(
                                  'en-IN',
                                )}{' '}
                                →{' '}
                                {new Date(event?.endDate).toLocaleDateString(
                                  'en-IN',
                                )}
                              </p>
                              <p>
                                <User className="text-gray-400 mr-1 inline h-3 w-3" />
                                People:{' '}
                                {subEvent?.actualPeople ||
                                  subEvent?.expectedPeople ||
                                  '-'}
                              </p>
                            </div>

                            {/* TABLE FOR EXTRA COST */}
                            <div className="mt-3">
                              <div className="bg-gray-100 text-gray-700 grid grid-cols-5 p-2 text-xs font-semibold">
                                <div>Particular</div>
                                <div className="text-right">Qty</div>
                                <div className="text-right">Price</div>
                                <div className="text-right">Total</div>
                                <div className="text-right">Paid</div>
                              </div>

                              <div className="grid grid-cols-5 p-2 text-xs">
                                <div>{extra?.particular || '-'}</div>
                                <div className="text-right">
                                  {extra?.quantity}
                                </div>
                                <div className="text-right">
                                  {formatCurrency(extra?.price)}
                                </div>
                                <div className="text-right">
                                  {formatCurrency(extra?.total)}
                                </div>
                                <div className="text-right text-green-600">
                                  {formatCurrency(extra?.paid)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </article>
              );
            })
          )}
        </div>

        {/* RIGHT PANEL: TOTALS + FILTERS */}
        <aside className="space-y-4 lg:col-span-1">
          <div className="rounded-xl bg-white p-4 shadow dark:bg-boxdark">
            <p className="text-gray-500 text-sm">Transactions</p>
            <p className="text-2xl font-semibold text-violet-600">
              {totals.count}
            </p>

            <p className="text-gray-500 mt-2 text-sm">Total Amount</p>
            <p className="font-semibold text-green-600">
              {formatCurrency(totals.total)}
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow dark:bg-boxdark">
            <h3 className="text-gray-800 mb-3 text-sm font-semibold">
              Date Filter
            </h3>

            <div>
              <label className="text-gray-600 text-xs">From</label>
              <input
                type="date"
                value={dateFilter.from}
                onChange={(e) =>
                  setDateFilter((prev) => ({...prev, from: e.target.value}))
                }
                className="mt-1 w-full rounded-lg border px-2 py-2"
              />
            </div>

            <div className="mt-3">
              <label className="text-gray-600 text-xs">To</label>
              <input
                type="date"
                value={dateFilter.to}
                onChange={(e) =>
                  setDateFilter((prev) => ({...prev, to: e.target.value}))
                }
                className="mt-1 w-full rounded-lg border px-2 py-2"
              />
            </div>

            {(dateFilter.from || dateFilter.to) && (
              <button
                className="text-gray-500 mt-3 flex items-center gap-1 text-xs"
                onClick={() => setDateFilter({from: '', to: ''})}
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdditionalVendorHistoryShow;

// import React, { useMemo, useState } from "react";
// import { Route } from "@/routes/_app/_vendor/additionalvendorhistoryshow.$id";
// import { useGetAdditionalVendorAllHistory } from "@/lib/react-query/queriesAndMutations/cateror/additionalVendor";
// import {
//   Calendar,
//   IndianRupee,
//   MapPin,
//   Utensils,
//   X,
//   Clock,
//   ClipboardList,
//   User,
// } from "lucide-react";
// import { FaArrowLeft } from "react-icons/fa";
// import { useRouter } from "@tanstack/react-router";

// const AdditionalVendorHistoryShow = () => {
//   const { id } = Route.useParams();
//   const route = useRouter();

//   const { data: history = [], isLoading, isError } =
//     useGetAdditionalVendorAllHistory(id);

//   const [openIds, setOpenIds] = useState<Record<string, boolean>>({});
//   const [dateFilter, setDateFilter] = useState({ from: "", to: "" });

//   const formatCurrency = (amount: number | undefined) => {
//     if (amount == null) return "-";
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       minimumFractionDigits: 0,
//     }).format(amount);
//   };

//   const toggleOpen = (id: string, type: string) => {
//     if (type === "PAYMENT") {
//       setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
//     }
//   };

//   // FILTERING
//   const filtered = useMemo(() => {
//     return history
//       .filter((it: any) => {
//         if (!dateFilter.from && !dateFilter.to) return true;

//         const d = new Date(it.createdAt);
//         const from = dateFilter.from ? new Date(dateFilter.from) : null;
//         const to = dateFilter.to ? new Date(dateFilter.to) : null;

//         if (from && d < from) return false;
//         if (to && d > to) return false;

//         return true;
//       })
//       .sort(
//         (a: any, b: any) =>
//           new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//       );
//   }, [history, dateFilter]);

//   const totals = useMemo(() => {
//     return filtered.reduce(
//       (acc: any, it: any) => {
//         acc.count++;
//         acc.total += Number(it.totalAmount || 0);
//         return acc;
//       },
//       { count: 0, total: 0 }
//     );
//   }, [filtered]);

//   if (isLoading)
//     return (
//       <div className="text-gray-500 min-h-screen flex items-center justify-center">
//         Loading history...
//       </div>
//     );

//   if (isError)
//     return (
//       <div className="text-red-500 min-h-screen flex items-center justify-center">
//         Failed to load history
//       </div>
//     );

//   return (
//     <div className="min-h-screen dark:bg-dark p-4">
//       {/* HEADER */}
//       <h1 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
//         <FaArrowLeft
//           className="cursor-pointer"
//           onClick={() => route.history.back()}
//         />
//         Additional Vendor Payment History
//       </h1>

//       <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
//         {/* LEFT SIDE LIST */}
//         <div className="lg:col-span-3 space-y-4">
//           {filtered.length === 0 ? (
//             <div className="bg-white rounded-xl p-10 shadow text-center">
//               <div className="bg-gray-100 mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full">
//                 <Utensils className="h-10 w-10 text-gray-500" />
//               </div>
//               <h3 className="text-gray-800 text-lg font-semibold">
//                 No entries found
//               </h3>
//             </div>
//           ) : (
//             filtered.map((item: any) => {
//               const isOpen = openIds[item.id];

//               return (
//                 <article
//                   key={item.id}
//                   onClick={() => toggleOpen(item.id, item.type)}
//                   className="cursor-pointer bg-white dark:bg-boxdark shadow-md hover:shadow-lg p-5 rounded-xl border border-gray-200 transition"
//                 >
//                   {/* ONE TRANSACTION ITEM */}
//                   <div className="flex items-center justify-between">
//                     {/* ICON + TYPE */}
//                     <div className="flex items-center gap-4">
//                       <div className="rounded-full p-3 bg-blue-50 border border-blue-200">
//                         <IndianRupee className="h-5 w-5 text-blue-700" />
//                       </div>

//                       <div>
//                         <p className="text-sm font-semibold text-gray-900 tracking-wide">
//                           {item.type}
//                         </p>
//                         <p className="text-xs text-gray-500 mt-0.5">
//                           {new Date(item.createdAt).toLocaleString("en-IN")}
//                         </p>
//                       </div>
//                     </div>

//                     {/* AMOUNT */}
//                     <div className="text-right">
//                       <p className="text-[11px] text-gray-400 uppercase tracking-wider">
//                         Amount
//                       </p>
//                       <p className="text-green-600 text-base font-bold">
//                         {formatCurrency(item.totalAmount)}
//                       </p>
//                     </div>
//                   </div>

//                   {/* EXPANDED DETAILS */}
//                   {isOpen &&
//                     item.eventVendorHistories?.map((evh: any, idx: number) => {
//                       const extra = evh.subeventExtraCost;
//                       const subEvent = extra?.subEvent;
//                       const event = subEvent?.event;

//                       return (
//                         <div
//                           key={idx}
//                           className="mt-4 border-t pt-4 border-gray-300"
//                         >
//                           <div className="bg-gray-50 p-4 rounded-xl space-y-4">
//                             {/* TITLE */}
//                             <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
//                               <ClipboardList className="h-4 w-4 text-gray-500" />
//                               Event Details
//                             </h4>

//                             {/* EVENT BASIC INFO */}
//                             <div className="grid grid-cols-2 gap-3 pl-1 text-xs text-gray-700">
//                               <div className="flex items-center gap-2">
//                                 <MapPin className="h-3 w-3 text-gray-400" />
//                                 <span className="font-medium">Address:</span>{" "}
//                                 {subEvent?.address || "-"}
//                               </div>

//                               <div className="flex items-center gap-2">
//                                 <Calendar className="h-3 w-3 text-gray-400" />
//                                 <span className="font-medium">Date:</span>{" "}
//                                 {new Date(subEvent?.date).toLocaleDateString(
//                                   "en-IN"
//                                 )}
//                               </div>

//                               <div className="flex items-center gap-2">
//                                 <Clock className="h-3 w-3 text-gray-400" />
//                                 <span className="font-medium">Time:</span>{" "}
//                                 {new Date(subEvent?.time).toLocaleTimeString(
//                                   "en-IN",
//                                   { hour: "2-digit", minute: "2-digit" }
//                                 )}
//                               </div>

//                               <div className="flex items-center gap-2">
//                                 <User className="h-3 w-3 text-gray-400" />
//                                 <span className="font-medium">People:</span>{" "}
//                                 {subEvent?.actualPeople ||
//                                   subEvent?.expectedPeople ||
//                                   "-"}
//                               </div>
//                             </div>

//                             {/* EVENT RANGE */}
//                             <div className="text-xs text-gray-700 pl-1">
//                               <span className="font-medium">Event Range:</span>{" "}
//                               {new Date(event?.startDate).toLocaleDateString(
//                                 "en-IN"
//                               )}{" "}
//                               →{" "}
//                               {new Date(event?.endDate).toLocaleDateString(
//                                 "en-IN"
//                               )}
//                             </div>

//                             {/* EXTRA COST TABLE */}
//                             <div>
//                               <h5 className="text-xs font-semibold text-gray-800 mb-2">
//                                 Extra Cost Details
//                               </h5>

//                               <div className="rounded-lg overflow-hidden border border-gray-200">
//                                 <div className="grid grid-cols-5 bg-gray-100 text-gray-700 text-xs font-semibold p-2">
//                                   <div>Particular</div>
//                                   <div className="text-right">Qty</div>
//                                   <div className="text-right">Price</div>
//                                   <div className="text-right">Total</div>
//                                   <div className="text-right">Paid</div>
//                                 </div>

//                                 <div className="grid grid-cols-5 text-xs p-2 bg-white">
//                                   <div>{extra?.particular || "-"}</div>
//                                   <div className="text-right">
//                                     {extra?.quantity}
//                                   </div>
//                                   <div className="text-right">
//                                     {formatCurrency(extra?.price)}
//                                   </div>
//                                   <div className="text-right">
//                                     {formatCurrency(extra?.total)}
//                                   </div>
//                                   <div className="text-right text-green-600 font-semibold">
//                                     {formatCurrency(extra?.paid)}
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                 </article>
//               );
//             })
//           )}
//         </div>

//         {/* RIGHT PANEL */}
//         <aside className="lg:col-span-1 space-y-4">
//           <div className="bg-white p-4 rounded-xl shadow border">
//             <p className="text-sm text-gray-500">Transactions</p>
//             <p className="text-2xl text-violet-600 font-semibold">
//               {totals.count}
//             </p>

//             <p className="text-sm mt-2 text-gray-500">Total Amount</p>
//             <p className="text-green-600 font-semibold">
//               {formatCurrency(totals.total)}
//             </p>
//           </div>

//           <div className="bg-white p-4 rounded-xl shadow border">
//             <h3 className="text-sm font-semibold text-gray-800 mb-3">
//               Date Filter
//             </h3>

//             <div>
//               <label className="text-xs text-gray-600">From</label>
//               <input
//                 type="date"
//                 value={dateFilter.from}
//                 onChange={(e) =>
//                   setDateFilter((prev) => ({ ...prev, from: e.target.value }))
//                 }
//                 className="w-full border rounded-lg px-2 py-2 mt-1"
//               />
//             </div>

//             <div className="mt-3">
//               <label className="text-xs text-gray-600">To</label>
//               <input
//                 type="date"
//                 value={dateFilter.to}
//                 onChange={(e) =>
//                   setDateFilter((prev) => ({ ...prev, to: e.target.value }))
//                 }
//                 className="w-full border rounded-lg px-2 py-2 mt-1"
//               />
//             </div>

//             {(dateFilter.from || dateFilter.to) && (
//               <button
//                 className="text-xs text-gray-500 mt-3 flex items-center gap-1"
//                 onClick={() => setDateFilter({ from: "", to: "" })}
//               >
//                 <X className="h-3 w-3" /> Clear
//               </button>
//             )}
//           </div>
//         </aside>
//       </div>
//     </div>
//   );
// };

// export default AdditionalVendorHistoryShow;
