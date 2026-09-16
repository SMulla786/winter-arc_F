/* eslint-disable */
import React, {useMemo} from 'react';
import GenericTable, {Column} from '@/components/Forms/Table/GenericTable';
import {RiWhatsappFill} from 'react-icons/ri';

const ManPowerVendorAfterEvent = ({costingData}: any) => {
  const manpower = costingData?.manpower || [];

  // -----------------------------
  // Transform incoming data
  // -----------------------------
  const tableData = useMemo(() => {
    return manpower.map((item: any) => {
      return {
        id: item.id,
        vendorName: item.manpowerVendor?.name || 'N/A',
        role: item.manpowerRole?.name || 'N/A',
        quantity: item.quantity,
        rate: item.rate,
        transport: item.transport,
        totalAmount: item.totalAmount,
        paidAmount: item.paidAmount,
        status: item.status,
        phone: item.manpowerVendor?.phone || 'N/A',
        address: item.manpowerVendor?.address || 'N/A',
      };
    });
  }, [manpower]);

  // -----------------------------
  // WhatsApp Message Builder
  // -----------------------------
  const buildWhatsAppMessage = (row: any) => {
    return `
Vendor: ${row.vendorName}
Role: ${row.role}
Quantity: ${row.quantity}
Rate: ₹${row.rate}
Transport: ₹${row.transport}
Total Amount: ₹${row.totalAmount}
Paid: ₹${row.paidAmount}
Status: ${row.status}
Phone: ${row.phone}
Address: ${row.address}
    `;
  };

  // -----------------------------
  // TABLE COLUMNS
  // -----------------------------
  const columns: Column<any>[] = [
    {header: 'Vendor Name', accessor: 'vendorName'},
    {header: 'Role', accessor: 'role'},
    {header: 'Quantity', accessor: 'quantity'},
    {header: 'Rate', accessor: 'rate'},
    {header: 'Transport', accessor: 'transport'},
    {header: 'Total Amount', accessor: 'totalAmount'},
    {header: 'Paid Amount', accessor: 'paidAmount'},

    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            row.status === 'UNPAID'
              ? 'bg-red-100 text-red-800'
              : row.status === 'PAID'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.status}
        </span>
      ),
    },

    {header: 'Phone', accessor: 'phone'},
    {header: 'Address', accessor: 'address'},

    {
      header: 'Share',
      accessor: 'share',
      render: (row) => (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://wa.me/${row.phone}?text=${encodeURIComponent(
            buildWhatsAppMessage(row),
          )}`}
          className="cursor-pointer text-green-500 transition-colors hover:text-green-600"
        >
          <RiWhatsappFill size={20} />
        </a>
      ),
    },
  ];

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="bg-transparent">
      <GenericTable
        title="Manpower Vendors"
        columns={columns}
        data={tableData}
      />
    </div>
  );
};

export default ManPowerVendorAfterEvent;
