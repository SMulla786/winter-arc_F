import React from 'react';
import type {CateringObject, Boundary} from './types';

interface PropertiesPanelProps {
  selectedObjects: Set<string>;
  selectedBoundary: string | null;
  objects: CateringObject[];
  boundaries: Boundary[];
  updateObject: (id: string, updates: Partial<CateringObject>) => void;
  updateBoundary: (id: string, updates: Partial<Boundary>) => void;
  handleMeasurementChange: (
    id: string,
    field: 'width' | 'height',
    value: string,
  ) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedObjects,
  selectedBoundary,
  objects,
  boundaries,
  updateObject,
  updateBoundary,
  handleMeasurementChange,
}) => {
  if (selectedObjects.size === 1) {
    const selectedId = Array.from(selectedObjects)[0];
    const selectedObj = objects.find((obj) => obj.id === selectedId);
    if (!selectedObj) return null;

    return (
      <div className="border-gray-200 border-b p-3">
        <h3 className="mb-2 text-sm font-medium">
          {selectedObj.type === 'text' ? 'Text Properties' : 'Shape Properties'}
        </h3>
        <div className="space-y-2">
          {selectedObj.type !== 'text' && selectedObj.type === 'circle' ? (
            <div className="flex items-center justify-between">
              <label className="text-xs">Radius:</label>
              <input
                type="number"
                value={selectedObj.size.width / 2}
                onChange={(e) =>
                  handleMeasurementChange(
                    selectedObj.id,
                    'width',
                    (parseFloat(e.target.value) * 2).toString(),
                  )
                }
                className="border-gray-300 w-20 rounded border px-1 py-0.5 text-xs"
                min="10"
              />
            </div>
          ) : selectedObj.type !== 'text' ? (
            <>
              <div className="flex items-center justify-between">
                <label className="text-xs">
                  {selectedObj.type === 'triangle' ? 'Base' : 'Width'}:
                </label>
                <input
                  type="number"
                  value={selectedObj.size.width}
                  onChange={(e) =>
                    handleMeasurementChange(
                      selectedObj.id,
                      'width',
                      e.target.value,
                    )
                  }
                  className="border-gray-300 w-20 rounded border px-1 py-0.5 text-xs"
                  min="20"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs">Height:</label>
                <input
                  type="number"
                  value={selectedObj.size.height}
                  onChange={(e) =>
                    handleMeasurementChange(
                      selectedObj.id,
                      'height',
                      e.target.value,
                    )
                  }
                  className="border-gray-300 w-20 rounded border px-1 py-0.5 text-xs"
                  min="20"
                />
              </div>
            </>
          ) : null}
          <div className="flex items-center justify-between">
            <label className="text-xs">Label:</label>
            <input
              type="text"
              value={selectedObj.label}
              onChange={(e) =>
                updateObject(selectedObj.id, {label: e.target.value})
              }
              className="border-gray-300 w-20 rounded border px-1 py-0.5 text-xs"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs">Color:</label>
            <input
              type="color"
              value={selectedObj.color || '#000000'}
              onChange={(e) =>
                updateObject(selectedObj.id, {color: e.target.value})
              }
              className="border-gray-300 w-20 rounded border px-1 py-0.5"
            />
          </div>
        </div>
      </div>
    );
  } else if (selectedBoundary) {
    const selectedB = boundaries.find((b) => b.id === selectedBoundary);
    if (!selectedB) return null;

    return (
      <div className="border-gray-200 border-b p-3">
        <h3 className="mb-2 text-sm font-medium">Boundary Properties</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs">Color:</label>
            <input
              type="color"
              value={selectedB.color || '#000000'}
              onChange={(e) =>
                updateBoundary(selectedB.id, {color: e.target.value})
              }
              className="border-gray-300 w-20 rounded border px-1 py-0.5"
            />
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default PropertiesPanel;
