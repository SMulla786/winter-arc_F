/*eslint-disable*/
import {
  useAddSubEventDishRawMaterial,
  useSubEventPrediction,
  useGetEventRawMaterial,
  useGetFoodVendorAssignments,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import React, {useEffect, useMemo, useState} from 'react';
import NewDishTable from './NewDishTable';
import {useGetAllMaharaj} from '@/lib/react-query/queriesAndMutations/cateror/maharaj';
import {FormProvider, useForm} from 'react-hook-form';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useAuthContext} from '@/context/AuthContext';
import {Route} from '@/routes/_app/_event/events.$id';
import NewDishPopup from './NewDishPopup';
import toast from 'react-hot-toast';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';

interface SubEventRawMaterialListProps {
  subEvent: any;
  EventData: any;
}
export type RawMaterialType = {
  rawId: string;
  rawName: string;
  unit: string;
  quantity: number;
  process: string;
};

type DishType = {
  name: string;
  dishId: string;
  dishCat: string;
  dishCatId: string;
  portionSize: number;
  people: number;
  price: number;
  unit: string;
  foodVendor: string;
  maharaj: string[];
  rawMaterialCalculation: boolean;
  rawMaterials: RawMaterialType[];
};

const SubEventDishesCalculation: React.FC<SubEventRawMaterialListProps> = ({
  EventData,
  subEvent,
}) => {
  const {id: EventId} = Route.useParams();
  const {user} = useAuthContext();
  const {data: profiledata} = useGetCaterorById(user?.caterorId || '');
  const catererLogo = profiledata?.data?.image || '';
  const restriction = user?.employeeRestriction?.rawmaterialCalculator;
  const role = user?.role;
  const {
    mutate: subEventPrediction,
    data: predictionData,
    isPending,
  } = useSubEventPrediction();
  const {mutateAsync: addDishRawMaterial, isPending: isAddPending} =
    useAddSubEventDishRawMaterial();
  const [allDishes, setAllDishes] = useState<DishType[]>([]);
  const {data: eventRawMaterial, refetch} = useGetEventRawMaterial(EventId);
  const [selectedDish, setSelectedDish] = useState<string | null>(null);
  const [recordToThisTemplate, setRecordToThisTemplate] = useState<
    string | null
  >(null);
  const [foodLabourDishes, setFoodLabourDishes] = useState<any[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const {data} = useGetFoodVendorAssignments(EventId);
  const FoodVendorData = data?.data?.subEvents || [];
  const [isadddish, setIsAddDish] = useState(false);
  const {data: maharajs} = useGetAllMaharaj();
  const methods = useForm<any>();
  const {handleSubmit, register, setValue, getValues, watch} = methods;
  const maharajOptions =
    maharajs?.map((maharaj: {id: string; fullname: string}) => ({
      label: maharaj.fullname,
      value: maharaj.id,
    })) || [];
  const subEventDishes = subEvent?.dishes || [];
  // const filteredSubEventDishes = subEventDishes.filter(
  //   (dish: any) => dish.rawMaterialCalculation !== false,
  // );

  // SubEventDishesCalculation.tsx (top of component, after other states)

  const [predictedDishes, setPredictedDishes] = useState<Set<string>>(
    new Set(),
  );

  // Optional: reset when sub-event changes
  useEffect(() => {
    setPredictedDishes(new Set());
  }, [subEvent?.id]);

  useEffect(() => {
    if (!predictionData?.data?.dishes) return;

    const mappedData: DishType[] = predictionData.data.dishes
      .filter(
        (dish: any) =>
          dish?.foodVendor &&
          typeof dish.foodVendor === 'object' &&
          Object.keys(dish.foodVendor).length > 0,
      )
      .map((dish: any) => ({
        dishId: dish.dishId,
        name: dish?.dish,
        portionSize: dish?.portionSize,
        people: dish?.people,
        dishCategory: dish?.category?.name,
        foodVendor: dish?.foodVendor?.name,
        rawMaterials: dish.rawMaterials.map((rm: any) => ({
          ...rm,
        })),
      }));

    setFoodLabourDishes(mappedData);
  }, [predictionData]);

  useEffect(() => {
    if (subEvent?.id) {
      subEventPrediction(
        {
          subEventId: subEvent.id,
          preparationPeople: subEvent?.expectedPeople,
        },
        {
          onSuccess: (data) => {
            console.log('Initial Prediction Response:', data);
          },
          onError: (error) => {
            console.error('Initial Prediction Error:', error);
          },
        },
      );
    }
  }, []);
  useEffect(() => {
    if (!isDownloading) return;
    handleDownloadPDF();
  }, [isDownloading]);

  const mappedDishes = useMemo(() => {
    if (!predictionData?.data?.dishes?.length) return [];
    if (!subEventDishes?.length) return [];

    const subEventDishMap = new Map(
      subEventDishes.map((d: any) => [d?.dish?.id, d]),
    );

    return predictionData.data.dishes
      .filter((dish: any) => subEventDishMap.has(dish.dishId))
      .map((dish: any) => {
        const subEventDish = subEventDishMap.get(dish.dishId);
        return {
          dishId: dish.dishId,
          name: dish.dish,
          portionSize: dish.portionSize,
          dishCat: dish.category?.name,
          dishCatId: dish.category?.id,
          people: dish.people,
          price: dish.price,
          maharaj: dish?.maharaj?.map((m: any) => m?.maharaj?.id) ?? [],
          unit: subEventDish?.dish?.unit,
          rawMaterialCalculation: subEventDish?.rawMaterialCalculation,
          rawMaterials: dish.rawMaterials || [],
          foodVendor: dish?.foodVendor?.name,
        };
      }) as DishType[];
  }, [predictionData?.data?.dishes, subEventDishes]);

  useEffect(() => {
    if (!mappedDishes.length) return;

    setAllDishes((prev) => {
      const prevIds = prev.map((d) => d.dishId).join(',');
      const newIds = mappedDishes.map((d) => d.dishId).join(',');

      if (prevIds === newIds) return prev;
      return mappedDishes;
    });
  }, [mappedDishes]);

  const onSubmit = async () => {
    if (!allDishes || allDishes.length === 0) return;

    const transformedDishes = allDishes.map((item) => {
      const people = Number(item?.people || 0);
      const portionSize = parseFloat(Number(item?.portionSize || 0).toFixed(3)); // Fix to 3 decimal places

      return {
        ...item,
        maharajIds: item.maharaj ?? [],
        people,
        portionSize,
        kg: parseFloat((people * portionSize).toFixed(3)), // Fix to 3 decimal places
        rawMaterials: item?.rawMaterials ?? [],
        price: Number(item.price ?? 0),
        isaddish: item.dishId === recordToThisTemplate,
        isPredicted: predictedDishes.has(item.dishId),
      };
    });

    await addDishRawMaterial({
      dishes: transformedDishes.filter((item) => item.kg > 0),
      subEventId: subEvent?.id,
      preparationPeople: Number(subEvent?.expectedPeople || 0),
    });

    refetch();
    subEventPrediction(
      {
        preparationPeople: Number(subEvent?.expectedPeople || 0),
        subEventId: subEvent?.id,
      },
      {},
    );
  };

  const handleDownloadPDF = () => {
    const currentSubEventVendorData = FoodVendorData?.find(
      (se: any) => se.subEventId === subEvent?.id,
    );

    if (
      !predictionData?.data?.dishes?.length &&
      !foodLabourDishes.length &&
      !(currentSubEventVendorData?.dishes?.length > 0)
    ) {
      toast.error('No data available to generate PDF');
      reject(new Error('No data available'));
      return;
    }

    /* ================= GROUP IN-HOUSE DISHES (Main Prediction Dishes) ================= */
    const groupedMainDishes: Record<string, any[]> = {};
    predictionData?.data?.dishes?.forEach((item: any) => {
      const categoryName =
        item?.category?.name || item?.dishCategory || 'Uncategorized';
      if (!groupedMainDishes[categoryName])
        groupedMainDishes[categoryName] = [];
      groupedMainDishes[categoryName].push(item);
    });

    const groupedVendorDishes: Record<string, any[]> = {};
    currentSubEventVendorData?.dishes
      ?.filter((d: any) => d.rawMaterialCalculation === true) // ← Matches UI perfectly
      .forEach((dish: any) => {
        const categoryName = dish?.dishCategory || 'Uncategorized';
        if (!groupedVendorDishes[categoryName])
          groupedVendorDishes[categoryName] = [];
        groupedVendorDishes[categoryName].push(dish);
      });

    /* ================= GROUP FOOD LABOUR ASSIGNED DISHES (From Prediction) ================= */
    const groupedLabourDishes: Record<string, any[]> = {};
    foodLabourDishes.forEach((dish: any) => {
      const categoryName = dish?.dishCategory || 'Uncategorized';
      if (!groupedLabourDishes[categoryName])
        groupedLabourDishes[categoryName] = [];
      groupedLabourDishes[categoryName].push(dish);
    });

    /* ================= BUILD HTML CONTENT ================= */
    let htmlContent = `
    <!-- HEADER -->
   <div style="border:1px solid #0D47A1; padding:10px; margin-bottom:12px; background:#E3F2FD; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <!-- Logo -->
      <td width="10%" align="left" valign="middle">
        ${
          catererLogo
            ? `<img 
                src="${catererLogo}" 
                alt="Caterer Logo"
                style="max-height:60px; max-width:150px; object-fit:contain;"
              />`
            : ''
        }
      </td>

      <!-- Text -->
      <td width="90%" align="center">
        <h1 style="margin:0; font-size:24px; color:#0D47A1; font-weight:800;">
          ${user?.fullname || 'Caterer Name'}
        </h1>

        <p style="margin:6px 0 0; font-weight:bold; font-size:11px; color:#000;">
          ${user?.address ? `Address - ${user.address}` : ''} ${
            user?.email ? ` | Email - ${user.email}` : ''
          } | Mob.${user?.phoneNumber || ''}
        </p>
      </td>
    </tr>
  </table>
</div>


    <!-- TITLE BAR -->
    <div style="text-align:center; background:#0D47A1; color:white; padding:10px 6px; margin-bottom:12px; font-weight:bold;">
      <h2 style="margin:0; font-size:16px;">Sub Event Production Report</h2>
      <div style="font-size:11px; margin-top:4px; opacity:0.95;">
        Event: ${EventData?.name || 'N/A'} |
        Sub Event: ${subEvent?.name || 'N/A'} |
        Date: ${
          subEvent?.date
            ? new Date(subEvent.date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : 'N/A'
        } |
      Time: ${
        subEvent?.time
          ? new Date(subEvent.time).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : 'N/A'
      }

      </div>
      <div style="font-size:11px; margin-top:2px; opacity:0.95;">
        Address: ${subEvent?.address || 'N/A'} | People Count: ${predictionData?.data?.peopleCount || subEvent?.expectedPeople || 'N/A'} |
        ClientName: ${EventData?.client?.user?.fullname || 'N/A'}
      </div>
    </div>
  `;

    /* ================= IN-HOUSE PREPARATION DISHES ================= */
    if (Object.keys(groupedMainDishes).length > 0) {
      htmlContent += `
      <h3 style="margin:20px 0 10px; font-size:14px; color:#0D47A1; text-align:left;">In-House Preparation Dishes</h3>
      <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:30px;">
        <thead>
          <tr style="background:#1E3A8A; color:#fff; font-weight:700;">
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Dish</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Portion Size</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">No Of People</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Production Qty</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Batch 1</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Batch 2</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Batch 3</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Incharge</th>
          </tr>
        </thead>
        <tbody>`;

      Object.entries(groupedMainDishes).forEach(([categoryName, items]) => {
        htmlContent += `
        <tr>
          <td colspan="8" style="background:#E3F2FD; color:#0D47A1; border:1px solid #0D47A1; padding:8px; font-weight:bold; text-align:left; font-size:13px;">
            ${categoryName}
          </td>
        </tr>`;

        items.forEach((dish: any, idx: number) => {
          const maharajNames =
            dish?.maharaj?.length > 0
              ? dish.maharaj
                  .map((m: any) => m?.maharaj?.fullname)
                  .filter(Boolean)
                  .join(', ')
              : 'N/A';

          const kg = dish?.kg ?? 0;

          htmlContent += `
          <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8f8f8'};">
            <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${dish?.dish || 'N/A'}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${dish?.portionSize ?? '-'}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${dish?.people ?? '-'}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${kg.toFixed(2)}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${(kg * 0.7).toFixed(2)}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${(kg * 0.2).toFixed(2)}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${(kg * 0.1).toFixed(2)}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${maharajNames}</td>
          </tr>`;
        });
      });

      htmlContent += `</tbody></table>`;
    }

    /* ================= FOOD VENDOR ASSIGNED DISHES (Matches UI Exactly) ================= */
    if (Object.keys(groupedVendorDishes).length > 0) {
      htmlContent += `
      <h3 style="margin:30px 0 10px; font-size:14px; color:#0D47A1; text-align:left;">Food Vendor Assigned Dishes</h3>
      <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:30px;">
        <thead>
          <tr style="background:#1E3A8A; color:#fff; font-weight:700;">
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Dish Name</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Food Vendor</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Order Qty</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Batch 1 (70%)</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Batch 2 (20%)</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Batch 3 (10%)</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Preparation Qty</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Unit</th>
          </tr>
        </thead>
        <tbody>`;

      Object.entries(groupedVendorDishes).forEach(([categoryName, items]) => {
        htmlContent += `
        <tr>
          <td colspan="8" style="background:#E3F2FD; color:#0D47A1; border:1px solid #0D47A1; padding:8px; font-weight:bold; text-align:left; font-size:13px;">
            ${categoryName}
          </td>
        </tr>`;

        items.forEach((dish: any, idx: number) => {
          const updatedKg =
            (allDishes[dish.dishId]?.people ?? dish?.people ?? 0) *
            (allDishes[dish.dishId]?.portionSize ?? dish?.portionSize ?? 0);

          htmlContent += `
          <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8f8f8'};">
            <td style="padding:8px; border:1px solid #ddd; text-align:center;font-weight:700;">${dish?.dishName || 'N/A'}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${dish?.foodVendorName || 'N/A'}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${updatedKg.toFixed(2)}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${(updatedKg * 0.7).toFixed(2)}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${(updatedKg * 0.2).toFixed(2)}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${(updatedKg * 0.1).toFixed(2)}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${dish?.preparation || '-'}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${dish?.unit || '-'}</td>
          </tr>`;
        });
      });

      htmlContent += `</tbody></table>`;
    }

    /* ================= FOOD LABOUR ASSIGNED DISHES ================= */
    if (Object.keys(groupedLabourDishes).length > 0) {
      htmlContent += `
      <h3 style="margin:30px 0 10px; font-size:14px; color:#0D47A1; text-align:left;">Food Labour Assigned Dishes</h3>
      <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:30px;">
        <thead>
          <tr style="background:#1E3A8A; color:#fff; font-weight:700;">
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Dish Name</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Food Labour</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Portion Size</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">No Of People</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Production Qty</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Batch 1</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Batch 2</th>
            <th style="padding:8px; border:1px solid #ccc; text-align:center;">Batch 3</th>
          </tr>
        </thead>
        <tbody>`;

      Object.entries(groupedLabourDishes).forEach(([categoryName, items]) => {
        htmlContent += `
        <tr>
          <td colspan="8" style="background:#E3F2FD; color:#0D47A1; border:1px solid #0D47A1; padding:8px; font-weight:bold; text-align:left; font-size:13px;">
            ${categoryName}
          </td>
        </tr>`;

        items.forEach((dish: any, idx: number) => {
          const portionSize =
            allDishes[dish.dishId]?.portionSize || dish?.portionSize || 0;
          const people = allDishes[dish.dishId]?.people || dish?.people || 0;
          const productionQty = (portionSize * people).toFixed(2);
          const qty = parseFloat(productionQty);

          htmlContent += `
          <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8f8f8'};">
            <td style="padding:8px; border:1px solid #ddd; text-align:center; font-weight:700;">${dish?.name || 'N/A'}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${dish?.foodVendor || 'N/A'}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${portionSize}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${people}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${productionQty}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${(qty * 0.7).toFixed(2)}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${(qty * 0.2).toFixed(2)}</td>
            <td style="padding:8px; border:1px solid #ddd; text-align:center;">${(qty * 0.1).toFixed(2)}</td>
          </tr>`;
        });
      });

      htmlContent += `</tbody></table>`;
    }

    /* ================= NOTE SECTION ================= */
    if (subEvent?.note) {
      htmlContent += `
      <div style="margin-top:20px; padding:10px; background:#f8f9fa; border-left:4px solid #0D47A1; font-size:12px;">
        <strong>Note:</strong> ${subEvent.note}
      </div>`;
    }

    /* ================= FULL HTML DOCUMENT ================= */
    const fullHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Sub Event Production Report - ${subEvent?.name || 'N/A'}</title>
  <style>
    @page { margin: 12mm 8mm; size: A4; }
    body { margin:0; padding:0; font-family: Arial, sans-serif; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    table { width:100%; border-collapse: collapse; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    @media print {
      body { margin: 0; }
    }
  </style>
</head>
<body>
  <div style="padding:12px;">
    ${htmlContent}
  </div>
  <script>
    setTimeout(() => {
      window.print();
      setTimeout(() => window.close(), 600);
    }, 400);
  </script>
</body>
</html>`;

    const printWindow = window.open(
      '',
      'printWindow',
      'width=1000,height=800,scrollbars=yes',
    );
    if (!printWindow) {
      toast.error('Please allow popups to generate the PDF');
      return;
    }
    printWindow.document.open();
    printWindow.document.write(fullHtml);
    printWindow.document.close();
  };

  // Add this function inside the component
  const triggerLabourPrediction = () => {
    // Small delay so it doesn't fire on every keystroke
    setTimeout(() => {
      subEventPrediction(
        {
          subEventId: subEvent?.id,
          preparationPeople: subEvent?.expectedPeople,
        },
        {
          onSuccess: () => {
            console.log('Prediction refreshed after labour change');
            // Your existing useEffect will handle updating allDishes
          },
          onError: (err) => {
            console.error('Prediction refresh failed', err);
            // optional: toast.error("Could not refresh data");
          },
        },
      );
    }, 800); // 800ms delay — feels responsive but avoids spam
  };

  return (
    <div>
      <div className="flex flex-col rounded-t-lg bg-white px-4 py-3 text-left dark:bg-boxdark sm:flex-row sm:items-center">
        {/* LEFT SECTION */}
        <div className="flex flex-col py-2">
          <h2 className="mb-1 text-lg font-bold sm:text-xl">
            {subEvent?.name}
          </h2>

          <div className="flex flex-col gap-1 text-sm sm:flex-row sm:gap-4 sm:text-base">
            <span>
              {new Date(subEvent?.date).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}
            </span>

            <span>
              {new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }).format(new Date(subEvent?.time))}
            </span>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="ml-auto flex items-center gap-2">
          {/* People */}
          <div className="flex items-center gap-1">
            <label className="text-sm sm:text-base">People:</label>
            <input
              className="w-13 bg-transparent px-1 py-1 text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
              value={subEvent.expectedPeople}
              {...register('people')}
              disabled
            />
          </div>

          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (isDownloading) return; // Prevent multiple clicks
              setIsDownloading(true);
              try {
                await handleDownloadPDF();
              } catch (error) {
                console.error('PDF generation error:', error);
                toast.error('Failed to generate PDF');
              } finally {
                setIsDownloading(false);
              }
            }}
            className="flex items-center gap-2 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white px-4 dark:bg-black"
        >
          <NewDishTable
            allDishes={allDishes}
            setAllDishes={setAllDishes}
            maharajOptions={maharajOptions}
            setSelectedDishId={setSelectedDish}
            subEventId={subEvent?.id}
            labourDish={foodLabourDishes}
            setLabourDish={setFoodLabourDishes}
            onLabourChange={triggerLabourPrediction}
            onDishSaved={(dishId: string) => {
              setPredictedDishes((prev) => {
                const next = new Set(prev);
                next.add(dishId);
                return next;
              });
            }}
          />
          <div className="mt-4 flex justify-end pb-5">
            {(role === 'CATEROR' || restriction === 'EDIT') && (
              <GenericButton disabled={isAddPending} type="submit">
                {isAddPending ? 'Submitting...' : 'Submit'}
              </GenericButton>
            )}
          </div>
        </form>
      </FormProvider>

      {selectedDish && (
        <NewDishPopup
          allDishes={allDishes}
          setAllDishes={setAllDishes}
          selectedDishId={selectedDish}
          setSelectedDishId={setSelectedDish}
          isadddish={isadddish}
          setIsAddDish={setIsAddDish}
          recordToThisTemplate={recordToThisTemplate}
          setRecordToThisTemplate={setRecordToThisTemplate}
          onDishSaved={(dishId) => predictedDishes.add(dishId)}
        />
      )}
    </div>
  );
};

export default SubEventDishesCalculation;
