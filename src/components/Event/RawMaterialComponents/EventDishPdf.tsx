// import React from 'react'
// import toast from 'react-hot-toast';

// const EventDishPdf = () => {
//       const handleDownloadPDF = () => {
//         // Get current sub-event's vendor assignments
//         const currentSubEventVendorData = FoodVendorData?.find(
//           (se: any) => se.subEventId === subEvent?.id,
//         );

//         if (
//           !predictionData?.data?.dishes?.length &&
//           !foodLabourDishes.length &&
//           !(currentSubEventVendorData?.dishes?.length > 0)
//         ) {
//           toast.error('No data available to generate PDF');
//           return;
//         }

//         /* ================= GROUP IN-HOUSE DISHES (Main Prediction Dishes) ================= */
//         const groupedMainDishes: Record<string, any[]> = {};
//         predictionData?.data?.dishes?.forEach((item: any) => {
//           const categoryName =
//             item?.category?.name || item?.dishCategory || 'Uncategorized';
//           if (!groupedMainDishes[categoryName])
//             groupedMainDishes[categoryName] = [];
//           groupedMainDishes[categoryName].push(item);
//         });

//         /* ================= GROUP FOOD VENDOR ASSIGNED DISHES ================= */
//         // This matches EXACTLY the UI logic: rawMaterialCalculation !== true → wait, NO!
//         // In UI: if (dish?.rawMaterialCalculation !== true) return acc; → means include only when === true
//         const groupedVendorDishes: Record<string, any[]> = {};
//         currentSubEventVendorData?.dishes
//           ?.filter((d: any) => d.rawMaterialCalculation === true) // ← Matches UI perfectly
//           .forEach((dish: any) => {
//             const categoryName = dish?.dishCategory || 'Uncategorized';
//             if (!groupedVendorDishes[categoryName])
//               groupedVendorDishes[categoryName] = [];
//             groupedVendorDishes[categoryName].push(dish);
//           });

//         /* ================= GROUP FOOD LABOUR ASSIGNED DISHES (From Prediction) ================= */
//         const groupedLabourDishes: Record<string, any[]> = {};
//         foodLabourDishes.forEach((dish: any) => {
//           const categoryName = dish?.dishCategory || 'Uncategorized';
//           if (!groupedLabourDishes[categoryName])
//             groupedLabourDishes[categoryName] = [];
//           groupedLabourDishes[categoryName].push(dish);
//         });

//         /* ================= BUILD HTML CONTENT ================= */
//         let htmlContent = `
//         <!-- HEADER -->
//        <div style="border:1px solid #0D47A1; padding:10px; margin-bottom:12px; background:#E3F2FD; font-family: Arial, sans-serif;">
//       <table width="100%" cellpadding="0" cellspacing="0">
//         <tr>
//           <!-- Logo -->
//           <td width="10%" align="left" valign="middle">
//             ${
//               catererLogo
//                 ? `<img
//                     src="${catererLogo}"
//                     alt="Caterer Logo"
//                     style="max-height:60px; max-width:150px; object-fit:contain;"
//                   />`
//                 : ''
//             }
//           </td>

//           <!-- Text -->
//           <td width="90%" align="center">
//             <h1 style="margin:0; font-size:24px; color:#0D47A1; font-weight:800;">
//               ${user?.fullname || 'Caterer Name'}
//             </h1>

//             <p style="margin:6px 0 0; font-weight:bold; font-size:11px; color:#000;">
//               ${user?.address ? `Address - ${user.address}` : ''} ${
//                 user?.email ? ` | Email - ${user.email}` : ''
//               } | Mob.${user?.phoneNumber || ''}
//             </p>
//           </td>
//         </tr>
//       </table>
//     </div>

