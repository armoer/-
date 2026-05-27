/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player } from '../types';
import { CARD_DEFINITIONS } from '../cardsData';
import { Briefcase, Swords, Sparkles, CloudSun } from 'lucide-react';
import { motion } from 'motion/react';

interface PlayerPanelsProps {
  players: Player[];
  activePlayerIdx: number;
  onOpenBackpack: (playerIdx: number) => void;
  onOpenMilitaryDeck: (playerIdx: number) => void;
  onOpenWitchcraft: (playerIdx: number) => void;
  onActiveAttack: (attackerIdx: number, defenderIdx: number) => void;
  onOpenWitchAltar: (playerIdx: number) => void;
  onOpenTradeRoute: (playerIdx: number) => void;
  isCloudy: boolean;
}

// 1. Dynamic border and pattern configs depending on custom city name - Deep, saturated versions for maximum contrast
const getCityThemeCustomization = (cityName: string) => {
  switch (cityName) {
    case '日耀城':
      return {
        badge: '☀️',
        bg: 'bg-[#5f3d0e]',
        borderClass: 'border-[#f59e0b]',
        patternClass: 'bg-[radial-gradient(#f59e0b_1.2px,transparent_1.2px)] bg-[size:10px_10px] bg-opacity-[0.08]',
        accentText: 'text-amber-200',
        titleColor: 'text-white',
        cornerSymbol: '☀️',
        borderStyle: 'border-double border-4',
        shadowGlow: '0 4px 14px rgba(245, 158, 11, 0.25)'
      };
    case '月辉城':
      return {
        badge: '🌙',
        bg: 'bg-[#0f172a]',
        borderClass: 'border-[#94a3b8]',
        patternClass: 'bg-[radial-gradient(#94a3b8_1.2px,transparent_1.2px)] bg-[size:8px_8px] bg-opacity-[0.08]',
        accentText: 'text-slate-200',
        titleColor: 'text-white',
        cornerSymbol: '🌙',
        borderStyle: 'border-dashed border-2',
        shadowGlow: '0 4px 14px rgba(71, 85, 105, 0.2)'
      };
    case '星闪城':
      return {
        badge: '✨',
        bg: 'bg-[#2e1065]',
        borderClass: 'border-[#a78bfa]',
        patternClass: 'bg-[radial-gradient(#c084fc_1.2px,transparent_1.2px)] bg-[size:12px_12px] bg-opacity-[0.08]',
        accentText: 'text-purple-200',
        titleColor: 'text-white',
        cornerSymbol: '✨',
        borderStyle: 'border-dotted border-4',
        shadowGlow: '0 4px 14px rgba(124, 58, 237, 0.22)'
      };
    case '磐石城':
      return {
        badge: '🧱',
        bg: 'bg-[#1c1917]',
        borderClass: 'border-[#a8a29e]',
        patternClass: 'bg-[repeating-linear-gradient(0deg,#78716c,#78716c_1px,transparent_1px,transparent_8px)] bg-opacity-[0.08]',
        accentText: 'text-stone-300',
        titleColor: 'text-white',
        cornerSymbol: '🧱',
        borderStyle: 'border-solid border-2',
        shadowGlow: '0 4px 14px rgba(120, 113, 108, 0.2)'
      };
    case '金利城':
    case '黄金城':
      return {
        badge: '🪙',
        bg: 'bg-[#513601]',
        borderClass: 'border-[#eab308]',
        patternClass: 'bg-[radial-gradient(#eab308_1.2px,transparent_1.2px)] bg-[size:10px_10px] bg-opacity-[0.08]',
        accentText: 'text-amber-200',
        titleColor: 'text-white',
        cornerSymbol: '🪙',
        borderStyle: 'border-double border-4',
        shadowGlow: '0 4px 14px rgba(202, 138, 4, 0.25)'
      };
    case '木荣城':
    case '翡翠城':
      return {
        badge: '🌲',
        bg: 'bg-[#064e3b]',
        borderClass: 'border-[#10b981]',
        patternClass: 'bg-[radial-gradient(#10b981_1.2px,transparent_1.2px)] bg-[size:14px_14px] bg-opacity-[0.08]',
        accentText: 'text-emerald-200',
        titleColor: 'text-white',
        cornerSymbol: '🍃',
        borderStyle: 'border-solid border-2',
        shadowGlow: '0 4px 14px rgba(22, 163, 74, 0.22)'
      };
    case '水流城':
      return {
        badge: '💧',
        bg: 'bg-[#083344]',
        borderClass: 'border-[#06b6d4]',
        patternClass: 'bg-[repeating-linear-gradient(45deg,#06b6d4,#06b6d4_1px,transparent_1px,transparent_6px)] bg-opacity-[0.06]',
        accentText: 'text-cyan-200',
        titleColor: 'text-white',
        cornerSymbol: '💧',
        borderStyle: 'border-dashed border-2',
        shadowGlow: '0 4px 14px rgba(8, 145, 178, 0.22)'
      };
    case '火爆城':
      return {
        badge: '🔥',
        bg: 'bg-[#450a0a]',
        borderClass: 'border-[#f87171]',
        patternClass: 'bg-[radial-gradient(#ef4444_1.2px,transparent_1.2px)] bg-[size:8px_8px] bg-opacity-[0.08]',
        accentText: 'text-red-200',
        titleColor: 'text-white',
        cornerSymbol: '🔥',
        borderStyle: 'border-solid border-2',
        shadowGlow: '0 4px 14px rgba(220, 38, 38, 0.22)'
      };
    case '土厚城':
      return {
        badge: '🪨',
        bg: 'bg-[#3b1703]',
        borderClass: 'border-[#d97706]',
        patternClass: 'bg-[linear-gradient(#78350f_1px,transparent_1px)] bg-[size:10px_10px] bg-opacity-[0.08]',
        accentText: 'text-amber-200',
        titleColor: 'text-white',
        cornerSymbol: '🧱',
        borderStyle: 'border-solid border-4',
        shadowGlow: '0 4px 14px rgba(120, 53, 15, 0.25)'
      };
    case '珍珠城':
      return {
        badge: '🦪',
        bg: 'bg-[#115e59]',
        borderClass: 'border-[#2dd4bf]',
        patternClass: 'bg-[repeating-linear-gradient(45deg,#2dd4bf,#2dd4bf_1px,transparent_1px,transparent_6px)] bg-opacity-[0.08]',
        accentText: 'text-teal-200',
        titleColor: 'text-white',
        cornerSymbol: '🦪',
        borderStyle: 'border-dashed border-2',
        shadowGlow: '0 4px 14px rgba(45, 212, 191, 0.25)'
      };
    case '钻石城':
      return {
        badge: '💎',
        bg: 'bg-[#1e1b4b]',
        borderClass: 'border-[#60a5fa]',
        patternClass: 'bg-[radial-gradient(#60a5fa_1.2px,transparent_1.2px)] bg-[size:8px_8px] bg-opacity-[0.08]',
        accentText: 'text-blue-200',
        titleColor: 'text-white',
        cornerSymbol: '💎',
        borderStyle: 'border-solid border-2',
        shadowGlow: '0 4px 14px rgba(96, 165, 250, 0.25)'
      };
    default:
      return {
        badge: '🏰',
        bg: 'bg-[#1e293b]',
        borderClass: 'border-stone-400',
        patternClass: '',
        accentText: 'text-stone-300',
        titleColor: 'text-white',
        cornerSymbol: '🏰',
        borderStyle: 'border-solid border-2',
        shadowGlow: 'none'
      };
  }
};

