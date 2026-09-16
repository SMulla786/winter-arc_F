/* eslint-disable @typescript-eslint/no-explicit-any */
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
import {Link, useNavigate} from '@tanstack/react-router';
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
  FiMenu,
  FiMoreVertical,
  FiDollarSign,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// Updated Zod schema with followupProcessId
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

interface EventCRMProps {
  id?: string;
  name?: string;
  status?: string;
}

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
      <div className="relative max-h-[90vh] max-w-[90vw]">
        <img
          src={imageSrc}
          alt="Preview"
          className="max-h-[80vh] max-w-full rounded-lg object-contain"
        />
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 rounded-full bg-red-600 p-2 text-white transition-colors hover:bg-red-700 sm:-right-12 sm:top-0"
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
            <FiArrowDown className="rotate-90 text-xl" />
          </button>
        </div>

        <img
          src={images[currentIndex]}
          alt={`Preview ${currentIndex + 1}`}
          className="mt-4 max-h-[70vh] max-w-full rounded-lg object-contain"
        />

        <button
          onClick={onClose}
          className="absolute -top-12 right-0 rounded-full bg-red-600 p-2 text-white transition-colors hover:bg-red-700 sm:-right-12 sm:top-0"
        >
          <FiX className="text-xl" />
        </button>
      </div>
    </div>
  );
};

// Mobile Card View Component
interface MobileCRMCardProps {
  item: CRMHistory;
  index: number;
  sortOrder: 'asc' | 'desc';
  isEditing: boolean;
  editFormData: Partial<CRMHistory> | null;
  editUploadedFiles: File[];
  editFilePreviews: string[];
  crmOptions: Array<{value: string; label: string}>;
  employeeOptions: Array<{value: string; label: string}>;
  onEdit: (item: CRMHistory) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onEditChange: (field: string, value: string) => void;
  onEditFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveEditFile: (index: number) => void;
  onImageClick: (imageSrc: string) => void;
  onImagesClick: (images: string[]) => void;
  isUpdating: boolean;
}

