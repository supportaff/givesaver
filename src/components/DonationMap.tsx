'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DonationRow } from '@/lib/supabase/types';
import Link from 'next/link';

// Chennai bounding box centre
const CHENNAI: [number, number] = [13.0827, 80.2707];

// Category pin colours
const PIN_COLORS: Record<string, string> = {
  FOOD:    '#f97316', // orange
  CLOTHES: '#3b82f6', // blue
  BOOKS:   '#a855f7', // purple
  DEFAULT: '#22c55e', // green fallback
};

const CAT_EMOJI: Record<string, string> = {
  FOOD: '\ud83c\udf71',
  CLOTHES: '\ud83d\udc55',
  BOOKS: '\ud83d\udcda',
};

function makePinIcon(category: string): L.DivIcon {
  const color = PIN_COLORS[category] ?? PIN_COLORS.DEFAULT;
  const emoji = CAT_EMOJI[category] ?? '\ud83d\udce6';
  return L.divIcon({
    className: '',
    html: `
      <div style="
        background:${color};
        width:36px;height:36px;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="transform:rotate(45deg);font-size:16px;line-height:1;">${emoji}</span>
      </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  });
}

// Fix default icon 404 in Next.js
function FixLeafletIcons() {
  const map = useMap();
  useEffect(() => { map.invalidateSize(); }, [map]);
  return null;
}

interface Props {
  donations: DonationRow[];
}

// Chennai area lookup — map common area names to rough lat/lng
// Fallback: geocode via Nominatim only if lat/lng columns exist; otherwise use area-based lookup
const AREA_COORDS: Record<string, [number, number]> = {
  'anna nagar':       [13.0891, 80.2100],
  'adyar':            [13.0067, 80.2559],
  'velachery':        [12.9815, 80.2180],
  'tambaram':         [12.9249, 80.1000],
  'porur':            [13.0337, 80.1564],
  't nagar':          [13.0418, 80.2341],
  't. nagar':         [13.0418, 80.2341],
  'nungambakkam':     [13.0569, 80.2425],
  'mylapore':         [13.0336, 80.2695],
  'perambur':         [13.1159, 80.2341],
  'egmore':           [13.0732, 80.2609],
  'royapettah':       [13.0524, 80.2638],
  'besant nagar':     [13.0003, 80.2679],
  'chromepet':        [12.9516, 80.1462],
  'sholinganallur':   [12.9010, 80.2279],
  'omr':              [12.9010, 80.2279],
  'ecr':              [12.8406, 80.2370],
  'guindy':           [13.0067, 80.2206],
  'kodambakkam':      [13.0524, 80.2218],
  'vadapalani':       [13.0524, 80.2100],
  'ambattur':         [13.1143, 80.1548],
  'avadi':            [13.1146, 80.0975],
  'perungudi':        [12.9638, 80.2458],
  'pallavaram':       [12.9700, 80.1500],
  'medavakkam':       [12.9225, 80.1965],
  'thoraipakkam':     [12.9362, 80.2359],
  'kolathur':         [13.1200, 80.2200],
  'villivakkam':      [13.1000, 80.2100],
  'chennai':          [13.0827, 80.2707],
};

function getCoords(d: DonationRow): [number, number] | null {
  // If donation has lat/lng stored, use them directly
  if ((d as Record<string, unknown>).lat && (d as Record<string, unknown>).lng) {
    return [(d as Record<string, unknown>).lat as number, (d as Record<string, unknown>).lng as number];
  }
  // Otherwise match address/city against known areas
  const haystack = `${d.address} ${d.city}`.toLowerCase();
  for (const [area, coords] of Object.entries(AREA_COORDS)) {
    if (haystack.includes(area)) return coords;
  }
  // Fallback: random offset around Chennai centre so pins don't stack
  return [
    CHENNAI[0] + (Math.random() - 0.5) * 0.15,
    CHENNAI[1] + (Math.random() - 0.5) * 0.15,
  ];
}

export default function DonationMap({ donations }: Props) {
  const available = donations.filter((d) => d.status === 'AVAILABLE');

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Legend */}
      <div className="bg-white px-4 py-2.5 border-b border-gray-100 flex flex-wrap items-center gap-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Map legend</span>
        {[['FOOD','#f97316','\ud83c\udf71 Food'],['CLOTHES','#3b82f6','\ud83d\udc55 Clothes'],['BOOKS','#a855f7','\ud83d\udcda Books']].map(
          ([cat, color, label]) => (
            <div key={cat} className="flex items-center gap-1.5">
              <span style={{ background: color }} className="w-3 h-3 rounded-full inline-block" />
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          )
        )}
        <span className="ml-auto text-xs text-gray-400">{available.length} pin{available.length !== 1 ? 's' : ''} shown</span>
      </div>

      <MapContainer
        center={CHENNAI}
        zoom={12}
        style={{ height: '480px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FixLeafletIcons />

        {available.map((d) => {
          const coords = getCoords(d);
          if (!coords) return null;
          return (
            <Marker key={d.id} position={coords} icon={makePinIcon(d.category)}>
              <Popup maxWidth={260}>
                <div className="text-sm">
                  <p className="font-bold text-gray-800 mb-1 leading-snug">{d.title}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{d.item_type}</span>
                    <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Qty: {d.quantity}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">\ud83d\udccd {d.address}, {d.city}</p>
                  <p className="text-xs text-gray-500 mb-3">By {d.donor_name} ({d.donor_type})</p>
                  {d.expires_at && (
                    <p className="text-xs text-orange-600 font-medium mb-3">\u23f0 Expires: {d.expires_at}</p>
                  )}
                  <Link
                    href={`/claim/${d.id}`}
                    className="block w-full text-center bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors"
                  >
                    Contact Donor \u2192
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
