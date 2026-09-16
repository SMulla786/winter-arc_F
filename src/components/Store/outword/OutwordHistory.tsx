// /*eslint-disable*/
// import React, {useState, useMemo, useRef, useEffect} from 'react';
// import {FiEye, FiX, FiPrinter, FiFilter, FiCalendar} from 'react-icons/fi';
// import {format, parseISO, addMinutes, startOfDay, endOfDay} from 'date-fns';
// import {useOutwordHistory} from './storeApi';
// import GenericTable, {Column} from '../Forms/Table/GenericTable';
// import GenericButton from '../Forms/Buttons/GenericButton';
// import toast from 'react-hot-toast';
// import {useAuthContext} from '@/context/AuthContext';
// import html2canvas from 'html2canvas';
// import {jsPDF} from 'jspdf';

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
//   inventory: number;
// }

// interface OutwordInventoryItem {
//   id: string;
//   inventoryId: string;
//   materialId: string;
//   vendorId: string | null;
//   vendorName: string | null;
//   quantity: number;
//   price: number;
//   reason: string | null;
//   createdAt: string;
//   updatedAt: string;
//   material: Material;
// }

// interface Outword {
//   id: string;
//   caterorId: string;
//   eventId: string | null;
//   poNumber: number | null;
//   type: string;
//   createdAt: string;
//   updatedAt: string;
//   event: null | {id: string; name: string; startDate: string};
//   inventoryItem: OutwordInventoryItem[];
// }

// // ──────────────────────────────────────────────────────────────
// // IST Helper (UTC → IST)
// // ──────────────────────────────────────────────────────────────
// const toIST = (utc: string) => addMinutes(parseISO(utc), 330);
// const formatIST = (utc: string, f = 'dd MMM yyyy, hh:mm a') =>
//   format(toIST(utc), f);

// // ──────────────────────────────────────────────────────────────
// // PDF Export Functions - BLUE COLOR SCHEME WITH ALL FEATURES
// // ──────────────────────────────────────────────────────────────

// const generatePDFHTML = (
//   outwords: Outword[],
//   fromDate: string | null,
//   toDate: string | null,
//   userInfo: any,
// ) => {
//   const totalValue = outwords.reduce((total, outword) => {
//     const outwordTotal = outword.inventoryItem.reduce(
//       (sum, item) => sum + item.quantity * item.price,
//       0,
//     );
//     return total + outwordTotal;
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
//   <title>Outword History Report</title>
//   <style>
//     html, body {
//       margin:0;
//       padding:0;
//       font-family: Arial, sans-serif;
//       color:#000;
//       -webkit-print-color-adjust: exact !important;
//       print-color-adjust: exact !important;
//     }

//     /* HEADER - BLUE THEME */
//     .header-wrapper {
//       padding: 6px;
//       border: 1px solid #0D47A1;
//       text-align: center;
//       margin-bottom: 10px;
//       background: #E3F2FD;
//     }

//     .header-wrapper h1 {
//       margin: 0;
//       font-weight: 800;
//       font-size: 28px;
//       color: #0D47A1;
//     }

//     .header-info {
//       margin: 0;
//       font-size: 14px;
//       font-weight: bold;
//       color: #000;
//       margin-top: 6px;
//     }

//     /* TITLE - BLUE THEME */
//     .title-wrapper {
//       margin-top: 5px;
//       text-align: center;
//       margin-bottom: 15px;
//     }

//     .title-wrapper h2 {
//       font-size: 18px;
//       font-weight: bold;
//       margin: 0;
//       color: #000;
//     }

//     .date-range {
//       margin-bottom: 4px;
//       color: #000;
//     }

//     /* Transaction Header - BLUE THEME - CENTERED */
//     .transaction-header {
//       background: #E3F2FD; /* Light blue background for outword */
//       padding: 10px 15px;
//       margin: 15px 0 8px 0;
//       border-radius: 5px;
//       border-left: 4px solid #0D47A1; /* Blue border for outword */
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       flex-wrap: wrap;
//       font-size: 11px;
//       color: #333;
//     }

//     .transaction-title {
//       font-weight: bold;
//       font-size: 12px;
//       color: #0D47A1; /* Blue color for outword */
//     }

//     .transaction-info {
//       display: flex;
//       gap: 20px;
//       flex-wrap: wrap;
//       justify-content: center;
//     }

//     .type-badge {

//       color: black;
//       padding: 2px 8px;
//       border-radius: 12px;
//       font-size: 10px;
//       text-transform: uppercase;
//     }

//     /* TABLE STYLING — BLUE THEME */
//     .items-table {
//       width: 100%;
//       border-collapse: collapse;
//       font-size: 11px;
//       background: white;
//       vertical-align: middle;
//     }

//     .items-table th {
//       border: 1px solid #ccc;
//       padding: 12px 8px;
//       background-color: #1E3A8A !important; /* DARK BLUE HEADER */
//       color: white !important;
//       text-align: center;
//       font-weight: bold;
//       font: bold 12px Arial, sans-serif !important;
//       vertical-align: middle;
//     }

