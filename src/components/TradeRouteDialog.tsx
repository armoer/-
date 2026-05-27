/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { X, ArrowRight, CornerDownRight, Plus, Minus, Lock, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface TradeRouteDialogProps {
  player: Player | null;
  playerIdx: number;
  players: Player[];
  onClose: () => void;
  onAddStone: (pIdx: number) => void;
  onRemoveStone: (pIdx: number) => void;
  onAddWood: (pIdx: number) => void;
  onRemoveWood: (pIdx: number) => void;
  onExecuteTrade: (pIdx: number, targetIdx: number, stoneCount: number, woodCount: number) => void;
}

export const TradeRouteDialog: React.FC<TradeRouteDialogProps> = ({
  player,
  playerIdx,
  players,
  onClose,
  onAddStone,
  onRemoveStone,
  onAddWood,
  onRemoveWood,
  onExecuteTrade,
}) => {
  if (!player) return null;

  // Active cargo in backpack counts
  const cargoStone = player.tradeCargoStone ?? 0;
  const cargoWood = player.tradeCargoWood ?? 0;

  // Swapped limit checks
  const swappedGoldThisTurn = player.tradeGoldSwappedThisTurn ?? 0;
  const maxSwappableGoldRemaining = Math.max(0, 15 - swappedGoldThisTurn);

  // Targets definition
  const validTargets = players.filter((_, idx) => idx !== playerIdx);
  const [targetIdx, setTargetIdx] = useState<number | null>(null);

  // Multiples of 4 cargo to swap
  const [stoneToTrade, setStoneToTrade] = useState<number>(0);
  const [woodToTrade, setWoodToTrade] = useState<number>(0);

  // Set default target idx
  useEffect(() => {
    if (validTargets.length > 0 && targetIdx === null) {
      if (player.tradeTargetIdxThisTurn !== undefined && player.tradeTargetIdxThisTurn !== null) {
        setTargetIdx(player.tradeTargetIdxThisTurn);
      } else {
        const firstIdx = players.findIndex((p) => p.id === validTargets[0].id);
        if (firstIdx !== -1) setTargetIdx(firstIdx);
      }
    }
  }, [players, validTargets, targetIdx, player.tradeTargetIdxThisTurn]);

  // Adjust target index if locked by single target per turn rule
  useEffect(() => {
    if (player.tradeTargetIdxThisTurn !== undefined && player.tradeTargetIdxThisTurn !== null) {
      setTargetIdx(player.tradeTargetIdxThisTurn);
    }
  }, [player.tradeTargetIdxThisTurn]);

  // Reset trading counts if cargo content decreases
  useEffect(() => {
    if (stoneToTrade > cargoStone) {
      setStoneToTrade(Math.floor(cargoStone / 4) * 4);
    }
  }, [cargoStone, stoneToTrade]);

  useEffect(() => {
    if (woodToTrade > cargoWood) {
      setWoodToTrade(Math.floor(cargoWood / 4) * 4);
    }
  }, [cargoWood, woodToTrade]);

  const hasTradeMarket = player.buildings.includes('tradeMarket');
  const selectedTargetPlayer = targetIdx !== null ? players[targetIdx] : null;

  // Calculate swap metrics
  const calculatedGoldFromStone = Math.floor(stoneToTrade / 4);
  const calculatedGoldFromWood = Math.floor(woodToTrade / 4);
  const totalGoldFromSwap = calculatedGoldFromStone + calculatedGoldFromWood;

  // Increase/Decrease trade counts in multiples of 4
  const handleIncreaseStoneTrade = () => {
    const nextStone = stoneToTrade + 4;
    if (nextStone <= cargoStone) {
      const pendingGold = Math.floor(nextStone / 4) + calculatedGoldFromWood;
      if (pendingGold <= maxSwappableGoldRemaining) {
        setStoneToTrade(nextStone);
      }
    }
  };

  const handleDecreaseStoneTrade = () => {
    if (stoneToTrade >= 4) {
      setStoneToTrade(stoneToTrade - 4);
    }
  };

  const handleIncreaseWoodTrade = () => {
    const nextWood = woodToTrade + 4;
    if (nextWood <= cargoWood) {
      const pendingGold = calculatedGoldFromStone + Math.floor(nextWood / 4);
      if (pendingGold <= maxSwappableGoldRemaining) {
        setWoodToTrade(nextWood);
      }
    }
  };

  const handleDecreaseWoodTrade = () => {
    if (woodToTrade >= 4) {
      setWoodToTrade(woodToTrade - 4);
    }
  };

  const executeSwapAction = () => {
    if (targetIdx === null) return;
    if (totalGoldFromSwap <= 0) return;
    onExecuteTrade(playerIdx, targetIdx, stoneToTrade, woodToTrade);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-40 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm bg-[#121c17] border-2 border-emerald-500/80 rounded-2xl p-5 shadow-[0_12px_45px_rgba(16,185,129,0.25)] text-stone-100 relative max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#ace5d4] hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <h3 className="font-retro text-xs text-emerald-400 flex items-center gap-1.5 font-bold mb-1">
          <span>🐫 驼铃古道 - 特殊商贸行囊背包</span>
        </h3>
        <p className="text-[9px] text-[#ace5d4]/80 tracking-tight font-sans mb-3.5 leading-snug">
          商队行囊属万邦通用备用仓库。玩家可在此收纳木石矿货。当营建了<b>【贸易集市】</b>后，即可开启商路强制兑换其他城邦金库！
        </p>

        {/* SECTION 1: Cargo Stocking Warehouse */}
        <div className="bg-black/35 p-3 rounded-xl border border-emerald-900/60 mb-3 space-y-3.5">
          <span className="text-[8.5px] text-emerald-400 block font-retro uppercase tracking-wider font-bold">
            一、商组车队背包与领地仓库流转:
          </span>

          {/* Stone Stocking controls */}
          <div className="flex justify-between items-center text-[10px] font-sans">
            <div>
              <div className="font-bold flex items-center gap-1">
                <span>🪨 背包石料:</span>
                <span className="text-emerald-300 font-mono text-[11px] font-bold">{cargoStone} 堆</span>
              </div>
              <div className="text-[8px] text-zinc-400 font-medium">领地仓库: {player.stone} 堆</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRemoveStone(playerIdx)}
                disabled={cargoStone <= 0}
                className="w-6 h-6 rounded flex items-center justify-center bg-stone-800 border border-stone-700 text-stone-300 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                title="取出 1 堆石料回主仓库"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={() => onAddStone(playerIdx)}
                disabled={player.stone <= 0}
                className="w-6 h-6 rounded flex items-center justify-center bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                title="存入 1 堆石料进背包"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Wood Stocking controls */}
          <div className="flex justify-between items-center text-[10px] font-sans pt-1 border-t border-emerald-950/40">
            <div>
              <div className="font-bold flex items-center gap-1">
                <span>🪵 背包木材:</span>
                <span className="text-emerald-300 font-mono text-[11px] font-bold">{cargoWood} 捆</span>
              </div>
              <div className="text-[8px] text-zinc-400 font-medium">领地仓库: {player.wood} 捆</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRemoveWood(playerIdx)}
                disabled={cargoWood <= 0}
                className="w-6 h-6 rounded flex items-center justify-center bg-stone-800 border border-stone-700 text-stone-300 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                title="取出 1 捆木木回主仓库"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={() => onAddWood(playerIdx)}
                disabled={player.wood <= 0}
                className="w-6 h-6 rounded flex items-center justify-center bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                title="存入 1 捆木木进背包"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: Forced Trade Mechanics */}
        <div className="bg-black/35 p-3 rounded-xl border border-emerald-900/60 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[8.5px] text-emerald-400 block font-retro uppercase tracking-wider font-bold">
              二、驼铃出巡 · 4:1 强换别省金库:
            </span>
            {!hasTradeMarket && (
              <span className="bg-red-950/70 border border-red-900/60 px-1 py-0.5 rounded text-[7px] text-red-400 flex items-center gap-0.5 font-retro font-bold">
                <Lock className="w-2 h-2" />
                未建设集市
              </span>
            )}
          </div>

          {!hasTradeMarket ? (
            <div className="p-2.5 rounded-lg bg-red-950/25 border border-red-900/40 text-center">
              <p className="text-[8px] text-red-300 font-sans leading-relaxed">
                🔒 <b>强换交易已被扣押锁定</b><br />
                您的城内尚未营建 <b>【贸易集市】</b> 建筑。请先在中央卡牌商店购建集市，方可打通丝绸商道，强行倾销获取金币和繁荣！
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Target City Option Buttons */}
              <div>
                <label className="text-[8px] text-zinc-400 block font-retro mb-1.5">1. 选择贸易兑换对象：</label>
                <div className="flex flex-wrap gap-1.5">
                  {validTargets.map((t) => {
                    const targetIndexInAll = players.findIndex((p) => p.id === t.id);
                    const isSelected = targetIdx === targetIndexInAll;
                    const isLockedByTurnTrade = player.tradeTargetIdxThisTurn !== null && player.tradeTargetIdxThisTurn !== undefined && player.tradeTargetIdxThisTurn !== targetIndexInAll;

                    return (
                      <button
                        key={t.id}
                        disabled={!!isLockedByTurnTrade}
                        onClick={() => setTargetIdx(targetIndexInAll)}
                        className={`px-2 py-1.5 rounded-lg text-[9px] font-retro border transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-900 border-emerald-400 text-white font-bold cursor-pointer'
                            : isLockedByTurnTrade
                              ? 'bg-stone-900/40 border-stone-950 text-stone-550 opacity-30 cursor-not-allowed'
                              : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-emerald-600 cursor-pointer'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.themeColor }} />
                        <span>{t.name}</span>
                        {isSelected && <span className="text-[6.5px] text-emerald-300 font-bold">(已锚定)</span>}
                      </button>
                    );
                  })}
                </div>
                {player.tradeTargetIdxThisTurn !== null && player.tradeTargetIdxThisTurn !== undefined && (
                  <p className="text-[7.5px] text-yellow-500/80 font-sans mt-1">
                    📌 本回合本省已和其他城市发起换约，只能对选定的同个城市追加交易。
                  </p>
                )}
              </div>

              {/* Incremental multiple-of-4 click selectors */}
              <div className="space-y-2.5 pt-1 border-t border-emerald-950/50">
                <span className="text-[8px] text-zinc-450 block font-retro">2. 设定强制兑换交割量 (4 资源 = 1 金币 / 点击获 1 繁荣):</span>

                {/* Stone Trade Selector */}
                <div className="flex justify-between items-center text-[9px] font-sans">
                  <div className="flex flex-col">
                    <span className="font-bold">🪨 倾销背包石料:</span>
                    <span className="text-[7.5px] text-zinc-400">满足 4:1 兑换数量: {stoneToTrade} 堆</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleDecreaseStoneTrade}
                      disabled={stoneToTrade === 0}
                      className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-700 text-[8px] hover:bg-stone-800 disabled:opacity-30 cursor-pointer text-stone-400 font-bold"
                    >
                      -4
                    </button>
                    <span className="w-4 text-center font-bold text-yellow-400">{stoneToTrade}</span>
                    <button
                      onClick={handleIncreaseStoneTrade}
                      disabled={stoneToTrade + 4 > cargoStone || (Math.floor((stoneToTrade + 4) / 4) + calculatedGoldFromWood > maxSwappableGoldRemaining)}
                      className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[8px] hover:bg-emerald-900 disabled:opacity-30 cursor-pointer text-emerald-400 font-bold"
                    >
                      +4
                    </button>
                  </div>
                </div>

                {/* Wood Trade Selector */}
                <div className="flex justify-between items-center text-[9px] font-sans pt-1 border-t border-emerald-950/30">
                  <div className="flex flex-col">
                    <span className="font-bold">🪵 倾销背包木材:</span>
                    <span className="text-[7.5px] text-zinc-400">满足 4:1 兑换数量: {woodToTrade} 捆</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleDecreaseWoodTrade}
                      disabled={woodToTrade === 0}
                      className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-700 text-[8px] hover:bg-stone-800 disabled:opacity-30 cursor-pointer text-stone-400 font-bold"
                    >
                      -4
                    </button>
                    <span className="w-4 text-center font-bold text-yellow-400">{woodToTrade}</span>
                    <button
                      onClick={handleIncreaseWoodTrade}
                      disabled={woodToTrade + 4 > cargoWood || (calculatedGoldFromStone + Math.floor((woodToTrade + 4) / 4) > maxSwappableGoldRemaining)}
                      className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[8px] hover:bg-emerald-900 disabled:opacity-30 cursor-pointer text-emerald-400 font-bold"
                    >
                      +4
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview contract container */}
              {selectedTargetPlayer && (
                <div className="bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg text-[9px] font-sans space-y-1">
                  <span className="text-[#ace5d4] block font-retro text-[8px] font-bold tracking-wider uppercase">
                    📜 强强贸易换约书:
                  </span>
                  <div className="grid grid-cols-2 gap-1 mt-1 text-[8.5px]">
                    <div>
                      &bull; 出售物资: <span className="text-emerald-300 font-bold">
                        {stoneToTrade > 0 ? `🪨x${stoneToTrade} ` : ''}
                        {woodToTrade > 0 ? `🪵x${woodToTrade}` : ''}
                        {stoneToTrade === 0 && woodToTrade === 0 ? '无' : ''}
                      </span>
                    </div>
                    <div>
                      &bull; 对方金库: <span className="text-red-400 font-mono font-bold">{selectedTargetPlayer.gold} 块</span>
                    </div>
                    <div>
                      &bull; 掠得对方金币: <span className="text-yellow-400 font-mono font-bold">+{totalGoldFromSwap} 块</span>
                    </div>
                    <div>
                      &bull; 获得本省繁荣: <span className="text-emerald-400 font-bold">+1 点 (本单点击获利)</span>
                    </div>
                  </div>
                  <div className="text-[7.5px] text-zinc-400 pt-1 border-t border-emerald-950/20 flex justify-between">
                    <span>本日兑换上限: {swappedGoldThisTurn} / 15 金</span>
                    {selectedTargetPlayer.gold < totalGoldFromSwap && (
                      <span className="text-red-400 font-bold">⚠️ 对方国库资金不足</span>
                    )}
                  </div>
                </div>
              )}

              {/* Execution action Button */}
              <button
                onClick={executeSwapAction}
                disabled={totalGoldFromSwap <= 0 || !selectedTargetPlayer || selectedTargetPlayer.gold < totalGoldFromSwap}
                className={`w-full py-2 rounded-lg text-[9.5px] font-retro font-bold transition-all tracking-wide flex items-center justify-center gap-1.5 ${
                  totalGoldFromSwap > 0 && selectedTargetPlayer && selectedTargetPlayer.gold >= totalGoldFromSwap
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-sm cursor-pointer hover:shadow-md active:scale-98'
                    : 'bg-stone-850 text-stone-500 border border-stone-750 cursor-not-allowed'
                }`}
              >
                <span>强行与 【{selectedTargetPlayer?.name ?? '敌邦'}】 兑换金币</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 pt-2.5 border-t border-emerald-950 text-[8px] text-[#ace5d4]/40 text-center uppercase font-retro tracking-tighter">
          🛡️ 帝国丝绸商会丝绸印签 🛡️
        </div>
      </motion.div>
    </div>
  );
};
