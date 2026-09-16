/* eslint-disable */
import React from 'react';
import {
  Map,
  Square,
  X,
  RotateCcw,
  Trash2,
  Check,
  Navigation,
} from 'lucide-react';

interface BoundaryPanelProps {
  isDrawingBoundary: boolean;
  boundaries: any[];
  currentBoundary: any[];
  startBoundaryDrawing: () => void;
  finishBoundary: () => void;
  cancelBoundaryDrawing: () => void;
  undoLastPoint: () => void;
  deleteAllBoundaries: () => void;
}

const BoundaryPanel: React.FC<BoundaryPanelProps> = ({
  isDrawingBoundary,
  boundaries,
  currentBoundary,
  startBoundaryDrawing,
  finishBoundary,
  cancelBoundaryDrawing,
  undoLastPoint,
  deleteAllBoundaries,
}) => {
  return (
    <div className="border-gray-100 border-b bg-white/80 p-4 backdrop-blur-sm">
      {/* Header with Status */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-1.5">
            <Navigation className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="text-gray-700 text-sm font-semibold uppercase tracking-wide">
            Boundaries
          </h3>
        </div>

        {/* Status Badge */}
        {isDrawingBoundary && (
          <div className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
            <span className="text-xs font-medium text-blue-700">Drawing</span>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="mb-3 flex flex-col gap-2">
        {/* Primary Action Button */}
        <button
          onClick={isDrawingBoundary ? finishBoundary : startBoundaryDrawing}
          className={`group relative flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold backdrop-blur-sm transition-all duration-200 ${
            isDrawingBoundary
              ? 'border-green-500 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40'
              : 'border-blue-500 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:scale-105 hover:shadow-blue-500/40'
          } active:scale-95`}
        >
          {isDrawingBoundary ? (
            <>
              <Check className="h-4 w-4" />
              Finish Boundary
            </>
          ) : (
            <>
              <Square className="h-4 w-4" />
              Draw Boundary
            </>
          )}
        </button>

        {/* Secondary Controls */}
        <div className="grid grid-cols-2 gap-2">
          {isDrawingBoundary && (
            <>
              <button
                onClick={undoLastPoint}
                disabled={currentBoundary.length === 0}
                className={`flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 px-2 py-2 text-xs font-medium transition-all duration-200 ${
                  currentBoundary.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-amber-50 text-amber-700 hover:scale-105 hover:bg-amber-100 hover:shadow-md active:scale-95'
                } `}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Undo Point
              </button>

              <button
                onClick={cancelBoundaryDrawing}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-2 py-2 text-xs font-medium text-red-700 transition-all duration-200 hover:scale-105 hover:bg-red-100 hover:shadow-md active:scale-95"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Clear All Boundaries */}
        {boundaries.length > 0 && (
          <button
            onClick={deleteAllBoundaries}
            className="group flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 px-3 py-2 text-xs font-medium text-red-700 transition-all duration-200 hover:scale-105 hover:bg-red-100 hover:shadow-md active:scale-95"
          >
            <Trash2 className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
            Clear All Boundaries
          </button>
        )}
      </div>

      {/* Status Information */}
      <div className="space-y-2">
        {/* Drawing Instructions */}
        {isDrawingBoundary && (
          <div className="rounded-xl border border-blue-200/50 bg-blue-50/50 p-3">
            <div className="flex items-start gap-2">
              <div className="mt-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <p className="mb-1 text-xs font-medium text-blue-800">
                  Drawing in Progress
                </p>
                <p className="text-xs leading-relaxed text-blue-600/80">
                  Click on canvas to add points. Boundary will snap to grid if
                  enabled. Press{' '}
                  <kbd className="font-mono rounded border border-blue-200 bg-white/50 px-1.5 py-0.5 text-xs">
                    Enter
                  </kbd>{' '}
                  or click Finish to complete.
                </p>
              </div>
            </div>

            {/* Current Progress */}
            {currentBoundary.length > 0 && (
              <div className="mt-2 border-t border-blue-200/30 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-blue-700">
                    Points placed:
                  </span>
                  <span className="rounded-full border border-blue-200 bg-white/50 px-2 py-1 font-semibold text-blue-800">
                    {currentBoundary.length}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Boundaries Summary */}
        <div className="bg-gray-50/50 border-gray-200/50 flex items-center justify-between rounded-lg border p-2">
          <div className="flex items-center gap-2">
            <Map className="text-gray-600 h-3.5 w-3.5" />
            <span className="text-gray-700 text-xs font-medium">
              Total Boundaries:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-900 border-gray-300 rounded-full border bg-white/70 px-2 py-1 text-xs font-semibold">
              {boundaries.length}
            </span>
          </div>
        </div>

        {/* Quick Tips */}
        {!isDrawingBoundary && boundaries.length === 0 && (
          <div className="bg-gray-50/30 border-gray-200/30 rounded-lg border p-2">
            <p className="text-gray-500 text-center text-xs">
              Click "Draw Boundary" to start defining areas
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoundaryPanel;
