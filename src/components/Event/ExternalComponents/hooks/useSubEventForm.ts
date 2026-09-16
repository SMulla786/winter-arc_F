// // hooks/useSubEventForm.ts
// import {useState, useEffect, useRef, useMemo} from 'react';
// import {toast} from 'react-hot-toast';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
// import type {CateringPackage, Dish, ExtraDish} from '../types';

// import {
//   useGetExternalSubeventById,
//   useGetExternalDishesByCaterorId,
//   useGetExternalAllPackagesByCaterorId,
//   useGetExternalSinglePackageById,
//   useGetExternalAddonServicesByCaterorId,
//   useGetCaterorById,
//   useUpdateExternalSubevent,
//   useGetExternalAllPackagesBySubEventId,
// } from '../index';

// export interface FormattedPackage {
//   pkg: {
//     id: string;
//     price: number;
//     description?: string;
//   };
//   packageName: string;
//   categories: Array<{
//     categoryName: string;
//     totalDishes: number;
//   }>;
// }

// export interface FilteredService {
//   id: string;
//   name: string;
//   cost: number;
// }

// export interface GroupedDishes {
//   VEG: Record<string, Dish[]>;
//   NONVEG: Record<string, Dish[]>;
// }

// export interface UseSubEventFormReturn {
//   // State
//   selectedPackage: CateringPackage | null;
//   selectedDishes: string[];
//   selectedFeature: 'NONE' | 'PACKAGE' | 'DISH';
//   activeTab: 'VEG' | 'NONVEG';
//   setActiveTab: (tab: 'VEG' | 'NONVEG') => void;
//   isInitialLoading: boolean;
//   extraDishes: ExtraDish[];
//   selectedAddons: string[];
//   expandedCategories: string[];
//   setExpandedCategories: React.Dispatch<React.SetStateAction<string[]>>;
//   expandedPackageCategories: string[];
//   setExpandedPackageCategories: React.Dispatch<React.SetStateAction<string[]>>;
//   note: string;
//   showSummary: boolean;
//   printRef: React.RefObject<HTMLDivElement>;

//   // Data from API
//   subEvent: any;
//   dishes: Dish[];
//   packages: any[];
//   singlePackage: any;
//   additionalServices: any[];
//   cateror: any;
//   formattedPackages: FormattedPackage[];
//   filteredAdditionalServices: FilteredService[];
//   groupedDishes: GroupedDishes;
//   lastUpdated?: string;
//   isPending: boolean;

//   // Actions
//   setSelectedPackage: (pkg: CateringPackage | null) => void;
//   setSelectedDishes: React.Dispatch<React.SetStateAction<string[]>>;
//   setSelectedFeature: (feature: 'NONE' | 'PACKAGE' | 'DISH') => void;
//   setNote: (note: string) => void;
//   setShowSummary: (show: boolean) => void;
//   toggleCategory: (cat: string) => void;
//   togglePackageCategory: (cat: string) => void;
//   handleBackToOptions: () => void;
//   handleDishToggle: (dishName: string) => void;
//   handleAddonToggle: (addonId: string) => void;
//   handleDownloadPdf: () => Promise<void>;
//   handleSubmit: () => void;
//   validateDishes: () => string | null;
// }

// export const useSubEventForm = (
//   subEventId: string,
//   caterorId: string,
// ): UseSubEventFormReturn => {
//   const printRef = useRef<HTMLDivElement>(null);

//   // State
//   const [selectedPackage, setSelectedPackage] =
//     useState<CateringPackage | null>(null);
//   const [selectedDishes, setSelectedDishes] = useState<string[]>([]);
//   const [selectedFeature, setSelectedFeature] = useState<
//     'NONE' | 'PACKAGE' | 'DISH'
//   >('NONE');
//   const [activeTab, setActiveTab] = useState<'VEG' | 'NONVEG'>('VEG');
//   const [isInitialLoading, setIsInitialLoading] = useState(true);
//   const [extraDishes, setExtraDishes] = useState<ExtraDish[]>([]);
//   const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
//   const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
//   const [expandedPackageCategories, setExpandedPackageCategories] = useState<
//     string[]
//   >([]);
//   const [note, setNote] = useState<string>('');
//   const [showSummary, setShowSummary] = useState(false);

