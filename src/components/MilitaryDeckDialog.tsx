/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from 'react';
import { Player } from '../types';
import { CARD_DEFINITIONS } from '../cardsData';
import { X, Swords, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface MilitaryDeckDialogProps {
  player: Player | null;
  playerIdx: number;
  activePlayerIdx: number;
  onClose: () => void;
  onUseAttackCard: (cardIdx: number) => void;
  isTyphoon?: boolean;
}

export const MilitaryDeckDialog: React.FC<MilitaryDeckDialogProps> = ({
  player,
  playerIdx,
  activePlayerIdx,
  onClose,
  onUseAttackCard,
  isTyphoon = false,
}) => {
  if (!player) return null;

  const isCurrentTurn = playerIdx === activePlayerIdx;

  return (
    <div className="fixed inset-0 bg-black/75 z-40 flex items-center justify-center p-4">
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
        <h3 className="font-retro text-xs text-red-400 flex items-center gap-1.5 font-bold mb-1">
          <span>⚔️ {player.name} 的城邦重兵战备署</span>
        </h3>
        <p className="text-[9.5px] text-slate-300/80 font-sans mb-4 h-5 truncate">
          屯积战记秘卷与攻城重械，在此发号施令，踏平敌阵！
        </p>

        {/* Attack cards lists */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {player.attackCards.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 italic bg-black/20 rounded-xl border border-dashed border-amber-900/40 text-[11px] font-sans">
              <p className="mb-1">⚔️ 当前城中空空，无任何在编军事策卡/重械。</p>
              <p className="text-[9px] text-neutral-600">请前往「无限集市」物色招募在编武备！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {player.attackCards.map((cKey, idx) => {
                const card = CARD_DEFINITIONS[cKey];
                if (!card) return null;

                return (
                  <div
                    key={`${cKey}-${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-slate-700/60 hover:border-slate-500 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl select-none filter drop-shadow">{card.icon}</span>
                      <div>
                        <h4 className="font-bold text-amber-100 text-[11px] font-retroLeading leading-tight font-black">
                          {card.name}
                        </h4>
                        <p className="text-[9px] text-slate-400 mt-0.5 leading-snug">
                          {card.effect}
                        </p>
                      </div>
                    </div>

                    <div>
                      {isCurrentTurn ? (
                        <button
                          type="button"
                          disabled={isTyphoon}
                          onClick={() => onUseAttackCard(idx)}
                          className={`py-1 px-3 text-[9px] font-retro rounded border-b-2 transition-all shadow ${
                            isTyphoon
                              ? 'bg-zinc-800 text-zinc-500 border-zinc-950 cursor-not-allowed opacity-50'
                              : 'bg-[#851c1c] hover:bg-[#a92222] text-white border-red-950 cursor-pointer active:scale-95'
                          }`}
                        >
                          {isTyphoon ? '🌪️ 飓风禁运' : '发兵发动'}
                        </button>
                      ) : (
                        <span className="text-[8px] font-retro text-neutral-500 opacity-60">非本人回合</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Foot trim details */}
        <div className="mt-5 pt-3 border-t border-slate-700/40 text-[8px] text-slate-500 text-center font-retro tracking-wide">
          🛡️ 统帅部最高军情特参保执 🛡️
        </div>
      </motion.div>
    </div>
  );
};