const MobileCRMCard: React.FC<MobileCRMCardProps> = ({
  item,
  index,
  sortOrder,
  isEditing,
  editFormData,
  editUploadedFiles,
  editFilePreviews,
  crmOptions,
  employeeOptions,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onEditChange,
  onEditFileUpload,
  onRemoveEditFile,
  onImageClick,
  onImagesClick,
  isUpdating,
}) => {
  const [showActions, setShowActions] = useState(false);

  // In MobileCRMCard component, update the isMostRecent logic:
  const hasFutureFollowUp = () => {
    if (!item.followUpDate) return false;
    const followUpDate = new Date(item.followUpDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return followUpDate > today;
  };
  const isMostRecent =
    index === 0 && sortOrder === 'desc' && !hasFutureFollowUp();

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type === 'application/pdf') return '📄';
    if (file.type.includes('word') || file.type.includes('document'))
      return '📝';
    return '📎';
  };

  return (
    <div
      className={`rounded-lg border border-stroke p-4 dark:border-strokedark ${
        isMostRecent
          ? 'border-l-4 border-l-blue-500 bg-blue-50 dark:border-l-blue-400 dark:bg-blue-900/20'
          : hasFutureFollowUp()
            ? 'border-l-4 border-l-yellow-500 bg-yellow-50 dark:border-l-yellow-400 dark:bg-yellow-900/20'
            : 'bg-gray-50 dark:bg-meta-4/20'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            {isMostRecent && (
              <span
                className="flex h-2 w-2 rounded-full bg-blue-500"
                title="Most Recent Submission"
              ></span>
            )}
            {hasFutureFollowUp() && !isMostRecent && (
              <span
                className="flex h-2 w-2 rounded-full bg-yellow-500"
                title="Future Follow-up"
              ></span>
            )}
            <span className="text-gray-900 text-sm font-medium dark:text-white">
              {formatDateTimeForDisplay(item.createdAt)}
            </span>
          </div>

          {isMostRecent && (
            <span className="mb-2 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              Current
            </span>
          )}
          {hasFutureFollowUp() && (
            <span className="mb-2 inline-block rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
              Upcoming
            </span>
          )}
        </div>

        {!isEditing && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <FiMoreVertical className="text-lg" />
            </button>
            {showActions && (
              <div className="absolute right-0 top-8 z-10 w-32 rounded-md border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark">
                <button
                  onClick={() => {
                    onEdit(item);
                    setShowActions(false);
                  }}
                  className="hover:bg-gray-100 flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-blue-600 dark:text-blue-400 dark:hover:bg-meta-4"
                >
                  <FiEdit className="text-sm" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(item.id);
                    setShowActions(false);
                  }}
                  className="hover:bg-gray-100 flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 dark:hover:bg-meta-4"
                >
                  <FiTrash2 className="text-sm" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Process */}
        <div>
          <label className="text-gray-600 dark:text-gray-400 text-xs font-medium">
            Process
          </label>
          {isEditing ? (
            <CustomSelect
              options={crmOptions}
              value={editFormData?.processId || ''}
              onChange={(val) => onEditChange('processId', val)}
              placeholder="Select process"
            />
          ) : (
            <p className="text-gray-900 text-sm dark:text-white">
              {item.processName}
            </p>
          )}
        </div>

        {/* Note */}
        <div>
          <label className="text-gray-600 dark:text-gray-400 text-xs font-medium">
            Note
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editFormData?.note || ''}
              onChange={(e) => onEditChange('note', e.target.value)}
              className="w-full rounded border border-stroke bg-transparent px-2 py-1 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              placeholder="Enter note"
            />
          ) : (
            <p className="text-gray-900 text-sm dark:text-white">
              {item.note || 'N/A'}
            </p>
          )}
        </div>

        {/* Employee */}
        <div>
          <label className="text-gray-600 dark:text-gray-400 text-xs font-medium">
            Assign Employee
          </label>
          {isEditing ? (
            <CustomSelect
              options={employeeOptions}
              value={editFormData?.employeeId || ''}
              onChange={(val) => onEditChange('employeeId', val)}
              placeholder="Select employee"
            />
          ) : (
            <p className="text-gray-900 text-sm dark:text-white">
              {item.employeeName}
            </p>
          )}
        </div>

        {/* Follow-up Date */}
        <div>
          <label className="text-gray-600 dark:text-gray-400 text-xs font-medium">
            Follow-up Date
          </label>
          <p className="text-gray-900 text-sm dark:text-white">
            {formatDateTimeForDisplay(item.followUpDate)}
          </p>
        </div>

        {/* Follow-up Process */}
        {item.followupProcessName && (
          <div>
            <label className="text-gray-600 dark:text-gray-400 text-xs font-medium">
              Follow-up Process
            </label>
            <p className="text-gray-900 text-sm dark:text-white">
              {item.followupProcessName}
            </p>
          </div>
        )}

        {/* Images */}
        <div>
          <label className="text-gray-600 dark:text-gray-400 text-xs font-medium">
            Images/Documents
          </label>
          {isEditing ? (
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2 text-blue-600 hover:text-blue-800">
                <FiUpload className="text-sm" />
                <span className="text-xs">Upload New Files</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={onEditFileUpload}
                  className="hidden"
                />
              </label>
              {item.images && item.images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.images.map((image, imgIndex) => (
                    <div
                      key={imgIndex}
                      className="group relative cursor-pointer"
                      onClick={() => onImagesClick(item.images || [])}
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
                <div className="space-y-1">
                  {editUploadedFiles.map((file, fileIndex) => (
                    <div
                      key={fileIndex}
                      className="bg-gray-100 flex items-center justify-between rounded px-2 py-1 text-xs"
                    >
                      <div className="flex items-center gap-1">
                        <span>{getFileIcon(file)}</span>
                        <span className="max-w-20 truncate">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveEditFile(fileIndex)}
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
                  onClick={() => onImagesClick(item.images || [])}
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
            <p className="text-gray-400 text-sm">-</p>
          )}
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onSaveEdit(item.id)}
              disabled={isUpdating}
              className="flex-1 rounded bg-green-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onCancelEdit}
              className="flex-1 rounded bg-red-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Get current date and time in local format for datetime-local input
const getCurrentDateTime = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Format date with time for display
const formatDateTimeForDisplay = (dateInput: any): string => {
  if (!dateInput) return 'N/A';
  try {
    if (typeof dateInput === 'string') {
      if (dateInput.includes('/')) return dateInput;
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

// File to Base64 conversion
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
  });
};

// File validation
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
      return `File "${file.name}" type not supported. Allowed: JPEG, PNG, GIF, WebP, PDF, DOC, DOCX`;
    }
    if (file.size > maxSize) {
      return `File "${file.name}" is too large. Maximum size is 5MB`;
    }
  }
  return null;
};

// Custom Select Component to replace GenericDropdown
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

const EventCRM: React.FC<EventCRMProps> = () => {
  const navigate = useNavigate();
  const search = useSearch({to: '/crmadd'});
  // Safe search params access
  const searchParams = search as any;
  const eventId = searchParams?.eventId || '';
  const eventName = searchParams?.eventName || '';

  const [selectedEventId, setSelectedEventId] = useState<string>(eventId);
  const [selectedEventName, setSelectedEventName] = useState<string>(eventName);
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
  const [isMobileView, setIsMobileView] = useState(false);

  // Finalize and Cancel states
  const [showFinalized, setShowFinalized] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [tentativeAmount, setTentativeAmount] = useState('');
  const [cancelledReason, setCancelledReason] = useState('');

  // Image popup states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showImageGallery, setShowImageGallery] = useState(false);

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

  // Check mobile view on resize and initial load
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Queries
  const {data: eventsData, isLoading: isEventsLoading} = useGetAllEventsCrm();
  const {data: crmData} = useGetCRMData();
  const {data: employeesData} = useGetAllEmployee();
  const {mutate: addEventCRM} = useAddEventCRM();
  console.log('sdafasfda', crmData);
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

  // Get first employee as default
  const defaultEmployeeId = useMemo(() => {
    return employeeOptions.length > 0 ? employeeOptions[0].value : '';
  }, [employeeOptions]);

  // Safe CRM History Data with sorting and image processing
  const crmHistory: CRMHistory[] = useMemo(() => {
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

      // First, find the most recent non-upcoming item to mark as current
      const now = new Date();
      const nonUpcomingItems = history.filter(
        (item) => !item.followUpDate || new Date(item.followUpDate) <= now,
      );

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
          const aIsUpcoming = a.followUpDate && new Date(a.followUpDate) > now;
          const bIsUpcoming = b.followUpDate && new Date(b.followUpDate) > now;

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
    if (eventId && eventId !== 'undefined') {
      setSelectedEventId(eventId);
      if (eventName) {
        setSelectedEventName(eventName);
      }
    }
  }, [eventId, eventName]);

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
    const opt = eventOptions.find((o) => o.value === val);
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

  // Handle back navigation
  const handleBack = () => {
    navigate({to: '/eventcrm'});
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
      // REMOVE: toast.error('Please select an event');
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
      // REMOVE: toast.error(errorMsg);
      return;
    }

    // Enhanced validation that selected options exist in our options
    const selectedEmployee = employeeOptions.find(
      (emp) => emp.value === data.employeeId,
    );
    const selectedProcess = crmOptions.find(
      (proc) => proc.value === data.processId,
    );

    if (!selectedEmployee) {
      setSubmitError(
        'Selected employee is invalid. Please choose a different employee.',
      );
      // REMOVE: toast.error('Selected employee is invalid. Please choose a different employee.');
      return;
    }

    if (!selectedProcess) {
      setSubmitError(
        'Selected process is invalid. Please choose a different process.',
      );
      // REMOVE: toast.error('Selected process is invalid. Please choose a different process.');
      return;
    }

    // Validate event exists
    const selectedEvent = eventOptions.find(
      (event) => event.value === selectedEventId,
    );

    if (!selectedEvent) {
      setSubmitError(
        'Selected event is invalid. Please refresh and try again.',
      );
      // REMOVE: toast.error('Selected event is invalid. Please refresh and try again.');
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

      // FIX: Make sure we're using the form data, not newRowData for followupProcessId
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

      // console.log('📤 FINAL PAYLOAD WITH FOLLOW-UP PROCESS:', payload);

      addEventCRM(payload, {
        onSuccess: (response) => {
          // console.log('✅ SUCCESS:', response);
          reset();
          setSelectedStatus('ENQUIRY');
          setNewRowData(null);
          setUploadedFiles([]);
          setFilePreviews([]);
          refetchHistory();
          // KEEP ONLY THIS TOAST - remove all others
          // toast.success('CRM Process added successfully!');
        },
        onError: (err: any) => {
          console.error('❌ SUBMISSION ERROR:', err);
          const errorMsg =
            err.response?.data?.message || err.message || 'Submission failed';
          setSubmitError(errorMsg);
          // REMOVE: toast.error(errorMsg);
        },
        onSettled: () => setIsSubmitting(false),
      });
    } catch (e) {
      console.error('💥 SUBMISSION FAILED:', e);
      const errorMsg = 'Submission failed: ' + (e as Error).message;
      setSubmitError(errorMsg);
      setIsSubmitting(false);
      // REMOVE: toast.error('Submission failed');
    }
  };

  const handleAddNew = () => {
    console.log('Add new button clicked');

    // Check if we have required options
    if (employeeOptions.length === 0) {
      toast.error('No employees available. Please add employees first.');
      return;
    }

    if (crmOptions.length === 0) {
      toast.error('No processes available. Please add CRM processes first.');
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

  // Edit functionality
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
      // REMOVE: toast.error('Please fill all required fields');
      return;
    }

    // Enhanced validation for edit
    const selectedEmployee = employeeOptions.find(
      (emp) => emp.value === editFormData.employeeId,
    );
    const selectedProcess = crmOptions.find(
      (proc) => proc.value === editFormData.processId,
    );
    const selectedEvent = eventOptions.find(
      (event) => event.value === selectedEventId,
    );

    if (!selectedEmployee) {
      // REMOVE: toast.error('Selected employee is invalid. Please choose a different employee.');
      return;
    }

    if (!selectedProcess) {
      // REMOVE: toast.error('Selected process is invalid. Please choose a different process.');
      return;
    }

    if (!selectedEvent) {
      // REMOVE: toast.error('Selected event is invalid. Please refresh and try again.');
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
      employeeId: editFormData.employeeId,
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
        // KEEP ONLY THIS TOAST - remove others
        // toast.success('CRM Process updated successfully!');
      },
      onError: (err: any) => {
        console.error('Update error:', err);
        const errorMsg =
          err.response?.data?.message || err.message || 'Update failed';
        // REMOVE: toast.error(errorMsg);
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
          // KEEP ONLY THIS TOAST - remove others
          // toast.success('CRM process deleted successfully');
        },
        onError: (err: any) => {
          console.error('Delete error:', err);
          // REMOVE: toast.error(err.message || 'Failed to delete process');
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
    if (
      !newRowData?.processId ||
      !newRowData?.employeeId ||
      !newRowData?.followUpDate
    ) {
      setSubmitError('Please fill all required fields');
      return;
    }

    // Instead of setting form values and triggering submit, call onSubmit directly
    const formData: FormValues = {
      processId: newRowData.processId,
      employeeId: newRowData.employeeId,
      note: newRowData.note || '',
      followUpDate: newRowData.followUpDate,
      followupProcessId: newRowData.followupProcessId || '',
      documents: watchDocuments, // Use the already watched documents
    };

    // Call onSubmit directly instead of triggering form submission
    onSubmit(formData);
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

  // Format date for datetime-local input
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return getCurrentDateTime();
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return getCurrentDateTime();
      return date.toISOString().slice(0, 16);
    } catch (error) {
      return getCurrentDateTime();
    }
  };

  if (isEventsLoading) {
    return <div className="p-4 text-center sm:p-12">Loading events…</div>;
  }

  if (!eventOptions.length) {
    return (
      <div className="p-4 text-center sm:p-12">
        <p className="text-lg sm:text-xl">No events available</p>
        <p className="text-gray-500">Create an event first.</p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-2 pb-2 pt-2 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-6 sm:pt-4">
      {/* Image Popups */}
      {selectedImage && (
        <ImagePopup imageSrc={selectedImage} onClose={closeImagePopup} />
      )}

      {showImageGallery && (
        <ImageGallery images={selectedImages} onClose={closeImagePopup} />
      )}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="hover:text-primary-dark flex items-center gap-2 text-base font-bold text-primary transition-colors sm:text-lg"
        >
          <FiArrowLeft className="text-lg sm:text-xl" />
          <span className="hidden sm:inline">Back to CRM Dashboard</span>
          <span className="sm:hidden">Back</span>
        </button>

        {selectedEventId && (
          <Link
            to={`/events/${selectedEventId}`}
            params={{id: selectedEventId}}
            className="text-sm text-blue-600 underline transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Click here to view Income & Expenditure details
          </Link>
        )}
      </div>
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
                  <span className="max-w-[200px] truncate text-lg text-red-600 dark:text-red-400">
                    {eventData.data.cancelledReason}
                  </span>
                )}

              {eventData?.data?.paidAmount && eventData.data.paidAmount > 0 && (
                <span className="text-lg text-green-600 dark:text-green-400">
                  ₹{eventData.data.paidAmount.toLocaleString()}
                </span>
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
        {/* CRM History - Mobile Card View */}
        {selectedEventId && isMobileView && (
          <div className="space-y-4">
            {/* Add New Card */}
            {newRowData && (
              <div className="rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-4 dark:bg-blue-900/20">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Adding New Process
                  </h3>
                  <button
                    onClick={handleCancelAdd}
                    className="flex items-center gap-1 rounded bg-red-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-red-600"
                  >
                    <FiX className="text-xs" />
                    Cancel
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Process */}
                  <div>
                    <label className="text-gray-700 mb-1 block text-xs font-medium">
                      Process *
                    </label>
                    <CustomSelect
                      options={crmOptions}
                      value={newRowData.processId || ''}
                      onChange={(val) => handleNewRowChange('processId', val)}
                      placeholder="Select process"
                    />
                  </div>

                  {/* Employee */}
                  <div>
                    <label className="text-gray-700 mb-1 block text-xs font-medium">
                      Assign Employee *
                    </label>
                    <CustomSelect
                      options={employeeOptions}
                      value={newRowData.employeeId || defaultEmployeeId}
                      onChange={(val) => handleNewRowChange('employeeId', val)}
                      placeholder="Select employee"
                    />
                  </div>

                  {/* Note */}
                  <div>
                    <label className="text-gray-700 mb-1 block text-xs font-medium">
                      Note
                    </label>
                    <input
                      type="text"
                      value={newRowData.note || ''}
                      onChange={(e) =>
                        handleNewRowChange('note', e.target.value)
                      }
                      className="w-full rounded border border-stroke bg-transparent px-2 py-1 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      placeholder="Enter note"
                    />
                  </div>

                  {/* Follow-up Date */}
                  <div>
                    <label className="text-gray-700 mb-1 block text-xs font-medium">
                      Follow-up Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={newRowData.followUpDate || getCurrentDateTime()}
                      onChange={(e) =>
                        handleNewRowChange('followUpDate', e.target.value)
                      }
                      className="w-full rounded border border-stroke bg-transparent px-2 py-1 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>

                  {/* Follow-up Process */}
                  <div>
                    <label className="text-gray-700 mb-1 block text-xs font-medium">
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

                  {/* File Upload */}
                  <div>
                    <label className="text-gray-700 mb-1 block text-xs font-medium">
                      Documents
                    </label>
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
                      <div className="mt-2 space-y-1">
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

                  {/* Submit Button */}
                  <button
                    onClick={handleAddNewRow}
                    disabled={isSubmitting}
                    className="w-full rounded bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Process'}
                  </button>
                </div>
              </div>
            )}

            {/* History Cards */}
            {crmHistory.map((item, index) => (
              <MobileCRMCard
                key={item.id}
                item={item}
                index={index}
                sortOrder={sortOrder}
                isEditing={editingRow === item.id}
                editFormData={editFormData}
                editUploadedFiles={editUploadedFiles}
                editFilePreviews={editFilePreviews}
                crmOptions={crmOptions}
                employeeOptions={employeeOptions}
                onEdit={handleEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onDelete={handleDelete}
                onEditChange={handleEditChange}
                onEditFileUpload={handleEditFileUpload}
                onRemoveEditFile={removeEditFile}
                onImageClick={handleImageClick}
                onImagesClick={handleImagesClick}
                isUpdating={isUpdating}
              />
            ))}
          </div>
        )}

        {/* CRM History - Desktop Table View */}
        {selectedEventId && !isMobileView && (
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
                  <th className="px-4 py-3 font-medium text-black dark:text-white">
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
                        onChange={(val) => handleNewRowChange('processId', val)}
                        placeholder="Select process"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={newRowData.note || ''}
                        onChange={(e) =>
                          handleNewRowChange('note', e.target.value)
                        }
                        className="w-full rounded border border-stroke bg-transparent px-2 py-1 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        placeholder="Enter note"
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
                      <input
                        type="datetime-local"
                        value={newRowData.followUpDate || getCurrentDateTime()}
                        onChange={(e) =>
                          handleNewRowChange('followUpDate', e.target.value)
                        }
                        className="w-full rounded border border-stroke bg-transparent px-2 py-1 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
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
                        value={newRowData.employeeId || defaultEmployeeId}
                        onChange={(val) =>
                          handleNewRowChange('employeeId', val)
                        }
                        placeholder="Select employee"
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
                {crmHistory.map((item, index) => {
                  const isUpcoming =
                    item.followUpDate &&
                    new Date(item.followUpDate) > new Date();
                  const isCurrent = item.isCurrent; // Use the property from the sorted array

                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-stroke dark:border-strokedark ${
                        isCurrent
                          ? 'border-l-4 border-l-blue-500 bg-blue-50 dark:border-l-blue-400 dark:bg-blue-900/20'
                          : isUpcoming
                            ? 'border-l-4 border-l-yellow-500 bg-yellow-50 dark:border-l-yellow-400 dark:bg-yellow-900/20'
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

                      {/* Process Column - Editable */}
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
                              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                Upcoming
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Note Column - Editable */}
                      <td className="max-w-xs px-4 py-3 text-sm">
                        {editingRow === item.id ? (
                          <input
                            type="text"
                            value={editFormData?.note || ''}
                            onChange={(e) =>
                              handleEditChange('note', e.target.value)
                            }
                            className="w-full rounded border border-stroke bg-transparent px-2 py-1 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                            placeholder="Enter note"
                          />
                        ) : (
                          <span className="truncate">{item.note || 'N/A'}</span>
                        )}
                      </td>

                      {/* Images Column - Editable */}
                      <td className="px-4 py-3 text-sm">
                        {editingRow === item.id ? (
                          <div className="space-y-2">
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
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all group-hover:bg-opacity-30">
                                      <FiImage className="text-white opacity-0 transition-opacity group-hover:opacity-100" />
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
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all group-hover:bg-opacity-30">
                                  <FiImage className="text-white opacity-0 transition-opacity group-hover:opacity-100" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* Follow-up Date Column - NOT Editable in edit mode */}
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {editingRow === item.id ? (
                            <span className="text-gray-700 dark:text-gray-300">
                              {formatDateTimeForDisplay(item.followUpDate)}
                            </span>
                          ) : (
                            <>
                              {formatDateTimeForDisplay(item.followUpDate)}
                              {new Date(item.followUpDate) > new Date() &&
                                item.followUpDate && (
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

                      {/* Follow-up Process Column - NOT Editable in edit mode */}
                      <td className="px-4 py-3 text-sm">
                        {editingRow === item.id ? (
                          <span className="text-gray-700 dark:text-gray-300">
                            {item.followupProcessName ||
                              item.followupProcessId ||
                              '-'}
                          </span>
                        ) : (
                          item.followupProcessName ||
                          item.followupProcessId ||
                          '-'
                        )}
                      </td>

                      {/* Assign Employee Column - Editable */}
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

                      {/* Actions Column */}
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
        )}

        {/* Empty State */}
        {selectedEventId && crmHistory.length === 0 && !newRowData && (
          <div className="bg-gray-50/50 rounded-lg border border-stroke py-8 text-center dark:border-strokedark dark:bg-meta-4/20 sm:py-12">
            <h3 className="text-gray-900 mb-2 text-base font-semibold dark:text-white sm:text-lg">
              No CRM Processes Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm sm:text-base">
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
        <div className="fixed bottom-4 right-4 flex flex-col-reverse gap-2 sm:bottom-6 sm:right-6 sm:flex-row sm:space-x-3">
          <button
            onClick={handleCancel}
            className="flex items-center justify-center gap-2 rounded-lg border border-red-600 bg-white px-4 py-3 text-sm font-medium text-red-600 shadow-lg transition-colors hover:bg-red-50 dark:bg-boxdark dark:text-red-400 dark:hover:bg-red-900/20 sm:px-6"
          >
            <FiCancel className="text-sm" />
            <span className="sm:hidden">Cancel</span>
            <span className="hidden sm:inline">Cancel Event</span>
          </button>
          <button
            onClick={handleFinalize}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-green-700 sm:px-6"
          >
            <FiCheckCircle className="text-sm" />
            <span className="sm:hidden">Finalize</span>
            <span className="hidden sm:inline">Finalize Event</span>
          </button>
        </div>
      )}

      {/* Finalize Modal */}
      {showFinalized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:p-6">
            <h3 className="text-gray-900 mb-4 text-lg font-bold sm:text-xl">
              Finalize – {selectedEventName}
            </h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
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
                className="border-gray-300 w-full rounded-lg border p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-base"
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

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end sm:space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowFinalized(false);
                  setTentativeAmount('');
                }}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400 order-2 rounded-lg px-4 py-2 sm:order-1"
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
                className="order-1 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50 sm:order-2"
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
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:p-6">
            <h3 className="text-gray-900 mb-4 text-lg font-bold sm:text-xl">
              Cancel – {selectedEventName}
            </h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
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
                className="border-gray-300 w-full rounded-lg border p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-base"
              />
              {!cancelledReason && (
                <p className="mt-1 text-sm text-red-500">
                  Cancellation reason is required
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end sm:space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCancel(false);
                  setCancelledReason('');
                }}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400 order-2 rounded-lg px-4 py-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCancel}
                disabled={isFinalizeCancelSubmitting || !cancelledReason.trim()}
                className="order-1 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50 sm:order-2"
              >
                {isFinalizeCancelSubmitting ? 'Submitting...' : 'Cancel Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCRM;
