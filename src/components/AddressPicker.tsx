'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TAMIL_NADU_CENTER: [number, number] = [11.1271, 78.6569];
const DEFAULT_ZOOM = 7; // show all of TN initially

// ── Nominatim search result shape ──
interface NominatimResult {
  place_id:     number;
  display_name: string;
  lat:          string;
  lon:          string;
  address:      Record<string, string>;
}

const PIN_ICON = L.divIcon({
  className: '',
  html: `<div style="
    background:#16a34a;width:36px;height:36px;
    border-radius:50% 50% 50% 0;transform:rotate(-45deg);
    border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.3);
  "></div><span style="
    position:absolute;top:4px;left:9px;font-size:16px;
  ">📍</span>`,
  iconSize:   [36, 44],
  iconAnchor: [18, 44],
});

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

function FlyTo({ coords, zoom }: { coords: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo(coords, zoom, { duration: 0.9 }); }, [coords, zoom, map]);
  return null;
}

// ── Build a clean address string from Nominatim address object ──
function buildAddress(a: Record<string, string>): string {
  const parts = [
    a.house_number ? `${a.house_number}, ` : '',
    a.road ?? a.pedestrian ?? a.footway ?? a.path ?? '',
    a.suburb ?? a.neighbourhood ?? a.quarter ?? a.village ?? '',
    a.city_district ?? a.town ?? a.city ?? '',
    a.county ?? a.state_district ?? '',
    a.state ?? '',
  ].map((s) => s.trim()).filter(Boolean);
  // deduplicate adjacent same values and join
  return [...new Set(parts)].join(', ');
}

async function reverseGeocode(lat: number, lng: number): Promise<{ address: string; raw: Record<string, string> }> {
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const a    = data.address ?? {};
    return { address: buildAddress(a) || data.display_name?.split(',').slice(0, 4).join(',') || '', raw: a };
  } catch { return { address: '', raw: {} }; }
}

