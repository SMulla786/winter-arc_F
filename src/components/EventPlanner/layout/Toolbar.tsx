/* eslint-disable */
import {
  RefreshCw,
  Search,
  ZoomIn,
  ZoomOut,
  Shapes,
  Square,
  Circle,
  Triangle,
  Scan,
  Save,
  Download,
  Upload,
  Undo2,
  Redo2,
  Image,
  FileText,
} from 'lucide-react';
import React, {ChangeEvent} from 'react';

interface ToolbarProps {
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  selectedShape: string | null;
  isDrawingShape: boolean;
  isDrawingBoundary: boolean;
  boundaries: any[];
  currentBoundary: any[];
  startShapeDrawing: (type: string) => void;
  startBoundaryDrawing: () => void;
  finishBoundary: () => void;
  cancelBoundaryDrawing: () => void;
  undoLastPoint: () => void;
  deleteAllBoundaries: () => void;
  saveLayout: () => void;
  exportToJSON: () => void;
  triggerImport: () => void;
  handleFileImport: (e: ChangeEvent<HTMLInputElement>) => void;
  undo: () => void;
  redo: () => void;
  exportAsImage: () => void;
  exportAsPDF: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const Toolbar: React.FC<ToolbarProps> = ({
  zoom,
  zoomIn,
  zoomOut,
  resetZoom,
  selectedShape,
  isDrawingShape,
  isDrawingBoundary,
  boundaries,
  currentBoundary,
  startShapeDrawing,
  startBoundaryDrawing,
  finishBoundary,
  cancelBoundaryDrawing,
  undoLastPoint,
  deleteAllBoundaries,
  saveLayout,
  exportToJSON,
  triggerImport,
  handleFileImport,
  undo,
  redo,
  exportAsImage,
  exportAsPDF,
  fileInputRef,
}) => {
  return (
    <div className="border-gray-100 flex shrink-0 items-center justify-between border-b bg-white px-4 py-3 dark:bg-black dark:text-white">
      {/* Left Section - Zoom Controls */}
      <div className="flex items-center gap-3">
        {/* Zoom Out */}
        <button
          onClick={zoomOut}
          disabled={zoom <= 0.1}
          className={`group rounded-xl p-2 transition-all duration-200 dark:bg-black dark:text-white ${
            zoom <= 0.1
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-200 text-gray-600 bg-white hover:scale-105 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md active:scale-95'
          } `}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4 transition-transform group-hover:scale-110" />
        </button>

        {/* Zoom Display */}
        <div className="flex min-w-[80px] items-center gap-2">
          <Search className="text-gray-400 h-3.5 w-3.5" />
          <div className="text-center">
            <div className="text-gray-700 text-sm font-semibold tracking-tight">
              {Math.round(zoom * 100)}%
            </div>
            <div className="text-gray-400 text-xs font-medium">Zoom</div>
          </div>
        </div>

        {/* Zoom In */}
        <button
          onClick={zoomIn}
          disabled={zoom >= 3}
          className={`group rounded-xl p-2 transition-all duration-200 dark:bg-black dark:text-white ${
            zoom >= 3
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-200 text-gray-600 bg-white hover:scale-105 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md active:scale-95'
          } `}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4 transition-transform group-hover:scale-110" />
        </button>

        {/* Reset Zoom */}
        <button
          onClick={resetZoom}
          className="border-gray-200 text-gray-600 group rounded-xl bg-white p-2 transition-all duration-200 hover:scale-105 hover:border-green-300 hover:bg-green-50 hover:text-green-600 hover:shadow-md active:scale-95 dark:bg-black dark:text-white"
          title="Reset Zoom"
        >
          <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180" />
        </button>
      </div>

      {/* Center Section - Shapes & Boundary */}
      <div className="flex items-center gap-2">
        {/* Shapes */}
        <div className="bg-gray-100 flex items-center gap-1 rounded-lg p-1">
          <button
            onClick={() => startShapeDrawing('rectangle')}
            className={`rounded-lg p-2 transition-all duration-200 dark:bg-black dark:text-white ${
              selectedShape === 'rectangle' && isDrawingShape
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 bg-white hover:bg-blue-50 hover:text-blue-600'
            }`}
            title="Rectangle"
          >
            <Square className="h-4 w-4" />
          </button>
          <button
            onClick={() => startShapeDrawing('circle')}
            className={`rounded-lg p-2 transition-all duration-200 dark:bg-black dark:text-white ${
              selectedShape === 'circle' && isDrawingShape
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 bg-white hover:bg-blue-50 hover:text-blue-600'
            }`}
            title="Circle"
          >
            <Circle className="h-4 w-4" />
          </button>
          <button
            onClick={() => startShapeDrawing('triangle')}
            className={`rounded-lg p-2 transition-all duration-200 dark:bg-black dark:text-white ${
              selectedShape === 'triangle' && isDrawingShape
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 bg-white hover:bg-blue-50 hover:text-blue-600'
            }`}
            title="Triangle"
          >
            <Triangle className="h-4 w-4" />
          </button>
        </div>

        {/* Boundary Controls */}
        <div className="bg-gray-100 flex items-center gap-1 rounded-lg p-1">
          {!isDrawingBoundary ? (
            <button
              onClick={startBoundaryDrawing}
              className="text-gray-600 rounded-lg bg-white p-2 transition-all duration-200 hover:bg-green-50 hover:text-green-600 dark:bg-black dark:text-white"
              title="Draw Boundary"
            >
              <Scan className="h-4 w-4" />
            </button>
          ) : (
            <>
              <button
                onClick={finishBoundary}
                disabled={currentBoundary.length < 3}
                className={`rounded-lg p-2 transition-all duration-200 ${
                  currentBoundary.length < 3
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
                title="Finish Boundary"
              >
                <Square className="h-4 w-4" />
              </button>
              <button
                onClick={undoLastPoint}
                disabled={currentBoundary.length === 0}
                className={`rounded-lg p-2 transition-all duration-200 ${
                  currentBoundary.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
                title="Undo Last Point"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                onClick={cancelBoundaryDrawing}
                className="rounded-lg bg-red-500 p-2 text-white transition-all duration-200 hover:bg-red-600"
                title="Cancel Drawing"
              >
                <span className="text-xs font-bold">×</span>
              </button>
            </>
          )}

          {boundaries.length > 0 && (
            <button
              onClick={deleteAllBoundaries}
              className="rounded-lg bg-red-500 p-2 text-white transition-all duration-200 hover:bg-red-600"
              title="Delete All Boundaries"
            >
              <span className="text-xs font-bold">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Section - Layout & Export Controls */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div className="bg-gray-100 flex items-center gap-1 rounded-lg p-1">
          <button
            onClick={undo}
            className="text-gray-600 rounded-lg bg-white p-2 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 dark:bg-black dark:text-white"
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            className="text-gray-600 rounded-lg bg-white p-2 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 dark:bg-black dark:text-white"
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>

        {/* Save & Export */}
        <div className="bg-gray-100 flex items-center gap-1 rounded-lg p-1">
          <button
            onClick={saveLayout}
            className="text-gray-600 rounded-lg bg-white p-2 transition-all duration-200 hover:bg-green-50 hover:text-green-600 dark:bg-black dark:text-white"
            title="Save Layout"
          >
            <Save className="h-4 w-4" />
          </button>

          {/* <button
            onClick={() => {
              triggerImport();
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="p-2 rounded-lg bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 dark:bg-black dark:text-white"
            title="Import Layout"
          >
            <Upload className="w-4 h-4" />
          </button>
          
          <button
            onClick={exportToJSON}
            className="p-2 rounded-lg bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 dark:bg-black dark:text-white"
            title="Export to JSON"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={exportAsImage}
            className="p-2 rounded-lg bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 dark:bg-black dark:text-white"
            title="Export as Image"
          >
            <Image className="w-4 h-4" />
          </button>
          
          <button
            onClick={exportAsPDF}
            className="p-2 rounded-lg bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 dark:bg-black dark:text-white"
            title="Export as PDF"
          >
            <FileText className="w-4 h-4" />
          </button> */}
        </div>

        {/* Hidden file input for import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileImport}
          accept=".json"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default Toolbar;
