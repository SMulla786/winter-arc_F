import React from 'react';
import {Tag as StageIcon, User} from 'lucide-react';

interface StaticComponentsPanelProps {
  addCustomComponent: (type: string, width: number, height: number) => void;
}

const staticComponents = [{type: 'stage', label: 'Stage', icon: StageIcon}];

// 🧮 Conversion factor
const FOOT_TO_PIXEL = 5;

const StaticComponentsPanel: React.FC<StaticComponentsPanelProps> = ({
  addCustomComponent,
}) => {
  const handleAddComponent = (type: string) => {
    const input = prompt(
      `Enter dimensions for ${type} (Width x Height in ft, e.g., 6 x 2):`,
    );
    if (!input) return;

    const parts = input.split('x').map((v) => parseFloat(v.trim()));
    if (parts.length !== 2 || parts.some(isNaN)) {
      alert('Invalid format. Use Width x Height (e.g., 6 x 2).');
      return;
    }

    const [widthFt, heightFt] = parts;
    const widthPx = widthFt * FOOT_TO_PIXEL;
    const heightPx = heightFt * FOOT_TO_PIXEL;

    addCustomComponent(type, widthPx, heightPx);
  };

  return (
    <div className="border-gray-200 mt-12 p-3">
      <div className="grid grid-cols-1 gap-3">
        {staticComponents.map((comp) => {
          const Icon = comp.icon;
          return (
            <button
              key={comp.type}
              onClick={() => handleAddComponent(comp.type)}
              className="flex flex-col items-center justify-center gap-1 p-1 shadow-sm transition"
            >
              <Icon className="h-6 w-6 text-blue-600" />
              <span className="text-gray-700 text-center text-xs font-medium">
                {comp.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StaticComponentsPanel;