async function searchPlaces(query: string): Promise<NominatimResult[]> {
  if (query.length < 3) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=6&countrycodes=in&viewbox=76.2,8.1,80.4,13.6&bounded=0`,
      { headers: { 'Accept-Language': 'en' } }
    );
    return await res.json();
  } catch { return []; }
}

interface Props {
  value:     string;
  onChange:  (address: string) => void;
}

export default function AddressPicker({ value, onChange }: Props) {
  const [mode,         setMode]         = useState<'map' | 'manual'>('map');
  const [pin,          setPin]          = useState<[number, number] | null>(null);
  const [flyTarget,    setFlyTarget]    = useState<{ coords: [number, number]; zoom: number } | null>(null);
  const [geocoding,    setGeocoding]    = useState(false);
  const [landmark,     setLandmark]     = useState('');

  // search state
  const [query,        setQuery]        = useState('');
  const [suggestions,  setSuggestions]  = useState<NominatimResult[]>([]);
  const [searching,    setSearching]    = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  // ── debounced search ──
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 3) { setSuggestions([]); setShowDropdown(false); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchPlaces(query);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setSearching(false);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // ── user picks a suggestion ──
  const handleSuggestionSelect = useCallback((r: NominatimResult) => {
    const coords: [number, number] = [parseFloat(r.lat), parseFloat(r.lon)];
    setPin(coords);
    setFlyTarget({ coords, zoom: 17 });
    const addr = buildAddress(r.address) || r.display_name.split(',').slice(0, 4).join(',');
    onChange(addr);
    setQuery(r.display_name.split(',').slice(0, 2).join(','));
    setShowDropdown(false);
    setSuggestions([]);
    setLandmark('');
  }, [onChange]);

  // ── user taps the map ──
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setPin([lat, lng]);
    setGeocoding(true);
    const { address } = await reverseGeocode(lat, lng);
    setGeocoding(false);
    if (address) { onChange(address); setQuery(''); }
    setLandmark('');
  }, [onChange]);

  // combined address with landmark
  const fullAddress = landmark.trim() ? `${value} (near ${landmark.trim()})` : value;

  // sync landmark into parent whenever it changes
  useEffect(() => {
    if (!value) return;
    const base = value.replace(/ \(near .*\)$/, '');
    onChange(landmark.trim() ? `${base} (near ${landmark.trim()})` : base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landmark]);

  return (
    <div className="rounded-2xl border border-gray-200 overflow-visible bg-white shadow-sm">

      {/* Mode tabs */}
      <div className="flex border-b border-gray-100 rounded-t-2xl overflow-hidden">
        {(['map', 'manual'] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
              mode === m
                ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-gray-600 bg-white'
            }`}>
            {m === 'map' ? '🗺️ Search & Pin on Map' : '✏️ Type Manually'}
          </button>
        ))}
      </div>

      {mode === 'map' ? (
        <div>

          {/* ── Search box ── */}
          <div className="px-3 pt-3 pb-2 relative">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                {searching ? '⏳' : '🔍'}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
                onFocus={() => { if (suggestions.length) setShowDropdown(true); }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
                placeholder="Search street, area, landmark, city in Tamil Nadu…"
                className="w-full pl-9 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 placeholder:text-gray-400"
                autoComplete="off"
              />
              {query && (
                <button type="button"
                  onClick={() => { setQuery(''); setSuggestions([]); setShowDropdown(false); inputRef.current?.focus(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">
                  ×
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <ul className="absolute left-3 right-3 top-full mt-1 z-[9999] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                {suggestions.map((r) => {
                  const parts = r.display_name.split(',');
                  const main  = parts.slice(0, 2).join(',').trim();
                  const sub   = parts.slice(2, 5).join(',').trim();
                  return (
                    <li key={r.place_id}>
                      <button type="button"
                        onMouseDown={() => handleSuggestionSelect(r)}
                        className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b border-gray-50 last:border-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">📍 {main}</p>
                        {sub && <p className="text-xs text-gray-400 truncate mt-0.5">{sub}</p>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {query.length >= 3 && !searching && suggestions.length === 0 && !showDropdown && (
              <p className="text-xs text-gray-400 mt-1.5 px-1">No results — try a more specific name or tap the map directly.</p>
            )}
          </div>

          <p className="text-xs text-gray-400 px-3 pb-2 text-center">
            or <strong className="text-gray-600">tap anywhere on the map</strong> for a precise pin
          </p>

          {/* ── Map ── */}
          <div className="relative">
            <MapContainer
              center={TAMIL_NADU_CENTER}
              zoom={DEFAULT_ZOOM}
              style={{ height: 300, width: '100%' }}
              scrollWheelZoom
              zoomControl
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ClickHandler onMapClick={handleMapClick} />
              {flyTarget && <FlyTo coords={flyTarget.coords} zoom={flyTarget.zoom} />}
              {pin && <Marker position={pin} icon={PIN_ICON} />}
            </MapContainer>
          </div>

          {/* ── Result + landmark ── */}
          <div className="px-3 pt-3 pb-3 flex flex-col gap-2">
            {geocoding ? (
              <p className="text-xs text-gray-400 animate-pulse">🔍 Looking up address…</p>
            ) : value ? (
              <>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">📍 Picked address <span className="text-green-600">(editable)</span></p>
                  <input
                    type="text"
                    value={value.replace(/ \(near .*\)$/, '')}
                    onChange={(e) => onChange(landmark.trim() ? `${e.target.value} (near ${landmark.trim()})` : e.target.value)}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700"
                    placeholder="Edit address if needed"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">🏪 Nearby landmark <span className="text-gray-400 font-normal">(optional but helpful)</span></p>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Opp. City Union Bank, Near Bus Stop, Behind Big Bazaar…"
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700"
                  />
                </div>
                {fullAddress && (
                  <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                    <p className="text-xs text-gray-400 mb-0.5">Final address that will be saved:</p>
                    <p className="text-xs font-semibold text-green-800">{fullAddress}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-gray-400">📍 No pin dropped yet — search above or tap the map</p>
            )}
          </div>
        </div>
      ) : (
        /* ── Manual tab ── */
        <div className="p-4 flex flex-col gap-3">
          <div>
            <label className="block text-xs text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">Full pickup address *</label>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="e.g. 12, Gandhi Street, Anna Nagar, Chennai – 600040"
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">Nearby landmark <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => {
                setLandmark(e.target.value);
                const base = value.replace(/ \(near .*\)$/, '');
                onChange(e.target.value.trim() ? `${base} (near ${e.target.value.trim()})` : base);
              }}
              placeholder="e.g. Near Saravana Stores, Opp. Railway Station…"
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700"
            />
          </div>
          <p className="text-xs text-gray-400">💡 Include house number, street, area, city and PIN for best precision.</p>
        </div>
      )}
    </div>
  );
}
