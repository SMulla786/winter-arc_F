// /* eslint-disable */
// import React, {useState, useMemo, useEffect} from 'react';
// import {format, isSameDay} from 'date-fns';
// import toast from 'react-hot-toast';
// import {
//   FiCalendar,
//   FiFilter,
//   FiClock,
//   FiEdit,
//   FiSave,
//   FiX,
//   FiEye,
//   FiPlus,
//   FiMinus,
//   FiRefreshCw,
//   FiChevronDown,
//   FiShoppingCart,
// } from 'react-icons/fi';
// import {
//   useGetAllEventsWithSubEventsPO,
//   useGetEventRawMaterials,
//   useGetHistory,
//   useGetVendorsPo,
//   useSubmitEventPO,
//   useUpdateEventPo,
// } from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
// import {useQuery, useQueryClient} from '@tanstack/react-query';
// import {z} from 'zod';
// import {useNavigate} from '@tanstack/react-router';

// /* --------------------------------------------------------------
//    Zod Schemas for Validation
//    -------------------------------------------------------------- */
// export const EventPoSchema = z.object({
//   eventId: z.string().min(1, 'Event ID is required'),
//   eventName: z.string().min(1, 'Event name is required'),
//   materials: z.array(
//     z.object({
//       materialId: z.string().min(1, 'Material ID is required'),
//       materialName: z.string().min(1, 'Material name is required'),
//       vendorId: z.string().min(1, 'Vendor ID is required'),
//       vendorName: z.string().min(1, 'Vendor name is required'),
//       unit: z.string().min(1, 'Unit is required'),
//       quantity: z.number().min(0, 'Quantity must be positive'),
//       category: z.string().min(1, 'Category is required'),
//       subeventId: z.string().min(1, 'Sub-event ID is required'),
//       subeventName: z.string().min(1, 'Sub-event name is required'),
//       date: z.string().min(1, 'Date is required'),
//       time: z.string().min(1, 'Time is required'),
//       venue: z.string().min(1, 'Venue is required'),
//     }),
//   ),
// });

// /* --------------------------------------------------------------
//    Types
//    -------------------------------------------------------------- */
// interface RawMaterial {
//   id: string;
//   name: string;
//   unit: string;
//   quantity: number;
//   category: string;
//   date?: string;
//   time?: string;
//   location?: string;
//   eventId: string;
//   eventName: string;
//   subeventId: string;
//   subeventName: string;
//   subeventDate?: string;
//   vendorId?: string;
//   vendorName?: string;
//   breakdown?: QuantityBreakdown[];
// }

// interface QuantityBreakdown {
//   id: string;
//   quantity: number;
//   time: string;
//   date: string;
//   location: string;
//   vendorId?: string;
//   vendorName?: string;
// }

// interface Event {
//   id: string;
//   name: string;
//   startDate: string;
//   endDate: string;
//   subEvents: SubEvent[];
// }

// interface SubEvent {
//   id: string;
//   name: string;
//   startDate?: string;
//   startTime?: string;
// }

// interface VendorApiType {
//   id: string;
//   name: string;
// }

// interface PurchaseMaterial {
//   id: string;
//   purchaseId: string;
//   caterorId: string;
//   materialId: string;
//   quantity: number;
//   date: string;
//   listNo: number;
//   time: string;
//   venue: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface PurchaseHistory {
//   id: string;
//   listNo: number;
//   caterorId: string;
//   eventId: string;
//   createdAt: string;
//   updatedAt: string;
//   PurchaseMaterial: PurchaseMaterial[];
// }

// type ViewMode = 'events' | 'raw-materials' | 'history';

// /* --------------------------------------------------------------
//    Component
//    -------------------------------------------------------------- */
// const EventPoModule: React.FC = () => {
//   /* ---------- State ---------- */
//   const navigate = useNavigate();

//   const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
//   const [viewMode, setViewMode] = useState<ViewMode>('events');
//   const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>(
//     {},
//   );
//   const [selectedEvents, setSelectedEvents] = useState<Record<string, boolean>>(
//     {},
//   );
//   const [selectedSubEvents, setSelectedSubEvents] = useState<
//     Record<string, boolean>
//   >({});
//   const [selectedEventId, setSelectedEventId] = useState<string>('');
//   const [tableData, setTableData] = useState<RawMaterial[]>([]);
//   const [locations] = useState<string[]>(['Store', 'Venue']);
//   const [editingItem, setEditingItem] = useState<RawMaterial | null>(null);
//   const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
//   const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
//   const [tempQuantity, setTempQuantity] = useState(0);
//   const [tempSubeventDate, setTempSubeventDate] = useState('');
//   const [tempTime, setTempTime] = useState('');
//   const [tempLocation, setTempLocation] = useState('Store');
//   const [viewingItem, setViewingItem] = useState<RawMaterial | null>(null);
//   const [breakdownItem, setBreakdownItem] = useState<RawMaterial | null>(null);
//   const [breakdownQuantities, setBreakdownQuantities] = useState<
//     QuantityBreakdown[]
//   >([]);
//   const [vendorSelections, setVendorSelections] = useState<
//     Record<string, string>
//   >({});
//   const [showHistory, setShowHistory] = useState(false);
//   const [historyData, setHistoryData] = useState<PurchaseHistory[]>([]);
//   const [expandedHistoryItems, setExpandedHistoryItems] = useState<
//     Record<string, boolean>
//   >({});

//   /* ---------- Query Client for Cache Management ---------- */
//   const queryClient = useQueryClient();

//   /* ---------- API hooks ---------- */
//   const {data: eventsData, isLoading: isEventsLoading} =
//     useGetAllEventsWithSubEventsPO();

//   const {
//     data: apiData,
//     isLoading: isMaterialsLoading,
//     isSuccess,
//     isError,
//     refetch,
//   } = useGetEventRawMaterials(selectedEventId);

//   const {mutate: saveEventPO, isPending: isSubmitting} =
//     useSubmitEventPO(selectedEventId);

//   const {
//     data: historyResponse,
//     isLoading: isHistoryLoading,
//     refetch: refetchHistory,
//   } = useGetHistory();

//   const {data: vendorsResponse, isLoading: isVendorsLoading} =
//     useGetVendorsPo();

//   // Inside your EventPoModule component, add the update mutation:
//   const {mutate: updateMutation, isPending: isUpdating} = useUpdateEventPo();
//   // Default vendors in case API doesn't return data
//   const defaultVendors: VendorApiType[] = [
//     {id: '1', name: 'Fresh Foods Supplier'},
//   ];

//   const vendors: VendorApiType[] = useMemo(() => {
//     if (vendorsResponse) {
//       return Array.isArray(vendorsResponse)
//         ? vendorsResponse
//         : vendorsResponse?.data && Array.isArray(vendorsResponse.data)
//           ? vendorsResponse.data
//           : defaultVendors;
//     }
//     return defaultVendors;
//   }, [vendorsResponse]);

//   /* ---------- Refetch Data When Event Changes ---------- */
//   useEffect(() => {
//     if (selectedEventId) {
//       refetch();
//     }
//   }, [selectedEventId, refetch]);

//   /* ---------- Auto-refresh data when component mounts or data changes ---------- */
//   useEffect(() => {
//     // Auto-refresh data every 30 seconds when in raw-materials view
//     if (viewMode === 'raw-materials' && selectedEventId) {
//       const interval = setInterval(() => {
//         refetch();
//       }, 30000); // 30 seconds

//       return () => clearInterval(interval);
//     }
//   }, [viewMode, selectedEventId, refetch]);

//   /* ---------- History Handler ---------- */
//   const handleGetHistory = async () => {
//     try {
//       const result = await refetchHistory();
//       const data = result.data as any;
//       console.log('History data received:', data);

//       // Extract the data array from the response
//       const historyArray = data?.data || data || [];
//       setHistoryData(historyArray);
//       setShowHistory(true);
//       setViewMode('history');
//       toast.success('History data loaded successfully');
//     } catch (error: any) {
//       console.error('Error fetching history:', error);
//       toast.error(
//         `Failed to load history: ${error.message || 'Unknown error'}`,
//       );
//     }
//   };

//   /* ---------- Helper Functions ---------- */
//   const formatTimeForAPI = (timeString: string): string => {
//     if (timeString.includes('T')) {
//       return timeString;
//     }

//     if (timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
//       const [hours, minutes] = timeString.split(':');
//       const date = new Date();
//       date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
//       return date.toISOString();
//     }

//     console.warn(`Invalid time format: ${timeString}, using current time`);
//     return new Date().toISOString();
//   };

//   const formatDateForAPI = (dateString: string): string => {
//     if (!dateString) return new Date().toISOString().split('T')[0];

//     try {
//       return new Date(dateString).toISOString().split('T')[0];
//     } catch {
//       return new Date().toISOString().split('T')[0];
//     }
//   };

//   const safeFormat = (dateString: string, formatString: string) => {
//     if (!dateString) return 'N/A';
//     try {
//       const date = new Date(dateString);
//       return isNaN(date.getTime())
//         ? 'Invalid Date'
//         : format(date, formatString);
//     } catch {
//       return 'Invalid Date';
//     }
//   };

//   const formatTimeDisplay = (timeString: string) => {
//     if (!timeString) return 'N/A';
//     try {
//       if (timeString.includes('T')) {
//         return format(new Date(timeString), 'HH:mm');
//       }
//       // If it's already in HH:mm format
//       return timeString;
//     } catch {
//       return timeString;
//     }
//   };

//   /* ---------- Data processing ---------- */
//   const eventsArray = useMemo((): Event[] => {
//     if (!eventsData?.data) {
//       return [];
//     }

//     return eventsData.data.map((ev: any) => ({
//       ...ev,
//       subEvents: (ev.subEvents || []).map((sub: any) => ({
//         ...sub,
//         startDate: sub.startDate || ev.startDate,
//         startTime: sub.startTime || '09:00',
//       })),
//     }));
//   }, [eventsData]);

//   const dateOptions = useMemo(() => {
//     if (!eventsData?.data) return [];
//     const uniq = new Set<string>();
//     eventsData.data.forEach((ev: Event) => {
//       if (ev.startDate) uniq.add(format(new Date(ev.startDate), 'yyyy-MM-dd'));
//     });
//     return Array.from(uniq)
//       .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
//       .map((d) => ({value: d, label: format(new Date(d), 'dd/MM/yyyy')}));
//   }, [eventsData]);

//   // Process API data into table format
//   useEffect(() => {
//     try {
//       if (isSuccess && apiData && selectedEventId) {
//         let rawMaterials: any[] = [];

//         // Extract data from API response
//         if (apiData.data && Array.isArray(apiData.data)) {
//           rawMaterials = apiData.data;
//         } else if (Array.isArray(apiData)) {
//           rawMaterials = apiData;
//         } else {
//           console.warn('Unexpected API response format:', apiData);
//           setTableData([]);
//           return;
//         }

//         if (rawMaterials.length === 0) {
//           setTableData([]);
//           return;
//         }

//         // Get event info
//         const event = eventsArray.find((ev) => ev.id === selectedEventId);

//         // Process each item with your actual API field names
//         const processedData = rawMaterials.map(
//           (item: any, index: number): RawMaterial => {
//             // Extract time and date from subevent
//             const subEvent = event?.subEvents?.find(
//               (sub) => sub.id === item.subeventId,
//             );
//             const time = subEvent?.startTime || '09:00';
//             const subeventDate =
//               subEvent?.startDate || event?.startDate || startDate;

//             // Assign default vendor for each material
//             const defaultVendor = vendors[index % vendors.length];