//   // API Hooks
//   const {data: subEventResponse} = useGetExternalSubeventById(subEventId);
//   const {data: dishesResponse} = useGetExternalDishesByCaterorId(caterorId);
//   const {data: packages} = useGetExternalAllPackagesByCaterorId(caterorId);
//   const {data: singlePackage} = useGetExternalSinglePackageById(
//     selectedPackage?.id || subEventResponse?.subEvent?.packageId,
//   );
//   const {data: additionalServices} =
//     useGetExternalAddonServicesByCaterorId(caterorId);
//   const {mutate: updateSubEvent, isPending} =
//     useUpdateExternalSubevent(subEventId);
//   const {data: caterorResponse} = useGetCaterorById(caterorId);
//   const {data: packagesBySubEventId} = useGetExternalAllPackagesBySubEventId(
//     caterorId,
//     subEventId,
//   );

//   const dishes = dishesResponse?.dishes || [];
//   const lastUpdated = subEventResponse?.subEvent?.lastUpdated;

//   // Memoized formatted packages for display (matching main component structure)
//   const formattedPackages = useMemo(() => {
//     return (
//       packagesBySubEventId?.map((pkg: any) => ({
//         pkg: {
//           id: pkg.id,
//           price: pkg.price,
//           description: pkg.description,
//         },
//         packageName: pkg.name,
//         categories:
//           pkg.packageDishes?.map((dish: any) => ({
//             categoryName: dish.categoryName,
//             totalDishes: dish.count,
//           })) || [],
//       })) || []
//     );
//   }, [packagesBySubEventId]);

//   // Memoized filtered additional services
//   const filteredAdditionalServices = useMemo(() => {
//     return (
//       additionalServices?.map((service: any) => ({
//         id: service.id,
//         name: service.name,
//         cost: service.price,
//       })) || []
//     );
//   }, [additionalServices]);

//   // Memoized grouped dishes (matching main component logic)
//   const groupedDishes = useMemo(() => {
//     return dishes.reduce(
//       (acc: GroupedDishes, dish: Dish) => {
//         const key = dish.vegNonveg;
//         if (!acc[key]) acc[key] = {};
//         if (!acc[key][dish.category.name]) acc[key][dish.category.name] = [];
//         acc[key][dish.category.name].push(dish);
//         return acc;
//       },
//       {VEG: {}, NONVEG: {}},
//     );
//   }, [dishes]);

//   // 5-second splash loader
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsInitialLoading(false);
//     }, 2000);
//     return () => clearTimeout(timer);
//   }, []);

//   // Load saved data from subEvent
//   useEffect(() => {
//     if (!subEventResponse) return;

//     if (subEventResponse?.subEvent?.packageId && singlePackage) {
//       setSelectedFeature('PACKAGE');
//       setSelectedPackage({
//         id: singlePackage.id,
//         name: singlePackage.name,
//         price: singlePackage.packageRange?.[0]?.price,
//         dishes:
//           singlePackage.packageDishes?.map((pd: any) => pd.dish.name) || [],
//       });
//     } else if (subEventResponse?.subEvent?.dishes?.length > 0) {
//       setSelectedFeature('DISH');
//       setSelectedDishes(
//         subEventResponse.subEvent.dishes
//           .map((d: any) => (typeof d === 'string' ? d : d.name || d.dish?.name))
//           .filter(Boolean),
//       );
//       setSelectedAddons(
//         subEventResponse.SubeventAddonServices?.map(
//           (a: any) => a.addonService.id,
//         ) || [],
//       );
//     }
//   }, [subEventResponse, singlePackage]);

//   // Load extra dishes when package changes
//   useEffect(() => {
//     if (singlePackage?.extraDishes) {
//       setExtraDishes(
//         singlePackage.extraDishes.map((extra: any) => ({
//           id: extra.id,
//           name: extra.dish.name,
//           description: extra.dish.description,
//           vegNonveg: extra.dish.vegNonveg,
//           cost: extra.cost,
//           selectCount: extra.selectCount,
//           categoryId: extra.categoryId,
//         })),
//       );
//     } else {
//       setExtraDishes([]);
//     }
//   }, [singlePackage]);

//   // Handlers
//   const toggleCategory = (cat: string) => {
//     setExpandedCategories((prev) =>
//       prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
//     );
//   };

//   const togglePackageCategory = (cat: string) => {
//     setExpandedPackageCategories((prev) =>
//       prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
//     );
//   };

//   const handleBackToOptions = () => {
//     setSelectedFeature('NONE');
//     setSelectedPackage(null);
//     setSelectedDishes([]);
//     setExtraDishes([]);
//   };

