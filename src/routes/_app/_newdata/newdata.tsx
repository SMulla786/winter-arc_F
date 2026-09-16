import {createFileRoute} from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_newdata/newdata')({
  component: () => <div>Hello /_app/_newdata/newdata!</div>,
});
