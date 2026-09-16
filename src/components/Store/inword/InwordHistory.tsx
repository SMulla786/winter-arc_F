// /*eslint-disable*/
// import React, {useState, useMemo, useRef, useEffect} from 'react';
// import {FiEye, FiX, FiPrinter, FiFilter, FiCalendar} from 'react-icons/fi';
// import {format, parseISO, addMinutes, startOfDay, endOfDay} from 'date-fns';
// import {useInwordHistory} from '../storeApi';
// import GenericTable, {Column} from '../../Forms/Table/GenericTable';
// import GenericButton from '../../Forms/Buttons/GenericButton';
// import toast from 'react-hot-toast';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
// import {useAuthContext} from '@/context/AuthContext';

// // ──────────────────────────────────────────────────────────────
// // Types
// // ──────────────────────────────────────────────────────────────
// interface Material {
//   id: string;
//   name: string;
//   unit: string;
//   categoryId: string;
//   category: {
//     id: string;
//     name: string;
//     createdAt: string;
//     updatedAt: string;
//     languageId: string;
//     caterorId: string;
//   };
//   amount: number;
// }

// interface InventoryItem {
//   id: string;
//   materialId: string;
//   quantity: number;
//   price: number;
//   createdAt: string;
//   material: Material;
// }

// interface Inword {
//   id: string;
//   poNumber: number | null;
//   eventId: string | null;
//   event: {id: string; name: string; startDate: string} | null;
//   createdAt: string;
//   inventoryItem: InventoryItem[];
// }

// // ──────────────────────────────────────────────────────────────
// // IST Helper (UTC → IST)
// // ──────────────────────────────────────────────────────────────
// const toIST = (utc: string) => addMinutes(parseISO(utc), 330);
// const formatIST = (utc: string, f = 'dd MMM yyyy, hh:mm a') =>
//   format(toIST(utc), f);

// // ──────────────────────────────────────────────────────────────
// // PDF Export Functions
// // ──────────────────────────────────────────────────────────────

// const generatePDFHTML = (
//   inwords: Inword[],
//   fromDate: string | null,
//   toDate: string | null,
//   userInfo: any,
// ) => {
//   const totalValue = inwords.reduce((total, inword) => {
//     const inwordTotal = inword.inventoryItem.reduce(
//       (sum, item) => sum + item.quantity * item.price,
//       0,
//     );
//     return total + inwordTotal;
//   }, 0);

//   const formatDateForHTML = (
//     dateString: string,
//     formatType = 'dd MMM yyyy HH:mm',
//   ) => {
//     if (!dateString) return '—';
//     const date = new Date(dateString);

//     if (formatType === 'dd MMM yyyy') {
//       return date.toLocaleDateString('en-GB', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//       });
//     }

//     return date.toLocaleString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: false,
//     });
//   };

//   const printedDate = new Date();
//   const printedDateStr = printedDate.toLocaleDateString('en-GB', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//   });
//   const printedTimeStr = printedDate.toLocaleTimeString('en-US', {
//     hour: '2-digit',
//     minute: '2-digit',
//     hour12: true,
//   });

//   return `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="utf-8"/>
//   <title>Inword History Report</title>
//   <style>
//     html, body {
//       margin:0;
//       padding:0;
//       font-family: Arial, sans-serif;
//       color:#000;
//       -webkit-print-color-adjust: exact !important;
//       print-color-adjust: exact !important;
//     }

//     /* HEADER */
//     .header-wrapper {
//       text-align: center;
//       border: 1px solid #0D47A1;
//       padding: 8px;
//       margin-bottom: 12px;
//       background: #E3F2FD;
//       font-family: Arial, sans-serif;
//     }
//     .header-wrapper h1 {
//       margin: 0;
//       font-size: 24px;
//       font-weight: 800;
//       color: #0D47A1;
//     }
//     .header-wrapper p {
//       margin: 6px 0 0;
//       font-weight: bold;
//       font-size: 11px;
//       color: #000;
//     }

//     /* TITLE */
//     .title-wrapper {
//       text-align: center;
//       background: #0D47A1;
//       color: white;
//       padding: 10px 6px;
//       margin-bottom: 15px;
//       font-weight: bold;
//     }
//     .title-wrapper h2 {
//       margin: 0;
//       font-size: 17px;
//     }
//     .title-wrapper .date-range {
//       font-size: 11px;
//       margin-top: 4px;
//     }

