// /* eslint-disable */
// import {useCallback, useEffect, useState} from 'react';
// import {
//   useGetEventRawMaterial,
//   useGetSubevent,
// } from '@/lib/react-query/queriesAndMutations/cateror/event';
// import {
//   useGetVendorManpower,
//   useGetVendorManpowerRole,
// } from '@/lib/react-query/queriesAndMutations/cateror/vendorManpower';
// import {Route} from '@/routes/_app/_event/events.$id';
// import {
//   BiChevronDown,
//   BiChevronUp,
//   BiInfoCircle,
//   BiPlus,
//   BiSave,
//   BiTrash,
// } from 'react-icons/bi';
// import {zodResolver} from '@hookform/resolvers/zod';
// import {FormProvider, useForm, Controller} from 'react-hook-form';
// import {z} from 'zod';
// import {
//   useAddRawMaterialRateList,
//   useGetEventRateList,
// } from '@/lib/react-query/queriesAndMutations/cateror/rawmaterialprice';
// import {Loader} from '../Loader/Loader';
// import {useAuthContext} from '@/context/AuthContext';
// import {role} from '@/types/auth';
// import {
//   useGetAllFoodVendors,
//   useGetAllSubeventWiseDishRateList,
// } from '@/lib/react-query/queriesAndMutations/cateror/foodvendor';
// // Define schema for form validation
// const RateCalculatorSchema = z.object({
//   subEvents: z.array(
//     z.object({
//       id: z.string(),
//       name: z.string(),
//       vendorAssignments: z.array(
//         z.object({
//           vendorId: z.string().min(1, 'Vendor is required'),
//           count: z.number().min(0, 'Count must be positive'),
//           price: z.number().min(0, 'Price must be positive'),
//           roleId: z.string().min(1, 'Role is required'),
//         }),
//       ),
//       foodVendorAssignments: z
//         .array(
//           z.object({
//             foodVendorId: z.string().min(1, 'Food Vendor is required'),
//             dishId: z.string().min(1, 'Dish is required'),
//             price: z.number().min(0, 'Price must be positive'),
//           }),
//         )
//         .default([]),
//       rawMaterial: z.number().min(0, 'Raw material must be positive'),
//       extraCost: z
//         .array(
//           z.object({
//             name: z.string().min(1, 'Name is required'),
//             amount: z.number().min(0, 'Amount must be positive'),
//           }),
//         )
//         .default([]),
//       perPlatePrice: z.number().min(0, 'Per plate price must be positive'),
//       profit: z.number().min(0, 'Profit must be positive'),
//     }),
//   ),
// });

// type RateData = z.infer<typeof RateCalculatorSchema>;
// type ExtraInputs = Record<string, {name: string; price: string}>;
// type VendorInputs = Record<
//   string,
//   {vendorId: string; count: string; price: string; roleId: string}
// >;
// type FoodVendorInputs = Record<
//   string,
//   {foodVendorId: string; dishId: string; price: string}
// >;

// const EventRateListNew = () => {
//   const {id: EventId} = Route.useParams();
//   const {user} = useAuthContext();
//   const caterorId = user?.caterorId;
//   const {data: subEvent} = useGetSubevent(EventId);
//   const {data: queryData} = useGetEventRawMaterial(EventId);
//   console.log('queryData', queryData);
//   const {data: vendorData} = useGetVendorManpower();
//   const {mutate: rawMaterialRate, isPending} = useAddRawMaterialRateList();
//   const {data: subEventRateList} = useGetEventRateList(EventId);
//   // console.log('subEventRateList', subEventRateList);

//   const {data: vendorRoleData} = useGetVendorManpowerRole(caterorId as string);
//   const {data: foodVendorData} = useGetAllFoodVendors();
//   const {data: subeventWiseDishRateList} =
//     useGetAllSubeventWiseDishRateList(EventId);

//   const [savingSubeventId, setSavingSubeventId] = useState<string | null>(null);
//   const [collapsedSubevents, setCollapsedSubevents] = useState<
//     Record<string, boolean>
//   >({});
//   const [extraInputs, setExtraInputs] = useState<ExtraInputs>({});
//   const [vendorInputs, setVendorInputs] = useState<VendorInputs>({});
//   const [foodVendorInputs, setFoodVendorInputs] = useState<FoodVendorInputs>(
//     {},
//   );
//   const methods = useForm<RateData>({
//     resolver: zodResolver(RateCalculatorSchema),
//     defaultValues: {
//       subEvents: [],
//     },
//   });
//   const {
//     handleSubmit,
//     watch,
//     setValue,
//     formState: {isSubmitting},
//     control,
//   } = methods;
//   const formValues = watch();

//   const calculateTotalRawMaterial = useCallback(
//     (
//       subEventId: string,
//       foodVendorAssignments: RateData['subEvents'][0]['foodVendorAssignments'] = [],
//     ) => {
//       console.log('calculateTotalRawMaterial called', {
//         subEventId,
//         foodVendorAssignments,
//       });

//       if (!queryData?.data?.subEventWiseRawMaterials) {
//         console.log('No subEventWiseRawMaterials');
//         return 0;
//       }

//       const subEventData = queryData.data.subEventWiseRawMaterials[subEventId];
//       if (!subEventData) {
//         console.log('No subEventData for', subEventId);
//         return 0;
//       }

//       let totalRawMaterialPrice = subEventData.totalPrice || 0;
//       console.log(
//         'Initial totalRawMaterialPrice from subEvent',
//         totalRawMaterialPrice,
//       );

