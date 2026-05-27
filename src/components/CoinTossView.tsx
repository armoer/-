/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CoinTossViewProps {
  isTossing: boolean;
  result: 'heads' | 'tails' | null;
  onComplete: () => void;
}

export const CoinTossView: React.FC<CoinTossViewProps> = ({ isTossing, result, onComplete }) => {
  return (
    <AnimatePresence>
      {(isTossing || result) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 z-50 flex flex-col items-center justify-center pointer-events-auto"
        >
          <div className="text-center relative">
            <motion.h3
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-yellow-400 font-retro text-sm mb-12 tracking-wider"
            >
              🪙 幸运金币抛掷中...
            </motion.h3>

            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              {/* Spinning Golden Coin */}
              <motion.div
                key={isTossing ? 'tossing' : result}
                initial={{ rotateY: 0, scale: 0.8 }}
                animate={
                  isTossing
                    ? {
                        rotateY: [0, 360, 720, 1080, 1440],
                        y: [0, -100, -120, -50, 0],
                        scale: [1, 1.4, 1.5, 1.2, 1],
                      }
                    : {
                        rotateY: result === 'heads' ? 0 : 180,
                        scale: 1,
                        y: 0,
                      }
                }
                transition={{
                  duration: isTossing ? 1.2 : 0.4,
                  ease: 'easeInOut',
                }}
                className="w-28 h-28 rounded-full border-4 border-yellow-400 bg-gradient-to-br from-yellow-500 via-amber-600 to-yellow-300 shadow-[0_0_24px_rgba(234,179,8,0.6)] flex items-center justify-center text-5xl font-bold cursor-default select-none select-none relative overflow-hidden"
              >
                {/* Shiny star reflection effect */}
                <span className="relative z-10 select-none">
                  {isTossing ? '💡' : result === 'heads' ? '👑' : '💀'}
                </span>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/20" />
              </motion.div>
            </div>

            <div className="mt-12 h-16">
              {!isTossing && result && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <p className={`font-retro text-lg font-bold ${result === 'heads' ? 'text-green-400' : 'text-red-400'}`}>
                    {result === 'heads' ? '正面！金财滚滚 +3 💰' : '反面！马失前蹄 -1 🪙'}
                  </p>
                  
                  <button
                    onClick={onComplete}
                    className="mt-6 font-sans px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-lg text-sm border-b-4 border-yellow-700 active:border-b-0 transition-transform active:translate-y-1"
                  >
                    接受命运
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
