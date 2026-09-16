// import React from 'react';
// import {FormProvider, useForm} from 'react-hook-form';
// import {zodResolver} from '@hookform/resolvers/zod';
// import {z} from 'zod';
// import {useNavigate} from '@tanstack/react-router';

// import GenericInputField from '../Forms/Input/GenericInputField';
// import GenericButton from '../Forms/Buttons/GenericButton';
// import GenericTable, {Column} from '../Forms/Table/GenericTable';

// import {
//   useCreateManagerPost,
//   useDeleteManagerPost,
//   useGetManagerPost,
//   useUpdateManagerPost,
// } from '@/lib/react-query/queriesAndMutations/cateror/managerpost';
// import {managerpostSchema} from '@/lib/validation/managerpostSchema';
// import {
//   useDeleteCRM,
//   useUpdateCRM,
// } from '@/lib/react-query/queriesAndMutations/cateror/CRM/crm';
// import AssignManger from './Assignmanager/AssignManger';

// // Define type for manager post items
// interface ManagerPostData {
//   id: string;
//   name: string;
// }

// type FormValues = z.infer<typeof managerpostSchema>;

// const CreateManager = () => {
//   const navigate = useNavigate();

//   const methods = useForm<FormValues>({
//     resolver: zodResolver(managerpostSchema),
//   });

//   const {mutate: addCaterorCRM} = useCreateManagerPost();
//   const {data: managerPost, isLoading, error} = useGetManagerPost();
//   const {mutate: deleteCRM} = useDeleteManagerPost();
//   const {mutate: updateCRM} = useUpdateManagerPost();

//   const onSubmit = (data: FormValues) => {
//     addCaterorCRM({name: data.name});
//     methods.reset();
//   };

//   // ✅ Extract the array safely from response
//   const tableData: ManagerPostData[] = React.useMemo(() => {
//     if (!managerPost) return [];
//     if (Array.isArray(managerPost)) return managerPost;
//     if (Array.isArray(managerPost.data)) return managerPost.data;
//     return [];
//   }, [managerPost]);

//   // Table columns — only name
//   const columns: Column<ManagerPostData>[] = [
//     {header: 'Name', accessor: 'name'},
//   ];

//   const handleDelete = (item: ManagerPostData) => {
//     deleteCRM(item.id);
//   };

//   const handleEdit = (item: ManagerPostData) => {
//     navigate({to: `/updatemanager/${item.id}`});
//   };

//   return (
//     <>
//       <div className="bg-white p-8 dark:bg-black">
//         <FormProvider {...methods}>
//           <form onSubmit={methods.handleSubmit(onSubmit)}>
//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
//               <GenericInputField name="name" label="Name" />
//             </div>
//             <div className="flex justify-end">
//               <GenericButton type="submit" className="mt-4 items-end">
//                 Submit
//               </GenericButton>
//             </div>
//           </form>
//         </FormProvider>
//       </div>

//       {/* Display loading state */}
//       {isLoading && <div className="mt-8 text-center">Loading data...</div>}

//       {/* Display error state */}
//       {error && (
//         <div className="mt-8 text-center text-red-500">
//           Error loading data: {error.message}
//         </div>
//       )}

//       {/* Display table */}
//       {!isLoading && !error && (
//         <div className="mt-8 overflow-x-auto">
//           <GenericTable
//             data={tableData}
//             columns={columns}
//             action
//             onDelete={handleDelete}
//             onEdit={handleEdit}
//           />
//         </div>
//       )}
//     </>
//   );
// };

// export default CreateManager;

import React, {useEffect, useRef} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useNavigate} from '@tanstack/react-router';

import GenericInputField from '../Forms/Input/GenericInputField';
import GenericButton from '../Forms/Buttons/GenericButton';
import GenericTable, {Column} from '../Forms/Table/GenericTable';

import {
  useCreateDressCode,
  useDeleteDressCode,
  useGetDressCode,
  useUpdateDressCode,
} from '@/lib/react-query/queriesAndMutations/cateror/managerpost';
import {managerpostSchema} from '@/lib/validation/managerpostSchema';
import {useAuthContext} from '@/context/AuthContext';
import {Loader} from '../Loader/Loader';

// Define type for manager post items
interface ManagerPostData {
  id: string;
  name: string;
}

type FormValues = z.infer<typeof managerpostSchema>;

const CreateDressCode = () => {
  const navigate = useNavigate();

  const methods = useForm<FormValues>({
    resolver: zodResolver(managerpostSchema),
  });

  const {mutate: addCaterorCRM, isSuccess} = useCreateDressCode();
  const {data: managerPost, isLoading, error} = useGetDressCode();
  const {mutate: deleteCRM} = useDeleteDressCode();
  const {mutate: updateCRM} = useUpdateDressCode();
  const {user} = useAuthContext();
  console.log('USER OBJECT 👉', user);

  const restriction = user?.employeeRestriction?.dresscodepage;
  const role = user?.role;
  console.log('employeeRestriction', user?.employeeRestriction);
  console.log('dresscode restriction', restriction);

  const onSubmit = (data: FormValues) => {
    addCaterorCRM({name: data.name});
    methods.reset();
  };

  // ✅ Extract the array safely from response
  const tableData: ManagerPostData[] = React.useMemo(() => {
    if (!managerPost) return [];
    if (Array.isArray(managerPost)) return managerPost;
    if (Array.isArray(managerPost.data)) return managerPost.data;
    return [];
  }, [managerPost]);

  // Table columns — only name
  const columns: Column<ManagerPostData>[] = [
    {header: 'Name', accessor: 'name'},
  ];

  if (!user) {
    return <Loader />;
  }

  const handleDelete = (item: ManagerPostData) => {
    deleteCRM(item.id);
  };

  const handleEdit = (item: ManagerPostData) => {
    navigate({to: `/updatemanager/${item.id}`, state: {name: item.name}});
  };

  return (
    <>
      {(role === 'CATEROR' || restriction === 'EDIT') && (
        <div className="bg-white p-8 dark:bg-black">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <div className="mb-4">
                <h1 className="text-2xl font-bold">Create Dress Code</h1>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <GenericInputField name="name" label="Name" />
              </div>
              <div className="flex justify-end">
                <GenericButton type="submit" className="mt-4 items-end">
                  Submit
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
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </div>
      )}
    </>
  );
};

export default CreateDressCode;
