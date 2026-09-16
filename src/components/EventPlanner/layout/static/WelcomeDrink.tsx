import React from 'react';
import {GlassWater} from 'lucide-react';

interface StaticComponentsPanelProps {
  addCustomComponent: (type: string, width: number, height: number) => void;
}

const FOOT_TO_PIXEL = 5;

const WelcomeDrink: React.FC<StaticComponentsPanelProps> = ({
  addCustomComponent,
}) => {
  const handleAddComponent = () => {
    const input = prompt(
      'Enter dimensions for Welcome Drink (Width x Height in ft):',
    );
    if (!input) return;
    const parts = input.split('x').map((v) => parseFloat(v.trim()));
    if (parts.length !== 2 || parts.some(isNaN))
      return alert('Invalid format.');
    const [w, h] = parts;
    addCustomComponent('welcomeDrink', w * FOOT_TO_PIXEL, h * FOOT_TO_PIXEL);
  };

  return (
    <button
      onClick={handleAddComponent}
      className="flex flex-col items-center p-1"
    >
      <GlassWater className="h-6 w-6 text-teal-600" />
      <span className="text-xs font-medium">Welcome Drink</span>
    </button>
  );
};

export default WelcomeDrink;
