/* eslint-disable */
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ChangeEvent,
} from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Sidebar = React.lazy(() => import('../EventPlanner/layout/Sidebar'));
const Toolbar = React.lazy(() => import('../EventPlanner/layout/Toolbar'));
const Canvas = React.lazy(() => import('../EventPlanner/layout/Canvas'));
import type {
  CateringObject,
  Boundary,
  Position,
  HistoryState,
  SavedLayout,
} from '../EventPlanner/layout/types';
import {
  mockDatabase,
  gridSize,
  iconLibrary,
  shapeLibrary,
} from '../EventPlanner/layout/constants';
import {
  Stage,
  BuffetArea,
  Chats,
  Entry,
  Exit,
  NoEntryZone,
  RestRoom,
  ServiceArea,
  KitchenArea,
  ReservedArea,
  Road,
  Parking,
  WashingPlace,
  WelcomeDrink,
  Soup,
  Starter,
  Toilet,
  DustBin,
} from '../EventPlanner/layout/static';
import {api} from '@/utils/axios';
import toast from 'react-hot-toast';
import {useCreateBanquet, useGetBanquetById, useUpdateBanquet} from './banquet';
import {useNavigate} from '@tanstack/react-router';
import {Route} from '@/routes/_app/_banquet/updatebanquet.$id.$name';

// Global CSS to prevent webpage scrolling
const globalStyles = `
  html, body {
    margin: 0;
    padding: 0;
    height: 100vh;
    overflow: hidden;
  }
`;

