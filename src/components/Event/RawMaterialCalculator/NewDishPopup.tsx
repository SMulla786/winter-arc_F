// /*eslint-disable*/
// import {useAuthContext} from '@/context/AuthContext';
// import React, {useEffect, useState} from 'react';
// import toast from 'react-hot-toast';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
// export type RawMaterialType = {
//   rawId: string;
//   rawName: string;
//   unit: string;
//   quantity: number;
//   process: string;
// };

// export type DishType = {
//   dishId: string;
//   name: string;
//   portionSize: number;
//   dishCat: string;
//   dishCatId: string;
//   people: number;
//   price: number;
//   unit: string;
//   foodVendor: string;
//   maharaj: string[];
//   rawMaterialCalculation: boolean;
//   rawMaterials: RawMaterialType[];
// };

// export type Props = {
//   allDishes: DishType[];
//   setAllDishes: React.Dispatch<React.SetStateAction<DishType[]>>;
//   selectedDishId: string | null;
//   setSelectedDishId: React.Dispatch<React.SetStateAction<string | null>>;
//   recordToThisTemplate: string | null;
//   setRecordToThisTemplate: React.Dispatch<React.SetStateAction<string | null>>;
//   isadddish: boolean;
//   setIsAddDish: React.Dispatch<React.SetStateAction<boolean>>;
// };

// const NewDishPopup: React.FC<Props> = ({
//   allDishes,
//   setAllDishes,
//   setSelectedDishId,
//   selectedDishId,
//   isadddish,
//   setIsAddDish,
//   recordToThisTemplate,
//   setRecordToThisTemplate,
// }) => {
//   const {user} = useAuthContext();
//   if (!setSelectedDishId) return null;
//   const dish = allDishes.find((dish) => dish.dishId === selectedDishId);
//   const totalQty = (dish?.portionSize ?? 0) * (dish?.people ?? 0);
//   const [isDownloading, setIsDownloading] = useState(false);

//   const [localDish, setLocalDish] = React.useState<DishType | null>(null);

//   useEffect(() => {
//     if (!dish) {
//       setLocalDish(null);
//       return;
//     }
//     setLocalDish({
//       ...dish,
//       rawMaterials: dish.rawMaterials.map((rm) => ({...rm})),
//     });
//   }, [dish]);

//   const handleLocalQuantityChange = (index: number, value: string) => {
//     setLocalDish((prev) => {
//       if (!prev) return prev;

//       const updatedRawMaterials = prev.rawMaterials.map((rm, i) =>
//         i === index ? {...rm, quantity: Number(value)} : rm,
//       );

//       return {
//         ...prev,
//         rawMaterials: updatedRawMaterials,
//       };
//     });
//   };

//   const handleSave = () => {
//     if (!localDish) return;

//     setAllDishes((prev) =>
//       prev.map((dish) => (dish.dishId === localDish.dishId ? localDish : dish)),
//     );

//     setSelectedDishId(null);
//   };

//   const handleCancel = () => {
//     setLocalDish(null);
//     setSelectedDishId(null);
//   };

//   useEffect(() => {
//     if (!isDownloading) return;
//     handleDownloadPDF();
//   }, [isDownloading]);
//   const handleDownloadPDF = () => {
//     if (!selectedDishId) return;
//     const reportContainer = document.createElement('div');
//     reportContainer.style.width = '800px';
//     reportContainer.style.padding = '20px';
//     reportContainer.style.background = 'white';
//     reportContainer.style.fontFamily = 'Arial, sans-serif';
//     reportContainer.style.fontSize = '12px';
//     reportContainer.style.color = 'black';
//     reportContainer.style.textAlign = 'center';
//     const headerWrapper = document.createElement('div');
//     headerWrapper.style.padding = '6px';
//     headerWrapper.style.border = '1px solid #0D47A1';
//     headerWrapper.style.textAlign = 'center';
//     headerWrapper.style.color = 'black';