//     .items-table td {
//       border: 1px solid #ddd;
//       padding-bottom: 10px;
//       padding-top: 10px;
//       text-align: left;
//       font: bold 12px Arial !important;
//       color: black !important;
//       whiteSpace: 'normal';
//       wordBreak: 'break-word';
//     }

//     .items-table .text-center {
//       text-align: center !important;
//     }

//     .items-table .text-right {
//       text-align: right !important;
//     }

//     .items-table tbody tr:nth-child(even) {
//       background-color: #fff !important;
//     }

//     .items-table tbody tr:nth-child(odd) {
//       background-color: #f8f8f8 !important;
//     }

//     /* Transaction Total - BLUE THEME */
//     .transaction-total {
//       background-color: #E3F2FD !important; /* Light blue for outword */
//       font-weight: bold !important;
//     }

//     /* Print Buttons */
//     .print-actions {
//       text-align: center;
//       margin-top: 25px;
//       padding-top: 15px;
//       border-top: 1px solid #ddd;
//     }

//     .print-btn {
//       padding: 8px 20px;
//       background: #0D47A1; /* Blue for outword */
//       color: white;
//       border: none;
//       border-radius: 4px;
//       cursor: pointer;
//       font-size: 12px;
//       font-weight: bold;
//       margin: 0 5px;
//       transition: background 0.3s;
//     }

//     .print-btn:hover {
//       background: #0D3A8A;
//     }

//     .close-btn {
//       background: #6c757d;
//     }

//     .close-btn:hover {
//       background: #5a6268;
//     }

//     /* Print Styles */
//     @media print {
//       body {
//         margin: 0;
//         padding: 0;
//         width: 100%;
//       }
//       .no-print { display: none !important; }
//     }
//   </style>
// </head>
// <body>
//   <div style="padding:20px;">
//     <!-- Header Section — BLUE THEME -->
//     <div class="header-wrapper">
//       <h1>${userInfo?.fullname || 'Caterer Name'}</h1>
//       <p class="header-info">
//         ${userInfo?.address || ''}<br/>
//         ${userInfo?.email ? `Email: ${userInfo.email}<br/>` : ''}
//         Mobile: ${userInfo?.phoneNumber || ''}
//       </p>
//     </div>

//     <!-- Title Section — BLUE THEME -->
//     <div class="title-wrapper">
//       <h2>Outword History Report</h2>
//       <div class="date-range">
//         ${
//           fromDate && toDate
//             ? `Period: ${formatDateForHTML(fromDate, 'dd MMM yyyy')} to ${formatDateForHTML(toDate, 'dd MMM yyyy')}`
//             : ''
//         }
//       </div>
//     </div>

//     <!-- Transactions -->
//     ${outwords
//       .map((outword, index) => {
//         const outwordTotal = outword.inventoryItem.reduce(
//           (sum, item) => sum + item.quantity * item.price,
//           0,
//         );

//         // Determine reference information
//         let referenceInfo = '';
//         if (outword.type.toLowerCase() === 'wastage') {
//           referenceInfo = 'Wastage';
//         } else if (outword.event) {
//           referenceInfo = `Event: ${outword.event.name} (${formatDateForHTML(outword.event.startDate, 'dd MMM yyyy')})`;
//         } else if (outword.poNumber) {
//           referenceInfo = `PO #${outword.poNumber}`;
//         } else {
//           referenceInfo = 'General Transaction';
//         }

//         const transactionDate = formatDateForHTML(outword.createdAt);
//         const typeDisplay =
//           outword.type.charAt(0).toUpperCase() +
//           outword.type.slice(1).toLowerCase();

//         return `
//         <!-- Transaction ${index + 1} -->
//         <div style="max-width: 800px; margin: 0 auto;">
//           <div class="transaction-header">
//             <span class="transaction-title">Transaction #${index + 1}</span>
//             <div class="transaction-info">
//               <span><strong>Date:</strong> ${transactionDate}</span>
//               <span><strong>Type:</strong> <span class="type-badge">${typeDisplay}</span></span>
//               <span><strong>Items:</strong> ${outword.inventoryItem.length}</span>
//               <span><strong>Total:</strong> ₹${outwordTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
//             </div>
//           </div>
//         </div>

