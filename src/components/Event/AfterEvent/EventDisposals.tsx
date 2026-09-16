// import React, {useEffect, useRef, useState} from 'react';
// import {FormProvider, useForm} from 'react-hook-form';
// import GenericInputField from '@/components/Forms/Input/GenericInputField';
// import GenericButton from '@/components/Forms/Buttons/GenericButton';
// import {BiChevronDown, BiChevronUp} from 'react-icons/bi';
// import {useBulkReturnEventUtensils} from '@/lib/react-query/queriesAndMutations/cateror/eventUtensils';
// import {Route} from '@/routes/_app/_event/events.$id';
// import {useGetUtensils} from '@/lib/react-query/queriesAndMutations/cateror/utensils';
// import z from 'zod';
// import {bulkReturnUtensilToEventSchema} from '@/lib/validation/eventSchema';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
// import {useGetEventDisposal} from '@/lib/react-query/queriesAndMutations/cateror/eventDisposal';
// import {log} from 'console';

// // Extend your utensil schema with a default utensil type.
// const UtensilSchema = z.object({
//   utensilId: z.string(),
//   utensilType: z.string().default('FORK'),
//   taken: z.number(),
//   returned: z.number(),
//   updateReturned: z.number(),
// });

// type EventUtensil = z.infer<typeof UtensilSchema>;
// type FormValues = z.infer<typeof bulkReturnUtensilToEventSchema>;

// const EventDisposals: React.FunctionComponent = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const methods = useForm<FormValues>({
//     defaultValues: {
//       eventId: '',
//       utensils: [],
//     },
//   });

//   const {handleSubmit, setValue} = methods;
//   const {id: EventId} = Route.useParams();
//   const {data: eventDisposals} = useGetEventDisposal(EventId);
//   console.log('ddddddddddddddddd', eventDisposals);

//   const {data: utensils} = useGetUtensils(
//     localStorage.getItem('languageId') || '',
//   );

//   const [utensilList, setUtensilList] = useState<EventUtensil[]>([]);
//   const tableRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (eventDisposals) {
//       const transformedData = eventDisposals.map((disposal: any) => ({
//         utensilId: disposal.disposalId,
//         utensilType: disposal.name,
//         taken: disposal.taken,
//         returned: disposal.returned,
//         updateReturned: disposal.returned,
//       }));
//       setUtensilList(transformedData);
//       setValue('utensils', transformedData);
//     }
//   }, [eventDisposals, setValue]);

//   const {mutateAsync: bulkReturnUtensils} = useBulkReturnEventUtensils();

//   const onSubmit = async (data: FormValues) => {
//     const transformedData = data.utensils.map((utensil) => ({
//       ...utensil,
//       returned: Number(utensil.updateReturned),
//     }));
//     await bulkReturnUtensils({
//       eventId: EventId,
//       utensils: transformedData,
//     });
//   };

//   const handleDownloadPDF = () => {
//     if (!utensilList) return;

//     const reportContainer = document.createElement('div');
//     reportContainer.style.width = '500px';
//     reportContainer.style.padding = '10px';
//     reportContainer.style.background = 'white';
//     reportContainer.style.fontFamily = 'Arial, sans-serif';

//     // Header Section
//     const header = document.createElement('div');
//     header.style.textAlign = 'center';
//     header.style.marginBottom = '15px';
//     header.innerHTML = `
//       <h2 style="margin-bottom: 5px; font-size: 16px; color: #333;">Event Utensil Report</h2>
//       <p style="margin: 0; font-size: 12px;">Event Name: <strong>${EventId}</strong></p>
//       <p style="margin: 0; font-size: 10px; color: #666;">Generated on: ${new Date().toLocaleDateString()}</p>
//     `;
//     reportContainer.appendChild(header);

//     // Table Section
//     const table = document.createElement('table');
//     table.style.width = '100%';
//     table.style.borderCollapse = 'collapse';
//     table.style.fontSize = '10px';
//     table.style.border = '1px solid #ddd';

//     // Table Header
//     const headerRow = table.insertRow();
//     ['Category', 'Disposal', 'Outward', 'Inward'].forEach((text) => {
//       const th = document.createElement('th');
//       th.innerText = text;
//       th.style.border = '1px solid gray';
//       th.style.paddingBottom = '8px';
//       th.style.backgroundColor = '#318CE7';
//       th.style.color = 'white';
//       th.style.textAlign = 'center';
//       th.style.fontWeight = 'bold';
//       headerRow.appendChild(th);
//     });

