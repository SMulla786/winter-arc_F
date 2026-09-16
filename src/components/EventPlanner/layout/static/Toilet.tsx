import React from 'react';
import {Droplets} from 'lucide-react';

interface StaticComponentsPanelProps {
  addCustomComponent: (type: string, width: number, height: number) => void;
}

const FOOT_TO_PIXEL = 5;

const Toilet: React.FC<StaticComponentsPanelProps> = ({addCustomComponent}) => {
  const handleAddComponent = () => {
    const input = prompt('Enter dimensions for Toilet (Width x Height in ft):');
    if (!input) return;
    const parts = input.split('x').map((v) => parseFloat(v.trim()));
    if (parts.length !== 2 || parts.some(isNaN))
      return alert('Invalid format.');
    const [w, h] = parts;
    addCustomComponent('toilet', w * FOOT_TO_PIXEL, h * FOOT_TO_PIXEL);
  };

  return (
    <button
      onClick={handleAddComponent}
      className="flex flex-col items-center p-1"
    >
      <Droplets className="h-6 w-6 text-blue-700" />
      <span className="text-xs font-medium">Toilet</span>
    </button>
  );
};

export default Toilet;
