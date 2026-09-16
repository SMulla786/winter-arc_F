import React, {useState} from 'react';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {useAuthContext} from '@/context/AuthContext';
import toast from 'react-hot-toast';
import {
  useCreateWebsiteContent,
  useUpdateWebsiteContent,
} from '@/lib/react-query/queriesAndMutations/cateror/website';

const WebsiteContentPage = () => {
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  const [experienceDescription, setExperienceDescription] = useState('');
  const [reviews, setReviews] = useState([
    {name: '', description: '', role: ''},
  ]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [orderImage, setOrderImage] = useState<File | null>(null);
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

  const handleHeroImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      setImageFile(file);
      if (file) {
        formData.append('imageFile', file);
      }
      try {
        const responseData = await createWebsiteContent(formData);
        // setResponse({
        //   imageUrl: responseData?.websiteContent,
        //   color: responseData?.websiteColor,
        // });
        toast.success('Successfully submitted!');
      } catch (err) {
        console.error('Error uploading image:', err);
        setResponse(null);
        toast.error('Upload failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOrderImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOrderImage(file);
    }
  };

  const handleReviewChange = (
    index: number,
    field: 'name' | 'description' | 'role',
    value: string,
  ) => {
    const newReviews = [...reviews];
    newReviews[index][field] = value;
    setReviews(newReviews);
  };

  const addReviewField = () => {
    setReviews([...reviews, {name: '', description: '', role: ''}]);
  };

  const removeReviewField = (index: number) => {
    const newReviews = [...reviews];
    newReviews.splice(index, 1);
    setReviews(newReviews);
    // setReviews(reviews.filter((_, i) => i !== index));
  };

  const {mutate: createWebsiteContent} = useCreateWebsiteContent();
  const {mutate: updateWebsiteContent} = useUpdateWebsiteContent();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile || !color || !description || !experienceDescription) {
      toast.error('Please fill all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('color', color);
    formData.append('description', description);
    formData.append('ExperienceDescription', experienceDescription);
    // formData.append('reviews', JSON.stringify(reviews));
    reviews.forEach((review, index) => {
      formData.append(`reviews[${index}][name]`, review.name);
      formData.append(`reviews[${index}][description]`, review.description);
      formData.append(`reviews[${index}][role]`, review.role);
    });

    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    // if (image) {
    //   formData.append('image', image);
    // }

    setLoading(true);

    try {
      const responseData = await createWebsiteContent(formData);
      setResponse({
        imageUrl: responseData?.websiteContent,
        color: responseData?.websiteColor,
      });
      toast.success('Successfully submitted!');
    } catch (err) {
      console.error('Error uploading image:', err);
      setResponse(null);
      toast.error('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-md bg-white p-8 dark:bg-black">
      <form onSubmit={onSubmit} className="flex flex-col space-y-6">
        {/* Color Dropdown */}
        <div className="flex w-1/2 flex-col">
          <label className="font-medium">Select Color:</label>
          <select
            value={color}
            onChange={handleColorChange}
            className="h-10 w-full rounded-md border px-3 py-2 dark:bg-black"
          >
            <option value="">Select a color</option>
            <option value="#FF5733">Red</option>
            <option value="#0000FF">Blue</option>
            <option value="#FFA500">Orange</option>
          </select>
        </div>

        {/* Description Fields */}
        <div className="flex flex-col space-y-4">
          <div>
            <label className="font-medium">Hero Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border px-3 py-2 dark:bg-black"
            />
          </div>

          <div>
            <label className="font-medium">Experience Description</label>
            <textarea
              value={experienceDescription}
              onChange={(e) => setExperienceDescription(e.target.value)}
              className="w-full rounded-md border px-3 py-2 dark:bg-black"
            />
          </div>
        </div>

        {/* Reviews */}
        <div className="flex flex-col space-y-4">
          <label className="text-lg font-medium">Client Reviews</label>
          {reviews.map((review, index) => (
            <div key={index} className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={review.name}
                onChange={(e) =>
                  handleReviewChange(index, 'name', e.target.value)
                }
                className="rounded-md border px-3 py-2 dark:bg-black"
              />
              <input
                type="text"
                placeholder="Description"
                value={review.description}
                onChange={(e) =>
                  handleReviewChange(index, 'description', e.target.value)
                }
                className="rounded-md border px-3 py-2 dark:bg-black"
              />
              <input
                type="text"
                placeholder="Role"
                value={review.role}
                onChange={(e) =>
                  handleReviewChange(index, 'role', e.target.value)
                }
                className="rounded-md border px-3 py-2 dark:bg-black"
              />
              <button
                type="button"
                onClick={() => removeReviewField(index)}
                className="text-blue-600"
              >
                Clear Reviews
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addReviewField}
            className="text-blue-600"
          >
            + Add Review
          </button>
        </div>

        {/* Upload File */}
        <div className="flex w-1/2 flex-col">
          <label className="font-medium">Upload Hero Image</label>
          <input
            type="file"
            onChange={handleHeroImageChange}
            className="block h-12 w-full rounded-md p-2"
          />
        </div>
        <div className="flex w-1/2 flex-col">
          <label className="font-medium">Upload Order Image</label>
          <input
            type="file"
            onChange={handleOrderImageChange}
            className="block h-12 w-full rounded-md p-2"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <GenericButton type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </GenericButton>
        </div>
      </form>
    </div>
  );
};

export default WebsiteContentPage;