//     .summary-wrapper {
//       background: #f8f9fa;
//       border-left: 4px solid #0D47A1;
//       padding: 10px 20px;
//       margin: 0 auto 15px auto;
//       font-size: 12px;
//       font-weight: bold;
//       text-align: center;
//       border-radius: 5px;
//       width: fit-content;
//     }
//     .summary-wrapper .value {
//       color: #0D47A1;
//     }

//     /* TABLE */
//     table {
//       width: 100%;
//       border-collapse: collapse;
//       font-family: Arial;
//       font-size: 12px;
//       page-break-after: auto;
//     }
//     th {
//       padding: 6px;
//       border: 1px solid #ccc;
//       text-align: center;
//       font-weight: bold;
//       background-color: #1E3A8A;
//       color: white;
//     }
//     td {
//       padding: 6px;
//       border: 1px solid #ddd;
//       text-align: left;
//       font-weight: bold;
//     }
//     td.text-center { text-align: center; }
//     td.text-right { text-align: right; }
//     tbody tr:nth-child(even) { background-color: #fff; }
//     tbody tr:nth-child(odd) { background-color: #f8f9f8; }

//     .transaction-total {
//       font-weight: bold;
//       background-color: #e8f5e8;
//     }

//     /* FOOTER */
//     .footer {
//       margin-top: 10px;
//       text-align: center;
//       font-size: 11px;
//     }

//     @media print {
//       table { page-break-after: auto; }
//       tr    { page-break-inside: avoid; page-break-after: auto; }
//       td    { page-break-inside: avoid; page-break-after: auto; }
//       @page {
//         margin: 12mm 8mm;
//         @top-center {
//           content: "Inword History Report | ${userInfo?.fullname || 'Caterer Name'}";
//           font-size: 12px;
//           font-weight: bold;
//           color: #0D47A1;
//           margin-top: 5mm;
//         }
//       }
//       body { margin: 0; }
//     }
//   </style>
// </head>
// <body>
//   <div style="padding:12px;">
//     <!-- HEADER -->
//     <div class="header-wrapper">
//       <h1>${userInfo?.fullname || 'Caterer Name'}</h1>
//       <p>
//         ${userInfo?.address ? `Address - ${userInfo.address}` : ''}${
//           userInfo?.email ? ` | Email - ${userInfo.email}` : ''
//         } | Mob. ${userInfo?.phoneNumber || ''}
//       </p>
//     </div>

//     <!-- TITLE -->
//     <div class="title-wrapper">
//       <h2>Inword History Report</h2>
//       <div class="date-range">
//         ${
//           fromDate && toDate
//             ? `Period: ${formatDateForHTML(fromDate, 'dd MMM yyyy')} to ${formatDateForHTML(toDate, 'dd MMM yyyy')}`
//             : ''
//         }
//       </div>
//     </div>

//     <!-- TABLES -->
//     ${inwords
//       .map((inword, index) => {
//         const inwordTotal = inword.inventoryItem.reduce(
//           (sum, item) => sum + item.quantity * item.price,
//           0,
//         );
//         const transactionDate = formatDateForHTML(inword.createdAt);

//         return `
//           <table>
//             <thead>
//               <tr>
//                 <td colspan="6" style="border: none; padding: 0;">
//                   <div class="summary-wrapper">
//                     Transaction #${index + 1} |
//                     Date: ${transactionDate} |
//                     Items: ${inword.inventoryItem.length} |
//                     Total: <span class="value">₹${inwordTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
//                   </div>
//                 </td>
//               </tr>
//               <tr>
//                 <th>Category</th>
//                 <th>Material Name</th>
//                 <th class="text-center">Unit</th>
//                 <th class="text-center">Quantity</th>
//                 <th class="text-right">Unit Price</th>
//                 <th class="text-right">Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${inword.inventoryItem
//                 .map(
//                   (item) => `
//                 <tr>
//                   <td>${item.material?.category?.name || '—'}</td>
//                   <td>${item.material?.name || '—'}</td>
//                   <td class="text-center">${item.material?.unit || '—'}</td>
//                   <td class="text-center">${item.quantity.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
//                   <td class="text-right">₹${item.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
//                   <td class="text-right">₹${(item.quantity * item.price).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
//                 </tr>
//               `,
//                 )
//                 .join('')}
//               <tr class="transaction-total">
//                 <td colspan="5" class="text-right">Transaction Total:</td>
//                 <td class="text-right">₹${inwordTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
//               </tr>
//             </tbody>
//           </table>
//           <div style="height:12px;"></div>
//         `;
//       })
//       .join('')}

