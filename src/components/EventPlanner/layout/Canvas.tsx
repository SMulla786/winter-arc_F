/* eslint-disable */
import React, {useCallback, useMemo, useState, useRef, useEffect} from 'react';
import {Rnd} from 'react-rnd';
import {iconLibrary} from './constants';
import type {Boundary, CateringObject, Position} from './types';
import FloatingPropertiesPanel from './FloatingPropertiesPanel';

interface CanvasProps {
  objects: CateringObject[];
  boundaries: Boundary[];
  selectedObjects: Set<string>;
  selectedBoundary: string | null;
  isDrawingBoundary: boolean;
  isDrawingShape: boolean;
  selectedShape: string | null;
  currentBoundary: Position[];
  currentMouse: Position | null;
  shapeStartPos: Position | null;
  zoom: number;
  pan: Position;
  showGrid: boolean;
  canvasRef: React.RefObject<HTMLDivElement>;
  updateObject: (id: string, updates: Partial<CateringObject>) => void;
  toggleObjectSelection: (id: string, shiftKey?: boolean) => void;
  selectBoundary: (id: string) => void;
  clearSelection: () => void;
  handleCanvasMouseDown: (e: React.MouseEvent) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: (e: React.MouseEvent) => void;
  handleWheel: (e: React.WheelEvent) => void;
  handleShapeMouseDown: (e: React.MouseEvent) => void;
  handleShapeMouseUp: (e: React.MouseEvent) => void;
}

// Constants
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1000;
const PIXELS_PER_FOOT = 50;
const INCHES_PER_FOOT = 12;
const PIXELS_PER_INCH = PIXELS_PER_FOOT / INCHES_PER_FOOT;
const MAJOR_GRID_SIZE = PIXELS_PER_FOOT;
const MINOR_GRID_SIZE = PIXELS_PER_FOOT / 2;
const RULER_HEIGHT = 24;
const RULER_WIDTH = 24;

// Memoized Grid Component
const Grid = React.memo(
  ({showGrid, zoom}: {showGrid: boolean; zoom: number}) => {
    if (!showGrid) return null;

    return (
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-full"
        style={{
          backgroundImage: `
          linear-gradient(to right, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
          linear-gradient(to right, rgba(59, 130, 246, 0.15) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
        `,
          backgroundSize: `
          ${MAJOR_GRID_SIZE}px ${MAJOR_GRID_SIZE}px,
          ${MAJOR_GRID_SIZE}px ${MAJOR_GRID_SIZE}px,
          ${MINOR_GRID_SIZE}px ${MINOR_GRID_SIZE}px,
          ${MINOR_GRID_SIZE}px ${MINOR_GRID_SIZE}px
        `,
          backgroundPosition: `
          0 0,
          0 0,
          ${MINOR_GRID_SIZE}px ${MINOR_GRID_SIZE}px,
          ${MINOR_GRID_SIZE}px ${MINOR_GRID_SIZE}px
        `,
        }}
      />
    );
  },
);