//             const processedItem: RawMaterial = {
//               id: item.rawmaterialId || `temp-${index}-${Date.now()}`,
//               name: item.rawmaterialName || 'Unknown Material',
//               unit: item.unit || 'GRAM',
//               quantity: Number(item.quantity) || 0,
//               category: item.category || 'Uncategorized',
//               date: event?.startDate || startDate,
//               time: time,
//               subeventDate: subeventDate,
//               location: 'Store',
//               eventId: item.eventId || selectedEventId,
//               eventName: item.eventName || event?.name || 'Unknown Event',
//               subeventId: item.subeventId || '',
//               subeventName: item.subeventName || 'Unknown Sub-event',
//               vendorId: item.vendorId || defaultVendor.id,
//               vendorName: item.vendorName || defaultVendor.name,
//               breakdown: item.breakdown || [],
//             };

//             return processedItem;
//           },
//         );

//         setTableData(processedData);

//         // Initialize vendor selections
//         const initialVendorSelections: Record<string, string> = {};
//         processedData.forEach((item) => {
//           if (item.id) {
//             initialVendorSelections[item.id] = item.vendorId || '';
//           }
//         });
//         setVendorSelections(initialVendorSelections);

//         toast.success(`Loaded ${processedData.length} raw materials`);
//       } else if (selectedEventId && !isMaterialsLoading && !apiData) {
//         setTableData([]);
//         setVendorSelections({});
//       }
//     } catch (error) {
//       console.error('Error processing data:', error);
//       toast.error('Error loading materials data');
//       setTableData([]);
//     }
//   }, [
//     apiData,
//     isSuccess,
//     selectedEventId,
//     eventsArray,
//     startDate,
//     isMaterialsLoading,
//     vendors,
//   ]);
//   const filteredEvents = useMemo((): Event[] => {
//     if (!eventsArray || !startDate) return [];
//     const sel = new Date(startDate + 'T00:00:00Z');
//     return eventsArray.filter((ev) => {
//       const evStart = new Date(ev.startDate);
//       return isSameDay(evStart, sel);
//     });
//   }, [eventsArray, startDate]);

//   const selectedSubEventsCount = useMemo(
//     () => Object.values(selectedSubEvents).filter(Boolean).length,
//     [selectedSubEvents],
//   );

//   const uniqueCategories = useMemo(
//     () => Array.from(new Set(tableData.map((item) => item.category))),
//     [tableData],
//   );

//   const filteredTableData = useMemo(
//     () =>
//       tableData.filter(
//         (item) =>
//           selectedCategories.length === 0 ||
//           selectedCategories.includes(item.category),
//       ),
//     [tableData, selectedCategories],
//   );

//   /* ---------- History Table Handlers ---------- */
//   const toggleHistoryItem = (id: string) => {
//     setExpandedHistoryItems((prev) => ({
//       ...prev,
//       [id]: !prev[id],
//     }));
//   };

//   /* ---------- Category Dropdown Handlers ---------- */
//   const handleCategoryChange = (category: string) => {
//     setSelectedCategories((prev) =>
//       prev.includes(category)
//         ? prev.filter((c) => c !== category)
//         : [...prev, category],
//     );
//   };

//   const selectAllCategories = () => {
//     setSelectedCategories([...uniqueCategories]);
//   };

//   const clearAllCategories = () => {
//     setSelectedCategories([]);
//   };

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       const target = event.target as HTMLElement;
//       if (!target.closest('.category-dropdown')) {
//         setIsCategoryDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   /* ---------- Vendor Selection Handler ---------- */
//   const handleVendorChange = (materialId: string, vendorId: string) => {
//     setVendorSelections((prev) => ({
//       ...prev,
//       [materialId]: vendorId,
//     }));

//     // Update table data with vendor information
//     const selectedVendor = vendors.find((v) => v.id === vendorId);
//     if (selectedVendor) {
//       setTableData((prev) =>
//         prev.map((item) =>
//           item.id === materialId
//             ? {
//                 ...item,
//                 vendorId: selectedVendor.id,
//                 vendorName: selectedVendor.name,
//               }
//             : item,
//         ),
//       );
//     }
//   };

//   /* ---------- Event handlers ---------- */
//   useEffect(() => {
//     if (editingItem) {
//       setTempQuantity(editingItem.quantity);
//       setTempSubeventDate(editingItem.subeventDate || '');
//       setTempTime(editingItem.time || '');
//       setTempLocation(editingItem.location || 'Store');
//     }
//   }, [editingItem]);

//   const handleViewItem = (item: RawMaterial) => {
//     setViewingItem(item);
//     setBreakdownItem(null);
//   };

//   const handleBreakdownItem = (item: RawMaterial) => {
//     setBreakdownItem(item);
//     setViewingItem(null);
//     if (item.breakdown && item.breakdown.length > 0) {
//       setBreakdownQuantities([...item.breakdown]);
//     } else {
//       setBreakdownQuantities([
//         {
//           id: `breakdown-${Date.now()}`,
//           quantity: item.quantity,
//           time: item.time || '09:00',
//           date: item.subeventDate || item.date || startDate,
//           location: item.location || 'Store',
//           vendorId: item.vendorId,
//           vendorName: item.vendorName,
//         },
//       ]);
//     }
//   };

//   const handleSaveBreakdown = () => {
//     if (!breakdownItem) return;

//     const totalBreakdownQuantity = breakdownQuantities.reduce(
//       (sum, item) => sum + item.quantity,
//       0,
//     );
//     if (totalBreakdownQuantity !== breakdownItem.quantity) {
//       toast.error(
//         `Total breakdown quantity (${totalBreakdownQuantity}) must match original quantity (${breakdownItem.quantity})`,
//       );
//       return;
//     }

//     const updatedData = tableData.map((item) =>
//       item.id === breakdownItem.id
//         ? {
//             ...item,
//             breakdown: [...breakdownQuantities],
//           }
//         : item,
//     );
//     setTableData(updatedData);
//     setBreakdownItem(null);
//     setBreakdownQuantities([]);
//     toast.success('Breakdown saved successfully');
//   };

//   const addBreakdownEntry = () => {
//     setBreakdownQuantities((prev) => [
//       ...prev,
//       {
//         id: `breakdown-${Date.now()}-${prev.length}`,
//         quantity: 0,
//         time: '09:00',
//         date: breakdownItem?.subeventDate || breakdownItem?.date || startDate,
//         location: 'Store',
//         vendorId: breakdownItem?.vendorId,
//         vendorName: breakdownItem?.vendorName,
//       },
//     ]);
//   };

//   const removeBreakdownEntry = (id: string) => {
//     if (breakdownQuantities.length <= 1) {
//       toast.error('At least one breakdown entry is required');
//       return;
//     }
//     setBreakdownQuantities((prev) => prev.filter((item) => item.id !== id));
//   };

//   const updateBreakdownEntry = (
//     id: string,
//     field: keyof QuantityBreakdown,
//     value: any,
//   ) => {
//     setBreakdownQuantities((prev) =>
//       prev.map((item) => (item.id === id ? {...item, [field]: value} : item)),
//     );
//   };

//   const handleEdit = (item: any) => {
//     console.log('Editing item:', item);
//     navigate({
//       to: '/updatevent/$id',
//       params: {id: item.purchaseId},
//     });
//   };
//   /* ---------- SUBMIT DATA WITH REFETCH ---------- */
//   const handleSubmitAllData = () => {
//     if (tableData.length === 0) {
//       toast.error('No data to submit');
//       return;
//     }

//     if (!selectedEventId) {
//       toast.error('No event selected');
//       return;
//     }

//     const event = eventsArray.find((ev) => ev.id === selectedEventId);
//     if (!event) {
//       toast.error('Event not found');
//       return;
//     }

//     // Check if all materials have vendors selected
//     const materialsWithoutVendors = tableData.filter(
//       (item) => !item.vendorId || !item.vendorName,
//     );
//     if (materialsWithoutVendors.length > 0) {
//       toast.error('Please select vendors for all materials before submitting');
//       return;
//     }

//     const payload = {
//       eventId: selectedEventId,
//       eventName: event.name,
//       materials: tableData.flatMap((item) => {
//         if (item.breakdown && item.breakdown.length > 0) {
//           return item.breakdown.map((breakdown) => ({
//             materialId: item.id,
//             materialName: item.name,
//             vendorId: breakdown.vendorId || item.vendorId,
//             vendorName: breakdown.vendorName || item.vendorName,
//             unit: item.unit,
//             quantity: breakdown.quantity,
//             category: item.category,
//             subeventId: item.subeventId,
//             subeventName: item.subeventName,
//             date: formatDateForAPI(
//               breakdown.date || item.subeventDate || item.date || startDate,
//             ),
//             time: formatTimeForAPI(breakdown.time || item.time || '09:00'),
//             venue: breakdown.location || item.location || 'Store',
//           }));
//         } else {
//           return {
//             materialId: item.id,
//             materialName: item.name,
//             vendorId: item.vendorId,
//             vendorName: item.vendorName,
//             unit: item.unit,
//             quantity: item.quantity,
//             category: item.category,
//             subeventId: item.subeventId,
//             subeventName: item.subeventName,
//             date: formatDateForAPI(item.subeventDate || item.date || startDate),
//             time: formatTimeForAPI(item.time || '09:00'),
//             venue: item.location || 'Store',
//           };
//         }
//       }),
//     };

//     // Validate with Zod schema
//     try {
//       EventPoSchema.parse(payload);
//     } catch (validationError: any) {
//       console.error('Data validation failed:', validationError.errors);
//       toast.error(
//         `Validation failed: ${validationError.errors[0]?.message || 'Invalid data format'}`,
//       );
//       return;
//     }

//     // Always try UPDATE first, if it fails with 404, try CREATE
//     console.log('Attempting to update PO for event:', selectedEventId);
//     updateMutation(
//       {id: selectedEventId, data: payload},
//       {
//         onSuccess: () => {
//           toast.success('PO data updated successfully!');

//           // Invalidate and refetch the query
//           queryClient.invalidateQueries({
//             queryKey: ['eventRawMaterials', selectedEventId],
//           });

//           // Directly refetch the data
//           setTimeout(() => {
//             refetch();
//           }, 1000);
//         },
//         onError: (error: any) => {
//           console.error('❌ Error updating PO data:', error);

//           // If update fails with 404 (Purchase not found), try create instead
//           if (
//             error.response?.status === 404 ||
//             error.response?.data?.message?.includes('not found')
//           ) {
//             console.log('📝 Purchase not found, trying to create new PO...');
//             saveEventPO(payload, {
//               onSuccess: () => {
//                 toast.success('PO data created successfully!');

//                 // Invalidate and refetch the query
//                 queryClient.invalidateQueries({
//                   queryKey: ['eventRawMaterials', selectedEventId],
//                 });

//                 // Directly refetch the data
//                 setTimeout(() => {
//                   refetch();
//                 }, 1000);
//               },
//               onError: (createError: any) => {
//                 console.error('❌ Error creating PO data:', createError);

//                 // If create fails with "already exists", try update again (race condition)
//                 if (
//                   createError.response?.data?.message?.includes(
//                     'already exists',
//                   )
//                 ) {
//                   console.log('🔄 PO already exists, retrying update...');
//                   updateMutation(
//                     {id: selectedEventId, data: payload},
//                     {
//                       onSuccess: () => {
//                         toast.success('PO data updated successfully!');
//                         queryClient.invalidateQueries({
//                           queryKey: ['eventRawMaterials', selectedEventId],
//                         });
//                         setTimeout(() => {
//                           refetch();
//                         }, 1000);
//                       },
//                       onError: (retryError: any) => {
//                         console.error('❌ Error in retry update:', retryError);
//                         toast.error(
//                           `Failed to update PO data: ${retryError.message || 'Unknown error'}`,
//                         );
//                       },
//                     },
//                   );
//                 } else {
//                   toast.error(
//                     `Failed to create PO data: ${createError.message || 'Unknown error'}`,
//                   );
//                 }
//               },
//             });
//           } else {
//             // Other errors (not 404)
//             toast.error(
//               `Failed to update PO data: ${error.message || 'Unknown error'}`,
//             );
//           }
//         },
//       },
//     );
//   };
//   useEffect(() => {
//     if (!eventsArray || eventsArray.length === 0) return;

