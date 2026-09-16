/*eslint-disable*/
import React, {useState, useEffect, useMemo} from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {
  useAddEventCRM,
  useGetCRMData,
  useGetAllEventsCrm,
  useGetEventCRMHistory,
  useSubmitFinalizedCancel,
  useDeleteEventCRMProcess,
  useUpdateEventCRMProcess,
} from '@/lib/react-query/queriesAndMutations/cateror/CRM/crm';
import {useGetAllEmployee} from '@/lib/react-query/queriesAndMutations/cateror/Employee/employee';
import GenericButton from '../Forms/Buttons/GenericButton';
import SearchableDropdown from '../Dish/CustomDropdown/SearchableDropdown';
import {Link, useNavigate, useParams} from '@tanstack/react-router';
import {
  FiTrash2,
  FiX,
  FiUpload,
  FiFile,
  FiXCircle,
  FiArrowUp,
  FiArrowDown,
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle as FiCancel,
  FiImage,
  FiEdit,
  FiSave,
  FiEye,
  FiCalendar,
  FiUser,
  FiBriefcase,
  FiMessageSquare,
  FiClock,
  FiChevronRight,
  FiPlus,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {Route} from '@/routes/_app/_crm/eventcrmpage.$id';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Updated Zod schema
const eventCRMSchema = z.object({
  processId: z.string().min(1, 'Process is required'),
  employeeId: z.string().min(1, 'Employee is required'),
  note: z.string().optional(),
  followUpDate: z.string().min(1, 'Follow-up date is required'),
  followupProcessId: z.string().optional(),
  documents: z.any().optional(),
});

type FormValues = {
  processId: string;
  employeeId: string;
  note?: string;
  followUpDate: string;
  followupProcessId?: string;
  documents?: FileList;
};

interface CRMHistory {
  id: string;
  processName: string;
  processId: string;
  employeeName: string;
  employeeId: string;
  followUpDate: string;
  note: string;
  status: string;
  createdAt: string;
  images?: string[];
  followupProcessId?: string;
  followupProcessName?: string;
}

// Image Popup Component
interface ImagePopupProps {
  imageSrc: string;
  onClose: () => void;
}

const ImagePopup: React.FC<ImagePopupProps> = ({imageSrc, onClose}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
      <div className="relative max-h-[70vh] max-w-[70vw]">
        <img
          src={imageSrc}
          alt="Preview"
          className="max-h-[70vh] max-w-full rounded-lg object-contain"
        />
        <button
          onClick={onClose}
          className="absolute -right-12 top-0 rounded-full bg-red-600 p-2 text-white transition-colors hover:bg-red-700"
        >
          <FiX className="text-xl" />
        </button>
      </div>
    </div>
  );
};

// Image Gallery Component for multiple images
interface ImageGalleryProps {
  images: string[];
  onClose: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({images, onClose}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
      <div className="relative max-h-[90vh] max-w-[90vw]">
        <div className="flex items-center justify-between">
          <button
            onClick={prevImage}
            className="text-gray-800 hover:bg-gray-200 rounded-full bg-white p-2 transition-colors disabled:opacity-50"
            disabled={images.length <= 1}
          >
            <FiArrowLeft className="text-xl" />
          </button>

          <div className="mx-4 text-white">
            {currentIndex + 1} / {images.length}
          </div>

          <button
            onClick={nextImage}
            className="text-gray-800 hover:bg-gray-200 rounded-full bg-white p-2 transition-colors disabled:opacity-50"
            disabled={images.length <= 1}
          >
            <FiChevronRight className="text-xl" />
          </button>
        </div>

        <img
          src={images[currentIndex]}
          alt={`Preview ${currentIndex + 1}`}
          className="mt-4 max-h-[70vh] max-w-full rounded-lg object-contain"
        />

        <button
          onClick={onClose}
          className="absolute -right-12 top-0 rounded-full bg-red-600 p-2 text-white transition-colors hover:bg-red-700"
        >
          <FiX className="text-xl" />
        </button>
      </div>
    </div>
  );
};

// Note Popup Component
interface NotePopupProps {
  note: string;
  onClose: () => void;
  title?: string;
  position?: {x: number; y: number};
}

const NotePopup: React.FC<NotePopupProps> = ({
  note,
  onClose,
  title = 'Note Details',
  position,
}) => {
  const popupStyle: React.CSSProperties = position
    ? {
        position: 'fixed',
        left: `${Math.min(position.x, window.innerWidth - 400)}px`,
        top: `${Math.min(position.y, window.innerHeight - 300)}px`,
        transform: 'none',
        zIndex: 50,
      }
    : {};

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-30"
      onClick={onClose}
    >
      <div
        className="absolute w-96 max-w-[90vw] rounded-2xl bg-white p-6 shadow-xl dark:bg-boxdark"
        style={popupStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-gray-900 text-lg font-semibold dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 max-h-60 overflow-y-auto rounded-lg p-4">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
            {note || 'No note provided'}
          </p>
        </div>
      </div>
    </div>
  );
};

