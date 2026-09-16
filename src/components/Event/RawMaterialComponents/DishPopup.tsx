// /* eslint-disable */
// import React, {useState, useEffect} from 'react';
// import {useSubEventContext} from '@/context/SubEventContext';
// import {usePredictRawMaterials} from '@/lib/react-query/queriesAndMutations/cateror/dish';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
// import {useAuthContext} from '@/context/AuthContext';
// import toast from 'react-hot-toast';
// import {SubmitHandler, useForm} from 'react-hook-form';
// import {FormValues} from '@/components/MultipleDishComponents/types';
// type props = {
//   isadddish: boolean;
//   setIsAddDish: React.Dispatch<React.SetStateAction<boolean>>;
//   selectedDishId?: string | null;
//   setSelectedDishId?: React.Dispatch<React.SetStateAction<string | null>>;
//   updatedDish: any;
//   setUpdatedDish: React.Dispatch<React.SetStateAction<any>>;
// };

// const DishPopup: React.FC<props> = ({
//   isadddish,
//   setIsAddDish,
//   selectedDishId,
//   setSelectedDishId,
//   updatedDish,
//   setUpdatedDish,
// }) => {
//   const {user} = useAuthContext();
//   const {
//     selectedDishDetails,
//     dishUpdates,
//     setDishUpdates,
//     setSelectedDishDetails,
//     handleSaveDishDetails,
//     preparationPeople,
//   } = useSubEventContext();

//   if (!selectedDishDetails) return null;

//   const [localDish, setLocalDish] = useState<any>(null);

//   const [popupKg, setPopupKg] = useState<number>(selectedDishDetails.kg || 0);

//   const selectedDish = Array.isArray(updatedDish)
//     ? updatedDish.find((d) => d.dishId === selectedDishDetails?.dishId)
//     : updatedDish?.dishId === selectedDishDetails?.dishId
//       ? updatedDish
//       : null;
//   useEffect(() => {
//     if (!selectedDishDetails) return;

//     setLocalDish(JSON.parse(JSON.stringify(selectedDish)));
//   }, [selectedDishDetails]);

//   const handleLocalQuantityChange = (index: number, value: string) => {
//     setLocalDish((prev: any) => {
//       const materials = [...prev.rawMaterials];
//       materials[index] = {
//         ...materials[index],
//         quantity: Number(value),
//       };

//       return {...prev, rawMaterials: materials};
//     });
//   };

//   const handleSave = () => {
//     setUpdatedDish((prev) =>
//       prev.map((dish) => (dish.dishId === localDish.dishId ? localDish : dish)),
//     );
//     setSelectedDishDetails(null);
//   };

//   const handleDownloadPDF = () => {
//     if (!selectedDishDetails) return;

//     // === Container ===
//     const reportContainer = document.createElement('div');
//     reportContainer.style.width = '800px';
//     reportContainer.style.padding = '20px';
//     reportContainer.style.background = 'white';
//     reportContainer.style.fontFamily = 'Arial, sans-serif';
//     reportContainer.style.fontSize = '12px';
//     reportContainer.style.color = 'black';
//     reportContainer.style.textAlign = 'center';

//     // === Header ===
//     const headerWrapper = document.createElement('div');
//     headerWrapper.style.padding = '6px';
//     headerWrapper.style.border = '1px solid #0D47A1';
//     headerWrapper.style.textAlign = 'center';
//     headerWrapper.style.color = 'black';

//     const centerInfo = document.createElement('div');
//     centerInfo.innerHTML = `
//     <h1 style="margin:0; font-weight:800; font-size:28px; color:black;">
//       ${user?.fullname || 'Caterer Name'}
//     </h1>
//     <div style="background:#0D47A1; height:2px; margin:4px auto; width:80%;"></div>
//     <p style="margin:0; font-size:14px; font-weight:bold; color:black;">
//       ${user?.address || ''}<br/>
//       ${user?.email ? `Email - ${user?.email}<br/>` : ''}Ph: ${user?.phoneNumber || ''}
//     </p>
//   `;
//     headerWrapper.appendChild(centerInfo);
//     reportContainer.appendChild(headerWrapper);