//     const evSel: Record<string, boolean> = {};
//     const subSel: Record<string, boolean> = {};

//     eventsArray.forEach((ev) => {
//       evSel[ev.id] = true;
//       ev.subEvents?.forEach((sub) => {
//         subSel[sub.id] = true;
//       });
//     });

//     setSelectedEvents(evSel);
//     setSelectedSubEvents(subSel);
//   }, [eventsArray]);

//   const toggleAccordion = (id: string) =>
//     setExpandedEvents((p) => ({...p, [id]: !p[id]}));

//   const toggleEventCheckbox = (id: string, e: React.MouseEvent) => {
//     e.stopPropagation();
//     const newVal = !selectedEvents[id];
//     const ev = eventsArray.find((e) => e.id === id);
//     if (ev) {
//       setSelectedSubEvents((p) => {
//         const upd = {...p};
//         ev.subEvents?.forEach((sub) => (upd[sub.id] = newVal));
//         return upd;
//       });
//     }
//     setSelectedEvents((p) => ({...p, [id]: newVal}));
//   };

//   const toggleSubEvent = (id: string) =>
//     setSelectedSubEvents((p) => ({...p, [id]: !p[id]}));

//   const handleGenerateReport = () => {
//     if (selectedSubEventsCount === 0) {
//       toast.error('Select at least one sub-event');
//       return;
//     }

//     const selectedEvent = eventsArray.find((ev) =>
//       ev.subEvents?.some((sub) => selectedSubEvents[sub.id]),
//     );

//     if (!selectedEvent) {
//       toast.error('No valid event found for selected sub-events');
//       return;
//     }

//     setSelectedEventId(selectedEvent.id);
//     setViewMode('raw-materials');

//     // Clear previous data and refetch
//     setTableData([]);
//     setTimeout(() => {
//       refetch();
//     }, 100);
//   };

//   /* ---------- Table columns ---------- */
//   const tableColumns: Column<RawMaterial>[] = [
//     {
//       header: 'Category',
//       accessor: 'category',
//     },
//     {
//       header: 'Material Name',
//       accessor: 'name',
//     },
//     {
//       header: 'Vendor Name',
//       accessor: 'vendorName',
//       render: (item: RawMaterial) => (
//         <select
//           value={vendorSelections[item.id] || ''}
//           onChange={(e) => handleVendorChange(item.id, e.target.value)}
//           className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//         >
//           <option value="">Select Vendor</option>
//           {vendors.map((vendor) => (
//             <option key={vendor.id} value={vendor.id}>
//               {vendor.name}
//             </option>
//           ))}
//         </select>
//       ),
//     },
//     {
//       header: 'Quantity',
//       accessor: 'quantity',
//       render: (item: RawMaterial) => (
//         <div className="space-y-2">
//           <div className="font-medium">
//             {item.quantity} {item.unit}
//           </div>
//           {item.breakdown && item.breakdown.length > 0 && (
//             <div className="text-gray-500 space-y-1 text-xs">
//               {item.breakdown.map((breakdown, index) => (
//                 <div
//                   key={breakdown.id}
//                   className="flex items-center justify-between gap-4"
//                 >
//                   <span>Part {index + 1}:</span>
//                   <span className="font-medium">
//                     {breakdown.quantity} {item.unit}
//                   </span>
//                   <span className="text-gray-400">{breakdown.time}</span>
//                   <span className="text-gray-400">
//                     {format(new Date(breakdown.date), 'dd/MM/yyyy')}
//                   </span>
//                   <span className="text-gray-400">{breakdown.location}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       ),
//     },
//     {
//       header: 'Actions',
//       accessor: 'id',
//       sortable: false,
//       render: (item: RawMaterial) => (
//         <div className="flex items-center gap-1">
//           <button
//             onClick={() => handleBreakdownItem(item)}
//             className="flex items-center gap-1 rounded bg-purple-600 px-2 py-1 text-xs text-white hover:bg-purple-700"
//             title="Breakdown Quantity"
//           >
//             <FiPlus className="h-3 w-3" />
//             Break
//           </button>
//         </div>
//       ),
//     },
//   ];

//   /* ---------- Render functions ---------- */
//   const renderEventsView = () => (
//     <>
//       <div className="mb-8 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
//           <div className="flex items-center gap-3">
//             <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-800">
//               <FiCalendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//             </div>
//             <span className="text-gray-700 dark:text-gray-300 font-medium">
//               Filter by Date:
//             </span>
//           </div>
//           <div className="flex items-center gap-2">
//             <label className="text-gray-700 dark:text-gray-300 whitespace-nowrap text-sm font-medium">
//               Date:
//             </label>
//             <div className="relative flex items-center">
//               <div className="border-gray-300 dark:border-gray-600 text-gray-900 dark:bg-gray-700 flex min-w-[140px] items-center justify-between rounded-lg border px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 dark:text-white">
//                 <select
//                   value={startDate}
//                   onChange={(e) => setStartDate(e.target.value)}
//                   className="w-full rounded bg-transparent px-3 py-1.5 text-sm outline-none transition disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//                 >
//                   {dateOptions.length ? (
//                     dateOptions.map((o) => (
//                       <option key={o.value} value={o.value}>
//                         {o.label}
//                       </option>
//                     ))
//                   ) : (
//                     <option value="">No dates</option>
//                   )}
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="space-y-4">
//         <div className="mb-4 flex items-center justify-between">
//           <h3 className="text-gray-900 text-lg font-semibold dark:text-white">
//             Events & Sub-events
//           </h3>
//           <span className="text-gray-500 dark:text-gray-400 text-sm">
//             {filteredEvents.length} events found
//           </span>
//         </div>

//         {isEventsLoading ? (
//           <div className="flex justify-center py-12">
//             <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
//           </div>
//         ) : filteredEvents.length === 0 ? (
//           <div className="py-12 text-center">
//             <FiFilter className="text-gray-400 dark:text-gray-500 mx-auto mb-4 h-12 w-12" />
//             <p className="text-gray-500 dark:text-gray-400 text-lg">
//               No events for the selected date
//             </p>
//           </div>
//         ) : (
//           filteredEvents.map((event) => (
//             <div
//               key={event.id}
//               className="bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 rounded-lg border transition hover:shadow-md"
//             >
//               <div
//                 onClick={() => toggleAccordion(event.id)}
//                 className="flex cursor-pointer items-center justify-between p-4"
//               >
//                 <div className="flex items-center gap-3">
//                   <input
//                     type="checkbox"
//                     checked={selectedEvents[event.id] ?? false}
//                     onClick={(e) => toggleEventCheckbox(event.id, e)}
//                     onChange={() => {}}
//                     className="border-gray-300 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
//                   />
//                   <div>
//                     <h4 className="text-gray-900 font-semibold dark:text-white">
//                       {event.name}
//                     </h4>
//                     <p className="text-gray-500 dark:text-gray-400 text-sm">
//                       {format(new Date(event.startDate), 'MMM dd, yyyy')}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <span className="text-gray-500 dark:text-gray-400 text-sm">
//                     {event.subEvents?.length || 0} sub-events
//                   </span>
//                   <span className="text-gray-400 dark:text-gray-500 text-xl font-bold">
//                     {expandedEvents[event.id] ? '−' : '+'}
//                   </span>
//                 </div>
//               </div>

//               {expandedEvents[event.id] &&
//                 event.subEvents &&
//                 event.subEvents.length > 0 && (
//                   <div className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-b-lg border-t">
//                     <div className="grid gap-2 p-4">
//                       {event.subEvents.map((sub) => (
//                         <label
//                           key={sub.id}
//                           className="hover:bg-gray-50 dark:hover:bg-gray-700 flex cursor-pointer items-center gap-3 rounded-lg p-3"
//                         >
//                           <input
//                             type="checkbox"
//                             checked={selectedSubEvents[sub.id] ?? false}
//                             onChange={() => toggleSubEvent(sub.id)}
//                             className="border-gray-300 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
//                           />
//                           <div className="flex-1">
//                             <span className="text-gray-700 dark:text-gray-300 block">
//                               {sub.name}
//                             </span>
//                             {sub.startTime && (
//                               <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1 text-xs">
//                                 <FiClock className="h-3 w-3" />
//                                 {sub.startTime}
//                               </span>
//                             )}
//                           </div>
//                         </label>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//             </div>
//           ))
//         )}
//       </div>

//       {filteredEvents.length > 0 && (
//         <div className="mt-8 flex justify-end">
//           <button
//             onClick={handleGenerateReport}
//             disabled={isMaterialsLoading || selectedSubEventsCount === 0}
//             className="disabled:bg-gray-400 flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed"
//           >
//             {isMaterialsLoading ? (
//               <>
//                 <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
//                 Generating...
//               </>
//             ) : (
//               <>Generate Report ({selectedSubEventsCount})</>
//             )}
//           </button>
//         </div>
//       )}

//       {isError && (
//         <div className="mt-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
//           <p className="text-center text-red-700 dark:text-red-400">
//             Failed to load data. Please check if the API endpoint is correct.
//           </p>
//         </div>
//       )}
//     </>
//   );

//   const renderRawMaterialsView = () => (
//     <div className="space-y-6">
//       <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//         <div>
//           <h2 className="text-gray-900 text-2xl font-bold dark:text-white">
//             Raw Materials
//           </h2>
//           <p className="text-gray-600 dark:text-gray-400">
//             {format(new Date(startDate), 'dd/MM/yyyy')} • {tableData.length}{' '}
//             items
//             {selectedSubEventsCount > 0 &&
//               ` • ${selectedSubEventsCount} sub-event(s)`}
//             {selectedCategories.length > 0 &&
//               ` • ${selectedCategories.length} category filter(s)`}
//           </p>
//         </div>

//         <div className="flex items-center gap-3">
//           {/* Submit Button */}

//           <button
//             onClick={handleSubmitAllData}
//             disabled={isSubmitting || isUpdating || tableData.length === 0}
//             className="disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition-colors dark:bg-primary"
//           >
//             {isSubmitting || isUpdating ? (
//               <>
//                 <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
//                 {isSubmitting ? 'Creating...' : 'Updating...'}
//               </>
//             ) : (
//               <>Save PO Data</>
//             )}
//           </button>
//         </div>
//       </div>

//       {isMaterialsLoading && (
//         <div className="flex justify-center py-8">
//           <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
//           <span className="text-gray-600 dark:text-gray-400 ml-3">
//             Loading raw materials...
//           </span>
//         </div>
//       )}

//       {!isMaterialsLoading && tableData.length > 0 && (
//         <>
//           {/* Category Filter Dropdown */}
//           <div className="category-dropdown mb-6">
//             <div className="flex items-center gap-2 sm:gap-3">
//               <span className="whitespace-nowrap font-medium text-black dark:text-white">
//                 Category:
//               </span>
//               <div className="relative w-full sm:w-auto">
//                 <button
//                   onClick={() =>
//                     setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
//                   }
//                   className="hover:bg-gray-50 flex w-full min-w-[160px] items-center justify-between gap-2 rounded-lg border border-stroke bg-white px-3 py-2 dark:border-strokedark dark:bg-form-input dark:hover:bg-meta-4 sm:min-w-[200px]"
//                 >
//                   <span className="truncate text-sm text-black dark:text-white">
//                     {selectedCategories.length === 0
//                       ? 'Select Categories'
//                       : `${selectedCategories.length} selected`}
//                   </span>
//                   <FiChevronDown
//                     className={`text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}
//                   />
//                 </button>