//     // Table Rows
//     utensilList.forEach((item, index) => {
//       const row = table.insertRow();
//       row.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#e6f2ff';

//       [
//         utensils?.data?.find((sub: any) => sub.id === item.utensilId)?.name ||
//           '',
//         item.utensilType,
//         item.taken,
//         item.returned,
//       ].forEach((text) => {
//         const cell = row.insertCell();
//         cell.innerText = text;
//         cell.style.border = '1px solid #ddd';
//         cell.style.paddingBottom = '8px';
//         cell.style.textAlign = 'center';
//         cell.style.height = '30px';
//       });
//     });

//     reportContainer.appendChild(table);

//     // Footer Section
//     const footer = document.createElement('div');
//     footer.style.marginTop = '10px';
//     footer.style.fontSize = '8px';
//     footer.style.textAlign = 'center';
//     footer.style.color = '#666';
//     footer.innerHTML = `<p>&copy; PhygitalTech. Contact: 9511640351.</p>`;
//     reportContainer.appendChild(footer);

//     document.body.appendChild(reportContainer);

//     // Convert to PDF
//     html2canvas(reportContainer, {scale: 1.5})
//       .then((canvas) => {
//         const doc = new jsPDF('p', 'mm', 'a4');
//         const imgData = canvas.toDataURL('image/jpeg', 0.8);
//         const imgWidth = 210;
//         const imgHeight = (canvas.height * imgWidth) / canvas.width;
//         const pageHeight = doc.internal.pageSize.height;
//         let offsetY = 0;

//         while (offsetY < imgHeight) {
//           if (offsetY > 0) {
//             doc.addPage();
//           }
//           doc.addImage(imgData, 'JPEG', 0, -offsetY, imgWidth, imgHeight);
//           offsetY += pageHeight;
//         }

//         doc.save('EventUtensilReport.pdf');
//       })
//       .finally(() => {
//         document.body.removeChild(reportContainer);
//       });
//   };

//   return (
//     <div className="mt-2.5 rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
//       <div
//         className="flex flex-row justify-between"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         <h2 className="mb-4 cursor-pointer text-xl font-bold">Disposals</h2>
//         <div className="flex gap-6">
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               handleDownloadPDF();
//             }}
//             className="text-blue-500 underline"
//           >
//             Download PDF
//           </button>
//           <h2 className="cursor-pointer text-xl">
//             {isOpen ? <BiChevronUp size={30} /> : <BiChevronDown size={30} />}
//           </h2>
//         </div>
//       </div>
//       {isOpen && (
//         <FormProvider {...methods}>
//           <form onSubmit={handleSubmit(onSubmit)}>
//             <div ref={tableRef} className="max-w-full overflow-x-auto">
//               <table className="w-full table-auto">
//                 <thead>
//                   <tr className="bg-gray-2 text-left dark:bg-meta-4">
//                     {['Category', 'Disposal', 'Outward', 'Inward'].map(
//                       (column, index) => (
//                         <th
//                           key={index}
//                           className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white"
//                         >
//                           {column}
//                         </th>
//                       ),
//                     )}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {utensilList.map((utensil, index) => (
//                     <tr
//                       key={index}
//                       className="border-b border-stroke dark:border-strokedark"
//                     >
//                       <td className="px-4 pb-2.5">
//                         {utensils?.data?.find(
//                           (sub: any) => sub.id === utensil.categoryId,
//                         )?.name || ''}
//                       </td>
//                       <td className="px-4 pb-2.5">{utensil.utensilType}</td>
//                       <td className="px-4 pb-2.5">{utensil.taken}</td>
//                       <td className="px-4">
//                         <GenericInputField
//                           name={`utensils.${index}.updateReturned`}
//                           type="number"
//                         />
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             <div className="mt-2.5 flex justify-end pb-5">
//               <GenericButton type="submit">Save</GenericButton>
//             </div>
//           </form>
//         </FormProvider>
//       )}
//     </div>
//   );
// };

// export default EventDisposals;