//         <!-- TITLE BAR -->
//         <div style="text-align:center; background:#0D47A1; color:white; padding:10px 6px; margin-bottom:12px; font-weight:bold;">
//           <h2 style="margin:0; font-size:16px;">Sub Event Production Report</h2>
//           <div style="font-size:11px; margin-top:4px; opacity:0.95;">
//             Event: ${EventData?.name || 'N/A'} |
//             Sub Event: ${subEvent?.name || 'N/A'} |
//             Date: ${
//               subEvent?.date
//                 ? new Date(subEvent.date).toLocaleDateString('en-GB', {
//                     day: '2-digit',
//                     month: 'short',
//                     year: 'numeric',
//                   })
//                 : 'N/A'
//             } |
//           Time: ${
//             subEvent?.time
//               ? new Date(subEvent.time).toLocaleTimeString('en-US', {
//                   hour: '2-digit',
//                   minute: '2-digit',
//                   hour12: true,
//                 })
//               : 'N/A'
//           }

//           </div>
//           <div style="font-size:11px; margin-top:2px; opacity:0.95;">
//             Address: ${subEvent?.address || 'N/A'} | People Count: ${predictionData?.data?.peopleCount || subEvent?.expectedPeople || 'N/A'} |
//             ClientName: ${EventData?.client?.user?.fullname || 'N/A'}
//           </div>
//         </div>
//       `;

//         /* ================= IN-HOUSE PREPARATION DISHES ================= */
//         if (Object.keys(groupedMainDishes).length > 0) {
//           htmlContent += `
//           <h3 style="margin:20px 0 10px; font-size:14px; color:#0D47A1; text-align:left;">In-House Preparation Dishes</h3>
//           <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:30px;">
//             <thead>
//               <tr style="background:#1E3A8A; color:#fff; font-weight:700;">
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Dish</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Portion Size</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">No Of People</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Production Qty</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Batch 1</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Batch 2</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Batch 3</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Incharge</th>
//               </tr>
//             </thead>
//             <tbody>`;

//           Object.entries(groupedMainDishes).forEach(([categoryName, items]) => {
//             htmlContent += `
//             <tr>
//               <td colspan="8" style="background:#E3F2FD; color:#0D47A1; border:1px solid #0D47A1; padding:8px; font-weight:bold; text-align:left; font-size:13px;">
//                 ${categoryName}
//               </td>
//             </tr>`;

//             items.forEach((dish: any, idx: number) => {
//               const maharajNames =
//                 dish?.maharaj?.length > 0
//                   ? dish.maharaj
//                       .map((m: any) => m?.maharaj?.fullname)
//                       .filter(Boolean)
//                       .join(', ')
//                   : 'N/A';

//               const kg = dish?.kg ?? 0;

//               htmlContent += `
//               <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8f8f8'};">
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${dish?.dish || 'N/A'}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${dish?.portionSize ?? '-'}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${dish?.people ?? '-'}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${kg.toFixed(2)}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${(kg * 0.7).toFixed(2)}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${(kg * 0.2).toFixed(2)}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${(kg * 0.1).toFixed(2)}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${maharajNames}</td>
//               </tr>`;
//             });
//           });

//           htmlContent += `</tbody></table>`;
//         }

//         /* ================= FOOD VENDOR ASSIGNED DISHES (Matches UI Exactly) ================= */
//         if (Object.keys(groupedVendorDishes).length > 0) {
//           htmlContent += `
//           <h3 style="margin:30px 0 10px; font-size:14px; color:#0D47A1; text-align:left;">Food Vendor Assigned Dishes</h3>
//           <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:30px;">
//             <thead>
//               <tr style="background:#1E3A8A; color:#fff; font-weight:700;">
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Dish Name</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Food Vendor</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Order Qty</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Batch 1 (70%)</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Batch 2 (20%)</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Batch 3 (10%)</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Preparation Qty</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Unit</th>
//               </tr>
//             </thead>
//             <tbody>`;

//           Object.entries(groupedVendorDishes).forEach(([categoryName, items]) => {
//             htmlContent += `
//             <tr>
//               <td colspan="8" style="background:#E3F2FD; color:#0D47A1; border:1px solid #0D47A1; padding:8px; font-weight:bold; text-align:left; font-size:13px;">
//                 ${categoryName}
//               </td>
//             </tr>`;

//             items.forEach((dish: any, idx: number) => {
//               const updatedKg = dishUpdates[dish.dishId]?.kg ?? dish?.expected ?? 0;