//         ${
//           outword.inventoryItem.length > 0
//             ? `
//           <table class="items-table">
//             <thead>
//               <tr>
//                 <th style="text-align: left;">Category</th>
//                 <th style="text-align: left;">Material Name</th>
//                 <th style="text-align: center;">Unit</th>
//                 <th style="text-align: center;">Quantity</th>
//                 <th style="text-align: right;">Unit Price</th>
//                 <th style="text-align: right;">Total</th>
//                 <th style="text-align: left;">Vendor</th>
//                 <th style="text-align: left;">Reason</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${outword.inventoryItem
//                 .map((item, itemIndex) => {
//                   const rowBg = itemIndex % 2 === 0 ? '#fff' : '#f8f8f8';
//                   return `
//                   <tr style="background: ${rowBg};">
//                     <td style="text-align: left; font: bold 12px Arial;">${item.material?.category?.name || '—'}</td>
//                     <td style="text-align: left; font: bold 12px Arial;">${item.material?.name || '—'}</td>
//                     <td style="text-align: center; font: bold 12px Arial;">${item.material?.unit || '—'}</td>
//                     <td style="text-align: center; font: bold 12px Arial;">${item.quantity.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
//                     <td style="text-align: right; font: bold 12px Arial;">₹${item.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
//                     <td style="text-align: right; font: bold 12px Arial;">₹${(item.quantity * item.price).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
//                     <td style="text-align: left; font: bold 12px Arial;">${item.vendorName || '—'}</td>
//                     <td style="text-align: left; font: bold 12px Arial;">${item.reason || '—'}</td>
//                   </tr>
//                 `;
//                 })
//                 .join('')}

//               <!-- Transaction Total Row — BLUE THEME -->
//               <tr class="transaction-total">
//                 <td colspan="7" style="text-align: right; font: bold 12px Arial;"><strong>Transaction Total:</strong></td>
//                 <td style="text-align: right; font: bold 12px Arial;"><strong>₹${outwordTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
//               </tr>
//             </tbody>
//           </table>
//         `
//             : `
//           <div style="text-align: center; padding: 15px; color: #666; font-style: italic; max-width: 800px; margin: 0 auto;">
//             No items recorded for this transaction.
//           </div>
//         `
//         }

//         ${index < outwords.length - 1 ? '<div style="height: 20px;"></div>' : ''}
//       `;
//       })
//       .join('')}

//     <!-- Print Actions -->
//     <div class="print-actions no-print">
//       <button onclick="window.print()" class="print-btn">
//         🖨️ Print Report
//       </button>
//       <button onclick="window.close()" class="print-btn close-btn">
//         ✕ Close Window
//       </button>
//     </div>

//     <script>
//       window.onload = function() {
//         setTimeout(() => {
//           window.close()
//         }, 1000);
//       };
//     </script>
//   </div>
// </body>
// </html>
//   ;
//   </body>
//   </html>
//     `;
// };

// const generateAndDownloadPDF = async (
//   outwords: Outword[],
//   fromDate: string | null,
//   toDate: string | null,
//   userInfo: any,
// ) => {
//   const totalValue = outwords.reduce((total, outword) => {
//     const outwordTotal = outword.inventoryItem.reduce(
//       (sum, item) => sum + item.quantity * item.price,
//       0,
//     );
//     return total + outwordTotal;
//   }, 0);

//   // Create container for PDF generation - EXACT SAME DIMENSIONS AS CUTTING LIST
//   const reportContainer = document.createElement('div');
//   Object.assign(reportContainer.style, {
//     width: '800px',
//     padding: '20px',
//     background: 'white',
//     fontFamily: 'Arial, sans-serif',
//     fontSize: '12px',
//     color: 'black',
//     textAlign: 'center',
//   });

//   // Format date function for PDF - EXACT SAME FORMATTING
//   const formatDateForPDF = (
//     dateString: string,
//     formatType = 'dd MMM yyyy HH:mm',
//   ) => {
//     if (!dateString) return '—';
//     const date = new Date(dateString);

//     if (formatType === 'dd MMM yyyy') {
//       return date.toLocaleDateString('en-IN', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric',
//       });
//     }

//     return date.toLocaleString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: false,
//     });
//   };

//   // Build HTML for PDF - EXACT SAME STRUCTURE AS CUTTING LIST
//   let htmlContent = `
//       <!-- Header — EXACT SAME AS CUTTING LIST -->
//       <div style="padding: 6px; border: 1px solid #0D47A1; text-align: center; color: black;">
//         <h1 style="margin:0; font-weight:800; font-size:28px; color:black;">
//           ${userInfo?.fullname || 'Caterer Name'}
//         </h1>
//         <div style="background:#0D47A1; height:2px; margin:4px auto; width:80%;"></div>
//         <p style="margin:0; font-size:14px; font-weight:bold; color:black;">
//           ${userInfo?.address || ''}<br/>
//           ${userInfo?.email ? `Email: ${userInfo.email}<br/>` : ''}
//           Mobile: ${userInfo?.phoneNumber || ''}
//         </p>
//       </div>

//       <!-- Title — EXACT SAME AS CUTTING LIST -->
//       <div style="margin-top: 5px; text-align: center;">
//         <h2 style="font-size:18px; font-weight:bold; margin:0; color:black;">Outword History Report</h2>
//         <div style="margin-bottom:4px; color:black;">
//           ${
//             fromDate && toDate
//               ? `<span style="margin:0 8px;"><strong>Period:</strong> ${formatDateForPDF(fromDate, 'dd MMM yyyy')} to ${formatDateForPDF(toDate, 'dd MMM yyyy')}</span>`
//               : '<span style="margin:0 8px;"><strong></strong></span>'
//           }
//         </div>
//       </div>

