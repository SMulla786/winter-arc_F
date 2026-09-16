/* eslint-disable */
import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  FormProvider,
  useFieldArray,
  useForm,
  UseFormReturn,
} from 'react-hook-form';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {
  useBulkAddDishWastage,
  useGetWastages,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {useQueryClient} from '@tanstack/react-query';
import {BiChevronDown, BiChevronUp} from 'react-icons/bi';
import {FiSave} from 'react-icons/fi';
import {Route} from '@/routes/_app/_event/events.$id';
import {useAuthContext} from '@/context/AuthContext';

type FormValues = {
  subeventId: string;
  wastages: {
    categoryId: string;
    dishId: string;
    measurement: string;
    quantity: number;
    actual: number;
    reason: string;
    dishname: string;
    categoryname: string;
    preparationQuantity: number;
    unit: string;
  }[];
};

interface Dish {
  id: string;
  dishId: string;
  dish: {
    id: string;
    name: string;
    categoryId: string;
    category: {
      id: string;
      name: string;
    };
    preparationQuantity?: number;
    unit?: string;
  };
  preparationQuantity?: number;
  unit?: string;
}

interface SubEvent {
  id: string;
  name: string;
  dishes: Dish[];
  wastage?: any[];
}

interface DishWastagePropTypes {
  subEvent: SubEvent;
  handleDownloadSelectedSubEventPDF: () => void;
  selectedSubEventName: string;
}

interface WastageSubEvent {
  subeventid: string;
  wastage?: Array<{
    dishId: string;
    preparationQuantity?: number;
    measurement?: string;
    actual?: number;
    quantity?: number;
    reason?: string;
  }>;
}

interface GroupedDish {
  categoryId: string;
  categoryName: string;
  dishes: any[];
}

const DishWastage = forwardRef<
  {submit: () => Promise<void>},
  DishWastagePropTypes
>(
  (
    {
      subEvent,
      handleDownloadSelectedSubEventPDF,
      selectedSubEventName,
    }: DishWastagePropTypes,
    ref,
  ) => {
    const {id: EventId} = Route.useParams<{id: string}>();
    const queryClient = useQueryClient();
    const {user} = useAuthContext();
    const restriction = user?.employeeRestriction?.westageReport;
    const role = user?.role;

    const methods: UseFormReturn<FormValues> = useForm<FormValues>({
      defaultValues: {
        subeventId: subEvent.id,
        wastages: [],
      },
    });

    const {data: wastagesData} = useGetWastages(EventId);

    const wastageData: WastageSubEvent[] = React.useMemo(() => {
      if (!wastagesData?.data) return [];

      if (Array.isArray(wastagesData.data)) return wastagesData.data;

      if (typeof wastagesData.data === 'object') {
        const possibleArrayProps = ['wastages', 'wastageData', 'data'];
        for (const prop of possibleArrayProps) {
          if (Array.isArray((wastagesData.data as any)[prop])) {
            return (wastagesData.data as any)[prop];
          }
        }
      }

      console.warn(
        'Wastage data is not in expected array format:',
        wastagesData.data,
      );
      return [];
    }, [wastagesData]);

    const {
      control,
      setValue,
      handleSubmit,
      formState: {isSubmitting},
      register,
    } = methods;

    const {fields} = useFieldArray({
      name: 'wastages',
      control,
    });

    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const {mutateAsync: bulkAddDishWastage} = useBulkAddDishWastage(EventId);

    useEffect(() => {
      if (subEvent.dishes) {
        const matchingWastageSubEvent = wastageData.find(
          (wse: WastageSubEvent) => wse.subeventid === subEvent.id,
        );

        const wastageMap = new Map(
          matchingWastageSubEvent?.wastage?.map((w: any) => [w.dishId, w]) ||
            [],
        );

        const transformData = subEvent.dishes.map((dishItem) => {
          const dish = dishItem.dish;
          const existingWastage = wastageMap.get(dish.id);

          return {
            categoryId: dish.categoryId,
            dishId: dish.id,
            dishname: dish.name,
            preparationQuantity: existingWastage?.preparationQuantity ?? 0,
            unit: existingWastage?.measurement ?? 'kg',
            actual: existingWastage?.actual ?? 0,
            categoryname: dish.category.name,
            quantity: existingWastage?.quantity ?? 0,
            measurement: existingWastage?.measurement ?? 'kg',
            reason: existingWastage?.reason ?? '',
          };
        });

        setValue('wastages', transformData);
      }
    }, [subEvent, setValue, wastageData]);

    useImperativeHandle(ref, () => ({
      submit: async () => {
        await handleSubmit(onSubmit)();
      },
    }));

    const onSubmit = async (data: FormValues): Promise<void> => {
      const dishWastage = data.wastages.map((item) => ({
        categoryId: item.categoryId,
        dishId: item.dishId,
        quantity: Number(item.quantity),
        actual: Number(item.actual),
        reason: item.reason,
        measurement: (item.unit || item.measurement || 'kg') as
          | 'kg'
          | 'gm'
          | 'ml'
          | 'ltr',
      }));

      await bulkAddDishWastage({
        subeventId: data.subeventId,
        wastages: dishWastage,
      });

      await queryClient.invalidateQueries({queryKey: ['wastages', EventId]});
    };

    const handleSaveAndDownload = async () => {
      await handleSubmit(onSubmit)();
      await queryClient.invalidateQueries({queryKey: ['wastages', EventId]});
      handleDownloadSelectedSubEventPDF();
    };

    // Group fields by category with proper typing
    const groupedDishes: Record<string, GroupedDish> = fields.reduce(
      (acc: Record<string, GroupedDish>, field: any) => {
        const categoryId = field.categoryId || 'uncategorized';
        const categoryName = field.categoryname || 'Uncategorized';

        if (!acc[categoryId]) {
          acc[categoryId] = {
            categoryId,
            categoryName,
            dishes: [],
          };
        }
        acc[categoryId].dishes.push(field);
        return acc;
      },
      {},
    );

    return (
      <div className="mt-2.5 rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div
          className="flex cursor-pointer flex-row justify-between"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <h2 className="text-gray-800 text-xl font-bold dark:text-white">
            {subEvent?.name}
          </h2>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2"
            >
              {isCollapsed ? (
                <BiChevronDown size={24} />
              ) : (
                <BiChevronUp size={24} />
              )}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-4 overflow-x-auto">
                <table className="text-gray-500 dark:text-gray-400 w-full text-left text-sm">
                  <thead className="text-gray-700 dark:text-gray-400 bg-blue-100 text-xs uppercase dark:bg-black">
                    <tr>
                      <th scope="col" className="px-6 py-6">
                        Dish
                      </th>
                      <th scope="col" className="px-6 py-6">
                        Preparation
                      </th>
                      <th scope="col" className="px-6 py-6">
                        Actual
                      </th>
                      <th scope="col" className="px-6 py-6">
                        Wastage (kg)
                      </th>
                      <th scope="col" className="px-6 py-6">
                        Reason
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {Object.values(groupedDishes).map(
                      (group: GroupedDish, groupIndex: number) => (
                        <React.Fragment
                          key={group.categoryId || `group-${groupIndex}`}
                        >
                          {/* Category Header Row */}
                          <tr>
                            <td
                              colSpan={5}
                              className="bg-neutral-50 px-6 py-3 font-semibold text-black dark:bg-slate-800 dark:text-white"
                            >
                              {group.categoryName}
                            </td>
                          </tr>

                          {/* Dishes under this category */}
                          {group.dishes.map((field: any, dishIndex: number) => {
                            const fieldIndex = fields.findIndex(
                              (f: any) => f.dishId === field.dishId,
                            );

                            return (
                              <tr
                                key={`${field.dishId}-${dishIndex}-${fieldIndex}`}
                                className="dark:border-gray-700 dark:bg-gray-800 border-b bg-transparent"
                              >
                                <td className="px-6 py-4">{field.dishname}</td>
                                <td className="px-6 py-4">
                                  {field.preparationQuantity || 0}{' '}
                                  {field.unit || 'kg'}
                                </td>

                                {/* Actual */}
                                <td className="px-6 py-4">
                                  <input
                                    {...register(
                                      `wastages.${fieldIndex}.actual`,
                                      {
                                        valueAsNumber: true,
                                      },
                                    )}
                                    type="number"
                                    step="0.01"
                                    className="w-24 rounded border border-stroke bg-transparent px-2 py-1 text-sm outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                                  />{' '}
                                  {field.unit || 'kg'}
                                </td>

                                {/* Wastage Quantity */}
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <input
                                      {...register(
                                        `wastages.${fieldIndex}.quantity`,
                                        {
                                          valueAsNumber: true,
                                        },
                                      )}
                                      type="number"
                                      step="0.01"
                                      className="w-24 rounded border border-stroke bg-transparent px-2 py-1 text-sm outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                                    />
                                    <span className="text-gray-500">kg</span>
                                  </div>
                                </td>

                                {/* Reason */}
                                <td className="px-6 py-4">
                                  <input
                                    {...register(
                                      `wastages.${fieldIndex}.reason`,
                                    )}
                                    type="text"
                                    placeholder="Reason"
                                    className="w-full rounded border border-stroke bg-transparent px-2 py-1 text-sm outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {(role === 'CATEROR' || restriction === 'EDIT') && (
                <div className="mt-6 flex justify-end gap-4">
                  {/* <button
                    type="button"
                    onClick={handleSaveAndDownload}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded bg-blue-100 px-5 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-200"
                  >
                    {isSubmitting
                      ? 'Saving...'
                      : `Save & Download ${selectedSubEventName} Wastage Report`}
                  </button> */}

                  <GenericButton
                    type="submit"
                    disabled={isSubmitting}
                    className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </GenericButton>
                </div>
              )}
            </form>
          </FormProvider>
        )}
      </div>
    );
  },
);

export default DishWastage;
