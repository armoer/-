/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player, Card } from '../types';
import { CARD_DEFINITIONS } from '../cardsData';

interface PixelCityViewProps {
  players: Player[];
  activePlayerIdx: number;
}

// Fixed coordinates within our 160x120 SVG space for buildings
const GRID_SLOTS = [
  { x: 12, y: 78 },
  { x: 44, y: 84 },
  { x: 74, y: 76 },
  { x: 104, y: 84 },
  { x: 132, y: 76 },
  { x: 26, y: 48 },
  { x: 58, y: 56 },
  { x: 88, y: 46 },
  { x: 118, y: 56 },
];

export const PixelCityView: React.FC<PixelCityViewProps> = ({ players, activePlayerIdx }) => {

  // A helper to draw pixel SVG buildings on crisp edges for extreme polished retro looks
  const renderPixelBuilding = (key: string, x: number, y: number, isDisabled: boolean) => {
    const opacity = isDisabled ? 'opacity-40 filter grayscale' : 'opacity-100';

    switch (key) {
      case 'farm':
        return (
          <g key={`${key}-${x}-${y}`} className={`${opacity} transition-all duration-300`} transform={`translate(${x}, ${y})`} shapeRendering="crispEdges">
            {/* Ground plot split into green crops */}
            <rect x="0" y="8" width="22" height="6" fill="#15803d" />
            <rect x="2" y="5" width="4" height="4" fill="#eab308" />
            <rect x="9" y="4" width="4" height="5" fill="#eab308" />
            <rect x="16" y="5" width="4" height="4" fill="#eab308" />
            {/* Brown fencing */}
            <rect x="0" y="11" width="22" height="2" fill="#78350f" />
            <rect x="4" y="8" width="2" height="4" fill="#78350f" />
            <rect x="16" y="8" width="2" height="4" fill="#78350f" />
          </g>
        );
      case 'mine':
        return (
          <g key={`${key}-${x}-${y}`} className={`${opacity} transition-all duration-300`} transform={`translate(${x}, ${y})`} shapeRendering="crispEdges">
            {/* Mountain pile entry */}
            <polygon points="1,14 11,2 21,14" fill="#4b5563" />
            {/* Cave dark center */}
            <rect x="6" y="6" width="10" height="8" fill="#111827" rx="1" />
            {/* Wood support arches */}
            <rect x="5" y="6" width="2" height="8" fill="#d97706" />
            <rect x="15" y="6" width="2" height="8" fill="#d97706" />
            <rect x="5" y="5" width="12" height="2" fill="#d97706" />
          </g>
        );
      case 'lumber':
        return (
          <g key={`${key}-${x}-${y}`} className={`${opacity} transition-all duration-300`} transform={`translate(${x}, ${y})`} shapeRendering="crispEdges">
            {/* Green Pine trees background */}
            <polygon points="2,14 7,4 12,14" fill="#166534" />
            {/* Wooden cabin */}
            <rect x="10" y="6" width="11" height="8" fill="#b45309" />
            <rect x="9" y="3" width="13" height="3" fill="#78350f" />
            {/* Door */}
            <rect x="14" y="9" width="3" height="5" fill="#451a03" />
            {/* Firewood logs piled up */}
            <rect x="3" y="11" width="4" height="3" fill="#78350f" rx="1" />
          </g>
        );
      case 'market':
        return (
          <g key={`${key}-${x}-${y}`} className={`${opacity} transition-all duration-300`} transform={`translate(${x}, ${y})`} shapeRendering="crispEdges">
            {/* Store stall walls */}
            <rect x="2" y="6" width="18" height="8" fill="#e2e8f0" />
            {/* Red & yellow striped awning canopy */}
            <rect x="0" y="2" width="22" height="4" fill="#ef4444" />
            <rect x="3" y="2" width="4" height="4" fill="#facc15" />
            <rect x="11" y="2" width="4" height="4" fill="#facc15" />
            <rect x="19" y="2" width="3" height="4" fill="#facc15" />
            {/* Bench display counters */}
            <rect x="4" y="8" width="14" height="2" fill="#d97706" />
            <rect x="5" y="7" width="3" height="1" fill="#f97316" />
            <rect x="12" y="7" width="2" height="1" fill="#22c55e" />
          </g>
        );
      case 'house':
        return (
          <g key={`${key}-${x}-${y}`} className={`${opacity} transition-all duration-300`} transform={`translate(${x}, ${y})`} shapeRendering="crispEdges">
            {/* Quaint medieval cottage */}
            <rect x="3" y="6" width="14" height="8" fill="#fef08a" /> {/* Sandy walls */}
            <polygon points="1,6 10,0 19,6" fill="#b91c1c" /> {/* Red peaked roof */}
            {/* Glowing window */}
            <rect x="6" y="8" width="3" height="3" fill="#facc15" />
            {/* Wooden door */}
            <rect x="11" y="9" width="4" height="5" fill="#78350f" />
          </g>
        );
      case 'barracks':
        return (
          <g key={`${key}-${x}-${y}`} className={`${opacity} transition-all duration-300`} transform={`translate(${x}, ${y})`} shapeRendering="crispEdges">
            {/* Fortress rampart style tent */}
            <rect x="2" y="5" width="18" height="9" fill="#94a3b8" />
            {/* Castle tooth crenellations */}
            <rect x="2" y="2" width="3" height="3" fill="#64748b" />
            <rect x="8" y="2" width="3" height="3" fill="#64748b" />
            <rect x="14" y="2" width="3" height="3" fill="#64748b" />
            {/* Target training post */}
            <ellipse cx="11" cy="7" rx="3" ry="3" fill="#ef4444" />
            <ellipse cx="11" cy="7" rx="1" ry="1" fill="#ffffff" />
            <rect x="10" y="10" width="2" height="4" fill="#78350f" />
          </g>
        );
      case 'blacksmith':
        return (
          <g key={`${key}-${x}-${y}`} className={`${opacity} transition-all duration-300`} transform={`translate(${x}, ${y})`} shapeRendering="crispEdges">
            {/* Charcoal dark stone forge shop */}
            <rect x="2" y="4" width="18" height="10" fill="#475569" />
            {/* Chimney spitting fire pixel particles */}
            <rect x="15" y="0" width="4" height="4" fill="#334155" />
            <rect x="16" y="-2" width="2" height="2" fill="#ea580c" />
            {/* Forge heating hearth opening */}
            <rect x="5" y="8" width="6" height="6" fill="#1e293b" />
            <rect x="6" y="9" width="4" height="5" fill="#f97316" bounce-color="red" />
            {/* Mini anvil */}
            <rect x="13" y="10" width="5" height="1" fill="#0f172a" />
            <rect x="12" y="11" width="7" height="3" fill="#1e293b" />
          </g>
        );
      case 'academy':
        return (
          <g key={`${key}-${x}-${y}`} className={`${opacity} transition-all duration-300`} transform={`translate(${x}, ${y})`} shapeRendering="crispEdges">
            {/* Grand blue-domed academy hall */}
            <rect x="2" y="6" width="18" height="8" fill="#e2e8f0" />
            {/* Dark wood door */}
            <rect x="9" y="9" width="4" height="5" fill="#78350f" />
            {/* Grand dome with telescope pointing at sky */}
            <path d="M 4,6 A 8,8 0 0,1 18,6 Z" fill="#2563eb" />
            <line x1="11" y1="2" x2="16" y2="-4" stroke="#e2e8f0" strokeWidth="2" />
          </g>
        );
      case 'temple':
        return (
          <g key={`${key}-${x}-${y}`} className={`${opacity} transition-all duration-300`} transform={`translate(${x}, ${y})`} shapeRendering="crispEdges">
            {/* Sacred white shrine with pillars */}
            <rect x="2" y="0" width="18" height="2" fill="#eab308" /> {/* Golden frieze */}
            <rect x="2" y="2" width="18" height="2" fill="#f1f5f9" />
            {/* Pillars */}
            <rect x="4" y="4" width="2" height="8" fill="#cbd5e1" />
            <rect x="10" y="4" width="2" height="8" fill="#cbd5e1" />
            <rect x="16" y="4" width="2" height="8" fill="#cbd5e1" />
            {/* Foundation staircase */}
            <rect x="1" y="11" width="20" height="3" fill="#cbd5e1" />
          </g>
        );
      case 'treasury':
        return (
          <g key={`${key}-${x}-${y}`} className={`${opacity} transition-all duration-300`} transform={`translate(${x}, ${y})`} shapeRendering="crispEdges">
            {/* Royal treasury storehouse */}
            <rect x="2" y="4" width="18" height="10" fill="#f59e0b" />
            <rect x="1" y="2" width="20" height="2" fill="#d97706" />
            {/* Solid iron vault shield */}
            <rect x="7" y="6" width="8" height="8" fill="#64748b" rx="1" />
            <circle cx="11" cy="10" r="2" fill="#1e293b" />
            <ellipse cx="11" cy="10" rx="1" ry="1" fill="#e2e8f0" />
          </g>
        );
      case 'witchAltar':
        return (
          <g key={`${key}-${x}-${y}`} transform={`translate(${x}, ${y})`} className={`${opacity} transition-all duration-300`}>
            {/* Ancient obsidian ritual altar with cosmic purple light */}
            <rect x="3" y="9" width="16" height="5" fill="#581c87" rx="2" />
            <rect x="6" y="6" width="10" height="3" fill="#3b0764" />
            {/* Levitaing amethyst crystal floating and pulsing */}
            <polygon points="11,0 6,4 11,8 16,4" fill="#a855f7" />
          </g>
        );
      default:
        return (
          <text key={`${key}-${x}-${y}`} x={x} y={y + 12} fontSize="12" className={opacity}>
            {CARD_DEFINITIONS[key]?.icon || '❓'}
          </text>
        );
    }
  };

  // Render backdrops of matching thematic elements in clean retro retro SVG paths
  const getCityBackdropSVG = (color: string) => {
    const c = color.toLowerCase();

    // 1. Red / Fire (#dc2626)
    if (c === '#dc2626') {
      return (
        <g shapeRendering="crispEdges">
          <rect x="0" y="0" width="160" height="85" fill="#450a0a" />
          <polygon points="-10,85 40,25 90,85" fill="#ef4444" opacity="0.3" />
          <polygon points="60,85 110,15 170,85" fill="#851c1c" />
          <polygon points="20,85 80,35 140,85" fill="#dc2626" opacity="0.5" />
          <rect x="0" y="85" width="160" height="35" fill="#f97316" />
          <rect x="0" y="95" width="160" height="25" fill="#ea580c" />
        </g>
      );
    }

    // 2. Green / Wood / Emerald (#10b981 or #16a34a or #22c55e)
    if (c === '#10b981' || c === '#16a34a' || c === '#22c55e') {
      return (
        <g shapeRendering="crispEdges">
          <rect x="0" y="0" width="160" height="85" fill="#064e3b" />
          <path d="M -10,85 Q 30,30 80,85" fill="#065f46" />
          <path d="M 60,85 Q 120,20 180,85" fill="#0faf62" opacity="0.3" />
          <path d="M 20,85 Q 90,45 150,85" fill="#047857" />
          <rect x="0" y="85" width="160" height="35" fill="#10b981" />
          <rect x="0" y="95" width="160" height="25" fill="#059669" />
        </g>
      );
    }

    // 3. Teal / Cyan / Deep Sea Blue / Light Teal (#2dd4bf or #0891b2 or #06b6d4)
    if (c === '#2dd4bf' || c === '#0891b2' || c === '#06b6d4') {
      return (
        <g shapeRendering="crispEdges">
          <rect x="0" y="0" width="160" height="85" fill="#0c1d2e" />
          <polygon points="-25,85 25,45 75,85" fill="#082b40" />
          <polygon points="55,85 110,25 165,85" fill="#0e5670" opacity="0.4" />
          <rect x="0" y="85" width="160" height="35" fill="#0891b2" />
          <rect x="0" y="95" width="160" height="25" fill="#0d6e85" />
          <rect x="40" y="82" width="20" height="4" fill="#5c3615" />
        </g>
      );
    }

    // 4. Blue / Sky Blue / Silver Slate Blue (#60a5fa or #94a3b8)
    if (c === '#60a5fa' || c === '#94a3b8' || c === '#475569') {
      return (
        <g shapeRendering="crispEdges">
          <rect x="0" y="0" width="160" height="85" fill="#0f172a" />
          <polygon points="-10,85 35,45 80,85" fill="#1e3b5e" />
          <polygon points="50,85 110,25 170,85" fill="#255ebe" opacity="0.35" />
          <rect x="0" y="85" width="160" height="35" fill="#3b82f6" />
          <rect x="0" y="95" width="160" height="25" fill="#1d4ed8" />
        </g>
      );
    }

    // 5. Purple / Royal Violet (#7c3aed or #9333ea or #a855f7)
    if (c === '#7c3aed' || c === '#9333ea' || c === '#a855f7') {
      return (
        <g shapeRendering="crispEdges">
          <rect x="0" y="0" width="160" height="85" fill="#2e1065" />
          <polygon points="-20,85 35,35 90,85" fill="#581c87" opacity="0.4" />
          <polygon points="55,85 110,25 165,85" fill="#4c1d95" />
          <rect x="0" y="85" width="160" height="35" fill="#a855f7" />
          <rect x="0" y="95" width="160" height="25" fill="#7e22ce" />
        </g>
      );
    }

    // 6. Earthy Dark Brown (#78350f or #854d0e)
    if (c === '#78350f' || c === '#854d0e') {
      return (
        <g shapeRendering="crispEdges">
          <rect x="0" y="0" width="160" height="85" fill="#241405" />
          <polygon points="-15,85 40,35 95,85" fill="#543110" />
          <polygon points="45,85 105,20 165,85" fill="#42250c" />
          <rect x="0" y="85" width="160" height="35" fill="#78350f" />
          <rect x="0" y="95" width="160" height="25" fill="#5c2405" />
        </g>
      );
    }

    // Default Template (Gold / Amber Fallback)
    return (
      <g shapeRendering="crispEdges">
        <rect x="0" y="0" width="160" height="85" fill="#422006" />
        <circle cx="80" cy="20" r="12" fill="#ca8a04" opacity="0.3" />
        <polygon points="10,85 55,45 100,85" fill="#713f12" />
        <polygon points="-10,85 30,60 110,85" fill="#a16207" opacity="0.4" />
        <polygon points="70,85 115,50 160,85" fill="#854d0e" />
        <rect x="0" y="85" width="160" height="35" fill="#eab308" />
        <rect x="0" y="95" width="160" height="25" fill="#ca8a04" />
      </g>
    );
  };

  return (
    <div
      className="grid gap-3.5 p-3 bg-[#120f18] rounded-xl border border-[#3e3549] overflow-hidden"
      style={{
        gridTemplateColumns: `repeat(${players.length}, minmax(0, 1fr))`,
      }}
    >
      {players.map((p, idx) => {
        // Find indices of non-defense/non-fragment buildings
        const builtKeys = p.buildings;

        return (
          <div
            key={p.id}
            className={`relative flex flex-col rounded-lg overflow-hidden border-2 transition-all duration-300 ${
              idx === activePlayerIdx
                ? 'border-[#f0c040] shadow-[0_0_12px_rgba(240,192,64,0.3)]'
                : 'border-slate-800'
            }`}
          >
            {/* Header tag */}
            <div className="absolute top-1 left-1.5 z-10 flex items-center gap-1.5 pointer-events-none">
              <span className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: p.themeColor }} />
              <span className="font-retro text-[8px] text-white tracking-tight text-shadow drop-shadow-md font-bold">
                {p.name}
              </span>
              {p.isAI && (
                <span className="bg-red-950 text-red-400 border border-red-800 text-[6px] px-1 rounded-sm py-0.2 scale-90 font-retro">
                  AI
                </span>
              )}
            </div>

            {/* Banner status: prosperity points in miniature coin stack */}
            <div className="absolute top-1 right-1.5 z-10 flex items-center bg-black/60 px-1 py-0.5 rounded pointer-events-none text-[8px] font-retro text-[#f0c040]">
              ⭐{p.buildings.filter(b => b !== 'barracks').reduce((acc, b) => acc + (CARD_DEFINITIONS[b]?.prosperity || 0), 0) + (p.buildings.includes('barracks') ? 1 : 0) + (p.buildings.includes('academy') && p.defenseItems.length > 0 && p.academyCooldown === 0 ? 1 : 0)}
            </div>

            {/* Wavy castle flag showing health/defense status */}
            <div className="absolute top-8 left-3 z-10 flex flex-col items-center pointer-events-none animate-bounce">
              <div
                className="w-4 h-2.5 rounded-r-md skew-x-3 transition-colors duration-300"
                style={{ backgroundColor: p.themeColor }}
              />
              <div className="w-0.5 h-6 bg-slate-400" />
            </div>

            {/* Responsive low-res SVG canvas drawing backdrop and building tiles */}
            <div className="relative w-full h-[120px] sm:h-[155px] bg-[#1a1622]">
              <svg
                viewBox="0 0 160 110"
                className="w-full h-full object-cover"
                preserveAspectRatio="none"
              >
                {/* 1. Base scenic backdrops */}
                {getCityBackdropSVG(p.themeColor)}

                {/* 2. City buildings mapped to slots */}
                {builtKeys.map((bKey, sIdx) => {
                  const slot = GRID_SLOTS[sIdx % GRID_SLOTS.length];
                  if (!slot) return null;
                  const isPowerDisabled = p.disabledBuildings.some(d => d.key === bKey);
                  return renderPixelBuilding(bKey, slot.x, slot.y, isPowerDisabled);
                })}
              </svg>
            </div>

            {/* Bottom active state bar */}
            {idx === activePlayerIdx && (
              <div className="bg-[#f0c040] h-1.5 w-full animate-pulse shadow-[0_0_8px_gold]" />
            )}
          </div>
        );
      })}
    </div>
  );
};