//     <!-- FOOTER -->
//     <div class="footer">
//       Generated on: ${printedDateStr} at ${printedTimeStr}
//     </div>
//   </div>

//   <script>
//     setTimeout(() => {
//       window.print();
//       setTimeout(() => {
//         if (window.opener) {
//           window.close();
//         }
//       }, 600);
//     }, 500);
//   </script>
// </body>
// </html>
//   `;
// };

// // ──────────────────────────────────────────────────────────────
// // Small Date Filter Popup Component
// // ──────────────────────────────────────────────────────────────
// interface DateFilterPopupProps {
//   fromDate: string;
//   toDate: string;
//   setFromDate: (date: string) => void;
//   setToDate: (date: string) => void;
//   clearFilters: () => void;
//   filteredCount: number;
//   totalCount: number;
//   onClose: () => void;
//   triggerRef: React.RefObject<HTMLButtonElement | null>;
//   filterType: {event: boolean; po: boolean};
//   setFilterType: React.Dispatch<
//     React.SetStateAction<{event: boolean; po: boolean}>
//   >;
// }

// const DateFilterPopup: React.FC<DateFilterPopupProps> = ({
//   fromDate,
//   toDate,
//   setFromDate,
//   setToDate,
//   clearFilters,
//   filteredCount,
//   totalCount,
//   onClose,
//   triggerRef,
//   filterType,
//   setFilterType,
// }) => {
//   const popupRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         popupRef.current &&
//         !popupRef.current.contains(event.target as Node) &&
//         triggerRef.current &&
//         !triggerRef.current.contains(event.target as Node)
//       ) {
//         onClose();
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [onClose, triggerRef]);

//   // Calculate position
//   const [position, setPosition] = useState({top: 0, left: 0});

//   useEffect(() => {
//     if (triggerRef.current) {
//       const rect = triggerRef.current.getBoundingClientRect();
//       setPosition({
//         top: rect.bottom + window.scrollY + 8,
//         left: rect.left + window.scrollX,
//       });
//     }
//   }, [triggerRef]);

//   return (
//     <div className="fixed inset-0 z-40" style={{pointerEvents: 'none'}}>
//       <div
//         ref={popupRef}
//         className="absolute w-80 rounded-lg border border-stroke bg-white shadow-lg"
//         style={{
//           top: `${position.top}px`,
//           left: `${position.left}px`,
//           pointerEvents: 'auto',
//         }}
//       >
//         {/* Header */}
//         <div className="border-b border-stroke px-4 py-3">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <FiCalendar className="text-gray-600 text-sm" />
//               <h3 className="text-gray-800 text-sm font-semibold">
//                 Filter by Date
//               </h3>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-600 text-lg"
//             >
//               <FiX />
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-4">
//           <div className="mb-4 space-y-3">
//             <div>
//               <label className="text-gray-700 mb-1 block text-xs font-medium">
//                 From
//               </label>
//               <input
//                 type="date"
//                 value={fromDate}
//                 onChange={(e) => setFromDate(e.target.value)}
//                 className="w-full rounded border border-stroke bg-white p-2 text-xs outline-none focus:border-primary"
//                 max={toDate || undefined}
//               />
//             </div>
//             <div>
//               <label className="text-gray-700 mb-1 block text-xs font-medium">
//                 To
//               </label>
//               <input
//                 type="date"
//                 value={toDate}
//                 onChange={(e) => setToDate(e.target.value)}
//                 className="w-full rounded border border-stroke bg-white p-2 text-xs outline-none focus:border-primary"
//                 min={fromDate || undefined}
//               />
//             </div>
//           </div>

