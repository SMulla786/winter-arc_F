import QrCodeGeneratorPage from '@/pages/QrCodeGenerator';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_event/qrgenerator/$id')({
  // validateSearch: qrSchema,
  component: QrCodeGeneratorPage,
});
