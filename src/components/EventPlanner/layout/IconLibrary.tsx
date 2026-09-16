import React from 'react';
import {iconLibrary} from './constants';
import {Search, X} from 'lucide-react';

interface IconLibraryProps {
  iconSearch: string;
  setIconSearch: (search: string) => void;
  addObject: (type: string) => void;
}

const IconLibrary: React.FC<IconLibraryProps> = ({
  iconSearch,
  setIconSearch,
  addObject,
}) => {
  const filteredIcons = iconLibrary.filter((icon) =>
    icon.label.toLowerCase().includes(iconSearch.toLowerCase()),
  );

  const clearSearch = () => setIconSearch('');

  return (
    <div className="border-gray-100 border-b bg-white/80 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-gray-700 text-sm font-semibold uppercase tracking-wide">
          Icon Library
        </h3>
        {iconSearch && (
          <span className="text-gray-500 bg-gray-100 rounded-full px-2 py-1 text-xs">
            {filteredIcons.length} found
          </span>
        )}
      </div>

      {/* Enhanced Search Input */}
      <div className="group relative mb-3">
        <Search className="text-gray-400 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform transition-colors group-focus-within:text-blue-500" />
        <input
          type="text"
          placeholder="Search icons..."
          value={iconSearch}
          onChange={(e) => setIconSearch(e.target.value)}
          className="border-gray-200 placeholder-gray-400 w-full rounded-xl border bg-white/70 py-2.5 pl-10 pr-8 text-sm font-medium backdrop-blur-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        {iconSearch && (
          <button
            onClick={clearSearch}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 absolute right-2 top-1/2 -translate-y-1/2 transform rounded-lg p-1 transition-colors duration-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Icons Grid */}
      {iconSearch && (
        <div className="space-y-3">
          <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 grid max-h-64 grid-cols-4 gap-2 overflow-y-auto">
            {filteredIcons.length === 0 ? (
              <div className="text-gray-400 col-span-4 flex flex-col items-center justify-center py-8">
                <div className="bg-gray-100 mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                  <Search className="h-6 w-6" />
                </div>
                <p className="text-gray-500 text-sm font-medium">
                  No icons found
                </p>
                <p className="text-gray-400 mt-1 text-xs">
                  Try different keywords
                </p>
              </div>
            ) : (
              filteredIcons.map((icon) => (
                <button
                  key={icon.type}
                  onClick={() => addObject(icon.type)}
                  className="border-gray-200/60 group relative flex h-20 cursor-pointer flex-col items-center justify-center rounded-xl border bg-white/50 p-3 text-xs font-medium transition-all duration-200 hover:scale-105 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md active:scale-95"
                  title={icon.label}
                >
                  {/* Icon Container */}
                  <div className="text-gray-600 mb-2 transition-transform duration-200 group-hover:scale-110 group-hover:text-blue-600">
                    {icon.icon}
                  </div>

                  {/* Label */}
                  <span className="text-gray-700 w-full truncate px-1 text-center font-medium tracking-tight">
                    {icon.label}
                  </span>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/0 to-blue-600/0 transition-all duration-200 group-hover:from-blue-500/5 group-hover:to-blue-600/5"></div>

                  {/* Add Indicator */}
                  <div className="absolute right-1 top-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Search Status Bar */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="text-gray-500 flex items-center gap-1.5 text-xs">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500"></div>
                <span>Click to add icon</span>
              </div>
            </div>
            {filteredIcons.length > 0 && (
              <div className="text-gray-400 bg-gray-100/50 border-gray-200/50 rounded-full border px-2 py-1 text-xs">
                {filteredIcons.length}{' '}
                {filteredIcons.length === 1 ? 'icon' : 'icons'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!iconSearch && (
        <div className="text-gray-400 flex flex-col items-center justify-center py-6">
          <div className="bg-gray-100/50 border-gray-200/50 mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border">
            <Search className="h-6 w-6" />
          </div>
          <p className="text-gray-500 mb-1 text-sm font-medium">Search Icons</p>
          <p className="text-gray-400 max-w-[200px] text-center text-xs">
            Type in the search bar to browse available icons
          </p>
        </div>
      )}
    </div>
  );
};

export default IconLibrary;
