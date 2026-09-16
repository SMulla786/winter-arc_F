// import React from "react";
// import PropertiesPanel from "./PropertiesPanel";
// import StaticComponentsPanel from "./StaticComponentsPanel";
// import type { CateringObject, Boundary } from "./types";

// interface SidebarProps {
//   selectedObjects: Set<string>;
//   selectedBoundary: string | null;
//   objects: CateringObject[];
//   boundaries: Boundary[];
//   updateObject: (id: string, updates: Partial<CateringObject>) => void;
//   updateBoundary: (id: string, updates: Partial<Boundary>) => void;
//   handleMeasurementChange: (
//     id: string,
//     field: "width" | "height",
//     value: string
//   ) => void;
//   addCustomComponent: (
//     type: "stage" | "toilet" | "vip",
//     width: number,
//     height: number
//   ) => void;
// }

// const Sidebar: React.FC<SidebarProps> = (props) => {
//   const [showPropertiesPopup, setShowPropertiesPopup] = React.useState(false);

//   // Auto-show properties when selection changes
//   React.useEffect(() => {
//     if (props.selectedObjects.size > 0 || props.selectedBoundary) {
//       setShowPropertiesPopup(true);
//     } else {
//       setShowPropertiesPopup(false);
//     }
//   }, [props.selectedObjects, props.selectedBoundary]);

//   return (
//     <>
//       {/* Properties Popup */}
//       {showPropertiesPopup && (
//         <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
//           {/* Backdrop */}
//           <div
//             className="absolute inset-0 bg-black/20"
//             onClick={() => setShowPropertiesPopup(false)}
//           />

//           {/* Properties Panel */}
//           <div className="relative w-80 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[80vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 {props.selectedBoundary
//                   ? "Boundary Properties"
//                   : "Object Properties"}
//               </h3>
//               <button
//                 onClick={() => setShowPropertiesPopup(false)}
//                 className="p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
//               >
//                 <svg
//                   className="w-5 h-5 text-gray-500"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>

//             <PropertiesPanel
//               selectedObjects={props.selectedObjects}
//               selectedBoundary={props.selectedBoundary}
//               objects={props.objects}
//               boundaries={props.boundaries}
//               updateObject={props.updateObject}
//               updateBoundary={props.updateBoundary}
//               handleMeasurementChange={props.handleMeasurementChange}
//             />
//           </div>
//         </div>
//       )}

//       {/* Main Sidebar - Only Static Components */}
//       <div className="w-22 bg-gray-50 border-gray-200 flex flex-col overflow-y-auto overflow-x-hidden">
//         <div className="p-4  border-gray-200">
//           {/* <h2 className="text-lg font-semibold text-gray-900">Components</h2> */}
//         </div>

//         <StaticComponentsPanel addCustomComponent={props.addCustomComponent} />
//       </div>
//     </>
//   );
// };

// export default Sidebar;

import React from 'react';
import {
  Tag as StageIcon,
  User,
  Square,
  Wrench,
  GlassWater,
  CupSoda,
  Utensils,
  Pizza,
  UtensilsCrossed,
  Flame,
  Car,
  Map,
  ShowerHead,
  Droplets,
  Bed,
  Trash2,
  Ban,
  DoorOpen,
  DoorClosed,
} from 'lucide-react';

interface StaticComponentsPanelProps {
  addCustomComponent: (type: string, width: number, height: number) => void;
}

const FOOT_TO_PIXEL = 5;

const staticComponents = [
  {type: 'stage', label: 'Stage', icon: StageIcon},
  {type: 'reservedArea', label: 'Reserved Area', icon: Square},
  {type: 'serviceArea', label: 'Service Area', icon: Wrench},
  {type: 'welcomeDrink', label: 'Welcome Drink', icon: GlassWater},
  {type: 'soup', label: 'Soup', icon: CupSoda},
  {type: 'starter', label: 'Starter', icon: Utensils},
  {type: 'chats', label: 'Chats', icon: Pizza},
  {type: 'buffetArea', label: 'Buffet Area', icon: UtensilsCrossed},
  {type: 'kitchenArea', label: 'Kitchen Area', icon: Flame},
  {type: 'parking', label: 'Parking', icon: Car},
  {type: 'road', label: 'Road', icon: Map},
  {type: 'washingPlace', label: 'Washing Place', icon: ShowerHead},
  {type: 'toilet', label: 'Toilet', icon: Droplets},
  {type: 'restRoom', label: 'Rest Room', icon: Bed},
  {type: 'dustBin', label: 'Dust Bin', icon: Trash2},
  {type: 'noEntryZone', label: 'No Entry Zone', icon: Ban},
  {type: 'entry', label: 'Entry', icon: DoorOpen},
  {type: 'exit', label: 'Exit', icon: DoorClosed},
];

const StaticComponentsPanel: React.FC<StaticComponentsPanelProps> = ({
  addCustomComponent,
}) => {
  const handleAddComponent = (type: string, label: string) => {
    const input = prompt(
      `Enter dimensions for ${label} (Width x Height in ft, e.g., 6 x 2):`,
    );
    if (!input) return;

    const parts = input.split('x').map((v) => parseFloat(v.trim()));
    if (parts.length !== 2 || parts.some(isNaN)) {
      alert('Invalid format. Use Width x Height (e.g., 6 x 2).');
      return;
    }

    const [widthFt, heightFt] = parts;
    const widthPx = widthFt * FOOT_TO_PIXEL;
    const heightPx = heightFt * FOOT_TO_PIXEL;

    addCustomComponent(type, widthPx, heightPx);
  };

  return (
    <div className="mt-36 bg-white p-3 dark:bg-black">
      <div className="grid grid-cols-2 gap-1">
        {staticComponents.map((comp) => {
          const Icon = comp.icon;
          return (
            <button
              key={comp.type}
              onClick={() => handleAddComponent(comp.type, comp.label)}
              className="flex flex-col items-center justify-center gap-1 rounded-lg p-1 shadow-sm"
            >
              <Icon className="h-6 w-6 text-blue-600" />
              <span className="text-gray-700 text-center text-xs font-medium">
                {comp.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StaticComponentsPanel;
