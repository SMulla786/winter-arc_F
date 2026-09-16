/* eslint-disable */
import React, {useEffect, useCallback, useRef, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {BiChevronDown, BiChevronUp, BiQr} from 'react-icons/bi';
import GenericButton from '../Forms/Buttons/GenericButton';
import {useGetAllMaharaj} from '@/lib/react-query/queriesAndMutations/cateror/maharaj';
import {
  rawMaterialWithQuantityAndPriceSchema,
  SubEventRawMaterialListValidation,
} from '@/lib/validation/eventSchema';
import {z} from 'zod';
import {
  useAddSubEventDishRawMaterial,
  useGetEventRawMaterial,
  useGetFoodVendorAssignments,
  useSubEventPrediction,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {
  useGetCaterorById,
  useGetDishCategories,
  useGetDishes,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useSubEventContext, SubEventProvider} from '@/context/SubEventContext';
import DishPopup from './RawMaterialComponents/DishPopup';
import DishTable from './RawMaterialComponents/DishTable';
import toast from 'react-hot-toast';
import {useAuthContext} from '@/context/AuthContext';
import {useGetAllFoodVendors} from '@/lib/react-query/queriesAndMutations/cateror/foodvendor';
import {Route} from '@/routes/_app/_event/events.$id';

type FormValues = z.infer<typeof SubEventRawMaterialListValidation>;
type RawMaterialListTypes = z.infer<
  typeof rawMaterialWithQuantityAndPriceSchema
>;
type RawMaterial = {
  rawMaterialId: string;
  processId: string;
  process: string;
  rawMaterial: string;
  unit: string;
  quantity: number;
};

type Dish = {
  dishId: string;
  rawMaterials: RawMaterial[];
};

interface SubEventRawMaterialListProps {
  subEvent: any;
  EventData: any;
}
type PortionPeople = {
  portionSize: number;
  people: number;
  maharaj: string[];
};
const SubEventRawMaterialListInner: React.FC<SubEventRawMaterialListProps> = ({
  subEvent,
  EventData,
}) => {
  const {
    setOnDishClick,
    setIsCollapsed,
    isCollapsed,
    setSelectedDishDetails,
    dishUpdates,
    setPreparationPeople,
  } = useSubEventContext();

  const [isadddish, setIsAddDish] = useState(false);
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const methods = useForm<FormValues>();
  const {handleSubmit, register, setValue, getValues, watch} = methods;
  const {user} = useAuthContext();

  const {id: EventId} = Route.useParams();
  const restriction = user?.employeeRestriction?.rawmaterialCalculator;
  const role = user?.role;
  const {data: profiledata} = useGetCaterorById(user?.caterorId || '');
  const catererLogo = profiledata?.data?.image || '';
  const [isDownloading, setIsDownloading] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const {data: foodvendor} = useGetAllFoodVendors();
  const [updatedDish, setUpdatedDish] = useState<Dish[]>([]);
  const [foodLabourDishes, setFoodLabourDishes] = useState<Dish[]>([]);
  const [portionAndPeople, setPortionAndPeople] = useState<
    Record<string, PortionPeople>
  >({});
  const subEventDishes = subEvent?.dishes || [];

  const {data: maharajs} = useGetAllMaharaj();

  const {mutateAsync: addDishRawMaterial, isPending: isAddPending} =
    useAddSubEventDishRawMaterial();
  const {data: eventRawMaterial, refetch} = useGetEventRawMaterial(EventId);
  const {
    mutate: subEventPrediction,
    data: predictionData,

    isPending,
  } = useSubEventPrediction();
  console.log('preditionnn////', predictionData);
  console.log('subeventtt////....', subEvent);

  const {data: DishCategories} = useGetDishCategories();
  const {data: CaterorDish} = useGetDishes();
  const filteredSubEventDishes = subEventDishes.filter(
    (dish: any) => dish.rawMaterialCalculation !== false,
  );

  const {data} = useGetFoodVendorAssignments(EventId);
  const FoodVendorData = data?.data?.subEvents || [];

  useEffect(() => {
    if (!predictionData?.data?.dishes) return;

    const mappedData: Dish[] = predictionData.data.dishes.map((dish: any) => ({
      dishId: dish.dishId,
      rawMaterials: dish.rawMaterials.map((rm: any) => ({
        ...rm,
      })),
    }));

    setUpdatedDish(mappedData);
  }, [predictionData]);

  useEffect(() => {
    if (!predictionData?.data?.dishes) return;
    const mappedData: Dish[] = predictionData.data.dishes
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
    if (!subEvent) return;
    setValue('preparationPeople', Number(subEvent.expectedPeople), {
      shouldDirty: false,
    });
  }, [subEvent, setValue]);
  const preparationPeopleValue = watch('preparationPeople');
  useEffect(() => {
    setPreparationPeople(Number(preparationPeopleValue));
  }, [preparationPeopleValue, setPreparationPeople]);

  // Initialize prediction
  useEffect(() => {
    if (subEvent?.id) {
      subEventPrediction(
        {
          subEventId: subEvent.id,
          preparationPeople: Number(watch('preparationPeople')),
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

  const maharajOptions =
    maharajs?.map((maharaj: {id: string; fullname: string}) => ({
      label: maharaj.fullname,
      value: maharaj.id,
    })) || [];

  // Memoize onDishClick
  const onDishClick = useCallback(
    (dishId: string) => {
      if (predictionData?.data?.dishes) {
        const matchedDish = predictionData.data.dishes.find(
          (d: any) => d.dishId === dishId,
        );
        if (matchedDish) {
          setSelectedDishDetails(matchedDish);
        } else {
          console.log('No matching dish found in prediction data.');
        }
      }
    },
    [predictionData, setSelectedDishDetails],
  );

  // Set onDishClick in context
  useEffect(() => {
    setOnDishClick(() => onDishClick);
  }, [setOnDishClick, onDishClick]);

  const onSubmit = async (data: FormValues) => {
    const transformedDishes = data?.dishes?.map((item) => {
      const dishUpdate = dishUpdates[item.dishId];
      const isSelectedDish = setSelectedDishDetails?.dishId === item.dishId;
      if (dishUpdate) {
        return {
          ...item,
          maharajIds: portionAndPeople[item.dishId]?.maharaj,
          kg: Number(dishUpdate.kg),
          rawMaterials: dishUpdate.rawMaterials.map((rawMaterial: any) => ({
            ...rawMaterial,
            quantity: Number(rawMaterial.quantity),
          })),
          price: Number(item.price),
          people: Number(item.people),
          isaddish: item.dishId === selectedDishId,
        };
      } else {
        const predictedDish = predictionData?.data?.dishes?.find(
          (d: any) => d.dishId === item.dishId,
        );

        return {
          ...item,
          maharajIds: portionAndPeople[item.dishId]?.maharaj,
          kg: Number(
            portionAndPeople[item.dishId]?.people *
              portionAndPeople[item.dishId]?.portionSize,
          ),
          rawMaterials:
            updatedDish
              ?.find((d) => d?.dishId === item?.dishId)
              ?.rawMaterials?.map((rawMaterial: any) => ({
                ...rawMaterial,
                quantity: Number(rawMaterial.quantity),
              })) || [],

          price: Number(item.price),
          portionSize: Number(
            portionAndPeople[item.dishId]?.portionSize || item.portionSize,
          ),
          people: Number(portionAndPeople[item.dishId]?.people || item.people),
          isaddish: item.dishId === selectedDishId,
        };
      }
    });

    await addDishRawMaterial({
      dishes: transformedDishes.filter((item) => item.kg > 0),
      subEventId: subEvent?.id,
      preparationPeople: Number(subEvent.expectedPeople),
    });

    refetch();
    subEventPrediction(
      {preparationPeople: subEvent?.expectedPeople, subEventId: subEvent?.id},
      {},
    );
  };

  useEffect(() => {
    if (!subEvent?.dishes?.length) return;
    const transformData = subEvent.dishes.map((dish: any) => ({
      dishId: dish.dishId,
      kg: 0,
      people: dish.preparation,
      price: 100,
      portionSize: dish?.dish?.portionSize ?? 0,
    }));

    setValue('dishes', transformData, {shouldDirty: false});
  }, [subEvent?.dishes, setValue]);

  useEffect(() => {
    if (!predictionData?.data?.dishes?.length) return;

    const portionPeopleMap = predictionData.data.dishes.reduce(
      (
        acc: Record<
          string,
          {portionSize: number; people: number; maharaj: string[]}
        >,
        dish: any,
      ) => {
        acc[dish.dishId] = {
          people: dish?.people ?? 0,
          portionSize: dish?.portionSize ?? 0,
          maharaj: dish?.maharaj?.map((m: any) => m?.maharaj?.id) ?? [],
        };

        return acc;
      },
      {},
    );

    setPortionAndPeople(portionPeopleMap);
  }, [predictionData?.data]);

  useEffect(() => {
    if (predictionData?.data?.dishes) {
      subEventDishes.forEach((dish: any, index: number) => {
        const matchedDish = predictionData.data.dishes.find(
          (d: any) => d.dishId === dish.dishId,
        );
        if (matchedDish) {
          setValue(`dishes.${index}.kg`, matchedDish.kg);
        }
      });
    }
  }, [predictionData, setValue, subEventDishes, dishUpdates]);

  // Update form values with manual changes
  useEffect(() => {
    const currentDishes = getValues('dishes');
    if (currentDishes && currentDishes.length > 0) {
      currentDishes.forEach((dish: any, index: number) => {
        if (dishUpdates[dish.dishId]) {
          setValue(`dishes.${index}.kg`, dishUpdates[dish.dishId].kg);
        }
      });
    }
  }, [dishUpdates, getValues, setValue]);

  useEffect(() => {
    if (!isDownloading) return;
    handleDownloadPDF();
  }, [isDownloading]);

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
          const updatedKg = dishUpdates[dish.dishId]?.kg ?? dish?.expected ?? 0;

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
            portionAndPeople[dish.dishId]?.portionSize ||
            dish?.portionSize ||
            0;
          const people =
            portionAndPeople[dish.dishId]?.people || dish?.people || 0;
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

  return (
    <div className="rounded-sm border-stroke dark:border-strokedark">
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

          {/* PDF Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDownloading(true);
              // handleDownloadPDF();
            }}
            className="flex items-center gap-1 rounded bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200"
          >
            <span>📄</span>
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white px-4 dark:bg-black"
          >
            <div ref={tableRef} className="overflow-x-auto">
              <DishTable
                subEventDishes={filteredSubEventDishes}
                register={register}
                getValues={getValues}
                DishCategories={DishCategories}
                CaterorDish={CaterorDish}
                maharajOptions={maharajOptions}
                foodvendor={foodvendor}
                subEventId={subEvent?.id}
                expectedPeople={subEvent?.expectedPeople || 0}
                portionAndPeople={portionAndPeople}
                setPortionAndPeople={setPortionAndPeople}
                setUpdatedDish={setUpdatedDish}
                updatedDish={updatedDish}
                labourDish={foodLabourDishes}
                setLabourDish={setFoodLabourDishes}
              />
            </div>
            <div className="mt-4 flex justify-end pb-5">
              {(role === 'CATEROR' || restriction === 'EDIT') && (
                <GenericButton disabled={isAddPending} type="submit">
                  {isAddPending ? 'Submitting...' : 'Submit'}
                </GenericButton>
              )}
            </div>
          </form>
        </FormProvider>
      )}
      <DishPopup
        isadddish={isadddish}
        setIsAddDish={setIsAddDish}
        selectedDishId={selectedDishId}
        setSelectedDishId={setSelectedDishId}
        setUpdatedDish={setUpdatedDish}
        updatedDish={updatedDish}
        portionAndPeople={portionAndPeople}
        setPortionAndPeople={setPortionAndPeople}
      />
    </div>
  );
};

const SubEventRawMaterialList: React.FC<SubEventRawMaterialListProps> = ({
  subEvent,
  EventData,
}) => {
  return (
    <SubEventProvider>
      <SubEventRawMaterialListInner subEvent={subEvent} EventData={EventData} />
    </SubEventProvider>
  );
};

export default SubEventRawMaterialList;
