/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from '../types';
import { CARD_DEFINITIONS } from '../cardsData';
import { RefreshCw, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface CardMarketProps {
  shopCards: string[];
  dynamicCosts?: Record<number, number>; // Maps index (0 to 6) to randomized cost for specific cards (e.g., ancientMap)
  onBuyCard: (index: number) => void;
  refreshCost: number;
  freeRefreshes: number;
  onRefreshShop: () => void;
  gold: number;
  stone: number;
  wood: number;
  hasBarracks: boolean;
  hasBlacksmith: boolean;
  hasTemple: boolean;
  hasAcademy: boolean;
  isTyphoon: boolean;
  playerBuildings?: string[];
  activeCargo?: { stone: number; wood: number; proposedToIdx: number } | null;
  activeCargoSenderName?: string;
}

export const CardMarket: React.FC<CardMarketProps> = ({
  shopCards,
  dynamicCosts = {},
  onBuyCard,
  refreshCost,
  freeRefreshes,
  onRefreshShop,
  gold,
  stone,
  wood,
  hasBarracks,
  hasBlacksmith,
  hasTemple,
  hasAcademy,
  isTyphoon,
  playerBuildings = [],
  activeCargo = null,
  activeCargoSenderName = '',
}) => {
  return (
    <div className="bg-[#fcfaf4] border-4 border-[#7a5d1b] p-4.5 rounded-xl shadow-[0_8px_30px_rgba(46,31,18,0.12)]">
      {/* Shop Header */}
      <div className="flex justify-between items-center mb-4 border-b-2 border-[#e2d5bd] pb-2 text-stone-800">
        <div className="flex items-center gap-2">
          <span className="text-[#a16207] font-retro text-xs tracking-wider animate-pulse font-black">
            🏪 无限集市 🏪
          </span>
          <span className="text-[9.5px] text-stone-600 font-sans opacity-95 bg-[#f5efe2] border border-[#e2d5bd] px-2 py-0.5 rounded font-medium">
            本回合上架 7 枚神力卡牌，点击可购买营建
          </span>
        </div>
        <button
          onClick={onRefreshShop}
          className="flex items-center gap-1.5 text-[9.5px] font-retro py-1.5 px-3 bg-[#faf6eb] hover:bg-[#eaddca] text-[#7a5d1b] font-bold rounded-lg border-2 border-[#7a5d1b]/40 hover:border-[#7a5d1b] transition-all cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3 h-3 text-[#7a5d1b] animate-spin" style={{ animationDuration: '6s' }} />
          <span>刷新集市: </span>
          {freeRefreshes > 0 ? (
            <span className="text-emerald-700 font-black">免费 ({freeRefreshes}次)</span>
          ) : (
            <span className="text-amber-800 font-black">{refreshCost} 💰</span>
          )}
        </button>
      </div>

      {/* Market Cards Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {shopCards.map((cardId, index) => {
          const originalCard = CARD_DEFINITIONS[cardId];
          if (!originalCard) return null;

          // Create a mutable copy of the card object
          const card = { ...originalCard };

          // Override for tradeCargo card if sent to this player
          if (cardId === 'tradeCargo' && activeCargo) {
            const amount = activeCargo.stone > 0 ? activeCargo.stone : activeCargo.wood;
            card.name = activeCargo.stone > 0 ? `来自【${activeCargoSenderName}】的石料` : `来自【${activeCargoSenderName}】的木材`;
            card.icon = activeCargo.stone > 0 ? '🪨' : '🪵';
            card.effect = activeCargo.stone > 0 
              ? `购买可直接获得由 【${activeCargoSenderName}】 托运销售的 ${activeCargo.stone} 堆石料。售价为 ${activeCargo.stone} 金币！` 
              : `购买可直接获得由 【${activeCargoSenderName}】 托运销售的 ${activeCargo.wood} 捆木材。售价为 ${activeCargo.wood} 金币！`;
            card.costGold = amount;
            card.costStone = 0;
            card.costWood = 0;
          }

          // Prerequisite checks
          let isLocked = false;
          let lockReason = '';

          if (card.requiresBarracks && !hasBarracks) {
            isLocked = true;
            lockReason = '需兵营';
          } else if (card.requiresBlacksmith && !hasBlacksmith) {
            isLocked = true;
            lockReason = '需铁匠铺';
          } else if (card.id === 'ironWall' && !hasBlacksmith) {
            isLocked = true;
            lockReason = '需铁匠铺';
          } else if (card.id === 'siege' && (!hasBarracks || !hasBlacksmith)) {
            isLocked = true;
            lockReason = '需营+铁匠';
          } else if (card.id === 'witchAltar' && (!hasTemple || !hasAcademy)) {
            isLocked = true;
            lockReason = '神殿+学院';
          }

          // Typhoon weather locks all military & defense purchases (cannot be used)
          if (isTyphoon && (card.type === 'military' || card.type === 'defense')) {
            isLocked = true;
            lockReason = card.type === 'military' ? '🌪️台风禁售' : '🌪️飓风禁建';
          }

          // Cost scaling for identical building cards ('build' and 'dev')
          // Except for tradeCargo, which is a virtual card representing goods transport
          const isBuilding = (card.type === 'build' || card.type === 'dev') && card.id !== 'tradeCargo';
          const extraCost = isBuilding ? Math.floor(playerBuildings.filter(bId => bId === card.id).length / 2) : 0;

          // Dynamic cost determination (ancientMap is random 1-5 gold)
          const baseCostGold = dynamicCosts[index] !== undefined ? dynamicCosts[index] : card.costGold;
          const cardCostGold = baseCostGold + extraCost;
          const cardCostStone = card.costStone + extraCost;
          const cardCostWood = card.costWood + extraCost;

          // Can afford check
          const canAfford =
            gold >= cardCostGold &&
            stone >= cardCostStone &&
            wood >= cardCostWood;

          const isBuyable = !isLocked && canAfford;
          const isRare = card.id === 'witchAltar' || card.id === 'wishingWell';

          // Border color styling by type
          let typeBorderColor = 'border-stone-300 hover:border-slate-400';
          let typeBgGlow = 'rgba(122, 93, 27, 0.02)';
          let shadowHover = 'hover:shadow-amber-800/10';

          if (isLocked) {
            typeBorderColor = 'border-red-200/50 opacity-60';
            typeBgGlow = 'rgba(239, 68, 68, 0.01)';
          } else if (isRare) {
            // Sparkling gold border for rare cards
            typeBorderColor = isBuyable 
              ? 'border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]' 
              : 'border-stone-600';
            typeBgGlow = 'rgba(245, 158, 11, 0.1)';
            shadowHover = 'hover:shadow-amber-500/25';
          } else {
            switch (card.type) {
              case 'build':
                typeBorderColor = 'border-emerald-600/80 hover:border-emerald-400';
                typeBgGlow = 'rgba(16, 185, 129, 0.06)';
                shadowHover = 'hover:shadow-emerald-700/10';
                break;
              case 'military':
                typeBorderColor = 'border-red-600/80 hover:border-red-400';
                typeBgGlow = 'rgba(239, 68, 68, 0.08)';
                shadowHover = 'hover:shadow-red-700/10';
                break;
              case 'dev':
                typeBorderColor = 'border-purple-600/80 hover:border-purple-400';
                typeBgGlow = 'rgba(168, 85, 247, 0.06)';
                shadowHover = 'hover:shadow-purple-700/10';
                break;
              case 'defense':
                typeBorderColor = 'border-sky-600/80 hover:border-sky-400';
                typeBgGlow = 'rgba(14, 165, 233, 0.06)';
                shadowHover = 'hover:shadow-sky-700/10';
                break;
              case 'resource':
                typeBorderColor = 'border-amber-600/80 hover:border-amber-400';
                typeBgGlow = 'rgba(245, 158, 11, 0.06)';
                shadowHover = 'hover:shadow-amber-700/10';
                break;
            }
          }

          // Background color and backgrounds
          const cardBgStyle = isBuyable
            ? {
                backgroundColor: '#ffffff',
                backgroundImage: `radial-gradient(ellipse at top, ${typeBgGlow}, transparent)`,
              }
            : {
                backgroundColor: '#2e2e33', // Beautiful carbon slate gray for unbuyable
                backgroundImage: 'none',
              };

          return (
            <motion.div
              layout
              key={`${cardId}-${index}`}
              whileHover={isBuyable ? { y: -3, scale: 1.015 } : {}}
              onClick={() => {
                if (isBuyable) {
                  onBuyCard(index);
                }
              }}
              className={`p-2.5 rounded-xl border-2 flex flex-col justify-between min-h-[155px] transition-all duration-200 select-none relative ${typeBorderColor} ${
                isBuyable ? 'cursor-pointer shadow-sm hover:shadow-md' : 'cursor-not-allowed opacity-[0.78]'
              } ${isBuyable ? shadowHover : ''}`}
              style={cardBgStyle}
            >
              {/* Card Icon & Name */}
              <div>
                <div className="flex justify-between items-start">
                  <div className="relative">
                    <span className="text-xl filter drop-shadow select-none">{card.id === 'ancientMap' ? '🔮' : card.icon}</span>
                    {/* Sparkling particle animations for rare cards */}
                    {isRare && isBuyable && (
                      <>
                        <span className="absolute -top-1.5 -left-1.5 text-[8px] animate-ping duration-1000">✨</span>
                        <span className="absolute -bottom-1 -right-1 text-[7px] animate-bounce text-amber-500">✨</span>
                      </>
                    )}
                  </div>
                  {isLocked ? (
                    <span className="bg-red-950/40 border border-red-900/40 text-red-400 px-1 py-0.2 rounded text-[7px] flex items-center gap-0.5 font-sans font-bold shadow-2xs">
                      <Lock className="w-2 h-2" />
                      {lockReason}
                    </span>
                  ) : isRare ? (
                    <span className={`px-1.5 py-0.5 rounded text-[7px] font-retro font-black shadow-xs tracking-wider uppercase animate-pulse ${
                      isBuyable ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-stone-800 text-stone-500 border border-stone-700'
                    }`}>
                      👑 珍稀建筑
                    </span>
                  ) : null}
                </div>

                <h4 className={`text-[10px] font-retro mt-1.5 font-black tracking-tight truncate leading-none ${
                  isBuyable ? 'text-stone-900' : 'text-stone-300'
                }`}>
                  {card.name}
                </h4>

                <p className={`text-[8.5px] font-sans leading-tight mt-1 line-clamp-3 font-medium ${
                  isBuyable ? 'text-stone-600' : 'text-stone-400'
                }`}>
                  {card.effect}
                </p>
              </div>

              {/* Cost specifications */}
              <div className={`mt-2.5 pt-1.5 border-t flex flex-col gap-0.5 ${
                isBuyable ? 'border-[#e2d5bd]/60' : 'border-stone-800'
              }`}>
                <span className={`text-[7.5px] block font-retro ${
                  isBuyable ? 'text-stone-400' : 'text-stone-500'
                }`}>费用:</span>
                <div className="flex flex-wrap gap-1 items-center">
                  {cardCostGold > 0 && (
                    <span
                      className={`text-[8px] font-mono px-1 rounded py-0.2 font-bold flex items-center gap-0.5 ${
                        gold >= cardCostGold 
                          ? 'text-amber-800 bg-amber-50 border border-amber-300' 
                          : isBuyable 
                            ? 'text-stone-400 line-through bg-stone-50 border border-stone-200/60'
                            : 'text-stone-600 line-through bg-stone-800/80 border border-stone-800'
                      }`}
                    >
                      🪙{card.id === 'ancientMap' ? `? (当前:${cardCostGold})` : cardCostGold}
                    </span>
                  )}
                  {cardCostStone > 0 && (
                    <span
                      className={`text-[8px] font-mono px-1 rounded py-0.2 font-bold flex items-center gap-0.5 ${
                        stone >= cardCostStone 
                          ? 'text-stone-700 bg-stone-50 border border-stone-300' 
                          : isBuyable
                            ? 'text-stone-400 line-through bg-stone-50 border border-stone-200/60'
                            : 'text-stone-600 line-through bg-stone-800/80 border border-stone-800'
                      }`}
                    >
                      🪨{cardCostStone}
                    </span>
                  )}
                  {cardCostWood > 0 && (
                    <span
                      className={`text-[8px] font-mono px-1 rounded py-0.2 font-bold flex items-center gap-0.5 ${
                        wood >= cardCostWood 
                          ? 'text-amber-900 bg-amber-50/40 border border-amber-200' 
                          : isBuyable
                            ? 'text-stone-400 line-through bg-stone-50 border border-stone-200/60'
                            : 'text-stone-600 line-through bg-stone-800/80 border border-stone-800'
                      }`}
                    >
                      🪵{cardCostWood}
                    </span>
                  )}
                  {cardCostGold === 0 && cardCostStone === 0 && cardCostWood === 0 && (
                    <span className="text-[8px] font-retro text-emerald-700 bg-green-50 border border-green-200 px-1 rounded-sm font-bold">
                      🆓 免费
                    </span>
                  )}
                </div>

                {/* Status buy indicator link */}
                <div className="mt-1 text-right leading-none">
                  {isBuyable ? (
                    <span className="text-[7px] font-retro text-green-700 animate-pulse font-bold">点击购买</span>
                  ) : isLocked ? (
                    <span className="text-[7px] font-retro text-red-400 font-bold">尚未解锁</span>
                  ) : (
                    <span className="text-[7px] font-retro text-stone-500 font-bold">资源不足</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