//       const assignedDishIds = foodVendorAssignments.map(
//         (vendor) => vendor.dishId.trim(), // Trim to avoid whitespace issues
//       );
//       const uniqueDishIds = [...new Set(assignedDishIds)]; // Ensure no duplicate dish IDs
//       console.log('Unique dish IDs', uniqueDishIds);

//       const dishWiseRawMaterials = queryData.data?.dishWiseRawMaterials || {};
//       console.log(
//         'Available dish IDs in dishWiseRawMaterials',
//         Object.keys(dishWiseRawMaterials),
//       );

//       uniqueDishIds.forEach((dishId) => {
//         console.log('Processing dishId', dishId);
//         if (dishWiseRawMaterials[dishId]) {
//           const currentDishPrice = dishWiseRawMaterials[dishId].totalPrice || 0;
//           console.log('Subtracting dish raw material price', currentDishPrice);
//           totalRawMaterialPrice -= currentDishPrice;
//         } else {
//           console.log('No raw material data found for dishId', dishId);
//         }
//       });

//       console.log(
//         'totalRawMaterialPrice after dish subtractions',
//         totalRawMaterialPrice,
//       );

//       // Add the sum of all food vendor prices
//       const foodVendorTotal = foodVendorAssignments.reduce(
//         (sum, vendor) => sum + (Number(vendor.price) || 0),
//         0,
//       );
//       console.log('Food vendor total price', foodVendorTotal);

//       totalRawMaterialPrice += foodVendorTotal;
//       console.log('Final totalRawMaterialPrice', totalRawMaterialPrice);

//       return Math.max(totalRawMaterialPrice, 0);
//     },
//     [
//       queryData?.data?.subEventWiseRawMaterials,
//       queryData?.data?.dishWiseRawMaterials,
//     ],
//   );
//   useEffect(() => {
//     if (subEvent?.data?.subEvents) {
//       const initialSubEvents = subEvent.data.subEvents.map(
//         (subEvent: {id: string; name: string}) => {
//           const rateData = subEventRateList?.data?.event?.subEvents?.find(
//             (se: any) => se.id === subEvent.id,
//           );
//           const foodVendorAssignments =
//             rateData?.foodVendors?.map((vendor: any) => ({
//               foodVendorId: vendor.foodVendorId,
//               dishId: vendor.dishId,
//               price: vendor.rate,
//             })) || [];
//           console.log(
//             'Calling calculateTotalRawMaterial',
//             subEvent.id,
//             foodVendorAssignments,
//           );
//           const rawMaterial =
//             calculateTotalRawMaterial(subEvent.id, foodVendorAssignments) || 0;
//           console.log('rawMaterial calculated', rawMaterial);

//           const vendorAssignments =
//             rateData?.eventManpower?.map((manpower: any) => ({
//               vendorId: manpower.manpowerVendorId,
//               count: manpower.quantity,
//               price: manpower.rate,
//               roleId: manpower.manpowerRoleId,
//             })) || [];

//           return {
//             id: subEvent.id,
//             name: subEvent.name,
//             vendorAssignments,
//             foodVendorAssignments,
//             rawMaterial:
//               calculateTotalRawMaterial(subEvent.id, foodVendorAssignments) ||
//               0,
//             extraCost:
//               rateData?.extraCost?.map((extra: any) => ({
//                 name: extra.name,
//                 amount: extra.amount,
//               })) || [],
//             perPlatePrice: 0,
//             profit: rateData?.profit || 0,
//           };
//         },
//       );

//       setValue('subEvents', initialSubEvents);
//       // ... rest of the code
//     }
//   }, [subEvent, subEventRateList, setValue, queryData]);

//   const calculateVendorTotal = (subEventId: string) => {
//     const subEvent = formValues.subEvents.find((se) => se.id === subEventId);
//     if (!subEvent) return 0;

//     const manpowerTotal = subEvent.vendorAssignments.reduce(
//       (sum, vendor) => sum + vendor.count * vendor.price,
//       0,
//     );

//     // Removed foodVendorTotal to avoid double-counting (now handled in raw materials)
//     return manpowerTotal;
//   };
//   const calculateSubtotal = useCallback(
//     (subEventId: string) => {
//       const subEvent = formValues.subEvents.find((se) => se.id === subEventId);
//       if (!subEvent) return 0;

//       const vendorTotal = calculateVendorTotal(subEventId);
//       const extrasTotal = subEvent.extraCost.reduce(
//         (sum, extra) => sum + extra.amount,
//         0,
//       );

//       return subEvent.rawMaterial + vendorTotal + extrasTotal;
//     },
//     [formValues.subEvents],
//   );

//   const calculateTotal = useCallback(
//     (subEventId: string) => {
//       const subtotal = calculateSubtotal(subEventId);
//       const subEvent = formValues.subEvents.find((se) => se.id === subEventId);
//       if (!subEvent) return subtotal;
//       const profit = (subtotal * subEvent.profit) / 100;
//       return subtotal + profit;
//     },
//     [formValues.subEvents, calculateSubtotal],
//   );

//   const handleAddVendor = (subEventId: string) => {
//     const vendorInput = vendorInputs[subEventId];
//     if (
//       vendorInput.vendorId &&
//       vendorInput.count &&
//       vendorInput.price &&
//       vendorInput.roleId
//     ) {
//       const newVendorAssignment = {
//         vendorId: vendorInput.vendorId,
//         count: Number(vendorInput.count) || 0,
//         price: Number(vendorInput.price) || 0,
//         roleId: vendorInput.roleId,
//       };

//       const updatedSubEvents = formValues.subEvents.map((subEvent) => {
//         if (subEvent.id === subEventId) {
//           return {
//             ...subEvent,
//             vendorAssignments: [
//               ...subEvent.vendorAssignments,
//               newVendorAssignment,
//             ],
//           };
//         }
//         return subEvent;
//       });

