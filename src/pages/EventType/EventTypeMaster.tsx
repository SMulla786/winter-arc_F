import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigate} from '@tanstack/react-router';
import React, {useEffect, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {z} from 'zod';

import GenericButton from '@/components/Forms/Buttons/GenericButton';
import GenericInputField from '@/components/Forms/Input/GenericInputField';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {useAuthContext} from '@/context/AuthContext';
import {eventTypeSchema} from '@/lib/validation/managerpostSchema';
import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {Loader} from 'lucide-react';
import toast from 'react-hot-toast';

// Define type for manager post items
interface eventTypesData {
  id: string;
  name: string;
}

type FormValues = z.infer<typeof eventTypeSchema>;

const EventTypeMaster = () => {
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState<string | null>(null);

  const methods = useForm<FormValues>({
    resolver: zodResolver(eventTypeSchema),
    defaultValues: {
      name: '',
    },
  });

  const {reset, setValue} = methods;

  const useCreateEventType = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({name}: {name: string}) => {
        const response = api.post('/cateror/eventTypes', {name});
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['eventType'],
        });
        toast.success('EventType created successfully');
        resetForm();
      },
      onError: (error) => toast.error('Failed to create EventType'),
    });
  };

  const useUpdateEventType = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({id, name}: {id: string; name: string}) => {
        const response = api.put(`/cateror/eventTypes/${id}`, {name});
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['eventType'],
        });
        toast.success('EventType updated successfully');
        resetForm();
      },
      onError: (error) => toast.error('Failed to update EventType'),
    });
  };

  const useGetEventType = () => {
    return useQuery({
      queryKey: ['eventType'],
      queryFn: () => api.get('/cateror/eventTypes').then((res) => res.data),
    });
  };

  const useDeleteEventType = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => api.delete(`/cateror/eventTypes/${id}`),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['eventType'],
        });
        toast.success('EventType deleted successfully');
      },
      onError: (error) => toast.error('Failed to delete EventType'),
    });
  };

  const {mutate: createEventType} = useCreateEventType();
  const {mutate: updateEventType} = useUpdateEventType();
  const {data: eventTypeData, isLoading, error} = useGetEventType();
  const {mutate: deleteEventType} = useDeleteEventType();
  const {user} = useAuthContext();

  const restriction = user?.employeeRestriction?.dresscodepage;
  const role = user?.role;

  // Reset form function
  const resetForm = () => {
    reset({name: ''});
    setEditingId(null);
  };

  const onSubmit = (data: FormValues) => {
    if (editingId) {
      // Update existing event type
      updateEventType({id: editingId, name: data.name});
    } else {
      // Create new event type
      createEventType({name: data.name});
    }
  };

  // Handle edit - refill form with selected item data
  const handleEdit = (item: eventTypesData) => {
    setEditingId(item.id);
    setValue('name', item.name);
    // Scroll to form
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  // Handle delete
  const handleDelete = (item: eventTypesData) => {
    deleteEventType(item.id);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    resetForm();
  };

  // ✅ Extract the array safely from response
  const tableData: eventTypesData[] = React.useMemo(() => {
    if (!eventTypeData) return [];
    if (Array.isArray(eventTypeData)) return eventTypeData;
    if (Array.isArray(eventTypeData.data)) return eventTypeData.data;
    return [];
  }, [eventTypeData]);

  // Table columns — only name
  const columns: Column<eventTypesData>[] = [
    {header: 'Name', accessor: 'name'},
  ];

  if (!user) {
    return <Loader />;
  }

  return (
    <>
      {(role === 'CATEROR' || restriction === 'EDIT') && (
        <div className="bg-white p-8 dark:bg-black">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <div className="mb-4">
                <h1 className="text-2xl font-bold">
                  {editingId ? 'Edit Event Type' : 'Event Type Master'}
                </h1>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <GenericInputField
                  name="name"
                  label="Type Name"
                  placeholder="Enter Type Name Here"
                />
              </div>
              <div className="flex justify-end gap-4">
                {editingId && (
                  <GenericButton
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="mt-4"
                  >
                    Cancel
                  </GenericButton>
                )}
                <GenericButton type="submit" className="mt-4">
                  {editingId ? 'Update' : 'Submit'}
                </GenericButton>
              </div>
            </form>
          </FormProvider>
        </div>
      )}

      {/* Display loading state */}
      {isLoading && <div className="mt-8 text-center">Loading data...</div>}

      {/* Display error state */}
      {error && (
        <div className="mt-8 text-center text-red-500">
          Error loading data: {error.message}
        </div>
      )}

      {/* Display table */}
      {!isLoading && !error && (
        <div className="mt-8 overflow-x-auto">
          <GenericTable
            data={tableData}
            columns={columns}
            action={restriction === 'EDIT' || role === 'CATEROR'}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}
    </>
  );
};

export default EventTypeMaster;
