/* eslint-disable */
import React, {useMemo, useState} from 'react';
import {useNavigate} from '@tanstack/react-router';
import {Route} from '@/routes/_app/_po/custompoevent.$id';

// Import separated components
import CreateEmergencyPO from './CreateEmergencyPO';
import EmergencyHistoryTable, {EmergencyPO} from './EmergencyHistoryTable';

// Import hooks
import {
  useGetcustomReportById,
  useGetVendorsPo,
  useSubmitPurchaseOrderEvent,
} from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
import {useGetRawMaterialsCateror} from '@/lib/react-query/queriesAndMutations/cateror/dish';

// Import validation schema from CreateEmergencyPO
import {poSubmissionValidationSchema} from './CreateEmergencyPO';
import {IoArrowBack} from 'react-icons/io5';
import {MdKeyboardArrowLeft} from 'react-icons/md';

const CustommoduleEvent = () => {
  const {id} = Route.useParams();
  const navigate = useNavigate();
  const {mutate: submitPO, isPending: isSubmitting} =
    useSubmitPurchaseOrderEvent(id);

  const {
    data: emergencyPoResponse,
    isLoading: emergencyLoading,
    error: emergencyError,
  } = useGetcustomReportById(id);

  const {data: rawMaterialData, isLoading: isMaterialsLoading} =
    useGetRawMaterialsCateror();

  const {data: vendorsResponse, isLoading: isLoadingVendors} =
    useGetVendorsPo();

  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  // Extract vendors from response
  const vendors = useMemo(() => {
    const vendorsData = vendorsResponse?.data || vendorsResponse || [];
    return vendorsData;
  }, [vendorsResponse]);

  // Get available materials
  const availableMaterials = useMemo(() => {
    if (!rawMaterialData?.data?.rawMaterials) return [];
    return rawMaterialData.data.rawMaterials.map((material: any) => ({
      id: material.id,
      name: material.name,
      category: material.category,
      categoryId: material.categoryId,
      unit: material.unit,
      amount: material.amount,
      inventory: material.inventory,
      caterorId: material.caterorId,
      languageId: material.languageId,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt,
    }));
  }, [rawMaterialData]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories: {id: string; name: string}[] = [];
    const categoryMap = new Map();
    availableMaterials.forEach((material) => {
      if (material.category && !categoryMap.has(material.category.id)) {
        categoryMap.set(material.category.id, material.category);
        uniqueCategories.push({
          id: material.category.id,
          name: material.category.name,
        });
      }
    });
    return uniqueCategories.sort((a, b) => a.name.localeCompare(b.name));
  }, [availableMaterials]);

  const handleCancel = () => {
    navigate({to: '/events/$id', params: {id: id}});
  };

  const handleSubmitPO = (poData: any) => {
    submitPO(poData, {
      onSuccess: () => {
        // Switch to history tab after successful submission
        setActiveTab('history');
      },
      onError: (error: any) => {
        console.error('Submission error:', error);
        // Handle error (toast will be shown in CreateEmergencyPO)
      },
    });
  };

  // Tab component
  const tabs = [
    {
      id: 'create',
      label: 'Create Emergency PO',
      icon: (
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
    },
    {
      id: 'history',
      label: 'Purchase History',
      count: emergencyPoResponse?.formatted?.length || 0,
      icon: (
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="border-gray-200 dark:border-gray-800 flex gap-4 border-b">
        <button className="text-left text-xl font-bold" onClick={handleCancel}>
          <MdKeyboardArrowLeft />
        </button>
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'create' | 'history')}
              className={`inline-flex items-center border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border-transparent'
              } `}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  } `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'create' ? (
          <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-md dark:border-black dark:bg-black">
            <CreateEmergencyPO
              eventId={id}
              availableMaterials={availableMaterials}
              vendors={vendors}
              categories={categories}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmitPO}
              onCancel={handleCancel}
              isLoading={isMaterialsLoading || isLoadingVendors}
            />
          </div>
        ) : (
          <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-md dark:border-black dark:bg-black">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-gray-900 dark:text-gray-100 text-xl font-semibold">
                  Emergency Purchase History
                </h2>
              </div>
            </div>

            <EmergencyHistoryTable
              data={emergencyPoResponse?.formatted || []}
              loading={emergencyLoading}
              error={emergencyError}
              vendors={vendors}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustommoduleEvent;
export {poSubmissionValidationSchema};
// /* eslint-disable */
// import React, {useState, useMemo, useEffect} from 'react';
// import {
//   FiPlus,
//   FiSave,
//   FiX,
//   FiTrash,
//   FiAlertTriangle,
//   FiChevronDown,
//   FiChevronRight,
//   FiEye,
//   FiPrinter,
// } from 'react-icons/fi';
// import {useForm} from 'react-hook-form';
// import {zodResolver} from '@hookform/resolvers/zod';
// import toast from 'react-hot-toast';
// import {z} from 'zod';
// import {
//   useGetcustomReport,
//   useGetcustomReportById,
//   useGetVendorsPo,
//   useSubmitPurchaseOrderEvent,
// } from '@/lib/react-query/queriesAndMutations/cateror/PO/pomodule';
// import {useGetRawMaterialsCateror} from '@/lib/react-query/queriesAndMutations/cateror/dish';
// import GenericTable from '../Forms/Table/GenericTable';
// import {useNavigate} from '@tanstack/react-router';
// import {Route} from '@/routes/_app/_po/custompoevent.$id';

// // Validation schema for form submission
// export const poSubmissionValidationSchema = z.object({
//   eventId: z.string().nonempty('Event ID is required'),
//   materials: z
//     .array(
//       z.object({
//         materialId: z.string().nonempty('Material ID is required'),
//         quantity: z.number().min(1, 'Quantity must be at least 1'),
//         date: z.string().nonempty('Date is required'),
//         time: z.string().nonempty('Time is required'),
//         venue: z.string().nonempty('Venue is required'),
//         vendorId: z.string().optional(),
//         price: z.number().optional(),
//       }),
//     )
//     .min(1, 'At least one material is required'),
// });

// interface Category {
//   id: string;
//   name: string;
//   caterorId: string;
//   createdAt: string;
//   languageId: string;
//   updatedAt: string;
// }

// interface Material {
//   id: string;
//   name: string;
//   category: Category;
//   categoryId: string;
//   unit: string;
//   amount: number;
//   inventory: number;
//   caterorId: string;
//   languageId: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface Vendor {
//   id: string;
//   name: string;
//   phone: string;
//   address: string;
//   email: string | null;
//   caterorId: string;
//   rawMaterialVendorRoles: {
//     id: string;
//     rawMaterialVendorId: string;
//     categoryId: string;
//     category: {
//       id: string;
//       name: string;
//       createdAt: string;
//       updatedAt: string;
//       languageId: string;
//       caterorId: string;
//     };
//   }[];
// }

// interface SelectedMaterial extends Material {
//   quantity: number;
//   date: string;
//   time: string;
//   venue: string;
//   vendorId?: string;
//   price?: number;
//   totalAmount?: number;
// }

// interface PurchaseMaterial {
//   materialId: string;
//   materialName: string;
//   quantity: number;
//   time: string;
//   date: string;
//   venue: string;
//   createdAt: string;
//   vendor: {
//     id: string;
//     name: string;
//     phone: string;
//     address: string;
//     email: string | null;
//     caterorId: string;
//   };
// }

// interface EmergencyPO {
//   poNumber: number;
//   eventName: string;
//   eventId: string;
//   purchaseMaterials: PurchaseMaterial[];
//   createdAt?: string;
// }

// // Custom Emergency History Table Component with Category Expandable Design
// const EmergencyHistoryTable = ({
//   data,
//   loading,
//   error,
// }: {
//   data: EmergencyPO[];
//   loading: boolean;
//   error: any;
// }) => {
//   const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
//     new Set(),
//   );
//   const [expandedPOs, setExpandedPOs] = useState<Set<number>>(new Set());

//   const toggleCategoryExpansion = (categoryName: string) => {
//     setExpandedCategories((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(categoryName)) {
//         newSet.delete(categoryName);
//       } else {
//         newSet.add(categoryName);
//       }
//       return newSet;
//     });
//   };

//   const togglePOExpansion = (poNumber: number) => {
//     setExpandedPOs((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(poNumber)) {
//         newSet.delete(poNumber);
//       } else {
//         newSet.add(poNumber);
//       }
//       return newSet;
//     });
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   const formatDisplayDate = (dateString: string) => {
//     try {
//       const date = new Date(dateString);
//       const day = date.getDate().toString().padStart(2, '0');
//       const month = (date.getMonth() + 1).toString().padStart(2, '0');
//       const year = date.getFullYear();
//       return `${day}/${month}/${year}`;
//     } catch (error) {
//       return 'Invalid Date';
//     }
//   };

//   const formatDisplayTime = (timeString: string) => {
//     try {
//       const date = new Date(timeString);
//       let hours = date.getHours();
//       const minutes = date.getMinutes().toString().padStart(2, '0');
//       const ampm = hours >= 12 ? 'PM' : 'AM';

//       hours = hours % 12;
//       hours = hours ? hours : 12;

//       return `${hours}:${minutes} ${ampm}`;
//     } catch (error) {
//       return 'Invalid Time';
//     }
//   };

//   // Group materials by category for each PO
//   const getGroupedMaterials = (po: EmergencyPO) => {
//     const grouped: {[category: string]: PurchaseMaterial[]} = {};

//     po.purchaseMaterials?.forEach((material) => {
//       // Extract category from material name or use a default
//       const category =
//         material.materialName?.split(' - ')[0] || 'Uncategorized';
//       if (!grouped[category]) {
//         grouped[category] = [];
//       }
//       grouped[category].push(material);
//     });

//     return grouped;
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-8">
//         <div className="text-center">
//           <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
//           <p className="text-gray-600 dark:text-gray-400 mt-3">
//             Loading emergency history...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
//         <div className="flex items-center text-red-800 dark:text-red-200">
//           <FiAlertTriangle className="mr-2 h-5 w-5" />
//           <span>Error loading emergency history: {error.message}</span>
//         </div>
//       </div>
//     );
//   }

//   if (!data || data.length === 0) {
//     return (
//       <div className="border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 rounded-lg border p-8 text-center">
//         <FiAlertTriangle className="text-gray-400 dark:text-gray-500 mx-auto mb-4 h-12 w-12" />
//         <h3 className="text-gray-900 dark:text-gray-100 mb-2 text-lg font-medium">
//           No Emergency Purchase Orders Found
//         </h3>
//         <p className="text-gray-600 dark:text-gray-400">
//           Start by creating your first emergency purchase order.
//         </p>
//       </div>
//     );
//   }

//   // Sort POs by number (descending)
//   const sortedData = [...data].sort((a, b) => b.poNumber - a.poNumber);

//   return (
//     <div className="space-y-6">
//       {sortedData.map((po) => {
//         const isPOExpanded = expandedPOs.has(po.poNumber);
//         const groupedMaterials = getGroupedMaterials(po);
//         const categories = Object.keys(groupedMaterials);
//         const totalMaterials = po.purchaseMaterials?.length || 0;
//         const totalQuantity =
//           po.purchaseMaterials?.reduce((sum, m) => sum + m.quantity, 0) || 0;

//         return (
//           <div
//             key={po.poNumber}
//             className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-black"
//           >
//             {/* PO Header */}
//             <div className="bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <button
//                     onClick={() => togglePOExpansion(po.poNumber)}
//                     className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
//                   >
//                     {isPOExpanded ? (
//                       <FiChevronDown className="h-5 w-5" />
//                     ) : (
//                       <FiChevronRight className="h-5 w-5" />
//                     )}
//                     <h3 className="text-gray-900 dark:text-gray-100 text-lg font-semibold">
//                       Emergency PO #{po.poNumber} - {po.eventName}
//                     </h3>
//                   </button>
//                   <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
//                     Emergency
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-4">
//                   <div className="text-right">
//                     <div className="text-gray-600 dark:text-gray-400 text-sm">
//                       {totalMaterials} materials • {totalQuantity} total
//                       quantity
//                     </div>
//                     <div className="text-gray-600 dark:text-gray-400 text-sm">
//                       Created:{' '}
//                       {formatDate(po.createdAt || new Date().toISOString())}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* PO Details - Expandable Section */}
//             {isPOExpanded && (
//               <div className="p-0">
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
//                     <thead className="h-16 rounded-t-md bg-blue-900 text-white dark:bg-blue-950">
//                       <tr>
//                         <th className="px-4 py-3 text-left text-sm font-semibold">
//                           Category / Material
//                         </th>
//                         <th className="px-4 py-3 text-left text-sm font-semibold">
//                           Qty
//                         </th>
//                         <th className="px-4 py-3 text-left text-sm font-semibold">
//                           Unit
//                         </th>
//                         <th className="px-4 py-3 text-left text-sm font-semibold">
//                           Date
//                         </th>
//                         <th className="px-4 py-3 text-left text-sm font-semibold">
//                           Time
//                         </th>
//                         <th className="px-4 py-3 text-left text-sm font-semibold">
//                           Location
//                         </th>
//                         <th className="px-4 py-3 text-left text-sm font-semibold">
//                           Vendor
//                         </th>
//                         <th className="px-4 py-3 text-left text-sm font-semibold">
//                           Contact
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-stroke bg-white dark:divide-strokedark dark:bg-black">
//                       {categories.map((category) => {
//                         const isCategoryExpanded =
//                           expandedCategories.has(category);
//                         const categoryMaterials = groupedMaterials[category];
//                         const categoryQuantity = categoryMaterials.reduce(
//                           (sum, m) => sum + m.quantity,
//                           0,
//                         );

//                         return (
//                           <React.Fragment key={category}>
//                             {/* Category Header Row */}
//                             <tr className="dark:bg-gray-800 bg-gray-2 px-4 py-4 font-bold text-black dark:text-white">
//                               <td colSpan={8} className="px-4 py-3">
//                                 <div className="flex items-center justify-between">
//                                   <div
//                                     className="flex cursor-pointer items-center gap-2"
//                                     onClick={() =>
//                                       toggleCategoryExpansion(category)
//                                     }
//                                   >
//                                     {isCategoryExpanded ? (
//                                       <FiChevronDown className="h-4 w-4" />
//                                     ) : (
//                                       <FiChevronRight className="h-4 w-4" />
//                                     )}
//                                     <span className="text-gray-800 dark:text-gray-200 font-semibold">
//                                       {category}
//                                     </span>
//                                     <span className="text-gray-600 dark:text-gray-400 text-sm">
//                                       ({categoryMaterials.length} materials)
//                                     </span>
//                                     <span className="text-gray-600 dark:text-gray-400 ml-2 text-sm">
//                                       • Qty: {categoryQuantity}
//                                     </span>
//                                   </div>
//                                 </div>
//                               </td>
//                             </tr>

//                             {/* Category Details - Show when expanded */}
//                             {isCategoryExpanded &&
//                               categoryMaterials.map((material, index) => (
//                                 <tr
//                                   key={index}
//                                   className={`hover:bg-gray-100 dark:hover:bg-gray-800 ${index % 2 === 0 ? 'bg-white dark:bg-black' : 'bg-gray-50 dark:bg-gray-900'}`}
//                                 >
//                                   <td className="text-gray-800 dark:text-gray-200 px-4 py-3 text-sm font-medium">
//                                     <div>{material.materialName}</div>
//                                   </td>
//                                   <td className="px-4 py-3 text-center">
//                                     <span className="rounded bg-blue-50 px-2 py-1 text-sm font-medium dark:bg-blue-900/20 dark:text-blue-300">
//                                       {material.quantity}
//                                     </span>
//                                   </td>
//                                   <td className="text-gray-600 dark:text-gray-400 px-4 py-3 text-center text-sm">
//                                     units
//                                   </td>
//                                   <td className="px-4 py-3 text-center text-sm">
//                                     {material.date
//                                       ? formatDisplayDate(material.date)
//                                       : '-'}
//                                   </td>
//                                   <td className="px-4 py-3 text-center text-sm">
//                                     {material.time
//                                       ? formatDisplayTime(material.time)
//                                       : '-'}
//                                   </td>
//                                   <td className="text-gray-600 dark:text-gray-400 max-w-[100px] truncate px-4 py-3 text-center text-sm">
//                                     {material.venue}
//                                   </td>
//                                   <td className="max-w-[120px] truncate px-4 py-3 text-center text-sm">
//                                     <div className="font-medium">
//                                       {material.vendor?.name}
//                                     </div>
//                                   </td>
//                                   <td className="px-4 py-3 text-center text-sm">
//                                     <div>{material.vendor?.phone}</div>
//                                     {material.vendor?.email && (
//                                       <div className="text-gray-500 dark:text-gray-400 mt-1 text-xs">
//                                         {material.vendor.email}
//                                       </div>
//                                     )}
//                                   </td>
//                                 </tr>
//                               ))}
//                           </React.Fragment>
//                         );
//                       })}

//                       {categories.length === 0 && (
//                         <tr>
//                           <td
//                             colSpan={8}
//                             className="border-gray-300 text-gray-700 dark:text-gray-300 border-t px-4 py-8 text-center text-sm dark:border-strokedark"
//                           >
//                             <div className="py-4">
//                               <FiAlertTriangle className="text-gray-400 dark:text-gray-500 mx-auto h-12 w-12" />
//                               <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg font-medium">
//                                 No materials found
//                               </p>
//                             </div>
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* PO Footer Info */}
//                 <div className="bg-gray-50 dark:bg-gray-900 border-t border-stroke px-4 py-3 dark:border-strokedark">
//                   <div className="flex items-center justify-between">
//                     <div className="text-gray-600 dark:text-gray-400 text-sm">
//                       <p>
//                         PO #{po.poNumber} • Event: {po.eventName}
//                       </p>
//                     </div>
//                     <div className="text-gray-600 dark:text-gray-400 text-sm">
//                       <p>
//                         {totalMaterials} materials in {categories.length}{' '}
//                         categories
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// const CustommoduleEvent = () => {
//   const {id} = Route.useParams();
//   const navigate = useNavigate();
//   const {mutate: submitPO, isPending: isSubmitting} =
//     useSubmitPurchaseOrderEvent(id);

//   const {
//     data: emergencyPoResponse,
//     isLoading: emergencyLoading,
//     error: emergencyError,
//   } = useGetcustomReportById(id);

//   const {data: rawMaterialData, isLoading: isMaterialsLoading} =
//     useGetRawMaterialsCateror();

//   const {data: vendorsResponse, isLoading: isLoadingVendors} =
//     useGetVendorsPo();

//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
//   const [selectedMaterials, setSelectedMaterials] = useState<
//     SelectedMaterial[]
//   >([]);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [categoryConfigs, setCategoryConfigs] = useState<{
//     [category: string]: {
//       date: string;
//       time: string;
//       venue: string;
//       vendorId?: string;
//       price?: number;
//     };
//   }>({});

//   const {
//     handleSubmit,
//     formState: {errors},
//     reset,
//   } = useForm({
//     resolver: zodResolver(poSubmissionValidationSchema),
//     defaultValues: {
//       materials: [],
//     },
//   });

//   // Extract vendors from response
//   const vendors: Vendor[] = useMemo(() => {
//     const vendorsData = vendorsResponse?.data || vendorsResponse || [];
//     return vendorsData;
//   }, [vendorsResponse]);

//   // Get available materials
//   const availableMaterials = useMemo(() => {
//     if (!rawMaterialData?.data?.rawMaterials) return [];
//     return rawMaterialData.data.rawMaterials.map((material: any) => ({
//       id: material.id,
//       name: material.name,
//       category: material.category,
//       categoryId: material.categoryId,
//       unit: material.unit,
//       amount: material.amount,
//       inventory: material.inventory,
//       caterorId: material.caterorId,
//       languageId: material.languageId,
//       createdAt: material.createdAt,
//       updatedAt: material.updatedAt,
//     }));
//   }, [rawMaterialData]);

//   // Get unique categories
//   const categories = useMemo(() => {
//     const uniqueCategories: {id: string; name: string}[] = [];
//     const categoryMap = new Map();
//     availableMaterials.forEach((material) => {
//       if (material.category && !categoryMap.has(material.category.id)) {
//         categoryMap.set(material.category.id, material.category);
//         uniqueCategories.push({
//           id: material.category.id,
//           name: material.category.name,
//         });
//       }
//     });
//     return uniqueCategories.sort((a, b) => a.name.localeCompare(b.name));
//   }, [availableMaterials]);

//   // Filter materials by category
//   const filteredMaterials = useMemo(() => {
//     if (!selectedCategory) return availableMaterials;
//     return availableMaterials.filter(
//       (material) => material.category.id === selectedCategory,
//     );
//   }, [availableMaterials, selectedCategory]);

//   // Get vendor options for a category
//   const getVendorOptions = useMemo(() => {
//     return (category: string, categoryId?: string) => {
//       if (!vendors || vendors.length === 0) {
//         return [];
//       }
//       // Return all vendors without category filtering to prevent cross-category issues
//       return vendors.map((vendor) => ({
//         id: vendor.id,
//         label: vendor.name,
//         price: 0, // Default price
//       }));
//     };
//   }, [vendors]);

//   // Handle material selection
//   const handleMaterialToggle = (materialId: string) => {
//     setSelectedMaterialIds((prev) => {
//       const isSelected = prev.includes(materialId);
//       if (isSelected) {
//         // Remove material from selected table
//         setSelectedMaterials((prevMaterials) =>
//           prevMaterials.filter((m) => m.id !== materialId),
//         );
//         return prev.filter((id) => id !== materialId);
//       } else {
//         // Add material to selected table
//         const material = availableMaterials.find((m) => m.id === materialId);
//         if (material) {
//           const vendorOptions = getVendorOptions(
//             material.category.name,
//             material.categoryId,
//           );
//           const newSelectedMaterial: SelectedMaterial = {
//             ...material,
//             quantity: 1,
//             date: new Date().toISOString().split('T')[0],
//             time: '09:00',
//             venue: '',
//             vendorId:
//               vendorOptions.length > 0 ? vendorOptions[0].id : undefined,
//             price: material.amount || 0,
//             totalAmount: (material.amount || 0) * 1,
//           };
//           setSelectedMaterials((prev) => [...prev, newSelectedMaterial]);
//         }
//         return [...prev, materialId];
//       }
//     });
//   };

//   // Remove selected material
//   const handleRemoveMaterial = (materialId: string) => {
//     setSelectedMaterialIds((prev) => prev.filter((id) => id !== materialId));
//     setSelectedMaterials((prev) => prev.filter((m) => m.id !== materialId));
//   };

//   // Remove selected material chip
//   const removeMaterialChip = (materialId: string) => {
//     handleRemoveMaterial(materialId);
//   };

//   // Update selected material details
//   const updateSelectedMaterial = (
//     materialId: string,
//     field: keyof SelectedMaterial,
//     value: any,
//   ) => {
//     setSelectedMaterials((prev) =>
//       prev.map((material) => {
//         if (material.id === materialId) {
//           const updatedMaterial = {...material, [field]: value};

//           // Recalculate total amount when quantity or price changes
//           if (field === 'quantity' || field === 'price') {
//             const quantity = field === 'quantity' ? value : material.quantity;
//             const price = field === 'price' ? value : material.price || 0;
//             updatedMaterial.totalAmount = (quantity || 0) * (price || 0);
//           }

//           return updatedMaterial;
//         }
//         return material;
//       }),
//     );
//   };

//   // Apply category configuration to all items in a category
//   const applyCategoryConfig = (category: string) => {
//     const config = categoryConfigs[category];
//     if (!config) return;

//     setSelectedMaterials((prev) =>
//       prev.map((item) => {
//         if (item.category.name === category) {
//           const updatedItem = {
//             ...item,
//             date: config.date,
//             time: config.time,
//             venue: config.venue,
//             vendorId: config.vendorId,
//             price: config.price,
//           };

//           // Recalculate total amount
//           updatedItem.totalAmount =
//             (updatedItem.quantity || 0) * (updatedItem.price || 0);

//           return updatedItem;
//         }
//         return item;
//       }),
//     );
//   };

//   // Update category configuration
//   const updateCategoryConfig = (
//     category: string,
//     field: string,
//     value: string | number,
//   ) => {
//     setCategoryConfigs((prev) => ({
//       ...prev,
//       [category]: {
//         ...prev[category],
//         [field]: value,
//       },
//     }));
//   };

//   // Format time for API
//   const formatTimeForAPI = (date: string, time: string): string => {
//     if (!date || !time) return '';
//     return `${date}T${time}:00Z`;
//   };

//   // Handle form submission
//   const onSubmit = () => {
//     console.log('Submit button clicked');

//     if (selectedMaterials.length === 0) {
//       toast.error('Please select at least one material');
//       return;
//     }

//     const incompleteMaterials = selectedMaterials.filter(
//       (material) =>
//         !material.date ||
//         !material.time ||
//         !material.venue ||
//         material.quantity < 1 ||
//         !material.vendorId ||
//         !material.price,
//     );

//     if (incompleteMaterials.length > 0) {
//       toast.error(
//         'Please fill all fields for selected materials (date, time, venue, quantity, vendor, price)',
//       );
//       return;
//     }

//     const poData = {
//       eventId: id,
//       materials: selectedMaterials.map((material) => ({
//         materialId: material.id,
//         quantity: material.quantity,
//         date: material.date,
//         time: formatTimeForAPI(material.date, material.time),
//         venue: material.venue,
//         vendorId: material.vendorId,
//         price: material.price,
//         totalAmount: material.totalAmount,
//       })),
//     };

//     console.log('Submitting Emergency PO Data:', poData);

//     try {
//       poSubmissionValidationSchema.parse(poData);
//       console.log('Validation passed, submitting...');

//       submitPO(poData, {
//         onSuccess: (response) => {
//           reset();
//           setSelectedMaterials([]);
//           setSelectedMaterialIds([]);
//           setSelectedCategory('');
//           setIsDropdownOpen(false);
//           navigate({to: `/events/${id}`});
//         },
//         onError: (error: any) => {
//           console.error('Submission error:', error);
//           toast.error(
//             error?.response?.data?.message ||
//               error?.message ||
//               'Failed to submit Emergency PO!',
//           );
//         },
//       });
//     } catch (validationError: any) {
//       console.error('Validation error:', validationError);
//       toast.error('Validation failed! Please check all fields.');
//     }
//   };

//   const handleCancel = () => {
//     navigate({to: '/events/$id', params: {id: id}});
//   };

//   // Handle form submission with event prevention
//   const handleFormSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSubmit();
//   };

//   // Define columns for selected materials table
//   const selectedMaterialsColumns = [
//     {
//       header: 'Material Name',
//       accessor: 'name' as keyof SelectedMaterial,
//       render: (item: SelectedMaterial) => (
//         <div className="text-gray-900 dark:text-gray-100 font-medium">
//           {item.name}
//         </div>
//       ),
//     },
//     {
//       header: 'Quantity',
//       accessor: 'quantity' as keyof SelectedMaterial,
//       render: (item: SelectedMaterial) => (
//         <input
//           type="number"
//           value={item.quantity}
//           onChange={(e) =>
//             updateSelectedMaterial(
//               item.id,
//               'quantity',
//               parseInt(e.target.value) || 1,
//             )
//           }
//           className="border-gray-300 dark:border-gray-600 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//           min="1"
//         />
//       ),
//     },
//     {
//       header: 'Unit',
//       accessor: 'unit' as keyof SelectedMaterial,
//       render: (item: SelectedMaterial) => (
//         <div className="text-gray-600 dark:text-gray-400">{item.unit}</div>
//       ),
//     },
//     {
//       header: 'Date',
//       accessor: 'date' as keyof SelectedMaterial,
//       render: (item: SelectedMaterial) => (
//         <input
//           type="date"
//           value={item.date}
//           onChange={(e) =>
//             updateSelectedMaterial(item.id, 'date', e.target.value)
//           }
//           className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//           required
//         />
//       ),
//     },
//     {
//       header: 'Time',
//       accessor: 'time' as keyof SelectedMaterial,
//       render: (item: SelectedMaterial) => (
//         <input
//           type="time"
//           value={item.time}
//           onChange={(e) =>
//             updateSelectedMaterial(item.id, 'time', e.target.value)
//           }
//           className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//           required
//         />
//       ),
//     },
//     {
//       header: 'Venue',
//       accessor: 'venue' as keyof SelectedMaterial,
//       render: (item: SelectedMaterial) => (
//         <input
//           type="text"
//           value={item.venue}
//           onChange={(e) =>
//             updateSelectedMaterial(item.id, 'venue', e.target.value)
//           }
//           className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//           placeholder="Enter venue"
//           required
//         />
//       ),
//     },
//     {
//       header: 'Vendor',
//       accessor: 'vendorId' as keyof SelectedMaterial,
//       render: (item: SelectedMaterial) => {
//         const vendorOptions = getVendorOptions(
//           item.category.name,
//           item.categoryId,
//         );
//         return (
//           <select
//             value={item.vendorId || ''}
//             onChange={(e) => {
//               const value = e.target.value;
//               if (!value) {
//                 updateSelectedMaterial(item.id, 'vendorId', '');
//                 return;
//               }
//               const opt = vendorOptions.find((o) => o.id === value);
//               if (opt) {
//                 updateSelectedMaterial(item.id, 'vendorId', value);
//               }
//             }}
//             className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//           >
//             <option value="">Select vendor</option>
//             {vendorOptions.map((o) => (
//               <option key={o.id} value={o.id}>
//                 {o.label}
//               </option>
//             ))}
//             {vendorOptions.length === 0 && (
//               <option value="" disabled>
//                 No vendors available
//               </option>
//             )}
//           </select>
//         );
//       },
//     },
//     {
//       header: 'Price',
//       accessor: 'price' as keyof SelectedMaterial,
//       render: (item: SelectedMaterial) => (
//         <input
//           type="number"
//           step="0.01"
//           value={item.price || ''}
//           onChange={(e) => {
//             const newPrice = e.target.value
//               ? Number(e.target.value)
//               : undefined;
//             updateSelectedMaterial(item.id, 'price', newPrice);
//           }}
//           className="border-gray-300 dark:border-gray-600 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//           placeholder="0.00"
//         />
//       ),
//     },
//     {
//       header: 'Total Amount',
//       accessor: 'totalAmount' as keyof SelectedMaterial,
//       render: (item: SelectedMaterial) => (
//         <div className="text-gray-900 dark:text-gray-100 font-medium">
//           ₹{(item.totalAmount || 0).toFixed(2)}
//         </div>
//       ),
//     },
//     {
//       header: 'Actions',
//       accessor: 'id' as keyof SelectedMaterial,
//       render: (item: SelectedMaterial) => (
//         <button
//           type="button"
//           onClick={() => handleRemoveMaterial(item.id)}
//           className="text-red-500 hover:text-red-700"
//         >
//           <FiTrash className="h-4 w-4" />
//         </button>
//       ),
//     },
//   ];

//   if (isMaterialsLoading || isLoadingVendors) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <div className="text-center">
//           <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
//           <p className="text-gray-600 mt-3">Loading data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Create Purchase Order Section */}
//       <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-md dark:border-black dark:bg-black">
//         <h2 className="text-gray-900 dark:text-gray-100 mb-6 text-xl font-semibold">
//           Create Emergency Purchase Order
//         </h2>

//         <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
//           {/* Material Selection Section */}
//           <div className="border-gray-200 p-4 dark:border-black dark:bg-black">
//             <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
//               <div>
//                 <label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm font-medium">
//                   Category
//                 </label>
//                 <select
//                   value={selectedCategory}
//                   onChange={(e) => setSelectedCategory(e.target.value)}
//                   className="border-gray-300 dark:border-gray-900 w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//                 >
//                   <option value="">All Categories</option>
//                   {categories.map((category) => (
//                     <option key={category.id} value={category.id}>
//                       {category.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="relative">
//                 <label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm font-medium">
//                   Raw Materials
//                 </label>
//                 <div className="relative">
//                   <button
//                     type="button"
//                     onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                     className="border-gray-300 dark:border-gray-900 flex w-full items-center justify-between rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary focus:ring-2 active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
//                   >
//                     <span className="text-gray-700 dark:text-gray-300">
//                       {selectedMaterialIds.length > 0
//                         ? `${selectedMaterialIds.length} material(s) selected`
//                         : 'Select materials...'}
//                     </span>
//                     <FiPlus
//                       className={`transform transition-transform ${isDropdownOpen ? 'rotate-45' : ''}`}
//                     />
//                   </button>

//                   {selectedMaterialIds.length > 0 && (
//                     <div className="mt-2 flex flex-wrap gap-2">
//                       {selectedMaterialIds.map((materialId) => {
//                         const material = availableMaterials.find(
//                           (m) => m.id === materialId,
//                         );
//                         return (
//                           <span
//                             key={materialId}
//                             className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
//                           >
//                             {material?.name}
//                             <button
//                               type="button"
//                               onClick={() => removeMaterialChip(materialId)}
//                               className="ml-2 hover:text-blue-600 dark:hover:text-blue-400"
//                             >
//                               <FiX className="h-3 w-3" />
//                             </button>
//                           </span>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {isDropdownOpen && (
//                     <div className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded border border-stroke bg-white shadow-lg dark:bg-form-input">
//                       <div className="p-2">
//                         {isMaterialsLoading ? (
//                           <div className="text-gray-500 dark:text-gray-400 px-3 py-2 text-sm">
//                             Loading materials...
//                           </div>
//                         ) : filteredMaterials.length === 0 ? (
//                           <div className="text-gray-500 dark:text-gray-400 px-3 py-2 text-sm">
//                             No materials found
//                           </div>
//                         ) : (
//                           filteredMaterials.map((material: Material) => (
//                             <label
//                               key={material.id}
//                               className="dark:hover:bg-gray-900 flex cursor-pointer items-center rounded px-3 py-2"
//                             >
//                               <input
//                                 type="checkbox"
//                                 checked={selectedMaterialIds.includes(
//                                   material.id,
//                                 )}
//                                 onChange={() =>
//                                   handleMaterialToggle(material.id)
//                                 }
//                                 className="border-gray-300 dark:border-gray-900 dark:bg-gray-900 h-4 w-4 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
//                               />
//                               <span className="text-gray-700 dark:text-gray-300 ml-3 text-sm">
//                                 {material.name}
//                                 <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">
//                                   ({material.category?.name}) • {material.unit}{' '}
//                                   • ₹{material.amount}
//                                 </span>
//                               </span>
//                             </label>
//                           ))
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Selected Materials Table */}
//           {selectedMaterials.length > 0 && (
//             <div className="border-gray-200 p-4 dark:border-black dark:bg-black">
//               <h3 className="text-gray-900 dark:text-gray-100 mb-4 text-lg font-medium">
//                 Selected Materials Details ({selectedMaterials.length} items)
//               </h3>
//               <div className="overflow-x-auto">
//                 <table className="divide-gray-200 dark:divide-gray-700 min-w-full divide-y">
//                   <thead className="bg-gray-50 dark:bg-gray-800">
//                     <tr>
//                       {selectedMaterialsColumns.map((column) => (
//                         <th
//                           key={column.accessor.toString()}
//                           className="text-gray-700 dark:text-gray-300 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
//                         >
//                           {column.header}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody className="divide-gray-200 dark:divide-gray-700 divide-y bg-white dark:bg-black">
//                     {selectedMaterials.map((item) => (
//                       <tr key={item.id}>
//                         {selectedMaterialsColumns.map((column) => (
//                           <td
//                             key={column.accessor.toString()}
//                             className="whitespace-nowrap px-3 py-2"
//                           >
//                             {column.render(item)}
//                           </td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           <div className="flex justify-end space-x-4 dark:bg-black">
//             <button
//               type="button"
//               onClick={handleCancel}
//               className="border-gray-300 dark:border-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border px-6 py-2 font-semibold transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isSubmitting || selectedMaterials.length === 0}
//               className="disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition-colors dark:bg-primary"
//             >
//               <FiSave className="h-4 w-4" />
//               {isSubmitting ? 'Submitting...' : 'Submit Emergency PO'}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Emergency History Section */}
//       <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-md dark:border-black dark:bg-black">
//         <div className="mb-6 flex items-center justify-between">
//           <div>
//             <h2 className="text-gray-900 dark:text-gray-100 text-xl font-semibold">
//               Emergency Purchase History
//             </h2>
//             <p className="text-gray-600 dark:text-gray-400 text-sm">
//               Track all emergency purchase orders for this event
//             </p>
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
//               {emergencyPoResponse?.formatted?.length || 0} Emergency PO
//               {emergencyPoResponse?.formatted?.length !== 1 ? 's' : ''}
//             </span>
//             {emergencyLoading && (
//               <div className="text-gray-500 flex items-center text-sm">
//                 <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
//                 Loading...
//               </div>
//             )}
//           </div>
//         </div>

//         <EmergencyHistoryTable
//           data={emergencyPoResponse?.formatted || []}
//           loading={emergencyLoading}
//           error={emergencyError}
//         />
//       </div>
//     </div>
//   );
// };

// export default CustommoduleEvent;
