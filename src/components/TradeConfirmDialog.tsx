/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player } from '../types';
import { Check, X, Coins, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

interface TradeConfirmDialogProps {
  sender: Player;
  senderIdx: number;
  receiver: Player;
  receiverIdx: number;
  stone: number;
  wood: number;
  onConfirm: () => void;
  onReject: () => void;
}

export const TradeConfirmDialog: React.FC<TradeConfirmDialogProps> = ({
  sender,
  receiver,
  stone,
  wood,
  onConfirm,
  onReject,
}) => {
  const totalCost = stone + wood;
  const canAfford = receiver.gold >= totalCost;

  // Prosperity payout calculation
  const senderMarketsCount = sender.buildings.filter((b) => b === 'tradeMarket').length;
  const expectedProsperityGain = senderMarketsCount;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        className="w-full max-w-md bg-[#251811] border-4 border-[#c27a3d] rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.95)] relative"
      >
        {/* Animated Badge */}
        <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-amber-500 border-2 border-amber-300 px-3 py-1 rounded-full shadow-md text-stone-900 font-retro text-[8.5px] font-black tracking-wider animate-bounce uppercase">
          🐫 驼队入城提案
        </div>

        {/* Header Text */}
        <div className="text-center mt-3 mb-4">
          <p className="text-[10.5px] text-amber-200 font-retro font-bold">
            【{sender.name}】 的商旅驼队抵达 【{receiver.name}】！
          </p>
          <div className="h-0.5 w-16 bg-amber-600/60 mx-auto mt-2" />
        </div>

        {/* Content Box */}
        <div className="bg-[#120803] border border-amber-900/40 p-4 rounded-xl space-y-3">
          <p className="text-[9.5px] text-amber-100/95 font-sans leading-relaxed text-center">
            他们装满了珍贵的建筑储备物资，希望能以价格各 <span className="text-yellow-400 font-bold">1 枚金币/单位</span> 的低廉约定，与你换取流动资金筹款。
          </p>

          {/* Trade Inventory Cards */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {stone > 0 && (
              <div className="bg-stone-900/40 p-2 rounded-lg border border-amber-900/20 text-center">
                <span className="text-lg block">🪨</span>
                <span className="text-[10px] text-zinc-300 font-sans block mt-0.5">石料物资</span>
                <span className="text-[11px] font-mono text-amber-400 font-bold block">{stone} 堆</span>
              </div>
            )}
            {wood > 0 && (
              <div className="bg-stone-900/40 p-2 rounded-lg border border-amber-900/20 text-center">
                <span className="text-lg block">🪵</span>
                <span className="text-[10px] text-zinc-300 font-sans block mt-0.5">木材储备</span>
                <span className="text-[11px] font-mono text-amber-400 font-bold block">{wood} 捆</span>
              </div>
            )}
          </div>

          <div className="h-0.5 w-full border-t border-dashed border-amber-900/30" />

          {/* Transaction Summary Info */}
          <div className="space-y-1.5 text-[9px] font-sans">
            <div className="flex justify-between items-center text-zinc-400">
              <span className="flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-yellow-500" /> 应付金币：
              </span>
              <span className={`font-mono text-[11px] font-black ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                {totalCost} 💰 {canAfford ? `(当前余额: ${receiver.gold})` : `(余额不足: ${receiver.gold})`}
              </span>
            </div>
            <div className="flex justify-between items-center text-zinc-400">
              <span className="flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> 对手获得：
              </span>
              <span className="text-emerald-400 font-bold">
                +{totalCost} 金币并积攒 +{expectedProsperityGain} 点繁荣
              </span>
            </div>
          </div>
        </div>

        {/* Error warning for canAfford */}
        {!canAfford && (
          <p className="text-center text-[8.5px] font-retro text-red-400 tracking-tight mt-3 bg-red-950/20 border border-red-900/30 py-1.5 px-3.5 rounded-lg">
            ⚠️ 遗憾：你城内金库储备仅剩低于 {totalCost} 块，无力购置本车队货藏！
          </p>
        )}

        {/* Buttons Row */}
        <div className="flex gap-2.5 mt-5">
          {/* Reject */}
          <button
            onClick={onReject}
            className="flex-1 py-2 rounded-xl text-[9.5px] font-retro border border-[#855431] text-amber-300 hover:text-white hover:bg-white/5 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>婉言谢绝</span>
          </button>

          {/* Accept */}
          <button
            onClick={onConfirm}
            disabled={!canAfford}
            className={`flex-1 py-1.5 md:py-2 px-1 rounded-xl text-[9.5px] font-retro font-bold flex items-center justify-center gap-1.5 border-2 transition-all ${
              canAfford
                ? 'bg-amber-500 hover:bg-amber-400 border-amber-300 text-stone-900 shadow-md cursor-pointer active:scale-98'
                : 'bg-stone-900 border-zinc-800 text-stone-600 cursor-not-allowed opacity-50'
            }`}
          >
            <Check className="w-3.5 h-3.5 font-black" />
            <span>签字认购 (付款 🪙)</span>
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-amber-950 text-[8px] text-amber-300/30 text-center uppercase font-retro tracking-tighter">
          &bull; 联席城邦外服司文印信 &bull;
        </div>
      </motion.div>
    </div>
  );
};