//     // === Title ===
//     const titleWrapper = document.createElement('div');
//     titleWrapper.style.marginTop = '5px';
//     titleWrapper.style.textAlign = 'center';
//     titleWrapper.innerHTML = `
//     <h2 style="font-size:18px; font-weight:bold; margin:4px 0; color:black;">
//       Dish Raw Material Report
//     </h2>
//     <div style="margin-bottom: 4px; color:black;">
//       <span style="display: inline-block; margin: 0 8px;"><strong>Dish Name:</strong> ${selectedDishDetails.dish}</span>
//       <span style="display: inline-block; margin: 0 8px;"><strong>Dish Kg:</strong> ${popupKg}</span>
//     </div>
//   `;
//     reportContainer.appendChild(titleWrapper);

//     // === Table Section ===
//     const dishContainer = document.createElement('div');
//     dishContainer.style.background = 'white';
//     dishContainer.style.marginBottom = '14px';

//     const table = document.createElement('table');
//     table.style.width = '100%';
//     table.style.borderCollapse = 'collapse';
//     table.style.fontSize = '11px';
//     table.style.backgroundColor = 'white';
//     table.style.verticalAlign = 'middle';

//     const headerRow = table.insertRow();
//     headerRow.style.verticalAlign = 'middle';
//     ['Raw Material', 'Quantity', 'Unit', 'Process'].forEach((text) => {
//       const th = document.createElement('th');
//       th.innerText = text;
//       th.style.border = '1px solid #ccc';
//       th.style.paddingBottom = '12px';
//       th.style.backgroundColor = '#1E3A8A';
//       th.style.color = 'white';
//       th.style.textAlign = 'center';
//       th.style.verticalAlign = 'middle';
//       th.style.fontWeight = 'bold';
//       th.style.font = 'bold 12px Arial, sans-serif';
//       headerRow.appendChild(th);
//     });

//     updatedDish.rawMaterials?.forEach((rm: any, idx: number) => {
//       const row = table.insertRow();
//       row.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f8f8f8';
//       row.style.verticalAlign = 'middle';
//       row.style.height = 'auto';

//       const cells = [
//         rm.rawMaterial,
//         rm.quantity % 1 === 0 ? rm.quantity : rm.quantity.toFixed(1),
//         rm.unit,
//         rm.process || 'N/A',
//       ];

//       cells.forEach((val, cellIndex) => {
//         const cell = row.insertCell();
//         cell.innerText = String(val);
//         cell.style.border = '1px solid #ddd';
//         cell.style.font = 'bold 12px Arial, sans-serif';
//         cell.style.paddingBottom = '10px';
//         cell.style.textAlign = cellIndex === 0 ? 'left' : 'center';
//         cell.style.verticalAlign = 'middle';
//         cell.style.color = 'black';
//         cell.style.fontSize = '12px';

//         if (cellIndex === 3) {
//           cell.style.whiteSpace = 'normal';
//           cell.style.wordBreak = 'break-word';
//         }
//       });
//     });

//     dishContainer.appendChild(table);
//     reportContainer.appendChild(dishContainer);

//     // === Notes Section ===
//     const notesSection = document.createElement('div');
//     notesSection.style.marginTop = '10px';
//     notesSection.style.marginBottom = '20px';
//     notesSection.style.textAlign = 'left';

//     const notesTitle = document.createElement('h3');
//     notesTitle.innerText = 'Notes:';
//     notesTitle.style.fontSize = '16px';
//     notesTitle.style.marginBottom = '10px';
//     notesTitle.style.color = '#333';
//     notesSection.appendChild(notesTitle);

//     const notesBox = document.createElement('div');
//     notesBox.style.border = '1px solid #ddd';
//     notesBox.style.borderRadius = '8px';
//     notesBox.style.padding = '15px';
//     notesBox.style.minHeight = '100px';
//     notesBox.style.backgroundColor = '#f9f9f9';
//     notesBox.innerHTML = `<div style="display: flex; flex-direction: column; gap: 80px;"></div>`;
//     notesSection.appendChild(notesBox);
//     reportContainer.appendChild(notesSection);

