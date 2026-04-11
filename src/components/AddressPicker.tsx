'use client';
import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CHENNAI: [number, number] = [13.0827, 80.2707];

const QUICK_AREAS: { label: string; coords: [number, number] }[] = [
  { label: 'Anna Nagar',       coords: [13.0891, 80.2100] },
  { label: 'Adyar',            coords: [13.0067, 80.2559] },
  { label: 'T. Nagar',         coords: [13.0418, 80.2341] },
  { label: 'Velachery',        coords: [12.9815, 80.2180] },
  { label: 'Nungambakkam',     coords: [13.0569, 80.2425] },
  { label: 'Mylapore',         coords: [13.0336, 80.2695] },
  { label: 'Tambaram',         coords: [12.9249, 80.1000] },
  { label: 'Porur',            coords: [13.0337, 80.1564] },
  { label: 'Perambur',         coords: [13.1159, 80.2341] },
  { label: 'Egmore',           coords: [13.0732, 80.2609] },
  { label: 'Besant Nagar',     coords: [13.0003, 80.2679] },
  { label: 'Chromepet',        coords: [12.9516, 80.1462] },
  { label: 'Sholinganallur',   coords: [12.9010, 80.2279] },
  { label: 'Guindy',           coords: [13.0067, 80.2206] },
  { label: 'Kodambakkam',      coords: [13.0524, 80.2218] },
  { label: 'Ambattur',         coords: [13.1143, 80.1548] },
  { label: 'Perungudi',        coords: [12.9638, 80.2458] },
  { label: 'Medavakkam',       coords: [12.9225, 80.1965] },
  { label: 'Kolathur',         coords: [13.1200, 80.2200] },
  { label: 'Thoraipakkam',     coords: [12.9362, 80.2359] },
];

const PIN_ICON = L.divIcon({
  className: '',
  html: `<div style="
    background:#16a34a;width:36px;height:36px;
    border-radius:50% 50% 50% 0;transform:rotate(-45deg);
    border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.25);
    display:flex;align-items:center;justify-content:center;
  "><span style="transform:rotate(45deg);font-size:18px;">📍</span></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

function FlyTo({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.flyTo(coords, 15, { duration: 0.8 }); }, [coords, map]);
  return null;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const a = data.address ?? {};
    const parts = [
      a.road ?? a.pedestrian ?? a.footway ?? '',
      a.suburb ?? a.neighbourhood ?? a.quarter ?? '',
      a.city_district ?? a.county ?? '',
    ].filter(Boolean);
    return parts.join(', ') || data.display_name?.split(',').slice(0, 3).join(',') || '';
  } catch { return ''; }
}

interface Props {
  value: string;
  onChange: (address: string) => void;
}

export default function AddressPicker({ value, onChange }: Props) {
  const [mode,        setMode]        = useState<'map' | 'manual'>('map');
  const [pin,         setPin]         = useState<[number, number] | null>(null);
  const [flyTarget,   setFlyTarget]   = useState<[number, number] | null>(null);
  const [geocoding,   setGeocoding]   = useState(false);
  const [selectedArea, setSelectedArea] = useState('');

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setPin([lat, lng]);
    setGeocoding(true);
    const addr = await reverseGeocode(lat, lng);
    setGeocoding(false);
    if (addr) onChange(addr);
  }, [onChange]);

  const handleAreaSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const area = QUICK_AREAS.find((a) => a.label === e.target.value);
    if (!area) return;
    setSelectedArea(area.label);
    setPin(area.coords);
    setFlyTarget(area.coords);
    onChange(area.label + ', Chennai');
  };

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">

      {/* Mode toggle */}
      <div className="flex border-b border-gray-100">
        <button type="button" onClick={() => setMode('map')}
          className={`flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
            mode === 'map' ? 'bg-green-50 text-green-700 border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-600 bg-white'
          }`}>
          🗺️ Pin on Map
        </button>
        <button type="button" onClick={() => setMode('manual')}
          className={`flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
            mode === 'manual' ? 'bg-green-50 text-green-700 border-b-2 border-green-500' : 'text-gray-400 hover:text-gray-600 bg-white'
          }`}>
          ✏️ Type Manually
        </button>
      </div>

      {mode === 'map' ? (
        <div>
          {/* Quick area dropdown */}
          <div className="px-3 pt-3 pb-2">
            <select
              value={selectedArea}
              onChange={handleAreaSelect}
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700"
            >
              <option value="">Quick select a Chennai area…</option>
              {QUICK_AREAS.map((a) => (
                <option key={a.label} value={a.label}>{a.label}</option>
              ))}
            </select>
          </div>

          <p className="text-xs text-gray-400 px-3 pb-2 text-center">
            or <strong>tap anywhere on the map</strong> to drop a pin and auto-fill your address
          </p>

          {/* Map */}
          <MapContainer
            center={CHENNAI}
            zoom={12}
            style={{ height: 280, width: '100%' }}
            scrollWheelZoom={false}
            zoomControl
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onMapClick={handleMapClick} />
            {flyTarget && <FlyTo coords={flyTarget} />}
            {pin && <Marker position={pin} icon={PIN_ICON} />}
          </MapContainer>

          {/* Address result */}
          <div className="px-3 pt-2 pb-3">
            {geocoding ? (
              <p className="text-xs text-gray-400 animate-pulse py-1">🔍 Looking up address…</p>
            ) : value ? (
              <div className="flex items-start gap-2">
                <span className="text-green-600 text-sm mt-0.5">✅</span>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Picked address:</p>
                  <input
                    type="text"
                    value={value}
                    onChange={handleManualChange}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700"
                    placeholder="Edit address if needed"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-1">📍 No pin dropped yet — select an area above or tap the map</p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4">
          <label className="block text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wide">Enter full pickup address</label>
          <input
            type="text"
            value={value}
            onChange={handleManualChange}
            placeholder="e.g. 12, Gandhi Street, Anna Nagar, Chennai"
            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700"
          />
          <p className="text-xs text-gray-400 mt-2">💡 Be as specific as possible so receivers can find you easily.</p>
        </div>
      )}
    </div>
  );
}