//           {/* Stats */}
//           <div className="bg-gray-50 mb-4 rounded border border-stroke p-3">
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-gray-600 text-xs">Showing</div>
//                 <div className="text-gray-800 font-bold">{filteredCount}</div>
//               </div>
//               <div className="text-gray-400">/</div>
//               <div>
//                 <div className="text-gray-600 text-xs">Total</div>
//                 <div className="text-gray-800 font-bold">{totalCount}</div>
//               </div>
//               <div className="text-gray-400">•</div>
//               <button
//                 onClick={() => {
//                   clearFilters();
//                   onClose();
//                 }}
//                 className="text-xs font-medium text-red-600 hover:text-red-800"
//               >
//                 Clear All
//               </button>
//             </div>
//             {fromDate && toDate && (
//               <div className="mt-2 border-t border-stroke pt-2">
//                 <div className="text-gray-700 text-xs font-medium">
//                   {format(new Date(fromDate), 'dd MMM')} -{' '}
//                   {format(new Date(toDate), 'dd MMM yyyy')}
//                 </div>
//               </div>
//             )}
//           </div>
//           {/* Event / PO Filter */}
//           <div className="mb-4 flex items-center justify-center gap-6">
//             <label className="text-gray-700 flex items-center gap-2 text-xs">
//               <input
//                 type="checkbox"
//                 checked={filterType.event}
//                 onChange={(e) =>
//                   setFilterType((prev) => ({
//                     ...prev,
//                     event: e.target.checked,
//                   }))
//                 }
//               />
//               Event
//             </label>

//             <label className="text-gray-700 flex items-center gap-2 text-xs">
//               <input
//                 type="checkbox"
//                 checked={filterType.po}
//                 onChange={(e) =>
//                   setFilterType((prev) => ({
//                     ...prev,
//                     po: e.target.checked,
//                   }))
//                 }
//               />
//               PO
//             </label>
//           </div>

//           {/* Actions */}
//           <div className="flex gap-2">
//             <button
//               onClick={onClose}
//               className="flex-1 rounded bg-primary py-2 text-xs font-medium text-white transition-colors hover:bg-primary/90"
//             >
//               Apply
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ──────────────────────────────────────────────────────────────
// // Main Component
// // ──────────────────────────────────────────────────────────────
// const InwordHistory: React.FC = () => {
//   const {user} = useAuthContext();
//   const {data: inwords = [], isLoading, error} = useInwordHistory();
//   const [selectedInword, setSelectedInword] = useState<Inword | null>(null);
//   const [fromDate, setFromDate] = useState<string>('');
//   const [toDate, setToDate] = useState<string>('');
//   const [showFilterPopup, setShowFilterPopup] = useState(false);

//   const filterButtonRef = useRef<HTMLButtonElement>(null);

//   // Prepare user info for PDF
//   const userInfo = {
//     fullname: user?.fullname || 'Caterer Name',
//     address: user?.address || '',
//     email: user?.email || '',
//     phoneNumber: user?.phoneNumber || '',
//   };

//   const [filterType, setFilterType] = useState<{
//     event: boolean;
//     po: boolean;
//   }>({
//     event: false,
//     po: false,
//   });

//   // Filter data based on date range
//   const filteredInwords = useMemo(() => {
//     let result = inwords;

//     if (fromDate || toDate) {
//       result = result.filter((inword: {createdAt: string}) => {
//         const inwordDate = startOfDay(toIST(inword.createdAt));
//         const filterFrom = fromDate ? startOfDay(toIST(fromDate)) : null;
//         const filterTo = toDate ? endOfDay(toIST(toDate)) : null;

//         if (filterFrom && filterTo) {
//           return inwordDate >= filterFrom && inwordDate <= filterTo;
//         } else if (filterFrom) {
//           return inwordDate >= filterFrom;
//         } else if (filterTo) {
//           return inwordDate <= filterTo;
//         }
//         return true;
//       });
//     }
//     if (filterType.event || filterType.po) {
//       result = result.filter((inword) => {
//         if (filterType.event && inword.event) return true;
//         if (filterType.po && inword.poNumber) return true;
//         return false;
//       });
//     }

//     return result.sort(
//       (a, b) =>
//         new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
//     );
//   }, [inwords, fromDate, toDate, filterType]);

//   const clearFilters = () => {
//     setFromDate('');
//     setToDate('');
//     setShowFilterPopup(false);
//     setFilterType({event: false, po: false});
//     setShowFilterPopup(false);
//   };

//   const exportToPDF = (
//     inwords: Inword[],
//     fromDate: string | null,
//     toDate: string | null,
//   ) => {
//     try {
//       // Generate HTML for preview/print
//       const previewHTML = generatePDFHTML(inwords, fromDate, toDate, userInfo);

