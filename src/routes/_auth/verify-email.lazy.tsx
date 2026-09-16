import EmailVerificationPage from '@/pages/EmailVerificationPage';
import {createLazyFileRoute} from '@tanstack/react-router';

export const Route = createLazyFileRoute('/_auth/verify-email')({
  component: EmailVerificationPage,
});