//       setValue('subEvents', updatedSubEvents);
//       setVendorInputs((prev) => ({
//         ...prev,
//         [subEventId]: {vendorId: '', count: '', price: '', roleId: ''},
//       }));
//     }
//   };

//   const handleRemoveVendor = (subEventId: string, index: number) => {
//     const updatedSubEvents = formValues.subEvents.map((subEvent) => {
//       if (subEvent.id === subEventId) {
//         const newVendorAssignments = [...subEvent.vendorAssignments];
//         newVendorAssignments.splice(index, 1);
//         return {
//           ...subEvent,
//           vendorAssignments: newVendorAssignments,
//         };
//       }
//       return subEvent;
//     });

//     setValue('subEvents', updatedSubEvents);
//   };

//   const handleAddFoodVendor = (subEventId: string) => {
//     console.log('subEventId', subEventId);
//     console.log('foodVendorInputs', foodVendorInputs);

//     const foodVendorInput = foodVendorInputs[subEventId];
//     if (
//       foodVendorInput.foodVendorId &&
//       foodVendorInput.dishId &&
//       foodVendorInput.price
//     ) {
//       const newFoodVendorAssignment = {
//         foodVendorId: foodVendorInput.foodVendorId,
//         dishId: foodVendorInput.dishId,
//         price: Number(foodVendorInput.price) || 0,
//       };

//       const updatedSubEvents = formValues.subEvents.map((subEvent) => {
//         if (subEvent.id === subEventId) {
//           return {
//             ...subEvent,
//             foodVendorAssignments: [
//               ...(subEvent.foodVendorAssignments || []),
//               newFoodVendorAssignment,
//             ],
//           };
//         }
//         return subEvent;
//       });

//       setValue('subEvents', updatedSubEvents);
//       setFoodVendorInputs((prev) => ({
//         ...prev,
//         [subEventId]: {foodVendorId: '', dishId: '', price: ''},
//       }));

//       // Update rawMaterial in form after adding
//       const updatedFormValues = methods.getValues();
//       const subEventIndex = updatedFormValues.subEvents.findIndex(
//         (se) => se.id === subEventId,
//       );
//       const newFoodAssignments =
//         updatedFormValues.subEvents[subEventIndex].foodVendorAssignments;
//       const newRawMaterial = calculateTotalRawMaterial(
//         subEventId,
//         newFoodAssignments,
//       );
//       setValue(`subEvents.${subEventIndex}.rawMaterial`, newRawMaterial);

//       // Console the total final amount
//       const totalFinalAmount = calculateTotal(subEventId);
//       console.log('total final amount', totalFinalAmount);
//     }
//   };

//   const handleRemoveFoodVendor = (subEventId: string, index: number) => {
//     const updatedSubEvents = formValues.subEvents.map((subEvent) => {
//       if (subEvent.id === subEventId) {
//         const newFoodVendorAssignments = [
//           ...(subEvent.foodVendorAssignments || []),
//         ];
//         newFoodVendorAssignments.splice(index, 1);
//         return {
//           ...subEvent,
//           foodVendorAssignments: newFoodVendorAssignments,
//         };
//       }
//       return subEvent;
//     });

//     setValue('subEvents', updatedSubEvents);

//     // Update rawMaterial in form after removing
//     const updatedFormValues = methods.getValues();
//     const subEventIndex = updatedFormValues.subEvents.findIndex(
//       (se) => se.id === subEventId,
//     );
//     const newFoodAssignments =
//       updatedFormValues.subEvents[subEventIndex].foodVendorAssignments;
//     const newRawMaterial = calculateTotalRawMaterial(
//       subEventId,
//       newFoodAssignments,
//     );
//     setValue(`subEvents.${subEventIndex}.rawMaterial`, newRawMaterial);

//     // Console the total final amount
//     const totalFinalAmount = calculateTotal(subEventId);
//     console.log('total final amount', totalFinalAmount);
//   };

//   const handleAddExtra = (subEventId: string) => {
//     const extraInput = extraInputs[subEventId];
//     if (extraInput.name && extraInput.price) {
//       const newExtra = {
//         name: extraInput.name,
//         amount: Number(extraInput.price) || 0,
//       };

//       const updatedSubEvents = formValues.subEvents.map((subEvent) => {
//         if (subEvent.id === subEventId) {
//           return {
//             ...subEvent,
//             extraCost: [...subEvent.extraCost, newExtra],
//           };
//         }
//         return subEvent;
//       });

//       setValue('subEvents', updatedSubEvents);
//       setExtraInputs((prev) => ({
//         ...prev,
//         [subEventId]: {name: '', price: ''},
//       }));
//     }
//   };

//   const handleRemoveExtra = (subEventId: string, index: number) => {
//     const updatedSubEvents = formValues.subEvents.map((subEvent) => {
//       if (subEvent.id === subEventId) {
//         const newExtraCost = [...subEvent.extraCost];
//         newExtraCost.splice(index, 1);
//         return {
//           ...subEvent,
//           extraCost: newExtraCost,
//         };
//       }
//       return subEvent;
//     });

//     setValue('subEvents', updatedSubEvents);
//   };

//   const toggleCollapse = (subEventId: string) => {
//     setCollapsedSubevents((prev) => ({
//       ...prev,
//       [subEventId]: !prev[subEventId],
//     }));
//   };

