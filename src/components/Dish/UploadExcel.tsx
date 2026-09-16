// /*eslint-disable*/
// import * as XLSX from 'xlsx';
// import React, {useState} from 'react';
// import {
//   useUploadDish,
//   useUploadDisposal,
//   useUploadFile,
//   useUploadUtensils,
// } from '@/lib/react-query/queriesAndMutations/cateror/dish';

// const UploadExcel = () => {
//   const [data, setData] = useState<any[]>([]);
//   const [dish, setDish] = useState<any[]>([]);
//   const [disposal, setDisposaal] = useState<any[]>([]);
//   const [utensils, setUtensils] = useState<any[]>([]);
//   const [activeTab, setActiveTab] = useState('rawMaterial');
//   const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});
//   const [fileNames, setFileNames] = useState<Record<string, string>>({});

//   const {mutateAsync: uploadFile} = useUploadFile();
//   const {mutateAsync: uploadDish} = useUploadDish();
//   const {mutateAsync: uploadDiposal} = useUploadDisposal();
//   const {mutateAsync: uploadUtensils} = useUploadUtensils();

//   const handleFileUpload = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     type: string,
//   ) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setFileNames((prev) => ({...prev, [type]: file.name}));

//     // Update status    setUploadStatus((prev) => ({...prev, [type]: 'processing'}));

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       try {
//         const binaryStr = event.target?.result;
//         if (!binaryStr) return;
//         const workbook = XLSX.read(binaryStr, {type: 'binary'});
//         const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//         const jsonData = XLSX.utils.sheet_to_json(worksheet);
//         const transFormedData = jsonData.map((each: any) => ({
//           oldName: each.Name ?? '',
//           newName: each.NewName ? each.NewName : null,
//           category: each.Category,
//         }));

//         switch (type) {
//           case 'rawMaterial':
//             setData(transFormedData);
//             break;
//           case 'dish':
//             setDish(transFormedData);
//             break;
//           case 'disposal':
//             setDisposaal(transFormedData);
//             break;
//           case 'utensils':
//             setUtensils(transFormedData);
//             break;
//         }

//         setUploadStatus((prev) => ({...prev, [type]: 'success'}));
//         setTimeout(
//           () => setUploadStatus((prev) => ({...prev, [type]: ''})),
//           3000,
//         );
//       } catch (error) {
//         setUploadStatus((prev) => ({...prev, [type]: 'error'}));
//         console.error(`Error processing ${type} file:`, error);
//       }
//     };

//     reader.onerror = () => {
//       setUploadStatus((prev) => ({...prev, [type]: 'error'}));
//     };

//     reader.readAsBinaryString(file);
//   };

//   const handleCancelFile = (type: string) => {
//     // Clear data based on type
//     switch (type) {
//       case 'rawMaterial':
//         setData([]);
//         break;
//       case 'dish':
//         setDish([]);
//         break;
//       case 'disposal':
//         setDisposaal([]);
//         break;
//       case 'utensils':
//         setUtensils([]);
//         break;
//     }

//     // Clear file name and status
//     setFileNames((prev) => ({...prev, [type]: ''}));
//     setUploadStatus((prev) => ({...prev, [type]: ''}));

//     // Reset file input
//     const fileInput = document.getElementById(
//       `${type}-file-input`,
//     ) as HTMLInputElement;
//     if (fileInput) {
//       fileInput.value = '';
//     }
//   };

//   const handleUpload = async (type: string) => {
//     try {
//       setUploadStatus((prev) => ({...prev, [type]: 'uploading'}));

//       switch (type) {
//         case 'rawMaterial':
//           await uploadFile(data);
//           break;
//         case 'dish':
//           await uploadDish(dish);
//           break;
//         case 'disposal':
//           await uploadDiposal(disposal);
//           break;
//         case 'utensils':
//           await uploadUtensils(utensils);
//           break;
//       }

//       setUploadStatus((prev) => ({...prev, [type]: 'uploaded'}));
//       setTimeout(
//         () => setUploadStatus((prev) => ({...prev, [type]: ''})),
//         3000,
//       );
//     } catch (error) {
//       setUploadStatus((prev) => ({...prev, [type]: 'error'}));
//       console.error(`Error uploading ${type}:`, error);
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'success':
//         return 'text-green-600';
//       case 'error':
//         return 'text-red-600';
//       case 'processing':
//       case 'uploading':
//         return 'text-blue-600';
//       case 'uploaded':
//         return 'text-green-600';
//       default:
//         return 'text-gray-600';
//     }
//   };

//   const getStatusText = (status: string, type: string) => {
//     switch (status) {
//       case 'success':
//         return 'File processed successfully';
//       case 'error':
//         return 'Error processing file';
//       case 'processing':
//         return 'Processing file...';
//       case 'uploading':
//         return 'Uploading data...';
//       case 'uploaded':
//         return 'Data uploaded successfully';
//       default:
//         return '';
//     }
//   };

//   const getDataLength = (type: string) => {
//     switch (type) {
//       case 'rawMaterial':
//         return data.length;
//       case 'dish':
//         return dish.length;
//       case 'disposal':
//         return disposal.length;
//       case 'utensils':
//         return utensils.length;
//       default:
//         return 0;
//     }
//   };

//   const UploadSection = ({
//     type,
//     label,
//     fileHandler,
//     uploadHandler,
//   }: {
//     type: string;
//     label: string;
//     fileHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
//     uploadHandler: () => void;
//   }) => (
//     <div
//       className={`rounded-lg border border-stroke p-6 dark:border-form-strokedark dark:bg-boxdark ${activeTab === type ? 'block' : 'hidden'}`}
//     >
//       <div className="flex flex-col gap-4">
//         <div className="flex items-center gap-4">
//           <label className="text-gray-700 block w-32 text-sm font-medium">
//             {label}
//           </label>

//           <div className="flex flex-1 items-center gap-2">
//             <label className="flex cursor-pointer items-center rounded-lg border border-blue-600 bg-white px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="mr-2 h-5 w-5"
//                 viewBox="0 0 20 20"
//                 fill="currentColor"
//               >
//                 <path
//                   fillRule="evenodd"
//                   d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//               <span className="text-sm">Select File</span>
//               <input
//                 id={`${type}-file-input`}
//                 type="file"
//                 accept=".xlsx, .xls"
//                 onChange={fileHandler}
//                 className="hidden"
//               />
//             </label>

//             {fileNames[type] && (
//               <div className="bg-gray-100 flex items-center rounded-md px-3 py-2">
//                 <span className="text-gray-700 max-w-xs truncate text-sm">
//                   {fileNames[type]}
//                 </span>
//                 <button
//                   onClick={() => handleCancelFile(type)}
//                   className="text-gray-500 ml-2 transition-colors hover:text-red-500"
//                   aria-label="Remove file"
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-4 w-4"
//                     viewBox="0 0 20 20"
//                     fill="currentColor"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 </button>
//               </div>
//             )}
//           </div>

//           <button
//             onClick={uploadHandler}
//             disabled={
//               getDataLength(type) === 0 || uploadStatus[type] === 'uploading'
//             }
//             className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300"
//           >
//             {uploadStatus[type] === 'uploading' ? (
//               <>
//                 <svg
//                   className="h-4 w-4 animate-spin text-white"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                   ></path>
//                 </svg>
//                 Uploading...
//               </>
//             ) : (
//               <>
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-4 w-4"
//                   viewBox="0 0 20 20"
//                   fill="currentColor"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//                 Upload Data
//               </>
//             )}
//           </button>
//         </div>

//         {getDataLength(type) > 0 && (
//           <div className="text-gray-600 mt-2 text-sm">
//             <span className="font-medium">{getDataLength(type)}</span> records
//             ready for upload
//           </div>
//         )}

//         {uploadStatus[type] && (
//           <div className={`text-sm ${getStatusColor(uploadStatus[type])}`}>
//             {getStatusText(uploadStatus[type], type)}
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <div className="mx-auto rounded-lg bg-white p-6 shadow-md dark:bg-boxdark dark:text-white">
//       <h2 className="text-gray-800 mb-6 text-xl font-semibold">
//         Excel Data Upload
//       </h2>

//       {/* Tab Navigation */}
//       <div className="mb-6 flex border-b border-stroke dark:border-form-strokedark">
//         {[
//           {id: 'rawMaterial', label: 'Raw Material'},
//           {id: 'dish', label: 'Dish'},
//           {id: 'disposal', label: 'Disposal'},
//           {id: 'utensils', label: 'Utensils'},
//         ].map((tab) => (
//           <button
//             key={tab.id}
//             onClick={() => setActiveTab(tab.id)}
//             className={`px-4 py-2 text-sm font-medium focus:outline-none ${
//               activeTab === tab.id
//                 ? 'border-b-2 border-blue-500 text-blue-600'
//                 : 'text-gray-500 hover:text-gray-700'
//             }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* Upload Sections */}
//       <UploadSection
//         type="rawMaterial"
//         label="Raw Material"
//         fileHandler={(e) => handleFileUpload(e, 'rawMaterial')}
//         uploadHandler={() => handleUpload('rawMaterial')}
//       />

//       <UploadSection
//         type="dish"
//         label="Dish"
//         fileHandler={(e) => handleFileUpload(e, 'dish')}
//         uploadHandler={() => handleUpload('dish')}
//       />

//       <UploadSection
//         type="disposal"
//         label="Disposal"
//         fileHandler={(e) => handleFileUpload(e, 'disposal')}
//         uploadHandler={() => handleUpload('disposal')}
//       />

//       <UploadSection
//         type="utensils"
//         label="Utensils"
//         fileHandler={(e) => handleFileUpload(e, 'utensils')}
//         uploadHandler={() => handleUpload('utensils')}
//       />
//     </div>
//   );
// };

// export default UploadExcel;

// import * as XLSX from 'xlsx';
// import React, {useEffect, useState} from 'react';
// import {
//   useGetDishCategories,
//   useGetRawMaterialCategoriesCat,
//   useUploadDish,
//   useUploadDishCat,
//   useUploadDisposal,
//   useUploadDisposalCat,
//   useUploadFile,
//   useUploadRawMaterialCat,
//   useUploadUtensils,
//   useUploadUtensilsCat,
// } from '@/lib/react-query/queriesAndMutations/cateror/dish';
// import {useGetDisposalCategories} from '@/lib/react-query/queriesAndMutations/cateror/disposal';
// import {useGetUtensilCategories} from '@/lib/react-query/queriesAndMutations/cateror/utensils';

// const UploadExcel = () => {
//   // raw material
//   const [data, setData] = useState<any[]>([]);
//   const {mutateAsync: uploadFile} = useUploadFile();
//   const [rawCategoryObject, setRawCategoryObject] = useState<
//     {name: string; id: string}[]
//   >([]);
//   const {data: categories} = useGetRawMaterialCategoriesCat();
//   const [invalidCategories, setInvalidCategories] = useState<string[]>([]);

//   //   disposal
//   const [disposal, setDisposaal] = useState<any[]>([]);
//   const {mutateAsync: uploadDiposal} = useUploadDisposal();
//   const [disposalObject, setDisposalObject] = useState<
//     {name: string; id: string}[]
//   >([]);
//   const {data: disposalCat} = useGetDisposalCategories();
//   const [invalidDisposalCat, setInvalidDisposalCat] = useState<string[]>([]);

//   // utensils
//   const [utensils, setUtensils] = useState<any[]>([]);
//   const {mutateAsync: uploadUtensils} = useUploadUtensils();
//   const [utensilsObject, setUtensilsObject] = useState<
//     {name: string; id: string}[]
//   >([]);
//   const {data: utensilsCatData} = useGetUtensilCategories();
//   const [invalidUtensilCat, setInvalidUtensilCat] = useState<string[]>([]);

//   // dish
//   const [dish, setDish] = useState<any[]>([]);
//   const {mutateAsync: uploadDish} = useUploadDish();
//   const [dishObject, setDishObject] = useState<{name: string; id: string}[]>(
//     [],
//   );
//   const {data: dishCategories} = useGetDishCategories();
//   const [invalidDishCat, setInvalidDishCat] = useState<string[]>([]);

//   //  raw material category
//   const [rawMaterialCategory, setRawMaterialCategory] = useState<any[]>([]);
//   const {mutateAsync: uploadRawMaterialCat} = useUploadRawMaterialCat();

//   //  dish category
//   const [dishCategory, setDishCategory] = useState<any[]>([]);
//   const {mutateAsync: uploadDishCat} = useUploadDishCat();

//   // disposal cat
//   const [disposalCategory, setDisposalCategory] = useState<any[]>([]);
//   const {mutateAsync: uploadDisposalCat} = useUploadDisposalCat();

//   // utensil cat
//   const [utensilsCategory, setUtensilsCategory] = useState<any[]>([]);
//   const {mutateAsync: uploadUtensilsCat} = useUploadUtensilsCat();

//   //   raw material
//   useEffect(() => {
//     if (categories) {
//       const oneCat = categories?.data?.map((each: any) => ({
//         name: each.name,
//         id: each.id,
//       }));
//       setRawCategoryObject(oneCat);
//     }
//   }, [categories]);

//   // disposal
//   useEffect(() => {
//     if (disposalCat) {
//       const oneCat = disposalCat?.data?.data?.map((each: any) => ({
//         name: each.name,
//         id: each.id,
//       }));
//       setDisposalObject(oneCat);
//     }
//   }, [disposalCat]);

//   // utensils
//   useEffect(() => {
//     if (utensilsCatData) {
//       const oneCat = utensilsCatData?.data?.map((each: any) => ({
//         name: each.name,
//         id: each.id,
//       }));
//       setUtensilsObject(oneCat);
//     }
//   }, [utensilsCatData]);

//   // dish
//   useEffect(() => {
//     if (dishCategories) {
//       const oneCat = dishCategories?.data?.categories?.map((each: any) => ({
//         name: each.name,
//         id: each.id,
//       }));
//       setDishObject(oneCat);
//     }
//   }, [dishCategories]);

//   const handleFileUploadRawMaterial = (
//     e: React.ChangeEvent<HTMLInputElement>,
//   ) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();

//     reader.onload = (event) => {
//       const binaryStr = event.target?.result;
//       if (!binaryStr) return;
//       const workbook = XLSX.read(binaryStr, {type: 'binary'});
//       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//       const jsonData = XLSX.utils.sheet_to_json(worksheet);

//       // Step 1: Extract categories from Excel
//       const uploadedCat = jsonData.map((each: any) => each.Category);

//       // Step 2: Valid category names
//       const validCategoryNames = rawCategoryObject.map((cat) => cat.name);

//       // Step 3: Find invalid
//       const invalid = uploadedCat.filter(
//         (cat) => !validCategoryNames.includes(cat),
//       );

//       if (invalid.length > 0) {
//         alert(
//           `Invalid categories found in Excel: ${invalid.join(
//             ', ',
//           )}. Please correct them before uploading.`,
//         );
//         setInvalidCategories(invalid);
//         setData([]);
//         return;
//       }

//       setInvalidCategories([]);

//       // Step 4: Build transformed data with categoryId instead of name
//       const transFormedData = jsonData.map((each: any) => {
//         // find category object
//         const matchedCat = rawCategoryObject.find(
//           (c) => c.name === each.Category,
//         );

//         return {
//           oldName: each.Name ?? '',
//           categoryId: matchedCat ? matchedCat.id : null,
//           newName: each.NewName ? each.NewName : null,
//         };
//       });

//       setData(transFormedData);
//     };
//     reader.readAsBinaryString(file);
//   };

//   const handleFileUploadRawMaterialCat = (
//     e: React.ChangeEvent<HTMLInputElement>,
//   ) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();

//     reader.onload = (event) => {
//       const binaryStr = event.target?.result;
//       if (!binaryStr) return;
//       const workbook = XLSX.read(binaryStr, {type: 'binary'});
//       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//       const jsonData = XLSX.utils.sheet_to_json(worksheet);
//       const transFormedData = jsonData.map((each: any) => ({
//         oldName: each.OldName ?? '',
//         newName: each.NewName ? each.NewName : null,
//       }));
//       setRawMaterialCategory(transFormedData);
//     };
//     reader.readAsBinaryString(file);
//   };

//   const handleFileUploadDishCat = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();

//     reader.onload = (event) => {
//       const binaryStr = event.target?.result;
//       if (!binaryStr) return;
//       const workbook = XLSX.read(binaryStr, {type: 'binary'});
//       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//       const jsonData = XLSX.utils.sheet_to_json(worksheet);
//       const transFormedData = jsonData.map((each: any) => ({
//         oldName: each.OldName ?? '',
//         newName: each.NewName ? each.NewName : null,
//       }));
//       setDishCategory(transFormedData);
//     };
//     reader.readAsBinaryString(file);
//   };

//   const handleFileUploadDish = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();

//     reader.onload = (event) => {
//       const binaryStr = event.target?.result;
//       if (!binaryStr) return;
//       const workbook = XLSX.read(binaryStr, {type: 'binary'});
//       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//       const jsonData = XLSX.utils.sheet_to_json(worksheet);

//       // Step 1: Extract categories from Excel
//       const uploadedCat = jsonData.map((each: any) => each.Category);

//       // Step 2: Valid category names
//       const validCategoryNames = dishObject.map((cat) => cat.name);

//       // Step 3: Find invalid
//       const invalid = uploadedCat.filter(
//         (cat) => !validCategoryNames.includes(cat),
//       );

//       if (invalid.length > 0) {
//         alert(
//           `Invalid categories found in Excel: ${invalid.join(
//             ', ',
//           )}. Please correct them before uploading.`,
//         );
//         setInvalidDishCat(invalid);
//         setData([]);
//         return;
//       }

//       setInvalidDishCat([]);

//       // Step 4: Build transformed data with categoryId instead of name
//       const transFormedData = jsonData.map((each: any) => {
//         // find category object
//         const matchedCat = dishObject.find((c) => c.name === each.Category);

//         return {
//           oldName: each.Name ?? '',
//           categoryId: matchedCat ? matchedCat.id : null,
//           newName: each.NewName ? each.NewName : null,
//           type: each.Type,
//           description: each.Description,
//         };
//       });

//       setDish(transFormedData);
//     };
//     reader.readAsBinaryString(file);
//   };

//   const handleFileUploadDisposal = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();

//     reader.onload = (event) => {
//       const binaryStr = event.target?.result;
//       if (!binaryStr) return;
//       const workbook = XLSX.read(binaryStr, {type: 'binary'});
//       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//       const jsonData = XLSX.utils.sheet_to_json(worksheet);

//       // Step 1: Extract categories from Excel
//       const uploadedCat = jsonData.map((each: any) => each.Category);

//       // Step 2: Valid category names
//       const validCategoryNames = disposalObject.map((cat) => cat.name);

//       // Step 3: Find invalid
//       const invalid = uploadedCat.filter(
//         (cat) => !validCategoryNames.includes(cat),
//       );

//       if (invalid.length > 0) {
//         alert(
//           `Invalid categories found in Excel: ${invalid.join(
//             ', ',
//           )}. Please correct them before uploading.`,
//         );
//         setInvalidDisposalCat(invalid);
//         setData([]);
//         return;
//       }

//       setInvalidDisposalCat([]);

//       // Step 4: Build transformed data with categoryId instead of name
//       const transFormedData = jsonData.map((each: any) => {
//         // find category object
//         const matchedCat = disposalObject.find((c) => c.name === each.Category);

//         return {
//           oldName: each.Name ?? '',
//           categoryId: matchedCat ? matchedCat.id : null,
//           newName: each.NewName ? each.NewName : null,
//         };
//       });

//       setDisposaal(transFormedData);
//     };
//     reader.readAsBinaryString(file);
//   };

//   const handleFileUploadDisposalsCat = (
//     e: React.ChangeEvent<HTMLInputElement>,
//   ) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();

//     reader.onload = (event) => {
//       const binaryStr = event.target?.result;
//       if (!binaryStr) return;
//       const workbook = XLSX.read(binaryStr, {type: 'binary'});
//       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//       const jsonData = XLSX.utils.sheet_to_json(worksheet);
//       const transFormedData = jsonData.map((each: any) => ({
//         oldName: each.OldName ?? '',
//         newName: each.NewName ? each.NewName : null,
//       }));
//       setDisposalCategory(transFormedData);
//     };
//     reader.readAsBinaryString(file);
//   };

//   const handleFileUploadUtensilsCat = (
//     e: React.ChangeEvent<HTMLInputElement>,
//   ) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();

//     reader.onload = (event) => {
//       const binaryStr = event.target?.result;
//       if (!binaryStr) return;
//       const workbook = XLSX.read(binaryStr, {type: 'binary'});
//       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//       const jsonData = XLSX.utils.sheet_to_json(worksheet);
//       const transFormedData = jsonData.map((each: any) => ({
//         oldName: each.OldName ?? '',
//         newName: each.NewName ? each.NewName : null,
//       }));
//       console.log('trans data', transFormedData);
//       setUtensilsCategory(transFormedData);
//     };
//     reader.readAsBinaryString(file);
//   };

//   console.log('utensils', utensilsCategory);

//   const handleFileUploadUtensils = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();

//     reader.onload = (event) => {
//       const binaryStr = event.target?.result;
//       if (!binaryStr) return;
//       const workbook = XLSX.read(binaryStr, {type: 'binary'});
//       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//       const jsonData = XLSX.utils.sheet_to_json(worksheet);

//       // Step 1: Extract categories from Excel
//       const uploadedCat = jsonData.map((each: any) => each.Category);

//       // Step 2: Valid category names
//       const validCategoryNames = utensilsObject.map((cat) => cat.name);

//       // Step 3: Find invalid
//       const invalid = uploadedCat.filter(
//         (cat) => !validCategoryNames.includes(cat),
//       );

//       if (invalid.length > 0) {
//         alert(
//           `Invalid categories found in Excel: ${invalid.join(
//             ', ',
//           )}. Please correct them before uploading.`,
//         );
//         setInvalidUtensilCat(invalid);
//         setData([]);
//         return;
//       }

//       setInvalidUtensilCat([]);

//       // Step 4: Build transformed data with categoryId instead of name
//       const transFormedData = jsonData.map((each: any) => {
//         // find category object
//         const matchedCat = utensilsObject.find((c) => c.name === each.Category);

//         return {
//           oldName: each.Name ?? '',
//           categoryId: matchedCat ? matchedCat.id : null,
//           newName: each.NewName ? each.NewName : null,
//         };
//       });

//       setUtensils(transFormedData);
//     };
//     reader.readAsBinaryString(file);
//   };
//   const onSubmitRawMaterial = () => {
//     uploadFile(data);
//   };

//   const onSubmitDish = () => {
//     uploadDish(dish);
//   };

//   const onSubmitDisposal = () => {
//     uploadDiposal(disposal);
//   };
//   const onSubmitUtensils = () => {
//     uploadUtensils(utensils);
//   };

//   const onSubmitRawMaterialCat = () => {
//     uploadRawMaterialCat(rawMaterialCategory);
//   };

//   const onSubmitDishCat = () => {
//     uploadDishCat(dishCategory);
//   };

//   const onSubmitUtensilsCat = () => {
//     uploadUtensilsCat(utensilsCategory);
//   };

//   const onSubmitDisposalsCat = () => {
//     uploadDisposalCat(disposalCategory);
//   };

//   return (
//     <div className="space-y-4 p-4">
//       <div className="flex gap-6">
//         <label>Raw Material</label>
//         <input
//           type="file"
//           accept=".xlsx, .xls"
//           onChange={handleFileUploadRawMaterial}
//         />

//         <div className="">
//           <button
//             onClick={onSubmitRawMaterial}
//             disabled={invalidCategories.length > 0}
//             className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
//           >
//             Upload File
//           </button>
//         </div>
//       </div>

//       <div className="flex gap-6">
//         <label>Dish</label>
//         <input
//           type="file"
//           accept=".xlsx, .xls"
//           onChange={handleFileUploadDish}
//         />

//         <div className="">
//           <button
//             onClick={onSubmitDish}
//             disabled={invalidDishCat.length > 0}
//             className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
//           >
//             Upload Dish
//           </button>
//         </div>
//       </div>

//       <div className="flex gap-6">
//         <label>Disposal</label>
//         <input
//           type="file"
//           accept=".xlsx, .xls"
//           onChange={handleFileUploadDisposal}
//           disabled={invalidDisposalCat.length > 0}
//         />

//         <div className="">
//           <button
//             onClick={onSubmitDisposal}
//             className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
//           >
//             Upload Disposal
//           </button>
//         </div>
//       </div>

//       <div className="flex gap-6">
//         <label>Utensils</label>
//         <input
//           type="file"
//           accept=".xlsx, .xls"
//           onChange={handleFileUploadUtensils}
//         />

//         <div className="">
//           <button
//             onClick={onSubmitUtensils}
//             disabled={invalidUtensilCat.length > 0}
//             className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
//           >
//             Upload Utensils
//           </button>
//         </div>
//       </div>

//       <div className="flex gap-6">
//         <label>Raw Material Category</label>
//         <input
//           type="file"
//           accept=".xlsx, .xls"
//           onChange={handleFileUploadRawMaterialCat}
//         />

//         <div className="">
//           <button
//             onClick={onSubmitRawMaterialCat}
//             className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
//           >
//             Upload Raw Material Category
//           </button>
//         </div>
//       </div>

//       <div className="flex gap-6">
//         <label>Dish Category</label>
//         <input
//           type="file"
//           accept=".xlsx, .xls"
//           onChange={handleFileUploadDishCat}
//         />

//         <div className="">
//           <button
//             onClick={onSubmitDishCat}
//             className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
//           >
//             Upload Dish Category
//           </button>
//         </div>
//       </div>

//       <div className="flex gap-6">
//         <label>Utensils Category</label>
//         <input
//           type="file"
//           accept=".xlsx, .xls"
//           onChange={handleFileUploadUtensilsCat}
//         />

//         <div className="">
//           <button
//             onClick={onSubmitUtensilsCat}
//             className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
//           >
//             Upload Utensils Category
//           </button>
//         </div>
//       </div>

//       <div className="flex gap-6">
//         <label>Disposal Category</label>
//         <input
//           type="file"
//           accept=".xlsx, .xls"
//           onChange={handleFileUploadDisposalsCat}
//         />

//         <div className="">
//           <button
//             onClick={onSubmitDisposalsCat}
//             className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
//           >
//             Upload Disposal Category
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UploadExcel;

/*eslint-disable*/
import * as XLSX from 'xlsx';
import React, {useEffect, useState} from 'react';
import {
  useGetDishCategories,
  useGetRawMaterialCategoriesCat,
  useUploadDish,
  useUploadDishCat,
  useUploadDisposal,
  useUploadDisposalCat,
  useUploadFile,
  useUploadRawMaterialCat,
  useUploadUtensils,
  useUploadUtensilsCat,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useGetDisposalCategories} from '@/lib/react-query/queriesAndMutations/cateror/disposal';
import {useGetUtensilCategories} from '@/lib/react-query/queriesAndMutations/cateror/utensils';

const UploadExcel = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('rawMaterial');

  // State for file names and upload status
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});

  // raw material
  const [data, setData] = useState<any[]>([]);
  const {mutateAsync: uploadFile} = useUploadFile();
  const [rawCategoryObject, setRawCategoryObject] = useState<
    {name: string; id: string}[]
  >([]);
  const {data: categories} = useGetRawMaterialCategoriesCat();
  const [invalidCategories, setInvalidCategories] = useState<string[]>([]);

  // disposal
  const [disposal, setDisposaal] = useState<any[]>([]);
  const {mutateAsync: uploadDiposal} = useUploadDisposal();
  const [disposalObject, setDisposalObject] = useState<
    {name: string; id: string}[]
  >([]);
  const {data: disposalCat} = useGetDisposalCategories();
  const [invalidDisposalCat, setInvalidDisposalCat] = useState<string[]>([]);

  // utensils
  const [utensils, setUtensils] = useState<any[]>([]);
  const {mutateAsync: uploadUtensils} = useUploadUtensils();
  const [utensilsObject, setUtensilsObject] = useState<
    {name: string; id: string}[]
  >([]);
  const {data: utensilsCatData} = useGetUtensilCategories();
  const [invalidUtensilCat, setInvalidUtensilCat] = useState<string[]>([]);

  // dish
  const [dish, setDish] = useState<any[]>([]);
  const {mutateAsync: uploadDish} = useUploadDish();
  const [dishObject, setDishObject] = useState<{name: string; id: string}[]>(
    [],
  );
  const {data: dishCategories} = useGetDishCategories();
  const [invalidDishCat, setInvalidDishCat] = useState<string[]>([]);

  // raw material category
  const [rawMaterialCategory, setRawMaterialCategory] = useState<any[]>([]);
  const {mutateAsync: uploadRawMaterialCat} = useUploadRawMaterialCat();

  // dish category
  const [dishCategory, setDishCategory] = useState<any[]>([]);
  const {mutateAsync: uploadDishCat} = useUploadDishCat();

  // disposal cat
  const [disposalCategory, setDisposalCategory] = useState<any[]>([]);
  const {mutateAsync: uploadDisposalCat} = useUploadDisposalCat();

  // utensil cat
  const [utensilsCategory, setUtensilsCategory] = useState<any[]>([]);
  const {mutateAsync: uploadUtensilsCat} = useUploadUtensilsCat();

  // raw material
  useEffect(() => {
    if (categories) {
      const oneCat = categories?.data?.map((each: any) => ({
        name: each.name,
        id: each.id,
      }));
      setRawCategoryObject(oneCat);
    }
  }, [categories]);

  // disposal
  useEffect(() => {
    if (disposalCat) {
      const oneCat = disposalCat?.data?.data?.map((each: any) => ({
        name: each.name,
        id: each.id,
      }));
      setDisposalObject(oneCat);
    }
  }, [disposalCat]);

  // utensils
  useEffect(() => {
    if (utensilsCatData) {
      const oneCat = utensilsCatData?.data?.map((each: any) => ({
        name: each.name,
        id: each.id,
      }));
      setUtensilsObject(oneCat);
    }
  }, [utensilsCatData]);

  // dish
  useEffect(() => {
    if (dishCategories) {
      const oneCat = dishCategories?.data?.categories?.map((each: any) => ({
        name: each.name,
        id: each.id,
      }));
      setDishObject(oneCat);
    }
  }, [dishCategories]);

  // Handle file upload for different types
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string,
    isCategory: boolean = false,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set file name
    setFileNames((prev) => ({...prev, [type]: file.name}));
    setUploadStatus((prev) => ({...prev, [type]: 'processing'}));

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const binaryStr = event.target?.result;
        if (!binaryStr) return;
        const workbook = XLSX.read(binaryStr, {type: 'binary'});
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // For category uploads
        if (isCategory) {
          const transFormedData = jsonData.map((each: any) => ({
            oldName: each.OldName ?? '',
            newName: each.NewName ? each.NewName : null,
          }));

          switch (type) {
            case 'rawMaterialCategory':
              setRawMaterialCategory(transFormedData);
              break;
            case 'dishCategory':
              setDishCategory(transFormedData);
              break;
            case 'disposalCategory':
              setDisposalCategory(transFormedData);
              break;
            case 'utensilsCategory':
              setUtensilsCategory(transFormedData);
              break;
          }

          setUploadStatus((prev) => ({...prev, [type]: 'success'}));
          return;
        }

        // For data uploads with category validation
        let categoryObject: {name: string; id: string}[] = [];
        let setInvalidFunc: React.Dispatch<React.SetStateAction<string[]>>;

        switch (type) {
          case 'rawMaterial':
            categoryObject = rawCategoryObject;
            setInvalidFunc = setInvalidCategories;
            break;
          case 'dish':
            categoryObject = dishObject;
            setInvalidFunc = setInvalidDishCat;
            break;
          case 'disposal':
            categoryObject = disposalObject;
            setInvalidFunc = setInvalidDisposalCat;
            break;
          case 'utensils':
            categoryObject = utensilsObject;
            setInvalidFunc = setInvalidUtensilCat;
            break;
          default:
            categoryObject = [];
        }

        // Validate categories
        const uploadedCat = jsonData.map((each: any) => each.Category);
        const validCategoryNames = categoryObject.map((cat) => cat.name);
        const invalid = uploadedCat.filter(
          (cat: string) => !validCategoryNames.includes(cat),
        );

        if (invalid.length > 0) {
          setUploadStatus((prev) => ({...prev, [type]: 'error'}));
          setInvalidFunc(invalid);
          setTimeout(() => {
            handleCancelFile(type);
          }, 3000);
          return;
        }

        setInvalidFunc([]);

        // Build transformed data with categoryId
        const transFormedData = jsonData.map((each: any) => {
          const matchedCat = categoryObject.find(
            (c) => c.name === each.Category,
          );

          const baseData = {
            oldName: each.Name ?? '',
            categoryId: matchedCat ? matchedCat.id : null,
            newName: each.NewName ? each.NewName : null,
          };

          // Add additional fields for dish
          if (type === 'dish') {
            return {
              ...baseData,
              type: each.Type,
              description: each.Description,
            };
          }

          return baseData;
        });

        // Set the appropriate state
        switch (type) {
          case 'rawMaterial':
            setData(transFormedData);
            break;
          case 'dish':
            setDish(transFormedData);
            break;
          case 'disposal':
            setDisposaal(transFormedData);
            break;
          case 'utensils':
            setUtensils(transFormedData);
            break;
        }

        setUploadStatus((prev) => ({...prev, [type]: 'success'}));
      } catch (error) {
        setUploadStatus((prev) => ({...prev, [type]: 'error'}));
        console.error(`Error processing ${type} file:`, error);
      }
    };

    reader.onerror = () => {
      setUploadStatus((prev) => ({...prev, [type]: 'error'}));
    };

    reader.readAsBinaryString(file);
  };

  // Handle file cancellation
  const handleCancelFile = (type: string) => {
    // Clear data based on type
    switch (type) {
      case 'rawMaterial':
        setData([]);
        setInvalidCategories([]);
        break;
      case 'dish':
        setDish([]);
        setInvalidDishCat([]);
        break;
      case 'disposal':
        setDisposaal([]);
        setInvalidDisposalCat([]);
        break;
      case 'utensils':
        setUtensils([]);
        setInvalidUtensilCat([]);
        break;
      case 'rawMaterialCategory':
        setRawMaterialCategory([]);
        break;
      case 'dishCategory':
        setDishCategory([]);
        break;
      case 'disposalCategory':
        setDisposalCategory([]);
        break;
      case 'utensilsCategory':
        setUtensilsCategory([]);
        break;
    }

    // Clear file name and status
    setFileNames((prev) => ({...prev, [type]: ''}));
    setUploadStatus((prev) => ({...prev, [type]: ''}));

    // Reset file input
    const fileInput = document.getElementById(
      `${type}-file-input`,
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Handle upload submission
  const handleUpload = async (type: string) => {
    try {
      setUploadStatus((prev) => ({...prev, [type]: 'uploading'}));

      switch (type) {
        case 'rawMaterial':
          await uploadFile(data);
          break;
        case 'dish':
          await uploadDish(dish);
          break;
        case 'disposal':
          await uploadDiposal(disposal);
          break;
        case 'utensils':
          await uploadUtensils(utensils);
          break;
        case 'rawMaterialCategory':
          await uploadRawMaterialCat(rawMaterialCategory);
          break;
        case 'dishCategory':
          await uploadDishCat(dishCategory);
          break;
        case 'disposalCategory':
          await uploadDisposalCat(disposalCategory);
          break;
        case 'utensilsCategory':
          await uploadUtensilsCat(utensilsCategory);
          break;
      }

      setUploadStatus((prev) => ({...prev, [type]: 'uploaded'}));
      setTimeout(
        () => setUploadStatus((prev) => ({...prev, [type]: ''})),
        3000,
      );
    } catch (error) {
      setUploadStatus((prev) => ({...prev, [type]: 'error'}));
      console.error(`Error uploading ${type}:`, error);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'processing':
      case 'uploading':
        return 'text-blue-600';
      case 'uploaded':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'File processed successfully';
      case 'error':
        return 'Error processing file';
      case 'processing':
        return 'Processing file...';
      case 'uploading':
        return 'Uploading data...';
      case 'uploaded':
        return 'Data uploaded successfully';
      default:
        return '';
    }
  };

  // Get data length
  const getDataLength = (type: string) => {
    switch (type) {
      case 'rawMaterial':
        return data.length;
      case 'dish':
        return dish.length;
      case 'disposal':
        return disposal.length;
      case 'utensils':
        return utensils.length;
      case 'rawMaterialCategory':
        return rawMaterialCategory.length;
      case 'dishCategory':
        return dishCategory.length;
      case 'disposalCategory':
        return disposalCategory.length;
      case 'utensilsCategory':
        return utensilsCategory.length;
      default:
        return 0;
    }
  };

  // Check if upload is disabled
  const isUploadDisabled = (type: string) => {
    return (
      getDataLength(type) === 0 ||
      uploadStatus[type] === 'uploading' ||
      uploadStatus[type] === 'processing' ||
      (type === 'rawMaterial' && invalidCategories.length > 0) ||
      (type === 'dish' && invalidDishCat.length > 0) ||
      (type === 'disposal' && invalidDisposalCat.length > 0) ||
      (type === 'utensils' && invalidUtensilCat.length > 0)
    );
  };

  // Upload section component
  const UploadSection = ({
    type,
    label,
    isCategory = false,
  }: {
    type: string;
    label: string;
    isCategory?: boolean;
  }) => (
    <div
      className={`border-gray-200 rounded-lg border bg-white p-6 shadow-sm dark:bg-meta-4 ${activeTab === type ? 'block' : 'hidden'}`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <label className="text-gray-700 block w-32 text-sm font-medium">
            {label}
          </label>

          <div className="flex flex-1 items-center gap-2">
            <label className="flex cursor-pointer items-center rounded-lg border border-blue-600 bg-white px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">Select File</span>
              <input
                id={`${type}-file-input`}
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => handleFileUpload(e, type, isCategory)}
                className="hidden"
              />
            </label>

            {fileNames[type] && (
              <div className="bg-gray-100 flex items-center rounded-md px-3 py-2">
                <span className="text-gray-700 max-w-xs truncate text-sm">
                  {fileNames[type]}
                </span>
                <button
                  onClick={() => handleCancelFile(type)}
                  className="text-gray-500 ml-2 transition-colors hover:text-red-500"
                  aria-label="Remove file"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleUpload(type)}
            disabled={isUploadDisabled(type)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300"
          >
            {uploadStatus[type] === 'uploading' ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Upload Data
              </>
            )}
          </button>
        </div>

        {getDataLength(type) > 0 && (
          <div className="text-gray-600 mt-2 text-sm">
            <span className="font-medium">{getDataLength(type)}</span> records
            ready for upload
          </div>
        )}

        {uploadStatus[type] && (
          <div className={`text-sm ${getStatusColor(uploadStatus[type])}`}>
            {getStatusText(uploadStatus[type])}
            {uploadStatus[type] === 'error' && (
              <span className="ml-1">
                {type === 'rawMaterial' &&
                  invalidCategories.length > 0 &&
                  `Invalid categories: ${invalidCategories.join(', ')}`}
                {type === 'dish' &&
                  invalidDishCat.length > 0 &&
                  `Invalid categories: ${invalidDishCat.join(', ')}`}
                {type === 'disposal' &&
                  invalidDisposalCat.length > 0 &&
                  `Invalid categories: ${invalidDisposalCat.join(', ')}`}
                {type === 'utensils' &&
                  invalidUtensilCat.length > 0 &&
                  `Invalid categories: ${invalidUtensilCat.join(', ')}`}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Tab navigation items
  const tabItems = [
    {id: 'rawMaterial', label: 'Raw Material'},
    {id: 'dish', label: 'Dish'},
    {id: 'disposal', label: 'Disposal'},
    {id: 'utensils', label: 'Utensils'},
    {id: 'rawMaterialCategory', label: 'Raw Material Categories'},
    {id: 'dishCategory', label: 'Dish Categories'},
    {id: 'disposalCategory', label: 'Disposal Categories'},
    {id: 'utensilsCategory', label: 'Utensils Categories'},
  ];

  return (
    <div className="mx-auto rounded-lg bg-white p-6 shadow-md dark:bg-meta-4 dark:text-white">
      <h2 className="text-gray-800 mb-6 text-xl font-semibold">
        Excel Data Upload
      </h2>

      {/* Tab Navigation */}
      <div className="border-gray-200 mb-6 flex flex-wrap border-b">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium focus:outline-none ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upload Sections */}
      <UploadSection type="rawMaterial" label="Raw Material" />

      <UploadSection type="dish" label="Dish" />

      <UploadSection type="disposal" label="Disposal" />

      <UploadSection type="utensils" label="Utensils" />

      <UploadSection
        type="rawMaterialCategory"
        label="Raw Material Categories"
        isCategory={true}
      />

      <UploadSection
        type="dishCategory"
        label="Dish Categories"
        isCategory={true}
      />

      <UploadSection
        type="disposalCategory"
        label="Disposal Categories"
        isCategory={true}
      />

      <UploadSection
        type="utensilsCategory"
        label="Utensils Categories"
        isCategory={true}
      />
    </div>
  );
};

export default UploadExcel;
