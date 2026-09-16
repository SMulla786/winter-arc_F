/* eslint-disable */
import useColorMode from '@/hooks/useColorMode';
import {useGetAllEmployee} from '@/lib/react-query/queriesAndMutations/cateror/Employee/employee';
import {
  useAssignCounter,
  useDeleteAssignCounterById,
  useGetAssignCounterById,
  useUpdateAssignedCounter,
} from '@/lib/react-query/queriesAndMutations/cateror/managerpost';
import {
  useGetAllVendorManpowerRole,
  useGetVendorManpower,
} from '@/lib/react-query/queriesAndMutations/cateror/vendorManpower';
import {useQueryClient} from '@tanstack/react-query';
import {ChevronDown, ChevronRight, Copy, PlusIcon, X} from 'lucide-react';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FormProvider, useFieldArray, useForm, useWatch} from 'react-hook-form';
import toast from 'react-hot-toast';
import {MdDelete} from 'react-icons/md';
import Select from 'react-select';

const selectStyles = (theme: string) => {
  const isDark = theme === 'dark';
  return {
    control: (base, state) => ({
      ...base,
      minHeight: '28px',
      backgroundColor: isDark ? '#1d2a39' : '#FFFFFF',
      borderColor: state.isFocused
        ? isDark
          ? '#3d4d60'
          : '#3C50E0'
        : isDark
          ? '#2E3A47'
          : '#E2E8F0',
      boxShadow: 'none',
      ':hover': {borderColor: isDark ? '#3d4d60' : '#3C50E0'},
      height: 'auto',
    }),
    valueContainer: (base) => ({...base, padding: '0 6px', fontSize: '13px'}),
    input: (base) => ({...base, margin: 0, padding: 0, fontSize: '8px'}),
    indicatorsContainer: (base) => ({...base, height: '28px'}),
    dropdownIndicator: (base) => ({...base, padding: '2px'}),
    clearIndicator: (base, state) => ({
      ...base,
      display: state.isMulti ? 'none' : 'none',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? '#1A222C' : '#FFFFFF',
      fontSize: '14px',
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? isDark
          ? '#24303F'
          : '#EFF4FB'
        : state.isFocused
          ? isDark
            ? '#333A48'
            : '#F7F9FC'
          : isDark
            ? '#1A222C'
            : '#FFFFFF',
      color: isDark ? '#DEE4EE' : '#1C2434',
      cursor: 'pointer',
      padding: '4px',
    }),
    placeholder: (base) => ({...base, color: isDark ? '#8A99AF' : '#64748B'}),
    singleValue: (base) => ({...base, color: isDark ? '#DEE4EE' : '#1C2434'}),
    multiValue: (base) => ({
      ...base,
      backgroundColor: isDark ? '#333A48' : '#EFF4FB',
      borderRadius: 4,
      padding: '0 4px',
      margin: '2px 4px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: isDark ? '#F1F5F9' : '#1C2434',
      fontSize: '11px',
      padding: 0,
      lineHeight: '20px',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: isDark ? '#F5F7FD' : '#1C2434',
      ':hover': {
        backgroundColor: isDark ? '#2E3A47' : '#E5E7EB',
        color: isDark ? '#FFFFFF' : '#000000',
      },
    }),
  };
};

const menuPortalTarget = typeof document !== 'undefined' ? document.body : null;

type FormValues = {
  counters: {
    id?: string;
    name: string;
    dishIds: string[];
    services: {
      serviceId: string;
      vendorEmployeeId: string;
      count: number;
      unitPrice: number;
      totalPrice: number;
    }[];
    total: number;
  }[];
};