const UpdateBanquet: React.FC = () => {
  // State
  const [objects, setObjects] = useState<CateringObject[]>([]);
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(
    new Set(),
  );
  const [selectedBoundary, setSelectedBoundary] = useState<string | null>(null);
  const [layoutName, setLayoutName] = useState<string>('');
  const [savedLayouts, setSavedLayouts] = useState<SavedLayout[]>([]);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<Position>({x: 0, y: 0});
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    future: [],
  });
  const [iconSearch, setIconSearch] = useState<string>('');
  const [isDrawingBoundary, setIsDrawingBoundary] = useState<boolean>(false);
  const [currentBoundary, setCurrentBoundary] = useState<Position[]>([]);
  const [currentMouse, setCurrentMouse] = useState<Position | null>(null);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [isDrawingShape, setIsDrawingShape] = useState<boolean>(false);
  const [shapeStartPos, setShapeStartPos] = useState<Position | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [selectedSubEvent, setSelectedSubEvent] = useState<string | null>(null);
  const [isLayoutLoaded, setIsLayoutLoaded] = useState<boolean>(false);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const lastPanPosition = useRef<Position>({x: 0, y: 0});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  const {mutateAsync: UpdateBanquet} = useUpdateBanquet();
  const {id: banquetID, name: banquetName} = Route.useParams();
  const {data: SingleBanquetData, isLoading} = useGetBanquetById(banquetID!);

  const navigate = useNavigate();

  // Component mapping for static components
  const componentMap: Record<
    string,
    React.FC<{width: number; height: number}>
  > = {
    stage: Stage,
    buffetArea: BuffetArea,
    chats: Chats,
    entry: Entry,
    exit: Exit,
    noEntryZone: NoEntryZone,
    restRoom: RestRoom,
    serviceArea: ServiceArea,
    kitchenArea: KitchenArea,
    reservedArea: ReservedArea,
    road: Road,
    parking: Parking,
    washingPlace: WashingPlace,
    toilet: Toilet,
    dustBin: DustBin,
    soup: Soup,
    welcomeDrink: WelcomeDrink,
    starter: Starter,
  };

  // Save to history
  const saveToHistory = useCallback(
    (currentObjects: CateringObject[], currentBoundaries: Boundary[]) => {
      setHistory((prev) => ({
        past: [
          ...prev.past,
          {
            objects: JSON.parse(JSON.stringify(currentObjects)),
            boundaries: JSON.parse(JSON.stringify(currentBoundaries)),
          },
        ],
        future: [],
      }));
    },
    [],
  );

  // Load layout from JSON data
  const loadLayoutFromJSON = useCallback(
    (jsonData: string) => {
      try {
        if (!jsonData || jsonData === 'null') {
          setObjects([]);
          setBoundaries([]);
          setLayoutName(banquetName || 'New Layout');
          setIsLayoutLoaded(true);
          return;
        }

        const layoutData = JSON.parse(jsonData);

        // Reconstruct objects with their components
        const reconstructedObjects = (layoutData.objects || []).map(
          (obj: any) => {
            // Handle static components
            if (obj.category === 'static' && obj.type) {
              const component = componentMap[obj.type];
              if (component) {
                return {
                  ...obj,
                  component: component,
                };
              }
            }

            // Handle shapes and icons
            return {
              ...obj,
              component: undefined, // Clear component for non-static objects
            };
          },
        );

        setLayoutName(layoutData.name || banquetName || 'Loaded Layout');
        setObjects(reconstructedObjects);
        setBoundaries(layoutData.boundaries || []);
        setSelectedObjects(new Set());
        setSelectedBoundary(null);
        setIsLayoutLoaded(true);

        // Save initial state to history
        setHistory({
          past: [
            {
              objects: JSON.parse(JSON.stringify(reconstructedObjects)),
              boundaries: JSON.parse(
                JSON.stringify(layoutData.boundaries || []),
              ),
            },
          ],
          future: [],
        });
      } catch (error) {
        console.error('Error loading layout from JSON:', error);
        console.error('JSON data that failed:', jsonData);
        toast.error('Error loading layout data');

        // Fallback to empty layout
        setObjects([]);
        setBoundaries([]);
        setLayoutName(banquetName || 'New Layout');
        setIsLayoutLoaded(true);
      }
    },
    [banquetName, componentMap],
  );

  // Load layout when SingleBanquetData is available
  useEffect(() => {
    if (SingleBanquetData && !isLayoutLoaded) {
      loadLayoutFromJSON(SingleBanquetData.json);
    }
  }, [SingleBanquetData, isLayoutLoaded, loadLayoutFromJSON]);

  // Reset layout loaded state when banquet ID changes
  useEffect(() => {
    setIsLayoutLoaded(false);
  }, [banquetID]);

  // Undo action
  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);

      setObjects(previous.objects);
      setBoundaries(previous.boundaries);
      setSelectedBoundary(null);

      return {
        past: newPast,
        future: [
          {
            objects: JSON.parse(JSON.stringify(objects)),
            boundaries: JSON.parse(JSON.stringify(boundaries)),
          },
          ...prev.future,
        ],
      };
    });
  }, [objects, boundaries]);

  // Redo action
  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];
      const newFuture = prev.future.slice(1);

      setObjects(next.objects);
      setBoundaries(next.boundaries);
      setSelectedBoundary(null);

      return {
        past: [
          ...prev.past,
          {
            objects: JSON.parse(JSON.stringify(objects)),
            boundaries: JSON.parse(JSON.stringify(boundaries)),
          },
        ],
        future: newFuture,
      };
    });
  }, [objects, boundaries]);

  // Add new icon
  const addObject = useCallback(
    (type: string) => {
      const typeConfig = [...iconLibrary, ...shapeLibrary].find(
        (ot) => ot.type === type,
      );
      if (!typeConfig) return;

      const customLabel = prompt(
        `Enter label for ${typeConfig.label} (leave blank for none):`,
        '',
      );

      const newObject: CateringObject = {
        id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: typeConfig.type,
        position: {
          x: 100 + Math.random() * 200,
          y: 100 + Math.random() * 200,
        },
        size: {width: 80, height: 80},
        rotation: 0,
        label: customLabel !== null ? customLabel : '',
        category: typeConfig.category,
        color: '#000000',
      };

      saveToHistory(objects, boundaries);
      setObjects((prev) => [...prev, newObject]);
      setSelectedObjects(new Set([newObject.id]));
    },
    [objects, boundaries, saveToHistory],
  );

  // Add custom component
  const addCustomComponent = useCallback(
    (type: string, width: number, height: number) => {
      const Component = componentMap[type];
      if (!Component) return;

      const newObject: CateringObject = {
        id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        component: Component,
        position: {x: 100 + Math.random() * 200, y: 100 + Math.random() * 200},
        size: {width: width * 10, height: height * 10},
        rotation: 0,
        label: '',
        category: 'static',
        color: '#000',
      };

      saveToHistory(objects, boundaries);
      setObjects((prev) => [...prev, newObject]);
      setSelectedObjects(new Set([newObject.id]));
    },
    [componentMap, objects, boundaries, saveToHistory],
  );

  // Start shape drawing
  const startShapeDrawing = useCallback((type: string) => {
    setSelectedShape(type);
    setIsDrawingShape(true);
  }, []);

  const handleShapeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawingShape || !canvasRef.current || !selectedShape) return;
      if (e.target !== canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      const snappedX = showGrid ? Math.round(x / gridSize) * gridSize : x;
      const snappedY = showGrid ? Math.round(y / gridSize) * gridSize : y;

      if (selectedShape === 'text') {
        const customLabel = prompt('Enter text label:', '');
        if (customLabel === null || customLabel.trim() === '') {
          setIsDrawingShape(false);
          setSelectedShape(null);
          return;
        }

        const newObject: CateringObject = {
          id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'text',
          position: {x: snappedX, y: snappedY},
          size: {width: 100, height: 20},
          rotation: 0,
          label: customLabel,
          category: 'shape',
          color: '#000000',
        };

        saveToHistory(objects, boundaries);
        setObjects((prev) => [...prev, newObject]);
        setSelectedObjects(new Set([newObject.id]));
        setIsDrawingShape(false);
        setSelectedShape(null);
      } else {
        setShapeStartPos({x: snappedX, y: snappedY});
      }
    },
    [
      isDrawingShape,
      selectedShape,
      pan,
      zoom,
      showGrid,
      objects,
      boundaries,
      saveToHistory,
    ],
  );

  const handleShapeMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (
        !isDrawingShape ||
        !canvasRef.current ||
        !selectedShape ||
        !shapeStartPos ||
        selectedShape === 'text'
      )
        return;

      const rect = canvasRef.current.getBoundingClientRect();
      const endX = (e.clientX - rect.left - pan.x) / zoom;
      const endY = (e.clientY - rect.top - pan.y) / zoom;
      const snappedEndX = showGrid
        ? Math.round(endX / gridSize) * gridSize
        : endX;
      const snappedEndY = showGrid
        ? Math.round(endY / gridSize) * gridSize
        : endY;

      const width = Math.abs(snappedEndX - shapeStartPos.x);
      const height = Math.abs(snappedEndY - shapeStartPos.y);
      const x = Math.min(shapeStartPos.x, snappedEndX);
      const y = Math.min(shapeStartPos.y, snappedEndY);

      const minSize = 20;
      if (width < minSize || height < minSize) {
        alert('Shape too small. Drag further to create a shape.');
        setIsDrawingShape(false);
        setSelectedShape(null);
        setShapeStartPos(null);
        return;
      }

      const typeConfig = shapeLibrary.find((ot) => ot.type === selectedShape);
      if (!typeConfig) return;

      const customLabel = prompt(
        `Enter label for ${typeConfig.label} (leave blank for none):`,
        '',
      );

      const newObject: CateringObject = {
        id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: typeConfig.type,
        position: {x, y},
        size: {
          width: selectedShape === 'circle' ? Math.max(width, height) : width,
          height: selectedShape === 'circle' ? Math.max(width, height) : height,
        },
        rotation: 0,
        label: customLabel !== null ? customLabel : '',
        category: typeConfig.category,
        color:
          typeConfig.type === 'square' || typeConfig.type === 'rectangle'
            ? '#007bff'
            : typeConfig.type === 'circle'
              ? '#28a745'
              : '#dc3545',
      };

      saveToHistory(objects, boundaries);
      setObjects((prev) => [...prev, newObject]);
      setSelectedObjects(new Set([newObject.id]));
      setIsDrawingShape(false);
      setSelectedShape(null);
      setShapeStartPos(null);
    },
    [
      isDrawingShape,
      selectedShape,
      shapeStartPos,
      objects,
      boundaries,
      saveToHistory,
      pan,
      zoom,
      showGrid,
    ],
  );

  // Update object properties
  const updateObject = useCallback(
    (id: string, updates: Partial<CateringObject>) => {
      saveToHistory(objects, boundaries);
      setObjects((prev) => {
        const newObjects = prev.map((obj) =>
          obj.id === id ? {...obj, ...updates} : obj,
        );
        return newObjects;
      });
    },
    [objects, boundaries, saveToHistory],
  );

  // Update boundary properties
  const updateBoundary = useCallback(
    (id: string, updates: Partial<Boundary>) => {
      saveToHistory(objects, boundaries);
      setBoundaries((prev) => {
        const newBoundaries = prev.map((b) =>
          b.id === id ? {...b, ...updates} : b,
        );
        return newBoundaries;
      });
    },
    [objects, boundaries, saveToHistory],
  );

  // Handle measurement changes
  const handleMeasurementChange = useCallback(
    (id: string, field: 'width' | 'height', value: string) => {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 20) {
        alert('Please enter a valid number (minimum 20).');
        return;
      }

      saveToHistory(objects, boundaries);
      setObjects((prev) => {
        const obj = prev.find((o) => o.id === id);
        if (!obj) return prev;

        const newSize = {...obj.size};
        if (obj.type === 'circle') {
          newSize.width = numValue;
          newSize.height = numValue;
        } else {
          newSize[field] = numValue;
        }

        return prev.map((o) => (o.id === id ? {...o, size: newSize} : o));
      });
    },
    [objects, boundaries, saveToHistory],
  );

  // Delete selected objects
  const deleteSelected = useCallback(() => {
    if (selectedObjects.size === 0 && !selectedBoundary) return;

    saveToHistory(objects, boundaries);
    setObjects((prev) => prev.filter((obj) => !selectedObjects.has(obj.id)));
    if (selectedBoundary) {
      setBoundaries((prev) => prev.filter((b) => b.id !== selectedBoundary));
      setSelectedBoundary(null);
    }
    setSelectedObjects(new Set());
  }, [selectedObjects, selectedBoundary, objects, boundaries, saveToHistory]);

  // Duplicate selected objects
  const duplicateSelected = useCallback(() => {
    if (selectedObjects.size === 0) return;

    saveToHistory(objects, boundaries);
    const newObjects: CateringObject[] = [];
    const newSelected = new Set<string>();

    objects.forEach((obj) => {
      if (selectedObjects.has(obj.id)) {
        const duplicated = {
          ...obj,
          id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          position: {
            x: obj.position.x + 20,
            y: obj.position.y + 20,
          },
        };
        newObjects.push(duplicated);
        newSelected.add(duplicated.id);
      }
    });

    setObjects((prev) => [...prev, ...newObjects]);
    setSelectedObjects(newSelected);
  }, [selectedObjects, objects, boundaries, saveToHistory]);

  // Select/deselect objects
  const toggleObjectSelection = useCallback(
    (id: string, shiftKey: boolean = false) => {
      setSelectedObjects((prev) => {
        const newSelected = new Set(prev);

        if (shiftKey) {
          if (newSelected.has(id)) {
            newSelected.delete(id);
          } else {
            newSelected.add(id);
          }
        } else {
          if (newSelected.has(id) && newSelected.size === 1) {
            newSelected.clear();
          } else {
            newSelected.clear();
            newSelected.add(id);
          }
        }

        setSelectedBoundary(null);
        return newSelected;
      });
    },
    [],
  );

  // Select boundary
  const selectBoundary = useCallback((id: string) => {
    setSelectedBoundary(id);
    setSelectedObjects(new Set());
  }, []);

  // Select all objects
  const selectAll = useCallback(() => {
    setSelectedObjects(new Set(objects.map((obj) => obj.id)));
    setSelectedBoundary(null);
  }, [objects]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedObjects(new Set());
    setSelectedBoundary(null);
    setIsDrawingShape(false);
    setSelectedShape(null);
    setShapeStartPos(null);
  }, []);

  // Group selected objects
  const groupSelected = useCallback(() => {
    if (selectedObjects.size < 2) return;

    saveToHistory(objects, boundaries);
    const groupId = `group-${Date.now()}`;
    setObjects((prev) =>
      prev.map((obj) =>
        selectedObjects.has(obj.id) ? {...obj, groupId} : obj,
      ),
    );
  }, [selectedObjects, objects, boundaries, saveToHistory]);

  // Boundary drawing functions
  const startBoundaryDrawing = useCallback(() => {
    setIsDrawingBoundary(true);
    setCurrentBoundary([]);
    setCurrentMouse(null);
    setSelectedBoundary(null);
  }, []);

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isDrawingShape) {
        handleShapeMouseDown(e);
      } else if (
        isDrawingBoundary &&
        canvasRef.current &&
        e.target === canvasRef.current
      ) {
        const rect = canvasRef.current.getBoundingClientRect();
        const rawX = (e.clientX - rect.left - pan.x) / zoom;
        const rawY = (e.clientY - rect.top - pan.y) / zoom;
        const x = showGrid ? Math.round(rawX / gridSize) * gridSize : rawX;
        const y = showGrid ? Math.round(rawY / gridSize) * gridSize : rawY;

        setCurrentBoundary((prev) => [...prev, {x, y}]);
      } else if (
        e.target !== canvasRef.current &&
        e.target instanceof SVGElement
      ) {
        const boundaryId =
          e.target
            .closest('svg')
            ?.parentElement?.getAttribute('data-boundary-id') || '';
        if (boundaryId) {
          selectBoundary(boundaryId);
          e.stopPropagation();
        }
      } else {
        clearSelection();
      }
    },
    [
      isDrawingBoundary,
      isDrawingShape,
      pan,
      zoom,
      showGrid,
      handleShapeMouseDown,
      selectBoundary,
      clearSelection,
    ],
  );

  const undoLastPoint = useCallback(() => {
    if (currentBoundary.length > 0) {
      setCurrentBoundary((prev) => prev.slice(0, -1));
    }
  }, [currentBoundary]);

  const finishBoundary = useCallback(() => {
    if (currentBoundary.length < 2) {
      alert('Need at least 2 points for a boundary.');
      return;
    }

    const newBoundary: Boundary = {
      id: `boundary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      points: [...currentBoundary],
      isComplete: true,
      color: '#000000',
    };

    saveToHistory(objects, boundaries);
    setBoundaries((prev) => [...prev, newBoundary]);
    setIsDrawingBoundary(false);
    setCurrentBoundary([]);
    setCurrentMouse(null);
  }, [currentBoundary, objects, boundaries, saveToHistory]);

  const cancelBoundaryDrawing = useCallback(() => {
    setIsDrawingBoundary(false);
    setCurrentBoundary([]);
    setCurrentMouse(null);
  }, []);

  const deleteAllBoundaries = useCallback(() => {
    if (boundaries.length == 0) return;

    saveToHistory(objects, boundaries);
    setBoundaries([]);
    setSelectedBoundary(null);
  }, [objects, boundaries, saveToHistory]);

  // Zoom functions
  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.1, 0.3));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({x: 0, y: 0});
  }, []);

  // Panning handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      setIsPanning(true);
      lastPanPosition.current = {x: e.clientX, y: e.clientY};
      e.preventDefault();
    }
  }, []);

  // Handle mouse wheel for scrolling
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (
      canvasRef.current &&
      e.target instanceof Node &&
      canvasRef.current.contains(e.target)
    ) {
      e.preventDefault();

      const delta = e.deltaY;
      const deltaX = e.shiftKey ? e.deltaY : 0;
      const deltaY = e.shiftKey ? 0 : e.deltaY;

      setPan((prev) => ({
        x: prev.x - deltaX * 0.5,
        y: prev.y - deltaY * 0.5,
      }));
    }
  }, []);

  // Auto-scroll during drawing or resizing
  const handleAutoScroll = useCallback(
    (mousePos: Position) => {
      if (!canvasRef.current || (!isDrawingShape && !selectedObjects.size))
        return;

      const rect = canvasRef.current.getBoundingClientRect();
      const threshold = 50;
      const scrollSpeed = 10;

      let scrollX = 0;
      let scrollY = 0;

      if (mousePos.x < rect.left + threshold) {
        scrollX = -scrollSpeed;
      } else if (mousePos.x > rect.right - threshold) {
        scrollX = scrollSpeed;
      }

      if (mousePos.y < rect.top + threshold) {
        scrollY = -scrollSpeed;
      } else if (mousePos.y > rect.bottom - threshold) {
        scrollY = scrollSpeed;
      }

      if (scrollX !== 0 || scrollY !== 0) {
        if (!autoScrollRef.current) {
          autoScrollRef.current = setInterval(() => {
            setPan((prev) => ({
              x: prev.x + scrollX,
              y: prev.y + scrollY,
            }));
          }, 16);
        }
      } else {
        if (autoScrollRef.current) {
          clearInterval(autoScrollRef.current);
          autoScrollRef.current = null;
        }
      }
    },
    [isDrawingShape, selectedObjects.size],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        const deltaX = e.clientX - lastPanPosition.current.x;
        const deltaY = e.clientY - lastPanPosition.current.y;

        setPan((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));

        lastPanPosition.current = {x: e.clientX, y: e.clientY};
      }

      if (isDrawingBoundary && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const rawX = (e.clientX - rect.left - pan.x) / zoom;
        const rawY = (e.clientY - rect.top - pan.y) / zoom;
        const x = showGrid ? Math.round(rawX / gridSize) * gridSize : rawX;
        const y = showGrid ? Math.round(rawY / gridSize) * gridSize : rawY;
        setCurrentMouse({x, y});
      }

      if (
        isDrawingShape &&
        shapeStartPos &&
        canvasRef.current &&
        selectedShape !== 'text'
      ) {
        const rect = canvasRef.current.getBoundingClientRect();
        const rawX = (e.clientX - rect.left - pan.x) / zoom;
        const rawY = (e.clientY - rect.top - pan.y) / zoom;
        const x = showGrid ? Math.round(rawX / gridSize) * gridSize : rawX;
        const y = showGrid ? Math.round(rawY / gridSize) * gridSize : rawY;
        setCurrentMouse({x, y});
      }

      handleAutoScroll({x: e.clientX, y: e.clientY});
    },
    [
      isPanning,
      isDrawingBoundary,
      isDrawingShape,
      shapeStartPos,
      selectedShape,
      pan,
      zoom,
      showGrid,
      handleAutoScroll,
    ],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isDrawingShape && selectedShape !== 'text') {
        handleShapeMouseUp(e);
      }
      setIsPanning(false);
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
        autoScrollRef.current = null;
      }
    },
    [isDrawingShape, selectedShape, handleShapeMouseUp],
  );

  // Save layout
  const saveLayout = useCallback(async () => {
    // Create a serializable version of objects without React components
    const serializableObjects = objects.map((obj) => ({
      ...obj,
      component: undefined, // Remove React component as it's not serializable
      componentType: obj.category === 'static' ? obj.type : undefined, // Store the type for reconstruction
    }));

    const layout: SavedLayout = {
      name: layoutName,
      objects: serializableObjects,
      boundaries: boundaries,
      createdAt: new Date().toISOString(),
    };

    try {
      await UpdateBanquet({
        id: banquetID,
        name: layoutName,
        json: JSON.stringify(layout),
      });
      toast.success('Banquet updated successfully!');
    } catch (error) {
      console.error('Error updating banquet:', error);
      toast.error('Error updating banquet');
    }
  }, [layoutName, objects, boundaries, banquetID, UpdateBanquet]);

  // Export to JSON
  const exportToJSON = useCallback(() => {
    // Create a serializable version of objects without React components
    const serializableObjects = objects.map((obj) => ({
      ...obj,
      component: undefined, // Remove React component as it's not serializable
      componentType: obj.category === 'static' ? obj.type : undefined, // Store the type for reconstruction
    }));

    const layout = {
      name: layoutName,
      objects: serializableObjects,
      boundaries,
      version: '1.0',
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(layout, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${layoutName.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [layoutName, objects, boundaries]);

  // Trigger import
  const triggerImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle imported file
  const handleFileImport = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = event.target?.result as string;
          loadLayoutFromJSON(jsonData);

          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }

          toast.success('Layout imported successfully!');
        } catch (error) {
          console.error('Import error:', error);
          toast.error('Error importing layout: Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    },
    [loadLayoutFromJSON],
  );

  // Load layout
  const loadLayout = useCallback((layoutId: string) => {
    const layout = mockDatabase.getLayout(layoutId);
    if (layout) {
      setObjects(JSON.parse(JSON.stringify(layout.objects)));
      setBoundaries(JSON.parse(JSON.stringify(layout.boundaries || [])));
      setLayoutName(layout.name);
      setSelectedObjects(new Set());
      setSelectedBoundary(null);
    }
  }, []);

  // Delete layout
  const deleteLayout = useCallback((layoutId: string) => {
    if (window.confirm('Are you sure you want to delete this layout?')) {
      mockDatabase.deleteLayout(layoutId);
      setSavedLayouts(mockDatabase.getLayouts());
    }
  }, []);

  // Export as image
  const exportAsImage = useCallback(async () => {
    if (!canvasRef.current || isExporting) return;

    try {
      setIsExporting(true);
      const originalCursor = document.body.style.cursor;
      document.body.style.cursor = 'wait';

      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: canvasRef.current.scrollWidth,
        height: canvasRef.current.scrollHeight,
      });

      const link = document.createElement('a');
      link.download = `${layoutName.replace(/[^a-z0-9]/gi, '_')}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      document.body.style.cursor = originalCursor;
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Error exporting image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [layoutName, isExporting]);

  // Export as PDF
  const exportAsPDF = useCallback(async () => {
    if (!canvasRef.current || isExporting) return;

    try {
      setIsExporting(true);
      const originalCursor = document.body.style.cursor;
      document.body.style.cursor = 'wait';

      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: canvasRef.current.scrollWidth,
        height: canvasRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${layoutName.replace(/[^a-z0-9]/gi, '_')}.pdf`);

      document.body.style.cursor = originalCursor;
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [layoutName, isExporting]);

  // Initialize saved layouts
  useEffect(() => {
    setSavedLayouts(mockDatabase.getLayouts());
  }, []);

  // Apply global styles
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = globalStyles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Clean up auto-scroll interval on unmount
  useEffect(() => {
    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
        autoScrollRef.current = null;
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (isDrawingBoundary) {
          undoLastPoint();
        } else {
          deleteSelected();
        }
      } else if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        selectAll();
      } else if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        duplicateSelected();
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (e.key === 'g' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        groupSelected();
      } else if (e.key === 'Escape') {
        clearSelection();
        if (isDrawingBoundary) {
          cancelBoundaryDrawing();
        }
      } else if (e.key === 'Enter' && isDrawingBoundary) {
        finishBoundary();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    deleteSelected,
    selectAll,
    duplicateSelected,
    undo,
    redo,
    groupSelected,
    clearSelection,
    isDrawingBoundary,
    cancelBoundaryDrawing,
    finishBoundary,
    undoLastPoint,
  ]);

  // Show loading state while data is being fetched
  if (isLoading || !isLayoutLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-lg">Loading banquet layout...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        selectedObjects={selectedObjects}
        selectedBoundary={selectedBoundary}
        objects={objects}
        boundaries={boundaries}
        updateObject={updateObject}
        updateBoundary={updateBoundary}
        handleMeasurementChange={handleMeasurementChange}
        addCustomComponent={addCustomComponent}
        savedLayouts={savedLayouts}
        loadLayout={loadLayout}
        deleteLayout={deleteLayout}
      />

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <div className="mx-4 mb-4">
          <label className="mb-2 block" htmlFor="subEventSelect">
            Banquet Name
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              id="subEventSelect"
              className="border-gray-300 w-full rounded-md border px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-black"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              placeholder="Enter banquet name"
            />
            <button
              className="disabled:bg-gray-400 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              onClick={saveLayout}
              disabled={!layoutName.trim()}
            >
              Update
            </button>
          </div>
        </div>
        <Toolbar
          zoom={zoom}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          resetZoom={resetZoom}
          selectedShape={selectedShape}
          isDrawingShape={isDrawingShape}
          isDrawingBoundary={isDrawingBoundary}
          boundaries={boundaries}
          currentBoundary={currentBoundary}
          startShapeDrawing={startShapeDrawing}
          startBoundaryDrawing={startBoundaryDrawing}
          finishBoundary={finishBoundary}
          cancelBoundaryDrawing={cancelBoundaryDrawing}
          undoLastPoint={undoLastPoint}
          deleteAllBoundaries={deleteAllBoundaries}
          saveLayout={saveLayout}
          exportToJSON={exportToJSON}
          triggerImport={triggerImport}
          handleFileImport={handleFileImport}
          undo={undo}
          redo={redo}
          exportAsImage={exportAsImage}
          exportAsPDF={exportAsPDF}
          fileInputRef={fileInputRef}
        />

        <Canvas
          objects={objects}
          boundaries={boundaries}
          selectedObjects={selectedObjects}
          selectedBoundary={selectedBoundary}
          isDrawingBoundary={isDrawingBoundary}
          isDrawingShape={isDrawingShape}
          selectedShape={selectedShape}
          currentBoundary={currentBoundary}
          currentMouse={currentMouse}
          shapeStartPos={shapeStartPos}
          zoom={zoom}
          pan={pan}
          showGrid={showGrid}
          canvasRef={canvasRef}
          updateObject={updateObject}
          toggleObjectSelection={toggleObjectSelection}
          selectBoundary={selectBoundary}
          clearSelection={clearSelection}
          handleCanvasMouseDown={handleCanvasMouseDown}
          handleMouseDown={handleMouseDown}
          handleMouseMove={handleMouseMove}
          handleMouseUp={handleMouseUp}
          handleWheel={handleWheel}
          handleShapeMouseDown={handleShapeMouseDown}
          handleShapeMouseUp={handleShapeMouseUp}
        />

        {/* File input for import */}
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

export default UpdateBanquet;