//   const handleDishToggle = (dishName: string) => {
//     const pkgDish = singlePackage?.packageDishes?.find(
//       (pd: any) => pd.dish.name === dishName,
//     );
//     const extraDish = extraDishes.find((ed) => ed.name === dishName);
//     const categoryId = pkgDish?.category?.id || extraDish?.categoryId;
//     const selectCount =
//       pkgDish?.selectCount || extraDish?.selectCount || Infinity;

//     const currentCount = selectedDishes.filter((d) => {
//       const dishPkgDish = singlePackage?.packageDishes?.find(
//         (pd: any) => pd.dish.name === d,
//       );
//       const dishExtraDish = extraDishes.find((ed) => ed.name === d);
//       return (
//         dishPkgDish?.category?.id === categoryId ||
//         dishExtraDish?.categoryId === categoryId
//       );
//     }).length;

//     setSelectedDishes((prev) => {
//       if (prev.includes(dishName)) {
//         return prev.filter((d) => d !== dishName);
//       }
//       if (currentCount >= selectCount) {
//         toast.error(
//           `Maximum ${selectCount} dish(es) allowed for this category`,
//         );
//         return prev;
//       }
//       return [...prev, dishName];
//     });
//   };

//   const handleAddonToggle = (addonId: string) => {
//     setSelectedAddons((prev) =>
//       prev.includes(addonId)
//         ? prev.filter((id) => id !== addonId)
//         : [...prev, addonId],
//     );
//   };

//   const validateDishes = (): string | null => {
//     if (!singlePackage || selectedFeature !== 'PACKAGE') return null;

//     const checkCategory = (items: any[], key: 'category' | 'categoryId') => {
//       const counts = items.reduce((acc: any, item: any) => {
//         const id =
//           item[key === 'category' ? 'category' : 'categoryId']?.id ||
//           item.categoryId;
//         if (!acc[id]) acc[id] = {count: 0, required: item.selectCount};
//         if (selectedDishes.includes(item.dish?.name || item.name))
//           acc[id].count++;
//         return acc;
//       }, {});

//       for (const [id, {count, required}] of Object.entries(counts)) {
//         if (count !== required) {
//           const name =
//             items.find(
//               (i) =>
//                 (i[key === 'category' ? 'category' : 'categoryId']?.id ||
//                   i.categoryId) === id,
//             )?.category?.name || 'Unknown';
//           return `Please select exactly ${required} dishes for ${name} category.`;
//         }
//       }
//       return null;
//     };

//     const pkgError = checkCategory(
//       singlePackage.packageDishes || [],
//       'category',
//     );
//     if (pkgError) return pkgError;

//     if (extraDishes.length > 0) {
//       return checkCategory(extraDishes, 'categoryId');
//     }

//     return null;
//   };

//   const handleDownloadPdf = async () => {
//     if (!printRef.current) {
//       toast.error('PDF content not ready');
//       return;
//     }

//     try {
//       printRef.current.style.opacity = '1';
//       await new Promise((r) => setTimeout(r, 100));

//       const canvas = await html2canvas(printRef.current, {
//         scale: 2,
//         useCORS: true,
//         backgroundColor: null,
//         logging: false,
//         width: 794,
//         height: 1123,
//         windowWidth: 794,
//         windowHeight: 1123,
//       });

//       if (!canvas.width || !canvas.height) throw new Error('Empty canvas');

//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('p', 'mm', 'a4');
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = pdf.internal.pageSize.getHeight();
//       const ratio = canvas.width / canvas.height;
//       let width = pdfWidth;
//       let height = width / ratio;

//       if (height > pdfHeight) {
//         height = pdfHeight;
//         width = height * ratio;
//       }

//       pdf.addImage(
//         imgData,
//         'PNG',
//         (pdfWidth - width) / 2,
//         (pdfHeight - height) / 2,
//         width,
//         height,
//       );
//       pdf.save(`menu-${subEventId}-${Date.now()}.pdf`);

//       printRef.current.style.opacity = '0';
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to generate PDF');
//     }
//   };

//   const handleSubmit = () => {
//     const error = validateDishes();
//     if (error) {
//       toast.error(error, {duration: 5000});
//       return;
//     }

//     // Trigger PDF download first
//     // handleDownloadPdf();

//     console.log("SELECTED",selectedDishes);

//     // Then update the sub-event
//     updateSubEvent({
//       dishes: selectedDishes.map((dish) => ({
//         dishId: dish.dishId,
//         isExtra: dish.isExtra,
//       })),
//       packageId: selectedFeature === 'PACKAGE' ? selectedPackage?.id : null,
//       addon: selectedAddons,
//       note,
//       lastUpdated: new Date()
//         .toLocaleString('en-US', {timeZone: 'Asia/Kolkata'})
//         .replace(',', ''),
//     });
//   };

