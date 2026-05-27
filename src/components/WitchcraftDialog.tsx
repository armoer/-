/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player } from '../types';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

interface WitchcraftDialogProps {
  player: Player | null;
  onClose: () => void;
}

export const WitchcraftDialog: React.FC<WitchcraftDialogProps> = ({ player, onClose }) => {
  if (!player) return null;

  const weatherFragmentsCount = player.fragments.filter((f) => f.type === 'weather').length;
  const prosperityFragmentsCount = player.fragments.filter((f) => f.type === 'prosperity').length;
  const warFragmentsCount = player.fragments.filter((f) => f.type === 'war').length;
  const guardianFragmentsCount = player.fragments.filter((f) => f.type === 'guardian').length;

  return (
    <div className="fixed inset-0 bg-black/75 z-40 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm bg-[#2b1b11] border-2 border-[#caa43c] rounded-2xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.9)] text-amber-100 relative max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-amber-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h3 className="font-retro text-xs text-amber-400 flex items-center gap-1.5 font-bold mb-1">
          <span>🔮 {player.name} 的城邦巫术祭台</span>
        </h3>
        <p className="text-[9px] text-[#ebdcc5]/70 mb-4 font-sans leading-snug">
          筹谋神令天象变革，集齐两枚同种残片即可自动引发对应超自然浩荡法术！
        </p>

        {/* Shards Display */}
        <div className="space-y-3">
          {/* Weather Shards */}
          <div className="p-3 rounded-lg bg-black/30 border border-amber-900/40 flex flex-col items-center text-center">
            <span className="text-2xl mb-1">🌀</span>
            <span className="text-[10px] font-retro text-purple-300 font-bold block">天象变革气象碎片</span>
            <p className="text-[8px] text-zinc-400 mt-0.5 max-w-[240px]">
              凑齐 2 张即可随机改写全图天候为台风、大雷雨或旱灾等，持续 3 轮！
            </p>
            <div className="w-28 bg-purple-950/40 border border-purple-800/50 h-2.5 rounded-full mt-2 overflow-hidden relative">
              <div 
                className="bg-purple-500 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (weatherFragmentsCount / 2) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-purple-400 mt-1 font-bold">
              收集进度: {weatherFragmentsCount} / 2
            </span>
          </div>

          {/* Prosperity Shards */}
          <div className="p-3 rounded-lg bg-black/30 border border-amber-900/40 flex flex-col items-center text-center">
            <span className="text-2xl mb-1">🌾</span>
            <span className="text-[10px] font-retro text-yellow-400 font-bold block">神罗丰登繁荣碎片</span>
            <p className="text-[8px] text-zinc-400 mt-0.5 max-w-[240px]">
              凑齐 2 张即刻降下甘霖大丰收，城内所有非瘫痪生产建筑立刻爆产出一轮！
            </p>
            <div className="w-28 bg-yellow-950/40 border border-[#b45309]/50 h-2.5 rounded-full mt-2 overflow-hidden relative">
              <div 
                className="bg-yellow-500 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (prosperityFragmentsCount / 2) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-yellow-500 mt-1 font-bold">
              收集进度: {prosperityFragmentsCount} / 2
            </span>
          </div>

          {/* War Shards */}
          <div className="p-3 rounded-lg bg-black/30 border border-amber-900/40 flex flex-col items-center text-center">
            <span className="text-2xl mb-1">💥</span>
            <span className="text-[10px] font-retro text-red-400 font-bold block">狂澜烈焰战争碎片</span>
            <p className="text-[8px] text-zinc-400 mt-0.5 max-w-[240px]">
              凑齐 2 张即刻引战巫神临凡，主动对其他所有城邦发动一次 5 点火力的掠夺军奇袭！
            </p>
            <div className="w-28 bg-red-950/40 border border-red-900/50 h-2.5 rounded-full mt-2 overflow-hidden relative">
              <div 
                className="bg-red-500 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (warFragmentsCount / 2) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-red-400 mt-1 font-bold">
              收集进度: {warFragmentsCount} / 2
            </span>
          </div>

          {/* Guardian Shards */}
          <div className="p-3 rounded-lg bg-black/30 border border-amber-900/40 flex flex-col items-center text-center">
            <span className="text-2xl mb-1">🛡️</span>
            <span className="text-[10px] font-retro text-emerald-400 font-bold block">神迹不破防御碎片</span>
            <p className="text-[8px] text-zinc-400 mt-0.5 max-w-[240px]">
              凑齐 2 张壁垒将加护神迹光环，国都防御值瞬间翻倍且坚挺维持 2 个完整轮次！
            </p>
            <div className="w-28 bg-emerald-950/40 border border-emerald-900/50 h-2.5 rounded-full mt-2 overflow-hidden relative">
              <div 
                className="bg-emerald-550 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (guardianFragmentsCount / 2) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-emerald-400 mt-1 font-bold">
              收集进度: {guardianFragmentsCount} / 2
            </span>
          </div>
        </div>

        {/* Decorative metal label */}
        <div className="mt-4 pt-2.5 border-t border-amber-950 text-[8px] text-amber-550/40 text-center font-retro tracking-wide">
          🛡️ 远古大祭司圣堂加护之签 🛡️
        </div>
      </motion.div>
    </div>
  );
};