//       <!-- Summary — SIMILAR TO CUTTING LIST -->
//       <div style="background: #f8f9fa; padding: 12px; margin: 15px auto; border-radius: 5px; border-left: 4px solid #dc3545; max-width: 800px; font-size: 11px;">
//         <strong>Summary:</strong> ${outwords.length} transaction${outwords.length !== 1 ? 's' : ''} |
//         Total Value: ₹${totalValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
//       </div>
//     `;

//   // Add transactions
//   outwords.forEach((outword, index) => {
//     const outwordTotal = outword.inventoryItem.reduce(
//       (sum, item) => sum + item.quantity * item.price,
//       0,
//     );

//     // Determine reference information
//     let referenceInfo = '';
//     if (outword.type.toLowerCase() === 'wastage') {
//       referenceInfo = 'Wastage';
//     } else if (outword.event) {
//       referenceInfo = `Event: ${outword.event.name} (${formatDateForPDF(outword.event.startDate, 'dd MMM yyyy')})`;
//     } else if (outword.poNumber) {
//       referenceInfo = `PO #${outword.poNumber}`;
//     } else {
//       referenceInfo = 'General Transaction';
//     }

//     const typeDisplay =
//       outword.type.charAt(0).toUpperCase() +
//       outword.type.slice(1).toLowerCase();

//     // Transaction Header - SAME STYLE AS SUB EVENT IN CUTTING LIST
//     htmlContent += `
//         <div style="background: #f8d7da; padding: 10px 15px; margin: 15px 0 8px 0; border-radius: 5px; border-left: 4px solid #dc3545; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; font-size: 11px; color: #333;">
//           <span style="font-weight: bold; font-size: 12px; color: #dc3545;">Transaction #${index + 1}</span>
//           <div style="display: flex; gap: 20px;">
//             <span><strong>Date:</strong> ${formatDateForPDF(outword.createdAt)}</span>
//             <span><strong>Type:</strong> <span style="background-color: #dc3545; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; text-transform: uppercase;">${typeDisplay}</span></span>
//             <span><strong>Items:</strong> ${outword.inventoryItem.length}</span>
//             <span><strong>Total:</strong> ₹${outwordTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
//           </div>
//         </div>

//         <!-- Reference Information -->
//         <div style="background: #e8f5e8; padding: 6px 10px; border-radius: 4px; font-size: 10px; margin-top: 4px;">
//           <strong>Reference:</strong> ${referenceInfo}
//         </div>
//       `;

//     if (outword.inventoryItem.length > 0) {
//       // TABLE HEADER — EXACT SAME COLORS AND STYLING AS CUTTING LIST
//       htmlContent += `
//           <table style="width: 100%; border-collapse: collapse; margin: 10px 0 20px 0; font-size: 11px; background: white; vertical-align: middle;">
//             <thead>
//               <tr>
//                 <th style="border: 1px solid #ccc; padding: 12px 8px; background-color: #1E3A8A; color: white; text-align: left; font-weight: bold; font: bold 12px Arial, sans-serif; vertical-align: middle;">Category</th>
//                 <th style="border: 1px solid #ccc; padding: 12px 8px; background-color: #1E3A8A; color: white; text-align: left; font-weight: bold; font: bold 12px Arial, sans-serif; vertical-align: middle;">Material Name</th>
//                 <th style="border: 1px solid #ccc; padding: 12px 8px; background-color: #1E3A8A; color: white; text-align: center; font-weight: bold; font: bold 12px Arial, sans-serif; vertical-align: middle;">Unit</th>
//                 <th style="border: 1px solid #ccc; padding: 12px 8px; background-color: #1E3A8A; color: white; text-align: center; font-weight: bold; font: bold 12px Arial, sans-serif; vertical-align: middle;">Qty</th>
//                 <th style="border: 1px solid #ccc; padding: 12px 8px; background-color: #1E3A8A; color: white; text-align: right; font-weight: bold; font: bold 12px Arial, sans-serif; vertical-align: middle;">Price</th>
//                 <th style="border: 1px solid #ccc; padding: 12px 8px; background-color: #1E3A8A; color: white; text-align: right; font-weight: bold; font: bold 12px Arial, sans-serif; vertical-align: middle;">Total</th>
//                 <th style="border: 1px solid #ccc; padding: 12px 8px; background-color: #1E3A8A; color: white; text-align: left; font-weight: bold; font: bold 12px Arial, sans-serif; vertical-align: middle;">Vendor</th>
//                 <th style="border: 1px solid #ccc; padding: 12px 8px; background-color: #1E3A8A; color: white; text-align: left; font-weight: bold; font: bold 12px Arial, sans-serif; vertical-align: middle;">Reason</th>
//               </tr>
//             </thead>
//             <tbody>
//         `;

