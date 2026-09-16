import React from 'react';
import {Column} from '../../Forms/Table/GenericTable';
import {Outword, OutwordInventoryItem} from '../types';
import {formatIST} from '../helpers';
import {FiPrinter} from 'react-icons/fi';

export const createColumns = (
  filteredOutwords: Outword[],
  exportToPDF: (
    outwords: Outword[],
    fromDate: string | null,
    toDate: string | null,
  ) => void,
): Column<Outword>[] => [
  {
    header: 'Sr No.',
    accessor: 'id',
    render: (item) => {
      const index = filteredOutwords.findIndex((i) => i.id === item.id);
      return <div className="text-center font-medium">{index + 1}</div>;
    },
    className: 'text-center min-w-[70px]',
  },
  {
    header: 'Date',
    accessor: 'createdAt',
    render: (item) => (
      <div className="text-center">
        <span className="font-medium">{formatIST(item.createdAt)}</span>
      </div>
    ),
    sortable: true,
    className: 'text-center min-w-[100px]',
  },
  {
    header: 'Type',
    accessor: 'type',
    render: (item) => (
      <div className="text-center">
        <span className="text-black-800 inline-flex items-center justify-center rounded-full px-2.5 py-1 font-medium capitalize">
          {item.type.toLowerCase()}
        </span>
      </div>
    ),
    sortable: true,
    className: 'text-center min-w-[120px]',
  },
  {
    header: 'Event',
    accessor: (i: Outword) =>
      i.event
        ? `${i.event.name} (${formatIST(i.event.startDate, 'dd MMM yyyy')})`
        : '—',
    render: (i) => (
      <div className="text-center">
        <span className="font-medium">
          {i.event
            ? `${i.event.name} (${formatIST(i.event.startDate, 'dd MMM yyyy')})`
            : '—'}
        </span>
      </div>
    ),
    sortable: true,
    className: 'text-center min-w-[180px]',
  },
  {
    header: 'PO',
    accessor: (i: Outword) =>
      i.event ? '—' : i.poNumber ? `PO #${i.poNumber}` : '—',
    render: (i) => (
      <div className="text-center">
        <span className="font-medium">
          {i.event ? '—' : i.poNumber ? `PO #${i.poNumber}` : '—'}
        </span>
      </div>
    ),
    sortable: true,
    className: 'text-center min-w-[120px]',
  },
  {
    header: 'Items',
    accessor: (i: Outword) => i.inventoryItem.length,
    render: (i) => (
      <div className="flex justify-center">
        <span className="bg-gray-100 inline-flex items-center justify-center rounded-full px-2.5 py-1 font-medium">
          {i.inventoryItem.length}
        </span>
      </div>
    ),
    className: 'text-center min-w-[80px]',
  },
  {
    header: 'Actions',
    accessor: 'id',
    render: (i) => (
      <div className="flex justify-center gap-1">
        <button
          onClick={() => exportToPDF([i], null, null)}
          className="mx-1 rounded bg-primary px-6 py-1 text-white transition duration-300 ease-in-out hover:bg-primary/90"
        >
          Print
        </button>
      </div>
    ),
    className: 'text-center min-w-[80px]',
  },
];

export const itemColumns: Column<OutwordInventoryItem>[] = [
  {
    header: 'Category',
    accessor: (it) => it.material?.category?.name || '—',
    render: (it) => (
      <div className="text-center">
        <span className="font-medium">
          {it.material?.category?.name || '—'}
        </span>
      </div>
    ),
    className: 'text-center min-w-[120px]',
  },
  {
    header: 'Material Name',
    accessor: (it) => it.material?.name || '—',
    render: (it) => (
      <div className="text-center">
        <span className="font-medium">{it.material?.name || '—'}</span>
      </div>
    ),
    className: 'text-center min-w-[150px]',
  },
  {
    header: 'Quantity',
    accessor: 'quantity',
    render: (it) => (
      <div className="text-center">
        <span className="font-medium">{it.quantity}</span>
      </div>
    ),
    className: 'text-center min-w-[80px]',
  },
  {
    header: 'Unit',
    accessor: (it) => it.material?.unit || '—',
    render: (it) => (
      <div className="text-center">
        <span className="text-gray-600 text-sm">
          {it.material?.unit || '—'}
        </span>
      </div>
    ),
    className: 'text-center min-w-[80px]',
  },
  {
    header: 'Price',
    accessor: 'price',
    render: (it) => (
      <div className="text-center">
        <span>₹{it.price.toFixed(2)}</span>
      </div>
    ),
    className: 'text-center min-w-[100px]',
  },
  {
    header: 'Total',
    accessor: (it) => it.quantity * it.price,
    render: (it) => (
      <div className="text-center">
        <span className="font-semibold text-green-700">
          ₹{(it.quantity * it.price).toFixed(2)}
        </span>
      </div>
    ),
    className: 'text-center min-w-[100px]',
  },
  {
    header: 'Vendor',
    accessor: 'vendorName',
    render: (item) => (
      <div className="text-center">
        <span className="text-sm">{item.vendorName || '—'}</span>
      </div>
    ),
    className: 'text-center min-w-[120px]',
  },
  {
    header: 'Reason',
    accessor: 'reason',
    render: (item) => (
      <div className="text-center">
        <span className="text-gray-600 text-sm">{item.reason || '—'}</span>
      </div>
    ),
    className: 'text-center min-w-[150px]',
  },
];