//     // === Footer ===
//     const footer = document.createElement('div');
//     footer.style.marginTop = '10px';
//     footer.style.fontSize = '10px';
//     footer.style.textAlign = 'center';
//     footer.style.color = '#666';
//     footer.innerHTML = `<p>&copy; All Rights Reserved by PhygitalTech. Contact: 95116 40351.</p>`;
//     reportContainer.appendChild(footer);

//     // === Generate PDF ===
//     document.body.appendChild(reportContainer);

//     html2canvas(reportContainer, {
//       scale: 3,
//       useCORS: true,
//       backgroundColor: '#ffffff',
//     })
//       .then((canvas) => {
//         const pdf = new jsPDF('p', 'mm', 'a4');
//         const imgWidth = pdf.internal.pageSize.getWidth();
//         const imgHeight = (canvas.height * imgWidth) / canvas.width;

//         const pageWidth = pdf.internal.pageSize.getWidth();
//         const pageHeight = pdf.internal.pageSize.getHeight();
//         const bottomMargin = 15;
//         const topMargin = 18;

//         let heightLeft = imgHeight;
//         let pageNumber = 1;

//         while (heightLeft > 0) {
//           if (pageNumber > 1) pdf.addPage();

//           const currentTopMargin = pageNumber === 1 ? 0 : topMargin;
//           const usableHeight = pageHeight - currentTopMargin - bottomMargin;

//           const pageCanvas = document.createElement('canvas');
//           pageCanvas.width = canvas.width;
//           pageCanvas.height = Math.floor(
//             (usableHeight * canvas.width) / imgWidth,
//           );

//           const ctx = pageCanvas.getContext('2d');
//           if (ctx) {
//             ctx.fillStyle = '#ffffff';
//             ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
//             ctx.drawImage(
//               canvas,
//               0,
//               (imgHeight - heightLeft) * (canvas.width / imgWidth),
//               canvas.width,
//               pageCanvas.height,
//               0,
//               0,
//               pageCanvas.width,
//               pageCanvas.height,
//             );
//           }

//           const pageImgData = pageCanvas.toDataURL('image/jpeg', 1.0);
//           pdf.addImage(
//             pageImgData,
//             'JPEG',
//             0,
//             currentTopMargin,
//             imgWidth,
//             usableHeight,
//           );

//           pdf.setFontSize(9);
//           pdf.setTextColor(0, 0, 0);
//           pdf.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 8, {
//             align: 'center',
//           });

//           heightLeft -= usableHeight;
//           pageNumber++;
//         }

//         pdf.save('DishRawMaterialReport.pdf');
//       })
//       .finally(() => {
//         document.body.removeChild(reportContainer);
//       });
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-75">
//       <div className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded bg-white p-4 shadow-lg dark:bg-boxdark-2 sm:p-6">
//         {/* Header with dish name and input for dish kg */}
//         <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//           <h2 className="text-lg font-bold  sm:text-xl">
//             {selectedDishDetails.dish}
//           </h2>
//           <div className="flex flex-col items-center gap-2 sm:flex-row">
//             <label className="font-medium">Dish Quantity:</label>
//             <input
//               type="number"
//               value={popupKg}
//               disabled
//               className="w-16 rounded bg-transparent px-2 font-semibold py-1 text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
//             />
//             <button
//               onClick={handleDownloadPDF}
//               className="rounded bg-green-500 px-4 py-1 text-white"
//             >
//               Download PDF
//             </button>
//           </div>
//         </div>
//         {/* Table showing raw material data */}
//         <div className="mt-4 overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="bg-gray-200 dark:bg-boxdark-2">
//                 <th className="p-2">Raw Material</th>
//                 <th className="p-2">Quantity</th>
//                 <th className="p-2">Unit</th>
//                 <th className="p-2">Process</th>
//               </tr>
//             </thead>
//             <tbody>
//               {localDish?.rawMaterials?.map((rm: any, index: number) => (
//                 <tr
//                   key={index}
//                   className={`text-center ${rm.quantity === 0 ? 'text-red-500' : ''}`}
//                 >
//                   <td className="p-1">{rm.rawMaterial}</td>