//       outword.inventoryItem.forEach((item, itemIndex) => {
//         const rowBg = itemIndex % 2 === 0 ? '#fff' : '#f8f8f8'; // EXACT SAME ALTERNATING COLORS
//         htmlContent += `
//             <tr style="background: ${rowBg};">
//               <td style="border: 1px solid #ddd; padding-bottom: 10px; padding-top: 10px; text-align: left; font: bold 12px Arial; color: black; white-space: normal; word-break: break-word;">${item.material?.category?.name || '—'}</td>
//               <td style="border: 1px solid #ddd; padding-bottom: 10px; padding-top: 10px; text-align: left; font: bold 12px Arial; color: black; white-space: normal; word-break: break-word;">${item.material?.name || '—'}</td>
//               <td style="border: 1px solid #ddd; padding-bottom: 10px; padding-top: 10px; text-align: center; font: bold 12px Arial; color: black;">${item.material?.unit || '—'}</td>
//               <td style="border: 1px solid #ddd; padding-bottom: 10px; padding-top: 10px; text-align: center; font: bold 12px Arial; color: black;">${item.quantity.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
//               <td style="border: 1px solid #ddd; padding-bottom: 10px; padding-top: 10px; text-align: right; font: bold 12px Arial; color: black;">₹${item.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
//               <td style="border: 1px solid #ddd; padding-bottom: 10px; padding-top: 10px; text-align: right; font: bold 12px Arial; color: black;">₹${(item.quantity * item.price).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
//               <td style="border: 1px solid #ddd; padding-bottom: 10px; padding-top: 10px; text-align: left; font: bold 12px Arial; color: black;">${item.vendorName || '—'}</td>
//               <td style="border: 1px solid #ddd; padding-bottom: 10px; padding-top: 10px; text-align: left; font: bold 12px Arial; color: black;">${item.reason || '—'}</td>
//             </tr>
//           `;
//       });

//       // Transaction Total Row — EXACT SAME STYLE
//       htmlContent += `
//               <tr style="background-color: #f8d7da; font-weight: bold;">
//                 <td colspan="7" style="border: 1px solid #ddd; padding-bottom: 10px; padding-top: 10px; text-align: right; font: bold 12px Arial; color: black;"><strong>Transaction Total:</strong></td>
//                 <td style="border: 1px solid #ddd; padding-bottom: 10px; padding-top: 10px; text-align: right; font: bold 12px Arial; color: black;"><strong>₹${outwordTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
//               </tr>
//             </tbody>
//           </table>
//         `;
//     } else {
//       htmlContent += `
//           <div style="text-align: center; padding: 15px; color: #666; font-style: italic;">
//             No items recorded for this transaction.
//           </div>
//         `;
//     }
//   });

//   // Grand Total — EXACT SAME STYLE AS CUTTING LIST
//   htmlContent += `
//       <div style="margin-top: 25px; padding: 15px; background: #f8d7da; border-radius: 5px; border: 1px solid #dc3545; max-width: 800px; margin-left: auto; margin-right: auto;">
//         <table style="border: none; width: auto; margin-left: auto;">
//           <tr>
//             <td style="border: none; padding: 4px 12px; font-weight: bold;"><strong>Grand Total (All Transactions):</strong></td>
//             <td style="border: none; padding: 4px 12px; text-align: right; font-weight: bold;"><strong>₹${totalValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
//           </tr>
//           <tr>
//             <td style="border: none; padding: 4px 12px; font-weight: bold;"><strong>Total Transactions:</strong></td>
//             <td style="border: none; padding: 4px 12px; text-align: right; font-weight: bold;"><strong>${outwords.length}</strong></td>
//           </tr>
//           <tr>
//             <td style="border: none; padding: 4px 12px; font-weight: bold;"><strong>Generated On:</strong></td>
//             <td style="border: none; padding: 4px 12px; text-align: right; font-weight: bold;"><strong>${formatDateForPDF(new Date().toISOString())}</strong></td>
//           </tr>
//         </table>
//       </div>
//     `;

//   reportContainer.innerHTML = htmlContent;
//   document.body.appendChild(reportContainer);

//   try {
//     // Generate PDF using html2canvas and jsPDF - EXACT SAME TECHNIQUE
//     const canvas = await html2canvas(reportContainer, {
//       scale: 3,
//       useCORS: true,
//       backgroundColor: '#ffffff',
//     });

//     const pdf = new jsPDF('p', 'mm', 'a4');
//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const pageHeight = pdf.internal.pageSize.getHeight();
//     const bottomMargin = 15;
//     const topMargin = 18;

//     const imgWidth = pageWidth;
//     const imgHeight = (canvas.height * imgWidth) / canvas.width;

//     let heightLeft = imgHeight;
//     let pageNumber = 1;

//     while (heightLeft > 0) {
//       if (pageNumber > 1) pdf.addPage();

//       const usableHeight =
//         pageHeight - bottomMargin - (pageNumber === 1 ? 0 : topMargin);

//       const pageCanvas = document.createElement('canvas');
//       pageCanvas.width = canvas.width;
//       pageCanvas.height = Math.floor((usableHeight * canvas.width) / imgWidth);

//       const ctx = pageCanvas.getContext('2d');