//       // Open in new window for preview
//       const printWindow = window.open(
//         '',
//         '_blank',
//         'width=1000,height=800,scrollbars=yes',
//       );
//       if (!printWindow) {
//         alert('Please allow popups for this site to generate PDF');
//         return;
//       }

//       printWindow.document.write(previewHTML);
//       printWindow.document.close();

//       // Auto-print on load
//       setTimeout(() => {
//         printWindow.print();
//         // Close window after print
//         setTimeout(() => {
//           printWindow.close();
//         }, 1000);
//       }, 500);

//       toast.success('PDF opened for printing');
//     } catch (err) {
//       console.error('Failed to generate PDF', err);
//       toast.error('Failed to generate PDF');
//     }
//   };

//   if (isLoading)
//     return <div className="p-6 text-center">Loading inwords...</div>;
//   if (error)
//     return <div className="p-6 text-red-600">Error: {error.message}</div>;

//   // ───── MAIN TABLE COLUMNS (TOTAL COLUMN REMOVED) ─────
//   const columns: Column<Inword>[] = [
//     {
//       header: 'Sr No.',
//       accessor: 'id',
//       render: (item) => {
//         const index = filteredInwords.findIndex((i) => i.id === item.id);
//         return <div className="text-center font-medium">{index + 1}</div>;
//       },
//       className: 'text-center min-w-[70px]',
//     },

//     {
//       header: 'Date',
//       accessor: 'createdAt',
//       render: (item) => (
//         <div className="text-center">
//           <span className="font-medium">{formatIST(item.createdAt)}</span>
//         </div>
//       ),
//       sortable: true,
//       className: 'text-center min-w-[100px]',
//     },
//     {
//       header: 'Event',
//       accessor: (i) =>
//         i.event
//           ? `${i.event.name} (${formatIST(i.event.startDate, 'dd MMM yyyy')})`
//           : '—',
//       render: (i) => (
//         <div className="text-center">
//           <span className="font-medium">
//             {i.event
//               ? `${i.event.name} (${formatIST(i.event.startDate, 'dd MMM yyyy')})`
//               : '—'}
//           </span>
//         </div>
//       ),
//       sortable: true,
//       className: 'text-center min-w-[180px]',
//     },
//     {
//       header: 'PO',
//       accessor: (i) => (i.event ? '—' : i.poNumber ? `PO #${i.poNumber}` : '—'),
//       render: (i) => (
//         <div className="text-center">
//           <span className="font-medium">
//             {i.event ? '—' : i.poNumber ? `PO #${i.poNumber}` : '—'}
//           </span>
//         </div>
//       ),
//       sortable: true,
//       className: 'text-center min-w-[120px]',
//     },

//     {
//       header: 'Items',
//       accessor: (i) => i.inventoryItem.length,
//       render: (i) => (
//         <div className="flex justify-center">
//           <span className="bg-gray-100 inline-flex items-center justify-center rounded-full px-2.5 py-1 font-medium">
//             {i.inventoryItem.length}
//           </span>
//         </div>
//       ),
//       className: 'text-center min-w-[80px]',
//     },
//     {
//       header: 'Actions',
//       accessor: 'id',
//       render: (i) => (
//         <div className="flex justify-center gap-1">
//           <button
//             onClick={() => exportToPDF([i], null, null)}
//             className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out hover:bg-primary/90"
//           >
//             Print
//           </button>
//         </div>
//       ),
//       className: 'text-center min-w-[80px]',
//     },
//   ];

