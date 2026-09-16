import React from 'react';
import type {CateringObject} from './types';

interface FloatingPropertiesPanelProps {
  object: CateringObject;
  updateObject: (id: string, updates: Partial<CateringObject>) => void;
}

const FloatingPropertiesPanel: React.FC<FloatingPropertiesPanelProps> = ({
  object,
  updateObject,
}) => {
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateObject(object.id, {label: e.target.value});
  };

  const handleBackgroundColorChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    updateObject(object.id, {backgroundColor: e.target.value});
  };

  const handleBorderColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateObject(object.id, {borderColor: e.target.value});
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateObject(object.id, {color: e.target.value});
  };

  const showBackgroundColor = [
    'square',
    'rectangle',
    'circle',
    'triangle',
    'text',
  ].includes(object.type);
  const showBorderColor = [
    'square',
    'rectangle',
    'circle',
    'triangle',
  ].includes(object.type);
  const showTextColor = object.type === 'text';

  return (
    <div className="border-gray-200 fixed right-4 top-4 z-50 min-w-64 max-w-80 rounded-lg border bg-white p-4 shadow-xl">
      <h3 className="text-gray-800 mb-3 text-sm font-semibold uppercase tracking-wide">
        Properties
      </h3>

      <div className="space-y-3">
        {/* Label Input */}
        <div>
          <label className="text-gray-600 mb-1 block text-xs font-medium">
            Label
          </label>
          <input
            type="text"
            value={object.label || ''}
            onChange={handleLabelChange}
            className="border-gray-300 w-full rounded-md border px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter label..."
          />
        </div>

        {/* Background Color Picker */}
        {showBackgroundColor && (
          <div>
            <label className="text-gray-600 mb-1 block text-xs font-medium">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={object.backgroundColor || '#ffffff'}
                onChange={handleBackgroundColorChange}
                className="border-gray-300 h-8 w-8 cursor-pointer rounded border"
              />
              <input
                type="text"
                value={object.backgroundColor || '#ffffff'}
                onChange={handleBackgroundColorChange}
                className="border-gray-300 font-mono flex-1 rounded-md border px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#ffffff"
              />
            </div>
          </div>
        )}

        {/* Border Color Picker */}
        {showBorderColor && (
          <div>
            <label className="text-gray-600 mb-1 block text-xs font-medium">
              Border Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={object.borderColor || object.color || '#3B82F6'}
                onChange={handleBorderColorChange}
                className="border-gray-300 h-8 w-8 cursor-pointer rounded border"
              />
              <input
                type="text"
                value={object.borderColor || object.color || '#3B82F6'}
                onChange={handleBorderColorChange}
                className="border-gray-300 font-mono flex-1 rounded-md border px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#3B82F6"
              />
            </div>
          </div>
        )}

        {/* Text Color Picker */}
        {showTextColor && (
          <div>
            <label className="text-gray-600 mb-1 block text-xs font-medium">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={object.color || '#1F2937'}
                onChange={handleColorChange}
                className="border-gray-300 h-8 w-8 cursor-pointer rounded border"
              />
              <input
                type="text"
                value={object.color || '#1F2937'}
                onChange={handleColorChange}
                className="border-gray-300 font-mono flex-1 rounded-md border px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#1F2937"
              />
            </div>
          </div>
        )}

        {/* Object Info */}
        <div className="border-gray-200 border-t pt-2">
          <div className="text-gray-500 space-y-1 text-xs">
            <div>Type: {object.type}</div>
            <div>
              Position: {Math.round(object.position.x)},{' '}
              {Math.round(object.position.y)}
            </div>
            <div>
              Size: {object.size.width} × {object.size.height}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingPropertiesPanel;