//                 {isCategoryDropdownOpen && (
//                   <div className="absolute left-0 top-full z-10 mt-1 w-full min-w-[160px] rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-form-input sm:w-64">
//                     <div className="border-b border-stroke p-2 dark:border-strokedark">
//                       <div className="mb-2 flex items-center justify-between">
//                         <button
//                           onClick={selectAllCategories}
//                           className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
//                         >
//                           Select All
//                         </button>
//                         <button
//                           onClick={clearAllCategories}
//                           className="text-xs text-red-600 hover:text-red-800 dark:text-red-400"
//                         >
//                           Clear All
//                         </button>
//                       </div>
//                       <div className="max-h-48 overflow-y-auto">
//                         {uniqueCategories.map((category) => (
//                           <label
//                             key={category}
//                             className="hover:bg-gray-100 flex cursor-pointer items-center gap-2 rounded p-2 dark:hover:bg-meta-4"
//                           >
//                             <input
//                               type="checkbox"
//                               checked={selectedCategories.includes(category)}
//                               onChange={() => handleCategoryChange(category)}
//                               className="rounded border-stroke text-blue-600 focus:ring-blue-500 dark:border-strokedark"
//                             />
//                             <span className="text-sm text-black dark:text-white">
//                               {category}
//                             </span>
//                           </label>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Table */}
//           <div className="mb-8">
//             <GenericTable
//               data={filteredTableData}
//               columns={tableColumns}
//               itemsPerPage={10}
//               searchAble={true}
//               action={true}
//               onView={handleViewItem}
//             />
//           </div>
//         </>
//       )}

//       {!isMaterialsLoading && tableData.length === 0 && (
//         <div className="py-12 text-center">
//           <FiFilter className="text-gray-400 dark:text-gray-500 mx-auto mb-4 h-12 w-12" />
//           <p className="text-gray-600 dark:text-gray-400">
//             No raw material data found. Please generate a report first.
//           </p>
//         </div>
//       )}

//       {!isMaterialsLoading && isError && (
//         <div className="py-12 text-center">
//           <p className="text-red-600 dark:text-red-400">
//             Error loading raw materials. Please try again.
//           </p>
//         </div>
//       )}
//     </div>
//   );

//   const renderHistoryView = () => (
//     <div className="space-y-6">
//       <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//         <div>
//           <h2 className="text-gray-900 text-2xl font-bold dark:text-white">
//             Purchase History
//           </h2>
//           <p className="text-gray-600 dark:text-gray-400">
//             View your purchase order history and material details
//           </p>
//         </div>

//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => setViewMode('events')}
//             className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
//           >
//             Back to Events
//           </button>
//         </div>
//       </div>

//       {isHistoryLoading ? (
//         <div className="flex justify-center py-12">
//           <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
//           <span className="text-gray-600 dark:text-gray-400 ml-3">
//             Loading history...
//           </span>
//         </div>
//       ) : historyData.length === 0 ? (
//         <div className="py-12 text-center">
//           <FiShoppingCart className="text-gray-400 dark:text-gray-500 mx-auto mb-4 h-12 w-12" />
//           <p className="text-gray-600 dark:text-gray-400 text-lg">
//             No purchase history found
//           </p>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {historyData.map((history) => (
//             <div
//               key={history.id}
//               className="bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 rounded-lg border transition hover:shadow-md"
//             >
//               <div
//                 onClick={() => toggleHistoryItem(history.id)}
//                 className="flex cursor-pointer items-center justify-between p-4"
//               >
//                 <div className="flex items-center gap-3">
//                   <div>
//                     <h4 className="text-gray-900 font-semibold dark:text-white">
//                       List {history.listNo}
//                     </h4>
//                     <p className="text-gray-500 dark:text-gray-400 text-sm">
//                       Created:{' '}
//                       {safeFormat(history.createdAt, 'dd/MM/yyyy HH:mm')}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <span className="text-gray-500 dark:text-gray-400 text-sm">
//                     {history.PurchaseMaterial?.length || 0} materials
//                   </span>
//                   <span className="text-gray-400 dark:text-gray-500 text-xl font-bold">
//                     {expandedHistoryItems[history.id] ? '−' : '+'}
//                   </span>
//                 </div>
//               </div>

//               {expandedHistoryItems[history.id] && (
//                 <div className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-b-lg border-t">
//                   <div className="p-4">
//                     <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
//                       <div>
//                         <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
//                           Created At
//                         </label>
//                         <p className="text-gray-900 bg-gray-50 dark:bg-gray-700 rounded p-2 text-sm dark:text-white">
//                           {safeFormat(history.createdAt, 'dd/MM/yyyy HH:mm')}
//                         </p>
//                       </div>
//                       <div>
//                         <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
//                           Updated At
//                         </label>
//                         <p className="text-gray-900 bg-gray-50 dark:bg-gray-700 rounded p-2 text-sm dark:text-white">
//                           {safeFormat(history.updatedAt, 'dd/MM/yyyy HH:mm')}
//                         </p>
//                       </div>
//                     </div>

//                     <h5 className="text-gray-900 mb-3 font-semibold dark:text-white">
//                       Purchase Materials (
//                       {history.PurchaseMaterial?.length || 0})
//                     </h5>

//                     {history.PurchaseMaterial &&
//                     history.PurchaseMaterial.length > 0 ? (
//                       <div className="overflow-x-auto">
//                         <table className="divide-gray-200 dark:divide-gray-700 min-w-full divide-y">
//                           <thead className="bg-gray-60 dark:bg-gray-700">
//                             <tr>
//                               <th className="text-gray-500 dark:text-gray-300 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
//                                 Quantity
//                               </th>
//                               <th className="text-gray-500 dark:text-gray-300 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
//                                 Date
//                               </th>
//                               <th className="text-gray-500 dark:text-gray-300 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
//                                 Time
//                               </th>
//                               <th className="text-gray-500 dark:text-gray-300 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
//                                 Venue
//                               </th>
//                               <th className="text-gray-500 dark:text-gray-300 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
//                                 Actions
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody className="divide-gray-200 dark:divide-gray-700 divide-y">
//                             {history.PurchaseMaterial.map((material) => (
//                               <tr
//                                 key={material.id}
//                                 className="hover:bg-gray-50 dark:hover:bg-gray-700"
//                               >
//                                 <td className="text-gray-900 whitespace-nowrap px-4 py-2 text-sm dark:text-white">
//                                   {material.quantity}
//                                 </td>
//                                 <td className="text-gray-500 dark:text-gray-300 whitespace-nowrap px-4 py-2 text-sm">
//                                   {safeFormat(material.date, 'dd/MM/yyyy')}
//                                 </td>
//                                 <td className="text-gray-500 dark:text-gray-300 whitespace-nowrap px-4 py-2 text-sm">
//                                   {formatTimeDisplay(material.time)}
//                                 </td>
//                                 <td className="text-gray-500 dark:text-gray-300 whitespace-nowrap px-4 py-2 text-sm">
//                                   {material.venue}
//                                 </td>
//                                 <td className="text-gray-500 dark:text-gray-300 whitespace-nowrap px-4 py-2 text-sm">
//                                   <div className="flex items-center gap-2">
//                                     <button
//                                       onClick={() => handleEdit(material)}
//                                       className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
//                                       title="Edit Purchase Order"
//                                       aria-label={`Edit purchase order ${material.listNo}`}
//                                     >
//                                       <FiEdit className="h-4 w-4" />
//                                     </button>
//                                   </div>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     ) : (
//                       <p className="text-gray-500 dark:text-gray-400 py-4 text-center">
//                         No materials found for this purchase
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );

//   const renderViewModal = () => {
//     if (!viewingItem) return null;

//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//         <div className="dark:bg-gray-800 mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:border-black dark:bg-black">
//           <div className="mb-4 flex items-center justify-between">
//             <h3 className="text-gray-900 text-lg font-semibold dark:text-white">
//               View Raw Material Details
//             </h3>
//             <button
//               onClick={() => setViewingItem(null)}
//               className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//             >
//               <FiX className="h-5 w-5" />
//             </button>
//           </div>
//           <div className="bg-white p-6 dark:border-black dark:bg-black">
//             <div>
//               <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
//                 Material Name
//               </label>
//               <p className="text-gray-900 bg-gray-50 dark:bg-gray-700 rounded p-2 dark:text-white">
//                 {viewingItem.name}
//               </p>
//             </div>
//             <div>
//               <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
//                 Category
//               </label>
//               <p className="text-gray-900 bg-gray-50 dark:bg-gray-700 rounded p-2 dark:text-white">
//                 {viewingItem.category}
//               </p>
//             </div>
//             <div>
//               <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
//                 Vendor
//               </label>
//               <p className="text-gray-900 bg-gray-50 dark:bg-gray-700 rounded p-2 dark:text-white">
//                 {viewingItem.vendorName || 'Not selected'}
//               </p>
//             </div>
//             <div>
//               <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
//                 Quantity
//               </label>
//               <p className="text-gray-900 bg-gray-50 dark:bg-gray-700 rounded p-2 dark:text-white">
//                 {viewingItem.quantity} {viewingItem.unit}
//               </p>
//             </div>
//             <div>
//               <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
//                 Sub-event Date
//               </label>
//               <p className="text-gray-900 bg-gray-50 dark:bg-gray-700 rounded p-2 dark:text-white">
//                 {viewingItem.subeventDate
//                   ? format(new Date(viewingItem.subeventDate), 'dd/MM/yyyy')
//                   : 'N/A'}
//               </p>
//             </div>
//             <div>
//               <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
//                 Time
//               </label>
//               <p className="text-gray-900 bg-gray-50 dark:bg-gray-700 rounded p-2 dark:text-white">
//                 {viewingItem.time || 'N/A'}
//               </p>
//             </div>
//             <div>
//               <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
//                 Sub-event
//               </label>
//               <p className="text-gray-900 bg-gray-50 dark:bg-gray-700 rounded p-2 dark:text-white">
//                 {viewingItem.subeventName}
//               </p>
//             </div>

//             {viewingItem.breakdown && viewingItem.breakdown.length > 0 && (
//               <div>
//                 <label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm font-medium">
//                   Quantity Breakdown
//                 </label>
//                 <div className="space-y-2">
//                   {viewingItem.breakdown.map((breakdown, index) => (
//                     <div
//                       key={breakdown.id}
//                       className="bg-gray-50 dark:bg-gray-700 rounded p-2"
//                     >
//                       <div className="flex justify-between text-sm">
//                         <span>Part {index + 1}:</span>
//                         <span className="font-medium">
//                           {breakdown.quantity} {viewingItem.unit}
//                         </span>
//                       </div>
//                       <div className="text-gray-500 mt-1 flex justify-between text-xs">
//                         <span>{breakdown.time}</span>
//                         <span>
//                           {format(new Date(breakdown.date), 'dd/MM/yyyy')}
//                         </span>
//                         <span>{breakdown.location}</span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const renderBreakdownModal = () => {
//     if (!breakdownItem) return null;

//     const totalBreakdownQuantity = breakdownQuantities.reduce(
//       (sum, item) => sum + item.quantity,
//       0,
//     );
//     const remainingQuantity = breakdownItem.quantity - totalBreakdownQuantity;

//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//         <div className="dark:bg-gray-800 mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 dark:border-black dark:bg-black">
//           <div className="mb-4 flex items-center justify-between">
//             <h3 className="text-gray-900 text-lg font-semibold dark:text-white">
//               Breakdown Quantity
//             </h3>
//             <button
//               onClick={() => setBreakdownItem(null)}
//               className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//             >
//               <FiX className="h-5 w-5" />
//             </button>
//           </div>

//           <div className="mb-4 rounded bg-blue-50 p-3 dark:bg-blue-900/20">
//             <div className="flex items-center justify-between">
//               <span className="font-medium">
//                 Original Quantity: {breakdownItem.quantity} {breakdownItem.unit}
//               </span>
//               <span
//                 className={`font-medium ${remainingQuantity === 0 ? 'text-green-600' : 'text-red-600'}`}
//               >
//                 Remaining: {remainingQuantity} {breakdownItem.unit}
//               </span>
//             </div>
//           </div>

