/* eslint-disable */
import {useNavigate} from '@tanstack/react-router';
import {useEffect, useState} from 'react';
import toast from 'react-hot-toast';
import {useSendData} from '@/lib/react-query/queriesAndMutations/admin/copydata';
import GenericDropdown from '@/components/Forms/DropDown/GenericDropDown';
import {useForm, FormProvider} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {copyDataValidationSchema} from '@/lib/validation/dishSchemas';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useGetCaterors} from '@/lib/react-query/queriesAndMutations/admin/cateror';
import {useGetDishesAdmin} from '@/lib/react-query/queriesAndMutations/admin/dish';

type Dish = {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: string;
  languageId: string; // Add languageId to Dish type
};

type Dishes = {dishId: string; people: number}[];

type FormValues = z.infer<typeof copyDataValidationSchema>;

const CopyData: React.FC = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(copyDataValidationSchema),
  });

  const navigate = useNavigate();
  const {data: AllCateror} = useGetCaterors();
  const {mutate: SendDataFn} = useSendData();

  const [allDishes, setAllDishes] = useState<Dish[]>([]); // Store all dishes
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([]); // Store filtered dishes by language
  const [selectedDishes, setSelectedDishes] = useState<Dishes>([]);
  const [caterorOptions, setCaterorOptions] = useState<
    {label: string; value: string}[]
  >([]);
  const [languageId, setLanguageId] = useState<string>('');
  const [caterorId, setCaterorId] = useState<string>('');

  // Fetch all dishes initially
  const {data: DishNames, refetch: refetchDishes} = useGetDishesAdmin();

  // Store all dishes when they are fetched
  useEffect(() => {
    if (DishNames?.data) {
      const mappedDishes = DishNames.data.data.map((dish: any) => ({
        id: dish.id,
        name: dish.name,
        description: dish.description,
        category: dish.category.name,
        priority: dish.priority,
        languageId: dish.languageId, // Make sure this is included
      }));
      setAllDishes(mappedDishes);
    }
  }, [DishNames]);

  // Filter dishes when languageId changes
  useEffect(() => {
    if (languageId && allDishes.length > 0) {
      const filtered = allDishes.filter(
        (dish) => dish.languageId === languageId,
      );
      setFilteredDishes(filtered);
    } else {
      setFilteredDishes([]);
    }
  }, [languageId, allDishes]);

  // Set cateror options
  useEffect(() => {
    if (AllCateror?.data?.data) {
      const caterors = AllCateror.data.data.map(
        (cateror: {id: string; fullname: string}) => ({
          label: cateror.fullname,
          value: cateror.id,
        }),
      );
      setCaterorOptions(caterors);
    }
  }, [AllCateror]);

  const SendData = (data: FormValues) => {
    const caterorInfo = AllCateror?.data?.data?.find(
      (cateror: {id: string; languageId: string}) =>
        cateror.id === data.CaterorId,
    );

    if (caterorInfo) {
      console.log('caterorInfo', caterorInfo);
      setCaterorId(data.CaterorId);
      setLanguageId(caterorInfo.languageId);
      // Clear selected dishes when changing cateror
      setSelectedDishes([]);
    }
  };

  const sendDish = () => {
    if (selectedDishes.length === 0) {
      toast.error('Please select dishes');
      return;
    }
    const caterorInfo = AllCateror?.data?.data?.find(
      (cateror: {id: string; languageId: string}) => cateror.id === caterorId,
    );

    SendDataFn({
      caterorId: caterorInfo?.id || '',
      languageId: caterorInfo?.languageId || '',
      dishes: selectedDishes,
    });
  };

  const handleDishSelection = (checked: boolean, dishId: string) => {
    setSelectedDishes((prev) => {
      const updatedSelectedDishes = [...prev];
      const dishIndex = updatedSelectedDishes.findIndex(
        (selectedDish) => selectedDish.dishId === dishId,
      );
      if (dishIndex !== -1) {
        updatedSelectedDishes.splice(dishIndex, 1);
      } else if (checked) {
        updatedSelectedDishes.push({dishId, people: 100});
      }
      return updatedSelectedDishes;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDishes(
        filteredDishes.map((dish) => ({dishId: dish.id, people: 100})),
      );
    } else {
      setSelectedDishes([]);
    }
  };

  const isAllSelected =
    filteredDishes.length > 0 &&
    selectedDishes.length === filteredDishes.length;

  return (
    <>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(SendData)}
          className="space-y-8 bg-white p-8 dark:bg-boxdark"
        >
          <GenericDropdown
            options={caterorOptions}
            name="CaterorId"
            label="Select cateror"
          />
          <GenericButton type="submit">Get Cateror Dish</GenericButton>
        </form>
      </FormProvider>

      {/* Show language info when a cateror is selected */}
      {/* {languageId && (
        <div className="bg-white p-4 dark:bg-boxdark">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Showing dishes for language ID: <strong>{languageId}</strong>
            {caterorId &&
              ` (Cateror: ${caterorOptions.find((c) => c.value === caterorId)?.label})`}
          </p>
        </div>
      )} */}

      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <table className="mb-4 w-full table-auto border-collapse bg-transparent">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              {[
                'Dish Name',
                'Category',
                'Priority',
                'Description',
                // 'Language ID',
              ].map((column, index) => (
                <th
                  key={index}
                  className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white"
                >
                  {column}
                </th>
              ))}
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="selectAll"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-stroke focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-boxdark dark:focus:ring-meta-4"
                    disabled={filteredDishes.length === 0}
                  />
                  <label htmlFor="selectAll" className="ml-2">
                    Select All ({filteredDishes.length} dishes)
                  </label>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredDishes.length > 0 ? (
              filteredDishes.map((dish) => (
                <tr
                  key={dish.id}
                  className="border-b border-stroke hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                >
                  <td className="px-4 py-4 dark:text-white">{dish.name}</td>
                  <td className="px-4 py-4 dark:text-white">{dish.category}</td>
                  <td className="px-4 py-4 dark:text-white">{dish.priority}</td>
                  <td className="px-4 py-4 dark:text-white">
                    {dish.description}
                  </td>
                  {/* <td className="px-4 py-4 text-sm dark:text-white">
                    {dish.languageId}
                  </td> */}
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      id={dish.id}
                      checked={selectedDishes.some(
                        (selectedDish) => selectedDish.dishId === dish.id,
                      )}
                      onChange={(e) =>
                        handleDishSelection(e.target.checked, dish.id)
                      }
                      className="h-4 w-4 rounded border-stroke focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-boxdark dark:focus:ring-meta-4"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center dark:text-white"
                >
                  {languageId
                    ? `No dishes found for language ID: ${languageId}`
                    : 'Please select a cateror to see dishes'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filteredDishes.length > 0 && (
          <GenericButton onClick={sendDish} type="button">
            Add Selected Dishes ({selectedDishes.length})
          </GenericButton>
        )}
      </div>
    </>
  );
};

export default CopyData;