//       if (!ctx) {
//         throw new Error('Canvas context not available');
//       }
//       ctx.fillStyle = '#ffffff';
//       ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

//       ctx.drawImage(
//         canvas,
//         0,
//         (imgHeight - heightLeft) * (canvas.width / imgWidth),
//         canvas.width,
//         pageCanvas.height,
//         0,
//         0,
//         pageCanvas.width,
//         pageCanvas.height,
//       );

//       const imgData = pageCanvas.toDataURL('image/jpeg', 1);
//       pdf.addImage(
//         imgData,
//         'JPEG',
//         0,
//         pageNumber === 1 ? 0 : topMargin,
//         imgWidth,
//         usableHeight,
//         undefined,
//         'FAST',
//       );

//       pdf.setFontSize(9);
//       pdf.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 8, {
//         align: 'center',
//       });

//       heightLeft -= usableHeight;
//       pageNumber++;
//     }

//     // Generate filename with date
//     const dateStr = new Date().toISOString().split('T')[0];
//     const fileName = `Outword_History_Report_${dateStr}.pdf`;

//     pdf.save(fileName);
//     toast.success('PDF downloaded successfully!');
//   } catch (error) {
//     console.error('PDF generation failed:', error);
//     toast.error('Failed to generate PDF');
//   } finally {
//     document.body.removeChild(reportContainer);
//   }
// };

// // ──────────────────────────────────────────────────────────────
// // Small Date Filter Popup Component - SAME AS INWORD
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
//   filterType: {event: boolean; po: boolean; wastage: boolean};
//   setFilterType: React.Dispatch<
//     React.SetStateAction<{event: boolean; po: boolean; wastage: boolean}>
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

//           {/* Type Filter */}
//           <div className="mb-4">
//             <label className="text-gray-700 mb-2 block text-xs font-medium">
//               Filter by Type
//             </label>
//             <div className="grid grid-cols-2 gap-2">
//               <label className="text-gray-700 flex items-center gap-2 text-xs">
//                 <input
//                   type="checkbox"
//                   checked={filterType.event}
//                   onChange={(e) =>
//                     setFilterType((prev) => ({
//                       ...prev,
//                       event: e.target.checked,
//                     }))
//                   }
//                   className="h-3 w-3"
//                 />
//                 Event
//               </label>

//               <label className="text-gray-700 flex items-center gap-2 text-xs">
//                 <input
//                   type="checkbox"
//                   checked={filterType.po}
//                   onChange={(e) =>
//                     setFilterType((prev) => ({
//                       ...prev,
//                       po: e.target.checked,
//                     }))
//                   }
//                   className="h-3 w-3"
//                 />
//                 PO
//               </label>

//               <label className="text-gray-700 flex items-center gap-2 text-xs">
//                 <input
//                   type="checkbox"
//                   checked={filterType.wastage}
//                   onChange={(e) =>
//                     setFilterType((prev) => ({
//                       ...prev,
//                       wastage: e.target.checked,
//                     }))
//                   }
//                   className="h-3 w-3"
//                 />
//                 Wastage
//               </label>
//             </div>
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
// const OutWordHistory: React.FC = () => {
//   const {user} = useAuthContext();
//   const {data: outwords = [], isLoading, error} = useOutwordHistory();
//   const [selectedOutword, setSelectedOutword] = useState<Outword | null>(null);
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
//     wastage: boolean;
//   }>({
//     event: false,
//     po: false,
//     wastage: false,
//   });

//   // Filter data based on date range and type
//   const filteredOutwords = useMemo(() => {
//     let result = outwords;

//     if (fromDate || toDate) {
//       result = result.filter((outword: {createdAt: string}) => {
//         const outwordDate = startOfDay(toIST(outword.createdAt));
//         const filterFrom = fromDate ? startOfDay(toIST(fromDate)) : null;
//         const filterTo = toDate ? endOfDay(toIST(toDate)) : null;

//         if (filterFrom && filterTo) {
//           return outwordDate >= filterFrom && outwordDate <= filterTo;
//         } else if (filterFrom) {
//           return outwordDate >= filterFrom;
//         } else if (filterTo) {
//           return outwordDate <= filterTo;
//         }
//         return true;
//       });
//     }

//     // Filter by type
//     if (filterType.event || filterType.po || filterType.wastage) {
//       result = result.filter((outword) => {
//         if (filterType.event && outword.event) return true;
//         if (filterType.po && outword.poNumber) return true;
//         if (filterType.wastage && outword.type.toLowerCase() === 'wastage')
//           return true;
//         return false;
//       });
//     }

//     return result.sort(
//       (a, b) =>
//         new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
//     );
//   }, [outwords, fromDate, toDate, filterType]);

//   const clearFilters = () => {
//     setFromDate('');
//     setToDate('');
//     setFilterType({event: false, po: false, wastage: false});
//     setShowFilterPopup(false);
//   };