//   // Item columns for modal (keeping total here since it's in the detail view)
//   const itemColumns: Column<InventoryItem>[] = [
//     {
//       header: 'Category',
//       accessor: (it) => it.material?.category?.name || '—',
//       render: (it) => (
//         <div className="text-center">
//           <span className="font-medium">
//             {it.material?.category?.name || '—'}
//           </span>
//         </div>
//       ),
//       className: 'text-center min-w-[120px]',
//     },
//     {
//       header: 'Material Name',
//       accessor: (it) => it.material?.name || '—',
//       render: (it) => (
//         <div className="text-center">
//           <span className="font-medium">{it.material?.name || '—'}</span>
//         </div>
//       ),
//       className: 'text-center min-w-[150px]',
//     },
//     {
//       header: 'Quantity',
//       accessor: 'quantity',
//       render: (it) => (
//         <div className="text-center">
//           <span className="font-medium">{it.quantity}</span>
//         </div>
//       ),
//       className: 'text-center min-w-[80px]',
//     },
//     {
//       header: 'Unit',
//       accessor: (it) => it.material?.unit || '—',
//       render: (it) => (
//         <div className="text-center">
//           <span className="text-gray-600 text-sm">
//             {it.material?.unit || '—'}
//           </span>
//         </div>
//       ),
//       className: 'text-center min-w-[80px]',
//     },
//     {
//       header: 'Price',
//       accessor: 'price',
//       render: (it) => (
//         <div className="text-center">
//           <span>₹{it.price.toFixed(2)}</span>
//         </div>
//       ),
//       className: 'text-center min-w-[100px]',
//     },
//     {
//       header: 'Total',
//       accessor: (it) => it.quantity * it.price,
//       render: (it) => (
//         <div className="text-center">
//           <span className="font-semibold text-green-700">
//             ₹{(it.quantity * it.price).toFixed(2)}
//           </span>
//         </div>
//       ),
//       className: 'text-center min-w-[100px]',
//     },
//   ];

//   return (
//     <div className="rounded-lg bg-white p-2">
//       {/* Header with Actions */}
//       <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
//         <div>
//           <h2 className="text-gray-800 text-2xl font-bold">Inword History</h2>
//           <p className="text-gray-600 mt-1 text-sm">
//             Track all incoming inventory transactions
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           {/* Filter Badge (if filters applied) */}
//           {(fromDate || toDate) && (
//             <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5">
//               <FiFilter className="text-sm text-blue-600" />
//               <span className="text-sm font-medium text-blue-700">
//                 {filteredInwords.length} of {inwords.length} records
//               </span>
//               <button
//                 onClick={clearFilters}
//                 className="text-sm text-blue-600 hover:text-blue-800"
//               >
//                 ×
//               </button>
//             </div>
//           )}

//           {/* Filter Button */}
//           <button
//             ref={filterButtonRef}
//             onClick={() => setShowFilterPopup(!showFilterPopup)}
//             className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-colors ${
//               fromDate || toDate
//                 ? 'bg-blue-600 text-white hover:bg-blue-700'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             <FiFilter className="text-sm" />
//             Filter
//             {(fromDate || toDate) && (
//               <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-600">
//                 !
//               </span>
//             )}
//           </button>

//           {/* Print/Export Button */}
//           <GenericButton
//             onClick={() => exportToPDF(filteredInwords, fromDate, toDate)}
//             className="flex items-center gap-2"
//           >
//             <FiPrinter className="text-sm" />
//             Export PDF
//           </GenericButton>
//         </div>
//       </div>

//       {/* Small Filter Popup */}
//       {showFilterPopup && (
//         <DateFilterPopup
//           fromDate={fromDate}
//           toDate={toDate}
//           setFromDate={setFromDate}
//           setToDate={setToDate}
//           clearFilters={clearFilters}
//           filteredCount={filteredInwords.length}
//           totalCount={inwords.length}
//           onClose={() => setShowFilterPopup(false)}
//           triggerRef={filterButtonRef}
//           filterType={filterType}
//           setFilterType={setFilterType}
//         />
//       )}

//       {/* ───── MAIN TABLE (WITHOUT TOTAL COLUMN) ───── */}
//       <GenericTable
//         data={filteredInwords}
//         columns={columns}
//         itemsPerPage={15}
//         searchAble={true}
//         action={false}
//       />

//       {/* ───── MODAL POPUP ───── */}
//       {selectedInword && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
//           <div className="my-8 max-h-[90vh] w-full max-w-6xl overflow-hidden overflow-y-auto rounded-lg bg-white shadow-xl">
//             {/* Modal Header - FIXED POSITION */}
//             <div className="sticky top-0 z-50 flex items-center justify-between border-b border-stroke bg-white px-6 py-4 shadow-sm">
//               <div>
//                 <h3 className="text-gray-800 text-lg font-semibold">
//                   Inword Details
//                 </h3>
//                 <p className="text-gray-600 mt-1 text-sm">
//                   {selectedInword.event
//                     ? `${selectedInword.event.name} – ${formatIST(selectedInword.event.startDate, 'dd MMM yyyy')}`
//                     : selectedInword.poNumber
//                       ? `PO #${selectedInword.poNumber}`
//                       : 'General Inword'}
//                 </p>
//               </div>
//               <button
//                 onClick={() => setSelectedInword(null)}
//                 className="text-gray-400 hover:text-gray-600 text-xl"
//               >
//                 <FiX />
//               </button>
//             </div>