//   const formatSubeventDataForBackend = (subEvent: RateData['subEvents'][0]) => {
//     return {
//       subEventId: subEvent.id,
//       manpower: subEvent.vendorAssignments.map((vendor) => ({
//         manpowerVendorId: vendor.vendorId,
//         manpowerRoleId: vendor.roleId,
//         quantity: vendor.count,
//         rate: vendor.price,
//       })),
//       foodVendors: (subEvent.foodVendorAssignments || []).map((vendor) => ({
//         foodVendorId: vendor.foodVendorId,
//         dishId: vendor.dishId,
//         rate: vendor.price,
//       })),
//       profit: subEvent.profit || 0,
//       perPlatePrice: subEvent.perPlatePrice || 0,
//       extraCost: subEvent.extraCost.map((item) => ({
//         name: item.name,
//         amount: item.amount,
//       })),
//       rawMaterialCost: calculateTotalRawMaterial(subEvent.id),
//     };
//   };

//   const saveSubevent = async (subEventId: string) => {
//     try {
//       setSavingSubeventId(subEventId);
//       const subEvent = formValues.subEvents.find((se) => se.id === subEventId);
//       if (!subEvent) return;

//       const formattedData = formatSubeventDataForBackend(subEvent);
//       rawMaterialRate({
//         subEventId: EventId,
//         ...formattedData,
//       });
//     } catch (error) {
//       console.error('Error saving subevent rate list:', error);
//     } finally {
//       setSavingSubeventId(null);
//     }
//   };

//   const onSubmit = async (data: RateData) => {
//     try {
//       const formattedData = data.subEvents.map(formatSubeventDataForBackend);
//       console.log('formattedData', formattedData);
//       rawMaterialRate({
//         eventId: EventId,
//         rateLists: formattedData,
//       });
//     } catch (error) {
//       console.error('Error saving rate lists:', error);
//     }
//   };

//   const getAvailableVendors = () => {
//     return vendorData || [];
//   };

//   const getAvailableVendorRoles = () => {
//     return vendorRoleData || [];
//   };

//   const getDishesForSubevent = (subEventId: string) => {
//     console.log('subeventWiseDishRateList', subeventWiseDishRateList);
//     const subEventDishes =
//       subeventWiseDishRateList?.data?.subEvents?.find(
//         (se: any) => se.subEventId === subEventId,
//       )?.dishes || [];
//     console.log('getDishesForSubevent', {subEventId, subEventDishes});
//     return subEventDishes;
//   };
//   if (isPending) {
//     return <Loader />;
//   }

//   const EditableExpenseRow = ({
//     extra,
//     index,
//     subEventId,
//     formValues,
//     setValue,
//     onRemove,
//   }: {
//     extra: any;
//     index: number;
//     subEventId: string;
//     formValues: any;
//     setValue: any;
//     onRemove: any;
//   }) => {
//     const [isEditing, setIsEditing] = useState(false);
//     const [editedValue, setEditedValue] = useState(extra.amount.toString());

//     const handleSave = () => {
//       const subEventIndex = formValues.subEvents.findIndex(
//         (se) => se.id === subEventId,
//       );
//       const updatedExtraCost = [
//         ...formValues.subEvents[subEventIndex].extraCost,
//       ];
//       updatedExtraCost[index].amount = Number(editedValue) || 0;

//       setValue(`subEvents.${subEventIndex}.extraCost`, updatedExtraCost);
//       setIsEditing(false);
//     };

//     return (
//       <tr className="border-t">
//         <td className="py-3 font-medium">{extra.name}</td>
//         <td className="py-3 text-right font-medium">
//           {isEditing ? (
//             <div className="relative">
//               <span className="text-gray-500 absolute left-3 top-2.5">₹</span>
//               <input
//                 type="number"
//                 value={editedValue}
//                 onChange={(e) => setEditedValue(e.target.value)}
//                 onBlur={handleSave}
//                 onKeyDown={(e) => e.key === 'Enter' && handleSave()}
//                 autoFocus
//                 className="w-24 rounded-md border border-stroke px-3 py-1 pl-8 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
//                 min="0"
//                 step="0.01"
//               />
//             </div>
//           ) : (
//             <span
//               className="hover:bg-gray-100 cursor-pointer rounded px-2 py-1"
//               onClick={() => {
//                 setEditedValue(extra.amount.toString());
//                 setIsEditing(true);
//               }}
//             >
//               ₹{extra.amount.toFixed(2)}
//             </span>
//           )}
//         </td>
//         <td className="py-3 text-right">
//           <button
//             onClick={() => onRemove(subEventId, index)}
//             className="text-gray-400 hover:text-red-500"
//           >
//             <BiTrash size={16} />
//           </button>
//         </td>
//       </tr>
//     );
//   };

//   return (
//     <FormProvider {...methods}>
//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="dark:bg-gray-800 mx-auto space-y-6 bg-transparent"
//       >
//         <div>
//           <div className="rounded-md bg-gradient-to-r from-blue-800 to-indigo-900 p-6 shadow-xl">
//             <div className="flex items-center justify-between">
//               <h1 className="text-xl font-bold text-white">Event Rate List</h1>
//               <div className="rounded-full bg-blue-900/50 p-2">
//                 <BiInfoCircle className="text-xl text-blue-300" />
//               </div>
//             </div>
//           </div>

