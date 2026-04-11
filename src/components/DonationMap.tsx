'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DonationRow } from '@/lib/supabase/types';
import Link from 'next/link';

const CHENNAI: [number, number] = [13.0827, 80.2707];

const PIN_COLORS: Record<string, string> = {
  FOOD:    '#f97316',
  CLOTHES: '#3b82f6',
  BOOKS:   '#a855f7',
  DEFAULT: '#22c55e',
};

const CAT_EMOJI: Record<string, string> = {
  FOOD:    '🍱',
  CLOTHES: '👕',
  BOOKS:   '📚',
};

function makePinIcon(category: string): L.DivIcon {
  const color = PIN_COLORS[category] ?? PIN_COLORS.DEFAULT;
  const emoji = CAT_EMOJI[category] ?? '📦';
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${color};
      width:38px;height:38px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:3px solid white;
      box-shadow:0 2px 10px rgba(0,0,0,0.22);
      display:flex;align-items:center;justify-content:center;
    "><span style="transform:rotate(45deg);font-size:17px;line-height:1;">${emoji}</span></div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -40],
  });
}

function MapResizer() {
  const map = useMap();
  useEffect(() => { setTimeout(() => map.invalidateSize(), 100); }, [map]);
  return null;
}

const AREA_COORDS: Record<string, [number, number]> = {
  'anna nagar':     [13.0891, 80.2100],
  'adyar':          [13.0067, 80.2559],
  'velachery':      [12.9815, 80.2180],
  'tambaram':       [12.9249, 80.1000],
  'porur':          [13.0337, 80.1564],
  't nagar':        [13.0418, 80.2341],
  't. nagar':       [13.0418, 80.2341],
  'nungambakkam':   [13.0569, 80.2425],
  'mylapore':       [13.0336, 80.2695],
  'perambur':       [13.1159, 80.2341],
  'egmore':         [13.0732, 80.2609],
  'royapettah':     [13.0524, 80.2638],
  'besant nagar':   [13.0003, 80.2679],
  'chromepet':      [12.9516, 80.1462],
  'sholinganallur': [12.9010, 80.2279],
  'omr':            [12.9010, 80.2279],
  'ecr':            [12.8406, 80.2370],
  'guindy':         [13.0067, 80.2206],
  'kodambakkam':    [13.0524, 80.2218],
  'vadapalani':     [13.0524, 80.2100],
  'ambattur':       [13.1143, 80.1548],
  'avadi':          [13.1146, 80.0975],
  'perungudi':      [12.9638, 80.2458],
  'pallavaram':     [12.9700, 80.1500],
  'medavakkam':     [12.9225, 80.1965],
  'thoraipakkam':   [12.9362, 80.2359],
  'kolathur':       [13.1200, 80.2200],
  'villivakkam':    [13.1000, 80.2100],
  'chennai':        [13.0827, 80.2707],
};

function getCoords(d: DonationRow): [number, number] {
  if ((d as Record<string, unknown>).lat && (d as Record<string, unknown>).lng) {
    return [(d as Record<string, unknown>).lat as number, (d as Record<string, unknown>).lng as number];
  }
  const haystack = `${d.address} ${d.city}`.toLowerCase();
  for (const [area, coords] of Object.entries(AREA_COORDS)) {
    if (haystack.includes(area)) return coords;
  }
  return [
    CHENNAI[0] + (Math.random() - 0.5) * 0.14,
    CHENNAI[1] + (Math.random() - 0.5) * 0.14,
  ];
}

interface Props {
  donations: DonationRow[];
  fullHeight?: boolean;
}

export default function DonationMap({ donations, fullHeight }: Props) {
  const available = donations.filter((d) => d.status === 'AVAILABLE');

  return (
    <div className="flex flex-col" style={{ height: fullHeight ? '100%' : 500 }}>

      {/* Legend strip */}
      <div className="bg-white border-b border-gray-100 px-4 py-2 flex flex-wrap items-center gap-4 shrink-0">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Legend</span>
        {[['FOOD','#f97316','🍱 Food'],['CLOTHES','#3b82f6','👕 Clothes'],['BOOKS','#a855f7','📚 Books']]
          .map(([cat, color, label]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span style={{ background: color }} className="w-2.5 h-2.5 rounded-full inline-block" />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
        <span className="ml-auto text-xs text-gray-400 font-medium">
          {available.length} pin{available.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Map fills remaining height */}
      <div className="flex-1 relative">
        <MapContainer
          center={CHENNAI}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapResizer />

          {available.map((d) => {
            const coords = getCoords(d);
            return (
              <Marker key={d.id} position={coords} icon={makePinIcon(d.category)}>
                <Popup maxWidth={270} className="donation-popup">
                  <div style={{ fontFamily: 'inherit' }}>
                    <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, lineHeight: 1.3 }}>{d.title}</p>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span style={{ background:'#f3f4f6', color:'#374151', fontSize:11, padding:'2px 8px', borderRadius:99 }}>{d.item_type}</span>
                      <span style={{ background:'#dcfce7', color:'#15803d', fontSize:11, padding:'2px 8px', borderRadius:99 }}>Qty: {d.quantity}</span>
                    </div>
                    <p style={{ fontSize:12, color:'#6b7280', marginBottom:2 }}>📍 {d.address}, {d.city}</p>
                    <p style={{ fontSize:12, color:'#6b7280', marginBottom: d.expires_at ? 4 : 10 }}>By {d.donor_name}</p>
                    {d.expires_at && (
                      <p style={{ fontSize:11, color:'#ea580c', fontWeight:600, marginBottom:10 }}>⏰ Expires: {d.expires_at}</p>
                    )}
                    <a
                      href={`/claim/${d.id}`}
                      style={{
                        display:'block', textAlign:'center',
                        background:'#16a34a', color:'white',
                        fontWeight:700, fontSize:12,
                        padding:'8px 12px', borderRadius:10,
                        textDecoration:'none',
                      }}
                    >
                      Contact Donor →
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