const CounterAssignment: React.FC<{subevent: any; subeventId: string}> = ({
  subevent,
  subeventId,
}) => {
  const queryClient = useQueryClient();
  const [colorMode] = useColorMode();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [pendingCounterName, setPendingCounterName] = useState('');

  const {data: assigned} = useGetAssignCounterById(subeventId || '');
  const {data: employees} = useGetAllEmployee();
  const {data: vendors} = useGetVendorManpower();
  const {data: roles = []} = useGetAllVendorManpowerRole();

  const {mutate: assignMutate} = useAssignCounter();
  const {mutate: updateAssignedCounters} = useUpdateAssignedCounter(subeventId);
  const {mutate: deleteCounter} = useDeleteAssignCounterById();

  const methods = useForm<FormValues>({defaultValues: {counters: []}});
  const {fields, prepend, append} = useFieldArray({
    control: methods.control,
    name: 'counters',
  });

  const counters = useWatch({control: methods.control, name: 'counters'});

  const dishOptions = useMemo(() => {
    return (subevent?.dishes || []).map((d: any) => ({
      value: d.id,
      label: d.dish.name,
    }));
  }, [subevent]);

  const roleOptions = useMemo(() => {
    return roles
      .filter((r: any) =>
        r.roleType === 'KITCHEN' ? r.name === 'SERVICE' : true,
      )
      .map((r: any) => ({
        value: r.id,
        label: r.name,
        price: r.price || 0,
      }));
  }, [roles]);

  const getStaffLabel = useCallback(
    (staffId: string): string => {
      if (!staffId) return '';
      if (staffId.startsWith('emp_')) {
        const empId = staffId.split('_')[1];
        const employee = employees?.data?.find((e: any) => e.id === empId);
        return employee
          ? `${employee.fullname} (Employee)`
          : `Employee ${empId}`;
      }
      if (staffId.startsWith('ven_')) {
        const venId = staffId.split('_')[1];
        const vendor = vendors?.find((v: any) => v.id === venId);
        return vendor ? `${vendor.name} (Vendor)` : `Vendor ${venId}`;
      }
      if (staffId.startsWith('mah_')) {
        return `Maharaj ${staffId.split('_')[1]}`;
      }
      return staffId;
    },
    [employees, vendors],
  );

  const staffOptions = useMemo(() => {
    const empOptions = (
      employees?.data?.filter((e: any) => e.isCounter !== false) || []
    ).map((e: any) => ({
      value: `emp_${e.id}`,
      label: `${e.fullname} (Employee)`,
    }));
    const vendorOptions = (vendors || []).map((v: any) => ({
      value: `ven_${v.id}`,
      label: `${v.name} (Vendor)`,
    }));
    return [...empOptions, ...vendorOptions];
  }, [employees, vendors]);

  const vendorRolePriceMap = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    vendors?.forEach((v: any) => {
      const key = `ven_${v.id}`;
      map[key] = {};
      v.roles?.forEach((r: any) => {
        if (r.role?.id) map[key][r.role.id] = r.price || 0;
      });
    });
    return map;
  }, [vendors]);

  const globalRolePriceMap = useMemo(() => {
    const map: Record<string, number> = {};
    roles.forEach((r: any) => {
      map[r.id] = r.price || 0;
    });
    return map;
  }, [roles]);

  const calculateUnitPrice = useCallback(
    (serviceId: string, staffId: string): number => {
      if (!serviceId) return 0;
      if (staffId?.startsWith('ven_')) {
        const vendorPrice = vendorRolePriceMap[staffId]?.[serviceId];
        if (vendorPrice > 0) return vendorPrice;
      }
      return globalRolePriceMap[serviceId] || 0;
    },
    [vendorRolePriceMap, globalRolePriceMap],
  );

  const shouldHideDishesColumn = useCallback((counterName: string): boolean => {
    const normalized = counterName.toLowerCase().trim();
    return (
      normalized.includes('plate counter') ||
      normalized.includes('water counter')
    );
  }, []);

  useEffect(() => {
    if (assigned?.data?.length) {
      const formatted = assigned.data.map((c: any) => {
        const services = (c.subEventCounterServices || []).map((s: any) => {
          let staffId = '';
          if (s.counterManpowerVendors?.[0]?.manpowerVendorId)
            staffId = `ven_${s.counterManpowerVendors[0].manpowerVendorId}`;
          else if (s.counterEmployees?.[0]?.employeeId)
            staffId = `emp_${s.counterEmployees[0].employeeId}`;
          else if (s.counterMaharajs?.[0]?.maharajId)
            staffId = `mah_${s.counterMaharajs[0].maharajId}`;

          const unitPrice = calculateUnitPrice(s.serviceId, staffId);
          const count = s.quantity || 1;
          return {
            serviceId: s.serviceId || '',
            vendorEmployeeId: staffId,
            count,
            unitPrice,
            totalPrice: unitPrice * count,
          };
        });

        const total = services.reduce(
          (sum: number, s: any) => sum + s.totalPrice,
          0,
        );
        return {
          id: c.id,
          name: c.name || '',
          dishIds: c.counterDishes?.map((cd: any) => cd.subEventDishId) || [],
          services,
          total,
        };
      });
      methods.reset({counters: formatted});
    }
  }, [assigned, methods, calculateUnitPrice]);
  // Replace your existing useEffect with this:
  useEffect(() => {
    if (counters?.length > 0 && expanded.size === 0) {
      // Create a Set with all group keys
      const allGroupKeys = new Set<string>();

      counters.forEach((counter: any) => {
        if (counter?.name) {
          let baseName = counter.name.trim();
          baseName = baseName.replace(/\s*\d+$/, '').trim();
          const groupKey = baseName || 'Unnamed Counter';
          allGroupKeys.add(groupKey);
        }
      });

      if (allGroupKeys.size > 0) {
        setExpanded(allGroupKeys);
      }
    }
  }, [counters?.length]);

  const getNextCounterNumber = (baseName: string) => {
    const normalizedBase = baseName.toLowerCase().trim();
    const sameBaseCounters = counters.filter((c: any) =>
      c.name.toLowerCase().trim().startsWith(normalizedBase),
    );

    if (sameBaseCounters.length === 0) return 1;

    const numbers = sameBaseCounters
      .map((c: any) => {
        const match = c.name.trim().match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);

    return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  };

  const copyCounter = (counterToCopy: any) => {
    const originalName = counterToCopy.name.trim();

    // Extract base name (without any existing number or "copy" suffix)
    const baseName = originalName
      .replace(/\s*copy\s*(\d*)$/i, '') // Remove "copy X" suffix
      .replace(/\s*\d+$/, '') // Remove any number suffix
      .trim();

    // Find all counters that start with this base name
    const relatedCounters = counters.filter((c: any) => {
      const cName = c.name.toLowerCase().trim();
      const baseLower = baseName.toLowerCase();

      // Check if counter name starts with base name
      return cName.startsWith(baseLower);
    });

    // Extract numbers from all related counters (including originals and copies)
    const numbers = relatedCounters
      .map((c: any) => {
        const cName = c.name.trim();
        const withoutBase = cName.substring(baseName.length).trim();

        // Try to match a number at the start of the remaining string
        const numberMatch = withoutBase.match(/^(\d+)/);
        if (numberMatch) {
          return parseInt(numberMatch[1], 10);
        }

        // If no number found, check for patterns like "copy" or just base name
        if (
          withoutBase === '' ||
          withoutBase.toLowerCase().startsWith('copy')
        ) {
          return 1; // The original counter (implicitly number 1)
        }

        return 0;
      })
      .filter((n) => n > 0);

    // Find the next available number
    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

    // Create new name with incremented number
    const newName =
      nextNumber === 1
        ? baseName // If it's the first copy after original, keep just base name
        : `${baseName} ${nextNumber} copy`;

    // Special case: if original already had a number (like "Counter 2"), handle differently
    const originalNumberMatch = originalName.match(/(\d+)$/);
    if (
      originalNumberMatch &&
      baseName === originalName.replace(/\d+$/, '').trim()
    ) {
      // Original has a number, so we need to check if we should increment
      const originalNum = parseInt(originalNumberMatch[1], 10);

      // Find highest number among counters with this base name
      const maxNum = Math.max(...numbers, originalNum);
      const newName =
        maxNum === originalNum
          ? `${baseName} ${originalNum + 1} copy`
          : `${baseName} ${maxNum + 1} copy`;
    }

    const newCounter = {
      name: newName,
      dishIds: [...(counterToCopy.dishIds || [])],
      services: counterToCopy.services.map((s: any) => ({...s})),
      total: counterToCopy.total,
    };

    // Add to form
    append(newCounter);

    // Auto-expand the group
    const groupKey = baseName || 'Unnamed Counter';
    setExpanded((prev) => new Set([...prev, groupKey]));

    toast.success(`Copied as "${newName}"`);
  };

  const openAddCounterModal = () => {
    setPendingCounterName(`Counter ${fields.length + 1}`);
    setIsNameModalOpen(true);
  };

  const createNewCounter = () => {
    const name = pendingCounterName.trim();
    if (!name) {
      toast.error('Counter name is required');
      return;
    }

    const baseName = name.replace(/\s*\d+$/, '').trim();
    const groupKey = baseName || 'Unnamed Counter';

    prepend({
      name,
      dishIds: [],
      services: [
        {
          serviceId: '',
          vendorEmployeeId: '',
          count: 1,
          unitPrice: 0,
          totalPrice: 0,
        },
      ],
      total: 0,
    });

    setExpanded((prev) => new Set(prev).add(groupKey));

    setIsNameModalOpen(false);
    setPendingCounterName('');
    toast.success(`Counter "${name}" added`);
  };

  const handleServiceFieldChange = useCallback(
    (
      counterIndex: number,
      serviceIndex: number,
      field: 'serviceId' | 'vendorEmployeeId' | 'count',
      value: any,
    ) => {
      const path = `counters.${counterIndex}.services.${serviceIndex}`;
      const current = methods.getValues(path);

      const updated = {
        ...current,
        [field]: field === 'count' ? parseInt(value) || 1 : value,
      };

      const unitPrice = calculateUnitPrice(
        updated.serviceId,
        updated.vendorEmployeeId,
      );
      updated.unitPrice = unitPrice;
      updated.totalPrice = unitPrice * (updated.count || 1);

      methods.setValue(path, updated);

      const services = methods.getValues(`counters.${counterIndex}.services`);
      const newTotal = services.reduce(
        (sum: number, s: any) => sum + s.totalPrice,
        0,
      );
      methods.setValue(`counters.${counterIndex}.total`, newTotal);
    },
    [calculateUnitPrice, methods],
  );

  const addServiceToCounter = (counterIndex: number) => {
    const services =
      methods.getValues(`counters.${counterIndex}.services`) || [];
    methods.setValue(`counters.${counterIndex}.services`, [
      ...services,
      {
        serviceId: '',
        vendorEmployeeId: '',
        count: 1,
        unitPrice: 0,
        totalPrice: 0,
      },
    ]);
  };

  const groupedCounters = useMemo(() => {
    const groups: Record<string, {counter: any; index: number}[]> = {};
    fields.forEach((_, idx) => {
      const counter = counters?.[idx];
      if (!counter) return;
      let baseName = counter.name.trim();
      baseName = baseName.replace(/\s*\d+$/, '').trim();
      const groupKey = baseName || 'Unnamed Counter';
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push({counter, index: idx});
    });

    Object.values(groups).forEach((group) => {
      group.sort((a, b) =>
        a.counter.name.localeCompare(b.counter.name, undefined, {
          numeric: true,
          sensitivity: 'base',
        }),
      );
    });

    return groups;
  }, [fields, counters]);

  useEffect(() => {
    if (!counters?.length) return;
    let changed = false;

    counters.forEach((counter: any, ci: number) => {
      (counter.services || []).forEach((service: any, si: number) => {
        const unitPrice = calculateUnitPrice(
          service.serviceId,
          service.vendorEmployeeId,
        );
        const totalPrice = unitPrice * (service.count || 1);

        if (
          service.unitPrice !== unitPrice ||
          service.totalPrice !== totalPrice
        ) {
          changed = true;
          methods.setValue(
            `counters.${ci}.services.${si}.unitPrice`,
            unitPrice,
          );
          methods.setValue(
            `counters.${ci}.services.${si}.totalPrice`,
            totalPrice,
          );
        }
      });

      const newTotal = (counter.services || []).reduce(
        (sum: number, s: any) => sum + s.totalPrice,
        0,
      );
      if (counter.total !== newTotal) {
        changed = true;
        methods.setValue(`counters.${ci}.total`, newTotal);
      }
    });
  }, [counters, calculateUnitPrice, methods]);

  const toggleExpand = (groupKey: string) => {
    setExpanded((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) newSet.delete(groupKey);
      else newSet.add(groupKey);
      return newSet;
    });
  };

  const saveGroupCounters = (groupKey: string, instanceIndexes: number[]) => {
    const invalidCounters = instanceIndexes.filter((idx) => {
      const counter = methods.getValues(`counters.${idx}`);
      return !counter.name.trim();
    });

    if (invalidCounters.length > 0) {
      toast.error('Counter names are required for all counters in this group');
      return;
    }

    const counterPayloads = instanceIndexes.map((idx) => {
      const counter = methods.getValues(`counters.${idx}`);
      const servicesPayload = counter.services.map((s: any) => {
        const staffId = s.vendorEmployeeId;
        const isVendor = staffId?.startsWith('ven_');
        const isEmployee = staffId?.startsWith('emp_');
        const isMaharaj = staffId?.startsWith('mah_');

        return {
          serviceId: s.serviceId,
          vendorId: isVendor ? [{id: staffId.split('_')[1]}] : [],
          employeeId: isEmployee ? [{id: staffId.split('_')[1]}] : [],
          maharajId: isMaharaj ? [{id: staffId.split('_')[1]}] : [],
          count: s.count,
          price: s.totalPrice,
        };
      });

      return {
        counterId: counter.id || undefined,
        name: counter.name,
        dishes: counter.dishIds.map((id: string) => ({id})),
        services: servicesPayload,
      };
    });

    const newCounters = counterPayloads.filter((c) => !c.counterId);

    const createPromises = newCounters.map(
      (counter) =>
        new Promise((resolve, reject) => {
          assignMutate(
            {id: subeventId, data: counter},
            {
              onSuccess: (d) => {
                const index = instanceIndexes[counterPayloads.indexOf(counter)];
                if (d?.id) {
                  methods.setValue(`counters.${index}.id`, d.id);
                }
                resolve(d);
              },
              onError: () =>
                reject(new Error(`Failed to create ${counter.name}`)),
            },
          );
        }),
    );

    Promise.all(createPromises)
      .then(() => {
        const updatedPayloads = instanceIndexes.map((idx) => {
          const counter = methods.getValues(`counters.${idx}`);
          const servicesPayload = counter.services.map((s: any) => {
            const staffId = s.vendorEmployeeId;
            const isVendor = staffId?.startsWith('ven_');
            const isEmployee = staffId?.startsWith('emp_');
            const isMaharaj = staffId?.startsWith('mah_');

            return {
              serviceId: s.serviceId,
              vendorId: isVendor ? [{id: staffId.split('_')[1]}] : [],
              employeeId: isEmployee ? [{id: staffId.split('_')[1]}] : [],
              maharajId: isMaharaj ? [{id: staffId.split('_')[1]}] : [],
              count: s.count,
              price: s.totalPrice,
            };
          });

          return {
            counterId: counter.id,
            name: counter.name,
            dishes: counter.dishIds.map((id: string) => ({id})),
            services: servicesPayload,
          };
        });

        if (updatedPayloads.length > 0) {
          updateAssignedCounters(updatedPayloads as any);
        }
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to save counters');
      });
  };

  const removeServiceFromCounter = (
    counterIndex: number,
    serviceIndex: number,
  ) => {
    const services =
      methods.getValues(`counters.${counterIndex}.services`) || [];
    if (services.length <= 1) {
      toast.error('At least one role is required per counter');
      return;
    }
    methods.setValue(
      `counters.${counterIndex}.services`,
      services.filter((_, i) => i !== serviceIndex),
    );

    const newServices = services.filter((_, i) => i !== serviceIndex);
    const newTotal = newServices.reduce(
      (sum: number, s: any) => sum + s.totalPrice,
      0,
    );
    methods.setValue(`counters.${counterIndex}.total`, newTotal);
  };

  return (
    <div className="bg-gray-50 dark:bg-boxdark">
      <div className="py-6">
        <div className="mb-6 flex items-center justify-between bg-green-100">
          <div>
            <h1 className="px-4 py-1 text-lg font-semibold text-graydark dark:text-green-900">
              Counter Assignment - {subevent?.name}
            </h1>
          </div>

          <button
            onClick={openAddCounterModal}
            className="flex items-center gap-2 rounded px-5 py-1.5 text-sm font-bold text-green-900 underline hover:bg-opacity-90"
          >
            Add Manual
          </button>
        </div>

        <FormProvider {...methods}>
          <div className="space-y-4">
            {Object.entries(groupedCounters).map(([groupKey, instances]) => {
              const isExpanded = expanded.has(groupKey);
              const groupTotal = instances.reduce(
                (sum, inst) => sum + (inst.counter.total || 0),
                0,
              );
              const hideDishesColumn = instances.some((instance) =>
                shouldHideDishesColumn(instance.counter.name),
              );

              return (
                <div
                  key={groupKey}
                  className="overflow-hidden rounded-lg bg-white shadow dark:bg-boxdark"
                >
                  <div className="bg-gray-100 hover:bg-gray-200 flex cursor-pointer items-center justify-between px-6 py-4 dark:bg-meta-4 dark:hover:bg-opacity-60">
                    <div
                      className="flex flex-1 items-center gap-3"
                      onClick={() => toggleExpand(groupKey)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                      <h3 className="text-lg font-semibold text-graydark dark:text-white">
                        {groupKey}
                        {instances.length > 1 && (
                          <span className="text-gray-600 dark:text-gray-400 ml-2 text-sm font-normal">
                            ({instances.length} counters)
                          </span>
                        )}
                      </h3>
                      <span className="text-sm font-medium text-green-600">
                        ₹{groupTotal.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Take first instance as reference (they should be very similar)
                        copyCounter(instances[0].counter);
                      }}
                      className="flex items-center gap-1 rounded px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                      title="Duplicate this counter"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="p-2">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-max table-auto border-collapse">
                          <thead>
                            <tr className="bg-gray-2 text-left text-sm font-medium dark:bg-meta-4">
                              <th className="w-4 px-4 py-1">Sr</th>
                              {!hideDishesColumn && (
                                <th className="w-73 px-4 py-1">Dishes</th>
                              )}
                              <th className="w-40 px-4 py-1">Role</th>
                              <th className="w-10 px-4 py-1">Count</th>
                              <th className="w-32 px-4 py-1">Staff / Vendor</th>
                              <th className="w-10 px-4 py-1 text-right">
                                Price (Unit)
                              </th>
                              <th className="w-20 px-4 py-3 text-right">
                                Total
                              </th>
                              <th className="w-20 px-4 py-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="leading-tight">
                            {instances.map((instance, groupIdx) => {
                              const idx = instance.index;
                              const counter = instance.counter;
                              const hideDishesForThisCounter =
                                shouldHideDishesColumn(counter.name);

                              return counter.services.map(
                                (service: any, si: number) => (
                                  <tr
                                    key={`${idx}-${si}`}
                                    className={
                                      si === counter.services.length - 1
                                        ? 'border-b border-stroke dark:border-strokedark'
                                        : ''
                                    }
                                  >
                                    <td className="px-4 text-sm font-medium">
                                      {si === 0 ? groupIdx + 1 : ''}
                                    </td>
                                    {!hideDishesForThisCounter && (
                                      <td className="px-1 pt-4">
                                        {si === 0 && (
                                          <Select
                                            isMulti
                                            options={dishOptions}
                                            value={dishOptions.filter((o) =>
                                              counter.dishIds?.includes(
                                                o.value,
                                              ),
                                            )}
                                            onChange={(opts) =>
                                              methods.setValue(
                                                `counters.${idx}.dishIds`,
                                                opts.map((o) => o.value),
                                              )
                                            }
                                            styles={selectStyles(
                                              colorMode || 'dark',
                                            )}
                                            menuPortalTarget={menuPortalTarget}
                                            menuPosition="fixed"
                                            placeholder="Select dishes"
                                          />
                                        )}
                                      </td>
                                    )}
                                    <td className="px-1">
                                      <Select
                                        options={roleOptions}
                                        value={
                                          roleOptions.find(
                                            (o) =>
                                              o.value === service.serviceId,
                                          ) || null
                                        }
                                        onChange={(opt) =>
                                          handleServiceFieldChange(
                                            idx,
                                            si,
                                            'serviceId',
                                            opt?.value || '',
                                          )
                                        }
                                        styles={selectStyles(
                                          colorMode || 'dark',
                                        )}
                                        menuPortalTarget={menuPortalTarget}
                                        menuPosition="fixed"
                                        placeholder="Role"
                                        isClearable
                                      />
                                    </td>
                                    <td className="px-1">
                                      <input
                                        type="number"
                                        min="1"
                                        value={service.count || 1}
                                        onChange={(e) =>
                                          handleServiceFieldChange(
                                            idx,
                                            si,
                                            'count',
                                            e.target.value,
                                          )
                                        }
                                        className="w-18 rounded border border-stroke px-2 py-1.5 dark:border-strokedark dark:bg-black"
                                      />
                                    </td>
                                    <td className="px-1">
                                      <Select
                                        options={staffOptions}
                                        value={
                                          service.vendorEmployeeId
                                            ? {
                                                value: service.vendorEmployeeId,
                                                label: getStaffLabel(
                                                  service.vendorEmployeeId,
                                                ),
                                              }
                                            : null
                                        }
                                        onChange={(opt) =>
                                          handleServiceFieldChange(
                                            idx,
                                            si,
                                            'vendorEmployeeId',
                                            opt?.value || '',
                                          )
                                        }
                                        styles={selectStyles(
                                          colorMode || 'dark',
                                        )}
                                        menuPortalTarget={menuPortalTarget}
                                        menuPosition="fixed"
                                        placeholder="Select"
                                        isClearable
                                      />
                                    </td>
                                    <td className="px-1 text-right text-sm font-medium">
                                      {service.unitPrice > 0
                                        ? `₹${service.unitPrice.toLocaleString('en-IN')}`
                                        : '—'}
                                    </td>
                                    <td className="px-2 py-3 text-right text-sm font-medium text-graydark dark:text-gray-2">
                                      ₹
                                      {service.totalPrice?.toLocaleString(
                                        'en-IN',
                                      ) || '0'}
                                    </td>
                                    <td className="px-4">
                                      <div className="flex items-center gap-2">
                                        {counter.services.length > 0 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (
                                                counter.services.length === 1
                                              ) {
                                                if (counter.id) {
                                                  deleteCounter(counter.id);
                                                } else {
                                                  methods.setValue(
                                                    'counters',
                                                    counters.filter(
                                                      (_: any, i: number) =>
                                                        i !== idx,
                                                    ),
                                                  );
                                                  toast.success(
                                                    'Counter removed',
                                                  );
                                                }
                                              } else {
                                                removeServiceFromCounter(
                                                  idx,
                                                  si,
                                                );
                                              }
                                            }}
                                            className="text-graydark dark:text-gray"
                                            title={
                                              counter.services.length > 1
                                                ? 'Remove Role'
                                                : 'Delete Entire Counter'
                                            }
                                          >
                                            <MdDelete className="h-4 w-4" />
                                          </button>
                                        )}
                                        {si === counter.services.length - 1 && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              addServiceToCounter(idx)
                                            }
                                            className="text-sm text-graydark hover:underline dark:text-gray"
                                          >
                                            <PlusIcon className="h-4 w-4" />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ),
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() =>
                            saveGroupCounters(
                              groupKey,
                              instances.map((inst) => inst.index),
                            )
                          }
                          className="flex items-center gap-2 rounded bg-primary px-6 py-1.5 text-sm text-white hover:bg-opacity-90"
                        >
                          Save Counter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {fields.length === 0 && (
              <div className="rounded-lg bg-white py-16 text-center shadow dark:bg-boxdark">
                <p className="text-gray-500">
                  No counters yet. Click "Add Manual Counter" to create one.
                </p>
              </div>
            )}
          </div>
        </FormProvider>
      </div>

      {/* Name Input Modal */}
      {isNameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-boxdark">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add New Counter</h2>
              <button
                onClick={() => setIsNameModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">
                Counter Name
              </label>
              <input
                type="text"
                value={pendingCounterName}
                onChange={(e) => setPendingCounterName(e.target.value)}
                className="w-full rounded border px-4 py-2 dark:bg-meta-4"
                placeholder="e.g. Main Counter, Dessert Counter 1"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && createNewCounter()}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsNameModalOpen(false)}
                className="hover:bg-gray-100 rounded border px-5 py-2"
              >
                Cancel
              </button>
              <button
                onClick={createNewCounter}
                className="rounded bg-primary px-6 py-2 text-white hover:bg-opacity-90"
              >
                Create Counter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounterAssignment;