// Custom Select Component
interface CustomSelectProps {
  options: Array<{value: string; label: string}>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full rounded border border-stroke bg-transparent px-2 py-1 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Calendar Picker Component for table edit - FIXED VERSION
interface TableCalendarPickerProps {
  value: string;
  onChange: (dateString: string) => void;
  minDate?: Date;
  showTimeSelect?: boolean;
}

const TableCalendarPicker: React.FC<TableCalendarPickerProps> = ({
  value,
  onChange,
  minDate,
  showTimeSelect = true,
}) => {
  // Convert string to Date object safely
  const dateValue = useMemo(() => {
    if (!value) return null;
    try {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  }, [value]);

  const handleDateChange = (date: Date | null) => {
    if (date && !isNaN(date.getTime())) {
      onChange(date.toISOString());
    } else {
      onChange('');
    }
  };

  const CustomInput = React.forwardRef(
    ({value: inputValue, onClick}: any, ref: any) => (
      <button
        type="button"
        className="flex w-full items-center justify-between rounded border border-stroke bg-transparent px-2 py-1 text-left text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
        onClick={onClick}
        ref={ref}
      >
        <div className="flex items-center gap-1">
          <FiCalendar className="text-gray-400 text-xs" />
          <span
            className={
              !dateValue ? 'text-gray-400' : 'text-gray-900 dark:text-white'
            }
          >
            {dateValue
              ? dateValue.toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Select date'}
          </span>
        </div>
      </button>
    ),
  );
  CustomInput.displayName = 'CustomInput';

  return (
    <div className="w-full">
      <DatePicker
        selected={dateValue}
        onChange={handleDateChange}
        showTimeSelect={showTimeSelect}
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="Time"
        dateFormat="MMMM d, yyyy h:mm aa"
        minDate={minDate}
        customInput={<CustomInput />}
        wrapperClassName="w-full"
        className="w-full"
        popperClassName="z-50"
        popperPlacement="bottom-start"
        placeholderText="Select date and time"
      />
    </div>
  );
};

// Helper functions
const getCurrentDateTime = (): string => {
  return new Date().toISOString();
};

const formatDateTimeForDisplay = (dateInput: any): string => {
  if (!dateInput) return 'N/A';
  try {
    if (typeof dateInput === 'string') {
      // Check if it's already in display format
      if (dateInput.includes('/') || dateInput.includes(':')) return dateInput;

      // Try to parse as Date
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return 'N/A';

      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
    if (dateInput instanceof Date) {
      if (isNaN(dateInput.getTime())) return 'N/A';
      return dateInput.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
    return 'N/A';
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};

const hasFutureFollowUp = (followUpDate: string): boolean => {
  if (!followUpDate) return false;
  try {
    const followUpDateObj = new Date(followUpDate);
    if (isNaN(followUpDateObj.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return followUpDateObj > today;
  } catch (error) {
    console.error('Error checking future follow-up:', error);
    return false;
  }
};

const validateFiles = (files: FileList | null): string | null => {
  if (!files || files.length === 0) return null;
  const maxSize = 5 * 1024 * 1024;
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!allowedTypes.includes(file.type)) {
      return `File "${file.name}" type not supported.`;
    }
    if (file.size > maxSize) {
      return `File "${file.name}" exceeds 5MB limit.`;
    }
  }
  return null;
};

const MainEventCRMPage: React.FC<{PropsEventId?: string}> = ({
  PropsEventId,
}) => {
  const navigate = useNavigate();
  let paramId: string | undefined;

  try {
    paramId = Route.useParams().id;
  } catch (_) {}

  const EventId = paramId || PropsEventId;
  console.log('event id in crmm', EventId);
  const [selectedEventId, setSelectedEventId] = useState<string>(EventId || '');
  const [selectedEventName, setSelectedEventName] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ENQUIRY');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRowData, setNewRowData] = useState<Partial<CRMHistory> | null>(
    null,
  );
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<CRMHistory> | null>(
    null,
  );
  const [editUploadedFiles, setEditUploadedFiles] = useState<File[]>([]);
  const [editFilePreviews, setEditFilePreviews] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFinalized, setShowFinalized] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [tentativeAmount, setTentativeAmount] = useState('');
  const [cancelledReason, setCancelledReason] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [showNotePopup, setShowNotePopup] = useState(false);
  const [showReasonPopup, setShowReasonPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState<{x: number; y: number}>({
    x: 0,
    y: 0,
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(eventCRMSchema),
    defaultValues: {
      processId: '',
      employeeId: '',
      note: '',
      followUpDate: getCurrentDateTime(),
      followupProcessId: '',
    },
  });

  const {handleSubmit, setValue, reset, watch} = methods;
  const watchDocuments = watch('documents');

  // Queries
  const {data: eventsData, isLoading: isEventsLoading} = useGetAllEventsCrm();
  console.log('Events Data:', eventsData);
  const {data: crmData} = useGetCRMData();
  console.log('CRM Data:', crmData);
  const {data: employeesData} = useGetAllEmployee();
  const {mutate: addEventCRM} = useAddEventCRM();
  const {data: eventData, refetch: refetchHistory} =
    useGetEventCRMHistory(selectedEventId);
  const {mutate: submitFinalizedCancel, isPending: isFinalizeCancelSubmitting} =
    useSubmitFinalizedCancel();
  const {mutate: updateEventCRM, isPending: isUpdating} =
    useUpdateEventCRMProcess();
  const {mutate: deleteEventCRMProcess, isPending: isDeleting} =
    useDeleteEventCRMProcess();

  // Safe options
  const eventOptions = useMemo(() => {
    try {
      const events = eventsData?.data?.data || [];
      return events.map((e: any) => ({
        value: e?.id || '',
        label: e?.name || 'Unnamed Event',
      }));
    } catch (error) {
      return [];
    }
  }, [eventsData]);

  const crmOptions = useMemo(() => {
    try {
      const processes = crmData?.data || [];
      return processes.map((c: any) => ({
        value: c?.id || '',
        label: c?.name || 'Unnamed Process',
      }));
    } catch (error) {
      return [];
    }
  }, [crmData]);

  const employeeOptions = useMemo(() => {
    try {
      const employees = employeesData?.data || [];
      return employees.map((e: any) => ({
        value: e?.id || '',
        label: e?.fullname || 'Unnamed Employee',
      }));
    } catch (error) {
      return [];
    }
  }, [employeesData]);
  const hasEmployees = employeeOptions.length > 0;

  // Get first employee as default
  const defaultEmployeeId = useMemo(() => {
    return employeeOptions.length > 0 ? employeeOptions[0].value : '';
  }, [employeeOptions]);

  // Safe CRM History Data with sorting and image processing
  const crmHistory: (CRMHistory & {
    isCurrent?: boolean;
    isUpcoming?: boolean;
  })[] = useMemo(() => {
    try {
      const processes = eventData?.data?.EventCrmProcess || [];
      const history = processes.map((item: any) => {
        // Extract images from eventCrmImages array
        const images = item?.eventCrmImages?.map((img: any) => img.image) || [];

        // Get main process name
        const processName = item?.process?.name || 'N/A';

        // Get follow-up process name
        let followupProcessName = 'N/A';
        if (item?.followupProcessId) {
          const followupProcess = crmOptions.find(
            (c: any) => c.value === item.followupProcessId,
          );
          followupProcessName =
            followupProcess?.label || item.followupProcessId;
        }

        return {
          id: item?.id || `temp-${Math.random()}`,
          processName: processName,
          processId: item?.processId || '',
          employeeName: item?.employee?.user?.fullname || 'N/A',
          employeeId: item?.employeeId || '',
          followUpDate: item?.followUpDate || '',
          note: item?.note || '',
          status: eventData?.data?.status || 'ENQUIRY',
          createdAt: item?.createdAt || '',
          images: images,
          followupProcessId: item?.followupProcessId || '',
          followupProcessName: followupProcessName,
        };
      });

      // Find the most recent non-upcoming item to mark as current
      const now = new Date();
      const nonUpcomingItems = history.filter((item) => {
        if (!item.followUpDate) return false;
        try {
          const followUpDate = new Date(item.followUpDate);
          return !isNaN(followUpDate.getTime()) && followUpDate <= now;
        } catch (error) {
          return false;
        }
      });

      // Sort non-upcoming items by creation date to find the most recent
      const sortedNonUpcoming = nonUpcomingItems.sort((a, b) => {
        const aCreatedAt = new Date(a.createdAt).getTime();
        const bCreatedAt = new Date(b.createdAt).getTime();
        return bCreatedAt - aCreatedAt; // Most recent first
      });

      const currentItemId =
        sortedNonUpcoming.length > 0 ? sortedNonUpcoming[0].id : null;

      // Now sort the entire history with upcoming first
      return history
        .sort((a, b) => {
          const now = new Date();

          // Check if items have upcoming follow-up dates
          const aIsUpcoming =
            a.followUpDate && hasFutureFollowUp(a.followUpDate);
          const bIsUpcoming =
            b.followUpDate && hasFutureFollowUp(b.followUpDate);

          // Get creation dates for current/most recent comparison
          const aCreatedAt = new Date(a.createdAt).getTime();
          const bCreatedAt = new Date(b.createdAt).getTime();

          // Priority 1: Upcoming follow-up dates come first
          if (aIsUpcoming && !bIsUpcoming) return -1;
          if (!aIsUpcoming && bIsUpcoming) return 1;

          // Priority 2: If both are upcoming, sort by follow-up date (earliest first)
          if (aIsUpcoming && bIsUpcoming) {
            const aFollowUp = new Date(a.followUpDate).getTime();
            const bFollowUp = new Date(b.followUpDate).getTime();
            return aFollowUp - bFollowUp;
          }

          // Priority 3: For non-upcoming items, sort by creation date (most recent first by default)
          return sortOrder === 'asc'
            ? aCreatedAt - bCreatedAt
            : bCreatedAt - aCreatedAt;
        })
        .map((item) => ({
          ...item,
          isCurrent: item.id === currentItemId,
          isUpcoming: hasFutureFollowUp(item.followUpDate),
        }));
    } catch (error) {
      console.error('Error processing CRM history:', error);
      return [];
    }
  }, [eventData, sortOrder, crmOptions]);

  // Current event status
  const currentEventStatus = useMemo(() => {
    return eventData?.data?.status || 'ENQUIRY';
  }, [eventData]);

  // Handle file upload changes
  useEffect(() => {
    if (watchDocuments?.length) {
      const files = Array.from(watchDocuments);
      setUploadedFiles(files);

      const imagePreviews = files.map((file) => {
        if (file.type.startsWith('image/')) {
          return URL.createObjectURL(file);
        }
        return '';
      });
      setFilePreviews(imagePreviews);

      return () => {
        imagePreviews.forEach((url) => {
          if (url) URL.revokeObjectURL(url);
        });
      };
    } else {
      setUploadedFiles([]);
      setFilePreviews([]);
    }
  }, [watchDocuments]);

  // Auto-select event from URL params
  useEffect(() => {
    if (EventId && EventId !== 'undefined' && eventOptions.length) {
      const opt = eventOptions.find((o: any) => o.value === EventId);
      if (opt) {
        setSelectedEventId(EventId);
        setSelectedEventName(opt.label);
      }
    }
  }, [EventId, eventOptions]);

  // Set default employee when component loads
  useEffect(() => {
    if (defaultEmployeeId && !newRowData) {
      setValue('employeeId', defaultEmployeeId);
    }
  }, [defaultEmployeeId, newRowData, setValue]);

  // Update selected status when event data changes
  useEffect(() => {
    if (eventData?.data?.status) {
      setSelectedStatus(eventData.data.status);
    }
  }, [eventData]);

  const handleEventSelect = (val: string) => {
    const opt = eventOptions.find((o: any) => o.value === val);
    setSelectedEventId(val);
    setSelectedEventName(opt?.label || '');
    setSelectedStatus('ENQUIRY');
    setNewRowData(null);
    setUploadedFiles([]);
    setFilePreviews([]);
    reset();
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const error = validateFiles(files);
      if (error) {
        setSubmitError(error);
        return;
      }
      setValue('documents', files);
      setSubmitError(null);
    }
  };

  // Handle file upload for edit row
  const handleEditFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const error = validateFiles(files);
      if (error) {
        setSubmitError(error);
        return;
      }

      const newFiles = Array.from(files);
      setEditUploadedFiles((prev) => [...prev, ...newFiles]);

      const imagePreviews = newFiles.map((file) => {
        if (file.type.startsWith('image/')) {
          return URL.createObjectURL(file);
        }
        return '';
      });
      setEditFilePreviews((prev) => [...prev, ...imagePreviews]);
      setSubmitError(null);
    }
  };

  // Remove uploaded file
  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    const dt = new DataTransfer();
    newFiles.forEach((file) => dt.items.add(file));
    setValue('documents', dt.files);
    setUploadedFiles(newFiles);

    if (filePreviews[index]) {
      URL.revokeObjectURL(filePreviews[index]);
    }
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove uploaded file from edit row
  const removeEditFile = (index: number) => {
    const newFiles = editUploadedFiles.filter((_, i) => i !== index);
    setEditUploadedFiles(newFiles);

    if (editFilePreviews[index]) {
      URL.revokeObjectURL(editFilePreviews[index]);
    }
    setEditFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Image handlers
  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
  };

  const handleImagesClick = (images: string[]) => {
    if (images.length === 1) {
      setSelectedImage(images[0]);
    } else if (images.length > 1) {
      setSelectedImages(images);
      setShowImageGallery(true);
    }
  };

  const closeImagePopup = () => {
    setSelectedImage(null);
    setSelectedImages([]);
    setShowImageGallery(false);
  };

  // Note handlers with position tracking
  const handleNoteClick = (note: string, event: React.MouseEvent) => {
    setSelectedNote(note);
    setPopupPosition({
      x: event.clientX,
      y: event.clientY,
    });
    setShowNotePopup(true);
  };

  const closeNotePopup = () => {
    setSelectedNote(null);
    setShowNotePopup(false);
  };

  // Reason handlers with position tracking
  const handleReasonClick = (reason: string, event: React.MouseEvent) => {
    setSelectedNote(reason);
    setPopupPosition({
      x: event.clientX,
      y: event.clientY,
    });
    setShowReasonPopup(true);
  };

  const closeReasonPopup = () => {
    setSelectedNote(null);
    setShowReasonPopup(false);
  };

  // Finalize and Cancel handlers
  const handleFinalize = () => {
    setShowFinalized(true);
    setTentativeAmount('');
  };

  const handleCancel = () => {
    setShowCancel(true);
    setCancelledReason('');
  };

  const submitFinalize = () => {
    if (!selectedEventId) {
      toast.error('No event selected');
      return;
    }

    const tentativeAmountNum = parseFloat(tentativeAmount);
    if (isNaN(tentativeAmountNum)) {
      toast.error('Please enter a valid tentative amount');
      return;
    }

    const processId = crmHistory[0]?.processId || 'default-process-id';

    const payload = {
      eventId: selectedEventId,
      tentativeAmount: tentativeAmountNum,
      processId: processId,
      status: 'FINALIZED',
    };

    submitFinalizedCancel(payload, {
      onSuccess: () => {
        refetchHistory();
        setShowFinalized(false);
        setTentativeAmount('');
        toast.success('Event finalized successfully!');
      },
      onError: (err: any) => {
        console.error('Finalize error:', err);
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Failed to finalize event';
        toast.error(msg);
      },
    });
  };

  const submitCancel = () => {
    if (!selectedEventId) {
      toast.error('No event selected');
      return;
    }

    if (!cancelledReason.trim()) {
      toast.error('Please enter cancellation reason');
      return;
    }

    const processId = crmHistory[0]?.processId || 'default-process-id';

    const payload = {
      eventId: selectedEventId,
      cancelledReason: cancelledReason,
      processId: processId,
      status: 'CANCELED',
    };

    submitFinalizedCancel(payload, {
      onSuccess: () => {
        refetchHistory();
        setShowCancel(false);
        setCancelledReason('');
        toast.success('Event cancelled successfully!');
      },
      onError: (err: any) => {
        console.error('Cancel error:', err);
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Failed to cancel event';
        toast.error(msg);
      },
    });
  };

  const onSubmit = async (data: FormValues) => {
    console.log('Form data:', data);
    if (!selectedEventId) {
      setSubmitError('Please select an event');
      toast.error('Please select an event');
      return;
    }

    // Validate required fields
    if (!data.processId || !data.employeeId || !data.followUpDate) {
      const missingFields = [];
      if (!data.processId) missingFields.push('Process');
      if (!data.employeeId) missingFields.push('Employee');
      if (!data.followUpDate) missingFields.push('Follow-up Date');

      const errorMsg = `Please fill all required fields: ${missingFields.join(', ')}`;
      setSubmitError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Enhanced validation that selected options exist in our options
    const selectedEmployee = employeeOptions.find(
      (emp: any) => emp.value === data.employeeId,
    );
    const selectedProcess = crmOptions.find(
      (proc: any) => proc.value === data.processId,
    );

    if (!selectedEmployee) {
      setSubmitError('Selected employee is invalid.');
      toast.error('Selected employee is invalid.');
      return;
    }

    if (!selectedProcess) {
      setSubmitError('Selected process is invalid.');
      toast.error('Selected process is invalid.');
      return;
    }

    // Validate event exists
    const selectedEvent = eventOptions.find(
      (event: any) => event.value === selectedEventId,
    );

    if (!selectedEvent) {
      setSubmitError('Selected event is invalid.');
      toast.error('Selected event is invalid.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const base64Images: string[] = [];
      if (data.documents?.length) {
        console.log('Converting files to base64...');
        for (const file of Array.from(data.documents)) {
          const base64 = await fileToBase64(file as File);
          base64Images.push(base64);
        }
      }

      const employeeName = selectedEmployee.label;

      // Fix date format for API
      let followUpDate = data.followUpDate;
      if (!followUpDate.includes('Z') && !followUpDate.includes('+')) {
        followUpDate = new Date(followUpDate).toISOString();
      }

      let followupProcessId = '';
      if (data.followupProcessId && data.followupProcessId.trim() !== '') {
        const followupProcess = crmOptions.find(
          (c: any) => c.value === data.followupProcessId,
        );
        if (followupProcess) {
          followupProcessId = data.followupProcessId;
        } else {
          console.warn(
            'Follow-up process not found in options, using empty string',
          );
          followupProcessId = '';
        }
      }

      // CORRECTED PAYLOAD - always send string, never null
      const payload = {
        eventId: selectedEventId,
        employeeId: data.employeeId,
        processId: data.processId,
        note: data.note || '',
        followUpDate: followUpDate,
        followupProcessId: followupProcessId, // Always a string (empty or with value)
        fullname: employeeName,
        images: base64Images.length > 0 ? base64Images : [],
        status: selectedStatus,
      };

      addEventCRM(payload, {
        onSuccess: (response) => {
          reset();
          setSelectedStatus('ENQUIRY');
          setNewRowData(null);
          setUploadedFiles([]);
          setFilePreviews([]);
          refetchHistory();
          toast.success('CRM Process added successfully!');
        },
        onError: (err: any) => {
          const errorMsg =
            err.response?.data?.message || err.message || 'Submission failed';
          setSubmitError(errorMsg);
          toast.error(errorMsg);
        },
        onSettled: () => setIsSubmitting(false),
      });
    } catch (e) {
      console.error('Submission failed:', e);
      const errorMsg = 'Submission failed: ' + (e as Error).message;
      setSubmitError(errorMsg);
      setIsSubmitting(false);
      toast.error('Submission failed');
    }
  };

  const handleAddNew = () => {
    console.log('Add new button clicked');

    // Check if we have required options
    if (employeeOptions.length === 0) {
      toast.error('No employees available.');
      return;
    }

    if (crmOptions.length === 0) {
      toast.error('No processes available.');
      return;
    }

    setNewRowData({
      processId: crmOptions[0]?.value || '',
      employeeId: defaultEmployeeId,
      followUpDate: getCurrentDateTime(),
      note: '',
      followupProcessId: '',
      status: 'ENQUIRY',
    });
    setUploadedFiles([]);
    setFilePreviews([]);
    reset({
      processId: crmOptions[0]?.value || '',
      employeeId: defaultEmployeeId,
      note: '',
      followUpDate: getCurrentDateTime(),
      followupProcessId: '',
    });
  };

  const handleCancelAdd = () => {
    setNewRowData(null);
    setUploadedFiles([]);
    setFilePreviews([]);
    reset();
  };

  // Edit functionality - NOW ALL ROWS ARE EDITABLE
  const handleEdit = (item: CRMHistory) => {
    setEditingRow(item.id);
    setEditFormData({
      processId: item.processId,
      note: item.note || '',
      employeeId: item.employeeId,
      followUpDate: item.followUpDate,
      followupProcessId: item.followupProcessId || '',
    });
    setEditUploadedFiles([]);
    setEditFilePreviews([]);
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditFormData(null);
    setEditUploadedFiles([]);
    setEditFilePreviews([]);
  };

  const handleSaveEdit = async (itemId: string) => {
    if (
      !editFormData?.employeeId ||
      !editFormData?.processId ||
      !editFormData?.followUpDate
    ) {
      toast.error('Please fill all required fields');
      return;
    }

    // Enhanced validation for edit
    const selectedEmployee = employeeOptions.find(
      (emp: any) => emp.value === editFormData.employeeId,
    );
    const selectedProcess = crmOptions.find(
      (proc: any) => proc.value === editFormData.processId,
    );
    const selectedEvent = eventOptions.find(
      (event: any) => event.value === selectedEventId,
    );

    if (!selectedEmployee) {
      toast.error('Selected employee is invalid.');
      return;
    }

    if (!selectedProcess) {
      toast.error('Selected process is invalid.');
      return;
    }

    if (!selectedEvent) {
      toast.error('Selected event is invalid.');
      return;
    }

    const employeeName = selectedEmployee.label;

    const base64Images: string[] = [];
    if (editUploadedFiles.length > 0) {
      for (const file of editUploadedFiles) {
        const base64 = await fileToBase64(file);
        base64Images.push(base64);
      }
    }

    // FIXED: Always send empty string instead of null for followupProcessId
    let followupProcessId = '';
    if (
      editFormData.followupProcessId &&
      editFormData.followupProcessId.trim() !== ''
    ) {
      const followupProcess = crmOptions.find(
        (c: any) => c.value === editFormData.followupProcessId,
      );
      if (followupProcess) {
        followupProcessId = editFormData.followupProcessId;
      } else {
        followupProcessId = '';
      }
    }

    const payload = {
      id: itemId,
      eventId: selectedEventId,
      employeeId: hasEmployees ? editFormData.employeeId : '',

      processId: editFormData.processId,
      note: editFormData.note || '',
      fullname: employeeName,
      followUpDate: editFormData.followUpDate,
      followupProcessId: followupProcessId, // Always a string
      images: base64Images,
      status: selectedStatus,
    };

    console.log('📤 EDIT PAYLOAD:', payload);

    updateEventCRM(payload, {
      onSuccess: () => {
        refetchHistory();
        setEditingRow(null);
        setEditFormData(null);
        setEditUploadedFiles([]);
        setEditFilePreviews([]);
        toast.success('CRM Process updated successfully!');
      },
      onError: (err: any) => {
        console.error('Update error:', err);
        const errorMsg =
          err.response?.data?.message || err.message || 'Update failed';
        toast.error(errorMsg);
      },
    });
  };

  const handleEditChange = (field: string, value: string) => {
    setEditFormData((prev) => (prev ? {...prev, [field]: value} : null));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      deleteEventCRMProcess(id, {
        onSuccess: () => {
          refetchHistory();
          toast.success('CRM process deleted successfully');
        },
        onError: (err: any) => {
          console.error('Delete error:', err);
          toast.error(err.message || 'Failed to delete process');
        },
      });
    }
  };

  const handleNewRowChange = (field: string, value: string) => {
    setNewRowData((prev) => {
      if (!prev) return null;

      const updated = {...prev, [field]: value};

      // Log the change for debugging
      if (field === 'followupProcessId') {
        console.log('🔧 Follow-up process changed:', value);
      }

      return updated;
    });
  };

  const handleAddNewRow = () => {
    console.log('Add row button clicked');
    console.log('🔍 NEW ROW DATA BEFORE SUBMISSION:', newRowData);

    if (
      !newRowData?.processId ||
      !newRowData?.followUpDate ||
      (hasEmployees && !newRowData?.employeeId)
    ) {
      setSubmitError('Please fill all required fields');
      return;
    }

    // Set all form values including followupProcessId
    setValue('processId', newRowData.processId);
    setValue('employeeId', hasEmployees ? newRowData.employeeId : '');
    setValue('note', newRowData.note || '');
    setValue('followUpDate', newRowData.followUpDate);
    setValue('followupProcessId', newRowData.followupProcessId || '');

    console.log('🔍 FORM VALUES SET:', {
      processId: newRowData.processId,
      employeeId: newRowData.employeeId,
      note: newRowData.note,
      followUpDate: newRowData.followUpDate,
      followupProcessId: newRowData.followupProcessId || '',
    });

    // Trigger form submission
    methods.handleSubmit(onSubmit)();
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // Get file icon based on file type
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type === 'application/pdf') return '📄';
    if (file.type.includes('word') || file.type.includes('document'))
      return '📝';
    return '📎';
  };

  // Truncate text for display
  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (isEventsLoading) {
    return <div className="p-12 text-center">Loading events…</div>;
  }

  if (!eventOptions.length) {
    return (
      <div className="p-12 text-center">
        <p className="text-xl">No events available</p>
        <p className="text-gray-500">Create an event first.</p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-4 pb-2 pt-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-6">
      {/* Image Popups */}
      {selectedImage && (
        <ImagePopup imageSrc={selectedImage} onClose={closeImagePopup} />
      )}

      {showImageGallery && (
        <ImageGallery images={selectedImages} onClose={closeImagePopup} />
      )}

      {/* Note Popup */}
      {showNotePopup && selectedNote && (
        <NotePopup
          note={selectedNote}
          onClose={closeNotePopup}
          title="Note Details"
          position={popupPosition}
        />
      )}

      {/* Reason Popup */}
      {showReasonPopup && selectedNote && (
        <NotePopup
          note={selectedNote}
          onClose={closeReasonPopup}
          title="Cancellation Reason"
          position={popupPosition}
        />
      )}

      {/* Back Button - Only show when adding new process */}
      {newRowData && (
        <div className="mb-4">
          <button
            onClick={handleCancelAdd}
            className="hover:text-primary-dark flex items-center gap-2 text-lg font-bold text-primary transition-colors"
          >
            <FiArrowLeft className="text-xl" />
            Back to Event CRM
          </button>
        </div>
      )}

      {/* Header Section - Compact with Separators */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Event Name */}
          <h2 className="text-gray-900 text-lg font-bold dark:text-white sm:text-xl">
            {selectedEventName || 'Select Event'}
          </h2>

          {/* Status and Conditional Information */}
          {selectedEventId && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Badge */}
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  currentEventStatus === 'FINALIZED'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : currentEventStatus === 'CANCELED'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                }`}
              >
                {currentEventStatus}
              </span>

              {/* Separator */}
              <span className="text-gray-400">•</span>

              {/* Conditional Information */}
              {currentEventStatus === 'FINALIZED' &&
                eventData?.data?.tentativeAmount && (
                  <span className="text-gray-700 dark:text-gray-300 text-lg">
                    ₹
                    {Math.floor(
                      eventData.data.tentativeAmount,
                    ).toLocaleString()}
                  </span>
                )}

              {currentEventStatus === 'CANCELED' &&
                eventData?.data?.cancelledReason && (
                  <button
                    onClick={(e) =>
                      handleReasonClick(eventData.data.cancelledReason, e)
                    }
                    className="max-w-[200px] truncate text-lg text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Click to view full reason"
                  >
                    {truncateText(eventData.data.cancelledReason, 30)}
                    {eventData.data.cancelledReason.length > 30 && (
                      <FiEye className="ml-1 inline h-3 w-3" />
                    )}
                  </button>
                )}

              {eventData?.data?.paidAmount && eventData.data.paidAmount > 0 && (
                <span className="text-lg text-green-600 dark:text-green-400">
                  ₹{eventData.data.paidAmount.toLocaleString()}
                </span>
              )}
              {eventData?.data?.client?.user?.fullname && (
                <>
                  <span className="text-gray-400">•</span>
                  <button
                    onClick={() =>
                      navigate({
                        to: '/clienthistory/$id',
                        params: {
                          id: eventData.data.clientId,
                        },
                      })
                    }
                    className="text-lg font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {eventData.data.client.user.fullname}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {selectedEventId && !newRowData && (
          <div className="flex items-center gap-2">
            <GenericButton
              onClick={handleAddNew}
              className="hover:bg-primary-dark flex items-center gap-2 rounded bg-primary px-3 py-2 text-xs font-medium text-white sm:px-4 sm:text-sm"
            >
              Add New Process
            </GenericButton>
          </div>
        )}
      </div>

      {/* Event Selection */}
      {!selectedEventId && (
        <div className="mb-6">
          <label className="text-gray-700 dark:text-gray-300 mb-2 block text-sm font-medium">
            Select Event
          </label>
          <SearchableDropdown
            options={eventOptions}
            onChange={handleEventSelect}
            value={selectedEventId}
            placeholder="Search events..."
          />
        </div>
      )}

      <FormProvider {...methods}>
        {/* CRM History Table */}
        {selectedEventId && (
          <div className="relative overflow-hidden rounded-lg border border-stroke dark:border-strokedark">
            {/* Cancel button when adding new */}
            {newRowData && (
              <div className="flex items-center justify-between bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
                <div className="text-blue-700 dark:text-blue-300">
                  <span className="font-medium">Adding New Process</span>
                  <span className="ml-2 text-sm">
                    - Fill in the details below
                  </span>
                </div>
                <button
                  onClick={handleCancelAdd}
                  className="flex items-center gap-2 rounded bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                >
                  <FiX className="text-sm" />
                  Cancel
                </button>
              </div>
            )}

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="px-4 py-3 font-medium text-black dark:text-white">
                      <button
                        onClick={toggleSortOrder}
                        className="flex items-center gap-1 transition-colors hover:text-primary"
                        title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                      >
                        Date & Time
                        {sortOrder === 'asc' ? (
                          <FiArrowUp className="text-xs" />
                        ) : (
                          <FiArrowDown className="text-xs" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium text-black dark:text-white">
                      Process
                    </th>
                    <th className="min-w-[200px] max-w-[300px] px-4 py-3 font-medium text-black dark:text-white">
                      Note
                    </th>
                    <th className="px-4 py-3 font-medium text-black dark:text-white">
                      Images
                    </th>
                    <th className="px-4 py-3 font-medium text-black dark:text-white">
                      Follow-up Date
                    </th>
                    <th className="px-4 py-3 font-medium text-black dark:text-white">
                      Follow-up Process
                    </th>
                    <th className="px-4 py-3 font-medium text-black dark:text-white">
                      Assign Employee
                    </th>
                    <th className="px-4 py-3 font-medium text-black dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Add new row - This will show when newRowData is set */}
                  {newRowData && (
                    <tr className="border-b border-stroke bg-blue-50/50 dark:border-strokedark dark:bg-blue-900/20">
                      <td className="text-gray-500 px-4 py-3 text-sm">New</td>
                      <td className="px-4 py-3">
                        <CustomSelect
                          options={crmOptions}
                          value={newRowData.processId || ''}
                          onChange={(val) =>
                            handleNewRowChange('processId', val)
                          }
                          placeholder="Select process"
                        />
                      </td>
                      <td className="min-w-[200px] max-w-[300px] px-4 py-3">
                        <textarea
                          value={newRowData.note || ''}
                          onChange={(e) =>
                            handleNewRowChange('note', e.target.value)
                          }
                          className="w-full rounded border border-stroke bg-transparent px-2 py-1 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                          placeholder="Enter note"
                          rows={2}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <label className="flex cursor-pointer items-center gap-2 text-blue-600 hover:text-blue-800">
                            <FiUpload className="text-sm" />
                            <span className="text-xs">Upload Files</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*,.pdf,.doc,.docx"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>

                          {uploadedFiles.length > 0 && (
                            <div className="max-h-20 space-y-1 overflow-y-auto">
                              {uploadedFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-100 flex items-center justify-between rounded px-2 py-1 text-xs"
                                >
                                  <div className="flex items-center gap-1">
                                    <span>{getFileIcon(file)}</span>
                                    <span className="max-w-20 truncate">
                                      {file.name}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <FiXCircle className="text-xs" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <TableCalendarPicker
                          value={
                            newRowData.followUpDate || getCurrentDateTime()
                          }
                          onChange={(dateString) =>
                            handleNewRowChange('followUpDate', dateString)
                          }
                          showTimeSelect={true}
                          minDate={new Date()}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <CustomSelect
                          options={crmOptions}
                          value={newRowData?.followupProcessId || ''}
                          onChange={(val) =>
                            handleNewRowChange('followupProcessId', val)
                          }
                          placeholder="Select follow-up process"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <CustomSelect
                          options={employeeOptions}
                          value={newRowData.employeeId || ''}
                          onChange={(val) =>
                            handleNewRowChange('employeeId', val)
                          }
                          disabled={!hasEmployees}
                          placeholder={
                            hasEmployees
                              ? 'Select employee'
                              : 'No employees available'
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleAddNewRow}
                            disabled={isSubmitting}
                            className="rounded bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                            title="Add"
                          >
                            {isSubmitting ? 'Adding...' : 'Add'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Existing rows */}
                  {crmHistory.map((item) => {
                    const isUpcoming = item.isUpcoming;
                    const isCurrent = item.isCurrent;

                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-stroke dark:border-strokedark ${
                          isCurrent
                            ? 'border-l-4 border-l-blue-500 bg-blue-50 dark:border-l-blue-400 dark:bg-blue-900/20'
                            : isUpcoming
                              ? 'border-l-4 border-l-yellow-500 bg-white dark:border-l-yellow-400 dark:bg-yellow-900/20'
                              : 'hover:bg-gray-50 dark:hover:bg-meta-4/50'
                        }`}
                      >
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            {isCurrent && (
                              <span
                                className="flex h-2 w-2 rounded-full bg-blue-500"
                                title="Most Recent Submission"
                              ></span>
                            )}
                            {isUpcoming && !isCurrent && (
                              <span
                                className="flex h-2 w-2 rounded-full bg-yellow-500"
                                title="Future Follow-up"
                              ></span>
                            )}
                            {formatDateTimeForDisplay(item.createdAt)}
                          </div>
                        </td>

                        {/* Process Column - Editable for ALL rows */}
                        <td className="px-4 py-3 text-sm">
                          {editingRow === item.id ? (
                            <CustomSelect
                              options={crmOptions}
                              value={editFormData?.processId || ''}
                              onChange={(val) =>
                                handleEditChange('processId', val)
                              }
                              placeholder="Select process"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              {item.processName}
                              {isCurrent && (
                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                  Current
                                </span>
                              )}
                              {isUpcoming && !isCurrent && (
                                <span className="0 dark:textgray-600 rounded-full bg-white px-2 py-1 text-xs text-black">
                                  Upcoming
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Note Column - Editable for ALL rows */}
                        <td className="min-w-[200px] max-w-[300px] px-4 py-3 text-sm">
                          {editingRow === item.id ? (
                            <textarea
                              value={editFormData?.note || ''}
                              onChange={(e) =>
                                handleEditChange('note', e.target.value)
                              }
                              className="w-full rounded border border-stroke bg-transparent px-2 py-1 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                              placeholder="Enter note"
                              rows={3}
                            />
                          ) : (
                            <button
                              onClick={(e) =>
                                handleNoteClick(item.note || '', e)
                              }
                              className="group w-full text-left"
                            >
                              <div className="max-h-20 overflow-hidden">
                                <p className="text-gray-700 dark:text-gray-300 break-words group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                  {truncateText(item.note, 100)}
                                </p>
                                {(item.note || '').length > 100 && (
                                  <div className="mt-1 flex items-center gap-1 text-xs text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                                    <FiEye className="h-3 w-3" />
                                    <span>Click to view full note</span>
                                  </div>
                                )}
                              </div>
                            </button>
                          )}
                        </td>

                        {/* Images Column - Editable for ALL rows */}
                        <td className="px-4 py-3 text-sm">
                          {editingRow === item.id ? (
                            <div className="space-y-2">
                              <label className="flex cursor-pointer items-center gap-2 text-blue-600 hover:text-blue-800">
                                <FiUpload className="text-sm" />
                                <span className="text-xs">
                                  Upload New Files
                                </span>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*,.pdf,.doc,.docx"
                                  onChange={handleEditFileUpload}
                                  className="hidden"
                                />
                              </label>
                              {item.images && item.images.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {item.images.map((image, imgIndex) => (
                                    <div
                                      key={imgIndex}
                                      className="group relative cursor-pointer"
                                      onClick={() =>
                                        handleImagesClick(item.images || [])
                                      }
                                    >
                                      <div className="border-gray-300 h-12 w-12 overflow-hidden rounded border transition-all group-hover:border-blue-500 group-hover:shadow-md">
                                        <img
                                          src={image}
                                          alt={`Document ${imgIndex + 1}`}
                                          className="h-full w-full object-cover"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {editUploadedFiles.length > 0 && (
                                <div className="max-h-20 space-y-1 overflow-y-auto">
                                  {editUploadedFiles.map((file, fileIndex) => (
                                    <div
                                      key={fileIndex}
                                      className="bg-gray-100 flex items-center justify-between rounded px-2 py-1 text-xs"
                                    >
                                      <div className="flex items-center gap-1">
                                        <span>{getFileIcon(file)}</span>
                                        <span className="max-w-20 truncate">
                                          {file.name}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeEditFile(fileIndex)
                                        }
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <FiXCircle className="text-xs" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : item.images && item.images.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {item.images.map((image, imgIndex) => (
                                <div
                                  key={imgIndex}
                                  className="group relative cursor-pointer"
                                  onClick={() =>
                                    handleImagesClick(item.images || [])
                                  }
                                >
                                  <div className="border-gray-300 h-12 w-12 overflow-hidden rounded border transition-all group-hover:border-blue-500 group-hover:shadow-md">
                                    <img
                                      src={image}
                                      alt={`Document ${imgIndex + 1}`}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        {/* Follow-up Date Column - Editable for ALL rows with Calendar Picker */}
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            {editingRow === item.id ? (
                              <TableCalendarPicker
                                value={
                                  editFormData?.followUpDate ||
                                  item.followUpDate
                                }
                                onChange={(dateString) =>
                                  handleEditChange('followUpDate', dateString)
                                }
                                showTimeSelect={true}
                                minDate={new Date()}
                              />
                            ) : (
                              <>
                                {formatDateTimeForDisplay(item.followUpDate)}
                                {isUpcoming && (
                                  <span
                                    className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                    title="Future Follow-up"
                                  >
                                    Upcoming
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </td>

                        {/* Follow-up Process Column - Editable for ALL rows */}
                        <td className="px-4 py-3 text-sm">
                          {editingRow === item.id ? (
                            <CustomSelect
                              options={crmOptions}
                              value={editFormData?.followupProcessId || ''}
                              onChange={(val) =>
                                handleEditChange('followupProcessId', val)
                              }
                              placeholder="Select follow-up process"
                            />
                          ) : (
                            item.followupProcessName ||
                            item.followupProcessId ||
                            '-'
                          )}
                        </td>

                        {/* Assign Employee Column - Editable for ALL rows */}
                        <td className="px-4 py-3 text-sm">
                          {editingRow === item.id ? (
                            <CustomSelect
                              options={employeeOptions}
                              value={editFormData?.employeeId || ''}
                              onChange={(val) =>
                                handleEditChange('employeeId', val)
                              }
                              placeholder="Select employee"
                            />
                          ) : (
                            item.employeeName
                          )}
                        </td>

                        {/* Actions Column - EDIT BUTTON FOR ALL ROWS */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {editingRow === item.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(item.id)}
                                  disabled={isUpdating}
                                  className="text-green-600 hover:text-green-800 disabled:opacity-50 dark:text-green-400 dark:hover:text-green-300"
                                  title="Save"
                                >
                                  <FiSave className="text-sm" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                  title="Cancel"
                                >
                                  <FiX className="text-sm" />
                                </button>
                              </>
                            ) : (
                              <>
                                {/* EDIT BUTTON FOR ALL ROWS - CHANGED FROM CONDITIONAL */}
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
                                  title="Edit"
                                >
                                  <FiEdit className="text-sm" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="hover:bg-gray-100 rounded p-1.5 dark:hover:bg-meta-4"
                                  title="Delete"
                                >
                                  <FiTrash2 className="text-sm" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {/* Add new card for mobile */}
              {newRowData && (
                <div className="border-b border-stroke bg-blue-50/50 p-4 dark:border-strokedark dark:bg-blue-900/20">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      New Process
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                        Process
                      </label>
                      <CustomSelect
                        options={crmOptions}
                        value={newRowData.processId || ''}
                        onChange={(val) => handleNewRowChange('processId', val)}
                        placeholder="Select process"
                      />
                    </div>
                    <div>
                      <label className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                        Note
                      </label>
                      <textarea
                        value={newRowData.note || ''}
                        onChange={(e) =>
                          handleNewRowChange('note', e.target.value)
                        }
                        className="w-full rounded border border-stroke bg-transparent px-2 py-1 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        placeholder="Enter note"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                        Files
                      </label>
                      <div className="space-y-2">
                        <label className="flex cursor-pointer items-center gap-2 text-blue-600 hover:text-blue-800">
                          <FiUpload className="text-sm" />
                          <span className="text-xs">Upload Files</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        {uploadedFiles.length > 0 && (
                          <div className="space-y-1">
                            {uploadedFiles.map((file, index) => (
                              <div
                                key={index}
                                className="bg-gray-100 flex items-center justify-between rounded px-2 py-1 text-xs"
                              >
                                <div className="flex items-center gap-1">
                                  <span>{getFileIcon(file)}</span>
                                  <span className="max-w-32 truncate">
                                    {file.name}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FiXCircle className="text-xs" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                        Follow-up Date
                      </label>
                      <TableCalendarPicker
                        value={newRowData.followUpDate || getCurrentDateTime()}
                        onChange={(dateString) =>
                          handleNewRowChange('followUpDate', dateString)
                        }
                        showTimeSelect={true}
                        minDate={new Date()}
                      />
                    </div>
                    <div>
                      <label className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                        Follow-up Process
                      </label>
                      <CustomSelect
                        options={crmOptions}
                        value={newRowData?.followupProcessId || ''}
                        onChange={(val) =>
                          handleNewRowChange('followupProcessId', val)
                        }
                        placeholder="Select follow-up process"
                      />
                    </div>
                    <div>
                      <label className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                        Employee
                      </label>
                      <CustomSelect
                        options={employeeOptions}
                        value={newRowData.employeeId || defaultEmployeeId}
                        onChange={(val) =>
                          handleNewRowChange('employeeId', val)
                        }
                        placeholder="Select employee"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleAddNewRow}
                        disabled={isSubmitting}
                        className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Adding...' : 'Add Process'}
                      </button>
                      <button
                        onClick={handleCancelAdd}
                        className="bg-gray-500 hover:bg-gray-600 rounded px-3 py-2 text-sm font-medium text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Existing items for mobile */}
              {crmHistory.map((item) => (
                <div
                  key={item.id}
                  className={`border-b border-stroke p-4 dark:border-strokedark ${
                    item.isCurrent
                      ? 'border-l-4 border-l-blue-500 bg-blue-50 dark:border-l-blue-400 dark:bg-blue-900/20'
                      : item.isUpcoming
                        ? 'border-l-4 border-l-yellow-500 bg-yellow-50 dark:border-l-yellow-400 dark:bg-yellow-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-meta-4/50'
                  }`}
                >
                  {/* Header with date and actions */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.isCurrent && (
                        <span
                          className="flex h-2 w-2 rounded-full bg-blue-500"
                          title="Most Recent Submission"
                        ></span>
                      )}
                      {item.isUpcoming && !item.isCurrent && (
                        <span
                          className="flex h-2 w-2 rounded-full bg-yellow-500"
                          title="Future Follow-up"
                        ></span>
                      )}
                      <span className="text-sm font-medium">
                        {formatDateTimeForDisplay(item.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {editingRow === item.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            disabled={isUpdating}
                            className="text-green-600 hover:text-green-800 disabled:opacity-50"
                            title="Save"
                          >
                            <FiSave className="text-sm" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-800"
                            title="Cancel"
                          >
                            <FiX className="text-sm" />
                          </button>
                        </>
                      ) : (
                        <>
                          {/* EDIT BUTTON FOR ALL ROWS ON MOBILE TOO */}
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <FiEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <FiTrash2 className="text-sm" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                        Process:
                      </span>
                      <span className="text-sm">{item.processName}</span>
                    </div>

                    <div>
                      <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                        Note:
                      </span>
                      <button
                        onClick={(e) => handleNoteClick(item.note || '', e)}
                        className="mt-1 w-full text-left"
                      >
                        <p className="text-gray-700 dark:text-gray-300 break-words text-sm hover:text-blue-600 dark:hover:text-blue-400">
                          {truncateText(item.note, 80)}
                        </p>
                        {(item.note || '').length > 80 && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-blue-600">
                            <FiEye className="h-3 w-3" />
                            <span>Tap to view full note</span>
                          </div>
                        )}
                      </button>
                    </div>

                    <div>
                      <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                        Follow-up Date:
                      </span>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm">
                          {formatDateTimeForDisplay(item.followUpDate)}
                        </span>
                        {item.isUpcoming && (
                          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                            Upcoming
                          </span>
                        )}
                      </div>
                    </div>

                    {item.followupProcessName && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                          Follow-up Process:
                        </span>
                        <span className="text-sm">
                          {item.followupProcessName}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                        Employee:
                      </span>
                      <span className="text-sm">{item.employeeName}</span>
                    </div>

                    {item.images && item.images.length > 0 && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                          Images:
                        </span>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {item.images.map((image, imgIndex) => (
                            <div
                              key={imgIndex}
                              className="group relative cursor-pointer"
                              onClick={() =>
                                handleImagesClick(item.images || [])
                              }
                            >
                              <div className="border-gray-300 h-12 w-12 overflow-hidden rounded border transition-all group-hover:border-blue-500 group-hover:shadow-md">
                                <img
                                  src={image}
                                  alt={`Document ${imgIndex + 1}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Edit Form for Mobile - ALL FIELDS EDITABLE */}
                  {editingRow === item.id && (
                    <div className="bg-gray-50 dark:bg-gray-800 mt-4 space-y-3 rounded-lg p-3">
                      <div>
                        <label className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                          Process
                        </label>
                        <CustomSelect
                          options={crmOptions}
                          value={editFormData?.processId || ''}
                          onChange={(val) => handleEditChange('processId', val)}
                          placeholder="Select process"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                          Note
                        </label>
                        <textarea
                          value={editFormData?.note || ''}
                          onChange={(e) =>
                            handleEditChange('note', e.target.value)
                          }
                          className="w-full rounded border border-stroke bg-transparent px-2 py-1 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                          placeholder="Enter note"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                          Add Files
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 text-blue-600 hover:text-blue-800">
                          <FiUpload className="text-sm" />
                          <span className="text-xs">Upload New Files</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={handleEditFileUpload}
                            className="hidden"
                          />
                        </label>
                        {editUploadedFiles.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {editUploadedFiles.map((file, fileIndex) => (
                              <div
                                key={fileIndex}
                                className="bg-gray-100 flex items-center justify-between rounded px-2 py-1 text-xs"
                              >
                                <div className="flex items-center gap-1">
                                  <span>{getFileIcon(file)}</span>
                                  <span className="max-w-32 truncate">
                                    {file.name}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeEditFile(fileIndex)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FiXCircle className="text-xs" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                          Follow-up Date
                        </label>
                        <TableCalendarPicker
                          value={
                            editFormData?.followUpDate || item.followUpDate
                          }
                          onChange={(dateString) =>
                            handleEditChange('followUpDate', dateString)
                          }
                          showTimeSelect={true}
                          minDate={new Date()}
                        />
                      </div>
                      <div>
                        <label className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                          Follow-up Process
                        </label>
                        <CustomSelect
                          options={crmOptions}
                          value={editFormData?.followupProcessId || ''}
                          onChange={(val) =>
                            handleEditChange('followupProcessId', val)
                          }
                          placeholder="Select follow-up process"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                          Employee
                        </label>
                        <CustomSelect
                          options={employeeOptions}
                          value={editFormData?.employeeId || ''}
                          onChange={(val) =>
                            handleEditChange('employeeId', val)
                          }
                          placeholder="Select employee"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedEventId && crmHistory.length === 0 && !newRowData && (
          <div className="bg-gray-50/50 rounded-lg border border-stroke py-12 text-center dark:border-strokedark dark:bg-meta-4/20">
            <h3 className="text-gray-900 mb-2 text-lg font-semibold dark:text-white">
              No CRM Processes Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Get started by adding your first CRM process for this event.
            </p>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-300">
              {submitError}
            </p>
          </div>
        )}
      </FormProvider>

      {/* Fixed Position Buttons */}
      {selectedEventId && currentEventStatus === 'ENQUIRY' && (
        <div className="fixed bottom-6 right-6 flex space-x-3">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 rounded-lg border border-red-600 bg-white px-4 py-3 text-sm font-medium text-red-600 shadow-lg transition-colors hover:bg-red-50 dark:bg-boxdark dark:text-red-400 dark:hover:bg-red-900/20 sm:px-6"
          >
            <FiCancel className="text-sm" />
            <span className="hidden sm:inline">Cancel</span>
          </button>
          <button
            onClick={handleFinalize}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-green-700 sm:px-6"
          >
            <FiCheckCircle className="text-sm" />
            <span className="hidden sm:inline">Finalize</span>
          </button>
        </div>
      )}

      {/* Finalize Modal */}
      {showFinalized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-gray-900 mb-4 text-xl font-bold">
              Finalize – {selectedEventName}
            </h3>
            <p className="text-gray-600 mb-4">
              Enter the tentative amount to finalize this event:
            </p>

            <div className="mb-6">
              <label className="text-gray-700 mb-2 block text-sm font-medium">
                Tentative Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={tentativeAmount}
                onChange={(e) => setTentativeAmount(e.target.value)}
                placeholder="e.g. 50000.00"
                className="border-gray-300 w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {!tentativeAmount && (
                <p className="mt-1 text-sm text-red-500">
                  Tentative amount is required
                </p>
              )}
              {tentativeAmount &&
                !/^\d+(\.\d{1,2})?$/.test(tentativeAmount) && (
                  <p className="mt-1 text-sm text-red-500">
                    Tentative amount must be a valid number with up to 2 decimal
                    places
                  </p>
                )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowFinalized(false);
                  setTentativeAmount('');
                }}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-lg px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitFinalize}
                disabled={
                  isFinalizeCancelSubmitting ||
                  !tentativeAmount ||
                  !/^\d+(\.\d{1,2})?$/.test(tentativeAmount)
                }
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {isFinalizeCancelSubmitting
                  ? 'Submitting...'
                  : 'Finalize Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-gray-900 mb-4 text-xl font-bold">
              Cancel – {selectedEventName}
            </h3>
            <p className="text-gray-600 mb-4">
              Please provide the reason for cancellation:
            </p>

            <div className="mb-6">
              <label className="text-gray-700 mb-2 block text-sm font-medium">
                Cancellation Reason *
              </label>
              <textarea
                value={cancelledReason}
                onChange={(e) => setCancelledReason(e.target.value)}
                placeholder="Enter detailed cancellation reason..."
                rows={4}
                className="border-gray-300 w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {!cancelledReason && (
                <p className="mt-1 text-sm text-red-500">
                  Cancellation reason is required
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCancel(false);
                  setCancelledReason('');
                }}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-lg px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCancel}
                disabled={isFinalizeCancelSubmitting || !cancelledReason.trim()}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isFinalizeCancelSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainEventCRMPage;