/*eslint-disable*/
import React, {useEffect, useRef, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {BiChevronDown, BiChevronUp} from 'react-icons/bi';
import {Route} from '@/routes/_app/_event/events.$id';
import z from 'zod';
import {bulkReturnDisposalToEventSchema} from '@/lib/validation/eventSchema';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  useBulkReturnEventDisposals,
  useGetEventDisposal,
} from '@/lib/react-query/queriesAndMutations/cateror/eventDisposal';
import {useGetDisposals} from '@/lib/react-query/queriesAndMutations/cateror/disposal';
import {FiSave} from 'react-icons/fi';
import {useAuthContext} from '@/context/AuthContext';
import {useGetSubevent} from '@/lib/react-query/queriesAndMutations/cateror/event';

// Interfaces for type safety
interface EventDisposal {
  id: string;
  disposalId: string;
  eventId: string;
  taken: number;
  ordered: number;
  returned: number;
  createdAt: string;
  name: string;
  categoryId: string;
  updatedAt: string;
  inventory: number;
  languageId: string;
  caterorId: string;
  category: string;
  event?: {name: string};
}

interface Category {
  id: string;
  name: string;
}

// Schema for disposal
const DisposalSchema = z.object({
  disposalId: z.string(),
  quantity: z.number(), // Kept as quantity for backward compatibility
  categoryId: z.string(),
  taken: z.number(),
  returned: z.number(),
  updateReturned: z.number(),
  name: z.string(),
  category: z.string(),
});

type EventDisposalType = z.infer<typeof DisposalSchema>;
type FormValues = z.infer<typeof bulkReturnDisposalToEventSchema>;

