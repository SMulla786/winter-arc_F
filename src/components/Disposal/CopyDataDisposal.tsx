import {useEffect, useState} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import toast from 'react-hot-toast';
import GenericDropdown from '@/components/Forms/DropDown/GenericDropDown';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useGetCaterors} from '@/lib/react-query/queriesAndMutations/admin/cateror';
import {
  useGetDisposal,
  useSendDisposalData,
} from '@/lib/react-query/queriesAndMutations/admin/disposal';
import {useGetLanguages} from '@/lib/react-query/queriesAndMutations/admin/languages';

const copyDataValidationSchema = z.object({
  CaterorId: z.string().min(1, 'Cateror is required'),
  LanguageId: z.string().min(1, 'Language is required'),
});

type FormValues = z.infer<typeof copyDataValidationSchema>;
type Disposal = {
  id: string;
  name: string;
  category?: {id: string; name: string};
  languageId?: string;
};
type SelectedDisposals = {disposalId: string}[];

const CopyDataDisposal: React.FC = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(copyDataValidationSchema),
  });

  const {data: AllCaterors} = useGetCaterors();
  const {data: languages} = useGetLanguages();
  const {mutate: sendDisposalData} = useSendDisposalData();

  const [caterorOptions, setCaterorOptions] = useState<
    {label: string; value: string}[]
  >([]);
  const [languageOptions, setLanguageOptions] = useState<
    {label: string; value: string}[]
  >([]);
  const [caterorId, setCaterorId] = useState('');
  const [languageId, setLanguageId] = useState('');
  const [disposals, setDisposals] = useState<Disposal[]>([]);
  const [selectedDisposals, setSelectedDisposals] = useState<SelectedDisposals>(
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

  // Get all disposals (without language filter initially)
  const {data: disposalsApiData, refetch: refetchDisposals} = useGetDisposal();

  // Handle cateror selection and filter disposals
  const handleCaterorSelect = (data: FormValues) => {
    const cateror = AllCaterors?.data?.data?.find(
      (c) => c.id === data.CaterorId,
    );
    if (!cateror) return toast.error('Cateror not found');

    const selectedLanguageId = data.LanguageId;
    if (!selectedLanguageId) return toast.error('Please select a language');

    setCaterorId(cateror.id);
    setLanguageId(selectedLanguageId);

    // Filter disposals by selected language
    if (disposalsApiData?.data?.data) {
      const filteredDisposals = disposalsApiData.data.data.filter(
        (d) => d.languageId === selectedLanguageId,
      );

      const validDisposals = filteredDisposals.filter(
        (d) => d.name && d.category?.id,
      );

      setDisposals(validDisposals);
      setSelectedDisposals([]);

      console.log(
        'Filtered disposals for language',
        selectedLanguageId,
        ':',
        validDisposals,
      );
    } else {
      toast.error('No disposals data available');
    }
  };

  // Handle language selection change
  const handleLanguageChange = (
    option: {label: string; value: string} | null,
  ) => {
    const selectedLanguageId = option?.value || '';
    methods.setValue('LanguageId', selectedLanguageId);
  };

  // Handle disposal selection
  const handleDisposalSelection = (checked: boolean, disposalId: string) => {
    const disposal = disposals.find((d) => d.id === disposalId);
    if (!disposal) return;

    setSelectedDisposals((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((d) => d.disposalId === disposalId);
      if (index !== -1) updated.splice(index, 1);
      else if (checked) updated.push({disposalId});
      return updated;
    });
  };

  // Select/Deselect all
  const handleSelectAll = (checked: boolean) => {
    if (checked)
      setSelectedDisposals(disposals.map((d) => ({disposalId: d.id})));
    else setSelectedDisposals([]);
  };

  const isAllSelected =
    disposals.length > 0 && selectedDisposals.length === disposals.length;

  // Send selected disposals
  const handleSendDisposals = () => {
    if (!caterorId) return toast.error('Select a Cateror first');
    if (!languageId) return toast.error('Select a Language first');
    if (selectedDisposals.length === 0)
      return toast.error('Select at least one disposal');

    const payload = {
      caterorId,
      languageId,
      disposals: selectedDisposals.map((d) => ({disposalId: d.disposalId})),
    };

    console.log('Final Payload:', payload);
    sendDisposalData(payload);
    toast.success('Disposals added successfully');
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

          <GenericButton type="submit">Get Cateror Disposals</GenericButton>
        </form>
      </FormProvider>

      {languageId && disposals.length > 0 && (
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Disposals for {getSelectedLanguageName()}
            </h3>
            <span className="text-gray-500 text-sm">
              {disposals.length} disposals found
            </span>
          </div>

          <table className="w-full table-auto border-collapse bg-transparent">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                {['Disposal Name', 'Category'].map((col, idx) => (
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
              {disposals.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-stroke hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                >
                  <td className="px-4 py-4 dark:text-white">{d.name}</td>
                  <td className="px-4 py-4 dark:text-white">
                    {d.category?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedDisposals.some(
                        (s) => s.disposalId === d.id,
                      )}
                      onChange={(e) =>
                        handleDisposalSelection(e.target.checked, d.id)
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
              {selectedDisposals.length} disposals selected
            </span>
            <GenericButton onClick={handleSendDisposals} type="button">
              Add Selected Disposals
            </GenericButton>
          </div>
        </div>
      )}

      {languageId && disposals.length === 0 && (
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No disposals found for {getSelectedLanguageName()}.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default CopyDataDisposal;