//   const exportToPDF = (
//     outwords: Outword[],
//     fromDate: string | null,
//     toDate: string | null,
//   ) => {
//     try {
//       // Generate HTML for preview/print
//       const previewHTML = generatePDFHTML(outwords, fromDate, toDate, userInfo);

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
//     return <div className="p-6 text-center">Loading outwords...</div>;
//   if (error)
//     return <div className="p-6 text-red-600">Error: {error.message}</div>;

//   // ───── MAIN TABLE COLUMNS ─────
//   const columns: Column<Outword>[] = [
//     {
//       header: 'Sr No.',
//       accessor: 'id',
//       render: (item) => {
//         const index = filteredOutwords.findIndex((i) => i.id === item.id);
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
//       header: 'Type',
//       accessor: 'type',
//       render: (item) => (
//         <div className="text-center">
//           <span className="text-black-800 inline-flex items-center justify-center rounded-full px-2.5 py-1 font-medium capitalize">
//             {item.type.toLowerCase()}
//           </span>
//         </div>
//       ),
//       sortable: true,
//       className: 'text-center min-w-[120px]',
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

//   // Item columns for modal
//   const itemColumns: Column<OutwordInventoryItem>[] = [
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
//     {
//       header: 'Vendor',
//       accessor: 'vendorName',
//       render: (item) => (
//         <div className="text-center">
//           <span className="text-sm">{item.vendorName || '—'}</span>
//         </div>
//       ),
//       className: 'text-center min-w-[120px]',
//     },
//     {
//       header: 'Reason',
//       accessor: 'reason',
//       render: (item) => (
//         <div className="text-center">
//           <span className="text-gray-600 text-sm">{item.reason || '—'}</span>
//         </div>
//       ),
//       className: 'text-center min-w-[150px]',
//     },
//   ];

//   return (
//     <div className="rounded-lg bg-white p-6">
//       {/* Header with Actions */}
//       <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
//         <div>
//           <h2 className="text-gray-800 text-2xl font-bold">Outword History</h2>
//           <p className="text-gray-600 mt-1 text-sm">
//             Track all outgoing inventory transactions
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           {/* Filter Badge (if filters applied) - BLUE THEME */}
//           {(fromDate || toDate) && (
//             <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5">
//               <FiFilter className="text-sm text-blue-600" />
//               <span className="text-sm font-medium text-blue-700">
//                 {filteredOutwords.length} of {outwords.length} records
//               </span>
//               <button
//                 onClick={clearFilters}
//                 className="text-sm text-blue-600 hover:text-blue-800"
//               >
//                 ×
//               </button>
//             </div>
//           )}

//           {/* Filter Button - BLUE THEME */}
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

//           {/* Print/Export Button - BLUE THEME */}
//           <GenericButton
//             onClick={() => exportToPDF(filteredOutwords, fromDate, toDate)}
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
//           filteredCount={filteredOutwords.length}
//           totalCount={outwords.length}
//           onClose={() => setShowFilterPopup(false)}
//           triggerRef={filterButtonRef}
//           filterType={filterType}
//           setFilterType={setFilterType}
//         />
//       )}

//       {/* ───── MAIN TABLE ───── */}
//       <GenericTable
//         data={filteredOutwords}
//         columns={columns}
//         itemsPerPage={15}
//         searchAble={true}
//         action={false}
//       />

//       {/* ───── MODAL POPUP ───── */}
//       {selectedOutword && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
//           <div className="my-8 max-h-[90vh] w-full max-w-6xl overflow-hidden overflow-y-auto rounded-lg bg-white shadow-xl">
//             {/* Modal Header - FIXED POSITION */}
//             <div className="sticky top-0 z-50 flex items-center justify-between border-b border-stroke bg-white px-6 py-4 shadow-sm">
//               <div>
//                 <h3 className="text-gray-800 text-lg font-semibold">
//                   Outword Details
//                 </h3>
//                 <p className="text-gray-600 mt-1 text-sm">
//                   {selectedOutword.type.toLowerCase() === 'wastage'
//                     ? 'Wastage'
//                     : selectedOutword.event
//                       ? `${selectedOutword.event.name} – ${formatIST(selectedOutword.event.startDate, 'dd MMM yyyy')}`
//                       : selectedOutword.poNumber
//                         ? `PO #${selectedOutword.poNumber}`
//                         : 'General Outword'}
//                 </p>
//               </div>
//               <button
//                 onClick={() => setSelectedOutword(null)}
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
//                     Outword Information
//                   </h4>
//                   <div className="space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Date:</span>
//                       <span className="font-medium">
//                         {formatIST(selectedOutword.createdAt)}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Type:</span>
//                       <span className="font-medium capitalize">
//                         {selectedOutword.type.toLowerCase()}
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
//                         {selectedOutword.inventoryItem.length}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Categories:</span>
//                       <span className="font-medium">
//                         {
//                           Array.from(
//                             new Set(
//                               selectedOutword.inventoryItem.map(
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
//                         {selectedOutword.inventoryItem
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
//               {selectedOutword.inventoryItem.length === 0 ? (
//                 <div className="rounded-lg border border-stroke py-12 text-center">
//                   <p className="text-gray-500">
//                     No items recorded for this outword.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="rounded-lg border border-stroke">
//                   <div className="bg-gray-50 border-b border-stroke px-6 py-4">
//                     <h4 className="text-gray-800 font-medium">Items List</h4>
//                   </div>
//                   <div className="max-h-[400px] overflow-y-auto">
//                     <GenericTable
//                       data={selectedOutword.inventoryItem}
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
//                         {selectedOutword.inventoryItem
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
//             <div className="border-t border-stroke px-6 py-4">
//               <div className="flex justify-end">
//                 <button
//                   onClick={() => setSelectedOutword(null)}
//                   className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded px-4 py-2 font-medium transition duration-300 ease-in-out"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OutWordHistory;