//             {/* Modal Content */}
//             <div className="p-6">
//               {/* Summary Cards - IMPROVED LAYOUT */}
//               <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
//                 <div className="bg-gray-50 rounded-lg border border-stroke p-4">
//                   <h4 className="text-gray-700 mb-2 text-sm font-medium">
//                     Inword Information
//                   </h4>
//                   <div className="space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Date:</span>
//                       <span className="font-medium">
//                         {formatIST(selectedInword.createdAt)}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Type:</span>
//                       <span className="font-medium">
//                         {selectedInword.event
//                           ? 'Event'
//                           : selectedInword.poNumber
//                             ? 'Purchase Order'
//                             : 'General'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-gray-50 rounded-lg border border-stroke p-4">
//                   <h4 className="text-gray-700 mb-2 text-sm font-medium">
//                     Items Summary
//                   </h4>
//                   <div className="space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Total Items:</span>
//                       <span className="font-medium">
//                         {selectedInword.inventoryItem.length}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Categories:</span>
//                       <span className="font-medium">
//                         {
//                           Array.from(
//                             new Set(
//                               selectedInword.inventoryItem.map(
//                                 (item) =>
//                                   item.material?.category?.name || 'Unknown',
//                               ),
//                             ),
//                           ).length
//                         }
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-gray-50 rounded-lg border border-stroke p-4">
//                   <h4 className="text-gray-700 mb-2 text-sm font-medium">
//                     Financial Summary
//                   </h4>
//                   <div className="space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Total Value:</span>
//                       <span className="font-medium text-green-700">
//                         ₹
//                         {selectedInword.inventoryItem
//                           .reduce(
//                             (sum, item) => sum + item.quantity * item.price,
//                             0,
//                           )
//                           .toFixed(2)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Items Table - FIXED HEIGHT AND SCROLL */}
//               {selectedInword.inventoryItem.length === 0 ? (
//                 <div className="rounded-lg border border-stroke py-12 text-center">
//                   <p className="text-gray-500">
//                     No items recorded for this inword.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="rounded-lg border border-stroke">
//                   <div className="bg-gray-50 border-b border-stroke px-6 py-4">
//                     <h4 className="text-gray-800 font-medium">Items List</h4>
//                   </div>
//                   <div className="max-h-[400px] overflow-y-auto">
//                     <GenericTable
//                       data={selectedInword.inventoryItem}
//                       columns={itemColumns}
//                       paginationOff={true}
//                       searchAble={false}
//                       action={false}
//                     />
//                   </div>

//                   {/* Grand Total - FIXED AT BOTTOM */}
//                   <div className="bg-gray-50 sticky bottom-0 border-t border-stroke px-6 py-4">
//                     <div className="flex justify-between">
//                       <span className="text-gray-800 font-semibold">
//                         Grand Total:
//                       </span>
//                       <span className="text-lg font-bold text-green-700">
//                         ₹
//                         {selectedInword.inventoryItem
//                           .reduce(
//                             (sum, item) => sum + item.quantity * item.price,
//                             0,
//                           )
//                           .toFixed(2)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Modal Footer - SIMPLIFIED */}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default InwordHistory;
import React, {useState, useMemo, useRef} from 'react';
import {FiFilter, FiPrinter} from 'react-icons/fi';
import {useInwordHistory} from '../storeApi';
import GenericTable from '@/components/Forms/Table/GenericTable';

import toast from 'react-hot-toast';
import {useAuthContext} from '@/context/AuthContext';
import DateFilterPopup from './DateFilterPopup';
import InwordModal from './OutwordModal';
import {Inword} from '../types';
import {createColumns} from './columns';
import {generatePDFHTML} from './pdf';
import {toIST} from './helpers';
import {startOfDay, endOfDay} from 'date-fns';
import GenericButton from '@/components/Forms/Buttons/GenericButton';

