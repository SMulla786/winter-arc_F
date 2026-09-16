import LinkSentedNotifierPage from '@/pages/LinkSentedNotifierPage';
import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/verification-mail-notifier')({
  component: LinkSentedNotifierPage,
});