//           <div className="space-y-6">
//             {formValues.subEvents.map((subEventForm) => (
//               <div
//                 key={subEventForm.id}
//                 className="overflow-hidden rounded-md bg-white shadow-md dark:bg-black"
//               >
//                 <div
//                   className="from-gray-50 to-gray-100 flex cursor-pointer items-center justify-between border-b border-stroke bg-gradient-to-r p-5 dark:border-strokedark"
//                   onClick={() => toggleCollapse(subEventForm.id)}
//                 >
//                   <div className="flex items-center">
//                     <div className="mr-4 rounded-md bg-indigo-100 px-3 py-1 font-medium text-indigo-800">
//                       {subEventForm.name}
//                     </div>
//                   </div>
//                   <div className="flex items-center">
//                     <span className="mr-4 text-lg font-bold">
//                       ₹{calculateTotal(subEventForm.id).toFixed(2)}
//                     </span>
//                     {collapsedSubevents[subEventForm.id] ? (
//                       <BiChevronDown className="text-gray-600 text-2xl" />
//                     ) : (
//                       <BiChevronUp className="text-gray-600 text-2xl" />
//                     )}
//                   </div>
//                 </div>

//                 {!collapsedSubevents[subEventForm.id] && (
//                   <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-3">
//                     <div className="space-y-6 lg:col-span-2">
//                       <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//                         <div className="rounded-r-lg border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-black">
//                           <p className="text-gray-600 text-sm">Raw Materials</p>
//                           <p className="text-xl font-bold">
//                             ₹
//                             {calculateTotalRawMaterial(
//                               subEventForm.id,
//                               subEventForm.foodVendorAssignments,
//                             ).toFixed(2)}
//                           </p>
//                         </div>
//                         <div className="rounded-r-lg border-l-4 border-green-500 bg-green-50 p-4 dark:bg-black">
//                           <p className="text-gray-600 text-sm">Vendor Costs</p>
//                           <p className="text-xl font-bold">
//                             ₹{calculateVendorTotal(subEventForm.id).toFixed(2)}
//                           </p>
//                         </div>
//                         <div className="rounded-r-lg border-l-4 border-amber-500 bg-amber-50 p-4 dark:bg-black">
//                           <p className="text-gray-600 text-sm">Extra Costs</p>
//                           <p className="text-xl font-bold">
//                             ₹
//                             {subEventForm.extraCost
//                               .reduce((sum, extra) => sum + extra.amount, 0)
//                               .toFixed(2)}
//                           </p>
//                         </div>
//                       </div>

//                       <div className="overflow-hidden rounded-md border border-stroke dark:border-strokedark">
//                         <div className="bg-gray-50 border-b border-stroke p-4 dark:border-strokedark">
//                           <h3 className="text-gray-800 font-semibold">
//                             Vendor Assignments
//                           </h3>
//                         </div>
//                         <div className="p-4">
//                           {subEventForm.vendorAssignments.length > 0 ? (
//                             <div className="overflow-x-auto">
//                               <table className="w-full text-sm">
//                                 <thead className="text-gray-600 text-left">
//                                   <tr>
//                                     <th className="pb-3 font-medium">Vendor</th>
//                                     <th className="pb-3 font-medium">Role</th>
//                                     <th className="pb-3 font-medium">
//                                       Manpower × Price
//                                     </th>
//                                     <th className="pb-3 text-right font-medium">
//                                       Total
//                                     </th>
//                                     <th className="pb-3"></th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {subEventForm.vendorAssignments.map(
//                                     (vendor, index) => (
//                                       <tr key={index} className="border-t">
//                                         <td className="py-3 font-medium">
//                                           {vendorData?.find(
//                                             (v: any) =>
//                                               v.id === vendor.vendorId,
//                                           )?.name || 'Unknown'}
//                                         </td>
//                                         <td className="py-3 font-medium">
//                                           {vendorRoleData?.find(
//                                             (v: any) => v.id === vendor.roleId,
//                                           )?.name || 'Unknown'}
//                                         </td>
//                                         <td className="py-3">
//                                           <span className="bg-gray-100 rounded px-2 py-1">
//                                             {vendor.count} × ₹{vendor.price}
//                                           </span>
//                                         </td>
//                                         <td className="py-3 text-right font-medium">
//                                           ₹
//                                           {(
//                                             vendor.count * vendor.price
//                                           ).toFixed(2)}
//                                         </td>
//                                         <td className="py-3 text-right">
//                                           <button
//                                             onClick={() =>
//                                               handleRemoveVendor(
//                                                 subEventForm.id,
//                                                 index,
//                                               )
//                                             }
//                                             className="text-gray-400 hover:text-red-500"
//                                           >
//                                             <BiTrash size={16} />
//                                           </button>
//                                         </td>
//                                       </tr>
//                                     ),
//                                   )}
//                                 </tbody>
//                               </table>
//                             </div>
//                           ) : (
//                             <div className="text-gray-500 py-8 text-center">
//                               No vendors added yet
//                             </div>
//                           )}

