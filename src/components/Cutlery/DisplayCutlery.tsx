/*eslint-disable*/
import React, {useState} from 'react';
import GenericTable, {Column} from '../Forms/Table/GenericTable';
import {useAuthContext} from '@/context/AuthContext';
import {
  useGetAllCutlery,
  useDeleteCutlery,
} from '@/lib/react-query/queriesAndMutations/cateror/cutlery';
import {confirmAlert} from 'react-confirm-alert';
import {Loader} from '../Loader/Loader';
import {X} from 'lucide-react';

const DisplayCutlery: React.FC = () => {
  const {user} = useAuthContext();
  const {data: response, isLoading, isError, error} = useGetAllCutlery();
  const {mutate: deleteCutlery} = useDeleteCutlery();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const restriction = user?.employeeRestriction?.cutlerypage;
  const role = user?.role;

  const data =
    response?.map((item: any) => ({
      id: item.id,
      CutleryName: item.name,
      Image: item.image,
      Price: item.price || '0',
    })) || [];

  const columns: Column<(typeof data)[0]>[] = [
    {header: 'Cutlery Name', accessor: 'CutleryName', sortable: true},
    {
      header: 'Image',
      accessor: 'Image',
      render: (item) => (
        <img
          src={item.Image}
          alt={item.CutleryName}
          className="h-12 w-12 cursor-pointer rounded object-cover transition-transform hover:scale-105"
          onClick={() => setSelectedImage(item.Image)}
        />
      ),
    },
    {header: 'Price', accessor: 'Price', sortable: true},
  ];

  const handleDelete = (item: any) => {
    confirmAlert({
      customUI: ({onClose}) => (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-black shadow-md dark:bg-meta-4 dark:text-white">
            <h2 className="mb-4 text-xl font-semibold">Confirm to delete</h2>
            <p className="mb-6">
              Are you sure you want to delete{' '}
              <strong>{item.CutleryName}</strong>?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={async () => {
                  await deleteCutlery(item.id);
                  onClose();
                }}
                className="rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={onClose}
                className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 rounded px-4 py-2 text-black transition dark:text-white"
              >
                No
              </button>
            </div>
          </div>
        </div>
      ),
    });
  };

  // Close modal when clicking outside the image
  const closeModal = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedImage(null);
    }
  };

  if (isLoading) return <Loader />;
  if (isError)
    return <div>Error: {error?.message || 'Failed to load data'}</div>;

  return (
    <>
      <GenericTable
        title="Cutlery"
        data={data}
        columns={columns}
        itemsPerPage={10}
        action={restriction === 'EDIT' || role === 'CATEROR'}
        onDelete={handleDelete}
      />

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closeModal}
        >
          {/* Close button */}
          <button
            className="absolute right-4 top-4 z-10 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition hover:bg-white/30"
            onClick={() => setSelectedImage(null)}
          >
            <X size={24} />
          </button>

          {/* Image container - Reduced size */}
          <div className="relative">
            <img
              src={selectedImage}
              alt="Enlarged cutlery"
              className="max-h-[60vh] max-w-[80vw] rounded-lg object-contain md:max-h-[50vh] md:max-w-[60vw]"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DisplayCutlery;
