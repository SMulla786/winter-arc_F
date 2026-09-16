import React from 'react';
import {Dish, ExtraDish} from '../types';
import {menucardbg} from '..';
// PDF Content remains the same as it's for print
export const PDFContent: React.FC<any> = ({
  printRef,
  subEvent,
  cateror,
  selectedPackage,
  selectedDishes,
  dishes,
  singlePackage,
  extraDishes,
  addons,
  services,
  note,
}) => {
  const groupedMenu = selectedDishes.reduce(
    (
      acc: Record<string, Array<{name: string; extra?: number}>>,
      name: string,
    ) => {
      // 1. Try to find the dish from multiple possible sources, safely
      let dish: Dish | any | undefined = null;

      // Priority 1: from general dishes array
      if (Array.isArray(dishes)) {
        dish = dishes.find((d: Dish) => d.name === name);
      }

      // Priority 2: from package dishes (if singlePackage exists)
      if (
        !dish &&
        singlePackage &&
        Array.isArray(singlePackage?.packageDishes)
      ) {
        const packageDishEntry = singlePackage.packageDishes.find(
          (pd: any) => pd?.dish?.name === name,
        );
        if (packageDishEntry?.dish) {
          dish = packageDishEntry.dish;
        }
      }

      // Priority 3: from extraDishes
      if (!dish && Array.isArray(extraDishes)) {
        dish = extraDishes.find((ed: ExtraDish) => ed.name === name);
      }

      // 2. If we still couldn't find the dish → skip this entry
      if (!dish) {
        return acc;
      }

      // 3. Safely get category name with fallback
      const cat = dish.category?.name || 'Uncategorized';

      // 4. Initialize category array if it doesn't exist
      if (!acc[cat]) {
        acc[cat] = [];
      }

      // 5. Check if this dish is extra and get its cost (safely)
      let extraCost: number | undefined = undefined;

      if (Array.isArray(extraDishes)) {
        const extraEntry = extraDishes.find(
          (ed: ExtraDish) => ed.name === name,
        );
        if (extraEntry?.cost) {
          extraCost = extraEntry.cost;
        }
      }

      // 6. Add to the group
      acc[cat].push({
        name,
        extra: extraCost,
      });

      return acc;
    },
    {} as Record<string, Array<{name: string; extra?: number}>>,
  );

  return (
    <div className="pointer-events-none absolute left-0 top-0 -z-50 h-0 w-0 overflow-hidden opacity-0">
      <div
        ref={printRef}
        className="mx-auto w-[210mm] bg-white p-8 shadow-xl"
        style={{
          minHeight: '297mm',
          backgroundImage: `url(${menucardbg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div className="text-center">
          <h1 className="font-elegant text-gray-900 text-4xl font-bold">
            {subEvent?.name || 'Event Menu'}
          </h1>
          <p className="text-gold mt-2 text-lg">
            {subEvent?.date &&
              new Date(subEvent.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
          </p>
          <p className="text-gray-700 text-sm">
            Venue: {subEvent?.address} | Guests: {subEvent?.expectedPeople}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          {cateror?.user?.image && (
            <img
              src={cateror.user.image}
              alt="Caterer"
              className="border-gold h-16 w-16 rounded-full border-2 object-cover"
            />
          )}
          <div>
            <h2 className="font-elegant text-gray-900 text-xl font-semibold">
              {cateror?.user?.fullname}
            </h2>
            <p className="text-gray-600 text-sm">
              Premium Culinary Experiences
            </p>
          </div>
        </div>

        {selectedPackage && (
          <div className="gold-gradient mt-6 rounded-lg p-4 text-center">
            <p className="text-lg font-bold text-black">
              Collection: {selectedPackage.name}
            </p>
            {selectedPackage.price && (
              <p className="text-sm text-black">
                ₹{selectedPackage.price} per guest
              </p>
            )}
          </div>
        )}

        <div className="mt-6 space-y-6">
          {Object.entries(groupedMenu).map(([cat, items]: [string, any[]]) => (
            <div key={cat} className="rounded-lg bg-white/90 p-4 shadow-sm">
              <h3 className="font-elegant text-gold mb-2 text-lg font-semibold">
                {cat}
              </h3>
              <ul className="text-gray-800 list-disc space-y-1 pl-6">
                {items.map(({name, extra}: any) => (
                  <li key={name} className="font-medium">
                    {name}
                    {extra && (
                      <span className="text-gold ml-2 text-sm font-bold">
                        (+₹{extra})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {addons.length > 0 && (
          <div className="from-gray-50 to-gray-100 mt-6 rounded-lg bg-gradient-to-r p-4">
            <h3 className="font-elegant text-gold mb-2 text-lg font-semibold">
              Premium Services
            </h3>
            <ul className="space-y-1">
              {addons.map((id: string) => {
                const s = services.find((svc: any) => svc.id === id);
                return s ? (
                  <li key={id} className="font-medium">
                    {s.name} (+₹{s.cost})
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        )}

        {note && (
          <div className="border-gold/20 bg-gold/10 mt-6 rounded-lg border p-4">
            <p className="text-gray-800 text-sm italic">
              <strong>Special Notes:</strong> {note}
            </p>
          </div>
        )}

        <div className="text-gold mt-8 text-center text-xs">
          <p>Crafted with excellence on {new Date().toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  );
};
