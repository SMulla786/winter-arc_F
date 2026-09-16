import React, {useState} from 'react';
import {useAuthContext} from '@/context/AuthContext';
import {
  useCreateQuotationDesign,
  useGetQuatationUploadImg,
} from '@/lib/react-query/queriesAndMutations/cateror/quatation';
import TemplatePage from './TemplatePage';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import toast from 'react-hot-toast';

const ImageUpload = () => {
  const [color, setColor] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  console.log('imageFile', imageFile);
  const [image, setImage] = useState<string | null>(null);
  const [template, setTemplate] = useState<string | null>(null);
  console.log('template', template);
  const [response, setResponse] = useState<{
    color: string;
    imageUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const {user} = useAuthContext();
  const id = user?.caterorId ?? '';

  const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setColor(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      // More flexible validation focusing on size limits
      const isMinSizeValid = img.width >= 800 && img.height >= 150;
      const isMaxSizeValid = img.width <= 3250 && img.height <= 600;

      // Calculate aspect ratio for guidance (but not strict validation)
      const aspectRatio = (img.width / img.height).toFixed(2);
      const isReasonableAspectRatio =
        img.width / img.height >= 3 && img.width / img_height <= 7;

      if (isMinSizeValid && isMaxSizeValid && isReasonableAspectRatio) {
        setImageFile(file);
      } else {
        alert(`Please ensure your image meets these requirements:
• Minimum: 800×150 pixels
• Maximum: 3250×600 pixels  
• Reasonable banner aspect ratio (width should be significantly greater than height)

Your image: ${img.width}×${img.height} pixels (ratio: ${aspectRatio})
Recommended: 1200×300 to 3250×600 pixels`);
        e.target.value = '';
        setImageFile(null);
      }

      URL.revokeObjectObjectURL(img.src);
    };
  };

  const handleImageSelect = (id: string) => {
    setSelectedImage(id);
  };

  const {mutateAsync: createQuotationDesign} = useCreateQuotationDesign();

  const {data: AllImages} = useGetQuatationUploadImg();
  console.log('uplodssss', AllImages);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    if (imageFile) {
      setTemplate(null);
      formData.append('imageFile', imageFile);
    }

    if (template && !imageFile) {
      formData.append('image', template);
    }

    formData.append('color', color);

    setLoading(true);

    try {
      const responseData = await createQuotationDesign(formData);
      setResponse({
        imageUrl: responseData?.quatationDesign,
        color: responseData?.quotationColor,
      });
      toast.success('Successfully submitted!');
    } catch (err) {
      console.error('Error uploading image:', err);
      setResponse(null);
      toast.error('Upload failed. Please try again.');
    } finally {
      setLoading(false);
      setImageFile(null);
      setTemplate(null);
    }
  };

  return (
    <div className="rounded-md bg-white p-8 dark:bg-black">
      <form onSubmit={onSubmit} className="flex flex-col space-y-6">
        <div className="mb-6 flex items-center space-x-4">
          <div className="flex w-1/2 flex-col">
            <label className="font-medium">Upload Banner Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block h-12 w-full rounded-md p-2"
            />
            <p className="text-gray-500 mt-1 text-sm">
              Size: 800×150 to 3250×600 pixels
              <br />
              Your 3240×537 image should work now
            </p>
          </div>

          <div className="flex w-1/2 flex-col">
            <label className="font-medium">Select Color:</label>
            <select
              value={color}
              onChange={handleColorChange}
              className="h-10 w-full rounded-md border bg-white px-3 py-2 dark:bg-black"
            >
              <option value="">Select a color</option>
              <option value="red">Red</option>
              <option value="green">Green</option>
              <option value="blue-900">Blue</option>
              <option value="yellow">Yellow</option>
              <option value="orange">Orange</option>
              <option value="purple">Purple</option>
              <option value="pink">Pink</option>
              <option value="brown">Brown</option>
              <option value="gray">Gray</option>
              <option value="black">Black</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <TemplatePage template={template} setTemplate={setTemplate} />
        </div>

        <div className="flex justify-end pt-4">
          <GenericButton type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </GenericButton>
        </div>
      </form>
    </div>
  );
};

export default ImageUpload;
