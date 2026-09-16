/* eslint-disable  */
import React, {useEffect, useRef, useState} from 'react';
import {Route} from '@/routes/_app/_event/events.$id';
import toast from 'react-hot-toast';
import {api} from '@/utils/axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import GenericButton from '../Forms/Buttons/GenericButton';
import {z} from 'zod';
import {useGetClientById} from '@/lib/react-query/queriesAndMutations/cateror/client';
import {useGetQuatation} from '@/lib/react-query/queriesAndMutations/cateror/quatation';
import logo from '@/assets/images/logo/MenuImage2.jpg';
import {BiCategory, BiInfoCircle, BiPrinter} from 'react-icons/bi';
import {useAuthContext} from '@/context/AuthContext';
import {TbDragDrop} from 'react-icons/tb';
import {BsAppIndicator} from 'react-icons/bs';
import {useGetAllCutlery} from '@/lib/react-query/queriesAndMutations/cateror/cutlery';
import {FormProvider, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  useAddCutleryInSubEvent,
  useGetCutleryInSubEvent,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {useGetDishCategories} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';

// Zod schema for validation - KEEP srNo FOR BACKEND COMPATIBILITY
const managerMenuSchema = z.object({
  eventId: z.string(),
  subeventId: z.string(),
  categories: z.array(
    z.object({
      categoryId: z.string(),
      srNo: z.number().int().min(1, 'SR No must be at least 1'),
      dishes: z
        .array(
          z.object({
            dishId: z.string(),
            srNo: z.number().int().min(1, 'SR No must be at least 1'),
          }),
        )
        .nonempty()
        .min(1, 'At least one dish is required'),
    }),
  ),
});

const CutlerySection: React.FC<{
  subId: string;
  onSaveAndPreview?: () => void;
}> = ({subId, onSaveAndPreview}) => {
  const [cutleryIds, setCutleryIds] = useState<string[]>([]);

  const {data: response, isLoading, isError, error} = useGetAllCutlery();
  const {mutate: addCutlery} = useAddCutleryInSubEvent(subId ?? '');
  const {data: CutleryData} = useGetCutleryInSubEvent(subId ?? '');

  useEffect(() => {
    if (CutleryData) {
      const existingIds = CutleryData?.data?.map(
        (item: any) => item.cutloryId || item.cutlory?.id,
      );
      setCutleryIds(existingIds);
    }
  }, [CutleryData]);

  const handleToggle = (id: string) => {
    setCutleryIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  if (isLoading) return <p>Loading cutlery...</p>;
  if (isError) return <p className="text-red-500">Error: {error?.message}</p>;

  return (
    <div className="mt-10 flex flex-col gap-3">
      <label className="text-gray-900 dark:text-gray-100 text-lg font-semibold">
        Cutlery
      </label>

      <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent mt-1 flex gap-3 overflow-x-auto pb-3">
        {response?.map((item: any) => {
          const selected = cutleryIds.includes(item.id);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleToggle(item.id)}
              className={`dark:bg-gray-800 relative flex min-w-[160px] flex-col items-center rounded-xl border bg-white shadow-sm transition-all ${
                selected
                  ? 'ring-3 border-blue-500 ring-blue-300 dark:ring-blue-800'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="relative w-full min-w-[160px]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-28 w-full rounded-t-xl object-cover"
                />
                {selected && (
                  <div className="absolute right-2 top-2 rounded-md bg-blue-500 px-2 py-1 text-xs text-white">
                    Selected
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-1 p-1">
                <div className="text-center text-sm font-bold text-black dark:text-white">
                  {item.name}
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-sm font-bold">
                  ₹ {item.price || '0'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="mx-1 rounded bg-primary px-6 py-2 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => {
          addCutlery(cutleryIds?.map((item) => ({id: item})) || [], {
            onSuccess: () => {
              toast.success('Cutlery saved successfully');
              if (onSaveAndPreview) {
                onSaveAndPreview();
              }
            },
            onError: (error: any) => {
              toast.error(error?.message || 'Failed to save cutlery');
            },
          });
        }}
      >
        Save & Preview Manager Report
      </button>
    </div>
  );
};

const ManagerMenu: React.FC = () => {
  const {id: EventId} = Route.useParams();
  const eventId = EventId;
  const {user} = useAuthContext();

  const {data: profiledata} = useGetCaterorById(user?.caterorId || '');
  const catererLogo = profiledata?.data?.image || logo;

  const [subId, setSubId] = useState('');
  const [subEventMenus, setSubEventMenus] = useState<any[]>([]);
  const [subEventCategories, setSubEventCategories] = useState<any[][]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draggedCat, setDraggedCat] = useState<string | null>(null);
  const [draggedDish, setDraggedDish] = useState<{
    category: string;
    dishId: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isManagerLoading, setIsManagerLoading] = useState(false);
  const [includeLogo, setIncludeLogo] = useState<'with' | 'without'>('without');
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewType, setPreviewType] = useState<'menu' | 'manager'>('menu');

  // Add this mutation to get dish categories
  const {data: dishCategoriesResponse, isLoading: isLoadingDishCategories} =
    useGetDishCategories();

  const {
    data: quotation,
    isLoading: isQuotationLoading,
    refetch: refetchQuotation,
  } = useGetQuatation(eventId);

  const {data: client, isLoading: isClientLoading} = useGetClientById(
    quotation?.event?.clientId ?? '',
  );

  useEffect(() => {
    setSubId(subEventMenus?.[currentIndex]?.subeventId || '');
  }, [subEventMenus, currentIndex]);

  const categoriesContainerRef = useRef<HTMLDivElement>(null);

  const throttle = (func: Function, limit: number) => {
    let lastFunc: NodeJS.Timeout;
    let lastRan: number;
    return function (this: any, ...args: any[]) {
      const context = this;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(
          () => {
            if (Date.now() - lastRan >= limit) {
              func.apply(context, args);
              lastRan = Date.now();
            }
          },
          limit - (Date.now() - lastRan),
        );
      }
    };
  };

  const handleAutoScroll = throttle(
    (e: React.DragEvent, containerRef: React.RefObject<HTMLDivElement>) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const offset = 60;
      const scrollSpeed = 20;

      if (e.clientY < rect.top + offset) {
        container.scrollBy({top: -scrollSpeed, behavior: 'smooth'});
      } else if (e.clientY > rect.bottom - offset) {
        container.scrollBy({top: scrollSpeed, behavior: 'smooth'});
      }
    },
    50,
  );

  const categories = subEventCategories[currentIndex] || [];

  // Function to get priority from dish categories
  const getCategoryPriority = (categoryId: string): number => {
    if (!dishCategoriesResponse?.data?.categories) return 9999; // High number for sorting at end

    const category = dishCategoriesResponse.data.categories.find(
      (cat: any) => cat.id === categoryId,
    );
    return category?.priority || 1;
  };

  const sortCategoriesByPriority = (categoriesArray: any[]): any[] => {
    if (!categoriesArray) return categoriesArray;

    return [...categoriesArray].sort((a, b) => {
      // First sort by srNo if available and valid
      if (a.srNo && b.srNo && a.srNo !== b.srNo) {
        return a.srNo - b.srNo;
      }

      // Then sort by priority
      const priorityA = getCategoryPriority(a.categoryId);
      const priorityB = getCategoryPriority(b.categoryId);
      return priorityA - priorityB;
    });
  };

  const normalizeSavedMenus = (savedMenus: any[]): any[][] => {
    return (savedMenus || []).map((sub: any) => {
      const cats = (sub.categories || []).map((cat: any, catIndex: number) => {
        // First, sort dishes by their existing srNo
        const sortedDishes = [...(cat.dishes || [])].sort(
          (a: any, b: any) => a.srNo - b.srNo,
        );

        // Then reassign sequential srNo values to dishes
        const normalizedDishes = sortedDishes.map(
          (dish: any, dishIndex: number) => ({
            ...dish,
            srNo: dishIndex + 1, // Force sequential numbering
          }),
        );

        // Get priority from dish categories for initial sorting
        const categoryPriority = getCategoryPriority(cat.categoryId);

        return {
          ...cat,
          // Use existing category srNo if valid, otherwise use index
          srNo: cat.srNo && cat.srNo > 0 ? cat.srNo : catIndex + 1,
          priority: categoryPriority,
          dishes: normalizedDishes,
        };
      });

      // Sort categories by srNo first (from backend), then by priority
      const sortedCats = [...cats].sort((a, b) => {
        // First try to sort by srNo
        if (a.srNo !== b.srNo) {
          return a.srNo - b.srNo;
        }
        // If srNo is same or invalid, sort by priority
        return (a.priority || 9999) - (b.priority || 9999);
      });

      // Reassign sequential srNo to categories based on final order
      const finalCats = sortedCats.map((cat, index) => ({
        ...cat,
        srNo: index + 1, // Ensure categories are 1, 2, 3...
      }));

      console.log('Final categories with sequential srNo:', finalCats);
      return finalCats;
    });
  };

  const loadManagerMenus = async () => {
    if (!EventId) return;
    setIsManagerLoading(true);
    try {
      const savedRes = await api.get(
        `/cateror/events/dishes/manager/${EventId}`,
      );
      const savedMenus = savedRes.data || [];
      setSubEventMenus(savedMenus);

      console.log('=== DEBUG: Before normalization ===');
      savedMenus.forEach((menu, i) => {
        console.log(`Subevent ${i}:`, menu.subeventName);
        menu.categories?.forEach((cat, j) => {
          console.log(
            `  Category ${j}: ${cat.categoryName} (srNo: ${cat.srNo})`,
          );
          console.log(
            `    Dishes srNos:`,
            cat.dishes?.map((d) => d.srNo).join(', '),
          );
        });
      });

      const formatted = normalizeSavedMenus(savedMenus);

      console.log('=== DEBUG: After normalization ===');
      formatted.forEach((cats, i) => {
        cats.forEach((cat, j) => {
          console.log(
            `  Category ${j}: ${cat.categoryName} (srNo: ${cat.srNo}, priority: ${cat.priority})`,
          );
          console.log(
            `    Dishes srNos:`,
            cat.dishes?.map((d) => d.srNo).join(', '),
          );
        });
      });

      setSubEventCategories(formatted);
    } catch (error: any) {
      console.error('Failed to load manager menus', error);
      toast.error(error?.message || 'Failed to fetch manager menu');
      setSubEventMenus([]);
      setSubEventCategories([]);
    } finally {
      setIsManagerLoading(false);
    }
  };

  useEffect(() => {
    loadManagerMenus();
  }, [EventId]);

  // Update categories when dish categories data changes
  useEffect(() => {
    if (
      dishCategoriesResponse?.data?.categories &&
      subEventCategories.length > 0
    ) {
      // Re-sort categories based on updated dish categories priority
      const updatedSubs = subEventCategories.map((cats) => {
        const sorted = sortCategoriesByPriority(cats);
        // Reassign srNo based on new order
        return sorted.map((cat: any, index: number) => ({
          ...cat,
          srNo: index + 1,
          priority: getCategoryPriority(cat.categoryId),
        }));
      });
      setSubEventCategories(updatedSubs);
    }
  }, [dishCategoriesResponse?.data?.categories]);

  const handleCatDragStart = (categoryId: string) => {
    setDraggedCat(categoryId);
  };

  const handleCatDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCatDrop = (targetCategoryId: string) => {
    if (!draggedCat || draggedCat === targetCategoryId) {
      setDraggedCat(null);
      return;
    }

    const updatedCategories = [...categories];
    const oldIndex = updatedCategories.findIndex(
      (c) => c.categoryId === draggedCat,
    );
    const newIndex = updatedCategories.findIndex(
      (c) => c.categoryId === targetCategoryId,
    );

    if (oldIndex === -1 || newIndex === -1) {
      setDraggedCat(null);
      return;
    }

    const [moved] = updatedCategories.splice(oldIndex, 1);
    updatedCategories.splice(newIndex, 0, moved);

    // Update srNo based on new order (for backend)
    const withUpdatedSerialNumbers = updatedCategories.map((cat, index) => ({
      ...cat,
      srNo: index + 1,
      priority: getCategoryPriority(cat.categoryId), // Keep priority for display
    }));

    const newSubs = [...subEventCategories];
    newSubs[currentIndex] = withUpdatedSerialNumbers;
    setSubEventCategories(newSubs);
    setDraggedCat(null);
  };

  const handleDishDragStart = (categoryId: string, dishId: string) => {
    setDraggedDish({category: categoryId, dishId});
  };

  const handleDishDrop = (targetCategoryId: string, targetDishId: string) => {
    if (!draggedDish) return;

    const {category: sourceCategoryId, dishId} = draggedDish;
    if (sourceCategoryId !== targetCategoryId) return;

    const updatedCategories = [...categories];
    const categoryIdx = updatedCategories.findIndex(
      (c) => c.categoryId === sourceCategoryId,
    );
    if (categoryIdx === -1) return;

    const sourceDishes = [...updatedCategories[categoryIdx].dishes];
    const dishIndex = sourceDishes.findIndex((d) => d.dishId === dishId);
    if (dishIndex === -1) return;

    const [movedDish] = sourceDishes.splice(dishIndex, 1);
    const targetIndex = sourceDishes.findIndex(
      (d) => d.dishId === targetDishId,
    );

    if (targetIndex === -1) {
      sourceDishes.push(movedDish);
    } else {
      const insertAt = dishIndex < targetIndex ? targetIndex : targetIndex;
      sourceDishes.splice(insertAt, 0, movedDish);
    }

    // Update dish srNo based on new order (for backend)
    updatedCategories[categoryIdx].dishes = sourceDishes.map((dish, index) => ({
      ...dish,
      srNo: index + 1,
    }));

    const newSubs = [...subEventCategories];
    newSubs[currentIndex] = updatedCategories;
    setSubEventCategories(newSubs);
    setDraggedDish(null);
  };

  const handleSave = async () => {
    if (!EventId) {
      toast.error('Missing event id');
      return;
    }

    const currentCategories = subEventCategories[currentIndex] || [];
    const subeventId =
      subEventMenus?.[currentIndex]?.subeventId ||
      quotation?.event?.subEvents?.[currentIndex]?.subEventId ||
      '';

    if (!subeventId) {
      toast.error('Subevent id not found');
      return;
    }

    const payload = {
      eventId: EventId,
      subeventId,
      categories: currentCategories.map((cat) => ({
        categoryId: cat.categoryId,
        srNo: cat.srNo, // Use srNo for backend
        dishes: cat.dishes.map((dish: any) => ({
          dishId: dish.dishId,
          srNo: dish.srNo, // Use srNo for backend
        })),
      })),
    };

    try {
      setIsSaving(true);
      managerMenuSchema.parse(payload);
      await api.post(`/cateror/events/dishes/manager`, payload);
      await loadManagerMenus();
      toast.success('Menu saved successfully');
      return true;
    } catch (error: any) {
      console.error('Save failed', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to save menu');
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const generateMenuPreview = async () => {
    if (!categories.length) {
      toast.error('Nothing to print');
      return;
    }

    await handleSave();

    const dishes = categories.flatMap((c) => c.dishes || []);
    if (dishes.length === 0) {
      toast.error('No dishes to print');
      return;
    }

    // Create rows: [left, right] pairs
    const rows: any[][] = [];
    for (let i = 0; i < dishes.length; i += 2) {
      rows.push([dishes[i], dishes[i + 1]]);
    }

    // Split into pages: 5 rows (10 dishes) per page
    const pages: any[][][] = [];
    for (let i = 0; i < rows.length; i += 5) {
      pages.push(rows.slice(i, i + 5));
    }

    try {
      // Container for all pages (will be tall)
      const container = document.createElement('div');
      container.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      background: white;
    `;
      document.body.appendChild(container);

      const hasLogo = includeLogo === 'with';
      const fontSize = hasLogo ? '40px' : '50px';
      const logoSize = '130px';
      const textPaddingLeft = hasLogo ? '150px' : '20px';

      const rowHeight = `calc((297mm - 140px) / 5)`; // Leaves space for cutlery/footer if needed

      // Create each page
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const pageEl = document.createElement('div');
        pageEl.style.cssText = `
        width: 210mm;
        height: 297mm;
        padding: 20px;
        box-sizing: border-box;
        page-break-after: always;
        background: white;
        display: flex;
        flex-direction: column;
      `;

        // Add rows for this page
        pages[pageIndex].forEach((pair) => {
          const rowDiv = document.createElement('div');
          rowDiv.style.cssText = `
          display: flex;
          align-items: stretch;
          height: ${rowHeight};
          font-size: ${fontSize};
          font-weight: 600;
          margin-bottom: 12px;
          color: black;
        `;

          /* ---------- LEFT CELL ---------- */
          const leftDiv = document.createElement('div');
          leftDiv.style.cssText = `
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 15px;
          border-right: 1px dashed #9e9e9e;
          position: relative;
        `;

          if (pair[0]) {
            const leftWrapper = document.createElement('div');
            leftWrapper.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
          `;
            leftWrapper.style.justifyContent = 'center';

            if (hasLogo) {
              const leftLogo = document.createElement('img');
              leftLogo.src = catererLogo;
              leftLogo.onerror = () => (leftLogo.src = logo);
              leftLogo.crossOrigin = 'anonymous';
              leftLogo.style.cssText = `
              position: absolute;
              left: 0;
              top: 50%;
              transform: translateY(-50%);
              width: ${logoSize};
              height: ${logoSize};
              object-fit: contain;
            `;
              leftWrapper.appendChild(leftLogo);
            }

            const leftText = document.createElement('span');
            leftText.textContent = pair[0].dishName;
            leftText.style.cssText = `
            padding-left: ${textPaddingLeft};
            white-space: normal;
            word-break: break-word;
            line-height: 1.2;
            text-align: left;
          `;
            leftWrapper.appendChild(leftText);
            leftDiv.appendChild(leftWrapper);
          }

          /* ---------- RIGHT CELL ---------- */
          const rightDiv = document.createElement('div');
          rightDiv.style.cssText = `
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 15px;
          position: relative;
        `;

          if (pair[1]) {
            const rightWrapper = document.createElement('div');
            rightWrapper.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          `;

            if (hasLogo) {
              const rightLogo = document.createElement('img');
              rightLogo.src = catererLogo;
              rightLogo.onerror = () => (rightLogo.src = logo);
              rightLogo.crossOrigin = 'anonymous';
              rightLogo.style.cssText = `
              position: absolute;
              left: 0;
              top: 50%;
              transform: translateY(-50%);
              width: ${logoSize};
              height: ${logoSize};
              object-fit: contain;
            `;
              rightWrapper.appendChild(rightLogo);
            }

            const rightText = document.createElement('span');
            rightText.textContent = pair[1].dishName;
            rightText.style.cssText = `
            padding-left: ${textPaddingLeft};
            white-space: normal;
            word-break: break-word;
            line-height: 1.2;
            text-align: center;
            width: 100%;
          `;
            rightWrapper.appendChild(rightText);
            rightDiv.appendChild(rightWrapper);
          }

          rowDiv.appendChild(leftDiv);
          rowDiv.appendChild(rightDiv);
          pageEl.appendChild(rowDiv);
        });

        // Optional: Add cutlery section only on the LAST page
        if (pageIndex === pages.length - 1) {
          const currentSubEvent = subEventMenus?.[currentIndex];
          const cutleryItems = currentSubEvent?.subEventCutlery || [];

          if (cutleryItems.length > 0) {
            const cutleryDiv = document.createElement('div');
            cutleryDiv.style.cssText = `
            margin-top: auto;
            padding-top: 15px;
            border-top: 2px solid #333;
            text-align: center;
          `;

            cutleryDiv.innerHTML = `
            <h3 style="margin:0 0 15px;font-size:20px;font-weight:bold">
              Cutlery Items
            </h3>
            <div style="display:flex;flex-wrap:wrap;gap:15px;justify-content:center">
              ${cutleryItems
                .map(
                  (item: any) => `
                <div style="text-align:center">
                  <img src="${item.cutlory?.image || item.image}"
                       style="width:80px;height:80px;object-fit:contain;border:1px solid #ccc;padding:5px" />
                  <div style="font-size:12px;margin-top:5px">
                    ${item.cutlory?.name || item.name}
                  </div>
                </div>
              `,
                )
                .join('')}
            </div>
          `;
            pageEl.appendChild(cutleryDiv);
          }
        }

        container.appendChild(pageEl);
      }

      // Wait for images to load
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 100)));

      const canvas = await html2canvas(container, {
        scale: 2, // Better quality for multi-page
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#fff',
        logging: false,
      });

      setPdfPreview(canvas.toDataURL('image/jpeg', 0.85));
      document.body.removeChild(container);
    } catch (error) {
      console.error('PDF generation failed', error);
      toast.error('Failed to generate preview');
    }
  };

  const generateManagerPreview = async () => {
    if (!categories.length) {
      toast.error('Nothing to print');
      return;
    }

    await handleSave();

    try {
      const pageEl = document.createElement('div');
      pageEl.style.cssText = `
        width: 800px;
        padding: 20px;
        font-family: Arial, sans-serif;
        font-size: 12px;
        color: black;
        background: white;
        box-sizing: border-box;
        position: absolute;
        left: -9999px;
        top: 0;
        display: block;
        text-align: center;
      `;

      const contentWrapper = document.createElement('div');
      contentWrapper.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        text-align: left;
      `;

      // Header
      const headerWrapper = document.createElement('div');
      headerWrapper.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: flex-start; /* ensures items start from the left */
        padding: 15px 20px;
        border: 1px solid #1E3A8A;
        box-sizing: border-box;
        background: white;
        gap: 20px;
        position: relative;
      `;

      // 1. Add Logo (Left Side)
      if (includeLogo === 'with') {
        const logoDiv = document.createElement('div');
        logoDiv.style.cssText = `
          flex-shrink: 0; /* Prevents logo from shrinking */
          width: 80px;    /* Fixed width for logo area */
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        `;

        const logoImg = document.createElement('img');
        logoImg.src = catererLogo;
        logoImg.onerror = () => {
          logoImg.src = logo;
        };
        logoImg.crossOrigin = 'anonymous'; // Critical for PDF generation
        logoImg.style.cssText = `
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 4px;
        `;

        logoDiv.appendChild(logoImg);
        headerWrapper.appendChild(logoDiv);
      }

      // 2. Add Center Info (Takes remaining space)
      const centerInfo = document.createElement('div');
      centerInfo.style.cssText = `
        flex: 1; /* Takes all remaining width */
        text-align: center; /* Centers the text within this remaining space */
        line-height: 1.3;
        color: black;
      `;

      centerInfo.innerHTML = `
        <h1 style="margin: 0; font-weight: 800; font-size: 28px; text-transform: uppercase; color: #1E3A8A;">
          ${user?.fullname || 'Caterer Name'}
        </h1>
        <div style="background:#1E3A8A; height:2px; margin:6px auto; width:80%;"></div>
        <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: 600;">
          ${user?.address || ''}<br/>
          ${user?.email ? `Email: ${user?.email} | ` : ''} Mobile: ${user?.phoneNumber || ''}
        </p>
      `;

      headerWrapper.appendChild(centerInfo);

      // If you want to balance the layout (so text is dead-center of page, not center of remaining space),
      // we add a "ghost" element to the right if the logo exists.
      if (includeLogo === 'with') {
        const ghostDiv = document.createElement('div');
        ghostDiv.style.cssText = 'width: 80px; flex-shrink: 0;'; // Same width as logo
        headerWrapper.appendChild(ghostDiv);
      }

      pageEl.appendChild(headerWrapper);
      // Info Block
      const infoBlock = document.createElement('div');
      infoBlock.style.cssText = `
        margin: 20px 0 0 0;
        font-size: 14px;
        font-weight: 500;
        color: black;
        background: white;
        padding: 12px 15px;
        border-radius: 6px;
        border: 1px solid #1E3A8A;
        box-shadow: 0 1px 5px rgba(13, 71, 161, 0.1);
        text-align: left;
        width: 100%;
        box-sizing: border-box;
      `;

      const clientName = client?.user?.fullname || 'N/A';
      const clientPhone = client?.user?.phoneNumber || 'N/A';
      const EventStartDate = quotation?.event?.startDate
        ? new Date(quotation.event.startDate).toLocaleDateString('en-GB')
        : 'N/A';
      const EventEndDate = quotation?.event?.endDate
        ? new Date(quotation.event.endDate).toLocaleDateString('en-GB')
        : 'N/A';
      const subEventDate = quotation?.event?.subEvents?.[currentIndex]?.date
        ? new Date(
            quotation.event.subEvents[currentIndex].date,
          ).toLocaleDateString('en-GB')
        : 'N/A';
      const timeString = quotation?.event?.subEvents?.[currentIndex]?.time
        ? new Date(
            quotation.event.subEvents[currentIndex].time,
          ).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'N/A';
      const subEventAddress =
        quotation?.event?.subEvents?.[currentIndex]?.address || 'N/A';

      infoBlock.innerHTML = `
        <div style="display: flex; flex-direction: row; justify-content: space-between; gap: 20px; align-items: flex-start;">
          <div style="flex: 1;">
            <div><strong>Event Name:</strong> ${quotation?.event?.name || 'N/A'}</div>
            <div><strong>Event Start Date:</strong> ${EventStartDate}</div>
            <div><strong>Event End Date:</strong> ${EventEndDate}</div>
            <div><strong>Sub Event:</strong> ${quotation?.event?.subEvents?.[currentIndex]?.name || 'N/A'}</div>
            <div><strong>Buffet:</strong> ${quotation?.event?.subEvents?.[currentIndex]?.buffetPeople || 'N/A'}</div>
            <div><strong>Date:</strong> ${subEventDate}</div>
          </div>
          <div style="flex: 1;">
            <div><strong>Client:</strong> ${clientName}</div>
            <div><strong>Phone:</strong> ${clientPhone}</div>
            <div><strong>Event Address:</strong> ${subEventAddress}</div>
            <div><strong>People:</strong> ${
              quotation?.event?.subEvents?.[currentIndex]?.actualPeople ||
              quotation?.event?.subEvents?.[currentIndex]?.expectedPeople ||
              'N/A'
            }</div>
            <div><strong>Sitting:</strong> ${quotation?.event?.subEvents?.[currentIndex]?.sittingPeople || 'N/A'}</div>
            <div><strong>Time:</strong> ${timeString}</div>
          </div>
        </div>
      `;

      contentWrapper.appendChild(infoBlock);

      const titleWrapper = document.createElement('div');
      titleWrapper.style.marginTop = '1px';
      titleWrapper.style.textAlign = 'center';
      titleWrapper.innerHTML = `
        <h2 style="font-size: 18px; font-weight: bold; margin:0; color:black;">
          Manager Report
        </h2>
      `;
      contentWrapper.appendChild(titleWrapper);

      // Categories and Dishes - sorted by srNo
      const sortedCategories = [...categories].sort((a, b) => a.srNo - b.srNo);

      sortedCategories.forEach((cat) => {
        const catBlock = document.createElement('div');
        catBlock.style.cssText = `
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid #1E3A8A;
          border-radius: 6px;
          padding: 10px 15px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          width: 100%;
          box-sizing: border-box;
        `;

        // Get category name from dish categories if available
        const categoryName =
          cat.categoryName ||
          dishCategoriesResponse?.data?.categories?.find(
            (dishCat: any) => dishCat.id === cat.categoryId,
          )?.name ||
          'Category';

        const catTitle = document.createElement('div');
        catTitle.style.cssText = `
          font-size: 16pt;
          font-weight: 700;
          color: #1565C0;
          border-bottom: 2px solid #1E3A8A;
          padding-bottom: 4px;
          width: 100%;
          text-align: center;
          text-transform: uppercase;
          margin: 0;
        `;
        catTitle.textContent = `${cat.srNo}. ${categoryName}`;

        const dishList = document.createElement('div');
        dishList.style.cssText = `
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          row-gap: 6px;
          width: 100%;
        `;

        // Sort dishes by srNo
        const sortedDishes = [...(cat.dishes || [])].sort(
          (a, b) => a.srNo - b.srNo,
        );

        sortedDishes?.forEach((dish) => {
          const dishDiv = document.createElement('div');
          dishDiv.style.cssText = `
            font-size: 12pt;
            font-weight: 700;
            padding: 2px 10px;
            border-left: 4px solid #1E3A8A;
            background: #ffffff;
            width: 100%;
            border-radius: 4px;
            color: black;
          `;
          dishDiv.textContent = `${dish.srNo}. ${dish.dishName}`;
          dishList.appendChild(dishDiv);
        });

        catBlock.appendChild(catTitle);
        catBlock.appendChild(dishList);
        contentWrapper.appendChild(catBlock);
      });

      // Cutlery Section
      const currentSubEvent = subEventMenus?.[currentIndex];
      if (currentSubEvent?.subEventCutlery?.length > 0) {
        const cutleryDiv = document.createElement('div');
        cutleryDiv.style.cssText = `
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid #1E3A8A;
          border-radius: 6px;
          padding: 10px 15px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          width: 100%;
          box-sizing: border-box;
        `;

        const cutleryTitle = document.createElement('div');
        cutleryTitle.style.cssText = `
          font-size: 16pt;
          font-weight: 700;
          color: #1565C0;
          border-bottom: 2px solid #1E3A8A;
          padding-bottom: 4px;
          width: 100%;
          text-align: center;
          text-transform: uppercase;
          margin: 0;
        `;
        cutleryTitle.textContent = 'Cutlery Items';

        const cutleryList = document.createElement('div');
        cutleryList.style.cssText = `
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        `;

        currentSubEvent.subEventCutlery.forEach((item: any) => {
          const cutleryItemDiv = document.createElement('div');
          cutleryItemDiv.style.cssText = `
            text-align: center;
            flex: 0 0 auto;
          `;
          cutleryItemDiv.innerHTML = `
            <img src="${item.cutlory?.image || item.image}" 
                 alt="${item.cutlory?.name || item.name}" 
                 style="width: 60px; height: 60px; object-fit: contain; border-radius: 8px; border: 1px solid #ccc; padding: 5px; background: white;" />
            <div style="margin-top: 5px; font-size: 11px; font-weight: 500; max-width: 80px;">
              ${item.cutlory?.name || item.name}
            </div>
          `;
          cutleryList.appendChild(cutleryItemDiv);
        });

        cutleryDiv.appendChild(cutleryTitle);
        cutleryDiv.appendChild(cutleryList);
        contentWrapper.appendChild(cutleryDiv);
      }

      const footer = document.createElement('div');
      footer.style.marginTop = '8px';
      footer.style.borderTop = '1px solid #0D47A1';
      footer.style.paddingTop = '8px';
      footer.innerHTML = `
        <p style="margin: 0; font-size: 15px; color: black;">
          <span style="display: inline-block; margin: 0 8px; color: black;">
            <strong>Note:</strong> ${quotation?.event?.subEvents?.[currentIndex]?.note || 'N/A'}
          </span>
        </p>
      `;

      contentWrapper.appendChild(footer);
      pageEl.appendChild(contentWrapper);
      document.body.appendChild(pageEl);

      await new Promise((resolve) =>
        requestAnimationFrame(() => setTimeout(resolve, 150)),
      );

      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: pageEl.scrollWidth,
        windowHeight: pageEl.scrollHeight,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      setPdfPreview(imgData);

      document.body.removeChild(pageEl);
    } catch (error) {
      console.error('PDF generation failed', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handlePreview = async (type: 'menu' | 'manager') => {
    setIsGenerating(true);
    setShowPreview(true);
    setPreviewType(type);

    if (type === 'menu') {
      await generateMenuPreview();
    } else {
      await generateManagerPreview();
    }

    setIsGenerating(false);
  };

  const handleSaveAndPreviewManagerReport = async () => {
    setIsGenerating(true);
    setShowPreview(true);
    setPreviewType('manager');

    await generateManagerPreview();
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (!pdfPreview) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const img = new Image();
    img.src = pdfPreview;

    img.onload = () => {
      const imgHeight = (img.height * pdfWidth) / img.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(pdfPreview, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Remaining pages
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(pdfPreview, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    };
  };

  // Get category name from dish categories
  const getCategoryDisplayName = (
    categoryId: string,
    fallbackName: string,
  ): string => {
    if (!dishCategoriesResponse?.data?.categories) return fallbackName;

    const category = dishCategoriesResponse.data.categories.find(
      (cat: any) => cat.id === categoryId,
    );
    return category?.name || fallbackName;
  };

  // Get category priority for display
  const getDisplayPriority = (categoryId: string): number => {
    if (!dishCategoriesResponse?.data?.categories) return 9999;

    const category = dishCategoriesResponse.data.categories.find(
      (cat: any) => cat.id === categoryId,
    );
    return category?.priority || 9999;
  };

  if (isQuotationLoading || isLoadingDishCategories) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 dark:bg-gray-900/50 min-h-screen space-y-6">
      {/* Header Section */}
      <div className="rounded-lg border-stroke bg-transparent shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="rounded-md bg-gradient-to-r from-blue-800 to-indigo-900 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Manager Menu</h1>
              <p className="mt-1 text-sm text-blue-100">
                Categories sorted by priority from Dish Categories
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Main Content - 3/4 width */}
        <div className="lg:col-span-3">
          {/* Subevent Tabs */}
          <div className="mb-6">
            <div className="mb-4 flex items-center space-x-2">
              <h2 className="text-gray-900 text-lg font-semibold dark:text-white">
                Sub Events
              </h2>
            </div>
            <div className="scrollbar-hide dark:bg-gray-800 flex space-x-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-sm dark:bg-boxdark">
              {subEventMenus?.map((sub: any, i: number) => (
                <button
                  key={sub.subeventId || i}
                  onClick={() => {
                    setCurrentIndex(i);
                    setSubId(sub.subeventId || '');
                  }}
                  className={`flex items-center space-x-2 whitespace-nowrap rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300 ${
                    currentIndex === i
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{sub.subeventName || `Subevent ${i + 1}`}</span>
                  {currentIndex === i && (
                    <div className="h-2 w-2 rounded-full bg-white/80"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Section */}
          <div className="dark:bg-gray-800 rounded-2xl bg-white p-6 shadow-sm dark:bg-boxdark-2">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TbDragDrop className="h-6 w-6 text-blue-500" />
                <div>
                  <h2 className="text-gray-900 text-xl font-bold dark:text-white">
                    Menu Categories (Priority Order)
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Categories sorted by priority from Dish Categories settings
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {categories.length} categories
                </p>
              </div>
            </div>

            {/* Categories Container */}
            <div
              ref={categoriesContainerRef}
              className="scrollbar-hide space-y-4 overflow-auto"
              onDragOver={handleCatDragOver}
              onDragEnter={(e) => e.preventDefault()}
            >
              {categories.length === 0 ? (
                <div className="border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center">
                  <BsAppIndicator className="text-gray-400 mb-4 h-12 w-12" />
                  <h3 className="text-gray-900 mb-2 text-lg font-semibold dark:text-white">
                    No Categories Available
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    There are no categories to display for this subevent. Please
                    check if the menu has been properly configured.
                  </p>
                </div>
              ) : (
                // Sort categories by srNo (which is based on priority)
                [...categories]
                  .sort((a, b) => a.srNo - b.srNo)
                  .map((c) => {
                    const dishCategory =
                      dishCategoriesResponse?.data?.categories?.find(
                        (cat: any) => cat.id === c.categoryId,
                      );

                    return (
                      <div
                        key={c.categoryId}
                        draggable
                        onDragStart={() => handleCatDragStart(c.categoryId)}
                        onDragOver={handleCatDragOver}
                        onDrop={() => handleCatDrop(c.categoryId)}
                        onDragEnter={(e) => e.preventDefault()}
                        className={`border-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600 group relative rounded-2xl border-2 bg-white p-6 transition-all duration-300 hover:border-blue-200 hover:shadow-lg dark:bg-boxdark-2 ${
                          draggedCat === c.categoryId
                            ? 'border-blue-300 bg-blue-50 opacity-50 dark:bg-blue-900/20'
                            : ''
                        }`}
                      >
                        {/* Drag Handle */}
                        <div className="absolute -left-3 top-6 opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="cursor-grab rounded-full bg-blue-500 p-2 text-white shadow-lg">
                            <BsAppIndicator className="h-4 w-4" />
                          </div>
                        </div>

                        {/* Category Header with Priority */}
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-gray-900 flex items-center space-x-3 text-lg font-bold dark:text-white">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-sm font-bold text-white">
                              {c.srNo}
                            </span>
                            <span>
                              {getCategoryDisplayName(
                                c.categoryId,
                                c.categoryName,
                              )}
                            </span>
                          </h3>
                          <span className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-full px-3 py-1 text-sm font-medium">
                            {c.dishes?.length || 0} dishes
                          </span>
                        </div>

                        {/* Dishes List */}
                        <div className="space-y-2">
                          {c.dishes?.map((dish: any) => (
                            <div
                              key={dish.dishId}
                              draggable
                              onDragStart={() =>
                                handleDishDragStart(c.categoryId, dish.dishId)
                              }
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() =>
                                handleDishDrop(c.categoryId, dish.dishId)
                              }
                              className="group/dish border-gray-100 bg-gray-50/50 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:bg-gray-700 flex items-center space-x-3 rounded-xl border p-4 transition-all hover:border-blue-200 hover:bg-blue-50/50"
                            >
                              <div className="flex min-w-0 flex-1 items-center space-x-3">
                                <BsAppIndicator className="text-gray-400 h-4 w-4 flex-shrink-0 cursor-grab" />
                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
                                  {dish.srNo}
                                </span>
                                <span className="text-gray-900 truncate font-medium dark:text-white">
                                  {dish.dishName}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <CutlerySection
              subId={subId}
              onSaveAndPreview={handleSaveAndPreviewManagerReport}
            />
          </div>
        </div>

        {/* Sidebar - 1/4 width */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Print Options Card */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-boxdark-2">
              <div className="mb-6 flex items-center space-x-3">
                <BiPrinter className="h-6 w-6 text-blue-500" />
                <h2 className="text-gray-900 text-lg font-semibold dark:text-white">
                  Print Options
                </h2>
              </div>

              {/* Logo Selection */}
              <div className="mb-6">
                <label className="text-gray-700 dark:text-gray-300 mb-3 block text-sm font-medium">
                  Include Logo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIncludeLogo('with')}
                    className={`flex items-center justify-center space-x-2 rounded-xl border-2 p-3 transition-all ${
                      includeLogo === 'with'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <span>With Logo</span>
                  </button>
                  <button
                    onClick={() => setIncludeLogo('without')}
                    className={`flex items-center justify-center space-x-2 rounded-xl border-2 p-3 transition-all ${
                      includeLogo === 'without'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <span>Without Logo</span>
                  </button>
                </div>
              </div>

              {/* Print Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handlePreview('menu')}
                  className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl"
                >
                  <BiPrinter className="h-5 w-5" />
                  <span>Menu Plate Preview</span>
                </button>
              </div>
            </div>

            {/* Event Info Card */}
            <div className="from-gray-50 dark:from-gray-800 rounded-2xl bg-gradient-to-br to-blue-50/50 p-6 shadow-sm dark:to-blue-900/20">
              <div className="mb-4 flex items-center space-x-3">
                <BiInfoCircle className="h-5 w-5 text-blue-500" />
                <h3 className="text-gray-900 font-semibold dark:text-white">
                  Event Details
                </h3>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Client</p>
                  <p className="text-gray-900 font-medium dark:text-white">
                    {user.fullname || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Current Subevent
                  </p>
                  <p className="text-gray-900 font-medium dark:text-white">
                    {subEventMenus?.[currentIndex]?.subeventName ||
                      `Subevent ${currentIndex + 1}`}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Total Categories
                  </p>
                  <p className="text-gray-900 font-medium dark:text-white">
                    {categories.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Category Priority Info */}
            <div className="rounded-2xl border border-green-200 bg-green-50/50 p-6 dark:border-green-800 dark:bg-green-900/10">
              <div className="mb-3 flex items-center space-x-3">
                <BiCategory className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Category Priority
                </h3>
              </div>
              <p className="mb-3 text-sm text-green-800 dark:text-green-200">
                Categories are automatically sorted by priority from Dish
                Categories settings.
              </p>
              <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                <li className="flex items-start space-x-2">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-600"></div>
                  <span>Priority 1 is highest</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-600"></div>
                  <span>Drag to override priority order</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-600"></div>
                  <span>Changes save automatically</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex max-h-screen items-center justify-center overflow-auto bg-black/50 p-4">
          <div className="max-h-4xl relative mt-10 w-full max-w-5xl rounded-xl bg-white shadow-2xl">
            {/* Simple Modal Header */}
            <div className="border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-800 text-xl font-bold">
                  {previewType === 'menu'
                    ? 'Menu Plate Preview'
                    : 'Manager Report Preview'}
                </h3>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setPdfPreview(null);
                  }}
                  className="text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg p-2"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="max-h-[80vh] overflow-auto p-6">
              {isGenerating ? (
                <div className="flex h-64 flex-col items-center justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                  <p className="text-gray-600 mt-4">
                    Generating PDF preview...
                  </p>
                </div>
              ) : pdfPreview ? (
                <div className="space-y-6">
                  {/* PDF Preview Image */}
                  <div className="border-gray-200 bg-gray-50 rounded-lg border p-2">
                    <img
                      src={pdfPreview}
                      alt="PDF Preview"
                      className="w-full rounded-lg shadow-sm"
                    />
                  </div>

                  {/* Direct Print Preview Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleDownload}
                      className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-3 font-medium text-white shadow-md transition-all hover:shadow-lg"
                    >
                      <BiPrinter className="h-5 w-5" />
                      <span>Open Print Preview</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="text-gray-400 mx-auto h-12 w-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-gray-500 mt-3">
                      Failed to generate preview
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerMenu;