//                   <td className="p-1">
//                     <input
//                       type="number"
//                       value={
//                         rm.quantity % 1 === 0
//                           ? rm.quantity
//                           : Number(rm.quantity).toFixed(1)
//                       }
//                       onChange={(e) =>
//                         handleLocalQuantityChange(index, e.target.value)
//                       }
//                       className={`w-[15] rounded border-[1.7px] border-stroke bg-transparent px-3 py-2 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white sm:px-2 sm:py-1 ${
//                         rm.quantity === 0
//                           ? 'border-red-500 dark:border-red-500'
//                           : ''
//                       }`}
//                     />
//                   </td>

//                   <td className="p-1">{rm.unit}</td>
//                   <td className="p-1">{rm.process || 'Select Process'}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         {/* Checkboxes for additional options could go here */}
//         <div className="mt-4 flex justify-end">
//           <div className="ml-auto mt-4 flex items-center gap-2">
//             <input
//               type="checkbox"
//               id="option1"
//               className="h-4 w-4"
//               checked={selectedDishId === selectedDishDetails?.dishId}
//               onChange={() => {
//                 const isChecked =
//                   selectedDishId === selectedDishDetails?.dishId;

//                 if (isChecked) {
//                   // uncheck
//                   setIsAddDish(false);
//                   setSelectedDishId(null);
//                 } else {
//                   // check
//                   setIsAddDish(true);
//                   setSelectedDishId(selectedDishDetails?.dishId);
//                 }
//               }}
//             />
//             <label htmlFor="option1" className="text-sm">
//               Add Record to this Template
//             </label>
//           </div>
//         </div>
//         {/* Buttons to close or save the popup */}
//         <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
//           <button
//             onClick={() => setSelectedDishDetails(null)}
//             className="hover:bg-gray-100 rounded border border-graydark bg-transparent px-4 py-2 text-graydark dark:border-bodydark dark:text-bodydark"
//           >
//             Close
//           </button>
//           <button
//             onClick={async () => {
//               toast.success('Saved dish details...');
//               handleSave();
//             }}
//             className="hover:bg-primary-dark rounded bg-primary px-4 py-2 text-white disabled:opacity-50"
//           >
//             save
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DishPopup;
/* eslint-disable */
import React, {useState, useEffect} from 'react';
import {useSubEventContext} from '@/context/SubEventContext';
import {usePredictRawMaterials} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {useAuthContext} from '@/context/AuthContext';
import toast from 'react-hot-toast';
import {SubmitHandler, useForm} from 'react-hook-form';
import {FormValues} from '@/components/MultipleDishComponents/types';
import RawMaterialRow from './PopUpDishRow';
export type PortionPeople = {
  portionSize: number;
  people: number;
};

export type PortionAndPeopleState = Record<string, PortionPeople>;
type props = {
  isadddish: boolean;
  setIsAddDish: React.Dispatch<React.SetStateAction<boolean>>;
  selectedDishId?: string | null;
  setSelectedDishId?: React.Dispatch<React.SetStateAction<string | null>>;
  updatedDish: any;
  setUpdatedDish: React.Dispatch<React.SetStateAction<any>>;
  portionAndPeople: PortionAndPeopleState;
  setPortionAndPeople: React.Dispatch<
    React.SetStateAction<PortionAndPeopleState>
  >;
};

