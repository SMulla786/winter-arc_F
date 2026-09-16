// ShowQrCodeData.tsx (Updated)
import menucardbg from '@/assets/images/menucard/menucard1.jpg';
import {useGetQrCode} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {usePostFeedback} from '@/lib/react-query/queriesAndMutations/cateror/feedback';
import {Route} from '@/routes/_external/qr.$id';
import {zodResolver} from '@hookform/resolvers/zod';
import React, {useEffect, useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {MdFeedback} from 'react-icons/md';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useAuthContext} from '@/context/AuthContext';
import {BiDownload} from 'react-icons/bi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import {useReactToPrint} from 'react-to-print';
import ExternalBlackThemee from './ExternalBlackTheme';
import ExternalOrangeTheme from './ExternalOrangeTheme';
import {IoClose} from 'react-icons/io5';
import orange from '@/assets/images/menucard/orange.png';

const feedbackSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phoneNumber: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z
      .string()
      .regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits')
      .optional(),
  ),
  feedback: z.string().min(1, 'Feedback is required'),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface Category {
  name: string;
}

interface DishItem {
  dishId: string;
  dish: {
    name: string;
    description: string;
    category: Category;
  };
}

interface User {
  fullname: string;
  email: string;
  phoneNumber: string;
  image?: string;
}

interface EventData {
  name: string;
  client: {
    user: User;
  };
  cateror: {
    user: User;
    image?: string;
  };
}

interface SubeventData {
  name: string;
  time: string;
  address: string;
  date: string;
  dishes: DishItem[];
  event: EventData;
  qrDesign?: {
    image: string;
    colour: string;
  };
}

