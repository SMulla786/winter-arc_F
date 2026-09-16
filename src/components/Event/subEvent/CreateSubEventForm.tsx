/* eslint-disable */
import React, {useEffect, useRef, useState} from 'react';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import toast from 'react-hot-toast';
import Select from '@/components/Select';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericDropdown from '@/components/Forms/DropDown/GenericDropDown';
import GenericTextArea from '@/components/Forms/TextArea/GenericTextArea';
import AddDishPopup from '@/components/Popup/AddDishPopup';
import AddOnServicePopup from '@/components/Popup/AddOnServicePopup';
import {useAuthContext} from '@/context/AuthContext';
import {
  useGetDishCategories,
  useGetDishes,
} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {
  useCreateSubevent,
  useGetSubevent,
} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {useGetAllPackage} from '@/lib/react-query/package/displaypackage';
import {useGetAddOnServices} from '@/lib/react-query/queriesAndMutations/cateror/addonservice';
import {CreateSubEventSchema} from '@/lib/validation/eventSchema';
import {zodResolver} from '@hookform/resolvers/zod';
import {BiPlus, BiSave} from 'react-icons/bi';
import {Loader} from 'lucide-react';
import {SubEventFormValues} from '../SubEvent';

/* ================= TYPES ================= */

type DishOption = {label: string; value: string};

type MainSubRow = {
  id: number;
  subCategory: string;
  count: number;
  cost: number;
  dishOptions: DishOption[];
  dishes: DishOption[];
};

type MainGroup = {
  id: number;
  mainCategory: string;
  subRows: MainSubRow[];
};

type ExtraDishRow = {
  id: number;
  categoryId: string;
  categoryName: string;
  count: number;
  Rate: number;
  dishOptions: DishOption[];
  dishes: DishOption[];
};

/* ================= COMPONENT ================= */