//     const centerInfo = document.createElement('div');
//     centerInfo.innerHTML = `
//       <h1 style="margin:0; font-weight:800; font-size:28px; color:black;">
//         ${user?.fullname || 'Caterer Name'}
//       </h1>
//       <div style="background:#0D47A1; height:2px; margin:4px auto; width:80%;"></div>
//       <p style="margin:0; font-size:14px; font-weight:bold; color:black;">
//         ${user?.address || ''}<br/>
//         ${user?.email ? `Email - ${user?.email}<br/>` : ''}Ph: ${user?.phoneNumber || ''}
//       </p>
//     `;
//     headerWrapper.appendChild(centerInfo);
//     reportContainer.appendChild(headerWrapper);

//     // === Title ===
//     const titleWrapper = document.createElement('div');
//     titleWrapper.style.marginTop = '5px';
//     titleWrapper.style.textAlign = 'center';
//     titleWrapper.innerHTML = `
//       <h2 style="font-size:18px; font-weight:bold; margin:4px 0; color:black;">
//         Dish Raw Material Report
//       </h2>
//       <div style="margin-bottom: 4px; color:black;">
//         <span style="display: inline-block; margin: 0 8px;"><strong>Dish Name:</strong> ${dish?.name}</span>
//         <span style="display: inline-block; margin: 0 8px;"><strong>Dish Kg:</strong> ${totalQty}</span>
//       </div>
//     `;
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

//     dish?.rawMaterials?.forEach((rm: any, idx: number) => {
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
//       <div className="w-full max-w-3xl overflow-hidden rounded bg-white shadow-lg dark:bg-boxdark-2">
//         <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-4 py-6 sm:px-6">
//           <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
//             <h2 className="text-lg font-bold text-white sm:text-xl">
//               {dish?.name}
//             </h2>
//             <div className="flex flex-col items-center gap-2 sm:flex-row">
//               <label className="font-medium text-white">Dish Quantity:</label>
//               <input
//                 type="number"
//                 value={totalQty.toFixed(3)}
//                 disabled
//                 className="w-19 rounded bg-white bg-opacity-20 px-2 py-1 font-semibold text-white outline-none backdrop-blur-sm"
//               />
//               <button
//                 onClick={() => {
//                   handleDownloadPDF;
//                   setIsDownloading(true);
//                 }}
//                 className="rounded bg-green-500 px-4 py-1 text-white transition-colors hover:bg-green-600"
//               >
//                 Download PDF
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Main Content Area */}
//         <div className="max-h-[70vh] overflow-auto px-4 pb-4">
//           {/* Table showing raw material data */}
//           <div className="mt-4 overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="bg-gray-200 dark:bg-boxdark-2">
//                   <th className="p-2">Raw Material</th>
//                   <th className="p-2">Quantity</th>
//                   <th className="p-2">Unit</th>
//                   <th className="p-2">Process</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {localDish?.rawMaterials?.map((rm: any, index: number) => (
//                   <tr
//                     key={index}
//                     className={`text-center ${rm.quantity === 0 ? 'text-red-500' : ''}`}
//                   >
//                     <td className="p-1">{rm.rawMaterial}</td>

//                     <td className="p-1">
//                       <input
//                         type="number"
//                         value={
//                           rm.quantity % 1 === 0
//                             ? rm.quantity
//                             : Number(rm.quantity).toFixed(1)
//                         }
//                         onChange={(e) =>
//                           handleLocalQuantityChange(index, e.target.value)
//                         }
//                         className={`w-[15] rounded border-[1.7px] border-stroke bg-transparent px-3 py-2 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white sm:px-2 sm:py-1 ${
//                           rm.quantity === 0
//                             ? 'border-red-500 dark:border-red-500'
//                             : ''
//                         }`}
//                       />
//                     </td>

