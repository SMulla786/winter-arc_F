import React, {type ChangeEvent} from 'react';
import {
  Save,
  Download,
  Upload,
  Image,
  FileText,
  Undo,
  Redo,
  FileOutput,
  FolderInput,
  Palette,
} from 'lucide-react';

interface LayoutControlsProps {
  layoutName: string;
  setLayoutName: (name: string) => void;
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

const LayoutControls: React.FC<LayoutControlsProps> = ({
  layoutName,
  setLayoutName,
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
    <div className="border-gray-100 border-b bg-white/80 p-4 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-lg border border-purple-100 bg-purple-50 p-1.5">
          <Palette className="h-4 w-4 text-purple-600" />
        </div>
        <h3 className="text-gray-700 text-sm font-semibold uppercase tracking-wide">
          Layout Controls
        </h3>
      </div>

      {/* Layout Name & Save */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <div className="group relative flex-1">
            <input
              type="text"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              placeholder="Enter layout name..."
              className="border-gray-200 placeholder-gray-400 w-full rounded-xl border bg-white/70 py-2.5 pl-3 pr-10 text-sm font-medium backdrop-blur-sm transition-all duration-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            {layoutName && (
              <div className="text-gray-400 bg-gray-100 border-gray-200 absolute right-2 top-1/2 -translate-y-1/2 transform rounded-md border px-1.5 py-0.5 text-xs">
                {layoutName.length}/50
              </div>
            )}
          </div>
          <button
            onClick={saveLayout}
            disabled={!layoutName.trim()}
            className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold backdrop-blur-sm transition-all duration-200 ${
              !layoutName.trim()
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'border-green-500 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:scale-105 hover:shadow-green-500/40'
            } active:scale-95`}
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>

      {/* Import/Export Section */}
      <div className="mb-3 space-y-2">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
          Data Management
        </p>

        <div className="grid grid-cols-2 gap-2">
          {/* Export JSON */}
          <button
            onClick={exportToJSON}
            className="group flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-xs font-medium text-blue-700 transition-all duration-200 hover:scale-105 hover:bg-blue-50 hover:shadow-md active:scale-95"
          >
            <FileOutput className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
            Export JSON
          </button>

          {/* Import JSON */}
          <button
            onClick={triggerImport}
            className="group flex items-center gap-2 rounded-xl border border-green-200 bg-white px-3 py-2.5 text-xs font-medium text-green-700 transition-all duration-200 hover:scale-105 hover:bg-green-50 hover:shadow-md active:scale-95"
          >
            <FolderInput className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
            Import JSON
          </button>

          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileImport}
          />
        </div>
      </div>

      {/* Export Section */}
      <div className="space-y-2">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
          Export As
        </p>

        <div className="grid grid-cols-2 gap-2">
          {/* Export Image */}
          <button
            onClick={exportAsImage}
            className="group flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-3 py-2.5 text-xs font-medium text-purple-700 transition-all duration-200 hover:scale-105 hover:bg-purple-50 hover:shadow-md active:scale-95"
          >
            <Image className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
            Image
          </button>

          {/* Export PDF */}
          <button
            onClick={exportAsPDF}
            className="group flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-xs font-medium text-red-700 transition-all duration-200 hover:scale-105 hover:bg-red-50 hover:shadow-md active:scale-95"
          >
            <FileText className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
            PDF
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="border-gray-200/50 mt-3 border-t pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Layout Status:</span>
          <span
            className={`font-semibold ${layoutName.trim() ? 'text-green-600' : 'text-amber-600'}`}
          >
            {layoutName.trim() ? 'Named' : 'Unnamed'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LayoutControls;
