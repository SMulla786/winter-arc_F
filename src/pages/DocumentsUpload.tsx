import {useUploadDocument} from '@/lib/react-query/Documents/uploaddocument';
import React, {useState, useRef} from 'react';
import {FiUpload} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {z} from 'zod';

const documentNameSchema = z.object({
  documentName: z.string().min(1, 'Document name is required'),
  documentUpload: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'File is required'),
});
const DocumentsUpload: React.FC = () => {
  const [documentName, setDocumentName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {data: uploaddocument} = useUploadDocument();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploaddocument({documentName, documentUpload: selectedFile});
    toast.success('Document uploaded successfully!');
  };

  return (
    <div className="mx-auto max-w-270">
      <div className="mx-auto max-w-2xl">
        <div>
          <form onSubmit={handleSubmit}>
            {/* Document Name Field */}
            <div className="mb-6">
              <label
                htmlFor="documentName"
                className="text-gray-700 mb-2 block text-sm font-medium"
              >
                Document Name *
              </label>
              <input
                type="text"
                id="documentName"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Enter document name (e.g., Passport, Resume)"
                className="border-gray-300 w-full rounded-lg border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Document Upload Field */}
            <div className="mb-8">
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
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                onClick={handleSubmit}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Upload Document
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentsUpload;
