export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface CateringObject {
  id: string;
  type: string;
  position: Position;
  size: Size;
  rotation: number;
  label: string;
  category: string;
  locked?: boolean;
  color?: string;
  backgroundColor?: string; // NEW
  borderColor?: string;
}

export interface BoundaryPoint {
  x: number;
  y: number;
}

export interface Boundary {
  id: string;
  points: BoundaryPoint[];
  isComplete: boolean;
  color?: string;
}

export interface SavedLayout {
  id: string;
  name: string;
  objects: CateringObject[];
  boundaries: Boundary[];
  createdAt: string;
}

export interface HistoryState {
  past: {objects: CateringObject[]; boundaries: Boundary[]}[];
  future: {objects: CateringObject[]; boundaries: Boundary[]}[];
}

export interface IconDefinition {
  type: string;
  label: string;
  icon: React.ReactNode;
  category: string;
}
