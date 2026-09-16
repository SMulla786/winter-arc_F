import React from 'react';

import bg1 from '@/assets/images/pdf-bg/Classic.png';
import bg2 from '@/assets/images/template/Greeen.jpeg';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (bgUrl: string) => void;
};

const backgrounds = [bg1, bg2];

export const BackgroundPicker: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/70">
      <div className="w-[900px] max-w-[95%] rounded-xl bg-white p-6 dark:bg-black">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Choose PDF Background</h2>
          <button onClick={onClose} className="text-xl">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {backgrounds.map((bg) => (
            <div
              key={bg}
              onClick={() => onSelect(bg)}
              className="cursor-pointer overflow-hidden rounded-lg border transition hover:scale-105"
            >
              <img
                src={bg}
                alt="PDF Background"
                className="h-40 w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BackgroundPicker;