//           <div className="space-y-4">
//             {breakdownQuantities.map((breakdown, index) => (
//               <div
//                 key={breakdown.id}
//                 className="border-gray-200 dark:border-gray-600 rounded-lg border p-4"
//               >
//                 <div className="mb-3 flex items-center justify-between">
//                   <h4 className="font-medium">Part {index + 1}</h4>
//                   <button
//                     onClick={() => removeBreakdownEntry(breakdown.id)}
//                     className="text-red-600 hover:text-red-800"
//                     disabled={breakdownQuantities.length <= 1}
//                   >
//                     <FiMinus className="h-4 w-4" />
//                   </button>
//                 </div>
//                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
//                   <div>
//                     <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
//                       Quantity
//                     </label>
//                     <input
//                       type="number"
//                       value={breakdown.quantity}
//                       onChange={(e) =>
//                         updateBreakdownEntry(
//                           breakdown.id,
//                           'quantity',
//                           parseFloat(e.target.value) || 0,
//                         )
//                       }
//                       className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//                       min="0"
//                       step="0.01"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
//                       Time
//                     </label>
//                     <input
//                       type="time"
//                       value={breakdown.time}
//                       onChange={(e) =>
//                         updateBreakdownEntry(
//                           breakdown.id,
//                           'time',
//                           e.target.value,
//                         )
//                       }
//                       className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
//                       Date
//                     </label>
//                     <input
//                       type="date"
//                       value={
//                         breakdown.date
//                           ? format(new Date(breakdown.date), 'yyyy-MM-dd')
//                           : ''
//                       }
//                       onChange={(e) =>
//                         updateBreakdownEntry(
//                           breakdown.id,
//                           'date',
//                           e.target.value,
//                         )
//                       }
//                       className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
//                       Location
//                     </label>
//                     <select
//                       value={breakdown.location}
//                       onChange={(e) =>
//                         updateBreakdownEntry(
//                           breakdown.id,
//                           'location',
//                           e.target.value,
//                         )
//                       }
//                       className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//                     >
//                       {locations.map((location) => (
//                         <option key={location} value={location}>
//                           {location}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="mt-4 flex justify-between">
//             <button
//               onClick={addBreakdownEntry}
//               className="disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition-colors dark:bg-primary"
//             >
//               <FiPlus className="h-4 w-4" />
//               Add Part
//             </button>
//           </div>

//           <div className="mt-6 flex justify-end gap-3">
//             <button
//               onClick={() => setBreakdownItem(null)}
//               className="bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded px-4 py-2 text-sm font-medium"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSaveBreakdown}
//               disabled={remainingQuantity !== 0}
//               className="disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition-colors dark:bg-primary"
//             >
//               <FiSave className="h-4 w-4" />
//               Save Breakdown
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="bg-gray-50 dark:bg-gray-900 min-h-screen px-4 py-6 sm:px-6 lg:px-8">
//       <div className="mx-auto max-w-7xl">
//         <div className="mb-8">
//           <h1 className="text-gray-900 text-3xl font-bold dark:text-white">
//             Event PO Module
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400">
//             View and edit raw material requirements by date and events
//           </p>
//         </div>

//         <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-md dark:border-black dark:bg-black">
//           <div className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 border-b px-6 py-4">
//             <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//               <div className="flex items-center gap-4 space-x-4">
//                 <button
//                   onClick={() => setViewMode('events')}
//                   className={`rounded-lg px-4 py-2 font-medium transition-colors ${
//                     viewMode === 'events'
//                       ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
//                       : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//                   }`}
//                 >
//                   Select Events
//                 </button>
//                 <button
//                   onClick={() => setViewMode('raw-materials')}
//                   className={`rounded-lg px-4 py-2 font-medium transition-colors ${
//                     viewMode === 'raw-materials'
//                       ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
//                       : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//                   }`}
//                 >
//                   Raw Materials
//                 </button>
//                 <button
//                   onClick={handleGetHistory}
//                   className={`rounded-lg px-4 py-2 font-medium transition-colors ${
//                     viewMode === 'history'
//                       ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
//                       : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//                   }`}
//                 >
//                   View History
//                 </button>
//               </div>

//               {viewMode === 'events' && (
//                 <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-sm">
//                   <FiFilter className="h-4 w-4" />
//                   <span>{selectedSubEventsCount} sub-events selected</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="p-6">
//             {viewMode === 'events' && renderEventsView()}
//             {viewMode === 'raw-materials' && renderRawMaterialsView()}
//             {viewMode === 'history' && renderHistoryView()}
//           </div>
//         </div>
//       </div>
//       {renderViewModal()}
//       {renderBreakdownModal()}
//     </div>
//   );
// };
// export default EventPoModule;

/* eslint-disable */
import React, {useState, useMemo, useEffect} from 'react';
import {format, isSameDay} from 'date-fns';
import toast from 'react-hot-toast';
import {
  FiCalendar,
  FiFilter,
  FiClock,
  FiEdit,
  FiSave,
  FiX,
  FiEye,
  FiPlus,
  FiMinus,
  FiRefreshCw,
  FiChevronDown,
  FiShoppingCart,
} from 'react-icons/fi';
import {
  useGetAllEventsWithSubEventsPO,
  useGetEventRawMaterials,
  useGetHistory,
  useGetVendorsPo,
  useSubmitEventPO,
  useUpdateEventPo,
} from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {z} from 'zod';
import {useNavigate} from '@tanstack/react-router';