const ShowQrCodeData: React.FC = () => {
  const {id} = Route.useParams<{id: string}>();
  const {data: subeventData, isLoading} = useGetQrCode(id);

  const {user} = useAuthContext();
  const [subevent, setSubevent] = useState<SubeventData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const {data: caterorData} = useGetCaterorById(user?.caterorId ?? '');
  const {mutate: feedback, isSuccess} = usePostFeedback();

  const color = subeventData?.qrDesign?.colour?.toLowerCase();

  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<FeedbackFormData>({resolver: zodResolver(feedbackSchema)});

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      return;
    }

    if (subeventData) {
      setSubevent(subeventData);
    } else {
      setError('No data found');
    }

    setLoading(false);
  }, [subeventData, isLoading]);

  useEffect(() => {
    if (isSuccess) {
      setShowForm(false);
    }
  }, [isSuccess]);

  const onSubmit = (data: FeedbackFormData) => {
    feedback({
      subId: id,
      data: {
        rating,
        name: data.name,
        phone: data.phoneNumber || '',
        feedback: data.feedback,
      },
    });
    setShowForm(false);
  };

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Menu-${Math.random().toString(36).substring(7)}`,
  });

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;

    const element = printRef.current;
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;

    let width = pdfWidth;
    let height = width / ratio;
    if (height > pdfHeight) {
      height = pdfHeight;
      width = height * ratio;
    }

    const x = (pdfWidth - width) / 2;
    const y = (pdfHeight - height) / 2;

    pdf.addImage(imgData, 'JPEG', x, y, width, height);
    pdf.save(`menu-${id}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-700 mt-4 text-lg">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error || !subevent) {
    return (
      <div className="bg-gray-100 flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <p className="text-xl font-medium text-red-600">
            {error || `No data found for ID: ${id}`}
          </p>
        </div>
      </div>
    );
  }

  const cateror = subevent.event.cateror.user;
  const eventDate = new Date(subevent.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Group dishes by category and include descriptions
  const groupedDishes = subevent.dishes.reduce(
    (acc, item) => {
      const categoryName = item.dish.category.name;
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push({
        name: item.dish.name,
        description: item.dish.description,
      });
      return acc;
    },
    {} as Record<string, Array<{name: string; description: string}>>,
  );

  // Conditional rendering based on color
  const renderTheme = () => {
    const color = subeventData?.qrDesign?.colour?.toLowerCase();

    if (color === 'black') {
      return (
        <ExternalBlackThemee
          subeventData={subeventData}
          caterorData={caterorData}
          groupedDishes={groupedDishes}
          eventDate={eventDate}
          printRef={printRef}
        />
      );
    } else if (color === 'orange') {
      return (
        <ExternalOrangeTheme
          subeventData={subeventData}
          caterorData={caterorData}
          groupedDishes={groupedDishes}
          eventDate={eventDate}
          printRef={printRef}
        />
      );
    } else {
      // Default theme (your original theme)
      return (
        <div
          ref={printRef}
          style={{
            width: '100%',
            maxWidth: '210mm',
            minHeight: '297mm',
            backgroundImage: `url(${subeventData?.qrDesign?.image || menucardbg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          }}
          className="relative flex flex-col items-center p-4 sm:p-8"
        >
          {/* Your original default theme content remains the same */}
          <div className="absolute left-0 right-0 top-0 h-2 bg-gradient-to-r from-teal-500 to-teal-700" />

          {/* Caterer Info */}
          <div className="mb-4 flex w-full justify-center sm:mb-6">
            <div className="flex w-full max-w-xs items-center justify-center rounded-lg p-3 sm:p-4">
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 overflow-hidden rounded-full sm:h-16 sm:w-16">
                  <img
                    src={caterorData?.data?.image}
                    alt="Cateror"
                    className="h-full w-full object-cover"
                  />
                </div>
                <h2 className="mt-2 text-center text-lg font-bold text-teal-800 sm:text-xl">
                  {cateror.fullname || 'Your Catering Name'}
                </h2>
                <p className="text-center text-xs text-teal-600 sm:text-sm">
                  Delicious Experiences
                </p>
              </div>
            </div>
          </div>

          {/* Rest of your original default theme */}
          {/* ... */}
        </div>
      );
    }
  };

  return (
    <div
      className={`flex min-h-screen flex-col items-center bg-[#000000] ${color === 'black' ? 'bg-[#000000]' : 'bg-white'}`}
      style={{
        background: color === 'orange' ? `url(${orange})` : undefined,
      }}
    >
      {/* Render conditional theme */}
      {renderTheme()}

      {/* Action buttons - Stack on mobile */}
      <div className="mb-4 mt-4 flex w-full max-w-4xl flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6 print:hidden">
        {/* Inquiry Button */}
        <button
          className={`flex items-center gap-3 rounded-xl ${color === 'black' ? 'bg-yellow-700' : 'bg-[#000000]'} px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2`}
          onClick={() => setShowForm(true)}
        >
          <MdFeedback className="h-5 w-5" />
          <span>Make Inquiry</span>
        </button>

        {/* Download Button */}
        {/* <button
          onClick={handlePrint}
          className="flex items-center gap-3 rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          <BiDownload className="h-5 w-5" />
          <span>Download PDF</span>
        </button> */}
      </div>

      {/* Inquiry Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4">
          <div className="mx-2 w-full max-w-md rounded-2xl border border-yellow-800 bg-black shadow-2xl">
            <div className="ml-4 mt-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="hover:text-gray-700 text-xs font-medium text-[#929090] transition sm:text-sm"
              >
                <IoClose />
              </button>
            </div>
            <div className="rounded-t-2xl bg-black bg-gradient-to-r px-4 py-4 text-center text-white shadow-md sm:px-6 sm:py-6">
              <h2 className="mb-1 text-xl font-bold text-[#c7a552] sm:text-2xl">
                We'd love your inquiry!
              </h2>
              <p className="text-xs text-[#c7a552] sm:text-sm">
                Help us improve by sharing your thoughts
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 px-4 py-4 sm:px-6 sm:py-6"
            >
              {/* Form fields remain the same */}
              <div>
                <label className="mb-1 block text-xs font-medium text-[#c7a552] sm:text-sm">
                  Name
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full rounded-lg border border-yellow-700 bg-black px-3 py-2 text-sm text-white shadow-sm transition-all placeholder:text-[#929090] focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400 sm:px-4"
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500 sm:text-sm">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#c7a552] sm:text-sm">
                  Mobile
                </label>
                <input
                  type="text"
                  {...register('phoneNumber')}
                  className="w-full rounded-lg border border-yellow-700 bg-black px-3 py-2 text-sm text-white shadow-sm transition-all placeholder:text-[#929090] focus:border-yellow-500 focus:ring-1 focus:ring-yellow-600 sm:px-4"
                  placeholder="98765 43210"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-xs text-red-500 sm:text-sm">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#c7a552] sm:text-sm">
                  Inquiry
                </label>
                <textarea
                  rows={3}
                  {...register('feedback')}
                  className="w-full resize-none rounded-lg border border-yellow-700 bg-black px-3 py-2 text-sm text-white shadow-sm transition-all placeholder:text-[#929090] focus:border-yellow-500 focus:ring-1 focus:ring-yellow-600 sm:px-4"
                  placeholder="Please share your thoughts with us..."
                />
                {errors.feedback && (
                  <p className="mt-1 text-xs text-red-500 sm:text-sm">
                    {errors.feedback.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end pt-3">
                <button
                  type="submit"
                  className="rounded-lg bg-yellow-700 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 sm:px-6 sm:text-sm"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowQrCodeData;