//   return {
//     // State
//     selectedPackage,
//     selectedDishes,
//     selectedFeature,
//     activeTab,
//     setActiveTab,
//     isInitialLoading,
//     extraDishes,
//     selectedAddons,
//     expandedCategories,
//     setExpandedCategories,
//     expandedPackageCategories,
//     setExpandedPackageCategories,
//     note,
//     showSummary,
//     printRef,

//     // Data
//     subEvent: subEventResponse?.subEvent,
//     dishes,
//     packages: packages || [],
//     singlePackage,
//     additionalServices: additionalServices || [],
//     cateror: caterorResponse?.data,
//     formattedPackages,
//     filteredAdditionalServices,
//     groupedDishes,
//     lastUpdated,
//     isPending,

//     // Setters
//     setSelectedPackage,
//     setSelectedDishes,
//     setSelectedFeature,
//     setNote,
//     setShowSummary,

//     // Handlers
//     toggleCategory,
//     togglePackageCategory,
//     handleBackToOptions,
//     handleDishToggle,
//     handleAddonToggle,
//     handleDownloadPdf,
//     handleSubmit,
//     validateDishes,
//   };
// };

// hooks/useSubEventForm.ts
import {useState, useEffect, useRef, useMemo} from 'react';
import {toast} from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type {CateringPackage, Dish, ExtraDish} from '../types';

import {
  useGetExternalSubeventById,
  useGetExternalDishesByCaterorId,
  useGetExternalAllPackagesByCaterorId,
  useGetExternalSinglePackageById,
  useGetExternalAddonServicesByCaterorId,
  useGetCaterorById,
  useUpdateExternalSubevent,
  useGetExternalAllPackagesBySubEventId,
} from '../index';

// ──────────────────────────────────────────────
// NEW INTERFACE for selected dishes
// ──────────────────────────────────────────────
export interface SelectedDish {
  dishId: string;
  dishName: string;
  // You can add more later if needed, e.g.:
  // isExtra?: boolean;
  // categoryId?: string;
}

// ──────────────────────────────────────────────
// Existing interfaces (unchanged)
// ──────────────────────────────────────────────
export interface FormattedPackage {
  pkg: {
    id: string;
    price: number;
    description?: string;
  };
  packageName: string;
  categories: Array<{
    categoryName: string;
    totalDishes: number;
  }>;
}

export interface FilteredService {
  id: string;
  name: string;
  cost: number;
}

export interface GroupedDishes {
  VEG: Record<string, Dish[]>;
  NONVEG: Record<string, Dish[]>;
}

export interface UseSubEventFormReturn {
  // State
  selectedPackage: CateringPackage | null;
  selectedDishes: SelectedDish[]; // ← changed type
  selectedFeature: 'NONE' | 'PACKAGE' | 'DISH';
  activeTab: 'VEG' | 'NONVEG';
  setActiveTab: (tab: 'VEG' | 'NONVEG') => void;
  isInitialLoading: boolean;
  extraDishes: ExtraDish[];
  selectedAddons: string[];
  expandedCategories: string[];
  setExpandedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  expandedPackageCategories: string[];
  setExpandedPackageCategories: React.Dispatch<React.SetStateAction<string[]>>;
  note: string;
  showSummary: boolean;
  printRef: React.RefObject<HTMLDivElement>;

  // Data from API
  subEvent: any;
  dishes: Dish[];
  packages: any[];
  singlePackage: any;
  additionalServices: any[];
  cateror: any;
  formattedPackages: FormattedPackage[];
  filteredAdditionalServices: FilteredService[];
  groupedDishes: GroupedDishes;
  lastUpdated?: string;
  isPending: boolean;

  // Actions
  setSelectedPackage: (pkg: CateringPackage | null) => void;
  setSelectedDishes: React.Dispatch<React.SetStateAction<SelectedDish[]>>; // ← changed
  setSelectedFeature: (feature: 'NONE' | 'PACKAGE' | 'DISH') => void;
  setNote: (note: string) => void;
  setShowSummary: (show: boolean) => void;
  toggleCategory: (cat: string) => void;
  togglePackageCategory: (cat: string) => void;
  handleBackToOptions: () => void;
  handleDishToggle: (dish: Dish) => void; // ← now takes full Dish
  handleAddonToggle: (addonId: string) => void;
  handleDownloadPdf: () => Promise<void>;
  handleSubmit: () => void;
  validateDishes: () => string | null;
}

