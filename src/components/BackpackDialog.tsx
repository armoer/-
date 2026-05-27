/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from 'react';
import { Player } from '../types';
import { CARD_DEFINITIONS } from '../cardsData';
import { X, ShieldAlert, Library } from 'lucide-react';
import { motion } from 'motion/react';

interface BackpackDialogProps {
  player: Player | null;
  playerIdx: number;
  activePlayerIdx: number;
  onClose: () => void;
  onUseAttackCard?: (cardIdx: number) => void;
}

export const BackpackDialog: React.FC<BackpackDialogProps> = ({
  player,
  playerIdx,
  onClose,
}) => {
  if (!player) return null;

  return (
    <div className="fixed inset-0 bg-black/75 z-40 flex items-center justify-center p-4">
      {/* Container card styled in deep Redwood and Silver trim */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-[#2c1d12] border-2 border-slate-300 rounded-2xl p-5 shadow-[0_12px_45px_rgba(0,0,0,0.95)] relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h3 className="font-retro text-xs text-amber-400 flex items-center gap-1.5 font-bold mb-1">
          <span>📦 {player.name} 的城内设施与壁垒</span>
        </h3>
        <p className="text-[9.5px] text-slate-300/80 tracking-tight font-sans mb-4">
          查看该城邦内已营建的基础生活生产设施，以及加固运作的阻隔壁垒城墙
        </p>

        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
          {/* Section: Passive operating buildings */}
          <div className="border border-slate-700/60 bg-black/25 rounded-xl p-3">
            <h4 className="text-[10px] font-retro text-emerald-400 font-bold mb-2 flex items-center gap-1">
              <Library className="w-3.5 h-3.5" />
              城邦生活设施 ({player.buildings.length} 座)
            </h4>

            {player.buildings.length === 0 ? (
              <p className="text-[10px] text-zinc-500 italic font-sans">尚无营建，请前往无限集市采购。</p>
            ) : (
              <div className="grid grid-cols-1 gap-1.5">
                {player.buildings.map((bKey, idx) => {
                  const card = CARD_DEFINITIONS[bKey];
                  if (!card) return null;
                  const isPowerDisabled = player.disabledBuildings.some((d) => d.key === bKey);

                  return (
                    <div
                      key={`${bKey}-${idx}`}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-[#140b05] border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg filter select-none">{card.icon}</span>
                        <div>
                          <p className={`font-semibold text-[11px] ${isPowerDisabled ? 'text-red-500 line-through' : 'text-neutral-100'}`}>
                            {card.name}
                          </p>
                          <p className="text-[8.5px] text-zinc-400 font-sans leading-none mt-0.5">
                            {isPowerDisabled ? '⚠️ 遭遇投石车砸垮停摆中' : card.effect}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-retro text-amber-500 font-bold">⭐+{card.prosperity || 0}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Defense Armors Block */}
          <div className="border border-slate-700/60 bg-black/25 rounded-xl p-3">
            <h4 className="text-[10px] font-retro text-sky-400 font-bold mb-2 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              当前防御工事壁垒
            </h4>

            {player.defenseItems.length === 0 ? (
              <p className="text-[10px] text-zinc-500 italic font-sans">当前没有任何防御防御壁垒，城防极易失守！</p>
            ) : (
              <div className="grid grid-cols-1 gap-1.5">
                {player.defenseItems.map((item, idx) => {
                  const card = CARD_DEFINITIONS[item.key];
                  if (!card) return null;

                  return (
                    <div
                      key={`${item.key}-${idx}`}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-[#140b05] border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-base select-none">{card.icon}</span>
                        <span className="font-semibold text-neutral-100 text-[11px]">{card.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-400 font-sans">工事耐久:</span>
                        <span className="text-[9.5px] font-retro font-bold text-sky-400 bg-sky-950/40 border border-sky-800/60 px-1 py-0.2 rounded">
                          {item.currentDefense} HP
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footing note */}
        <div className="mt-4 pt-3 border-t border-slate-700/40 text-[8px] text-slate-500 text-center uppercase font-retro tracking-tighter">
          &bull; 皇家建设与城防监理核执 &bull;
        </div>
      </motion.div>
    </div>
  );
};
