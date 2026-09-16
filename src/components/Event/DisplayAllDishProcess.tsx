/* eslint-disable  */
import React, {useEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom/client';
import {BiChevronDown} from 'react-icons/bi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  useGetSubevent,
  useGetAllDishProcess,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {Route} from '@/routes/_app/_event/events.$id';
import {Loader} from '../Loader/Loader';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import {useGetProcesses} from '@/lib/react-query/queriesAndMutations/cateror/process';
import {api} from '@/utils/axios';
import toast from 'react-hot-toast';
import {useAuthContext} from '@/context/AuthContext';
import {Route as ProcessCatRoute} from '@/routes/_app/_event/proesscat';
import {useNavigate} from '@tanstack/react-router';
import AddDishProcessPopup from '../Popup/AddDishProcessPopup';
import {
  FiChevronDown,
  FiDownload,
  FiFileText,
  FiList,
  FiPackage,
} from 'react-icons/fi';

interface SubEvent {
  id: string;
  name: string;
  address: string;
  date: string;
  dishes: {
    rawMaterials: any;
    id: string;
    name: string;
    processes: {
      processId: string;
      process: {
        id: string;
        name: string;
      };
      rawMaterials: {
        id: string;
        name: string;
        unit: string;
      };
    }[];
  }[];
}

interface SubEventResponse {
  data: {
    subEvents: SubEvent[];
    name?: string;
    processOptionsResponse: any[];
  };
}

const DisplayAllDishProcess: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const {user} = useAuthContext();
  console.log('asdfasdf', user);
  const restriction = user?.employeeRestriction?.dishProcess;
  const [isAddProcessOpen, setIsAddProcessOpen] = useState<boolean>(false); // <-- popup state

  const role = user?.role;
  const tableRef = useRef<HTMLDivElement>(null);
  const {id: EventId} = Route.useParams<{id: string}>();
  const {data: getAllProcess, isLoading} = useGetAllDishProcess(EventId);
  console.log('getAllProcess', getAllProcess);
  const {data: processOptionsResponse} = useGetProcesses();
  const [selectedSubEvent, setSelectedSubEvent] = useState<string | null>(null);
  const [selectedSubEventName, setSelectedSubEventName] = useState<
    string | null
  >(null);
  const [isPDFLoading, setIsPDFLoading] = useState<boolean>(false);
  console.log('selectedSubEvent', selectedSubEvent);
  const [expandedDishes, setExpandedDishes] = useState<string[]>([]);
  const {data: subEventResponse} = useGetSubevent(EventId) as {
    data?: SubEventResponse;
  };
  console.log('subEventResponse', subEventResponse);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const {control, handleSubmit, setValue, getValues} = useForm({
    defaultValues: {},
  });
  const methods = useForm();
  const navigate = useNavigate();

  const mappedProcessOptions = useMemo(() => {
    if (!processOptionsResponse?.data?.processes) return [];
    return processOptionsResponse.data.processes.map((proc: any) => ({
      label: proc.name,
      value: proc.id,
    }));
  }, [processOptionsResponse]);

  const normalizeSubEvents = (subEvents: any[]): SubEvent[] => {
    return (subEvents || []).map((subEvent) => ({
      ...subEvent,
      dishes: (subEvent.dishes || []).map((dish: any) => ({
        ...dish,
        processes: (dish.processes || []).map((proc: any) => ({
          processId: proc.id,
          process: {
            id: proc.id,
            name: proc.name,
          },
          rawMaterials: {
            id: proc.rawMaterial?.id || '',
            name: proc.rawMaterial?.name || '',
            unit: 'N/A', // default or fallback\
            quantity: proc.rawMaterial?.quantity || '',
          },
        })),
      })),
    }));
  };

  const rawSubEvents = getAllProcess?.data?.subEvents || [];
  console.log('rawSubEvents', rawSubEvents);
  const subEvents: SubEvent[] = normalizeSubEvents(rawSubEvents);
  console.log('subEvents', subEvents);
  const [openSubEventId, setOpenSubEventId] = useState<string | null>(null);

  useEffect(() => {
    if (subEvents.length > 0 && !selectedSubEvent) {
      const firstSubEvent = subEvents[0];
      setSelectedSubEvent(firstSubEvent.id);
      setSelectedSubEventName(firstSubEvent.name);

      const dishIds = firstSubEvent.dishes.map((dish) => dish.id);
      setExpandedDishes(dishIds);
    }
  }, [subEvents, selectedSubEvent]);

  // const handleDownloadAllPDF = async () => {
  //   setIsPDFLoading(true);

  //   const formData = getValues();

  //   /* ============================================================
  //    SAVE BEFORE DOWNLOAD (Same as 1st code)
  //    ============================================================ */
  //   try {
  //     await onSubmit(formData);
  //     toast.success('Processes saved successfully!');
  //   } catch (err) {
  //     toast.error('Failed to save processes before download');
  //     setIsPDFLoading(false);
  //     return;
  //   }

  //   await new Promise(requestAnimationFrame);
  //   await new Promise((res) => setTimeout(res, 300));

  //   if (!subEvents?.length) {
  //     toast.error('No data to generate PDF');
  //     setIsPDFLoading(false);
  //     return;
  //   }

  //   /* ============================================================
  //    MASTER CONTAINER — styled like 2nd code
  //    ============================================================ */
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

  //   /* ============================================================
  //    HEADER — EXACT UI of 2nd code
  //    ============================================================ */
  //   const headerWrapper = document.createElement('div');
  //   Object.assign(headerWrapper.style, {
  //     padding: '6px',
  //     border: '1px solid #0D47A1',
  //     textAlign: 'center',
  //     color: 'black',
  //   });

  //   headerWrapper.innerHTML = `
  //   <h1 style="margin:0; font-weight:800; font-size:28px; color:black;">
  //     ${user?.fullname || 'Caterer Name'}
  //   </h1>
  //   <div style="background:#0D47A1; height:2px; margin:4px auto; width:80%;"></div>
  //   <p style="margin:0; font-size:14px; font-weight:bold; color:black;">
  //     ${user?.address || ''}<br/>
  //     ${user?.email ? `इमेल - ${user.email}<br/>` : ''}मो. ${user?.phoneNumber || ''}
  //   </p>
  // `;
  //   reportContainer.appendChild(headerWrapper);

  //   /* ============================================================
  //    TITLE — EXACT UI of 2nd code
  //    ============================================================ */
  //   const event = subEventResponse?.data;
  //   const titleWrapper = document.createElement('div');
  //   titleWrapper.style.marginTop = '5px';
  //   titleWrapper.style.textAlign = 'center';

  //   titleWrapper.innerHTML = `
  //   <h2 style="font-size:18px; font-weight:bold; margin:0; color:black;">Cutting List Report</h2>
  //   <div style="margin-bottom:4px; color:black;">
  //     <span style="margin:0 8px; color:black;"><strong>Event:</strong> ${event?.name || 'N/A'}</span>
  //     <span style="margin:0 8px; color:black;"><strong>Start Date:</strong>
  //       ${new Date(event?.startDate).toLocaleDateString('en-GB', {
  //         day: '2-digit',
  //         month: 'short',
  //         year: 'numeric',
  //       })}
  //     </span>
  //     <span style="margin:0 8px; color:black;"><strong>End Date:</strong>
  //       ${new Date(event?.endDate).toLocaleDateString('en-GB', {
  //         day: '2-digit',
  //         month: 'short',
  //         year: 'numeric',
  //       })}
  //     </span>
  //   </div>
  // `;
  //   reportContainer.appendChild(titleWrapper);

  //   /* ============================================================
  //    LOOP THROUGH SUB-EVENTS + DISHES — UI from 2nd, Logic from 1st
  //    ============================================================ */
  //   subEvents.forEach((subEvent) => {
  //     /* ---------- Sub Event Box (UI of 2nd code) ---------- */
  //     const subHeader = document.createElement('div');
  //     subHeader.style.marginTop = '15px';
  //     subHeader.style.textAlign = 'center';

  //     subHeader.innerHTML = `
  //     <div style="margin-bottom:4px; color:black; border:1px solid #000; padding-bottom:15px;">
  //       <span style="margin:0 8px; font-size:12px;"><strong>Sub Event:</strong> ${subEvent.name}</span>
  //       <span style="margin:0 8px; font-size:12px;"><strong>Address:</strong> ${subEvent.address}</span>
  //       <span style="margin:0 8px; font-size:12px;">
  //         <strong>Date:</strong> ${new Date(subEvent.date).toLocaleDateString(
  //           'en-GB',
  //           {
  //             day: '2-digit',
  //             month: 'short',
  //             year: 'numeric',
  //           },
  //         )}
  //       </span>
  //       <span style="margin:0 8px; font-size:12px;">
  //         <strong>Time:</strong> ${new Date(subEvent.time).toLocaleTimeString(
  //           'en-US',
  //           {
  //             hour: '2-digit',
  //             minute: '2-digit',
  //             hour12: true,
  //           },
  //         )}
  //       </span>
  //       <span style="margin:0 8px; font-size:12px;">
  //         <strong>People:</strong> ${subEvent.actualPeople || subEvent.expectedPeople || 'N/A'}
  //       </span>
  //     </div>`;
  //     reportContainer.appendChild(subHeader);

  //     /* ---------- DISHES ---------- */
  //     subEvent.dishes?.forEach((dish) => {
  //       const dishContainer = document.createElement('div');
  //       dishContainer.style.marginBottom = '14px';

  //       const dishTitle = document.createElement('h4');
  //       Object.assign(dishTitle.style, {
  //         fontSize: '14px',
  //         margin: '0 0 8px 0',
  //         color: '#374151',
  //         fontWeight: 'bold',
  //         textAlign: 'left',
  //       });
  //       dishTitle.textContent = `Dish: ${dish.name}`;
  //       dishContainer.appendChild(dishTitle);

  //       /* ---------- TABLE (UI of 2nd + process logic of 1st) ---------- */
  //       const table = document.createElement('table');
  //       Object.assign(table.style, {
  //         width: '100%',
  //         borderCollapse: 'collapse',
  //         fontSize: '11px',
  //         background: 'white',
  //         verticalAlign: 'middle',
  //       });

  //       /* HEADER */
  //       const headerRow = table.insertRow();
  //       ['Raw Material', 'Quantity', 'Unit', 'Process'].forEach((t) => {
  //         const th = document.createElement('th');
  //         Object.assign(th.style, {
  //           border: '1px solid #ccc',
  //           padding: '12px',
  //           backgroundColor: '#1E3A8A',
  //           color: 'white',
  //           textAlign: 'center',
  //           fontWeight: 'bold',
  //           verticalAlign: 'middle',
  //           font: 'bold 12px Arial, sans-serif',
  //         });
  //         th.innerText = t;
  //         headerRow.appendChild(th);
  //       });

  //       const materials = Array.isArray(dish.rawMaterials)
  //         ? dish.rawMaterials
  //         : [];

  //       /* BODY */
  //       if (materials.length === 0) {
  //         const row = table.insertRow();
  //         ['No raw materials', '-', '-', '-'].forEach((text, idx) => {
  //           const cell = row.insertCell();
  //           cell.innerText = text;
  //           Object.assign(cell.style, {
  //             border: '1px solid #ddd',
  //             padding: '10px',
  //             textAlign: idx === 0 ? 'left' : 'center',
  //             font: 'bold 12px Arial',
  //             color: 'black',
  //           });
  //         });
  //       } else {
  //         materials.forEach((rm, index) => {
  //           const row = table.insertRow();
  //           row.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f8f8f8';

  //           /* --- PROCESS SELECTION LOGIC (from 1st code) --- */
  //           const selectedProcessId = formData[`process_${dish.id}_${rm.id}`];
  //           const selectedProcess = mappedProcessOptions.find(
  //             (p) => p.value === selectedProcessId,
  //           );
  //           const processName =
  //             selectedProcess?.label ||
  //             rm?.process?.name ||
  //             rm?.process ||
  //             'N/A';

  //           const values = [
  //             rm.name || '-',
  //             rm.quantity
  //               ? Number(rm.quantity).toFixed(rm.quantity % 1 === 0 ? 0 : 1)
  //               : '-',
  //             rm.unit || '-',
  //             processName,
  //           ];

  //           values.forEach((val, i) => {
  //             const cell = row.insertCell();
  //             Object.assign(cell.style, {
  //               border: '1px solid #ddd',
  //               paddingBottom: '10px',
  //               textAlign: i === 0 ? 'left' : 'center',
  //               font: 'bold 12px Arial',
  //               color: 'black',
  //               whiteSpace: i === 3 ? 'normal' : '',
  //               wordBreak: i === 3 ? 'break-word' : '',
  //             });
  //             cell.innerText = String(val);
  //           });
  //         });
  //       }

  //       dishContainer.appendChild(table);
  //       reportContainer.appendChild(dishContainer);
  //     });
  //   });

  //   /* ============================================================
  //    PDF GENERATION — using improved paging of 2nd code
  //    ============================================================ */
  //   document.body.appendChild(reportContainer);

  //   try {
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
  //     const unitHeight = (canvas.height * imgWidth) / canvas.width;

  //     let heightLeft = unitHeight;
  //     let pageNumber = 1;

  //     while (heightLeft > 0) {
  //       if (pageNumber > 1) pdf.addPage();

  //       const usableHeight =
  //         pageHeight - bottomMargin - (pageNumber === 1 ? 0 : topMargin);

  //       const pageCanvas = document.createElement('canvas');
  //       pageCanvas.width = canvas.width;
  //       pageCanvas.height = Math.floor(
  //         (usableHeight * canvas.width) / imgWidth,
  //       );

  //       const ctx = pageCanvas.getContext('2d');
  //       ctx.fillStyle = '#ffffff';
  //       ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

  //       ctx.drawImage(
  //         canvas,
  //         0,
  //         (unitHeight - heightLeft) * (canvas.width / imgWidth),
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

  //     pdf.save(
  //       `Cutting_List_All_${new Date().toISOString().split('T')[0]}.pdf`,
  //     );
  //     toast.success('PDF downloaded successfully!');
  //   } catch (err) {
  //     console.error(err);
  //     toast.error('PDF generation failed');
  //   } finally {
  //     document.body.removeChild(reportContainer);
  //     setIsPDFLoading(false);
  //   }
  // };

  const toggleDish = (dishId: string) => {
    setExpandedDishes(
      (prev) =>
        prev.includes(dishId)
          ? prev.filter((id) => id !== dishId) // collapse
          : [...prev, dishId], // expand
    );
  };

  const onSubmit = (formData: Record<string, any>) => {
    // formData will look like:
    // {
    //   process_dishId_rawMaterialId: "processId",
    //   process_dishId_rawMaterialId: "processId",
    //   ...
    // }

    const payload: {
      dishId: string;
      processId: string;
      rawMaterialId: string;
    }[] = [];

    subEvents.forEach((subEvent) => {
      subEvent.dishes.forEach((dish) => {
        dish.rawMaterials.forEach((rm) => {
          const key = `process_${dish.id}_${rm.id}`;
          const processId = formData[key];

          if (processId) {
            payload.push({
              dishId: dish.id,
              processId,
              rawMaterialId: rm.id,
            });
          }
        });
      });
    });

    if (payload.length === 0) {
      console.log('⚠️ Nothing to save');
      return;
    }

    api
      .put('/cateror/dishes/process/bulk', payload)
      .then((res) => {
        console.log('✅ Saved successfully:', res);
        if (res.statusCode === 201) {
          toast.success('Processes saved successfully');
        }
      })
      .catch((err) => {
        console.error('❌ Error saving processes:', err);
        toast.error('Failed to save processes');
      });
  };

  if (isLoading) {
    return (
      <div className="mt-10 flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  // const formatDate = (dateStr: string) =>
  //   dateStr
  //     ? new Date(dateStr).toLocaleDateString('en-GB', {
  //         day: '2-digit',
  //         month: 'short',
  //         year: 'numeric',
  //       })
  //     : 'N/A';

  // const formatTime = (timeStr: string) =>
  //   timeStr
  //     ? new Date(`1970-01-01T${timeStr}`).toLocaleTimeString('en-US', {
  //         hour: '2-digit',
  //         minute: '2-digit',
  //         hour12: true,
  //       })
  //     : 'N/A';

  const handleDownloadFilteredCuttingList = async () => {
    if (!subEvents?.length) return;

    setIsPDFLoading(true);
    const formData = getValues();

    // ===== Save before generating PDF =====
    try {
      await onSubmit(formData);
      toast.success('Processes saved successfully!');
    } catch (err) {
      toast.error('Failed to save processes before download');
      setIsPDFLoading(false);
      return;
    }

    await new Promise(requestAnimationFrame);
    await new Promise((res) => setTimeout(res, 300));

    // ===== Filter raw materials that have process =====
    const allRawMaterials = [];
    subEvents.forEach((subEvent) => {
      subEvent.dishes?.forEach((dish) => {
        dish.rawMaterials?.forEach((rm) => {
          const selectedProcessId = formData[`process_${dish.id}_${rm.id}`];
          const selectedProcess = mappedProcessOptions.find(
            (p) => p.value === selectedProcessId,
          );
          const processName =
            selectedProcess?.label || rm?.process?.name || rm?.process || null;

          if (processName && processName !== 'N/A') {
            allRawMaterials.push({
              name: rm.name,
              quantity: rm.quantity,
              unit: rm.unit,
              process: processName,
            });
          }
        });
      });
    });

    if (!allRawMaterials.length) {
      toast.error('No valid raw materials with a process found');
      setIsPDFLoading(false);
      return;
    }

    // ===== BUILD HTML (same style as PERFECT PDF) =====
    let htmlContent = `
    <!-- FIRST PAGE HEADER -->
    <div style="text-align:center; border:1px solid #0D47A1; padding:8px; margin-bottom:12px; background:#E3F2FD;">
      <h1 style="margin:0; font-size:24px; color:#0D47A1; font-weight:800;">
        ${user?.fullname || 'Name'}
      </h1>
      <p style="margin:6px 0 0; font-weight:bold; font-size:11px;">
        ${user?.address ? `Address - ${user.address}` : ''}${
          user?.email ? ` | Email - ${user.email}` : ''
        } | Mob. ${user?.phoneNumber || ''}
      </p>
    </div>

    <!-- TITLE BAR -->
    <div style="text-align:center; background:#0D47A1; color:white; padding:10px 6px; margin-bottom:12px; font-weight:bold;">
      <h2 style="margin:0; font-size:16px;">Filtered Cutting List</h2>
      <div style="font-size:11px; margin-top:4px; opacity:0.9;">
        Event: ${subEventResponse?.data?.name}
        | Start Date: ${
          subEventResponse?.data?.startDate
            ? new Date(subEventResponse.data.startDate).toLocaleDateString(
                'en-GB',
              )
            : 'N/A'
        }
        | End Date: ${
          subEventResponse?.data?.endDate
            ? new Date(subEventResponse.data.endDate).toLocaleDateString(
                'en-GB',
              )
            : 'N/A'
        }
      </div>
    </div>

    <!-- TABLE -->
    <table style="width:100%; border-collapse: collapse; font-family:Arial; font-size:11px; margin-top:12px;">
      <thead>
        <tr style="background:#1E3A8A; color:white; font-weight:bold;">
          <th style="padding:6px 4px; border:1px solid #ccc;">Raw Material</th>
          <th style="padding:6px 4px; border:1px solid #ccc;">Quantity</th>
          <th style="padding:6px 4px; border:1px solid #ccc;">Unit</th>
          <th style="padding:6px 4px; border:1px solid #ccc;">Process</th>
        </tr>
      </thead>
      <tbody>
  `;

    allRawMaterials.forEach((rm, idx) => {
      htmlContent += `
      <tr style="background:${idx % 2 === 0 ? '#fff' : '#f8f9fc'};">
        <td style="padding:5px 4px; border:1px solid #ddd;">${rm.name}</td>
        <td style="padding:5px 4px; border:1px solid #ddd; text-align:center; font-weight:bold;">
          ${
            rm.quantity != null
              ? Number(rm.quantity).toFixed(rm.quantity % 1 === 0 ? 0 : 1)
              : '-'
          }
        </td>
        <td style="padding:5px 4px; border:1px solid #ddd; text-align:center; font-weight:bold;">
          ${rm.unit || '-'}
        </td>
        <td style="padding:5px 4px; border:1px solid #ddd; text-align:center; font-weight:bold;">
          ${rm.process}
        </td>
      </tr>
    `;
    });

    htmlContent += `
      </tbody>
    </table>
  `;

    // ===== OPEN PRINT WINDOW =====
    const printWindow = window.open(
      '',
      'printWindow',
      'width=1000,height=800,scrollbars=yes',
    );

    if (!printWindow) {
      alert('Please allow popups');
      setIsPDFLoading(false);
      return;
    }

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Filtered Cutting List</title>
        <style>
          body { margin:0; font-family:Arial, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body.first-page { padding-top:0 !important; }
          .repeat-title {
            position: fixed; top:0; left:0; right:0;
            text-align:center;
            background:#0D47A1; color:white;
            padding:6px 0; font-size:14px; font-weight:bold;
          }
          body.first-page .repeat-title { display:none !important; }
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; break-inside: avoid; }
        </style>
      </head>
      <body class="first-page">
        ${htmlContent}
        <script>
          setTimeout(() => {
            document.body.classList.remove("first-page");
            window.print();
            setTimeout(() => window.close(), 600);
          }, 400);
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();
    setIsPDFLoading(false);
  };

  const handleDownloadGroupedCuttingList = async () => {
    if (!subEvents?.length) return;
    setIsPDFLoading(true);

    const formData = getValues();

    try {
      await onSubmit(formData);
      toast.success('Processes saved successfully!');
    } catch (err) {
      toast.error('Failed to save processes before download');
      setIsPDFLoading(false);
      return;
    }

    await new Promise(requestAnimationFrame);
    await new Promise((res) => setTimeout(res, 300));

    // ===== Collect filtered raw materials =====
    const allRawMaterials = [];
    subEvents.forEach((subEvent) => {
      subEvent.dishes?.forEach((dish) => {
        dish.rawMaterials?.forEach((rm) => {
          const selectedProcessId = formData[`process_${dish.id}_${rm.id}`];
          const selectedProcess = mappedProcessOptions.find(
            (p) => p.value === selectedProcessId,
          );
          const processName =
            selectedProcess?.label || rm?.process?.name || rm?.process || 'N/A';

          allRawMaterials.push({
            name: rm.name,
            quantity: Number(rm.quantity) || 0,
            unit: rm.unit || '',
            process: processName,
          });
        });
      });
    });

    if (!allRawMaterials.length) {
      toast.error('No raw materials found');
      setIsPDFLoading(false);
      return;
    }

    // ===== Group by Raw Material & Process =====
    const groupedByRawMaterial: Record<
      string,
      {processes: Record<string, {totalQuantity: number; unit: string}>}
    > = {};
    allRawMaterials.forEach((rm) => {
      if (!groupedByRawMaterial[rm.name])
        groupedByRawMaterial[rm.name] = {processes: {}};
      if (!groupedByRawMaterial[rm.name].processes[rm.process])
        groupedByRawMaterial[rm.name].processes[rm.process] = {
          unit: rm.unit,
          totalQuantity: 0,
        };
      groupedByRawMaterial[rm.name].processes[rm.process].totalQuantity +=
        rm.quantity;
    });

    // ===== Build HTML content =====
    let htmlContent = `
    <!-- FIRST PAGE HEADER -->
    <div style="text-align:center; border:1px solid #0D47A1; padding:8px; margin-bottom:12px; background:#E3F2FD;">
      <h1 style="margin:0; font-size:24px; color:#0D47A1; font-weight:800;">${user?.fullname || 'Name'}</h1>
      <p style="margin:6px 0 0; font-weight:bold; font-size:11px;">
        ${user?.address ? `Address - ${user.address}` : ''}${
          user?.email ? ` | Email - ${user.email}` : ''
        } | Mob. ${user?.phoneNumber || ''}
      </p>
    </div>
      <div style="text-align:center; background:#0D47A1; color:white; padding:10px 6px; margin-bottom:12px; font-weight:bold;">
    <h2 style="margin:0; font-size:16px;">Grouped Cutting List</h2>
    <div style="font-size:11px; margin-top:4px; opacity:0.9;">
    Event: ${subEventResponse?.data?.name}
      Start Date: ${
        subEventResponse?.data?.startDate
          ? new Date(subEventResponse.data.startDate).toLocaleDateString(
              'en-GB',
            )
          : 'N/A'
      } |
      End Date: ${
        subEventResponse?.data?.endDate
          ? new Date(subEventResponse.data.endDate).toLocaleDateString('en-GB')
          : 'N/A'
      }
    </div>
  </div>



    <!-- TABLE -->
    <table style="width:100%; border-collapse: collapse; font-family:Arial; font-size:11px; margin-top:12px;">
      <thead>
        <tr style="background:#1E3A8A; color:white; font-weight:bold;">
          <th style="padding:6px 4px; border:1px solid #ccc;">Raw Material</th>
          <th style="padding:6px 4px; border:1px solid #ccc;">Quantity</th>
          <th style="padding:6px 4px; border:1px solid #ccc;">Unit</th>
          <th style="padding:6px 4px; border:1px solid #ccc;">Process</th>
        </tr>
      </thead>
      <tbody>
  `;

    const sortedRawMaterials = Object.keys(groupedByRawMaterial).sort();
    sortedRawMaterials.forEach((rawName, rawIndex) => {
      const processes = groupedByRawMaterial[rawName].processes;
      const processNames = Object.keys(processes).sort();

      processNames.forEach((processName, processIndex) => {
        const processData = processes[processName];
        htmlContent += `
        <tr style="background:${(rawIndex + processIndex) % 2 === 0 ? '#fff' : '#f8f9fc'};">
          <td style="padding:5px 4px; border:1px solid #ddd; font-weight:${processIndex === 0 ? '600' : 'normal'};">
            ${processIndex === 0 ? rawName : ''}
          </td>
          <td style="padding:5px 4px; border:1px solid #ddd; text-align:center; font-weight:bold;">
            ${processData.totalQuantity.toFixed(processData.totalQuantity % 1 === 0 ? 0 : 1)}
          </td>
          <td style="padding:5px 4px; border:1px solid #ddd; text-align:center; font-weight:bold;">
            ${processData.unit}
          </td>
          <td style="padding:5px 4px; border:1px solid #ddd; text-align:center; font-weight:bold;">
            ${processName}
          </td>
        </tr>
      `;
      });
    });

    htmlContent += `</tbody></table>`;

    // ===== Open print window =====
    const printWindow = window.open(
      '',
      'printWindow',
      'width=1000,height=800,scrollbars=yes',
    );
    if (!printWindow) {
      alert('Please allow popups');
      setIsPDFLoading(false);
      return;
    }

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Grouped Cutting List</title>
        <style>
          body { margin:0; font-family:Arial, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body.first-page { padding-top:0 !important; }
          .repeat-title { position: fixed; top:0; left:0; right:0; text-align:center; background:#0D47A1; color:white; padding:6px 0; font-size:14px; font-weight:bold; }
          body.first-page .repeat-title { display:none !important; }
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; break-inside: avoid; }
        </style>
      </head>
      <body class="first-page">
        ${htmlContent}
        <script>
          setTimeout(() => { document.body.classList.remove("first-page"); window.print(); setTimeout(()=>window.close(),600); }, 400);
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();
    setIsPDFLoading(false);
  };

  // const handlePreviewAllPDF = async () => {
  //   setIsPDFLoading(true);

  //   const formData = getValues();

  //   try {
  //     await onSubmit(formData);
  //     toast.success('Processes saved successfully!');
  //   } catch (err) {
  //     toast.error('Failed to save processes before preview');
  //     setIsPDFLoading(false);
  //     return;
  //   }

  //   await new Promise(requestAnimationFrame);
  //   await new Promise((res) => setTimeout(res, 300));

  //   if (!subEvents?.length) {
  //     toast.error('No data to generate PDF');
  //     setIsPDFLoading(false);
  //     return;
  //   }

  //   // === Build the report container exactly like your raw code ===
  //   const reportContainer = document.createElement('div');
  //   Object.assign(reportContainer.style, {
  //     width: '800px',
  //     padding: '20px',
  //     background: 'white',
  //     fontFamily: 'Arial, sans-serif',
  //     fontSize: '12px',
  //     color: 'black',
  //     margin: '0 auto',
  //   });

  //   // === HEADER ===
  //   const headerWrapper = document.createElement('div');
  //   Object.assign(headerWrapper.style, {
  //     padding: '6px',
  //     border: '1px solid #0D47A1',
  //     textAlign: 'center',
  //     color: 'black',
  //   });

  //   headerWrapper.innerHTML = `
  //   <h1 style="margin:0; font-weight:800; font-size:28px; color:black;">
  //     ${user?.fullname || 'Caterer Name'}
  //   </h1>
  //   <div style="background:#0D47A1; height:2px; margin:4px auto; width:80%;"></div>
  //   <p style="margin:0; font-size:14px; font-weight:bold; color:black;">
  //     ${user?.address || ''}<br/>
  //     ${user?.email ? `इमेल - ${user.email}<br/>` : ''}मो. ${user?.phoneNumber || ''}
  //   </p>
  // `;
  //   reportContainer.appendChild(headerWrapper);

  //   // === TITLE ===
  //   const event = subEventResponse?.data;
  //   const titleWrapper = document.createElement('div');
  //   titleWrapper.style.marginTop = '5px';
  //   titleWrapper.style.textAlign = 'center';
  //   titleWrapper.innerHTML = `
  //   <h2 style="font-size:18px; font-weight:bold; margin:0; color:black;">Cutting List Report</h2>
  //   <div style="margin-bottom:4px; color:black;">
  //     <span style="margin:0 8px; color:black;"><strong>Event:</strong> ${event?.name || 'N/A'}</span>
  //     <span style="margin:0 8px; color:black;"><strong>Start Date:</strong>
  //       ${new Date(event?.startDate).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}
  //     </span>
  //     <span style="margin:0 8px; color:black;"><strong>End Date:</strong>
  //       ${new Date(event?.endDate).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}
  //     </span>
  //   </div>
  // `;
  //   reportContainer.appendChild(titleWrapper);

  //   // === SUB EVENTS + DISHES ===
  //   subEvents.forEach((subEvent) => {
  //     const subHeader = document.createElement('div');
  //     subHeader.style.marginTop = '15px';
  //     subHeader.style.textAlign = 'center';

  //     subHeader.innerHTML = `
  //     <div style="margin-bottom:4px; color:black; border:1px solid #000; padding-bottom:15px;">
  //       <span style="margin:0 8px; font-size:12px;"><strong>Sub Event:</strong> ${subEvent.name}</span>
  //       <span style="margin:0 8px; font-size:12px;"><strong>Address:</strong> ${subEvent.address}</span>
  //       <span style="margin:0 8px; font-size:12px;">
  //         <strong>Date:</strong> ${new Date(subEvent.date).toLocaleDateString('en-GB')}
  //       </span>
  //       <span style="margin:0 8px; font-size:12px;">
  //         <strong>Time:</strong> ${new Date(subEvent.time).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: true})}
  //       </span>
  //       <span style="margin:0 8px; font-size:12px;">
  //         <strong>People:</strong> ${subEvent.actualPeople || subEvent.expectedPeople || 'N/A'}
  //       </span>
  //     </div>`;
  //     reportContainer.appendChild(subHeader);

  //     subEvent.dishes?.forEach((dish) => {
  //       const dishContainer = document.createElement('div');
  //       dishContainer.style.marginBottom = '14px';

  //       const dishTitle = document.createElement('h4');
  //       Object.assign(dishTitle.style, {
  //         fontSize: '14px',
  //         margin: '0 0 8px 0',
  //         color: '#374151',
  //         fontWeight: 'bold',
  //         textAlign: 'left',
  //       });
  //       dishTitle.textContent = `Dish: ${dish.name}`;
  //       dishContainer.appendChild(dishTitle);

  //       const table = document.createElement('table');
  //       Object.assign(table.style, {
  //         width: '100%',
  //         borderCollapse: 'collapse',
  //         fontSize: '11px',
  //         verticalAlign: 'middle',
  //       });

  //       // Header
  //       const headerRow = table.insertRow();
  //       ['Raw Material', 'Quantity', 'Unit', 'Process'].forEach((t) => {
  //         const th = document.createElement('th');
  //         Object.assign(th.style, {
  //           border: '1px solid #ccc',
  //           padding: '12px',
  //           backgroundColor: '#1E3A8A',
  //           color: 'white',
  //           textAlign: 'center',
  //           fontWeight: 'bold',
  //         });
  //         th.innerText = t;
  //         headerRow.appendChild(th);
  //       });

  //       const materials = Array.isArray(dish.rawMaterials)
  //         ? dish.rawMaterials
  //         : [];
  //       if (!materials.length) {
  //         const row = table.insertRow();
  //         ['No raw materials', '-', '-', '-'].forEach((val, idx) => {
  //           const cell = row.insertCell();
  //           cell.innerText = val;
  //           Object.assign(cell.style, {
  //             border: '1px solid #ddd',
  //             padding: '10px',
  //             textAlign: idx === 0 ? 'left' : 'center',
  //           });
  //         });
  //       } else {
  //         materials.forEach((rm, index) => {
  //           const row = table.insertRow();
  //           row.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f8f8f8';
  //           const selectedProcessId = formData[`process_${dish.id}_${rm.id}`];
  //           const selectedProcess = mappedProcessOptions.find(
  //             (p) => p.value === selectedProcessId,
  //           );
  //           const processName =
  //             selectedProcess?.label ||
  //             rm?.process?.name ||
  //             rm?.process ||
  //             'N/A';
  //           const values = [
  //             rm.name || '-',
  //             rm.quantity
  //               ? Number(rm.quantity).toFixed(rm.quantity % 1 === 0 ? 0 : 1)
  //               : '-',
  //             rm.unit || '-',
  //             processName,
  //           ];
  //           values.forEach((val, i) => {
  //             const cell = row.insertCell();
  //             cell.innerText = val;
  //             Object.assign(cell.style, {
  //               border: '1px solid #ddd',
  //               padding: '10px',
  //               textAlign: i === 0 ? 'left' : 'center',
  //             });
  //           });
  //         });
  //       }

  //       dishContainer.appendChild(table);
  //       reportContainer.appendChild(dishContainer);
  //     });
  //   });

  //   // === OPEN PREVIEW IN NEW WINDOW ===
  //   const printWindow = window.open('', '_blank', 'width=900,height=700');
  //   printWindow.document.open();
  //   printWindow.document.write(`
  //   <html>
  //     <head>
  //       <title>Cutting List Report</title>
  //       <style>
  //         body { font-family: Arial, sans-serif; margin: 20px; background: white; color: black; }
  //         table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
  //         th, td { border: 1px solid #ccc; padding: 12px; text-align: center; }
  //         th { background-color: #1E3A8A; color: white; font-weight: bold; }
  //         tr:nth-child(even) { background-color: #f8f8f8; }
  //         h1, h2, h4 { color: black; }
  //         @media print { body { margin: 10px; } }
  //       </style>
  //     </head>
  //     <body>
  //       ${reportContainer.innerHTML}
  //     </body>
  //   </html>
  // `);
  //   printWindow.document.close();
  //   printWindow.focus();
  //   printWindow.print();

  //   setIsPDFLoading(false);
  // };

  let isPrintingPDF = false;

  const handlePreviewAllPDF = async () => {
    setIsPDFLoading(true);

    const formData = getValues();

    // Save first
    try {
      await onSubmit(formData);
      toast.success('Saved successfully!');
    } catch (err) {
      toast.error('Failed to save before preview');
      setIsPDFLoading(false);
      return;
    }

    if (!subEvents?.length) {
      toast.error('No data to generate PDF');
      setIsPDFLoading(false);
      return;
    }

    // Generate dynamic filename
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB').replace(/\//g, '-');
    const timeStr = now
      .toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(/:/g, '-');

    // const fileName = `Cutting List Report ${dateStr} ${timeStr}`;
    const fileName = `Cutting List Report `;

    // Build main content
    let htmlContent = `
    <div style="font-family: Arial, sans-serif; font-size: 11px; color: #000; line-height: 1.3; max-width: 800px; margin: 0 auto;">

      <!-- FIRST PAGE HEADER -->
      <div style="text-align: center; border: 1px solid #0D47A1; padding: 8px; margin-bottom: 12px; background: #E3F2FD;">
        <h1 style="margin: 0; font-size: 24px; color: #0D47A1; font-weight: 800;">
          ${user?.fullname ?? `Name: ${user?.fullname}`}
        </h1>
        <p style="margin: 6px 0 0; font-weight: bold; font-size: 11px;">
          ${user?.address ? `Address - ${user.address}` : ''}${
            user?.email ? ` | Email - ${user.email}` : ''
          } | Mob. ${user?.phoneNumber || ''}
        </p>
      </div>

      <!-- FIRST PAGE TITLE (NO BOTTOM BAR NOW) -->
      <div style="text-align: center; background: #0D47A1; color: white; padding: 10px 6px; margin-bottom: 12px; font-weight: bold;">
        <h2 style="margin: 0; font-size: 18px;">Cutting List Report</h2>
        <div style="font-size: 11px; margin-top: 4px; opacity: 0.9;">
          Event: ${subEventResponse?.data?.name || 'N/A'} |
          StartDate: ${
            subEventResponse?.data?.startDate
              ? new Date(subEventResponse.data.startDate).toLocaleDateString(
                  'en-GB',
                )
              : 'N/A'
          } |
          EndDate: ${
            subEventResponse?.data?.endDate
              ? new Date(subEventResponse.data.endDate).toLocaleDateString(
                  'en-GB',
                )
              : 'N/A'
          }
        </div>
      </div>
  `;

    // Loop through subEvents & dishes
    subEvents.forEach((subEvent, subEventIndex) => {
      const subEventMargin =
        subEventIndex === 0 ? '8px auto 4px auto' : '16px auto 4px auto';

      htmlContent += `
      <div style="background: #1E3A8A; text-align: center; color: white; padding: 6px 8px; font-weight: bold; font-size: 11px; margin: ${subEventMargin};">
        SubEvent: ${subEvent.name} | Address: ${subEvent.address} |
        ${new Date(subEvent.date).toLocaleDateString('en-GB')} |
        ${new Date(subEvent.time).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })} |
        People: ${subEvent.actualPeople || subEvent.expectedPeople || 'N/A'}
      </div>
    `;

      subEvent.dishes?.forEach((dish) => {
        const materials = dish.rawMaterials || [];

        htmlContent += `
        <div style="margin-bottom: 12px;">
          <h4 style="margin: 0 0 4px 0; color: #1E3A8A; font-weight: bold; font-size: 12px; border-bottom: 1px solid #1E3A8A;">
            ${dish.name}
          </h4>

          <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 2px;">
            <thead>
              <tr style="background: #1E3A8A; color: white;">
                <th style="padding: 6px 4px; border: 1px solid #ccc;">Raw Material</th>
                <th style="padding: 6px 4px; border: 1px solid #ccc;">Quantity</th>
                <th style="padding: 6px 4px; border: 1px solid #ccc;">Unit</th>
                <th style="padding: 6px 4px; border: 1px solid #ccc;">Process</th>
              </tr>
            </thead>
            <tbody>
      `;

        if (!materials.length) {
          htmlContent += `
          <tr>
            <td colspan="4" style="text-align:center; padding:8px; border:1px solid #ddd;">No raw materials</td>
          </tr>
        `;
        } else {
          materials.forEach((rm, idx) => {
            const selectedProcessId = formData[`process_${dish.id}_${rm.id}`];
            const selectedProcess = mappedProcessOptions.find(
              (p) => p.value === selectedProcessId,
            );

            const processName =
              selectedProcess?.label ||
              rm?.process?.name ||
              rm?.process ||
              'N/A';

            htmlContent += `
            <tr style="background: ${idx % 2 === 0 ? '#fff' : '#f8f9fc'};">
              <td style="padding: 5px 4px; border: 1px solid #ddd;">${
                rm.name || '-'
              }</td>
              <td style="padding: 5px 4px; border: 1px solid #ddd; text-align:center;">
                ${
                  rm.quantity
                    ? Number(rm.quantity).toFixed(rm.quantity % 1 === 0 ? 0 : 1)
                    : '-'
                }
              </td>
              <td style="padding: 5px 4px; border: 1px solid #ddd; text-align:center;">
                ${rm.unit || '-'}
              </td>
              <td style="padding: 5px 4px; border: 1px solid #ddd; text-align:center;">
                ${processName}
              </td>
            </tr>
          `;
          });
        }

        htmlContent += `
            </tbody>
          </table>
        </div>
      `;
      });
    });

    htmlContent += `</div>`;

    // Open print window
    const printWindow = window.open(
      '',
      'printWindow',
      'width=1000,height=800,scrollbars=yes',
    );

    if (!printWindow) {
      alert('Please allow popups for printing');
      setIsPDFLoading(false);
      return;
    }

    // Final HTML
    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${fileName}</title>

       <style>
  body {
    margin: 0;
    padding: 18mm 12px 12px;
    font-family: Arial, sans-serif;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* REMOVE TOP SPACE ON FIRST PAGE */
  body.first-page {
    padding-top: 0 !important;
  }

  /* FIXED TITLE (but removed in first page) */
  .repeat-title {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    text-align: center;
    background: #0D47A1;
    color: white;
    padding: 6px 0;
    font-size: 14px;
    font-weight: bold;
  }

  body.first-page .repeat-title {
    display: none !important;
  }

  @page:first {
    margin-top: 0;
  }

  thead { display: table-header-group; }
</style>

      </head>

      <body class="first-page">


        ${htmlContent}

        <script>
          setTimeout(() => {
            document.body.classList.remove("first-page");
            window.print();
            setTimeout(() => window.close(), 600);
          }, 400);
        <\/script>

      </body>
    </html>
  `);

    printWindow.document.close();
    setIsPDFLoading(false);
  };

  return (
    <>
      {isPDFLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg bg-white px-8 py-6 shadow-lg">
            {/* Spinner */}
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"></div>

            {/* Text */}
            <span className="text-gray-700 text-lg font-semibold">
              Generating PDF...
            </span>
          </div>
        </div>
      )}

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-lg border-stroke bg-transparent shadow-sm dark:border-strokedark dark:bg-boxdark">
            <div className="rounded-md bg-gradient-to-r from-blue-800 to-indigo-900 p-6 shadow-xl">
              <div className="flex items-center justify-between">
                {/* Title */}
                <h2 className="text-xl font-bold text-white dark:text-white">
                  Event Cutting List
                </h2>

                {/* Buttons */}
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)} // toggle dropdown
                    className="flex items-center gap-2 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
                  >
                    Download Cutting List
                    <FiChevronDown
                      className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <>
                      {/* Backdrop to close on outside click */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDropdownOpen(false)}
                      />

                      {/* Dropdown Menu */}
                      <div className="rounded- absolute right-0 z-50 mt-2 w-55 origin-top-right border border-stroke bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:border-strokedark dark:bg-boxdark">
                        <div className="py-1">
                          <button
                            type="button"
                            onClick={() => {
                              handlePreviewAllPDF();
                              setIsDropdownOpen(false);
                            }}
                            className="text-gray-700 dark:text-gray-200 flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/50"
                          >
                            <FiFileText className="h-4 w-4 text-blue-600" />
                            All Cutting List
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleDownloadFilteredCuttingList();
                              setIsDropdownOpen(false);
                            }}
                            className="text-gray-700 dark:text-gray-200 flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/30"
                          >
                            <FiList className="h-4 w-4 text-green-600" />
                            Cutting List (Filtered)
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleDownloadGroupedCuttingList();
                              setIsDropdownOpen(false);
                            }}
                            className="text-gray-700 dark:text-gray-200 flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/30"
                          >
                            <FiPackage className="h-4 w-4 text-purple-600" />
                            Merged Raw Materials
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {!isCollapsed && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {subEvents.map((subEvent) => (
                  <div
                    key={subEvent.id}
                    className={`min-w-[200px] flex-shrink-0 cursor-pointer rounded-md p-5 transition-all duration-200 dark:bg-transparent dark:text-white ${
                      selectedSubEvent === subEvent.id
                        ? 'border-b-4 border-blue-600 bg-blue-50 shadow-sm dark:bg-blue-900/30'
                        : 'hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border-b-4 border-stroke bg-white dark:border-strokedark'
                    }`}
                    onClick={() => {
                      setSelectedSubEvent((prev) =>
                        prev === subEvent.id ? null : subEvent.id,
                      );
                      setSelectedSubEventName(subEvent.name);
                    }}
                  >
                    <div className="flex flex-col">
                      <h2 className="text-gray-800 dark:text-gray-100 truncate text-sm font-medium">
                        {subEvent.name}
                      </h2>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedSubEvent &&
              (() => {
                const selectedEvent = subEvents.find(
                  (sub) => sub.id === selectedSubEvent,
                );
                const dishes = selectedEvent?.dishes || [];

                return (
                  <div className="mt-4 space-y-2">
                    {dishes.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-300">
                        No dishes available.
                      </p>
                    ) : (
                      dishes.map((dish) => (
                        <div
                          key={dish.id}
                          className="cursor-pointerh-16 rounded-t-md p-6 text-black shadow dark:bg-meta-4 dark:text-white"
                        >
                          <div
                            className="flex items-center justify-between"
                            onClick={() => toggleDish(dish.id)}
                          >
                            <span className="mb-2 font-bold text-black dark:text-white">
                              {dish.name}
                            </span>
                            <BiChevronDown
                              size={24}
                              className="font-bold text-black dark:text-white"
                            />
                          </div>

                          {expandedDishes.includes(dish.id) && (
                            <div className="mt-2 rounded bg-white p-4 text-black dark:bg-boxdark dark:text-white">
                              {/* <div className="mb-2 font-bold">
                                Raw Materials
                              </div> */}
                              <table className="w-full text-left">
                                <thead className="h-16 rounded-t-md bg-blue-900 text-white dark:bg-blue-950">
                                  <tr>
                                    <th className="border-b border-stroke px-2 py-2 dark:border-stone-600">
                                      Material
                                    </th>
                                    <th className="border-b border-stroke px-2 py-2 dark:border-stone-600">
                                      Qty
                                    </th>
                                    {/* <th className="border-b border-stroke px-2 py-2 dark:border-stone-600">
                                Unit
                              </th> */}
                                    <th className="border-b border-stroke px-2 py-2 dark:border-stone-600">
                                      Process
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {dish?.rawMaterials?.map((rm) => (
                                    <tr key={rm.id}>
                                      <td className="border-b border-stroke px-2 py-2 dark:border-stone-600">
                                        {rm.name}
                                      </td>
                                      <td className="border-b border-stroke px-2 py-2 dark:border-stone-600">
                                        {Number(rm.quantity).toFixed(2)}{' '}
                                        {rm.unit}
                                      </td>
                                      <td className="border-b border-stroke bg-transparent px-2 py-2 dark:border-stone-600">
                                        <Controller
                                          name={`process_${dish.id}_${rm.id}`}
                                          control={control}
                                          defaultValue={rm.processId || ''}
                                          render={({field}) => (
                                            <select
                                              {...field}
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                              onChange={async (e) => {
                                                const value = e.target.value;
                                                field.onChange(value);

                                                if (value === 'AddNew') {
                                                  setIsAddProcessOpen(true); // open popup
                                                }
                                              }}
                                              className="w-full rounded border border-stroke px-4 py-2 dark:border-strokedark dark:bg-boxdark"
                                            >
                                              {mappedProcessOptions.map(
                                                (p: any) => (
                                                  <option
                                                    key={p.value}
                                                    value={p.value}
                                                  >
                                                    {p.label}
                                                  </option>
                                                ),
                                              )}

                                              <option value="AddNew">
                                                Add New
                                              </option>
                                            </select>
                                          )}
                                        />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                );
              })()}
            {/* Save Button */}
            {(role === 'CATEROR' || restriction === 'EDIT') && (
              <div className="mb-4 flex justify-end gap-2 p-4">
                {/* <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                >
                  <span>📄</span>
                  Download {selectedSubEventName}'s Cutting List
                </button> */}
                <button
                  type="submit"
                  className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </form>
      </FormProvider>
      {isAddProcessOpen && (
        <AddDishProcessPopup
          onClose={() => setIsAddProcessOpen(false)} // close popup
        />
      )}
    </>
  );
};

export default DisplayAllDishProcess;