// Add GenericTable component
const GenericTable = ({
  data,
  columns,
  itemsPerPage = 10,
  searchable = true,
  action = true,
  onView,
}: any) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item: any) =>
      columns.some((col: any) =>
        String(item[col.accessor as keyof typeof item] || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      ),
    );
  }, [data, searchTerm, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (key: string) => {
    setSortConfig((current) =>
      current && current.key === key && current.direction === 'asc'
        ? {key, direction: 'desc'}
        : {key, direction: 'asc'},
    );
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      {searchable && (
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            />
            <span className="absolute right-4 top-3.5">
              <svg
                className="fill-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.25 1.5C4.52208 1.5 1.5 4.52208 1.5 8.25C1.5 11.9779 4.52208 15 8.25 15C11.9779 15 15 11.9779 15 8.25C15 4.52208 11.9779 1.5 8.25 1.5ZM0 8.25C0 3.69365 3.69365 0 8.25 0C12.8063 0 16.5 3.69365 16.5 8.25C16.5 12.8063 12.8063 16.5 8.25 16.5C3.69365 16.5 0 12.8063 0 8.25Z"
                  fill=""
                />
                <path
                  d="M17.0303 16.2197C17.3232 15.9268 17.3232 15.4519 17.0303 15.1591L14.6121 12.7408C14.3192 12.4479 13.8444 12.4479 13.5515 12.7408C13.2586 13.0337 13.2586 13.5086 13.5515 13.8015L15.9697 16.2197C16.2626 16.5126 16.7374 16.5126 17.0303 16.2197Z"
                  fill=""
                />
              </svg>
            </span>
          </div>
        </div>
      )}

      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              {columns.map((column: any, index: number) => (
                <th
                  key={index}
                  className={`px-4 py-4 font-medium text-black dark:text-white ${
                    column.sortable ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.accessor)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && (
                      <span className="ml-1">
                        {sortConfig?.key === column.accessor
                          ? sortConfig.direction === 'asc'
                            ? '↑'
                            : '↓'
                          : '↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {action && (
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item: any, index: number) => (
                <tr
                  key={index}
                  className="border-b border-stroke dark:border-strokedark"
                >
                  {columns.map((column: any, colIndex: number) => (
                    <td
                      key={colIndex}
                      className="border-b border-stroke px-4 py-5 dark:border-strokedark"
                    >
                      {column.render
                        ? column.render(item)
                        : item[column.accessor]}
                    </td>
                  ))}
                  {action && (
                    <td className="border-b border-stroke px-4 py-5 dark:border-strokedark">
                      <div className="flex items-center space-x-3.5">
                        <button
                          onClick={() => onView && onView(item)}
                          className="hover:text-primary"
                          title="View Details"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (action ? 1 : 0)}
                  className="py-8 text-center"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-stroke py-4 dark:border-strokedark">
          <div className="text-sm text-black dark:text-white">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, sortedData.length)} of{' '}
            {sortedData.length} entries
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded border border-stroke bg-white px-3 py-1 text-sm disabled:opacity-50 dark:border-strokedark dark:bg-boxdark"
            >
              Previous
            </button>
            {Array.from({length: totalPages}, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded px-3 py-1 text-sm ${
                  currentPage === page
                    ? 'bg-primary text-white'
                    : 'border border-stroke bg-white text-black dark:border-strokedark dark:bg-boxdark dark:text-white'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="rounded border border-stroke bg-white px-3 py-1 text-sm disabled:opacity-50 dark:border-strokedark dark:bg-boxdark"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Add Column interface
interface Column<T> {
  header: string;
  accessor: keyof T | string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

/* --------------------------------------------------------------
   Zod Schemas for Validation
   -------------------------------------------------------------- */
export const EventPoSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  eventName: z.string().min(1, 'Event name is required'),
  materials: z.array(
    z.object({
      materialId: z.string().min(1, 'Material ID is required'),
      materialName: z.string().min(1, 'Material name is required'),
      vendorId: z.string().min(1, 'Vendor ID is required'),
      vendorName: z.string().min(1, 'Vendor name is required'),
      unit: z.string().min(1, 'Unit is required'),
      quantity: z.number().min(0, 'Quantity must be positive'),
      category: z.string().min(1, 'Category is required'),
      subeventId: z.string().min(1, 'Sub-event ID is required'),
      subeventName: z.string().min(1, 'Sub-event name is required'),
      date: z.string().min(1, 'Date is required'),
      time: z.string().min(1, 'Time is required'),
      venue: z.string().min(1, 'Venue is required'),
    }),
  ),
});

/* --------------------------------------------------------------
   Types
   -------------------------------------------------------------- */
interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  category: string;
  date?: string;
  time?: string;
  location?: string;
  eventId: string;
  eventName: string;
  subeventId: string;
  subeventName: string;
  subeventDate?: string;
  vendorId?: string;
  vendorName?: string;
  breakdown?: QuantityBreakdown[];
}

interface QuantityBreakdown {
  id: string;
  quantity: number;
  time: string;
  date: string;
  location: string;
  vendorId?: string;
  vendorName?: string;
}

interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  subEvents: SubEvent[];
}

interface SubEvent {
  id: string;
  name: string;
  startDate?: string;
  startTime?: string;
}

interface VendorApiType {
  id: string;
  name: string;
}

interface PurchaseMaterial {
  id: string;
  purchaseId: string;
  caterorId: string;
  materialId: string;
  quantity: number;
  date: string;
  listNo: number;
  time: string;
  venue: string;
  createdAt: string;
  updatedAt: string;
}

interface PurchaseHistory {
  id: string;
  listNo: number;
  caterorId: string;
  eventId: string;
  createdAt: string;
  updatedAt: string;
  PurchaseMaterial: PurchaseMaterial[];
}

type ViewMode = 'events' | 'raw-materials' | 'history';

/* --------------------------------------------------------------
   Component
   -------------------------------------------------------------- */
const EventPoModule: React.FC = () => {
  /* ---------- State ---------- */
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [viewMode, setViewMode] = useState<ViewMode>('events');
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedEvents, setSelectedEvents] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedSubEvents, setSelectedSubEvents] = useState<
    Record<string, boolean>
  >({});
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [tableData, setTableData] = useState<RawMaterial[]>([]);
  const [locations] = useState<string[]>(['Store', 'Venue']);
  const [editingItem, setEditingItem] = useState<RawMaterial | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(0);
  const [tempSubeventDate, setTempSubeventDate] = useState('');
  const [tempTime, setTempTime] = useState('');
  const [tempLocation, setTempLocation] = useState('Store');
  const [viewingItem, setViewingItem] = useState<RawMaterial | null>(null);
  const [breakdownItem, setBreakdownItem] = useState<RawMaterial | null>(null);
  const [breakdownQuantities, setBreakdownQuantities] = useState<
    QuantityBreakdown[]
  >([]);
  const [vendorSelections, setVendorSelections] = useState<
    Record<string, string>
  >({});
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<PurchaseHistory[]>([]);
  const [expandedHistoryItems, setExpandedHistoryItems] = useState<
    Record<string, boolean>
  >({});

  /* ---------- Query Client for Cache Management ---------- */
  const queryClient = useQueryClient();

  /* ---------- API hooks ---------- */
  const {data: eventsData, isLoading: isEventsLoading} =
    useGetAllEventsWithSubEventsPO();

  const {
    data: apiData,
    isLoading: isMaterialsLoading,
    isSuccess,
    isError,
    refetch,
  } = useGetEventRawMaterials(selectedEventId);

  const {mutate: saveEventPO, isPending: isSubmitting} =
    useSubmitEventPO(selectedEventId);

  const {
    data: historyResponse,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = useGetHistory();

  const {data: vendorsResponse, isLoading: isVendorsLoading} =
    useGetVendorsPo();

  // Inside your EventPoModule component, add the update mutation:
  const {mutate: updateMutation, isPending: isUpdating} = useUpdateEventPo();

  // Default vendors in case API doesn't return data
  const defaultVendors: VendorApiType[] = [
    {id: '1', name: 'Fresh Foods Supplier'},
  ];

  const vendors: VendorApiType[] = useMemo(() => {
    if (vendorsResponse) {
      return Array.isArray(vendorsResponse)
        ? vendorsResponse
        : vendorsResponse?.data && Array.isArray(vendorsResponse.data)
          ? vendorsResponse.data
          : defaultVendors;
    }
    return defaultVendors;
  }, [vendorsResponse]);

  /* ---------- Refetch Data When Event Changes ---------- */
  useEffect(() => {
    if (selectedEventId) {
      refetch();
    }
  }, [selectedEventId, refetch]);

  /* ---------- Auto-refresh data when component mounts or data changes ---------- */
  useEffect(() => {
    // Auto-refresh data every 30 seconds when in raw-materials view
    if (viewMode === 'raw-materials' && selectedEventId) {
      const interval = setInterval(() => {
        refetch();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [viewMode, selectedEventId, refetch]);

  /* ---------- History Handler ---------- */
  const handleGetHistory = async () => {
    try {
      const result = await refetchHistory();
      const data = result.data as any;
      console.log('History data received:', data);

      // Extract the data array from the response
      const historyArray = data?.data || data || [];
      setHistoryData(historyArray);
      setShowHistory(true);
      setViewMode('history');
      toast.success('History data loaded successfully');
    } catch (error: any) {
      console.error('Error fetching history:', error);
      toast.error(
        `Failed to load history: ${error.message || 'Unknown error'}`,
      );
    }
  };

  /* ---------- Helper Functions ---------- */
  const formatTimeForAPI = (timeString: string): string => {
    if (timeString.includes('T')) {
      return timeString;
    }

    if (timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return date.toISOString();
    }

    console.warn(`Invalid time format: ${timeString}, using current time`);
    return new Date().toISOString();
  };

  const formatDateForAPI = (dateString: string): string => {
    if (!dateString) return new Date().toISOString().split('T')[0];

    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const safeFormat = (dateString: string, formatString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? 'Invalid Date'
        : format(date, formatString);
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTimeDisplay = (timeString: string) => {
    if (!timeString) return 'N/A';
    try {
      if (timeString.includes('T')) {
        return format(new Date(timeString), 'HH:mm');
      }
      // If it's already in HH:mm format
      return timeString;
    } catch {
      return timeString;
    }
  };

  /* ---------- Data processing ---------- */
  const eventsArray = useMemo((): Event[] => {
    if (!eventsData?.data) {
      return [];
    }

    return eventsData.data.map((ev: any) => ({
      ...ev,
      subEvents: (ev.subEvents || []).map((sub: any) => ({
        ...sub,
        startDate: sub.startDate || ev.startDate,
        startTime: sub.startTime || '09:00',
      })),
    }));
  }, [eventsData]);

  const dateOptions = useMemo(() => {
    if (!eventsData?.data) return [];
    const uniq = new Set<string>();
    eventsData.data.forEach((ev: Event) => {
      if (ev.startDate) uniq.add(format(new Date(ev.startDate), 'yyyy-MM-dd'));
    });
    return Array.from(uniq)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map((d) => ({value: d, label: format(new Date(d), 'dd/MM/yyyy')}));
  }, [eventsData]);

  // Process API data into table format - FIXED VERSION
  useEffect(() => {
    try {
      if (isSuccess && apiData && selectedEventId) {
        let rawMaterials: any[] = [];

        // Extract data from API response
        if (apiData.data && Array.isArray(apiData.data)) {
          rawMaterials = apiData.data;
        } else if (Array.isArray(apiData)) {
          rawMaterials = apiData;
        } else {
          console.warn('Unexpected API response format:', apiData);
          setTableData([]);
          return;
        }

        if (rawMaterials.length === 0) {
          setTableData([]);
          return;
        }

        // Get event info
        const event = eventsArray.find((ev) => ev.id === selectedEventId);

        // Process each item with your actual API field names
        const processedData = rawMaterials.map(
          (item: any, index: number): RawMaterial => {
            // Extract time and date from subevent
            const subEvent = event?.subEvents?.find(
              (sub) => sub.id === item.subeventId,
            );
            const time = subEvent?.startTime || '09:00';
            const subeventDate =
              subEvent?.startDate || event?.startDate || startDate;

            // FIX: Check if vendors array is available and has items
            const availableVendors =
              vendors && vendors.length > 0 ? vendors : defaultVendors;
            const defaultVendor =
              availableVendors[index % availableVendors.length];

            const processedItem: RawMaterial = {
              id: item.rawmaterialId || `temp-${index}-${Date.now()}`,
              name: item.rawmaterialName || 'Unknown Material',
              unit: item.unit || 'GRAM',
              quantity: Number(item.quantity) || 0,
              category: item.category || 'Uncategorized',
              date: event?.startDate || startDate,
              time: time,
              subeventDate: subeventDate,
              location: 'Store',
              eventId: item.eventId || selectedEventId,
              eventName: item.eventName || event?.name || 'Unknown Event',
              subeventId: item.subeventId || '',
              subeventName: item.subeventName || 'Unknown Sub-event',
              vendorId: item.vendorId || defaultVendor.id,
              vendorName: item.vendorName || defaultVendor.name,
              breakdown: item.breakdown || [],
            };

            return processedItem;
          },
        );

        setTableData(processedData);

        // Initialize vendor selections
        const initialVendorSelections: Record<string, string> = {};
        processedData.forEach((item) => {
          if (item.id) {
            initialVendorSelections[item.id] = item.vendorId || '';
          }
        });
        setVendorSelections(initialVendorSelections);

        toast.success(`Loaded ${processedData.length} raw materials`);
      } else if (selectedEventId && !isMaterialsLoading && !apiData) {
        setTableData([]);
        setVendorSelections({});
      }
    } catch (error) {
      console.error('Error processing data:', error);
      toast.error('Error loading materials data');
      setTableData([]);
    }
  }, [
    apiData,
    isSuccess,
    selectedEventId,
    eventsArray,
    startDate,
    isMaterialsLoading,
    vendors, // This dependency was causing the issue
  ]);

  const filteredEvents = useMemo((): Event[] => {
    if (!eventsArray || !startDate) return [];
    const sel = new Date(startDate + 'T00:00:00Z');
    return eventsArray.filter((ev) => {
      const evStart = new Date(ev.startDate);
      return isSameDay(evStart, sel);
    });
  }, [eventsArray, startDate]);

  const selectedSubEventsCount = useMemo(
    () => Object.values(selectedSubEvents).filter(Boolean).length,
    [selectedSubEvents],
  );

  const uniqueCategories = useMemo(
    () => Array.from(new Set(tableData.map((item) => item.category))),
    [tableData],
  );

  const filteredTableData = useMemo(
    () =>
      tableData.filter(
        (item) =>
          selectedCategories.length === 0 ||
          selectedCategories.includes(item.category),
      ),
    [tableData, selectedCategories],
  );

  /* ---------- History Table Handlers ---------- */
  const toggleHistoryItem = (id: string) => {
    setExpandedHistoryItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /* ---------- Category Dropdown Handlers ---------- */
  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const selectAllCategories = () => {
    setSelectedCategories([...uniqueCategories]);
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.category-dropdown')) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ---------- Vendor Selection Handler ---------- */
  const handleVendorChange = (materialId: string, vendorId: string) => {
    setVendorSelections((prev) => ({
      ...prev,
      [materialId]: vendorId,
    }));

    // Update table data with vendor information
    const selectedVendor = vendors.find((v) => v.id === vendorId);
    if (selectedVendor) {
      setTableData((prev) =>
        prev.map((item) =>
          item.id === materialId
            ? {
                ...item,
                vendorId: selectedVendor.id,
                vendorName: selectedVendor.name,
              }
            : item,
        ),
      );
    }
  };

  /* ---------- Event handlers ---------- */
  useEffect(() => {
    if (editingItem) {
      setTempQuantity(editingItem.quantity);
      setTempSubeventDate(editingItem.subeventDate || '');
      setTempTime(editingItem.time || '');
      setTempLocation(editingItem.location || 'Store');
    }
  }, [editingItem]);

  const handleViewItem = (item: RawMaterial) => {
    setViewingItem(item);
    setBreakdownItem(null);
  };

  const handleBreakdownItem = (item: RawMaterial) => {
    setBreakdownItem(item);
    setViewingItem(null);
    if (item.breakdown && item.breakdown.length > 0) {
      setBreakdownQuantities([...item.breakdown]);
    } else {
      setBreakdownQuantities([
        {
          id: `breakdown-${Date.now()}`,
          quantity: item.quantity,
          time: item.time || '09:00',
          date: item.subeventDate || item.date || startDate,
          location: item.location || 'Store',
          vendorId: item.vendorId,
          vendorName: item.vendorName,
        },
      ]);
    }
  };

  const handleSaveBreakdown = () => {
    if (!breakdownItem) return;

    const totalBreakdownQuantity = breakdownQuantities.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    if (totalBreakdownQuantity !== breakdownItem.quantity) {
      toast.error(
        `Total breakdown quantity (${totalBreakdownQuantity}) must match original quantity (${breakdownItem.quantity})`,
      );
      return;
    }

    const updatedData = tableData.map((item) =>
      item.id === breakdownItem.id
        ? {
            ...item,
            breakdown: [...breakdownQuantities],
          }
        : item,
    );
    setTableData(updatedData);
    setBreakdownItem(null);
    setBreakdownQuantities([]);
    toast.success('Breakdown saved successfully');
  };

  const addBreakdownEntry = () => {
    setBreakdownQuantities((prev) => [
      ...prev,
      {
        id: `breakdown-${Date.now()}-${prev.length}`,
        quantity: 0,
        time: '09:00',
        date: breakdownItem?.subeventDate || breakdownItem?.date || startDate,
        location: 'Store',
        vendorId: breakdownItem?.vendorId,
        vendorName: breakdownItem?.vendorName,
      },
    ]);
  };

  const removeBreakdownEntry = (id: string) => {
    if (breakdownQuantities.length <= 1) {
      toast.error('At least one breakdown entry is required');
      return;
    }
    setBreakdownQuantities((prev) => prev.filter((item) => item.id !== id));
  };

  const updateBreakdownEntry = (
    id: string,
    field: keyof QuantityBreakdown,
    value: any,
  ) => {
    setBreakdownQuantities((prev) =>
      prev.map((item) => (item.id === id ? {...item, [field]: value} : item)),
    );
  };

  const handleEdit = (item: any) => {
    console.log('Editing item:', item);
    navigate({
      to: '/updatevent/$id',
      params: {id: item.purchaseId},
    });
  };
  /* ---------- SUBMIT DATA WITH REFETCH ---------- */
  const handleSubmitAllData = () => {
    if (tableData.length === 0) {
      toast.error('No data to submit');
      return;
    }

    if (!selectedEventId) {
      toast.error('No event selected');
      return;
    }

    const event = eventsArray.find((ev) => ev.id === selectedEventId);
    if (!event) {
      toast.error('Event not found');
      return;
    }

    // Check if all materials have vendors selected
    const materialsWithoutVendors = tableData.filter(
      (item) => !item.vendorId || !item.vendorName,
    );
    if (materialsWithoutVendors.length > 0) {
      toast.error('Please select vendors for all materials before submitting');
      return;
    }

    const payload = {
      eventId: selectedEventId,
      eventName: event.name,
      materials: tableData.flatMap((item) => {
        if (item.breakdown && item.breakdown.length > 0) {
          return item.breakdown.map((breakdown) => ({
            materialId: item.id,
            materialName: item.name,
            vendorId: breakdown.vendorId || item.vendorId,
            vendorName: breakdown.vendorName || item.vendorName,
            unit: item.unit,
            quantity: breakdown.quantity,
            category: item.category,
            subeventId: item.subeventId,
            subeventName: item.subeventName,
            date: formatDateForAPI(
              breakdown.date || item.subeventDate || item.date || startDate,
            ),
            time: formatTimeForAPI(breakdown.time || item.time || '09:00'),
            venue: breakdown.location || item.location || 'Store',
          }));
        } else {
          return {
            materialId: item.id,
            materialName: item.name,
            vendorId: item.vendorId,
            vendorName: item.vendorName,
            unit: item.unit,
            quantity: item.quantity,
            category: item.category,
            subeventId: item.subeventId,
            subeventName: item.subeventName,
            date: formatDateForAPI(item.subeventDate || item.date || startDate),
            time: formatTimeForAPI(item.time || '09:00'),
            venue: item.location || 'Store',
          };
        }
      }),
    };

    // Validate with Zod schema
    try {
      EventPoSchema.parse(payload);
    } catch (validationError: any) {
      console.error('Data validation failed:', validationError.errors);
      toast.error(
        `Validation failed: ${validationError.errors[0]?.message || 'Invalid data format'}`,
      );
      return;
    }

    // Always try UPDATE first, if it fails with 404, try CREATE
    console.log('Attempting to update PO for event:', selectedEventId);
    updateMutation(
      {id: selectedEventId, data: payload},
      {
        onSuccess: () => {
          toast.success('PO data updated successfully!');

          // Invalidate and refetch the query
          queryClient.invalidateQueries({
            queryKey: ['eventRawMaterials', selectedEventId],
          });

          // Directly refetch the data
          setTimeout(() => {
            refetch();
          }, 1000);
        },
        onError: (error: any) => {
          console.error('❌ Error updating PO data:', error);

          // If update fails with 404 (Purchase not found), try create instead
          if (
            error.response?.status === 404 ||
            error.response?.data?.message?.includes('not found')
          ) {
            console.log('📝 Purchase not found, trying to create new PO...');
            saveEventPO(payload, {
              onSuccess: () => {
                toast.success('PO data created successfully!');

                // Invalidate and refetch the query
                queryClient.invalidateQueries({
                  queryKey: ['eventRawMaterials', selectedEventId],
                });

                // Directly refetch the data
                setTimeout(() => {
                  refetch();
                }, 1000);
              },
              onError: (createError: any) => {
                console.error('❌ Error creating PO data:', createError);

                // If create fails with "already exists", try update again (race condition)
                if (
                  createError.response?.data?.message?.includes(
                    'already exists',
                  )
                ) {
                  console.log('🔄 PO already exists, retrying update...');
                  updateMutation(
                    {id: selectedEventId, data: payload},
                    {
                      onSuccess: () => {
                        toast.success('PO data updated successfully!');
                        queryClient.invalidateQueries({
                          queryKey: ['eventRawMaterials', selectedEventId],
                        });
                        setTimeout(() => {
                          refetch();
                        }, 1000);
                      },
                      onError: (retryError: any) => {
                        console.error('❌ Error in retry update:', retryError);
                        toast.error(
                          `Failed to update PO data: ${retryError.message || 'Unknown error'}`,
                        );
                      },
                    },
                  );
                } else {
                  toast.error(
                    `Failed to create PO data: ${createError.message || 'Unknown error'}`,
                  );
                }
              },
            });
          } else {
            // Other errors (not 404)
            toast.error(
              `Failed to update PO data: ${error.message || 'Unknown error'}`,
            );
          }
        },
      },
    );
  };
  useEffect(() => {
    if (!eventsArray || eventsArray.length === 0) return;

    const evSel: Record<string, boolean> = {};
    const subSel: Record<string, boolean> = {};

    eventsArray.forEach((ev) => {
      evSel[ev.id] = true;
      ev.subEvents?.forEach((sub) => {
        subSel[sub.id] = true;
      });
    });

    setSelectedEvents(evSel);
    setSelectedSubEvents(subSel);
  }, [eventsArray]);

  const toggleAccordion = (id: string) =>
    setExpandedEvents((p) => ({...p, [id]: !p[id]}));

  const toggleEventCheckbox = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newVal = !selectedEvents[id];
    const ev = eventsArray.find((e) => e.id === id);
    if (ev) {
      setSelectedSubEvents((p) => {
        const upd = {...p};
        ev.subEvents?.forEach((sub) => (upd[sub.id] = newVal));
        return upd;
      });
    }
    setSelectedEvents((p) => ({...p, [id]: newVal}));
  };

  const toggleSubEvent = (id: string) =>
    setSelectedSubEvents((p) => ({...p, [id]: !p[id]}));

  const handleGenerateReport = () => {
    if (selectedSubEventsCount === 0) {
      toast.error('Select at least one sub-event');
      return;
    }

    const selectedEvent = eventsArray.find((ev) =>
      ev.subEvents?.some((sub) => selectedSubEvents[sub.id]),
    );

    if (!selectedEvent) {
      toast.error('No valid event found for selected sub-events');
      return;
    }

    setSelectedEventId(selectedEvent.id);
    setViewMode('raw-materials');

    // Clear previous data and refetch
    setTableData([]);
    setTimeout(() => {
      refetch();
    }, 100);
  };

  /* ---------- Table columns ---------- */
  const tableColumns: Column<RawMaterial>[] = [
    {
      header: 'Category',
      accessor: 'category',
    },
    {
      header: 'Material Name',
      accessor: 'name',
    },
    {
      header: 'Vendor Name',
      accessor: 'vendorName',
      render: (item: RawMaterial) => (
        <select
          value={vendorSelections[item.id] || ''}
          onChange={(e) => handleVendorChange(item.id, e.target.value)}
          className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        >
          <option value="">Select Vendor</option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.name}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      render: (item: RawMaterial) => (
        <div className="space-y-2">
          <div className="font-medium">
            {item.quantity} {item.unit}
          </div>
          {item.breakdown && item.breakdown.length > 0 && (
            <div className="text-gray-500 space-y-1 text-xs">
              {item.breakdown.map((breakdown, index) => (
                <div
                  key={breakdown.id}
                  className="flex items-center justify-between gap-4"
                >
                  <span>Part {index + 1}:</span>
                  <span className="font-medium">
                    {breakdown.quantity} {item.unit}
                  </span>
                  <span className="text-gray-400">{breakdown.time}</span>
                  <span className="text-gray-400">
                    {format(new Date(breakdown.date), 'dd/MM/yyyy')}
                  </span>
                  <span className="text-gray-400">{breakdown.location}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      render: (item: RawMaterial) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleBreakdownItem(item)}
            className="flex items-center gap-1 rounded bg-purple-600 px-2 py-1 text-xs text-white hover:bg-purple-700"
            title="Breakdown Quantity"
          >
            <FiPlus className="h-3 w-3" />
            Break
          </button>
        </div>
      ),
    },
  ];

  /* ---------- Render functions ---------- */
  const renderEventsView = () => (
    <>
      <div className="mb-8 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-800">
              <FiCalendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Filter by Date:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-700 dark:text-gray-300 whitespace-nowrap text-sm font-medium">
              Date:
            </label>
            <div className="relative flex items-center">
              <div className="border-gray-300 dark:border-gray-600 text-gray-900 dark:bg-gray-700 flex min-w-[140px] items-center justify-between rounded-lg border px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 dark:text-white">
                <select
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded bg-transparent px-3 py-1.5 text-sm outline-none transition disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  {dateOptions.length ? (
                    dateOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))
                  ) : (
                    <option value="">No dates</option>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-gray-900 text-lg font-semibold dark:text-white">
            Events & Sub-events
          </h3>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {filteredEvents.length} events found
          </span>
        </div>

        {isEventsLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-12 text-center">
            <FiFilter className="text-gray-400 dark:text-gray-500 mx-auto mb-4 h-12 w-12" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No events for the selected date
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 rounded-lg border transition hover:shadow-md"
            >
              <div
                onClick={() => toggleAccordion(event.id)}
                className="flex cursor-pointer items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedEvents[event.id] ?? false}
                    onClick={(e) => toggleEventCheckbox(event.id, e)}
                    onChange={() => {}}
                    className="border-gray-300 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <h4 className="text-gray-900 font-semibold dark:text-white">
                      {event.name}
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {format(new Date(event.startDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {event.subEvents?.length || 0} sub-events
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 text-xl font-bold">
                    {expandedEvents[event.id] ? '−' : '+'}
                  </span>
                </div>
              </div>

              {expandedEvents[event.id] &&
                event.subEvents &&
                event.subEvents.length > 0 && (
                  <div className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-b-lg border-t">
                    <div className="grid gap-2 p-4">
                      {event.subEvents.map((sub) => (
                        <label
                          key={sub.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 flex cursor-pointer items-center gap-3 rounded-lg p-3"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSubEvents[sub.id] ?? false}
                            onChange={() => toggleSubEvent(sub.id)}
                            className="border-gray-300 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <span className="text-gray-700 dark:text-gray-300 block">
                              {sub.name}
                            </span>
                            {sub.startTime && (
                              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1 text-xs">
                                <FiClock className="h-3 w-3" />
                                {sub.startTime}
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ))
        )}
      </div>

      {filteredEvents.length > 0 && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleGenerateReport}
            disabled={isMaterialsLoading || selectedSubEventsCount === 0}
            className="disabled:bg-gray-400 flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed"
          >
            {isMaterialsLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                Generating...
              </>
            ) : (
              <>Generate Report ({selectedSubEventsCount})</>
            )}
          </button>
        </div>
      )}

      {isError && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-center text-red-700 dark:text-red-400">
            Failed to load data. Please check if the API endpoint is correct.
          </p>
        </div>
      )}
    </>
  );

  const renderRawMaterialsView = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-bold dark:text-white">
            Raw Materials
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {format(new Date(startDate), 'dd/MM/yyyy')} • {tableData.length}{' '}
            items
            {selectedSubEventsCount > 0 &&
              ` • ${selectedSubEventsCount} sub-event(s)`}
            {selectedCategories.length > 0 &&
              ` • ${selectedCategories.length} category filter(s)`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Submit Button */}

          <button
            onClick={handleSubmitAllData}
            disabled={isSubmitting || isUpdating || tableData.length === 0}
            className="disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition-colors dark:bg-primary"
          >
            {isSubmitting || isUpdating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                {isSubmitting ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              <>Save PO Data</>
            )}
          </button>
        </div>
      </div>

      {isMaterialsLoading && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
          <span className="text-gray-600 dark:text-gray-400 ml-3">
            Loading raw materials...
          </span>
        </div>
      )}

      {!isMaterialsLoading && tableData.length > 0 && (
        <>
          {/* Category Filter Dropdown */}
          <div className="category-dropdown mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="whitespace-nowrap font-medium text-black dark:text-white">
                Category:
              </span>
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() =>
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                  }
                  className="hover:bg-gray-50 flex w-full min-w-[160px] items-center justify-between gap-2 rounded-lg border border-stroke bg-white px-3 py-2 dark:border-strokedark dark:bg-form-input dark:hover:bg-meta-4 sm:min-w-[200px]"
                >
                  <span className="truncate text-sm text-black dark:text-white">
                    {selectedCategories.length === 0
                      ? 'Select Categories'
                      : `${selectedCategories.length} selected`}
                  </span>
                  <FiChevronDown
                    className={`text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 top-full z-10 mt-1 w-full min-w-[160px] rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-form-input sm:w-64">
                    <div className="border-b border-stroke p-2 dark:border-strokedark">
                      <div className="mb-2 flex items-center justify-between">
                        <button
                          onClick={selectAllCategories}
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          Select All
                        </button>
                        <button
                          onClick={clearAllCategories}
                          className="text-xs text-red-600 hover:text-red-800 dark:text-red-400"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {uniqueCategories.map((category) => (
                          <label
                            key={category}
                            className="hover:bg-gray-100 flex cursor-pointer items-center gap-2 rounded p-2 dark:hover:bg-meta-4"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category)}
                              onChange={() => handleCategoryChange(category)}
                              className="rounded border-stroke text-blue-600 focus:ring-blue-500 dark:border-strokedark"
                            />
                            <span className="text-sm text-black dark:text-white">
                              {category}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mb-8">
            <GenericTable
              data={filteredTableData}
              columns={tableColumns}
              itemsPerPage={10}
              searchable={true} // Fixed typo: searchAble -> searchable
              action={true}
              onView={handleViewItem}
            />
          </div>
        </>
      )}

      {!isMaterialsLoading && tableData.length === 0 && (
        <div className="py-12 text-center">
          <FiFilter className="text-gray-400 dark:text-gray-500 mx-auto mb-4 h-12 w-12" />
          <p className="text-gray-600 dark:text-gray-400">
            No raw material data found. Please generate a report first.
          </p>
        </div>
      )}

      {!isMaterialsLoading && isError && (
        <div className="py-12 text-center">
          <p className="text-red-600 dark:text-red-400">
            Error loading raw materials. Please try again.
          </p>
        </div>
      )}
    </div>
  );

  const renderHistoryView = () => (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-bold dark:text-white">
            Purchase History
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            View your purchase order history and material details
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('events')}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Back to Events
          </button>
        </div>
      </div>

      {isHistoryLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
          <span className="text-gray-600 dark:text-gray-400 ml-3">
            Loading history...
          </span>
        </div>
      ) : historyData.length === 0 ? (
        <div className="py-12 text-center">
          <FiShoppingCart className="text-gray-400 dark:text-gray-500 mx-auto mb-4 h-12 w-12" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No purchase history found
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {historyData.map((history) => (
            <div
              key={history.id}
              className="bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 rounded-lg border transition hover:shadow-md"
            >
              <div
                onClick={() => toggleHistoryItem(history.id)}
                className="flex cursor-pointer items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="text-gray-900 font-semibold dark:text-white">
                      List {history.listNo}
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Created:{' '}
                      {safeFormat(history.createdAt, 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {history.PurchaseMaterial?.length || 0} materials
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 text-xl font-bold">
                    {expandedHistoryItems[history.id] ? '−' : '+'}
                  </span>
                </div>
              </div>

              {expandedHistoryItems[history.id] && (
                <div className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-b-lg border-t">
                  <div className="p-4">
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
                          Created At
                        </label>
                        <p className="text-gray-900 bg-gray-50 dark:bg-gray-700 rounded p-2 text-sm dark:text-white">
                          {safeFormat(history.createdAt, 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
                          Updated At
                        </label>
                        <p className="text-gray-900 bg-gray-50 dark:bg-gray-700 rounded p-2 text-sm dark:text-white">
                          {safeFormat(history.updatedAt, 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                    </div>

                    <h5 className="text-gray-900 mb-3 font-semibold dark:text-white">
                      Purchase Materials (
                      {history.PurchaseMaterial?.length || 0})
                    </h5>

                    {history.PurchaseMaterial &&
                    history.PurchaseMaterial.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="divide-gray-200 dark:divide-gray-700 min-w-full divide-y">
                          <thead className="bg-gray-60 dark:bg-gray-700">
                            <tr>
                              <th className="text-gray-500 dark:text-gray-300 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Quantity
                              </th>
                              <th className="text-gray-500 dark:text-gray-300 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Date
                              </th>
                              <th className="text-gray-500 dark:text-gray-300 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Time
                              </th>
                              <th className="text-gray-500 dark:text-gray-300 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Venue
                              </th>
                              <th className="text-gray-500 dark:text-gray-300 px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-gray-200 dark:divide-gray-700 divide-y">
                            {history.PurchaseMaterial.map((material) => (
                              <tr
                                key={material.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <td className="text-gray-900 whitespace-nowrap px-4 py-2 text-sm dark:text-white">
                                  {material.quantity}
                                </td>
                                <td className="text-gray-500 dark:text-gray-300 whitespace-nowrap px-4 py-2 text-sm">
                                  {safeFormat(material.date, 'dd/MM/yyyy')}
                                </td>
                                <td className="text-gray-500 dark:text-gray-300 whitespace-nowrap px-4 py-2 text-sm">
                                  {formatTimeDisplay(material.time)}
                                </td>
                                <td className="text-gray-500 dark:text-gray-300 whitespace-nowrap px-4 py-2 text-sm">
                                  {material.venue}
                                </td>
                                <td className="text-gray-500 dark:text-gray-300 whitespace-nowrap px-4 py-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleEdit(material)}
                                      className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
                                      title="Edit Purchase Order"
                                      aria-label={`Edit purchase order ${material.listNo}`}
                                    >
                                      <FiEdit className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 py-4 text-center">
                        No materials found for this purchase
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderViewModal = () => {
    if (!viewingItem) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="dark:bg-gray-800 mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:border-black dark:bg-black">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-gray-900 text-lg font-semibold dark:text-white">
              View Raw Material Details
            </h3>
            <button
              onClick={() => setViewingItem(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
          <div className="bg-white p-6 dark:border-black dark:bg-black">
            <div>
              <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
                Material Name
              </label>
              <p className="text-gray-900 bg-gray-50 dark:bg-gray-700 rounded p-2 dark:text-white">
                {viewingItem.name}
              </p>
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
                Category
              </label>
              <p className="text-gray-900 bg-gray-50 dark:bg-gray-700 rounded p-2 dark:text-white">
                {viewingItem.category}
              </p>
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
                Vendor
              </label>
              <p className="text-gray-900 bg-gray-50 dark:bg-gray-700 rounded p-2 dark:text-white">
                {viewingItem.vendorName || 'Not selected'}
              </p>
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
                Quantity
              </label>
              <p className="text-gray-900 bg-gray-50 dark:bg-gray-700 rounded p-2 dark:text-white">
                {viewingItem.quantity} {viewingItem.unit}
              </p>
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
                Sub-event Date
              </label>
              <p className="text-gray-900 bg-gray-50 dark:bg-gray-700 rounded p-2 dark:text-white">
                {viewingItem.subeventDate
                  ? format(new Date(viewingItem.subeventDate), 'dd/MM/yyyy')
                  : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
                Time
              </label>
              <p className="text-gray-900 bg-gray-50 dark:bg-gray-700 rounded p-2 dark:text-white">
                {viewingItem.time || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
                Sub-event
              </label>
              <p className="text-gray-900 bg-gray-50 dark:bg-gray-700 rounded p-2 dark:text-white">
                {viewingItem.subeventName}
              </p>
            </div>

            {viewingItem.breakdown && viewingItem.breakdown.length > 0 && (
              <div>
                <label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm font-medium">
                  Quantity Breakdown
                </label>
                <div className="space-y-2">
                  {viewingItem.breakdown.map((breakdown, index) => (
                    <div
                      key={breakdown.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded p-2"
                    >
                      <div className="flex justify-between text-sm">
                        <span>Part {index + 1}:</span>
                        <span className="font-medium">
                          {breakdown.quantity} {viewingItem.unit}
                        </span>
                      </div>
                      <div className="text-gray-500 mt-1 flex justify-between text-xs">
                        <span>{breakdown.time}</span>
                        <span>
                          {format(new Date(breakdown.date), 'dd/MM/yyyy')}
                        </span>
                        <span>{breakdown.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBreakdownModal = () => {
    if (!breakdownItem) return null;

    const totalBreakdownQuantity = breakdownQuantities.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const remainingQuantity = breakdownItem.quantity - totalBreakdownQuantity;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="dark:bg-gray-800 mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 dark:border-black dark:bg-black">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-gray-900 text-lg font-semibold dark:text-white">
              Breakdown Quantity
            </h3>
            <button
              onClick={() => setBreakdownItem(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 rounded bg-blue-50 p-3 dark:bg-blue-900/20">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                Original Quantity: {breakdownItem.quantity} {breakdownItem.unit}
              </span>
              <span
                className={`font-medium ${remainingQuantity === 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                Remaining: {remainingQuantity} {breakdownItem.unit}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {breakdownQuantities.map((breakdown, index) => (
              <div
                key={breakdown.id}
                className="border-gray-200 dark:border-gray-600 rounded-lg border p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-medium">Part {index + 1}</h4>
                  <button
                    onClick={() => removeBreakdownEntry(breakdown.id)}
                    className="text-red-600 hover:text-red-800"
                    disabled={breakdownQuantities.length <= 1}
                  >
                    <FiMinus className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={breakdown.quantity}
                      onChange={(e) =>
                        updateBreakdownEntry(
                          breakdown.id,
                          'quantity',
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
                      Time
                    </label>
                    <input
                      type="time"
                      value={breakdown.time}
                      onChange={(e) =>
                        updateBreakdownEntry(
                          breakdown.id,
                          'time',
                          e.target.value,
                        )
                      }
                      className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
                      Date
                    </label>
                    <input
                      type="date"
                      value={
                        breakdown.date
                          ? format(new Date(breakdown.date), 'yyyy-MM-dd')
                          : ''
                      }
                      onChange={(e) =>
                        updateBreakdownEntry(
                          breakdown.id,
                          'date',
                          e.target.value,
                        )
                      }
                      className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 dark:text-gray-300 mb-1 block text-sm font-medium">
                      Location
                    </label>
                    <select
                      value={breakdown.location}
                      onChange={(e) =>
                        updateBreakdownEntry(
                          breakdown.id,
                          'location',
                          e.target.value,
                        )
                      }
                      className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between">
            <button
              onClick={addBreakdownEntry}
              className="disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition-colors dark:bg-primary"
            >
              <FiPlus className="h-4 w-4" />
              Add Part
            </button>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setBreakdownItem(null)}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveBreakdown}
              disabled={remainingQuantity !== 0}
              className="disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition-colors dark:bg-primary"
            >
              <FiSave className="h-4 w-4" />
              Save Breakdown
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-gray-900 text-3xl font-bold dark:text-white">
            Event PO Module
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and edit raw material requirements by date and events
          </p>
        </div>

        <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-md dark:border-black dark:bg-black">
          <div className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 border-b px-6 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 space-x-4">
                <button
                  onClick={() => setViewMode('events')}
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    viewMode === 'events'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Select Events
                </button>
                <button
                  onClick={() => setViewMode('raw-materials')}
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    viewMode === 'raw-materials'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Raw Materials
                </button>
                <button
                  onClick={handleGetHistory}
                  className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                    viewMode === 'history'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  View History
                </button>
              </div>

              {viewMode === 'events' && (
                <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2 text-sm">
                  <FiFilter className="h-4 w-4" />
                  <span>{selectedSubEventsCount} sub-events selected</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {viewMode === 'events' && renderEventsView()}
            {viewMode === 'raw-materials' && renderRawMaterialsView()}
            {viewMode === 'history' && renderHistoryView()}
          </div>
        </div>
      </div>
      {renderViewModal()}
      {renderBreakdownModal()}
    </div>
  );
};
export default EventPoModule;