//                           <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-5">
//                             <select
//                               value={
//                                 vendorInputs[subEventForm.id]?.vendorId || ''
//                               }
//                               onChange={(e) =>
//                                 setVendorInputs((prev) => ({
//                                   ...prev,
//                                   [subEventForm.id]: {
//                                     ...prev[subEventForm.id],
//                                     vendorId: e.target.value,
//                                   },
//                                 }))
//                               }
//                               className="rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black dark:focus:ring-strokedark"
//                             >
//                               <option value="">Select Vendor</option>
//                               {getAvailableVendors().map((vendor: any) => (
//                                 <option key={vendor.id} value={vendor.id}>
//                                   {vendor.name}
//                                 </option>
//                               ))}
//                             </select>
//                             <select
//                               value={
//                                 vendorInputs[subEventForm.id]?.roleId || ''
//                               }
//                               onChange={(e) =>
//                                 setVendorInputs((prev) => ({
//                                   ...prev,
//                                   [subEventForm.id]: {
//                                     ...prev[subEventForm.id],
//                                     roleId: e.target.value,
//                                   },
//                                 }))
//                               }
//                               className="rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black dark:focus:ring-strokedark"
//                             >
//                               <option value="">Select Role</option>
//                               {vendorRoleData?.map((role: any) => (
//                                 <option key={role.id} value={role.id}>
//                                   {role.name}
//                                 </option>
//                               ))}
//                             </select>
//                             <input
//                               type="number"
//                               placeholder="Count"
//                               value={vendorInputs[subEventForm.id]?.count || ''}
//                               onChange={(e) =>
//                                 setVendorInputs((prev) => ({
//                                   ...prev,
//                                   [subEventForm.id]: {
//                                     ...prev[subEventForm.id],
//                                     count: e.target.value,
//                                   },
//                                 }))
//                               }
//                               className="rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black dark:focus:ring-strokedark"
//                               min="0"
//                             />
//                             <div className="relative">
//                               <span className="text-gray-500 absolute left-3 top-2.5">
//                                 ₹
//                               </span>
//                               <input
//                                 type="number"
//                                 placeholder="Price"
//                                 value={
//                                   vendorInputs[subEventForm.id]?.price || ''
//                                 }
//                                 onChange={(e) =>
//                                   setVendorInputs((prev) => ({
//                                     ...prev,
//                                     [subEventForm.id]: {
//                                       ...prev[subEventForm.id],
//                                       price: e.target.value,
//                                     },
//                                   }))
//                                 }
//                                 className="w-full rounded-md border border-stroke px-3 py-2 pl-8 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black dark:focus:ring-strokedark"
//                                 min="0"
//                                 step="0.01"
//                               />
//                             </div>
//                             <button
//                               type="button"
//                               onClick={() => handleAddVendor(subEventForm.id)}
//                               className="flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
//                             >
//                               <BiPlus size={18} className="mr-1" />
//                               Add Vendor
//                             </button>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="overflow-hidden rounded-md border border-stroke dark:border-strokedark">
//                         <div className="bg-gray-50 border-b border-stroke p-4 dark:border-strokedark">
//                           <h3 className="text-gray-800 font-semibold">
//                             Food Vendor Assignments
//                           </h3>
//                         </div>
//                         <div className="p-4">
//                           {subEventForm.foodVendorAssignments?.length > 0 ? (
//                             <div className="overflow-x-auto">
//                               <table className="w-full text-sm">
//                                 <thead className="text-gray-600 text-left">
//                                   <tr>
//                                     <th className="pb-3 font-medium">
//                                       Food Vendor
//                                     </th>
//                                     <th className="pb-3 font-medium">Dish</th>
//                                     <th className="pb-3 font-medium">Price</th>
//                                     <th className="pb-3 text-right font-medium">
//                                       Action
//                                     </th>
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {subEventForm.foodVendorAssignments.map(
//                                     (vendor, index) => (
//                                       <tr key={index} className="border-t">
//                                         <td className="py-3 font-medium">
//                                           {foodVendorData?.data?.find(
//                                             (v: any) =>
//                                               v.id === vendor.foodVendorId,
//                                           )?.name || 'Unknown'}
//                                         </td>
//                                         <td className="py-3 font-medium">
//                                           {(() => {
//                                             const dishes = getDishesForSubevent(
//                                               subEventForm.id,
//                                             );
//                                             const matchingDish = dishes.find(
//                                               (d: any) =>
//                                                 (d.dishId || d.id)?.trim() ===
//                                                 vendor.dishId.trim(),
//                                             );
//                                             console.log('Dish name lookup', {
//                                               subEventId: subEventForm.id,
//                                               vendorDishId: vendor.dishId,
//                                               availableDishIds: dishes.map(
//                                                 (d: any) => d.dishId || d.id,
//                                               ),
//                                               matchingDish,
//                                             });
//                                             return (
//                                               matchingDish?.dishName ||
//                                               matchingDish?.id ||
//                                               'Unknown'
//                                             );
//                                           })()}
//                                         </td>
//                                         <td className="py-3 font-medium">
//                                           ₹{vendor.price.toFixed(2)}
//                                         </td>
//                                         <td className="py-3 text-right">
//                                           <button
//                                             onClick={() =>
//                                               handleRemoveFoodVendor(
//                                                 subEventForm.id,
//                                                 index,
//                                               )
//                                             }
//                                             className="text-gray-400 hover:text-red-500"
//                                           >
//                                             <BiTrash size={16} />
//                                           </button>
//                                         </td>
//                                       </tr>
//                                     ),
//                                   )}
//                                 </tbody>
//                               </table>
//                             </div>
//                           ) : (
//                             <div className="text-gray-500 py-8 text-center">
//                               No food vendors added yet
//                             </div>
//                           )}

//                           <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
//                             <select
//                               value={
//                                 foodVendorInputs[subEventForm.id]
//                                   ?.foodVendorId || ''
//                               }
//                               onChange={(e) =>
//                                 setFoodVendorInputs((prev) => ({
//                                   ...prev,
//                                   [subEventForm.id]: {
//                                     ...prev[subEventForm.id],
//                                     foodVendorId: e.target.value,
//                                   },
//                                 }))
//                               }
//                               className="rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black dark:focus:ring-strokedark"
//                             >
//                               <option value="">Select Food Vendor</option>
//                               {foodVendorData?.data?.map((vendor: any) => (
//                                 <option key={vendor.id} value={vendor.id}>
//                                   {vendor.name}
//                                 </option>
//                               ))}
//                             </select>
//                             <select
//                               // value={'93ade720-2fee-4e07-9f5b-4bd1e1c44a7c'}
//                               onChange={(e) =>
//                                 setFoodVendorInputs((prev) => ({
//                                   ...prev,
//                                   [subEventForm.id]: {
//                                     ...prev[subEventForm.id],
//                                     dishId: e.target.value,
//                                   },
//                                 }))
//                               }
//                               className="rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black dark:focus:ring-strokedark"
//                               disabled={
//                                 getDishesForSubevent(subEventForm.id).length ===
//                                 0
//                               }
//                             >
//                               <option value="">
//                                 {getDishesForSubevent(subEventForm.id)
//                                   .length === 0
//                                   ? 'No dishes available'
//                                   : 'Select Dish'}
//                               </option>
//                               {getDishesForSubevent(subEventForm.id).map(
//                                 (dish: any) => (
//                                   <option
//                                     key={dish.dishId}
//                                     value={`93ade720-2fee-4e07-9f5b-4bd1e1c44a7c
// `}
//                                   >
//                                     {dish.dishName}
//                                   </option>
//                                 ),
//                               )}
//                             </select>
//                             <div className="relative">
//                               <span className="text-gray-500 absolute left-3 top-2.5">
//                                 ₹
//                               </span>
//                               <input
//                                 type="number"
//                                 placeholder="Price"
//                                 value={
//                                   foodVendorInputs[subEventForm.id]?.price || ''
//                                 }
//                                 onChange={(e) =>
//                                   setFoodVendorInputs((prev) => ({
//                                     ...prev,
//                                     [subEventForm.id]: {
//                                       ...prev[subEventForm.id],
//                                       price: e.target.value,
//                                     },
//                                   }))
//                                 }
//                                 className="w-full rounded-md border border-stroke px-3 py-2 pl-8 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black dark:focus:ring-strokedark"
//                                 min="0"
//                                 step="0.01"
//                               />
//                             </div>
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 handleAddFoodVendor(subEventForm.id)
//                               }
//                               className="flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
//                               disabled={
//                                 getDishesForSubevent(subEventForm.id).length ===
//                                 0
//                               }
//                             >
//                               <BiPlus size={18} className="mr-1" />
//                               Add Food Vendor
//                             </button>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="overflow-hidden rounded-md border border-stroke dark:border-strokedark">
//                         <div className="bg-gray-50 border-b border-stroke p-4 dark:border-strokedark">
//                           <h3 className="text-gray-800 font-semibold">
//                             Additional Expenses
//                           </h3>
//                         </div>
//                         <div className="p-4">
//                           {subEventForm.extraCost.length > 0 ? (
//                             <table className="w-full text-sm">
//                               <thead className="text-gray-600 text-left">
//                                 <tr>
//                                   <th className="pb-3 font-medium">Expense</th>
//                                   <th className="pb-3 text-right font-medium">
//                                     Amount
//                                   </th>
//                                   <th className="pb-3"></th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {subEventForm.extraCost.map((extra, index) => (
//                                   <EditableExpenseRow
//                                     key={index}
//                                     extra={extra}
//                                     index={index}
//                                     subEventId={subEventForm.id}
//                                     formValues={formValues}
//                                     setValue={setValue}
//                                     onRemove={handleRemoveExtra}
//                                   />
//                                 ))}
//                               </tbody>
//                             </table>
//                           ) : (
//                             <div className="text-gray-500 py-8 text-center">
//                               No expenses added yet
//                             </div>
//                           )}

//                           <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
//                             <input
//                               type="text"
//                               placeholder="Expense name"
//                               value={extraInputs[subEventForm.id]?.name || ''}
//                               onChange={(e) =>
//                                 setExtraInputs((prev) => ({
//                                   ...prev,
//                                   [subEventForm.id]: {
//                                     ...prev[subEventForm.id],
//                                     name: e.target.value,
//                                   },
//                                 }))
//                               }
//                               className="rounded-md border border-stroke px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black dark:focus:ring-strokedark"
//                             />
//                             <div className="relative">
//                               <span className="text-gray-500 absolute left-3 top-2.5">
//                                 ₹
//                               </span>
//                               <input
//                                 type="number"
//                                 placeholder="Amount"
//                                 value={
//                                   extraInputs[subEventForm.id]?.price || ''
//                                 }
//                                 onChange={(e) =>
//                                   setExtraInputs((prev) => ({
//                                     ...prev,
//                                     [subEventForm.id]: {
//                                       ...prev[subEventForm.id],
//                                       price: e.target.value,
//                                     },
//                                   }))
//                                 }
//                                 className="w-full rounded-md border border-stroke px-3 py-2 pl-8 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black dark:focus:ring-strokedark"
//                                 min="0"
//                                 step="0.01"
//                               />
//                             </div>
//                             <button
//                               type="button"
//                               onClick={() => handleAddExtra(subEventForm.id)}
//                               className="flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm text-white hover:bg-amber-600"
//                             >
//                               <BiPlus size={18} className="mr-1" />
//                               Add Expense
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="space-y-6">
//                       <div className="from-gray-50 to-gray-100 rounded-md border border-stroke bg-gradient-to-br p-6 dark:border-strokedark">
//                         <h3 className="text-gray-800 mb-4 font-semibold">
//                           Pricing Configuration
//                         </h3>
//                         <div className="mb-6">
//                           <div className="mb-2 flex justify-between">
//                             <label className="text-gray-700 text-sm font-medium">
//                               Profit Margin
//                             </label>
//                             <div className="flex items-center gap-2">
//                               <input
//                                 type="number"
//                                 min="0"
//                                 max="100"
//                                 value={subEventForm.profit}
//                                 onChange={(e) => {
//                                   const value = Math.min(
//                                     100,
//                                     Math.max(0, Number(e.target.value)),
//                                   );
//                                   const subEventIndex =
//                                     formValues.subEvents.findIndex(
//                                       (se) => se.id === subEventForm.id,
//                                     );
//                                   setValue(
//                                     `subEvents.${subEventIndex}.profit`,
//                                     value,
//                                   );
//                                 }}
//                                 className="w-16 rounded-md border border-stroke px-2 py-1 text-right text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 dark:border-strokedark dark:bg-black"
//                               />
//                               <span className="text-sm font-medium">%</span>
//                             </div>
//                           </div>
//                           <Controller
//                             name={`subEvents.${formValues.subEvents.findIndex(
//                               (se) => se.id === subEventForm.id,
//                             )}.profit`}
//                             control={control}
//                             render={({field}) => (
//                               <input
//                                 {...field}
//                                 type="range"
//                                 min="0"
//                                 max="100"
//                                 value={field.value}
//                                 onChange={(e) =>
//                                   field.onChange(Number(e.target.value))
//                                 }
//                                 className="h-2 w-full cursor-pointer rounded-md bg-gray accent-indigo-600 dark:bg-strokedark"
//                               />
//                             )}
//                           />
//                         </div>
//                         <div className="mb-6">
//                           <label className="text-gray-700 mb-2 block text-sm font-medium">
//                             Per Plate Price
//                           </label>
//                           <div className="relative">
//                             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
//                               <span className="text-gray-500">₹</span>
//                             </div>
//                             <input
//                               value={(() => {
//                                 const actualPeople =
//                                   subEventRateList?.data?.event?.subEvents?.find(
//                                     (se: any) => se.id === subEventForm.id,
//                                   )?.actualPeople || 0;
//                                 return actualPeople
//                                   ? (
//                                       calculateTotal(subEventForm.id) /
//                                       actualPeople
//                                     ).toFixed(2)
//                                   : (
//                                       calculateTotal(subEventForm.id) /
//                                       (subEventRateList?.data?.event?.subEvents?.find(
//                                         (se: any) => se.id === subEventForm.id,
//                                       )?.expectedPeople || 1)
//                                     ).toFixed(2);
//                               })()}
//                               readOnly
//                               className="text-gray-800 w-full rounded-md border border-stroke bg-white py-3 pl-8 pr-4 text-lg font-bold dark:border-strokedark dark:bg-black"
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       <div className="rounded-md border border-blue-100 bg-blue-50 p-5 dark:border-strokedark dark:bg-black">
//                         <h3 className="text-gray-800 mb-3 font-semibold">
//                           Summary
//                         </h3>
//                         <ul className="space-y-2 text-sm">
//                           <li className="flex justify-between">
//                             <span className="text-gray-600">
//                               Raw Materials:
//                             </span>
//                             <span>
//                               ₹
//                               {calculateTotalRawMaterial(
//                                 subEventForm.id,
//                                 subEventForm.foodVendorAssignments,
//                               ).toFixed(2)}
//                             </span>
//                           </li>
//                           <li className="flex justify-between">
//                             <span className="text-gray-600">Vendor Costs:</span>
//                             <span>
//                               ₹
//                               {calculateVendorTotal(subEventForm.id).toFixed(2)}
//                             </span>
//                           </li>
//                           <li className="flex justify-between">
//                             <span className="text-gray-600">Extra Costs:</span>
//                             <span>
//                               ₹
//                               {subEventForm.extraCost
//                                 .reduce((sum, extra) => sum + extra.amount, 0)
//                                 .toFixed(2)}
//                             </span>
//                           </li>
//                           <li className="flex justify-between border-t border-blue-100 pt-2 dark:border-strokedark">
//                             <span className="font-medium">Subtotal:</span>
//                             <span className="font-medium">
//                               ₹{calculateSubtotal(subEventForm.id).toFixed(2)}
//                             </span>
//                           </li>
//                           <li className="flex justify-between">
//                             <span className="font-medium">
//                               Profit ({subEventForm.profit}%):
//                             </span>
//                             <span className="font-medium">
//                               ₹
//                               {(
//                                 (calculateSubtotal(subEventForm.id) *
//                                   subEventForm.profit) /
//                                 100
//                               ).toFixed(2)}
//                             </span>
//                           </li>
//                           <li className="flex justify-between border-t border-blue-100 pt-2 font-bold dark:border-strokedark">
//                             <span>Total Price:</span>
//                             <span className="text-lg">
//                               ₹{calculateTotal(subEventForm.id).toFixed(2)}
//                             </span>
//                           </li>
//                         </ul>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => saveSubevent(subEventForm.id)}
//                         disabled={savingSubeventId === subEventForm.id}
//                         className="flex w-full items-center justify-center rounded-md bg-gradient-to-r from-green-600 to-emerald-700 py-3 font-medium text-white transition-all hover:from-green-700 hover:to-emerald-800"
//                       >
//                         {savingSubeventId === subEventForm.id ? (
//                           <>
//                             <svg
//                               className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
//                               xmlns="http://www.w3.org/2000/svg"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                             >
//                               <circle
//                                 className="opacity-25"
//                                 cx="12"
//                                 cy="12"
//                                 r="10"
//                                 stroke="currentColor"
//                                 strokeWidth="4"
//                               ></circle>
//                               <path
//                                 className="opacity-75"
//                                 fill="currentColor"
//                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                               ></path>
//                             </svg>
//                             Saving...
//                           </>
//                         ) : (
//                           <>
//                             <BiSave className="mr-2 text-lg" />
//                             Save Pricing
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </form>
//     </FormProvider>
//   );
// };

// export default EventRateListNew;
