import {useEffect, useState} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import toast from 'react-hot-toast';
import GenericDropdown from '@/components/Forms/DropDown/GenericDropDown';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useGetCaterors} from '@/lib/react-query/queriesAndMutations/admin/cateror';
import {
  useGetUtensils,
  useSendUtensilData,
} from '@/lib/react-query/queriesAndMutations/admin/utensils';
import {useGetLanguages} from '@/lib/react-query/queriesAndMutations/admin/languages';

const copyDataValidationSchema = z.object({
  CaterorId: z.string().min(1, 'Cateror is required'),
  LanguageId: z.string().min(1, 'Language is required'),
});

type FormValues = z.infer<typeof copyDataValidationSchema>;
type Utensil = {
  id: string;
  name: string;
  category?: {id: string; name: string};
  languageId?: string;
};
type SelectedUtensils = {utensilId: string}[];

const CopyDataUtensils: React.FC = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(copyDataValidationSchema),
  });

  const {data: AllCaterors} = useGetCaterors();
  console.log('====================================');
  console.log();
  console.log('====================================');
  const {data: languages} = useGetLanguages();
  console.log('language', languages);
  const {mutate: sendUtensilData} = useSendUtensilData();

  const [caterorOptions, setCaterorOptions] = useState<
    {label: string; value: string}[]
  >([]);
  const [languageOptions, setLanguageOptions] = useState<
    {label: string; value: string}[]
  >([]);
  const [caterorId, setCaterorId] = useState('');
  const [languageId, setLanguageId] = useState('');
  const [utensils, setUtensils] = useState<Utensil[]>([]);
  const [selectedUtensils, setSelectedUtensils] = useState<SelectedUtensils>(
    [],
  );

  // Load cateror options
  useEffect(() => {
    if (AllCaterors?.data?.data) {
      setCaterorOptions(
        AllCaterors.data.data.map((c) => ({label: c.fullname, value: c.id})),
      );
    }
  }, [AllCaterors]);

  // Load language options
  useEffect(() => {
    if (languages) {
      setLanguageOptions(
        languages.map((l) => ({
          label: l.name,
          value: l.id,
        })),
      );
    }
  }, [languages]);

  // Get all utensils (without language filter initially)
  const {data: utensilsApiData, refetch: refetchUtensils} = useGetUtensils();

  console.log('utensilsApiData', utensilsApiData);

  // Handle cateror selection and filter utensils
  const handleCaterorSelect = (data: FormValues) => {
    const cateror = AllCaterors?.data?.data?.find(
      (c) => c.id === data.CaterorId,
    );
    if (!cateror) return toast.error('Cateror not found');

    const selectedLanguageId = data.LanguageId;
    if (!selectedLanguageId) return toast.error('Please select a language');

    setCaterorId(cateror.id);
    setLanguageId(selectedLanguageId);

    // Filter utensils by selected language
    if (utensilsApiData?.data?.data) {
      const filteredUtensils = utensilsApiData.data.data.filter(
        (u) => u.languageId === selectedLanguageId,
      );

      const validUtensils = filteredUtensils.filter(
        (u) => u.name && u.category?.id,
      );

      setUtensils(validUtensils);
      setSelectedUtensils([]);

      console.log(
        'Filtered utensils for language',
        selectedLanguageId,
        ':',
        validUtensils,
      );
    } else {
      toast.error('No utensils data available');
    }
  };

  // Handle language selection change
  const handleLanguageChange = (
    option: {label: string; value: string} | null,
  ) => {
    const selectedLanguageId = option?.value || '';
    methods.setValue('LanguageId', selectedLanguageId);
  };

  // Handle utensil selection
  const handleUtensilSelection = (checked: boolean, utensilId: string) => {
    const utensil = utensils.find((u) => u.id === utensilId);
    if (!utensil) return;

    setSelectedUtensils((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((u) => u.utensilId === utensilId);
      if (index !== -1) updated.splice(index, 1);
      else if (checked) updated.push({utensilId});
      return updated;
    });
  };

  // Select/Deselect all
  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedUtensils(utensils.map((u) => ({utensilId: u.id})));
    else setSelectedUtensils([]);
  };

  const isAllSelected =
    utensils.length > 0 && selectedUtensils.length === utensils.length;

  // Send selected utensils
  const handleSendUtensils = () => {
    if (!caterorId) return toast.error('Select a Cateror first');
    if (!languageId) return toast.error('Select a Language first');
    if (selectedUtensils.length === 0)
      return toast.error('Select at least one utensil');

    const payload = {
      caterorId,
      languageId,
      utensils: selectedUtensils.map((u) => ({utensilId: u.utensilId})),
    };

    console.log('Final Payload:', payload);
    sendUtensilData(payload);
    toast.success('Utensils added successfully');
  };

  // Get selected language name
  const getSelectedLanguageName = () => {
    return (
      languageOptions.find((l) => l.value === languageId)?.label ||
      'Selected Language'
    );
  };

  return (
    <>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(handleCaterorSelect)}
          className="space-y-8 bg-white p-8 dark:bg-boxdark"
        >
          <GenericDropdown
            options={caterorOptions}
            name="CaterorId"
            label="Select Cateror"
            control={methods.control}
          />
          <GenericDropdown
            options={languageOptions}
            name="LanguageId"
            label="Select Language"
            onChange={handleLanguageChange}
            control={methods.control}
          />

          <GenericButton type="submit">Get Cateror Utensils</GenericButton>
        </form>
      </FormProvider>

      {languageId && utensils.length > 0 && (
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Utensils for {getSelectedLanguageName()}
            </h3>
            <span className="text-gray-500 text-sm">
              {utensils.length} utensils found
            </span>
          </div>

          <table className="w-full table-auto border-collapse bg-transparent">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                {['Utensil Name', 'Category'].map((col, idx) => (
                  <th
                    key={idx}
                    className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white"
                  >
                    {col}
                  </th>
                ))}
                <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 rounded border-stroke"
                    />
                    <label className="ml-2">Select All</label>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {utensils.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-stroke hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                >
                  <td className="px-4 py-4 dark:text-white">{u.name}</td>
                  <td className="px-4 py-4 dark:text-white">
                    {u.category?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUtensils.some(
                        (s) => s.utensilId === u.id,
                      )}
                      onChange={(e) =>
                        handleUtensilSelection(e.target.checked, u.id)
                      }
                      className="h-4 w-4 rounded border-stroke"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-gray-500 text-sm">
              {selectedUtensils.length} utensils selected
            </span>
            <GenericButton onClick={handleSendUtensils} type="button">
              Add Selected Utensils
            </GenericButton>
          </div>
        </div>
      )}

      {languageId && utensils.length === 0 && (
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No utensils found for {getSelectedLanguageName()}.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default CopyDataUtensils;