// Memoized Ruler Component
const Rulers = React.memo(({pan, zoom}: {pan: Position; zoom: number}) => {
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({width: window.innerWidth, height: window.innerHeight});
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {width: viewportWidth, height: viewportHeight} = viewportSize;

  const visibleStartX = Math.max(0, -pan.x / zoom);
  const visibleEndX = Math.min(
    CANVAS_WIDTH,
    (-pan.x + viewportWidth - RULER_WIDTH) / zoom,
  );
  const visibleStartY = Math.max(0, -pan.y / zoom);
  const visibleEndY = Math.min(
    CANVAS_HEIGHT,
    (-pan.y + viewportHeight - RULER_HEIGHT) / zoom,
  );

  const startXFeet = Math.floor(visibleStartX / PIXELS_PER_FOOT);
  const endXFeet = Math.ceil(visibleEndX / PIXELS_PER_FOOT);
  const startYFeet = Math.floor(visibleStartY / PIXELS_PER_FOOT);
  const endYFeet = Math.ceil(visibleEndY / PIXELS_PER_FOOT);

  const horizontalMarks = [];
  for (let feet = startXFeet; feet <= endXFeet; feet++) {
    const xPos = feet * PIXELS_PER_FOOT;
    const screenX = (xPos + pan.x / zoom) * zoom + RULER_WIDTH;

    if (screenX >= RULER_WIDTH && screenX <= viewportWidth) {
      horizontalMarks.push(
        <div
          key={`h-${feet}`}
          className="border-gray-400 absolute border-l"
          style={{left: screenX, height: RULER_HEIGHT, top: 0}}
        >
          <div
            className="font-mono text-gray-700 absolute whitespace-nowrap rounded bg-white/80 px-1 text-xs font-semibold"
            style={{top: 2, left: -10, fontSize: '10px', lineHeight: '12px'}}
          >
            {feet}'
          </div>
        </div>,
      );
    }
  }

  const verticalMarks = [];
  for (let feet = startYFeet; feet <= endYFeet; feet++) {
    const yPos = feet * PIXELS_PER_FOOT;
    const screenY = (yPos + pan.y / zoom) * zoom + RULER_HEIGHT;

    if (screenY >= RULER_HEIGHT && screenY <= viewportHeight) {
      verticalMarks.push(
        <div
          key={`v-${feet}`}
          className="border-gray-400 absolute border-t"
          style={{top: screenY, width: RULER_WIDTH, left: 0}}
        >
          <div
            className="font-mono text-gray-700 absolute whitespace-nowrap rounded bg-white/80 px-1 text-xs font-semibold"
            style={{left: 2, top: -6, fontSize: '10px', lineHeight: '12px'}}
          >
            {feet}'
          </div>
        </div>,
      );
    }
  }

  return (
    <>
      <div
        className="border-gray-300 absolute top-0 z-10 overflow-hidden border-b bg-white/95 shadow-sm backdrop-blur-sm"
        style={{height: RULER_HEIGHT, left: RULER_WIDTH, right: 0}}
      >
        <div className="relative h-full w-full">{horizontalMarks}</div>
      </div>
      <div
        className="border-gray-300 absolute left-0 z-10 overflow-hidden border-r bg-white/95 shadow-sm backdrop-blur-sm"
        style={{width: RULER_WIDTH, top: RULER_HEIGHT, bottom: 0}}
      >
        <div className="relative h-full w-full">{verticalMarks}</div>
      </div>
      <div
        className="bg-gray-100 border-gray-300 absolute left-0 top-0 z-20 flex items-center justify-center border-b border-r"
        style={{width: RULER_WIDTH, height: RULER_HEIGHT}}
      >
        <span className="font-mono text-gray-600 text-xs font-semibold">
          ft
        </span>
      </div>
    </>
  );
});

// Memoized Boundary Lines Component
const BoundaryLines = React.memo(
  ({
    boundaries,
    isDrawingBoundary,
    currentBoundary,
    currentMouse,
    zoom,
  }: {
    boundaries: Boundary[];
    isDrawingBoundary: boolean;
    currentBoundary: Position[];
    currentMouse: Position | null;
    zoom: number;
  }) => {
    const allBoundaries = useMemo(() => {
      const result = [...boundaries];
      if (isDrawingBoundary && currentBoundary.length > 0) {
        result.push({
          id: 'current',
          points: currentBoundary,
          isComplete: false,
        });
      }
      return result;
    }, [boundaries, isDrawingBoundary, currentBoundary]);

    return (
      <>
        {allBoundaries.map((boundary) => {
          if (boundary.points.length < 2) return null;

          let pathData = boundary.points
            .map(
              (point, index) =>
                `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`,
            )
            .join(' ');

          if (
            !boundary.isComplete &&
            currentMouse &&
            boundary.points.length > 0
          ) {
            pathData += ` L ${currentMouse.x} ${currentMouse.y}`;
          }

          return (
            <svg
              key={boundary.id}
              className="pointer-events-none absolute left-0 top-0 h-full w-full"
              style={{
                pointerEvents: boundary.isComplete ? 'auto' : 'none',
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
              }}
            >
              <path
                d={pathData}
                stroke={
                  boundary.color ||
                  (boundary.isComplete ? '#3B82F6' : '#10B981')
                }
                strokeWidth={2 / zoom}
                fill="none"
                strokeDasharray={boundary.isComplete ? 'none' : '5,5'}
              />
            </svg>
          );
        })}
      </>
    );
  },
);

