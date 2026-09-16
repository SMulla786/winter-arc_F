import ReceiptBill from '@/components/Event/ReceiptBill';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/receiptbill/$id')({
  component: ReceiptBill,
});
