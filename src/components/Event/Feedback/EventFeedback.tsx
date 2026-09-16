import React, {useState} from 'react';
import {Route} from '@/routes/_app/_event/events.$id';
import {Star, QrCode, ExternalLink} from 'lucide-react';
import {useGetFeedback} from '@/lib/react-query/queriesAndMutations/cateror/feedback';

const EventFeedback: React.FC = () => {
  const {id: eventId} = Route.useParams();
  const {data: feedback} = useGetFeedback(eventId);
  const [activeTab, setActiveTab] = useState<string>('');

  if (!feedback || feedback.length === 0) {
    return (
      <div className="text-gray-500 p-4">No feedback found for this event</div>
    );
  }

  const subEvents = feedback[0]?.subEvents || [];

  // Set first subEvent as active tab by default if none selected
  if (activeTab === '' && subEvents.length > 0) {
    setActiveTab(subEvents[0].id);
  }

  // Calculate overall statistics
  const totalQRVisits = subEvents.reduce((sum, se) => sum + se.qrVisit, 0);
  const totalReviewsCount = subEvents.reduce(
    (sum, se) => sum + se.reviewsCount,
    0,
  );
  const totalGoogleVisits = subEvents.reduce(
    (sum, se) => sum + (se.googleVisit || 0),
    0,
  );
  const totalFeedbacks = subEvents.reduce(
    (sum, se) => sum + se.feedback.length,
    0,
  );

  // Get active subEvent
  const activeSubEvent = subEvents.find((se) => se.id === activeTab);

  return (
    <div className="p-2">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-800 text-lg font-bold">
          Event Feedback & Analytics
        </h2>
      </div>

      {/* Tabs Navigation */}
      <div className="border-gray-200 border-b">
        <div className="flex space-x-2 overflow-x-auto">
          {subEvents.map((subEvent) => {
            const isActive = activeTab === subEvent.id;
            const googleVisit = subEvent.reviewsCount || 0;

            return (
              <button
                key={subEvent.id}
                onClick={() => setActiveTab(subEvent.id)}
                className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:border-gray-300 hover:text-gray-700 border-transparent'
                }`}
              >
                {subEvent.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content */}
      {activeSubEvent && (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-transparent">
          <div className="p-2">
            {/* Detailed Statistics */}
            <div className="mb-2 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      QR Page Visits
                    </p>
                    <p className="mt-2 text-3xl font-bold text-blue-900">
                      {activeSubEvent.qrVisit}
                    </p>
                  </div>
                  <QrCode className="h-10 w-10 text-blue-400" />
                </div>
                <p className="mt-2 text-xs text-blue-600">
                  Unique scans of the event QR code
                </p>
              </div>

              <div className="rounded-lg bg-green-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Google Review Visits
                    </p>
                    <p className="mt-2 text-3xl font-bold text-green-900">
                      {activeSubEvent.reviewsCount || 0}
                    </p>
                  </div>
                  <ExternalLink className="h-10 w-10 text-green-400" />
                </div>
                <p className="mt-2 text-xs text-green-600">
                  Visits to Google review page
                </p>
              </div>
            </div>

            {/* Feedbacks List */}
            <div className="mt-2">
              <h4 className="text-gray-800 mb-2 text-lg font-semibold">
                Feedbacks
              </h4>
              {activeSubEvent.feedback.length > 0 ? (
                <div className="space-y-4">
                  {activeSubEvent.feedback.map((fb, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg border border-stroke p-4 dark:border-strokedark"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-5 w-5 ${
                                    star <= fb.rating
                                      ? 'fill-yellow-500 text-yellow-500'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-gray-800 ml-2 text-lg font-bold">
                              {fb.rating}/5
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {fb.feedback}
                      </p>
                      <p className="text-gray-500 mt-1 text-sm">
                        {new Intl.DateTimeFormat('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        }).format(new Date(fb.createdAt))}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border-gray-200 rounded-lg border py-8 text-center">
                  <Star className="text-gray-300 mx-auto mb-3 h-12 w-12" />
                  <p className="text-gray-500 font-medium">
                    No feedback submitted yet
                  </p>
                  <p className="text-gray-400 mt-1 text-sm">
                    Check back later for participant feedback
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {subEvents.length === 0 && (
        <div className="py-12 text-center">
          <Star className="text-gray-300 mx-auto mb-4 h-16 w-16" />
          <p className="text-gray-500 text-lg">
            No sub-events found for this event
          </p>
        </div>
      )}
    </div>
  );
};

export default EventFeedback;