// Memoized Shape Preview Component
const ShapePreview = React.memo(
  ({
    isDrawingShape,
    shapeStartPos,
    currentMouse,
    selectedShape,
  }: {
    isDrawingShape: boolean;
    shapeStartPos: Position | null;
    currentMouse: Position | null;
    selectedShape: string | null;
  }) => {
    if (
      !isDrawingShape ||
      !shapeStartPos ||
      !currentMouse ||
      !selectedShape ||
      selectedShape === 'text'
    )
      return null;

    const width = Math.abs(currentMouse.x - shapeStartPos.x);
    const height = Math.abs(currentMouse.y - shapeStartPos.y);
    const x = Math.min(shapeStartPos.x, currentMouse.x);
    const y = Math.min(shapeStartPos.y, currentMouse.y);

    const getShapeColor = () => {
      switch (selectedShape) {
        case 'square':
        case 'rectangle':
          return '#3B82F6';
        case 'circle':
          return '#10B981';
        case 'triangle':
          return '#EF4444';
        default:
          return '#6B7280';
      }
    };

    switch (selectedShape) {
      case 'square':
      case 'rectangle':
        return (
          <div
            className="pointer-events-none absolute border-2 border-dashed"
            style={{
              left: x,
              top: y,
              width,
              height,
              borderColor: getShapeColor(),
              opacity: 0.7,
            }}
          />
        );
      case 'circle':
        return (
          <div
            className="pointer-events-none absolute rounded-full border-2 border-dashed"
            style={{
              left: x,
              top: y,
              width: Math.max(width, height),
              height: Math.max(width, height),
              borderColor: getShapeColor(),
              opacity: 0.7,
            }}
          />
        );
      case 'triangle':
        return (
          <svg
            width={width}
            height={height}
            className="pointer-events-none absolute"
            style={{left: x, top: y, opacity: 0.7}}
          >
            <polygon
              points={`${width / 2},0 0,${height} ${width},${height}`}
              fill="none"
              stroke={getShapeColor()}
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>
        );
      default:
        return null;
    }
  },
);

