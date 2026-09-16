import NewExternalSubEventForm from '@/components/Event/NewExternalSubEventForm';
import {createFileRoute} from '@tanstack/react-router';
import {useGetExternalSubeventById} from '@/lib/api/externalForm';
import DynamicLoader from '@/components/LoaderComponentExternalForm/DynamicLoader';

export const Route = createFileRoute(
  '/_externalform/subeventexternal/$id/$caterorid',
)({
  component: NewExternal,
});

function NewExternal() {
  const {id: subEventId} = Route.useParams();
  const {data: subEventResponse, isLoading} =
    useGetExternalSubeventById(subEventId);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <DynamicLoader />
      </div>
    );
  }
  if (subEventResponse?.subEvent?.isEnabled) {
    return <NewExternalSubEventForm />;
  }

  return (
    <div className="bg-gray-50 flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-blue-100 p-3">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-gray-800 mt-4 text-xl font-semibold">
            Thank you for submitting the form
          </h1>
          <p className="text-gray-600 mt-2 text-center">
            You’ve already submitted this form, so you no longer have access to
            this page. If you need access again, please contact your
            administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
