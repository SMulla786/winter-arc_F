import React from 'react';
import {shapeLibrary} from './constants';

interface ShapesPanelProps {
  selectedShape: string | null;
  isDrawingShape: boolean;
  startShapeDrawing: (type: string) => void;
}

const ShapesPanel: React.FC<ShapesPanelProps> = ({
  selectedShape,
  isDrawingShape,
  startShapeDrawing,
}) => {
  return (
    <div className="border-gray-100 border-b bg-white/80 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-gray-700 text-sm font-semibold uppercase tracking-wide">
          Shapes
        </h3>
        {isDrawingShape && (
          <div className="flex items-center gap-2 rounded-full bg-blue-50 px-2 py-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
            <span className="text-xs font-medium text-blue-700">
              Drawing Mode
            </span>
          </div>
        )}
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        {shapeLibrary.map((shape) => {
          const isSelected = selectedShape === shape.type;
          return (
            <button
              key={shape.type}
              onClick={() => startShapeDrawing(shape.type)}
              className={`group relative flex h-18 cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-3 text-xs font-medium backdrop-blur-sm transition-all duration-200 ${
                isSelected
                  ? 'scale-95 border-blue-500 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-700 border-gray-200/80 bg-white/70 hover:scale-105 hover:border-blue-300/70 hover:bg-blue-50/50 hover:shadow-md'
              } active:scale-95`}
              title={shape.label}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-sm"></div>
              )}

              {/* Icon container with modern styling */}
              <div
                className={`mb-2 transition-transform duration-200 group-hover:scale-110 ${isSelected ? 'scale-110 text-white' : 'text-gray-600 group-hover:text-blue-600'} `}
              >
                {shape.icon}
              </div>

              {/* Label with better typography */}
              <span className="w-full truncate text-center font-medium tracking-tight">
                {shape.label}
              </span>

              {/* Subtle hover effect */}
              <div
                className={`absolute inset-0 rounded-xl transition-opacity duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/10'
                    : 'group-hover:bg-blue-500/5'
                } `}
              ></div>
            </button>
          );
        })}
      </div>

      {/* Enhanced status indicator */}
      {isDrawingShape && (
        <div className="flex items-center justify-between rounded-lg border border-blue-200/60 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex space-x-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500"></div>
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                style={{animationDelay: '0.1s'}}
              ></div>
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                style={{animationDelay: '0.2s'}}
              ></div>
            </div>
            <span className="text-xs font-medium text-blue-800">
              {selectedShape === 'text'
                ? 'Click anywhere to place text label'
                : `Click and drag to draw ${selectedShape}`}
            </span>
          </div>
          <div className="font-mono rounded border border-blue-200/30 bg-white/50 px-2 py-1 text-xs text-blue-600/70">
            ESC to cancel
          </div>
        </div>
      )}
    </div>
  );
};

export default ShapesPanel;