const CreateSubEventForm: React.FC<{eventId: string}> = ({eventId}) => {
  const methods = useForm<SubEventFormValues & {universalDish: string}>({
    resolver: zodResolver(CreateSubEventSchema),
    defaultValues: {
      subEventName: '',
      date: '',
      time: '',
      dishes: {},
      universalDish: '',
      note: '',
    },
  });

  const {control, handleSubmit, getValues, watch} = methods;

  const {user} = useAuthContext();
  const role = user?.role;
  const restriction = user?.employeeRestriction?.subEventPage;

  const {data: dishResponse} = useGetDishes();
  const {data: packageResponse} = useGetAllPackage();
  const {data: subEventResponse} = useGetSubevent(eventId);
  const {mutate: createSubevent, isPending} = useCreateSubevent();
  const {data: addonServices} = useGetAddOnServices(user?.id ?? '');

  const [dishTab, setDishTab] = useState<'selectDishes' | 'selectPackage'>(
    'selectPackage',
  );

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );

  const [mainDishes, setMainDishes] = useState<MainGroup[]>([]);
  const [extraDishes, setExtraDishes] = useState<ExtraDishRow[]>([]);

  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  /* ================= PACKAGE PARSING ================= */

  useEffect(() => {
    if (!selectedPackageId || !packageResponse?.data) {
      setMainDishes([]);
      setExtraDishes([]);
      return;
    }

    const pkg = packageResponse.data.find(
      (p: any) => p.id === selectedPackageId,
    );
    if (!pkg) return;

    /** MAIN GROUPS */
    const parsedMain: MainGroup[] = (pkg.groups || []).map((group: any) => ({
      id: Date.now() + Math.random(),
      mainCategory: group.group,
      subRows: (group.subGroups || []).map((sg: any) => ({
        id: Date.now() + Math.random(),
        subCategory: sg.name,
        count: sg.selectCount ?? 1,
        cost: sg.cost ?? 0,
        dishOptions: (sg.dishes || []).map((d: any) => ({
          label: d.name,
          value: d.id,
        })),
        dishes: [],
      })),
    }));

    /** EXTRA DISHES */
    const parsedExtra: ExtraDishRow[] = (pkg.extraDishes || []).map(
      (ex: any) => ({
        id: Date.now() + Math.random(),
        categoryId: ex.categoryId,
        categoryName: ex.categoryName,
        count: ex.selectCount ?? 1,
        Rate: ex.dishes?.[0]?.cost ?? 0,
        dishOptions: (ex.dishes || []).map((d: any) => ({
          label: d.name,
          value: d.id,
        })),
        dishes: [],
      }),
    );

    setMainDishes(parsedMain);
    setExtraDishes(parsedExtra);
  }, [selectedPackageId, packageResponse?.data]);

  /* ================= HANDLERS ================= */

  const handleMainDishChange = (
    groupIndex: number,
    subIndex: number,
    selected: DishOption[] | null,
  ) => {
    const rows = [...mainDishes];
    rows[groupIndex].subRows[subIndex].dishes = selected ?? [];
    setMainDishes(rows);
  };

  const handleExtraDishChange = (
    index: number,
    selected: DishOption[] | null,
  ) => {
    const rows = [...extraDishes];
    rows[index].dishes = selected ?? [];
    setExtraDishes(rows);
  };

  /* ================= SUBMIT ================= */

  const onSubmit = (data: SubEventFormValues) => {
    const exists = subEventResponse?.data?.subEvents?.some(
      (se: any) => se.name === data.subEventName,
    );
    if (exists) {
      toast.error('Sub Event name already exists');
      return;
    }

    const allDishIds =
      dishTab === 'selectPackage'
        ? [
            ...mainDishes.flatMap((g) =>
              g.subRows.flatMap((s) => s.dishes.map((d) => d.value)),
            ),
            ...extraDishes.flatMap((e) => e.dishes.map((d) => d.value)),
          ]
        : [];

    const payload = {
      name: data.subEventName,
      address: data.subEventAddress || '',
      eventId,
      date: data.date,
      time: data.time,
      expectedPeople: data.expectedPeople,
      dishes: Array.from(new Set(allDishIds)).map((id) => ({dishId: id})),
      packageId: dishTab === 'selectPackage' ? selectedPackageId : undefined,
      note: data.note,
      addon: data.addon || [],
    };

    createSubevent(payload);
  };

  if (isPending || !dishResponse?.data?.dishes) return <Loader />;

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      {(role === 'CATEROR' || restriction === 'EDIT') && (
        <div className="rounded-md bg-white p-6 dark:bg-black">
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setDishTab('selectDishes')}
              className={`rounded px-4 py-2 ${
                dishTab === 'selectDishes'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200'
              }`}
            >
              Select Dishes
            </button>
            <button
              onClick={() => setDishTab('selectPackage')}
              className={`rounded px-4 py-2 ${
                dishTab === 'selectPackage'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200'
              }`}
            >
              Select Package
            </button>
          </div>

          {dishTab === 'selectPackage' && (
            <>
              <Select
                options={
                  packageResponse?.data?.map((p: any) => ({
                    label: p.name,
                    value: p.id,
                  })) || []
                }
                value={
                  selectedPackageId
                    ? {
                        label: packageResponse?.data?.find(
                          (p: any) => p.id === selectedPackageId,
                        )?.name,
                        value: selectedPackageId,
                      }
                    : null
                }
                onChange={(opt) => setSelectedPackageId(opt?.value ?? null)}
                placeholder="Select Package"
              />

              {mainDishes.map((group, gi) => (
                <div key={group.id} className="mt-6">
                  <h3 className="font-semibold">{group.mainCategory}</h3>
                  {group.subRows.map((sub, si) => (
                    <div key={sub.id} className="mt-3">
                      <label className="text-sm">
                        {sub.subCategory} (Select {sub.count})
                      </label>
                      <Select
                        isMulti
                        options={sub.dishOptions}
                        value={sub.dishes}
                        onChange={(s) =>
                          handleMainDishChange(gi, si, s as DishOption[])
                        }
                      />
                    </div>
                  ))}
                </div>
              ))}

              {extraDishes.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold">Extra Dishes</h3>
                  {extraDishes.map((ex, i) => (
                    <div key={ex.id} className="mt-3">
                      <label className="text-sm">
                        {ex.categoryName} (Select {ex.count})
                      </label>
                      <Select
                        isMulti
                        options={ex.dishOptions}
                        value={ex.dishes}
                        onChange={(s) =>
                          handleExtraDishChange(i, s as DishOption[])
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <button
            onClick={handleSubmit(onSubmit)}
            className="mt-6 flex w-full items-center justify-center rounded bg-green-600 py-3 text-white"
          >
            <BiSave className="mr-2" /> Submit
          </button>
        </div>
      )}
    </FormProvider>
  );
};

export default CreateSubEventForm;