interface InwordHistoryProps {
  hasEditAccess: boolean;
}
const InwordHistory: React.FC<InwordHistoryProps> = ({
  hasEditAccess: propHasEditAccess,
}) => {
  const {user} = useAuthContext();
  const {data: inwords = [], isLoading, error} = useInwordHistory();
  const [selectedInword, setSelectedInword] = useState<Inword | null>(null);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const userInfo = {
    fullname: user?.fullname || 'Caterer Name',
    address: user?.address || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  };

  const restriction = user?.employeeRestriction?.inwordHistory;
  const role = user?.role;

  const hasEditAccess =
    propHasEditAccess !== undefined
      ? propHasEditAccess
      : role === 'CATEROR' || restriction === 'EDIT';

  const [filterType, setFilterType] = useState({event: false, po: false});

  const filteredInwords = useMemo(() => {
    let result = inwords;

    if (fromDate || toDate) {
      result = result.filter((inword: {createdAt: string}) => {
        const inwordDate = startOfDay(toIST(inword.createdAt));
        const filterFrom = fromDate ? startOfDay(toIST(fromDate)) : null;
        const filterTo = toDate ? endOfDay(toIST(toDate)) : null;

        if (filterFrom && filterTo) {
          return inwordDate >= filterFrom && inwordDate <= filterTo;
        } else if (filterFrom) {
          return inwordDate >= filterFrom;
        } else if (filterTo) {
          return inwordDate <= filterTo;
        }
        return true;
      });
    }

    if (filterType.event || filterType.po) {
      result = result.filter((inword) => {
        if (filterType.event && inword.event) return true;
        if (filterType.po && inword.poNumber) return true;
        return false;
      });
    }

    return result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [inwords, fromDate, toDate, filterType]);

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setFilterType({event: false, po: false});
    setShowFilterPopup(false);
  };

  const exportToPDF = (
    inwordsArg: Inword[],
    fromArg: string | null,
    toArg: string | null,
  ) => {
    try {
      const previewHTML = generatePDFHTML(inwordsArg, fromArg, toArg, userInfo);
      const printWindow = window.open(
        '',
        '_blank',
        'width=1000,height=800,scrollbars=yes',
      );
      if (!printWindow) {
        alert('Please allow popups for this site to generate PDF');
        return;
      }
      printWindow.document.write(previewHTML);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
      toast.success('PDF opened for printing');
    } catch (err) {
      console.error('Failed to generate PDF', err);
      toast.error('Failed to generate PDF');
    }
  };

  if (isLoading)
    return <div className="p-6 text-center">Loading inwords...</div>;
  if (error)
    return <div className="p-6 text-red-600">Error: {error.message}</div>;

  const columns = createColumns(filteredInwords, exportToPDF);

  return (
    <div className="rounded-lg bg-white p-6 dark:bg-black">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-gray-800 text-2xl font-bold">Inword History</h2>
          <p className="text-gray-600 mt-1 text-sm">
            Track all incoming inventory transactions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(fromDate || toDate) && (
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5">
              <FiFilter className="text-sm text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {filteredInwords.length} of {inwords.length} records
              </span>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </div>
          )}

          <button
            ref={filterButtonRef}
            onClick={() => setShowFilterPopup(!showFilterPopup)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-colors ${fromDate || toDate ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <FiFilter className="text-sm" /> Filter
            {(fromDate || toDate) && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-600">
                !
              </span>
            )}
          </button>

          {hasEditAccess && (
            <GenericButton
              onClick={() => exportToPDF(filteredInwords, fromDate, toDate)}
              className="flex items-center gap-2"
            >
              <FiPrinter className="text-sm" /> Export PDF
            </GenericButton>
          )}
        </div>
      </div>

      {showFilterPopup && (
        <DateFilterPopup
          fromDate={fromDate}
          toDate={toDate}
          setFromDate={setFromDate}
          setToDate={setToDate}
          clearFilters={clearFilters}
          filteredCount={filteredInwords.length}
          totalCount={inwords.length}
          onClose={() => setShowFilterPopup(false)}
          triggerRef={filterButtonRef}
          filterType={filterType}
          setFilterType={setFilterType}
        />
      )}

      <GenericTable
        data={filteredInwords}
        columns={columns}
        itemsPerPage={15}
        searchAble={true}
        // action={false || hasEditAccess}
      />

      {selectedInword && (
        <InwordModal
          selectedInword={selectedInword}
          onClose={() => setSelectedInword(null)}
        />
      )}
    </div>
  );
};

export default InwordHistory;
