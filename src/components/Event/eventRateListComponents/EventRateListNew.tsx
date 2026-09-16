/* eslint-disable */
import {useCallback, useEffect, useState} from 'react';
import {
  useGetEventRawMaterial,
  useGetFoodVendorAssignments,
  useGetSubevent,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {
  useGetAllVendorManpowerRole,
  useGetVendorManpower,
  useGetVendorManpowerRole,
} from '@/lib/react-query/queriesAndMutations/cateror/vendorManpower';
import {Route} from '@/routes/_app/_event/events.$id';
import {zodResolver} from '@hookform/resolvers/zod';
import {FormProvider, useForm} from 'react-hook-form';
import {
  useAddRawMaterialRateList,
  useGetClubVendorPackage,
  useGetEventRateList,
  useGetFuelCost,
  useGetTransportaionCost,
} from '@/lib/react-query/queriesAndMutations/cateror/rawmaterialprice';
import {Loader} from '@/components/Loader/Loader';
import {useAuthContext} from '@/context/AuthContext';
import {
  useGetAllFoodVendors,
  useGetAllSubeventWiseDishRateList,
} from '@/lib/react-query/queriesAndMutations/cateror/foodvendor';
import SubEventSection from './SubEventSection';
import {
  RateCalculatorSchema,
  RateData,
  ExtraInputs,
  VendorInputs,
  FoodVendorInputs,
} from './types';
import EventTabSection from './EventTabSection';
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

// Define schema for form validation
const EventRateListNew = () => {
  const {id: EventId} = Route.useParams();
  const {user} = useAuthContext();
  const caterorId = user?.caterorId;
  const {data: subEvent} = useGetSubevent(EventId);
  const {data: queryData} = useGetEventRawMaterial(EventId);
  const {data: vendorData} = useGetVendorManpower();
  const {data: foodVendorAssignmentsData, refetch} =
    useGetFoodVendorAssignments(EventId);
  const {data: fuelData} = useGetFuelCost(EventId);
  const {data: transportationData} = useGetTransportaionCost(EventId);
  const [transpotationDetails, setTranspotationDetails] = useState([]);
  const [subEventLength, setSubEventLength] = useState(0);
  const {mutate: rawMaterialRate, isPending} = useAddRawMaterialRateList();
  const {data: subEventRateList} = useGetEventRateList(EventId);
  const {data: vendorRoleData} = useGetAllVendorManpowerRole();
  const {data: foodVendorData} = useGetAllFoodVendors();
  const [defaultPerPlate, setDefaultPerPlate] = useState<number>(0);
  const [fixedPerPlate, setFixedPerPlate] = useState<number>(0);
  const {data: subeventWiseDishRateList} =
    useGetAllSubeventWiseDishRateList(EventId);

  const [selectedSubEventId, setSelectedSubEventId] = useState<string | null>(
    null,
  );

  const [savingSubeventId, setSavingSubeventId] = useState<string | null>(null);
  const [collapsedSubevents, setCollapsedSubevents] = useState<
    Record<string, boolean>
  >({});
  const [extraInputs, setExtraInputs] = useState<ExtraInputs>({});

  const [vendorInputs, setVendorInputs] = useState<VendorInputs>({});
  const [foodVendorInputs, setFoodVendorInputs] = useState<FoodVendorInputs>(
    {},
  );
  const [foodVendorAssignments, setFoodVendorAssignments] = useState(
    foodVendorAssignmentsData?.data?.subEvents[0],
  );

  const methods = useForm<RateData>({
    resolver: zodResolver(RateCalculatorSchema),
    defaultValues: {
      subEvents: [],
    },
  });
  const {handleSubmit, watch, setValue} = methods;
  const formValues = watch();
  const calculateTotalRawMaterial = useCallback(
    (
      subEventId: string,
      foodVendorAssignments: RateData['subEvents'][0]['foodVendorAssignments'] = [],
    ) => {
      if (!queryData?.data) return 0;

      const subEventPriceArray = queryData.data.subeventprice || [];

      // Find the price for the given subEventId
      const subEventInfo = subEventPriceArray.find(
        (item) => item.subEventId === subEventId,
      );

      if (!subEventInfo) return 0;

      const totalRawMaterialPrice = subEventInfo.price || 0;

      const dishWiseRawMaterials = queryData.data?.dishWiseRawMaterials || {};

      // Find unchecked dishes
      const uncheckedDishIds = foodVendorAssignments
        .filter((vendor) => vendor.includeRawMaterial === false)
        .map((vendor) => vendor.dishId.trim());

      let remainingRawMaterial = totalRawMaterialPrice;

      uncheckedDishIds.forEach((dishId) => {
        if (dishWiseRawMaterials[dishId]) {
          remainingRawMaterial -= dishWiseRawMaterials[dishId].totalPrice || 0;
        }
      });

      return Math.max(remainingRawMaterial, 0);
    },
    [queryData?.data?.subeventprice, queryData?.data?.dishWiseRawMaterials],
  );

  useEffect(() => {
    setSelectedSubEventId(subEvent?.data?.subEvents[0]?.id);
    setSubEventLength(subEvent?.data?.subEvents?.length || 0);
  }, [subEvent?.data?.subEvents]);

  useEffect(() => {
    if (!subEvent?.data?.subEvents) return;

    const initialSubEvents = subEvent.data.subEvents.map((subEvent: any) => {
      const rateData = subEventRateList?.data?.event?.subEvents?.find(
        (se: any) => se.id === subEvent.id,
      );
      // Prefer API food vendor list if available
      const apiFoodVendors = foodVendorAssignmentsData?.data?.subEvents?.find(
        (se: any) => se.subEventId === subEvent.id,
      );

      const foodVendorAssignments =
        apiFoodVendors?.dishes?.map((dish: any) => ({
          foodVendorId: dish.foodVendorId,
          dishId: dish.dishId,
          price: dish.price,
          includeRawMaterial: dish.rawMaterialCalculation,
          dishName: dish.dishName,
          foodVendorName: dish.foodVendorName,
          preparation: dish.preparation,
          unit: dish.unit,
          expected: dish.expected,
          singlePrice: dish.singlePrice,
          transport: dish.transport,
          actual: dish.actual,
          count: dish.count,
        })) ||
        rateData?.foodVendors?.map((vendor: any) => ({
          foodVendorId: vendor.foodVendorId,
          dishId: vendor.dishId,
          price: vendor.price,
        })) ||
        [];

      const rawMaterial =
        calculateTotalRawMaterial(subEvent.id, foodVendorAssignments) || 0;
      setDefaultPerPlate(rateData?.defaultPerPlate);
      setFixedPerPlate(rateData?.fixedPerPlate);
      return {
        id: subEvent.id,
        name: subEvent.name,
        perPlate: rateData?.perPlate || 0,
        vendorAssignments:
          rateData?.eventManpower?.map((manpower: any) => ({
            id: manpower.id,
            vendorId: manpower.manpowerVendorId,
            count: manpower.quantity,
            price: manpower.rate,
            roleId: manpower.manpowerRoleId,
            transport: manpower.transport,
          })) || [],
        displayVendors:
          rateData?.displayVendors?.map((d: any) => ({
            id: d.id,
            displayVendorId: d.displayVendorId,
            displayId: d.displayId,
            quantity: d.quantity,
            price: d.rate || d.price,
            totalPrice: d.totalPrice,
          })) || [],
        foodVendorAssignments,
        rawMaterial,
        subeventExtraCosts:
          rateData?.subeventExtraCosts?.map((extra: any) => ({
            id: extra.id,
            categoryId: extra.categoryId,
            additionalVendorId: extra.additionalVendorId,
            quantity: extra.quantity,
            price: extra.price,
            particular: extra.particular,
            total: extra.price * extra.quantity,
          })) || [],
        perPlatePrice: rateData?.perPlatePrice || 0,

        profit: rateData?.profit || 0,
      };
    });

    setValue('subEvents', initialSubEvents);
  }, [
    subEvent,
    subEventRateList,
    foodVendorAssignmentsData,
    setValue,
    queryData,
  ]);

  useEffect(() => {
    if (transportationData?.data) {
      const result = calculateTransportDetails(transportationData?.data);
      setTranspotationDetails(result);
    }
  }, [transportationData?.data]);

  // inside EventRateListNew.tsx
  const handleToggleIncludeRawMaterial = (
    subEventId: string,
    dishId: string,
  ) => {
    setValue(
      'subEvents',
      formValues.subEvents.map((subEvent) => {
        if (subEvent.id !== subEventId) return subEvent;

        const updatedFoodVendors = subEvent.foodVendorAssignments.map(
          (vendor) =>
            vendor.dishId === dishId
              ? {...vendor, includeRawMaterial: !vendor.includeRawMaterial}
              : vendor,
        );

        // recalc raw material after toggling
        const updatedRawMaterial = calculateTotalRawMaterial(
          subEventId,
          updatedFoodVendors,
        );

        return {
          ...subEvent,
          foodVendorAssignments: updatedFoodVendors,
          rawMaterial: updatedRawMaterial, // update rawMaterial so summary updates
        };
      }),
    );
  };

  const calculateVendorTotal = (subEventId: string) => {
    const subEvent = formValues.subEvents.find((se) => se.id === subEventId);
    if (!subEvent) return 0;
    const manpowerTotal = subEvent.vendorAssignments.reduce(
      (sum, vendor) => sum + vendor.count * vendor.price,
      0,
    );

    const totalVendorTransport = subEvent.vendorAssignments.reduce(
      (sum, vendor) => sum + vendor.transport,
      0,
    );

    return manpowerTotal + totalVendorTransport;
  };

  const calculateDisplayTotal = useCallback(
    (subEventId: string) => {
      const subEvent = formValues.subEvents.find((se) => se.id === subEventId);
      if (!subEvent?.displayVendors) return 0;
      return subEvent.displayVendors.reduce(
        (sum, display) => sum + display.quantity * display.price,
        0,
      );
    },
    [formValues.subEvents],
  );

  const calculateFoodVendorTotal = (subEventId: string) => {
    const subEvent = formValues.subEvents.find((se) => se.id === subEventId);
    if (!subEvent || !subEvent.foodVendorAssignments) return 0;

    return subEvent.foodVendorAssignments.reduce(
      (sum, vendor) => sum + (Number(vendor.price) || 0),
      0,
    );
  };

  const calculateSubtotal = useCallback(
    (subEventId: string) => {
      const subEvent = formValues.subEvents.find((se) => se.id === subEventId);
      if (!subEvent) return 0;
      const rawMaterial = calculateTotalRawMaterial(subEventId);
      const vendorTotal = calculateVendorTotal(subEventId);
      const displayTotal = calculateDisplayTotal(subEventId);
      const fuelTotal = calculateFuelDifference(fuelData?.data);
      const transportTotal = calculateTransportDetails(
        transportationData?.data,
      );
      const extrasTotal = subEvent.subeventExtraCosts.reduce(
        (sum, extra) => sum + Number(extra.price * extra.quantity),
        0,
      );
      const foodVendorTotal = calculateFoodVendorTotal(subEventId);
      return (
        rawMaterial +
        vendorTotal +
        displayTotal +
        foodVendorTotal +
        fuelTotal?.total +
        transportTotal?.total +
        extrasTotal
      );
    },
    [
      formValues.subEvents,
      calculateVendorTotal,
      calculateDisplayTotal,
      calculateFoodVendorTotal,
      calculateTotalRawMaterial,
    ],
  );

  function calculateFuelDifference(items: any[]) {
    let gasSum = 0;
    let coalSum = 0;

    items?.forEach((item) => {
      if (item.name === 'GAS') {
        gasSum += item.total;
      }

      if (item.name === 'COAL') {
        coalSum += item.total;
      }
    });

    const gasTotal = subEventLength > 0 ? gasSum / subEventLength : 0;
    const coalTotal = subEventLength > 0 ? coalSum / subEventLength : 0;
    const total = (gasSum + coalSum) / subEventLength;

    const gasPercentage = total > 0 ? (gasTotal / total) * 100 : 0;
    const coalPercentage = total > 0 ? (coalTotal / total) * 100 : 0;

    return {
      gasTotal,
      coalTotal,
      total,
      gasPercentage,
      coalPercentage,
    };
  }

  function calculateTransportDetails(items: any[]) {
    let inHouseSum = 0;
    let outHouseSum = 0;
    let totalSum = 0;

    items?.forEach((item) => {
      totalSum += item?.total || 0;

      if (item.type === 'OWN') {
        inHouseSum += item.total;
      }

      if (item.type === 'RENTAL') {
        outHouseSum += item.total;
      }
    });

    const total = subEventLength > 0 ? totalSum / subEventLength : 0;
    const inHouseTotal = subEventLength > 0 ? inHouseSum / subEventLength : 0;
    const outHouseTotal = subEventLength > 0 ? outHouseSum / subEventLength : 0;

    const inPercentage = total > 0 ? (inHouseTotal / total) * 100 : 0;
    const outPercentage = total > 0 ? (outHouseTotal / total) * 100 : 0;

    return {
      inHouseTotal,
      outHouseTotal,
      total,
      inPercentage,
      outPercentage,
    };
  }
  const calculateTotal = useCallback(
    (subEventId: string) => {
      const subtotal = calculateSubtotal(subEventId);
      const subEvent = formValues.subEvents.find((se) => se.id === subEventId);
      if (!subEvent) return subtotal;
      const profit = (subtotal * subEvent.profit) / 100;
      return subtotal + profit;
    },
    [formValues.subEvents, calculateSubtotal],
  );

  const handleAddVendor = (subEventId: string) => {
    const vendorInput = vendorInputs[subEventId];
    if (
      vendorInput?.vendorId &&
      vendorInput.count &&
      vendorInput.price &&
      vendorInput.roleId &&
      vendorInput.transport
    ) {
      const newVendorAssignment = {
        vendorId: vendorInput.vendorId,
        count: Number(vendorInput.count) || 0,
        price: Number(vendorInput.price) || 0,
        roleId: vendorInput.roleId,
        transport: Number(vendorInput.transport) || 0,
      };

      const updatedSubEvents = formValues.subEvents.map((subEvent) => {
        if (subEvent.id === subEventId) {
          return {
            ...subEvent,
            vendorAssignments: [
              ...subEvent.vendorAssignments,
              newVendorAssignment,
            ],
          };
        }
        return subEvent;
      });

      setValue('subEvents', updatedSubEvents);
      setVendorInputs((prev) => ({
        ...prev,
        [subEventId]: {
          vendorId: '',
          count: '',
          price: '',
          roleId: '',
          transport: '',
        },
      }));
    }
  };

  // const handleRemoveVendor = (subEventId: string, index: number) => {
  //   const updatedSubEvents = formValues.subEvents.map((subEvent) => {
  //     if (subEvent.id === subEventId) {
  //       const newVendorAssignments = [...subEvent.vendorAssignments];
  //       newVendorAssignments.splice(index, 1);
  //       return {...subEvent, vendorAssignments: newVendorAssignments};
  //     }
  //     return subEvent;
  //   });
  //   setValue('subEvents', updatedSubEvents);
  // };

  const handleRemoveVendor = (subEventId: string, index: number) => {
    confirmAlert({
      title: 'Remove vendor',
      message:
        'Are you sure you want to remove this vendor from the sub-event?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            const updatedSubEvents = formValues.subEvents.map((subEvent) => {
              if (subEvent.id === subEventId) {
                const newVendorAssignments = [...subEvent.vendorAssignments];
                newVendorAssignments.splice(index, 1);
                return {
                  ...subEvent,
                  vendorAssignments: newVendorAssignments,
                };
              }
              return subEvent;
            });

            setValue('subEvents', updatedSubEvents);
          },
        },
        {
          label: 'Cancel',
        },
      ],
    });
  };

  const handleAddFoodVendor = (
    subEventId: string,
    isLabour = false,
    newAssignment: any,
  ) => {
    // Check if this is a club vendor assignment
    const allVendors = foodVendorData?.data || [];
    const vendor = allVendors.find(
      (v: any) => v.id === newAssignment.foodVendorId,
    );
    const isClubVendor =
      vendor?.isClubVendor === true || newAssignment.isClubVendor === true;

    // Update form state
    const updatedSubEvents = formValues.subEvents.map((subEvent) => {
      if (subEvent.id === subEventId) {
        return {
          ...subEvent,
          foodVendorAssignments: [
            ...(subEvent.foodVendorAssignments || []),
            {
              ...newAssignment,
              isClubVendor: isClubVendor,
              includeRawMaterial: isClubVendor
                ? true
                : newAssignment.includeRawMaterial,
            },
          ],
        };
      }
      return subEvent;
    });

    setValue('subEvents', updatedSubEvents);

    // Only recalculate raw material if it's a FOOD vendor (not labour) and not a club vendor
    if (!isLabour && !isClubVendor) {
      const updatedValues = methods.getValues();
      const subEventIndex = updatedValues.subEvents.findIndex(
        (se: any) => se.id === subEventId,
      );
      if (subEventIndex !== -1) {
        const newAssignments =
          updatedValues.subEvents[subEventIndex].foodVendorAssignments || [];
        const newRawMaterial = calculateTotalRawMaterial(
          subEventId,
          newAssignments,
        );
        setValue(`subEvents.${subEventIndex}.rawMaterial`, newRawMaterial);
      }
    }
  };

  // Inside EventRateListNew.tsx or SubEventSection.tsx

  const handleUpdateFoodVendor = (
    subEventId: string,
    index: number,
    updatedAssignment: any,
  ) => {
    const updatedSubEvents = formValues.subEvents.map((subEvent: any) => {
      if (subEvent.id === subEventId) {
        const newAssignments = [...(subEvent.foodVendorAssignments || [])];
        newAssignments[index] = updatedAssignment;
        return {...subEvent, foodVendorAssignments: newAssignments};
      }
      return subEvent;
    });

    setValue('subEvents', updatedSubEvents);

    const subEvent = updatedSubEvents.find((se: any) => se.id === subEventId);
    const isLabour = updatedAssignment.includeRawMaterial === false;
    if (!isLabour) {
      const newRawMaterial = calculateTotalRawMaterial(
        subEventId,
        subEvent.foodVendorAssignments,
      );
      const subEventIndex = updatedSubEvents.findIndex(
        (se: any) => se.id === subEventId,
      );
      if (subEventIndex !== -1) {
        setValue(`subEvents.${subEventIndex}.rawMaterial`, newRawMaterial);
      }
    }
  };

  const handleRemoveFoodVendor = (
    subEventId: string,
    indexToRemove: number,
  ) => {
    const currentFormValues = methods.getValues();
    const subEvent = currentFormValues.subEvents.find(
      (se: any) => se.id === subEventId,
    );
    if (!subEvent) return;

    let assignments = [...(subEvent.foodVendorAssignments || [])];
    const rowToRemove = assignments[indexToRemove];
    if (!rowToRemove) return;

    assignments.splice(indexToRemove, 1);
    const newRawMaterial = calculateTotalRawMaterial(subEventId, assignments);
    const updatedSubEvents = currentFormValues.subEvents.map((se: any) =>
      se.id === subEventId
        ? {
            ...se,
            foodVendorAssignments: assignments,
            rawMaterial: newRawMaterial,
          }
        : se,
    );

    setValue('subEvents', updatedSubEvents);
  };
  const handleAddExtra = (subEventId: string) => {
    const extraInput = extraInputs[subEventId];
    if (extraInput?.additionalVendorId && extraInput.price) {
      const newExtra = {
        additionalVendorId: extraInput.additionalVendorId,
        categoryId: extraInput.categoryId,
        particular: extraInput.particular,
        quantity: Number(extraInput.quantity) || 0,
        price: Number(extraInput.price) || Number(0),
        total: Number(extraInput.quantity) * Number(extraInput.price) || 0,
      };

      const updatedSubEvents = formValues.subEvents.map((subEvent) => {
        if (subEvent.id === subEventId) {
          return {
            ...subEvent,
            subeventExtraCosts: [...subEvent.subeventExtraCosts, newExtra],
          };
        }
        return subEvent;
      });

      setValue('subEvents', updatedSubEvents);
      setExtraInputs((prev) => ({
        ...prev,
        [subEventId]: {
          additionalVendorId: '',
          categoryId: '',
          particular: '',
          quantity: '',
          price: '',
          total: '',
        },
      }));
    }
  };

  const handleRemoveExtra = (subEventId: string, index: number) => {
    const updatedSubEvents = formValues.subEvents.map((subEvent) => {
      if (subEvent.id === subEventId) {
        const newExtraCost = [...subEvent.subeventExtraCosts];
        newExtraCost.splice(index, 1);
        return {...subEvent, subeventExtraCosts: newExtraCost};
      }
      return subEvent;
    });

    setValue('subEvents', updatedSubEvents);
  };

  const handleAddClubVendor = (subEventId: string) => {};

  const toggleCollapse = (subEventId: string) => {
    setCollapsedSubevents((prev) => ({
      ...prev,
      [subEventId]: !prev[subEventId],
    }));
  };

  const formatSubeventDataForBackend = (subEvent: RateData['subEvents'][0]) => {
    const subEventDishes = getDishesForSubevent(subEvent.id);
    const peopleCount = subEvent.people || 100;

    return {
      subEventId: subEvent.id,
      manpower: subEvent.vendorAssignments.map((vendor) => ({
        id: vendor.id,
        manpowerVendorId: vendor.vendorId,
        manpowerRoleId: vendor.roleId,
        quantity: vendor.count,
        rate: vendor.price,
        transport: vendor.transport || 0,
        totalAmount: vendor.count * vendor.price + (vendor.transport || 0),
      })),
      displayVendors:
        subEvent.displayVendors?.map((vendor) => ({
          id: vendor.id,
          displayVendorId: vendor.displayVendorId,
          displayId: vendor.displayId,
          quantity: vendor.quantity,
          price: vendor.price,
          totalPrice: vendor.totalPrice,
        })) || [],
      price: calculateTotal(subEvent.id),
      foodVendor: (subEvent.foodVendorAssignments || []).map((vendor) => {
        const dish = subEventDishes.find(
          (d: any) => d.caterorDishId === vendor.dishId,
        );

        const isLabour = vendor.includeRawMaterial === false;
        const isClubVendor = vendor.isClubVendor === true;

        // For club vendors, include raw material calculation should be true
        const rawMaterialCalculation = isClubVendor
          ? true
          : (vendor.includeRawMaterial ?? !isLabour);

        const totalPrice =
          vendor.price ||
          vendor.singlePrice * vendor.count + (vendor.transport || 0);

        return {
          id: dish ? dish.dishId : vendor.dishId,
          foodVendorId: vendor.foodVendorId,
          price: Math.max(totalPrice, 1),
          rawMaterialCalculation: rawMaterialCalculation,
          isClubVendor: isClubVendor, // Add this flag
          expected: isLabour
            ? Math.max(peopleCount, 1)
            : Math.max(vendor.expected || vendor.preparation || 0, 1),
          preparation: isLabour
            ? Math.max(peopleCount, 1)
            : Math.max(vendor.preparation || vendor.expected || 0, 1),
          unit: vendor.unit || 'KILOGRAM',
          singlePrice: vendor.singlePrice ?? 0,
          transport: vendor.transport || 0,
          count: vendor.count || 0,
        };
      }),
      profit: subEvent.profit || 0,
      perPlatePrice: subEvent.perPlatePrice || 0,
      extraCost: subEvent.subeventExtraCosts.map((item) => ({
        id: item.id,
        additionalVendorId: item.additionalVendorId,
        categoryId: item.categoryId,
        particular: item.particular,
        quantity: Number(item.quantity),
        price: Number(item.price),
        total: Number(item.total),
      })),
      rawMaterialCost: calculateTotalRawMaterial(
        subEvent.id,
        subEvent.foodVendorAssignments,
      ),
    };
  };

  const saveSubevent = async (subEventId: string) => {
    try {
      setSavingSubeventId(subEventId);
      const currentSubEvent = formValues.subEvents.find(
        (se) => se.id === subEventId,
      );
      if (!currentSubEvent) return;

      const formattedData = formatSubeventDataForBackend(currentSubEvent);

      rawMaterialRate({
        subEventId: EventId,
        perPlate: currentSubEvent.perPlate, // ← FIXED: Use per-sub-event value
        defaultPerPlate: currentSubEvent.defaultPerPlate || 0,
        ...formattedData,
      });
      refetch();
    } catch (error) {
      console.error('Error saving subevent rate list:', error);
    } finally {
      setSavingSubeventId(null);
    }
  };

  const onSubmit = async (data: RateData) => {
    try {
      const formattedData = data.subEvents.map(formatSubeventDataForBackend);
      rawMaterialRate({
        eventId: EventId,
        perPlate: perPlate,
        defaultPerPlate: Number(defaultPerPlate) || 0,
        rateLists: formattedData,
      });
    } catch (error) {
      console.error('Error saving rate lists:', error);
    }
  };

  const getAvailableVendors = () => vendorData || [];
  const getAvailableVendorRoles = () => vendorRoleData || [];

  const getDishesForSubevent = (subEventId: string) => {
    const subEventDishes =
      subeventWiseDishRateList?.data?.subEvents?.find(
        (se: any) => se.subEventId === subEventId,
      )?.dishes || [];
    return subEventDishes;
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="dark:bg-gray-800 mx-auto space-y-6 bg-transparent"
      >
        <div>
          {/* BEAUTIFUL TABS */}
          <div className="sticky top-0 z-20 bg-white shadow-sm dark:bg-black">
            <div className="flex items-center overflow-x-auto border-b">
              {formValues.subEvents.map((sub) => {
                const isActive = selectedSubEventId === sub.id;

                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubEventId(sub.id)}
                    className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-all duration-300 hover:bg-blue-50 hover:text-blue-700 sm:text-base ${
                      isActive
                        ? 'border-blue-600 bg-blue-100 font-medium text-blue-600 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-500 hover:border-gray-300 dark:text-gray-400 border-transparent'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
              {formValues.subEvents.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSubEventId('event')}
                  className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-all duration-300 hover:bg-blue-50 hover:text-orange-600 sm:text-base ${
                    selectedSubEventId === 'event'
                      ? 'border-orange-600 bg-orange-100 font-medium text-orange-600 dark:border-orange-500 dark:bg-blue-900/30 dark:text-orange-400'
                      : 'text-gray-500 hover:border-gray-300 dark:text-gray-400 border-transparent'
                  }`}
                >
                  Event
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {selectedSubEventId && selectedSubEventId !== 'event' && (
              <SubEventSection
                key={selectedSubEventId}
                subEventForm={
                  formValues.subEvents.find(
                    (se) => se.id === selectedSubEventId,
                  )!
                }
                collapsed={collapsedSubevents[selectedSubEventId]}
                toggleCollapse={toggleCollapse}
                calculateTotal={calculateTotal}
                calculateTotalRawMaterial={calculateTotalRawMaterial}
                calculateVendorTotal={calculateVendorTotal}
                calculateDisplayTotal={calculateDisplayTotal}
                calculateFoodVendorTotal={calculateFoodVendorTotal}
                handleToggleIncludeRawMaterial={handleToggleIncludeRawMaterial}
                calculateSubtotal={calculateSubtotal}
                vendorData={vendorData}
                vendorRoleData={vendorRoleData}
                foodVendorData={foodVendorData}
                subeventWiseDishRateList={subeventWiseDishRateList}
                extraInputs={extraInputs}
                setExtraInputs={setExtraInputs}
                vendorInputs={vendorInputs}
                setVendorInputs={setVendorInputs}
                foodVendorInputs={foodVendorInputs}
                setFoodVendorInputs={setFoodVendorInputs}
                handleAddVendor={handleAddVendor}
                handleRemoveVendor={handleRemoveVendor}
                handleAddFoodVendor={handleAddFoodVendor}
                handleAddClubVendor={handleAddClubVendor}
                handleRemoveFoodVendor={handleRemoveFoodVendor}
                handleAddExtra={handleAddExtra}
                handleRemoveExtra={handleRemoveExtra}
                getAvailableVendors={getAvailableVendors}
                getAvailableVendorRoles={getAvailableVendorRoles}
                getDishesForSubevent={getDishesForSubevent}
                formValues={formValues}
                setValue={setValue}
                saveSubevent={saveSubevent}
                savingSubeventId={savingSubeventId}
                subEventRateList={subEventRateList}
                foodVendorAssignments={foodVendorAssignments}
                setFoodVendorAssignments={setFoodVendorAssignments}
                perPlate={
                  formValues.subEvents.find(
                    (se) => se.id === selectedSubEventId,
                  )?.perPlate || 0
                }
                setPerPlate={(value: number) => {
                  const index = formValues.subEvents.findIndex(
                    (se) => se.id === selectedSubEventId,
                  );
                  if (index !== -1) {
                    setValue(`subEvents.${index}.perPlate`, value);
                  }
                }}
                handleUpdateFoodVendor={handleUpdateFoodVendor}
                fuelItems={fuelData?.data}
                subEventLength={subEventLength}
                calculateFuelDifference={calculateFuelDifference}
                transpotationDetails={transpotationDetails}
                defaultPerPlate={defaultPerPlate}
                fixedPerPlate={fixedPerPlate}
                setDefaultPerPlate={setDefaultPerPlate}
              />
            )}
            {selectedSubEventId === 'event' && <EventTabSection />}
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default EventRateListNew;
