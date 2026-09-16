import React, {useState} from 'react';

interface CategoryAccordionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const CategoryAccordion: React.FC<CategoryAccordionProps> = ({
  title,
  children,
  className = '',
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`border-gray-200 dark:border-gray-700 mb-4 rounded-lg border transition-colors ${className}`}
    >
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 flex w-full items-center justify-between rounded-t-lg bg-transparent px-4 py-3 text-left text-lg font-semibold transition-colors dark:text-white"
      >
        {title}
        <span className="text-gray-600 dark:text-gray-300">
          {open ? '−' : '+'}
        </span>
      </button>

      {/* Accordion Content */}
      {open && (
        <div className="text-gray-800 dark:text-gray-200 rounded-b-lg bg-transparent px-4 pb-4 transition-colors">
          {children}
        </div>
      )}
    </div>
  );
};

export default CategoryAccordion;
