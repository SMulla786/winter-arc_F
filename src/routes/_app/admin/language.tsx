import LanguageManagement from '@/pages/LanguageManagement';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/admin/language')({
  component: LanguageManagement,
});