// Memoized Object Component
const CanvasObject = React.memo(
  ({
    obj,
    isSelected,
    isDrawingBoundary,
    isDrawingShape,
    onToggleSelection,
    onUpdateObject,
  }: {
    obj: CateringObject;
    isSelected: boolean;
    isDrawingBoundary: boolean;
    isDrawingShape: boolean;
    onToggleSelection: (id: string, shiftKey?: boolean) => void;
    onUpdateObject: (id: string, updates: Partial<CateringObject>) => void;
  }) => {
    const handleObjectClick = useCallback(
      (e: React.MouseEvent) => {
        if (!isDrawingBoundary && !isDrawingShape) {
          onToggleSelection(obj.id, e.shiftKey);
          e.stopPropagation();
        }
      },
      [isDrawingBoundary, isDrawingShape, obj.id, onToggleSelection],
    );

    const handleDoubleClick = useCallback(() => {
      if (!isDrawingBoundary && !isDrawingShape) {
        const newLabel = prompt('Enter label:', obj.label || '');
        if (newLabel !== null) {
          onUpdateObject(obj.id, {label: newLabel});
        }
      }
    }, [isDrawingBoundary, isDrawingShape, obj.id, obj.label, onUpdateObject]);

    const handleDragStop = useCallback(
      (e: any, d: any) => {
        onUpdateObject(obj.id, {position: {x: d.x, y: d.y}});
      },
      [obj.id, onUpdateObject],
    );

    const handleResizeStop = useCallback(
      (e: any, direction: any, ref: any, delta: any, position: any) => {
        onUpdateObject(obj.id, {
          size: {
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
          },
          position: {x: position.x, y: position.y},
        });
      },
      [obj.id, onUpdateObject],
    );

    // Static component rendering
    if (obj.category === 'static' && obj.component) {
      const StaticComp = obj.component;
      return (
        <Rnd
          key={obj.id}
          size={{width: obj.size.width, height: obj.size.height}}
          position={{x: obj.position.x, y: obj.position.y}}
          bounds="parent"
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
          enableResizing={!isDrawingBoundary && !isDrawingShape}
          className={`group box-border flex items-center justify-center overflow-visible text-center text-xs font-medium transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''} ${isDrawingBoundary || isDrawingShape ? 'pointer-events-none' : ''}`}
          style={{
            cursor: isDrawingBoundary || isDrawingShape ? 'default' : 'move',
            transform: `rotate(${obj.rotation}deg)`,
          }}
          onClick={handleObjectClick}
          disableDragging={isDrawingBoundary || isDrawingShape}
        >
          <div className="grid h-full w-full place-content-center">
            <StaticComp width={obj.size.width} height={obj.size.height} />
            {obj.label && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 text-center text-xs text-white">
                {obj.label}
              </div>
            )}
          </div>
        </Rnd>
      );
    }

    // Normal shapes/icons rendering
    const renderShapeContent = () => {
      switch (obj.type) {
        case 'square':
        case 'rectangle':
          return (
            <div className="relative h-full w-full">
              <div
                className="h-full w-full rounded-lg border-2 transition-all duration-200"
                style={{
                  borderColor: obj.borderColor || obj.color || '#3B82F6',
                  backgroundColor:
                    obj.backgroundColor ||
                    (isSelected
                      ? `${obj.borderColor || obj.color || '#3B82F6'}20`
                      : 'transparent'),
                }}
              />
            </div>
          );
        case 'circle':
          return (
            <div className="relative h-full w-full">
              <div
                className="h-full w-full rounded-full border-2 transition-all duration-200"
                style={{
                  borderColor: obj.borderColor || obj.color || '#10B981',
                  backgroundColor:
                    obj.backgroundColor ||
                    (isSelected
                      ? `${obj.borderColor || obj.color || '#10B981'}20`
                      : 'transparent'),
                }}
              />
            </div>
          );
        case 'triangle':
          return (
            <div className="relative h-full w-full">
              <svg className="h-full w-full">
                <polygon
                  points="50,10 10,90 90,90"
                  fill={
                    obj.backgroundColor ||
                    (isSelected
                      ? `${obj.borderColor || obj.color || '#EF4444'}20`
                      : 'none')
                  }
                  stroke={obj.borderColor || obj.color || '#EF4444'}
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
              </svg>
            </div>
          );
        case 'text':
          return (
            <div
              className="flex h-full w-full items-center justify-center rounded-lg p-2 text-center transition-all duration-200"
              style={{
                color: obj.color || '#1F2937',
                backgroundColor:
                  obj.backgroundColor ||
                  (isSelected ? `${obj.color || '#1F2937'}10` : 'transparent'),
                fontSize: Math.max(12, obj.size.height * 0.4),
                fontWeight: 500,
              }}
            >
              {obj.label || 'Text'}
            </div>
          );
        default:
          const icon = iconLibrary.find((i) => i.type === obj.type)?.icon;
          return (
            <div className="flex h-full w-full flex-col items-center justify-center p-2">
              <div
                className={`transition-transform duration-200 ${isSelected ? 'scale-110' : ''}`}
              >
                {icon}
              </div>
            </div>
          );
      }
    };

    return (
      <Rnd
        key={obj.id}
        bounds="parent"
        size={{width: obj.size.width, height: obj.size.height}}
        position={{x: obj.position.x, y: obj.position.y}}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        enableResizing={!isDrawingBoundary && !isDrawingShape}
        className={`group box-border flex items-center justify-center overflow-visible text-center text-xs font-medium transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''} ${isDrawingBoundary || isDrawingShape ? 'pointer-events-none' : ''}`}
        style={{
          cursor: isDrawingBoundary || isDrawingShape ? 'default' : 'move',
          transform: `rotate(${obj.rotation}deg)`,
        }}
        onClick={handleObjectClick}
        disableDragging={isDrawingBoundary || isDrawingShape}
      >
        <div
          className="flex h-full w-full flex-col items-center justify-center p-1"
          onDoubleClick={handleDoubleClick}
        >
          {renderShapeContent()}
          {obj.label && obj.type !== 'text' && (
            <span
              className="text-shadow w-full truncate rounded text-center text-xs text-black"
              style={{fontSize: Math.max(8, obj.size.height * 0.1)}}
            >
              {obj.label}
            </span>
          )}
        </div>
      </Rnd>
    );
  },
);

