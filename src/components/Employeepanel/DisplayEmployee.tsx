/*eslint-disable*/
import React, {useState} from 'react';
import GenericTable, {Column} from '../Forms/Table/GenericTable';
import {
  useDeleteEmployee,
  useGetAllEmployee,
} from '@/lib/react-query/queriesAndMutations/cateror/Employee/employee';
import {useNavigate} from '@tanstack/react-router';
import {useAuthContext} from '@/context/AuthContext';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';

export interface User {
  email: string;
  fullname: string;
  phoneNumber: string;
  isCounter: boolean;
}

const DisplayEmployee = () => {
  const navigate = useNavigate();
  const {user} = useAuthContext();

  const {data: caterorData} = useGetCaterorById(user?.caterorId!);
  const data = [{name: '', email: '', phoneNo: ''}];
  console.log('userrytery', caterorData);

  const {data: empData} = useGetAllEmployee();

  const {mutateAsync: deleteEmp} = useDeleteEmployee();

  const handleDelete = (id: string) => {
    deleteEmp(id);
  };

  const handleEdit = (id: string) => {
    navigate({to: `/updateemployeee/${id}`});
  };

  console.log('emp data', empData);
  const header: Column<any>[] = [
    {
      header: 'Full Name',
      accessor: 'fullname',
      sortable: true,
    },
    {
      header: 'Email',
      accessor: 'email',
      sortable: true,
    },
    {
      header: 'Phone No',
      accessor: 'phoneNumber',
      sortable: true,
    },
    {
      header: 'Is Counter',
      accessor: 'isCounter',
      sortable: true,
    },
  ];

  return (
    <div>
      {(() => {
        const plan = caterorData?.data?.plan?.toLowerCase();
        const extra = caterorData?.data?.extraUsers || 0;

        let baseLimit = 0;
        if (plan === 'pro') baseLimit = 1;
        else if (plan === 'premium') baseLimit = 3;
        else if (plan === 'ultrapremium') baseLimit = 5;

        const totalAllowed = baseLimit + extra;
        const current = empData?.data?.length || 0;

        if (current < totalAllowed) {
          return (
            <div className="mb-2 mt-2 inline-block rounded-lg border border-green-300 px-4 py-2 font-semibold text-green-700 shadow-md">
              ✅ {totalAllowed - current} employee
              {totalAllowed - current > 1 ? 's' : ''} left
            </div>
          );
        } else {
          return (
            <div className="mb-2 mt-2 inline-block rounded-lg border border-red-300 px-4 py-2 font-semibold text-red-700 shadow-md">
              ❌ {totalAllowed - current} employee left
            </div>
          );
        }
      })()}

      <GenericTable
        title="Employee List"
        data={empData?.data || []}
        columns={header}
        itemsPerPage={15}
        action
        onDelete={(row) => handleDelete(row.id)}
        onEdit={(row) => handleEdit(row.id)}
      />
    </div>
  );
};

export default DisplayEmployee;