//               htmlContent += `
//               <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8f8f8'};">
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;font-weight:700;">${dish?.dishName || 'N/A'}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${dish?.foodVendorName || 'N/A'}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${updatedKg.toFixed(2)}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${(updatedKg * 0.7).toFixed(2)}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${(updatedKg * 0.2).toFixed(2)}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${(updatedKg * 0.1).toFixed(2)}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${dish?.preparation || '-'}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${dish?.unit || '-'}</td>
//               </tr>`;
//             });
//           });

//           htmlContent += `</tbody></table>`;
//         }

//         /* ================= FOOD LABOUR ASSIGNED DISHES ================= */
//         if (Object.keys(groupedLabourDishes).length > 0) {
//           htmlContent += `
//           <h3 style="margin:30px 0 10px; font-size:14px; color:#0D47A1; text-align:left;">Food Labour Assigned Dishes</h3>
//           <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:30px;">
//             <thead>
//               <tr style="background:#1E3A8A; color:#fff; font-weight:700;">
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Dish Name</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Food Labour</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Portion Size</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">No Of People</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Production Qty</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Batch 1</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Batch 2</th>
//                 <th style="padding:8px; border:1px solid #ccc; text-align:center;">Batch 3</th>
//               </tr>
//             </thead>
//             <tbody>`;

//           Object.entries(groupedLabourDishes).forEach(([categoryName, items]) => {
//             htmlContent += `
//             <tr>
//               <td colspan="8" style="background:#E3F2FD; color:#0D47A1; border:1px solid #0D47A1; padding:8px; font-weight:bold; text-align:left; font-size:13px;">
//                 ${categoryName}
//               </td>
//             </tr>`;

//             items.forEach((dish: any, idx: number) => {
//               const portionSize =
//                 portionAndPeople[dish.dishId]?.portionSize ||
//                 dish?.portionSize ||
//                 0;
//               const people =
//                 portionAndPeople[dish.dishId]?.people || dish?.people || 0;
//               const productionQty = (portionSize * people).toFixed(2);
//               const qty = parseFloat(productionQty);

//               htmlContent += `
//               <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8f8f8'};">
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${dish?.name || 'N/A'}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${dish?.foodVendor || 'N/A'}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${portionSize}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${people}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${productionQty}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${(qty * 0.7).toFixed(2)}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${(qty * 0.2).toFixed(2)}</td>
//                 <td style="padding:8px; border:1px solid #ddd; text-align:center;">${(qty * 0.1).toFixed(2)}</td>
//               </tr>`;
//             });
//           });

//           htmlContent += `</tbody></table>`;
//         }

//         /* ================= NOTE SECTION ================= */
//         if (subEvent?.note) {
//           htmlContent += `
//           <div style="margin-top:20px; padding:10px; background:#f8f9fa; border-left:4px solid #0D47A1; font-size:12px;">
//             <strong>Note:</strong> ${subEvent.note}
//           </div>`;
//         }

//         /* ================= FULL HTML DOCUMENT ================= */
//         const fullHtml = `<!doctype html>
//     <html>
//     <head>
//       <meta charset="utf-8" />
//       <title>Sub Event Production Report - ${subEvent?.name || 'N/A'}</title>
//       <style>
//         @page { margin: 12mm 8mm; size: A4; }
//         body { margin:0; padding:0; font-family: Arial, sans-serif; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//         table { width:100%; border-collapse: collapse; }
//         thead { display: table-header-group; }
//         tr { page-break-inside: avoid; }
//         @media print {
//           body { margin: 0; }
//         }
//       </style>
//     </head>
//     <body>
//       <div style="padding:12px;">
//         ${htmlContent}
//       </div>
//       <script>
//         setTimeout(() => {
//           window.print();
//           setTimeout(() => window.close(), 600);
//         }, 400);
//       </script>
//     </body>
//     </html>`;

//         const printWindow = window.open(
//           '',
//           'printWindow',
//           'width=1000,height=800,scrollbars=yes',
//         );
//         if (!printWindow) {
//           toast.error('Please allow popups to generate the PDF');
//           return;
//         }
//         printWindow.document.open();
//         printWindow.document.write(fullHtml);
//         printWindow.document.close();
//       };
//   return (
//     <div>

//     </div>
//   )
// }

// export default EventDishPdf