const EventDisposals: React.FC = () => {
  const {user} = useAuthContext();
  const restriction = user?.employeeRestriction?.afterEventDisposal;
  const role = user?.role;

  const [isOpen, setIsOpen] = useState(true);
  const methods = useForm<FormValues>({
    defaultValues: {
      disposals: [{disposalId: '', returned: 0}],
    },
  });

  const {handleSubmit, setValue} = methods;
  const {id: DisposalId} = Route.useParams();
  const {data: eventDisposals} = useGetEventDisposal(DisposalId);
  console.log('====================================');
  console.log('eventDisposals', eventDisposals);
  console.log('====================================');
  const {data: categories} = useGetDisposals(
    localStorage.getItem('languageId') || '',
  );

  const [disposalList, setDisposalList] = useState<EventDisposalType[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>(
    {},
  );
  const [eventName, setEventName] = useState('');
  const [reportType, setReportType] = useState<'regular' | 'missing'>(
    'regular',
  );
  const {data: subEventResponse} = useGetSubevent(DisposalId);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  // Set category names
  useEffect(() => {
    if (categories?.data) {
      const map: Record<string, string> = {};
      categories.data.forEach((item: Category) => {
        map[item.id] = item.name;
      });
      setCategoryNames(map);
    }
  }, [categories]);

  // Transform eventDisposals into disposalList and set form values
  useEffect(() => {
    if (eventDisposals) {
      const transformedData = eventDisposals.map((disposal: EventDisposal) => ({
        disposalId: disposal.disposalId,
        categoryId: disposal.categoryId,
        taken: disposal.taken,
        ordered: disposal.ordered,
        returned: disposal.returned,
        updateReturned: disposal.returned,
        category: disposal.category,
        name: disposal.name,
      }));
      setDisposalList(transformedData);
      setValue(
        'disposals',
        transformedData.map((item) => ({
          disposalId: item.disposalId,
          returned: item.updateReturned,
        })),
      );
      if (eventDisposals[0]?.event?.name) {
        setEventName(eventDisposals[0].event.name);
      }
    }
  }, [eventDisposals, setValue]);

  const {mutate: bulkReturnDisposals, isPending} =
    useBulkReturnEventDisposals();

  const onSubmit = async (data: FormValues) => {
    const disposals = data.disposals.map((disposal) => ({
      disposalId: disposal.disposalId,
      returned: Number(disposal.returned),
    }));

    const eventId = eventDisposals?.[0]?.eventId || '';
    bulkReturnDisposals({
      eventId,
      disposals,
    });
  };

  const handleDownloadPDF = () => {
    try {
      if (!disposalList) return;

      // Items to show (preserve your original logic)
      const itemsToShow =
        reportType === 'missing'
          ? disposalList.filter(
              (item) => (item.updateReturned ?? 0) < (item.taken ?? 0),
            )
          : disposalList;

      // printed date/time strings
      const now = new Date();
      const printedDate = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const printedTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      // compute totals (for regular)
      const totalOutward = itemsToShow.reduce(
        (sum, item) => sum + (item.taken ?? 0),
        0,
      );
      const totalInward = itemsToShow.reduce(
        (sum, item) => sum + (item.updateReturned ?? 0),
        0,
      );
      const totalMissing = totalOutward - totalInward;

      // build rows HTML (preserve values, zebra striping handled by CSS)
      const rowsHtml = itemsToShow
        .map((item, idx) => {
          const missingCount = (item.taken ?? 0) - (item.updateReturned ?? 0);
          if (reportType === 'missing') {
            return `
            <tr style="page-break-inside: avoid; break-inside: avoid;">
              <td style="padding:8px; border:1px solid #ddd; text-align:left; font-weight:700;">${item.category ?? 'N/A'}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:left; font-weight:700;">${item.name ?? 'N/A'}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${item.taken ?? 0}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${item.updateReturned ?? 0}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700; color:#d9534f;">${missingCount}</td>
            </tr>
          `;
          } else {
            return `
            <tr style="page-break-inside: avoid; break-inside: avoid;">
              <td style="padding:8px; border:1px solid #ddd; text-align:left; font-weight:700;">${item.category ?? 'N/A'}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:left; font-weight:700;">${item.name ?? 'N/A'}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${item.taken ?? 0}</td>
              <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${item.updateReturned ?? 0}</td>
            </tr>
          `;
          }
        })
        .join('');

      // build totals row HTML (only for regular)
      const totalsHtml =
        reportType === 'regular'
          ? `
      <div style="margin-top:12px; display:flex; justify-content:space-between; font-weight:700; font-size:12px; gap:12px;">
        <div>Total Outward: ${totalOutward}</div>
        <div>Total Inward: ${totalInward}</div>
        <div style="color: ${totalMissing > 0 ? '#d9534f' : '#28a745'}">Total Missing: ${totalMissing}</div>
      </div>
    `
          : '';

      // Unique filename
      const pad = (n, len = 2) => String(n).padStart(len, '0');
      const fileTs = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}_${String(now.getMilliseconds()).padStart(3, '0')}`;
      const fileName = `${reportType === 'missing' ? 'Missing' : 'Event'}DisposalReport_${fileTs}.pdf`;

      // Build printable HTML content using canonical Cutting List UI + repeat-title for pages 2+
      const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${reportType === 'missing' ? 'Missing Disposal Report' : 'Event Disposal Report'} - ${subEventResponse?.data?.name}</title>
  <style>
    @page { margin: 12mm 8mm; size: A4; }
    html, body { margin:0; padding:0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: Arial, sans-serif; color: #000; }
    body.first-page { padding-top:0 !important; }

    /* repeat-title top-left on pages 2+ */
    .repeat-title {
      position: fixed;
      top: 8px;
      left: 8px;
      background: #0D47A1;
      color: #fff;
      padding: 6px 10px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 0 0 4px 0;
      z-index: 9999;
    }
    body.first-page .repeat-title { display: none !important; }

    .container { padding: 12px; box-sizing: border-box; }

    /* FIRST PAGE HEADER BLOCK */
    .header-box {
      border: 1px solid #0D47A1;
      padding: 8px;
      margin-bottom: 12px;
      background: #E3F2FD;
      text-align: center;
    }
    .header-box h1 { margin: 0; font-size: 24px; font-weight: 800; color: #0D47A1; }
    .header-box p { margin: 6px 0 0 0; font-weight:700; font-size:11px; color:#000; }

    /* TITLE BAR (CUTTING-LIST STYLE) */
    .title-bar {
      background: #0D47A1;
      color: #fff;
      padding: 10px 6px;
      text-align: center;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .title-bar h2 { margin: 0; font-size: 16px; }

    .event-meta {
      text-align: center;
      font-size: 11px;
      margin-bottom: 10px;
      font-weight: 700;
    }

    /* Table styling */
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 12px; }
    thead { display: table-header-group; }
    thead tr { background: #1E3A8A; color: #fff; font-weight: 700; }
    thead th { padding: 8px; border: 1px solid #ccc; text-align: center; }
    tbody td { padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700; color: #000; }
    tbody tr:nth-child(even) { background: #f8f8f8; }
    tr { page-break-inside: avoid; break-inside: avoid; }

    /* Notes and footer */
    .notes { margin-top: 8px; border-top: 1px solid #0D47A1; padding-top: 8px; font-size: 12px; }
    .notes h3 { margin: 0 0 6px 0; font-size: 14px; color: #1E3A8A; }
    .notes .box { min-height: 80px; border: 1px solid #ddd; background: #f9f9f9; padding: 10px; border-radius: 4px; }

    .footer { margin-top: 12px; text-align: center; font-size: 10px; color: #666; }

    @media print {
      .repeat-title { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      td { page-break-inside: avoid; page-break-after: auto; }
    }
  </style>
</head>
<body class="first-page">
  <div class="container">
    <!-- FIRST PAGE HEADER -->
    <div class="header-box">
      <h1>${user?.fullname ? escapeHtml(user.fullname) : 'Name'}</h1>
      <p>
        ${user?.address ? `Address - ${escapeHtml(user.address)} ` : ''}${user?.email ? ` | Email - ${escapeHtml(user.email)}` : ''} | Mob. ${escapeHtml(user?.phoneNumber ?? '')}
      </p>
    </div>

    <!-- TITLE BAR -->
    <div class="title-bar">
      <h2>${reportType === 'missing' ? 'Missing Disposal Report' : 'Event Disposal Report'}</h2>
       <div style="font-size:11px; margin-top:4px; opacity:0.95;">
        Event: ${subEventResponse?.data?.name || 'N/A'} |
        Start Date: ${
          subEventResponse?.data?.startDate
            ? new Date(subEventResponse.data.startDate).toLocaleDateString(
                'en-GB',
                {day: '2-digit', month: 'short', year: 'numeric'},
              )
            : 'N/A'
        } |
        End Date: ${
          subEventResponse?.data?.endDate
            ? new Date(subEventResponse.data.endDate).toLocaleDateString(
                'en-GB',
                {day: '2-digit', month: 'short', year: 'numeric'},
              )
            : 'N/A'
        }
        </div>
    </div>

    <!-- TABLE -->
    <table>
      <thead>
        <tr>
          <th style="text-align:left; width:${reportType === 'missing' ? '25%' : '30%'};">Category</th>
          <th style="text-align:left; width:${reportType === 'missing' ? '35%' : '40%'};">Disposal</th>
          <th style="width:${reportType === 'missing' ? '13%' : '15%'};">Outward</th>
          <th style="width:${reportType === 'missing' ? '13%' : '15%'};">Inward</th>
          ${reportType === 'missing' ? '<th style="width:14%;">Missing</th>' : ''}
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    ${totalsHtml}

 

  <script>
    // small helper to handle print lifecycle
    setTimeout(() => {
      document.body.classList.remove('first-page');
      window.print();
      setTimeout(() => window.close(), 600);
    }, 400);
  </script>
</body>
</html>`;

      // open print window and write
      const printWindow = window.open(
        '',
        'printWindow',
        'width=1000,height=800,scrollbars=yes',
      );
      if (!printWindow) {
        alert('Please allow popups for this site to generate PDF');
        return;
      }

      // escape helper used inside template - define it for the printWindow context
      function escapeHtml(str) {
        if (typeof str !== 'string') return String(str ?? '');
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }

      // Because we've used escapeHtml in the HTML template, we must inject sanitized html into the printWindow.
      // To keep it simple and safe, write the final HTML after replacing placeholders with already-escaped values.
      // Build finalSafeHtml by replacing ${escapeHtml(...)} occurrences above is complex inside template; instead,
      // create a safeHtml string by constructing pieces with escapes here and reusing the same HTML skeleton.

      // We'll create a safe-html variant by re-building the same HTML with already-escaped fields for printWindow.
      const safeUserName = escapeHtml(user?.fullname ?? 'Name');
      const safeAddress = escapeHtml(user?.address ?? '');
      const safeEmail = escapeHtml(user?.email ?? '');
      const safePhone = escapeHtml(user?.phoneNumber ?? '');
      const safeEventName = escapeHtml(eventName ?? 'Unknown Event');

      // Replace the header values in html with safe values (simple replacements)
      let finalHtml = html
        .replace(escapeHtml(user?.fullname ?? 'Name'), safeUserName)
        .replace(escapeHtml(user?.address ?? ''), safeAddress)
        .replace(escapeHtml(user?.email ?? ''), safeEmail)
        .replace(escapeHtml(user?.phoneNumber ?? ''), safePhone)
        .replace(escapeHtml(eventName ?? 'Unknown Event'), safeEventName)
        .replace(/&amp;/g, '&amp;'); // keep ampersands as is

      printWindow.document.open();
      printWindow.document.write(finalHtml);
      printWindow.document.close();

      // Optionally, set a download filename for some browsers: create a hidden link (not guaranteed)
      // The native print dialog determines filename; this is just a fallback for browsers that honor it.
      try {
        const a = printWindow.document.createElement('a');
        a.setAttribute('download', fileName);
        // append and remove so that some browsers pick it up (non-blocking)
        printWindow.document.body.appendChild(a);
        printWindow.document.body.removeChild(a);
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error('Error generating Disposal PDF (canonical):', err);
      alert(
        'An error occurred while generating the Disposal PDF. See console for details.',
      );
    }
  };

  console.log('disposal list', disposalList);
  const groupedDisposals = React.useMemo(() => {
    return disposalList
      .map((item, index) => ({...item, originalIndex: index}))
      .filter((item) => item.taken > 0)
      .reduce(
        (acc, item) => {
          const cat = item.category || 'Uncategorized';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(item);
          return acc;
        },
        {} as Record<
          string,
          ((typeof disposalList)[0] & {originalIndex: number})[]
        >,
      );
  }, [disposalList]);

  // 3. Auto-select the first category by default
  useEffect(() => {
    const categories = Object.keys(groupedDisposals);
    if (categories.length > 0) {
      if (!openCategory || !groupedDisposals[openCategory]) {
        setOpenCategory(categories[0]);
      }
    }
  }, [groupedDisposals, openCategory]);

  return (
    <div className="bg-transparent">
      {' '}
      <div className="rounded-lg dark:border-strokedark dark:bg-boxdark">
        <div className="mb-4 rounded-t-lg bg-blue-900 px-4 py-4 text-white sm:px-6 sm:py-5">
          {/* Mobile: Compact, Desktop: Normal */}
          <div className="flex items-center justify-between sm:flex-row sm:items-center sm:justify-between">
            {/* Title */}
            <h2 className="text-lg font-bold text-white sm:text-xl lg:text-2xl">
              Disposal
            </h2>

            {/* Controls - Hidden on mobile until expanded */}
            <div className="flex items-center gap-2">
              {/* Mobile: Show only toggle button */}
              <div className="sm:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2"
                  aria-label={isOpen ? 'Collapse' : 'Expand'}
                >
                  {isOpen ? (
                    <BiChevronUp size={24} />
                  ) : (
                    <BiChevronDown size={24} />
                  )}
                </button>
              </div>

              {/* Desktop: Show all controls */}
              <div className="hidden items-center gap-3 sm:flex">
                <select
                  value={reportType}
                  onChange={(e) =>
                    setReportType(e.target.value as 'regular' | 'missing')
                  }
                  className="border-gray-300 dark:bg-gray-800 rounded-md border px-3 py-1 text-sm text-neutral-700 dark:bg-meta-4 dark:text-white"
                >
                  <option value="regular">Regular Report</option>
                  <option value="missing">Missing Report</option>
                </select>

                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
                >
                  Download PDF
                </button>

                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2"
                  aria-label={isOpen ? 'Collapse' : 'Expand'}
                >
                  {isOpen ? (
                    <BiChevronUp size={24} />
                  ) : (
                    <BiChevronDown size={24} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile: Expanded controls (shown when isOpen is true) */}
          {isOpen && (
            <div className="mt-4 flex flex-col gap-3 sm:hidden">
              <select
                value={reportType}
                onChange={(e) =>
                  setReportType(e.target.value as 'regular' | 'missing')
                }
                className="border-gray-300 dark:bg-gray-800 w-full rounded-md border px-3 py-1 text-sm text-neutral-700 dark:bg-meta-4 dark:text-white"
              >
                <option value="regular">Regular Report</option>
                <option value="missing">Missing Report</option>
              </select>

              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
              >
                Download PDF
              </button>
            </div>
          )}
        </div>

        {/* {isOpen && (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div ref={tableRef} className="max-w-full overflow-x-auto">
                <table className="text-gray-500 dark:text-gray-400 w-full text-left text-sm">
                  <thead className="text-gray-700 dark:bg-gray-700 dark:text-gray-400 text-bold text-xs uppercase dark:bg-black">
                    <tr className="bg-blue-100 text-left dark:bg-meta-4">
                      {['Category', 'Disposal', 'Outward', 'Inward'].map(
                        (column, index) => (
                          <th
                            key={index}
                            className="min-w-[120px] px-4 py-6 font-medium text-black dark:text-white"
                          >
                            {column}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {disposalList.map((disposal, index) => (
                      <tr
                        key={index}
                        className="dark:bg-gray-800 dark:border-gray-700 border-b bg-transparent"
                      >
                        <td className="px-6 py-4">{disposal.category}</td>
                        <td className="px-6 py-4">{disposal.name}</td>
                        <td className="px-6 py-4">{disposal.taken}</td>
                        <td className="w-40 px-6 py-4">
                          <GenericInputField
                            name={`disposals.${index}.returned`}
                            type="number"
                            defaultValue={disposal.updateReturned}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-end">
                <GenericButton
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <FiSave /> {isPending ? 'Saving...' : 'Save'}
                </GenericButton>
              </div>
            </form>
          </FormProvider>
        )} */}

        {isOpen && (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div ref={tableRef} className="space-y-4">
                {/* --- TABS SECTION --- */}
                <div className="overflow-x-auto">
                  <div className="bg-gray-50 flex items-center border-b border-stroke dark:border-strokedark dark:bg-boxdark-2">
                    <div className="scrollbar-hide flex-1 overflow-x-auto">
                      <div className="flex min-w-max gap-1">
                        {Object.keys(groupedDisposals).map((category) => {
                          const isActive = openCategory === category;
                          return (
                            <div
                              key={category}
                              onClick={() => setOpenCategory(category)}
                              className={`cursor-pointer select-none whitespace-nowrap border-b-2 px-6 py-3 text-sm font-medium transition-all duration-300 ease-in-out hover:bg-purple-50 dark:hover:bg-purple-800/50 ${
                                isActive
                                  ? 'border-purple-600 bg-purple-100 text-purple-600 shadow-sm dark:border-purple-500 dark:bg-purple-900/30 dark:text-purple-400'
                                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:border-purple-300'
                              }`}
                            >
                              {category}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- TABLE SECTION --- */}
                {openCategory && groupedDisposals[openCategory] && (
                  <div className="rounded-lg border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke p-3 dark:border-strokedark">
                      <h3 className="text-gray-800 text-lg font-semibold dark:text-white">
                        {openCategory}
                      </h3>
                    </div>

                    <div className="overflow-x-auto p-2">
                      <table className="w-full table-fixed border-collapse text-sm">
                        <thead className="text-gray-600 dark:text-gray-300 bg-blue-100 text-xs font-semibold uppercase dark:bg-meta-4">
                          <tr>
                            <th className="w-2/5 px-4 py-2 text-left">
                              Disposal
                            </th>
                            <th className="w-1/5 px-4 py-2 text-center">
                              Outward
                            </th>
                            <th className="w-2/5 px-4 py-2 text-left">
                              Inward
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-gray-200 dark:divide-gray-700 divide-y">
                          {groupedDisposals[openCategory].map((item) => (
                            <tr
                              key={`${item.category}-${item.id}`}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <td className="text-gray-900 px-4 py-1 align-middle font-medium dark:text-white">
                                {item.name || 'Unknown'}
                              </td>

                              <td className="text-gray-800 px-4 py-1 text-center align-middle dark:text-white">
                                {item.taken || 0}
                              </td>

                              <td className="px-4 py-1 align-middle">
                                <div className="max-w-[150px]">
                                  <GenericInputField
                                    name={`disposals.${item.originalIndex}.returned`}
                                    type="number"
                                    defaultValue={item.updateReturned}
                                    placeholder="0"
                                    className="w-full"
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* --- SUBMIT BUTTON --- */}
              {(role === 'CATEROR' || restriction === 'EDIT') && (
                <div className="mt-6 flex justify-end">
                  <GenericButton
                    type="submit"
                    disabled={isPending}
                    className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending ? 'Saving...' : 'Save'}
                  </GenericButton>
                </div>
              )}
            </form>
          </FormProvider>
        )}
      </div>
    </div>
  );
};

export default EventDisposals;
