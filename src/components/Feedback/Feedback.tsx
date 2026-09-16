/* eslint-disable */
import {useAuthContext} from '@/context/AuthContext';
import {
  usePostFeedback,
  useUpdateGooglePageCount,
} from '@/lib/react-query/queriesAndMutations/cateror/feedback';
import {Route} from '@/routes/_external/qr.$id';
import {zodResolver} from '@hookform/resolvers/zod';
import React, {useEffect, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {z} from 'zod';
import {motion, AnimatePresence} from 'framer-motion';
import {IoStar, IoStarHalfOutline} from 'react-icons/io5';

const feedbackSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  phoneNumber: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z
      .string()
      .regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits')
      .optional(),
  ),
  email: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().email('Invalid email address').optional(),
  ),
  feedback: z.string().min(1, 'Feedback is required'),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const Feedback: React.FC = () => {
  const methods = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
  });

  const {
    register,
    handleSubmit,
    formState: {errors},
  } = methods;

  const {user} = useAuthContext();
  const googleReviewLink = user?.googleRating;
  const [showPopup, setShowPopup] = useState(false);
  const [rating, setRating] = useState(0);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const {id: EventId} = Route.useParams();

  const {mutate: feedback} = usePostFeedback();
  const {mutateAsync: updatePageCount} = useUpdateGooglePageCount(EventId);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasShownPopup) {
        setShowPopup(true);
        setHasShownPopup(true);
      }
    }, 7000);
    return () => clearTimeout(timer);
  }, [hasShownPopup]);

  const handleRating = (value: number) => {
    setRating(value);
    setShowPopup(false);

    if (value >= 4) {
      setTimeout(() => {
        updatePageCount();

        window.open(googleReviewLink, '_blank');
      }, 1000);
    } else {
      setShowForm(true);
    }
  };

  const onSubmit = async (data: FeedbackFormData) => {
    feedback({
      subId: EventId,
      data: {
        rating: rating,
        name: data.name || '',
        phone: data.phoneNumber || '',
        email: data.email || '',
        feedback: data.feedback,
      },
    });

    if (rating >= 4) {
      await window.open(googleReviewLink, '_blank');
    }

    setShowForm(false);
  };

  const onError = (error: any) => {
    console.error('Error adding feedback:', error);
  };

  return (
    <FormProvider {...methods}>
      <>
        {showPopup && (
          <AnimatePresence>
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
            >
              <motion.div
                initial={{scale: 0.8, opacity: 0}}
                animate={{scale: 1, opacity: 1}}
                exit={{scale: 0.8, opacity: 0}}
                transition={{type: 'spring', stiffness: 100}}
                className="relative mx-4 w-full max-w-xs transform rounded-2xl bg-black p-6 shadow-2xl"
              >
                {/* Close button */}
                <button
                  className="text-gray-400 hover:bg-gray-100 hover:text-gray-600 absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-[10px] transition-colors"
                  onClick={() => setShowPopup(false)}
                >
                  ✕
                </button>

                {/* Rating Message */}
                <div className="mb-4 text-center">
                  <h3 className="mb-1 text-xl font-semibold text-white">
                    How was your catering experience?
                  </h3>
                </div>

                {/* Rating stars */}
                <div className="mb-6 text-center">
                  <div className="flex justify-center space-x-2">
                    {[...Array(5)].map((_, i) => {
                      const isFifthStar = i === 4; // Index 4 = 5th star

                      return (
                        <motion.button
                          key={i}
                          onClick={() => handleRating(i + 1)}
                          whileHover={{scale: 1.2}}
                          whileTap={{scale: 0.9}}
                          animate={
                            isFifthStar && rating < 5
                              ? {
                                  scale: [1, 1.3, 1],
                                  transition: {
                                    repeat: Infinity,
                                    duration: 1.2,
                                  },
                                }
                              : {}
                          }
                          style={{
                            color: i < (rating || 4) ? '#ffc107' : '#ffc107',
                            fontSize: '36px',
                          }}
                          className="transform rounded-full p-1 focus:outline-none"
                        >
                          {isFifthStar ? <IoStarHalfOutline /> : <IoStar />}
                        </motion.button>
                      );
                    })}
                  </div>
                  <p className="mb-3 text-[8px] text-white">
                    Current Google Rating:{' '}
                    <span className="font-semibold text-yellow-400"> 4.7 </span>
                    / 5
                  </p>
                  <p className="text-sm text-white">
                    Help us improve our food and service quality.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-xl border border-yellow-700">
              {/* Close button */}
              <button
                className="text-gray-400 hover:bg-gray-100 hover:text-gray-600 absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] transition-colors"
                onClick={() => setShowForm(false)}
              >
                ✕
              </button>
              {/* Header */}
              <div className="rounded-t-2xl bg-black bg-gradient-to-r px-6 py-6 text-center">
                <h2 className="text-2xl font-semibold text-[#c7a552]">
                  We'd love your feedback!
                </h2>
                <p className="mt-1 text-sm text-[#c7a552]">
                  Help us improve by sharing your thoughts
                </p>
              </div>

              {/* Rating display */}
              <div className="flex justify-center gap-1 bg-black">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="material-icons cursor-pointer transition-all hover:scale-110"
                    style={{
                      color: i < (rating || 4) ? '#ffc107' : '#e4e5e9',
                      fontSize: '32px',
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              <form
                onSubmit={handleSubmit(onSubmit, onError)}
                className="space-y-1 bg-black px-6 pb-6 pt-2 text-white"
              >
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#c7a552] sm:text-sm">
                    Feedback
                  </label>
                  <textarea
                    rows={4}
                    {...register('feedback')}
                    placeholder="Please share your thoughts with us..."
                    className="w-full rounded-lg border border-yellow-700 bg-black px-3 py-2 text-sm text-white shadow-sm transition-all placeholder:text-[#929090] focus:border-yellow-500 focus:ring-1 focus:ring-yellow-600 sm:px-4"
                  />
                  {errors.feedback && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.feedback.message}
                    </p>
                  )}
                </div>

                {/* Buttons - with reduced Maybe Later button */}
                <div className="flex items-center justify-end pt-3">
                  <button
                    type="submit"
                    className="rounded-lg bg-yellow-700 bg-gradient-to-r px-6 py-2.5 text-sm font-medium text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    Submit Feedback
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    </FormProvider>
  );
};

export default Feedback;