export const useSubEventForm = (
  subEventId: string,
  caterorId: string,
): UseSubEventFormReturn => {
  const printRef = useRef<HTMLDivElement>(null);

  // ──────────────────────────────────────────────
  // State
  // ──────────────────────────────────────────────
  const [selectedPackage, setSelectedPackage] =
    useState<CateringPackage | null>(null);
  const [selectedDishes, setSelectedDishes] = useState<SelectedDish[]>([]); // ← changed
  const [selectedFeature, setSelectedFeature] = useState<
    'NONE' | 'PACKAGE' | 'DISH'
  >('NONE');
  const [activeTab, setActiveTab] = useState<'VEG' | 'NONVEG'>('VEG');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [extraDishes, setExtraDishes] = useState<ExtraDish[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedPackageCategories, setExpandedPackageCategories] = useState<
    string[]
  >([]);
  const [note, setNote] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);

  // ──────────────────────────────────────────────
  // API Hooks
  // ──────────────────────────────────────────────
  const {data: subEventResponse} = useGetExternalSubeventById(subEventId);
  const {data: dishesResponse} = useGetExternalDishesByCaterorId(caterorId);
  const {data: packages} = useGetExternalAllPackagesByCaterorId(caterorId);
  const {data: singlePackage} = useGetExternalSinglePackageById(
    selectedPackage?.id || subEventResponse?.subEvent?.packageId,
  );
  const {data: additionalServices} =
    useGetExternalAddonServicesByCaterorId(caterorId);
  const {mutate: updateSubEvent, isPending} =
    useUpdateExternalSubevent(subEventId);
  const {data: caterorResponse} = useGetCaterorById(caterorId);
  const {data: packagesBySubEventId} = useGetExternalAllPackagesBySubEventId(
    caterorId,
    subEventId,
  );

  const dishes = dishesResponse?.dishes || [];
  const lastUpdated = subEventResponse?.subEvent?.lastUpdated;

  // ──────────────────────────────────────────────
  // Memoized values (mostly unchanged)
  // ──────────────────────────────────────────────
  const formattedPackages = useMemo(() => {
    return (
      packagesBySubEventId?.map((pkg: any) => ({
        pkg: {
          id: pkg.id,
          price: pkg.price,
          description: pkg.description,
        },
        packageName: pkg.name,
        categories:
          pkg.packageDishes?.map((dish: any) => ({
            categoryName: dish.categoryName,
            totalDishes: dish.count,
          })) || [],
      })) || []
    );
  }, [packagesBySubEventId]);

  const filteredAdditionalServices = useMemo(() => {
    return (
      additionalServices?.map((service: any) => ({
        id: service.id,
        name: service.name,
        cost: service.price,
      })) || []
    );
  }, [additionalServices]);

  const groupedDishes = useMemo(() => {
    return dishes.reduce(
      (acc: GroupedDishes, dish: Dish) => {
        const key = dish.vegNonveg;
        if (!acc[key]) acc[key] = {};
        if (!acc[key][dish.category.name]) acc[key][dish.category.name] = [];
        acc[key][dish.category.name].push(dish);
        return acc;
      },
      {VEG: {}, NONVEG: {}},
    );
  }, [dishes]);

  // ──────────────────────────────────────────────
  // 5-second splash (unchanged)
  // ──────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // ──────────────────────────────────────────────
  // Load saved data from subEvent → now maps to SelectedDish[]
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (!subEventResponse?.subEvent) return;

    if (subEventResponse.subEvent.packageId && singlePackage) {
      setSelectedFeature('PACKAGE');
      setSelectedPackage({
        id: singlePackage.id,
        name: singlePackage.name,
        price: singlePackage.packageRange?.[0]?.price,
        dishes:
          singlePackage.packageDishes?.map((pd: any) => pd.dish.name) || [],
      });
    } else if (subEventResponse.subEvent.dishes?.length > 0) {
      setSelectedFeature('DISH');

      const loadedDishes: SelectedDish[] = subEventResponse.subEvent.dishes
        .map((d: any) => {
          const dishObj = d.dish || d; // handle nested or flat structure
          if (!dishObj?.id || !dishObj?.name) return null;
          return {
            dishId: dishObj.id,
            dishName: dishObj.name,
          };
        })
        .filter((item): item is SelectedDish => !!item);

      setSelectedDishes(loadedDishes);

      setSelectedAddons(
        subEventResponse.SubeventAddonServices?.map(
          (a: any) => a.addonService.id,
        ) || [],
      );
    }
  }, [subEventResponse, singlePackage]);

  useEffect(() => {
    if (singlePackage?.extraDishes) {
      setExtraDishes(
        singlePackage.extraDishes.map((extra: any) => ({
          id: extra.id,
          name: extra.dish.name,
          description: extra.dish.description,
          vegNonveg: extra.dish.vegNonveg,
          cost: extra.cost,
          selectCount: extra.selectCount,
          categoryId: extra.categoryId,
        })),
      );
    } else {
      setExtraDishes([]);
    }
  }, [singlePackage]);

  // ──────────────────────────────────────────────
  // Handlers
  // ──────────────────────────────────────────────
  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const togglePackageCategory = (cat: string) => {
    setExpandedPackageCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const handleBackToOptions = () => {
    setSelectedFeature('NONE');
    setSelectedPackage(null);
    setSelectedDishes([]);
    setExtraDishes([]);
  };

  // ──────────────────────────────────────────────
  // CHANGED: now takes full Dish object
  // ──────────────────────────────────────────────
  const handleDishToggle = (dish: Dish) => {
    const {id: dishId, name: dishName} = dish;

    if (!dishId || !dishName) {
      toast.error('Invalid dish data');
      return;
    }

    setSelectedDishes((prev) => {
      const alreadySelected = prev.some((s) => s.dishId === dishId);

      if (alreadySelected) {
        return prev.filter((s) => s.dishId !== dishId);
      }

      // ──────────────────────────────────────────────
      // Optional: add your category limit check here
      // (you'll need dish.category?.id and logic to get max per category)
      // For now left as placeholder — implement when needed
      // ──────────────────────────────────────────────

      return [...prev, {dishId, dishName}];
    });
  };

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId],
    );
  };

  const validateDishes = (): string | null => {
    if (!singlePackage || selectedFeature !== 'PACKAGE') return null;

    // TODO: Update this validation to work with selectedDishes (now objects)
    // You'll need to count by category using dishId → category lookup
    // For now returning null — please adjust according to your needs

    return null;
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) {
      toast.error('PDF content not ready');
      return;
    }

    try {
      printRef.current.style.opacity = '1';
      await new Promise((r) => setTimeout(r, 100));

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
      });

      if (!canvas.width || !canvas.height) throw new Error('Empty canvas');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      let width = pdfWidth;
      let height = width / ratio;

      if (height > pdfHeight) {
        height = pdfHeight;
        width = height * ratio;
      }

      pdf.addImage(
        imgData,
        'PNG',
        (pdfWidth - width) / 2,
        (pdfHeight - height) / 2,
        width,
        height,
      );
      pdf.save(`menu-${subEventId}-${Date.now()}.pdf`);

      printRef.current.style.opacity = '0';
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    }
  };

  const handleSubmit = () => {
    const error = validateDishes();
    if (error) {
      toast.error(error, {duration: 5000});
      return;
    }

    // handleDownloadPdf();

    updateSubEvent({
      dishes: selectedDishes.map((s) => ({
        dishId: s.dishId,
        isExtra: s.isExtra ?? false,
      })),
      packageId: selectedFeature === 'PACKAGE' ? selectedPackage?.id : null,
      addon: selectedAddons,
      note,
      lastUpdated: new Date()
        .toLocaleString('en-US', {timeZone: 'Asia/Kolkata'})
        .replace(',', ''),
    });
  };

  return {
    selectedPackage,
    selectedDishes,
    selectedFeature,
    activeTab,
    setActiveTab,
    isInitialLoading,
    extraDishes,
    selectedAddons,
    expandedCategories,
    setExpandedCategories,
    expandedPackageCategories,
    setExpandedPackageCategories,
    note,
    showSummary,
    printRef,

    subEvent: subEventResponse?.subEvent,
    dishes,
    packages: packages || [],
    singlePackage,
    additionalServices: additionalServices || [],
    cateror: caterorResponse?.data,
    formattedPackages,
    filteredAdditionalServices,
    groupedDishes,
    lastUpdated,
    isPending,

    setSelectedPackage,
    setSelectedDishes,
    setSelectedFeature,
    setNote,
    setShowSummary,

    toggleCategory,
    togglePackageCategory,
    handleBackToOptions,
    handleDishToggle, // now expects full Dish
    handleAddonToggle,
    handleDownloadPdf,
    handleSubmit,
    validateDishes,
  };
};
