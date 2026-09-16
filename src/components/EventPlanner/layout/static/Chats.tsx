import React from 'react';
import {Pizza} from 'lucide-react';

interface StaticComponentsPanelProps {
  addCustomComponent: (type: string, width: number, height: number) => void;
}

const FOOT_TO_PIXEL = 5;

const Chats: React.FC<StaticComponentsPanelProps> = ({addCustomComponent}) => {
  const handleAddComponent = () => {
    const input = prompt('Enter dimensions for Chats (Width x Height in ft):');
    if (!input) return;
    const parts = input.split('x').map((v) => parseFloat(v.trim()));
    if (parts.length !== 2 || parts.some(isNaN))
      return alert('Invalid format.');
    const [w, h] = parts;
    addCustomComponent('chats', w * FOOT_TO_PIXEL, h * FOOT_TO_PIXEL);
  };

  return (
    <button
      onClick={handleAddComponent}
      className="flex flex-col items-center p-1"
    >
      <Pizza className="h-6 w-6 text-yellow-600" />
      <span className="text-xs font-medium">Chats</span>
    </button>
  );
};

export default Chats;
