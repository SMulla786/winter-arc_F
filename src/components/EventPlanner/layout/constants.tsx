/* eslint-disable */
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as GiIcons from 'react-icons/gi';
import type {IconDefinition} from './types';

export const mockDatabase = {
  layouts: [] as any[],
  saveLayout: (layout: any) => {
    const existingIndex = mockDatabase.layouts.findIndex(
      (l: any) => l.id === layout.id,
    );
    if (existingIndex >= 0) {
      mockDatabase.layouts[existingIndex] = layout;
    } else {
      mockDatabase.layouts.push(layout);
    }
    return layout;
  },
  getLayouts: () => [...mockDatabase.layouts],
  getLayout: (id: string) => mockDatabase.layouts.find((l: any) => l.id === id),
};

export const iconLibrary: IconDefinition[] = [
  ...Object.entries(FaIcons).map(([key, Icon]) => ({
    type: `fa-${key}`,
    label: key.replace(/([A-Z])/g, ' $1').trim(),
    icon: <Icon size={24} />,
    category: 'custom-icon',
  })),
  ...Object.entries(MdIcons).map(([key, Icon]) => ({
    type: `md-${key}`,
    label: key.replace(/([A-Z])/g, ' $1').trim(),
    icon: <Icon size={24} />,
    category: 'custom-icon',
  })),
  ...Object.entries(GiIcons).map(([key, Icon]) => ({
    type: `gi-${key}`,
    label: key.replace(/([A-Z])/g, ' $1').trim(),
    icon: <Icon size={24} />,
    category: 'custom-icon',
  })),
];

export const shapeLibrary: IconDefinition[] = [
  {
    type: 'rectangle',
    label: 'Rectangle',
    icon: (
      <svg width="32" height="24" viewBox="0 0 32 24">
        <rect
          x="2"
          y="2"
          width="28"
          height="20"
          fill="none"
          stroke="#007bff"
          strokeWidth="2"
        />
      </svg>
    ),
    category: 'shape',
  },
  {
    type: 'circle',
    label: 'Circle',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="#28a745"
          strokeWidth="2"
        />
      </svg>
    ),
    category: 'shape',
  },
  {
    type: 'text',
    label: 'Text Label',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24">
        <text x="2" y="16" fontSize="16" fill="#000000">
          T
        </text>
      </svg>
    ),
    category: 'shape',
  },
];

export const categories = [
  {id: 'custom-icon', name: 'Custom Icons', color: '#3B82F6'},
  {id: 'shape', name: 'Shapes', color: '#28a745'},
];

export const gridSize = 50;