// Memoized Status Overlay Component
const StatusOverlay = React.memo(
  ({
    isDrawingBoundary,
    isDrawingShape,
    selectedShape,
  }: {
    isDrawingBoundary: boolean;
    isDrawingShape: boolean;
    selectedShape: string | null;
  }) => {
    return (
      <div
        className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center justify-end"
        style={{left: RULER_WIDTH + 16, right: 16}}
      >
        <div className="flex flex-col gap-2">
          {(isDrawingBoundary || isDrawingShape) && (
            <div className="rounded-xl border border-blue-300 bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-white shadow-lg">
              <div className="flex items-center gap-2 font-medium">
                <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
                {isDrawingBoundary && 'Drawing Boundary - Click to add points'}
                {isDrawingShape &&
                  selectedShape === 'text' &&
                  'Click to place text label'}
                {isDrawingShape &&
                  selectedShape !== 'text' &&
                  `Drawing ${selectedShape} - Drag to set size`}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 rounded-xl bg-white px-4 py-3 text-black shadow-lg dark:bg-black dark:text-white">
            <div className="bg-gray-300 h-4 w-px"></div>
            <div className="text-gray-600 text-sm dark:text-white">
              Scale: 1ft = {PIXELS_PER_FOOT}px
            </div>
          </div>
        </div>
      </div>
    );
  },
);

const Canvas: React.FC<CanvasProps> = ({
  objects,
  boundaries,
  selectedObjects,
  selectedBoundary,
  isDrawingBoundary,
  isDrawingShape,
  selectedShape,
  currentBoundary,
  currentMouse,
  shapeStartPos,
  zoom,
  pan,
  showGrid,
  canvasRef,
  updateObject,
  toggleObjectSelection,
  selectBoundary,
  clearSelection,
  handleCanvasMouseDown,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleWheel,
  handleShapeMouseDown,
  handleShapeMouseUp,
}) => {
  // Throttled mouse move handler
  const lastMouseMoveTime = useRef(0);
  const throttledMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseMoveTime.current > 16) {
        // ~60fps
        lastMouseMoveTime.current = now;
        handleMouseMove(e);
      }
    },
    [handleMouseMove],
  );

  // Memoized objects rendering with keys
  const renderedObjects = useMemo(() => {
    return objects.map((obj) => (
      <CanvasObject
        key={obj.id}
        obj={obj}
        isSelected={selectedObjects.has(obj.id)}
        isDrawingBoundary={isDrawingBoundary}
        isDrawingShape={isDrawingShape}
        onToggleSelection={toggleObjectSelection}
        onUpdateObject={updateObject}
      />
    ));
  }, [
    objects,
    selectedObjects,
    isDrawingBoundary,
    isDrawingShape,
    toggleObjectSelection,
    updateObject,
  ]);

  const getCursor = () => {
    if (isDrawingBoundary) return 'crosshair';
    if (isDrawingShape) return 'crosshair';
    return 'grab';
  };

  return (
    <div
      className="from-gray-50 to-gray-100 relative flex-1 overflow-hidden bg-gradient-to-br"
      onMouseDown={(e) => {
        if (isDrawingShape || isDrawingBoundary) {
          handleCanvasMouseDown(e);
        } else {
          handleMouseDown(e);
        }
      }}
      onMouseMove={throttledMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Rulers */}
      <Rulers pan={pan} zoom={zoom} />

      {/* Canvas Container */}
      <div
        className="absolute bg-white/95 shadow-xl backdrop-blur-sm"
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          cursor: getCursor(),
          left: RULER_WIDTH,
          top: RULER_HEIGHT,
        }}
        ref={canvasRef}
      >
        {/* Grid */}
        <Grid showGrid={showGrid} zoom={zoom} />

        {/* Center Indicator */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
          <div className="h-2 w-2 rounded-full bg-blue-500 opacity-50"></div>
        </div>

        {/* Render boundaries */}
        <BoundaryLines
          boundaries={boundaries}
          isDrawingBoundary={isDrawingBoundary}
          currentBoundary={currentBoundary}
          currentMouse={currentMouse}
          zoom={zoom}
        />

        {/* Render shape preview */}
        <ShapePreview
          isDrawingShape={isDrawingShape}
          shapeStartPos={shapeStartPos}
          currentMouse={currentMouse}
          selectedShape={selectedShape}
        />

        {/* Render objects */}
        {renderedObjects}
      </div>

      {/* Floating Properties Panel - Fixed on right side */}
      {selectedObjects.size === 1 &&
        (() => {
          const selectedId = Array.from(selectedObjects)[0];
          const obj = objects.find((o) => o.id === selectedId);
          if (!obj) return null;

          return (
            <FloatingPropertiesPanel object={obj} updateObject={updateObject} />
          );
        })()}

      {/* Status Overlay */}
      <StatusOverlay
        isDrawingBoundary={isDrawingBoundary}
        isDrawingShape={isDrawingShape}
        selectedShape={selectedShape}
      />
    </div>
  );
};

export default React.memo(Canvas);