const DishPopup: React.FC<props> = ({
  isadddish,
  setIsAddDish,
  selectedDishId,
  setSelectedDishId,
  updatedDish,
  setUpdatedDish,
  portionAndPeople,
  setPortionAndPeople,
}) => {
  const {user} = useAuthContext();
  const {
    selectedDishDetails,
    dishUpdates,
    setDishUpdates,
    setSelectedDishDetails,
    handleSaveDishDetails,
    preparationPeople,
  } = useSubEventContext();

  if (!selectedDishDetails) return null;

  const [localDish, setLocalDish] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [popupKg, setPopupKg] = useState<number>(selectedDishDetails.kg || 0);
  const productionQty =
    portionAndPeople[selectedDishDetails?.dishId]?.portionSize *
    portionAndPeople[selectedDishDetails?.dishId]?.people;
  const selectedDish = Array.isArray(updatedDish)
    ? updatedDish.find((d) => d.dishId === selectedDishDetails?.dishId)
    : updatedDish?.dishId === selectedDishDetails?.dishId
      ? updatedDish
      : null;
  useEffect(() => {
    if (!selectedDishDetails) return;

    // setLocalDish(JSON.parse(JSON.stringify(selectedDish)));
    // setLocalDish(structuredClone(selectedDish));
    setLocalDish({
      ...selectedDish,
      rawMaterials: selectedDish?.rawMaterials?.map((rm) => ({...rm})),
    });
  }, [selectedDishDetails]);

  // const handleLocalQuantityChange = (index: number, value: string) => {
  //   setLocalDish((prev: any) => {
  //     const materials = [...prev.rawMaterials];
  //     materials[index] = {
  //       ...materials[index],
  //       quantity: Number(value),
  //     };

  //     return {...prev, rawMaterials: materials};
  //   });
  // };

  const handleLocalQuantityChange = React.useCallback(
    (index: number, value: string) => {
      setLocalDish((prev: any) => {
        const materials = [...prev.rawMaterials];
        materials[index] = {
          ...materials[index],
          quantity: Number(value),
        };
        return {...prev, rawMaterials: materials};
      });
    },
    [],
  );

  const handleSave = () => {
    setUpdatedDish((prev) =>
      prev.map((dish) => (dish.dishId === localDish.dishId ? localDish : dish)),
    );
    setSelectedDishDetails(null);
  };

  useEffect(() => {
    if (!isDownloading) return;
    handleDownloadPDF();
  }, [isDownloading]);

  const handleDownloadPDF = () => {
    if (!selectedDishDetails) return;
    const reportContainer = document.createElement('div');
    reportContainer.style.width = '800px';
    reportContainer.style.padding = '20px';
    reportContainer.style.background = 'white';
    reportContainer.style.fontFamily = 'Arial, sans-serif';
    reportContainer.style.fontSize = '12px';
    reportContainer.style.color = 'black';
    reportContainer.style.textAlign = 'center';
    const headerWrapper = document.createElement('div');
    headerWrapper.style.padding = '6px';
    headerWrapper.style.border = '1px solid #0D47A1';
    headerWrapper.style.textAlign = 'center';
    headerWrapper.style.color = 'black';

    const centerInfo = document.createElement('div');
    centerInfo.innerHTML = `
    <h1 style="margin:0; font-weight:800; font-size:28px; color:black;">
      ${user?.fullname || 'Caterer Name'}
    </h1>
    <div style="background:#0D47A1; height:2px; margin:4px auto; width:80%;"></div>
    <p style="margin:0; font-size:14px; font-weight:bold; color:black;">
      ${user?.address || ''}<br/>
      ${user?.email ? `Email - ${user?.email}<br/>` : ''}Ph: ${user?.phoneNumber || ''}
    </p>
  `;
    headerWrapper.appendChild(centerInfo);
    reportContainer.appendChild(headerWrapper);

    // === Title ===
    const titleWrapper = document.createElement('div');
    titleWrapper.style.marginTop = '5px';
    titleWrapper.style.textAlign = 'center';
    titleWrapper.innerHTML = `
    <h2 style="font-size:18px; font-weight:bold; margin:4px 0; color:black;">
      Dish Raw Material Report
    </h2>
    <div style="margin-bottom: 4px; color:black;">
      <span style="display: inline-block; margin: 0 8px;"><strong>Dish Name:</strong> ${selectedDishDetails.dish}</span>
      <span style="display: inline-block; margin: 0 8px;"><strong>Dish Kg:</strong> ${popupKg}</span>
    </div>
  `;
    reportContainer.appendChild(titleWrapper);

    // === Table Section ===
    const dishContainer = document.createElement('div');
    dishContainer.style.background = 'white';
    dishContainer.style.marginBottom = '14px';

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.fontSize = '11px';
    table.style.backgroundColor = 'white';
    table.style.verticalAlign = 'middle';

    const headerRow = table.insertRow();
    headerRow.style.verticalAlign = 'middle';
    ['Raw Material', 'Quantity', 'Unit', 'Process'].forEach((text) => {
      const th = document.createElement('th');
      th.innerText = text;
      th.style.border = '1px solid #ccc';
      th.style.paddingBottom = '12px';
      th.style.backgroundColor = '#1E3A8A';
      th.style.color = 'white';
      th.style.textAlign = 'center';
      th.style.verticalAlign = 'middle';
      th.style.fontWeight = 'bold';
      th.style.font = 'bold 12px Arial, sans-serif';
      headerRow.appendChild(th);
    });

    updatedDish.rawMaterials?.forEach((rm: any, idx: number) => {
      const row = table.insertRow();
      row.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f8f8f8';
      row.style.verticalAlign = 'middle';
      row.style.height = 'auto';

      const cells = [
        rm.rawMaterial,
        rm.quantity % 1 === 0 ? rm.quantity : rm.quantity.toFixed(1),
        rm.unit,
        rm.process || 'N/A',
      ];

      cells.forEach((val, cellIndex) => {
        const cell = row.insertCell();
        cell.innerText = String(val);
        cell.style.border = '1px solid #ddd';
        cell.style.font = 'bold 12px Arial, sans-serif';
        cell.style.paddingBottom = '10px';
        cell.style.textAlign = cellIndex === 0 ? 'left' : 'center';
        cell.style.verticalAlign = 'middle';
        cell.style.color = 'black';
        cell.style.fontSize = '12px';

        if (cellIndex === 3) {
          cell.style.whiteSpace = 'normal';
          cell.style.wordBreak = 'break-word';
        }
      });
    });

    dishContainer.appendChild(table);
    reportContainer.appendChild(dishContainer);

    // === Notes Section ===
    const notesSection = document.createElement('div');
    notesSection.style.marginTop = '10px';
    notesSection.style.marginBottom = '20px';
    notesSection.style.textAlign = 'left';

    const notesTitle = document.createElement('h3');
    notesTitle.innerText = 'Notes:';
    notesTitle.style.fontSize = '16px';
    notesTitle.style.marginBottom = '10px';
    notesTitle.style.color = '#333';
    notesSection.appendChild(notesTitle);

    const notesBox = document.createElement('div');
    notesBox.style.border = '1px solid #ddd';
    notesBox.style.borderRadius = '8px';
    notesBox.style.padding = '15px';
    notesBox.style.minHeight = '100px';
    notesBox.style.backgroundColor = '#f9f9f9';
    notesBox.innerHTML = `<div style="display: flex; flex-direction: column; gap: 80px;"></div>`;
    notesSection.appendChild(notesBox);
    reportContainer.appendChild(notesSection);

    // === Footer ===
    const footer = document.createElement('div');
    footer.style.marginTop = '10px';
    footer.style.fontSize = '10px';
    footer.style.textAlign = 'center';
    footer.style.color = '#666';
    footer.innerHTML = `<p>&copy; All Rights Reserved by PhygitalTech. Contact: 95116 40351.</p>`;
    reportContainer.appendChild(footer);

    // === Generate PDF ===
    document.body.appendChild(reportContainer);

    html2canvas(reportContainer, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
    })
      .then((canvas) => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const bottomMargin = 15;
        const topMargin = 18;

        let heightLeft = imgHeight;
        let pageNumber = 1;

        while (heightLeft > 0) {
          if (pageNumber > 1) pdf.addPage();

          const currentTopMargin = pageNumber === 1 ? 0 : topMargin;
          const usableHeight = pageHeight - currentTopMargin - bottomMargin;

          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = Math.floor(
            (usableHeight * canvas.width) / imgWidth,
          );

          const ctx = pageCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            ctx.drawImage(
              canvas,
              0,
              (imgHeight - heightLeft) * (canvas.width / imgWidth),
              canvas.width,
              pageCanvas.height,
              0,
              0,
              pageCanvas.width,
              pageCanvas.height,
            );
          }

          const pageImgData = pageCanvas.toDataURL('image/jpeg', 1.0);
          pdf.addImage(
            pageImgData,
            'JPEG',
            0,
            currentTopMargin,
            imgWidth,
            usableHeight,
          );

          pdf.setFontSize(9);
          pdf.setTextColor(0, 0, 0);
          pdf.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 8, {
            align: 'center',
          });

          heightLeft -= usableHeight;
          pageNumber++;
        }

        pdf.save('DishRawMaterialReport.pdf');
      })
      .finally(() => {
        document.body.removeChild(reportContainer);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-75">
      <div className="w-full max-w-3xl overflow-hidden rounded bg-white shadow-lg dark:bg-boxdark-2">
        {/* Separated Header Section with Color */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-4 py-6 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <h2 className="text-lg font-bold text-white sm:text-xl">
              {selectedDishDetails.dish}
            </h2>
            <div className="flex flex-col items-center gap-2 sm:flex-row">
              <label className="font-medium text-white">Dish Quantity:</label>
              <input
                type="number"
                value={productionQty.toFixed(3)}
                disabled
                className="w-16 rounded bg-white bg-opacity-20 px-2 py-1 font-semibold text-white outline-none backdrop-blur-sm"
              />
              <button
                onClick={() => {
                  // handleDownloadPDF;
                  setIsDownloading(true);
                }}
                className="rounded bg-green-500 px-4 py-1 text-white transition-colors hover:bg-green-600"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-h-[70vh] overflow-auto px-4 pb-4">
          {/* Table showing raw material data */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-200 dark:bg-boxdark-2">
                  <th className="p-2">Raw Material</th>
                  <th className="p-2">Quantity</th>
                  <th className="p-2">Unit</th>
                  <th className="p-2">Process</th>
                </tr>
              </thead>
              {/* <tbody>
                {localDish?.rawMaterials?.map((rm: any, index: number) => (
                  <tr
                    key={index}
                    className={`text-center ${rm.quantity === 0 ? 'text-red-500' : ''}`}
                  >
                    <td className="p-1">{rm.rawMaterial}</td>

                    <td className="p-1">
                      <input
                        type="number"
                        value={
                          rm.quantity % 1 === 0
                            ? rm.quantity
                            : Number(rm.quantity).toFixed(1)
                        }
                        onChange={(e) =>
                          handleLocalQuantityChange(index, e.target.value)
                        }
                        className={`w-[15] rounded border-[1.7px] border-stroke bg-transparent px-3 py-2 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white sm:px-2 sm:py-1 ${
                          rm.quantity === 0
                            ? 'border-red-500 dark:border-red-500'
                            : ''
                        }`}
                      />
                    </td>

                    <td className="p-1">{rm.unit}</td>
                    <td className="p-1">{rm.process || 'Select Process'}</td>
                  </tr>
                ))}
              </tbody> */}
              <tbody>
                {localDish?.rawMaterials?.map((rm: any, index: number) => (
                  <RawMaterialRow
                    key={rm.id || index}
                    rm={rm}
                    index={index}
                    onChange={handleLocalQuantityChange}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Checkboxes for additional options */}
          <div className="mt-2 flex justify-end">
            <div className="ml-auto mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="option1"
                className="h-4 w-4"
                checked={selectedDishId === selectedDishDetails?.dishId}
                onChange={() => {
                  const isChecked =
                    selectedDishId === selectedDishDetails?.dishId;

                  if (isChecked) {
                    // uncheck
                    setIsAddDish(false);
                    setSelectedDishId(null);
                  } else {
                    // check
                    setIsAddDish(true);
                    setSelectedDishId(selectedDishDetails?.dishId);
                  }
                }}
              />
              <label htmlFor="option1" className="text-sm">
                Add Record to this Template
              </label>
            </div>
          </div>

          {/* Buttons to close or save the popup */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              onClick={() => setSelectedDishDetails(null)}
              className="hover:bg-gray-100 rounded border border-graydark bg-transparent px-4 py-2 text-graydark dark:border-bodydark dark:text-bodydark"
            >
              Close
            </button>
            <button
              onClick={async () => {
                toast.success('Saved dish details...');
                handleSave();
              }}
              className="hover:bg-primary-dark rounded bg-primary px-4 py-2 text-white disabled:opacity-50"
            >
              save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishPopup;