const getCitySubtitle = (cityName: string) => {
  switch (cityName) {
    case '日耀城': return '炽热烈阳之主';
    case '月辉城': return '冷月银钩之耀';
    case '星闪城': return '无极繁星之芒';
    case '磐石城': return '坚毅重峰之岳';
    case '金利城': return '锐进庚金之锋';
    case '木荣城': return '参天不绝之生';
    case '水流城': return '碧波长澜之潮';
    case '火爆城': return '炎阳燎原之怒';
    case '土厚城': return '厚代载物之磐';
    case '黄金城': return '富贵崇金之勋';
    case '翡翠城': return '仙幽翠绿之辉';
    case '珍珠城': return '温润沧海之珍';
    case '钻石城': return '璀璨极寒之精';
    default: return '雄邦天城之主';
  }
};

export const PlayerPanels: React.FC<PlayerPanelsProps> = ({
  players,
  activePlayerIdx,
  onOpenBackpack,
  onOpenMilitaryDeck,
  onOpenWitchcraft,
  onActiveAttack,
  onOpenWitchAltar,
  onOpenTradeRoute,
  isCloudy,
}) => {
  return (
    <div
      className="grid gap-3.5"
      style={{
        gridTemplateColumns: `repeat(${players.length}, minmax(0, 1fr))`,
      }}
    >
      {players.map((p, idx) => {
        const isActive = idx === activePlayerIdx;
        const isFogged = p.foggedByPlayerIdx !== undefined;
        const resourcesHidden = isCloudy || (isFogged && !isActive);

        // Custom styling bundle based on dynamic names
        const styleCustom = getCityThemeCustomization(p.name);
        const citySubtitle = getCitySubtitle(p.name);

        // Custom building list
        const uniqueBuildings = Array.from(new Set<string>(p.buildings));

        // Defense Sum
        let defenseSum = p.defenseItems.reduce((acc, d) => acc + d.currentDefense, 0);
        p.buildings.forEach((bKey) => {
          const cardUnit = CARD_DEFINITIONS[bKey];
          if (cardUnit && cardUnit.defense) {
            defenseSum += cardUnit.defense;
          }
        });
        const effectiveDefense = defenseSum;

        // Active attack availability checks
        const hasBarracks = p.buildings.includes('barracks');
        const canAttack = isActive && hasBarracks && p.attackCount < 2 && p.gold >= 2 && p.wood >= 1;

        // Dynamic inline border style
        const cardStyle = isActive
          ? {
              boxShadow: styleCustom.shadowGlow,
              borderColor: p.themeColor,
            }
          : {
              borderColor: '#e2d5bd',
            };

        const totalBarracks = p.buildings.filter((b) => b === 'barracks').length;
        const extraBarracksBonus = Math.max(0, totalBarracks - 1);

        return (
          <motion.div
            key={p.id}
            initial={{ scale: 0.98, opacity: 0.95 }}
            animate={
              isActive
                ? { scale: 1, opacity: 1 }
                : { scale: 0.98, opacity: 0.88 }
            }
            transition={{ duration: 0.25 }}
            style={cardStyle}
            className={`${styleCustom.bg} rounded-xl ${styleCustom.borderClass} ${styleCustom.borderStyle} p-3.5 flex flex-col justify-between relative overflow-hidden transition-all duration-300 min-h-[190px] group ${
              isActive ? 'ring-2 ring-amber-500/30 shadow-md' : 'shadow-xs border-stone-200'
            }`}
          >
            {/* Pattern Overlay background watermarks */}
            <div className={`absolute inset-0 pointer-events-none opacity-40 ${styleCustom.patternClass}`} />

            {/* Top Active Bar Glow Indicator */}
            {isActive && (
              <div
                className="absolute top-0 inset-x-0 h-1.5 z-10"
                style={{ backgroundColor: p.themeColor }}
              />
            )}

            {/* Corner Decorative Watermark */}
            <div className="absolute -bottom-1 -right-1 text-slate-800/10 font-bold font-retro text-5xl select-none pointer-events-none">
              {styleCustom.cornerSymbol}
            </div>

            {/* Header: Name and Custom Subtitle */}
            <div className="flex justify-between items-start z-10">
              <div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block animate-pulse"
                    style={{ backgroundColor: p.themeColor }}
                  />
                  <h3 className={`font-retro text-[10.5px] ${styleCustom.titleColor} font-black leading-none tracking-wider`}>
                    {p.name}
                  </h3>
                </div>
                <p className="text-[8.5px] font-mono text-stone-500 mt-1 uppercase">
                  {citySubtitle}
                </p>
              </div>

              {/* Sub-backpack action slots */}
              <div className="flex items-center gap-0.5 shrink-0">
                {/* 1. 战备 */}
                <button
                  onClick={() => onOpenMilitaryDeck(idx)}
                  className="p-1 rounded bg-[#fff8eb] border border-[#7a5d1b]/30 hover:bg-[#ebdcc3] text-red-700 transition-colors cursor-pointer flex items-center justify-center shadow-xs select-none"
                  title={`${p.name}的武装战备署`}
                >
                  <Swords className="w-2.5 h-2.5 text-red-600" />
                </button>

                {/* 2. 巫术 */}
                <button
                  onClick={() => onOpenWitchcraft(idx)}
                  className="p-1 rounded bg-[#fff8eb] border border-[#7a5d1b]/30 hover:bg-[#ebdcc3] text-purple-700 transition-colors cursor-pointer flex items-center justify-center shadow-xs select-none"
                  title={`${p.name}的巫术残片祭台`}
                >
                  <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                </button>

                {/* 3. 设施 */}
                <button
                  onClick={() => onOpenBackpack(idx)}
                  className="p-1 rounded bg-[#fff8eb] border border-[#7a5d1b]/30 hover:bg-[#ebdcc3] text-amber-700 transition-colors cursor-pointer flex items-center justify-center shadow-xs select-none"
                  title={`${p.name}的国库设施行囊`}
                >
                  <Briefcase className="w-2.5 h-2.5 text-amber-600" />
                </button>

                {/* 4. 贸易路线 (Only shown if player has tradeMarket) */}
                {p.buildings.includes('tradeMarket') && (
                  <button
                    onClick={() => onOpenTradeRoute(idx)}
                    className="p-1 rounded bg-[#fff8eb] border border-[#7a5d1b]/30 hover:bg-[#ebdcc3] text-emerald-700 transition-colors cursor-pointer flex items-center justify-center shadow-xs select-none"
                    title={`${p.name}的特殊背包-贸易路线车队`}
                  >
                    <span className="text-[10px] leading-none filter drop-shadow font-black">🐫</span>
                  </button>
                )}
              </div>
            </div>

            {/* Material Grid Details - Styled in elegant light boxes */}
            <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-stone-800 z-10">
              <div className="bg-white/80 backdrop-blur-xs p-1.5 rounded-lg border border-[#e2d5bd]">
                <span className="text-[8px] text-stone-500 font-retro block font-bold">🪙 城市金库:</span>
                <span className="font-mono text-[10.5px] text-[#b45309] font-black">
                  {resourcesHidden ? '???' : `${p.gold} 块`}
                </span>
              </div>

              <div className="bg-white/80 backdrop-blur-xs p-1.5 rounded-lg border border-[#e2d5bd]">
                <span className="text-[8px] text-stone-500 font-retro block font-bold">🪨 石料储备:</span>
                <span className="font-mono text-[10.5px] text-stone-700 font-black">
                  {resourcesHidden ? '???' : `${p.stone} 堆`}
                </span>
              </div>

              <div className="bg-white/80 backdrop-blur-xs p-1.5 rounded-lg border border-[#e2d5bd]">
                <span className="text-[8px] text-stone-500 font-retro block font-bold">🪵 仓储木材:</span>
                <span className="font-mono text-[10.5px] text-[#7c2d12] font-black">
                  {resourcesHidden ? '???' : `${p.wood} 捆`}
                </span>
              </div>

              <div className="bg-white/80 backdrop-blur-xs p-1.5 rounded-lg border border-[#e2d5bd]">
                <span className="text-[8px] text-stone-500 font-retro block font-bold">🛡️ 城防壁垒:</span>
                <span className="font-mono text-[10.5px] text-sky-700 font-black">
                  {effectiveDefense} 点
                </span>
              </div>
            </div>

            {/* Dynamic visual representation of Built Buildings */}
            <div className="mt-2.5 flex flex-wrap gap-1 items-center min-h-[22px] bg-[#fbf9f4]/90 p-1.5 rounded border border-[#e2d5bd] z-10">
              {uniqueBuildings.length === 0 ? (
                <span className="text-[8px] font-retro text-stone-400 italic scale-90">尚未营建生产建筑</span>
              ) : (
                uniqueBuildings.map((bKey, bIdx) => {
                  const card = CARD_DEFINITIONS[bKey];
                  const count = p.buildings.filter((b) => b === bKey).length;
                  const isPowerDisabled = p.disabledBuildings.some((d) => d.key === bKey);
                  return (
                    <span
                      key={`${bKey}-${bIdx}`}
                      title={`${card?.name} x${count} ${isPowerDisabled ? '(被砸垮失效中)' : ''}`}
                      className={`text-xs px-1 py-0.5 rounded flex items-center gap-0.5 border ${
                        isPowerDisabled
                          ? 'bg-red-50 text-red-800 border-red-200 line-through opacity-50 grayscale'
                          : 'bg-white border-stone-200 text-stone-800'
                      }`}
                    >
                      <span>{card?.icon}</span>
                      {count > 1 && <span className="text-[8px] text-amber-600 font-bold">x{count}</span>}
                    </span>
                  );
                })
              )}
            </div>

            {/* Actions: Outward Warfare controls */}
            <div className="mt-3 pt-2.5 border-t border-[#e2d5bd] flex flex-col gap-1.5 z-10">
              <div className="flex gap-1">
                {/* Active Strike War button */}
                <button
                  disabled={!canAttack}
                  onClick={() => {
                    const targetPromptNode = document.getElementById('target-select-dialog');
                    if (targetPromptNode) {
                      targetPromptNode.style.display = 'flex';
                    }
                  }}
                  className={`flex-1 py-1 px-1 rounded text-[9px] font-retro flex items-center justify-center gap-1 border-2 transition-all cursor-pointer ${
                    canAttack
                      ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-400 active:scale-95'
                      : 'bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Swords className="w-3 h-3 text-red-600" />
                  <span>出击 ({p.attackCount}/2)</span>
                </button>

                {/* Weather Altar controls if they have it */}
                {p.buildings.includes('witchAltar') && (
                  <button
                    disabled={!isActive || p.witchCooldown > 0}
                    onClick={() => onOpenWitchAltar(idx)}
                    className={`px-2 py-1 rounded text-[9px] font-retro flex items-center justify-center gap-0.5 border-2 ${
                      isActive && p.witchCooldown === 0
                        ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 cursor-pointer active:scale-95'
                        : 'bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed opacity-50'
                    }`}
                    title={
                      p.witchCooldown > 0
                        ? `祈天台恢复中，剩下 ${p.witchCooldown} 回合`
                        : '降临风雪或晴日神威天气'
                    }
                  >
                    <CloudSun className="w-3 h-3 text-purple-600" />
                    <span>祈天</span>
                  </button>
                )}
              </div>

              {/* Extra barracks boost text */}
              {extraBarracksBonus > 0 && (
                <p className="text-[7.5px] font-retro text-red-600 text-center animate-pulse tracking-tighter leading-none font-bold">
                  ⚔️ 暴兵加成！每次进攻多掠夺 {extraBarracksBonus} 份资源
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
