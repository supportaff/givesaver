'use client';
import { useState, useMemo } from 'react';

const FOOD_TYPES = [
  { key: 'cooked',      label: 'Cooked Meals',      kgPerUnit: 0.3,  mealsPerKg: 3.3, co2PerKg: 2.5  },
  { key: 'rice',        label: 'Rice / Grains',     kgPerUnit: 1,    mealsPerKg: 6,   co2PerKg: 2.7  },
  { key: 'vegetables',  label: 'Vegetables',        kgPerUnit: 1,    mealsPerKg: 4,   co2PerKg: 2.0  },
  { key: 'fruits',      label: 'Fruits',            kgPerUnit: 1,    mealsPerKg: 3,   co2PerKg: 1.1  },
  { key: 'bread',       label: 'Bread / Bakery',    kgPerUnit: 0.5,  mealsPerKg: 5,   co2PerKg: 1.3  },
  { key: 'packaged',    label: 'Packaged Food',     kgPerUnit: 0.4,  mealsPerKg: 2.5, co2PerKg: 3.0  },
];

export default function FoodCalculator() {
  const [type,     setType]     = useState(FOOD_TYPES[0].key);
  const [quantity, setQuantity] = useState(5);

  const selected = useMemo(() => FOOD_TYPES.find((f) => f.key === type)!, [type]);

  const kgTotal  = quantity * selected.kgPerUnit;
  const meals    = Math.round(kgTotal * selected.mealsPerKg);
  const co2Saved = (kgTotal * selected.co2PerKg).toFixed(1);
  const people   = Math.round(meals / 2); // avg 2 meals/person/day
  const value    = Math.round(kgTotal * 60); // ₹60/kg avg

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          {/* Food type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Food Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="input-field bg-white">
              {FOOD_TYPES.map((f) => (
                <option key={f.key} value={f.key}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Quantity &nbsp;
              <span className="font-normal text-gray-400 text-xs">
                ({selected.key === 'cooked' ? 'portions' : 'kg'})
              </span>
            </label>
            <input
              type="number" min={1} max={500} value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="input-field bg-white"
            />
            <input
              type="range" min={1} max={100} value={Math.min(quantity, 100)}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full mt-2 accent-green-600"
            />
          </div>
        </div>

        {/* Result cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { emoji: '🍽️', value: meals,              label: 'Meals Provided',    color: 'bg-orange-50 border-orange-200' },
            { emoji: '👨‍👩‍👧', value: `~${people}`,       label: 'People Fed Today',  color: 'bg-blue-50 border-blue-200'   },
            { emoji: '🌍', value: `${co2Saved} kg`,   label: 'CO₂ Saved',        color: 'bg-green-50 border-green-200' },
            { emoji: '💰', value: `₹${value}`,         label: 'Food Value Saved',  color: 'bg-purple-50 border-purple-200'},
          ].map((r) => (
            <div key={r.label} className={`rounded-xl border p-3 text-center ${r.color}`}>
              <div className="text-2xl mb-1">{r.emoji}</div>
              <div className="text-xl font-bold text-gray-800">{r.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{r.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 text-center">
          <p className="text-sm text-gray-500 mb-3">
            Donating <strong>{quantity} {selected.key === 'cooked' ? 'portions' : 'kg'}</strong> of{' '}
            <strong>{selected.label.toLowerCase()}</strong> could feed approximately{' '}
            <strong className="text-green-700">{people} people</strong> for a day.
          </p>
          <a href="/donate"
            className="btn-primary inline-block">
            Donate This Now →
          </a>
        </div>
      </div>
      <p className="text-xs text-gray-400 text-center mt-3">
        Estimates based on FSSAI food waste guidelines and average Indian meal portion sizes.
      </p>
    </div>
  );
}