//                     <td className="p-1">{rm.unit}</td>
//                     <td className="p-1">{rm.process || 'Select Process'}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="mt-2 flex justify-end">
//             <div className="ml-auto mt-4 flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 id="option1"
//                 className="h-4 w-4"
//                 checked={recordToThisTemplate === dish?.dishId}
//                 onChange={() => {
//                   const isChecked = recordToThisTemplate === dish?.dishId;

//                   if (isChecked) {
//                     setIsAddDish(false);
//                     setRecordToThisTemplate(null);
//                   } else {
//                     setIsAddDish(true);
//                     setRecordToThisTemplate(dish?.dishId);
//                   }
//                 }}
//               />
//               <label htmlFor="option1" className="text-sm">
//                 Add Record to this Template
//               </label>
//             </div>
//           </div>

//           <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
//             <button
//               onClick={() => {
//                 handleCancel();
//               }}
//               className="hover:bg-gray-100 rounded border border-graydark bg-transparent px-4 py-2 text-graydark dark:border-bodydark dark:text-bodydark"
//             >
//               Close
//             </button>
//             <button
//               onClick={async () => {
//                 toast.success('Saved dish details...');
//                 handleSave();
//               }}
//               className="hover:bg-primary-dark rounded bg-primary px-4 py-2 text-white disabled:opacity-50"
//             >
//               save
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NewDishPopup;

// NewDishPopup.tsx
/*eslint-disable*/
import {useAuthContext} from '@/context/AuthContext';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {usePredictRawMaterials} from '@/lib/react-query/queriesAndMutations/cateror/dish';

export type RawMaterialType = {
  rawId: string;
  rawName: string;
  unit: string;
  quantity: number;
  process: string;
  rawMaterial?: string; // Added for compatibility
};

export type DishType = {
  dishId: string;
  name: string;
  portionSize: number;
  dishCat: string;
  dishCatId: string;
  people: number;
  price: number;
  unit: string;
  foodVendor: string;
  maharaj: string[];
  rawMaterialCalculation: boolean;
  rawMaterials: RawMaterialType[];
};

export type Props = {
  allDishes: DishType[];
  setAllDishes: React.Dispatch<React.SetStateAction<DishType[]>>;
  selectedDishId: string | null;
  setSelectedDishId: React.Dispatch<React.SetStateAction<string | null>>;
  recordToThisTemplate: string | null;
  setRecordToThisTemplate: React.Dispatch<React.SetStateAction<string | null>>;
  isadddish: boolean;
  setIsAddDish: React.Dispatch<React.SetStateAction<boolean>>;
  onDishSaved?: (dishId: string) => void;
};