import React, {useState, useMemo, useRef} from 'react';
import {FiFilter, FiPrinter} from 'react-icons/fi';
import {useOutwordHistory} from '../storeApi';
import GenericTable from '../../Forms/Table/GenericTable';
import GenericButton from '../../Forms/Buttons/GenericButton';
import toast from 'react-hot-toast';
import {useAuthContext} from '@/context/AuthContext';
import DateFilterPopup from './DateFilterPopup';
import OutwordModal from './OutwordModal';
import {Outword} from '../types';
import {createColumns} from './columns';
import {generatePDFHTML} from './pdf';
import {toIST} from '../helpers';
import {startOfDay, endOfDay} from 'date-fns';

interface OutwordHistoryProps {
  hasEditAccess: boolean;
}
const OutWordHistory: React.FC<OutwordHistoryProps> = ({
  hasEditAccess: propHasEditAccess,
}) => {
  const {user} = useAuthContext();
  const {data: outwords = [], isLoading, error} = useOutwordHistory();
  const [selectedOutword, setSelectedOutword] = useState<Outword | null>(null);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const restriction = user?.employeeRestriction?.inwordHistory;
  const role = user?.role;

  const hasEditAccess =
    propHasEditAccess !== undefined
      ? propHasEditAccess
      : role === 'CATEROR' || restriction === 'EDIT';
  const userInfo = {
    fullname: user?.fullname || 'Caterer Name',
    address: user?.address || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  };

  const [filterType, setFilterType] = useState({
    event: false,
    po: false,
    wastage: false,
  });

  const filteredOutwords = useMemo(() => {
    let result = outwords;

    if (fromDate || toDate) {
      result = result.filter((outword: {createdAt: string}) => {
        const outwordDate = startOfDay(toIST(outword.createdAt));
        const filterFrom = fromDate ? startOfDay(toIST(fromDate)) : null;
        const filterTo = toDate ? endOfDay(toIST(toDate)) : null;

        if (filterFrom && filterTo) {
          return outwordDate >= filterFrom && outwordDate <= filterTo;
        } else if (filterFrom) {
          return outwordDate >= filterFrom;
        } else if (filterTo) {
          return outwordDate <= filterTo;
        }
        return true;
      });
    }

    if (filterType.event || filterType.po || filterType.wastage) {
      result = result.filter((outword) => {
        if (filterType.event && outword.event) return true;
        if (filterType.po && outword.poNumber) return true;
        if (filterType.wastage && outword.type.toLowerCase() === 'wastage')
          return true;
        return false;
      });
    }

    return result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [outwords, fromDate, toDate, filterType]);

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setFilterType({event: false, po: false, wastage: false});
    setShowFilterPopup(false);
  };

  const exportToPDF = (
    outwordsArg: Outword[],
    fromArg: string | null,
    toArg: string | null,
  ) => {
    try {
      const previewHTML = generatePDFHTML(
        outwordsArg,
        fromArg,
        toArg,
        userInfo,
      );
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
    return <div className="p-6 text-center">Loading outwords...</div>;
  if (error)
    return <div className="p-6 text-red-600">Error: {error.message}</div>;

  const columns = createColumns(filteredOutwords, exportToPDF);

  return (
    <div className="rounded-lg bg-white p-6 dark:bg-black">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-gray-800 text-2xl font-bold">Outword History</h2>
          <p className="text-gray-600 mt-1 text-sm">
            Track all outgoing inventory transactions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(fromDate || toDate) && (
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5">
              <FiFilter className="text-sm text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {filteredOutwords.length} of {outwords.length} records
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
              onClick={() => exportToPDF(filteredOutwords, fromDate, toDate)}
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
          filteredCount={filteredOutwords.length}
          totalCount={outwords.length}
          onClose={() => setShowFilterPopup(false)}
          triggerRef={filterButtonRef}
          filterType={filterType}
          setFilterType={setFilterType}
        />
      )}

      <GenericTable
        data={filteredOutwords}
        columns={columns}
        itemsPerPage={15}
        searchAble={true}
        action={false}
      />

      {selectedOutword && (
        <OutwordModal
          selectedOutword={selectedOutword}
          onClose={() => setSelectedOutword(null)}
        />
      )}
    </div>
  );
};

export default OutWordHistory;
