import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Model: React.FC<ModalProps> = ({isOpen, onClose, title, children}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="dark:bg-gray-800 mx-4 max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-lg">
        <div className="border-gray-200 dark:border-gray-700 flex items-center justify-between border-b p-4">
          <h2 className="text-gray-900 text-xl font-semibold dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            ×
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Model;