const NewDishPopup: React.FC<Props> = ({
  allDishes,
  setAllDishes,
  setSelectedDishId,
  selectedDishId,
  isadddish,
  setIsAddDish,
  recordToThisTemplate,
  setRecordToThisTemplate,
  onDishSaved,
}) => {
  const {user} = useAuthContext();
  const {mutateAsync: predictRawMaterialByDish, isPending: isPredicting} =
    usePredictRawMaterials();
  const [isDownloading, setIsDownloading] = useState(false);
  const predictionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!setSelectedDishId) return null;

  const dish = allDishes.find((d) => d.dishId === selectedDishId);
  const totalQty = ((dish?.portionSize ?? 0) * (dish?.people ?? 0)).toFixed(3);

  const [localDish, setLocalDish] = useState<DishType | null>(null);

  // Initialize local dish when selectedDishId changes
  useEffect(() => {
    if (!dish) {
      setLocalDish(null);
      return;
    }

    setLocalDish({
      ...dish,
      rawMaterials: dish.rawMaterials.map((rm) => ({...rm})),
    });
  }, [selectedDishId, dish?.portionSize, dish?.people]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (predictionTimeoutRef.current) {
        clearTimeout(predictionTimeoutRef.current);
      }
    };
  }, []);

  // Trigger prediction when portion or people changes
  const triggerPrediction = useCallback(() => {
    if (predictionTimeoutRef.current) {
      clearTimeout(predictionTimeoutRef.current);
    }

    predictionTimeoutRef.current = setTimeout(async () => {
      if (!localDish?.dishId || !localDish.portionSize || !localDish.people)
        return;

      try {
        const response = await predictRawMaterialByDish({
          dishId: localDish.dishId,
          people: localDish.people,
          kg: localDish.portionSize * localDish.people,
        });

        // Update local dish with new raw materials
        setLocalDish((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            rawMaterials: response.rawMaterials || [],
          };
        });

        // Update global dishes state
        setAllDishes((prev) =>
          prev.map((d) =>
            d.dishId === localDish.dishId
              ? {...d, rawMaterials: response.rawMaterials || []}
              : d,
          ),
        );

        toast.success('Raw materials updated based on new quantities');
      } catch (error) {
        console.error('Prediction error in popup:', error);
        toast.error('Failed to update raw materials');
      }
    }, 1500); // 1.5 second delay for better UX
  }, [
    localDish?.dishId,
    localDish?.portionSize,
    localDish?.people,
    predictRawMaterialByDish,
    setAllDishes,
  ]);

  // Watch for changes in portionSize and people from parent
  useEffect(() => {
    if (dish?.portionSize && dish?.people && dish?.dishId) {
      triggerPrediction();
    }
  }, [dish?.portionSize, dish?.people, triggerPrediction]);

  const handleLocalQuantityChange = (index: number, value: string) => {
    setLocalDish((prev) => {
      if (!prev) return prev;

      const updatedRawMaterials = prev.rawMaterials.map((rm, i) =>
        i === index ? {...rm, quantity: Number(value)} : rm,
      );

      return {
        ...prev,
        rawMaterials: updatedRawMaterials,
      };
    });
  };

  const handlePortionSizeChange = (value: number) => {
    setLocalDish((prev) => {
      if (!prev) return prev;
      const newDish = {...prev, portionSize: value};
      // Update parent state
      setAllDishes((current) =>
        current.map((d) => (d.dishId === newDish.dishId ? newDish : d)),
      );
      return newDish;
    });
  };

  const handlePeopleChange = (value: number) => {
    setLocalDish((prev) => {
      if (!prev) return prev;
      const newDish = {...prev, people: value};
      // Update parent state
      setAllDishes((current) =>
        current.map((d) => (d.dishId === newDish.dishId ? newDish : d)),
      );
      return newDish;
    });
  };

  const handleSave = () => {
    if (!localDish) return;

    // Update parent state with local changes
    setAllDishes((prev) =>
      prev.map((dish) => (dish.dishId === localDish.dishId ? localDish : dish)),
    );
    // ──── NEW ────
    if (onDishSaved) {
      onDishSaved(localDish.dishId);
    }
    // ─────────────

    setSelectedDishId(null);
    toast.success('Dish details saved successfully');
  };

  const handleCancel = () => {
    setLocalDish(null);
    setSelectedDishId(null);
  };

  // Download PDF logic (keeping your existing code)
  useEffect(() => {
    if (!isDownloading) return;
    handleDownloadPDF();
  }, [isDownloading]);

  const handleDownloadPDF = () => {
    if (!selectedDishId) return;
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
        <span style="display: inline-block; margin: 0 8px;"><strong>Dish Name:</strong> ${dish?.name}</span>
        <span style="display: inline-block; margin: 0 8px;"><strong>Dish Kg:</strong> ${totalQty}</span>
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

    dish?.rawMaterials?.forEach((rm: any, idx: number) => {
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

  if (!localDish) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-75">
        <div className="w-full max-w-md rounded bg-white p-6 shadow-lg dark:bg-boxdark-2">
          <p className="text-gray-600 text-center">Loading dish details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-75">
      <div className="w-full max-w-3xl overflow-hidden rounded bg-white shadow-lg dark:bg-boxdark-2">
        <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-4 py-6 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <h2 className="text-lg font-bold text-white sm:text-xl">
              {localDish?.name}
            </h2>
            <div className="flex flex-col items-center gap-2 sm:flex-row">
              <label className="text-xs font-medium text-white">
                Portion Size:
              </label>
              <input
                type="number"
                value={localDish.portionSize || 0}
                onChange={(e) =>
                  handlePortionSizeChange(parseFloat(e.target.value) || 0)
                }
                className="w-20 rounded bg-white bg-opacity-20 px-2 py-1 font-semibold text-white outline-none backdrop-blur-sm"
                min="0"
                step="0.01"
                disabled={isPredicting}
              />

              <label className="ml-4 text-xs font-medium text-white">
                People:
              </label>
              <input
                type="number"
                value={localDish.people || 0}
                onChange={(e) =>
                  handlePeopleChange(parseFloat(e.target.value) || 0)
                }
                className="w-20 rounded bg-white bg-opacity-20 px-2 py-1 font-semibold text-white outline-none backdrop-blur-sm"
                min="0"
                disabled={isPredicting}
              />

              <label className="ml-4 text-xs font-medium text-white">
                Total: {totalQty} {localDish.unit}
              </label>

              <button
                onClick={() => {
                  setIsDownloading(true);
                }}
                disabled={isPredicting}
                className="ml-4 rounded bg-green-500 px-4 py-1 text-sm text-white transition-colors hover:bg-green-600 disabled:opacity-50"
              >
                {isPredicting ? 'Predicting...' : 'Download PDF'}
              </button>
            </div>
          </div>

          {isPredicting && (
            <div className="mt-2 flex justify-center">
              <div className="text-white">Updating raw materials...</div>
            </div>
          )}
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
              <tbody>
                {localDish?.rawMaterials?.map((rm: any, index: number) => (
                  <tr
                    key={index}
                    className={`text-center ${rm.quantity === 0 ? 'text-red-500' : ''}`}
                  >
                    <td className="p-1">{rm.rawName || rm.rawMaterial}</td>
                    <td className="p-1">
                      <input
                        type="number"
                        value={
                          rm.quantity % 1 === 0
                            ? rm.quantity
                            : Number(rm.quantity).toFixed(3)
                        }
                        onChange={(e) =>
                          handleLocalQuantityChange(index, e.target.value)
                        }
                        className={`w-[90px] rounded border-[1.7px] border-stroke bg-transparent px-3 py-2 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white sm:px-2 sm:py-1 ${
                          rm.quantity === 0
                            ? 'border-red-500 dark:border-red-500'
                            : ''
                        }`}
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="p-1">{rm.unit}</td>
                    <td className="p-1">{rm.process || 'Select Process'}</td>
                  </tr>
                ))}
                {localDish?.rawMaterials?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-gray-500 p-4 text-center">
                      {isPredicting
                        ? 'Calculating raw materials...'
                        : 'No raw materials available. Change portion size or people to generate prediction.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-2 flex justify-end">
            <div className="ml-auto mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="option1"
                className="h-4 w-4"
                checked={recordToThisTemplate === localDish?.dishId}
                onChange={() => {
                  const isChecked = recordToThisTemplate === localDish?.dishId;

                  if (isChecked) {
                    setIsAddDish(false);
                    setRecordToThisTemplate(null);
                  } else {
                    setIsAddDish(true);
                    setRecordToThisTemplate(localDish?.dishId);
                  }
                }}
              />
              <label htmlFor="option1" className="text-sm">
                Add Record to this Template
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              onClick={handleCancel}
              className="hover:bg-gray-100 rounded border border-graydark bg-transparent px-4 py-2 text-graydark dark:border-bodydark dark:text-bodydark"
              disabled={isPredicting}
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="hover:bg-primary-dark rounded bg-primary px-4 py-2 text-white disabled:opacity-50"
              disabled={isPredicting}
            >
              {isPredicting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDishPopup;
