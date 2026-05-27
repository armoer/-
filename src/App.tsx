/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, TurnOrder, Weather, ControlledWeather } from './types';
import { CARD_DEFINITIONS, WEATHERS } from './cardsData';
import { SetupScreen } from './components/SetupScreen';
import { WeatherCanvas } from './components/WeatherCanvas';
import { battleMusic } from './utils/battleMusic';
import kingImage from './assets/images/king_pixel_1779844440623.png';
import queenImage from './assets/images/queen_pixel_1779844461629.png';
import { PixelCityView } from './components/PixelCityView';
import { CardMarket } from './components/CardMarket';
import { PlayerPanels } from './components/PlayerPanels';
import { CoinTossView } from './components/CoinTossView';
import { BackpackDialog } from './components/BackpackDialog';
import { WitchcraftDialog } from './components/WitchcraftDialog';
import { MilitaryDeckDialog } from './components/MilitaryDeckDialog';
import { TradeRouteDialog } from './components/TradeRouteDialog';
import { TradeConfirmDialog } from './components/TradeConfirmDialog';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Flame,
  CloudSun,
  Crown,
  Bell,
  HelpCircle,
  Shield,
  Dices,
  Info,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Theme styles for each city
const PLAYER_CONFIGS = [
  { id: 1, name: '赤焰城', colorName: '赤红', themeColor: '#ef4444' }, // Red
  { id: 2, name: '碧波城', colorName: '碧蓝', themeColor: '#0ef5df' }, // Teal-cyan
  { id: 3, name: '翡翠城', colorName: '晶绿', themeColor: '#10b981' }, // Emerald green
  { id: 4, name: '黄金城', colorName: '暖金', themeColor: '#eab308' }, // Golden yellow
];

export default function App() {
  // Game Setup state
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [targetProsperity, setTargetProsperity] = useState<number>(15);

  // Core gameplay states
  const [players, setPlayers] = useState<Player[]>([]);
  const [turnOrder, setTurnOrder] = useState<TurnOrder[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherTimer, setWeatherTimer] = useState<number>(0);
  const [weatherIsCalm, setWeatherIsCalm] = useState<boolean>(true);
  
  // Weather forecast state tracking
  const [lastForecastRound, setLastForecastRound] = useState<number>(-999);
  const [weatherOverrideMap, setWeatherOverrideMap] = useState<Record<number, Weather | null>>({});
  const [forecastedData, setForecastedData] = useState<Record<number, { isCalm: boolean; timer: number }>>({});
  const [showForecastResult, setShowForecastResult] = useState<boolean>(false);
  const [controlledWeather, setControlledWeather] = useState<ControlledWeather | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);
  const [backMenuConfirmCount, setBackMenuConfirmCount] = useState<number>(0);

  // Market states
  const [shopCards, setShopCards] = useState<string[]>([]);
  const [dynamicCosts, setDynamicCosts] = useState<Record<number, number>>({});
  const [unbuyableHistoryTriggered, setUnbuyableHistoryTriggered] = useState<boolean>(false);

  // Time systems
  const [turnSecondsLeft, setTurnSecondsLeft] = useState<number>(60);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Active user prompts
  const [backpackPlayerIdx, setBackpackPlayerIdx] = useState<number | null>(null);
  const [witchcraftPlayerIdx, setWitchcraftPlayerIdx] = useState<number | null>(null);
  const [militaryDeckPlayerIdx, setMilitaryDeckPlayerIdx] = useState<number | null>(null);
  const [barracksPlayerIdx, setBarracksPlayerIdx] = useState<number | null>(null);
  const [tradeRoutePlayerIdx, setTradeRoutePlayerIdx] = useState<number | null>(null);
  
  // Attacking targeting systems
  const [pendingAttackInfo, setPendingAttackInfo] = useState<{
    cardIdx: number;       // index in attackCards lists, or -1 for active attack
    isCustomActiveAttack: boolean;
  } | null>(null);

  // Coin gamble toss animations
  const [coinGambleActive, setCoinGambleActive] = useState<boolean>(false);
  const [coinGambleResult, setCoinGambleResult] = useState<'heads' | 'tails' | null>(null);
  const [gamblePlayerIdxRef, setGamblePlayerIdxRef] = useState<number | null>(null);

  // Toast alert states
  const [toasts, setToasts] = useState<{ id: string; msg: string; type?: 'info' | 'war' | 'suc' }[]>([]);

  // AI execution flags
  const [isAILocking, setIsAILocking] = useState<boolean>(false);
  const [aiActionMessage, setAiActionMessage] = useState<string>('');

  // Sound triggers
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Warning beep generator - high pitch, crisp, polite volume
  const playWarningBeep = useCallback(() => {
    if (soundEnabled && typeof window !== 'undefined' && window.AudioContext) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch (err) {}
    }
  }, [soundEnabled]);

  // References
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastToastRef = useRef<{ [msg: string]: number }>({});

  // Custom Toast trigger function
  const triggerToast = useCallback((msg: string, type: 'info' | 'war' | 'suc' = 'info') => {
    const now = Date.now();
    const lastTime = lastToastRef.current[msg] || 0;
    if (now - lastTime < 500) {
      return;
    }
    lastToastRef.current[msg] = now;

    const toastId = Math.random().toString(36).substring(4);
    setToasts((prev) => [...prev, { id: toastId, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 4500);

    // Audio synth generator for retro arcade sounds! Zero package dependencies, pure browser audio API!
    if (soundEnabled && typeof window !== 'undefined' && window.AudioContext) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'suc') {
          // Success melody (two cute rising notes)
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.setValueAtTime(587.33, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        } else if (type === 'war') {
          // Low alert warning (pleasant slide, low gain)
          osc.type = 'sine';
          osc.frequency.setValueAtTime(329.63, ctx.currentTime);
          osc.frequency.setValueAtTime(220, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        } else {
          // Regular cute diagnostic click chirp
          osc.type = 'sine';
          osc.frequency.setValueAtTime(659.25, ctx.currentTime);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        }
      } catch (err) {
        // Safe skip if browser prevents audio contexts
      }
    }
  }, [soundEnabled]);

  // Roll initiator 
  const rollD20 = () => Math.ceil(Math.random() * 20);

  // Active Weather query
  const getActiveWeather = useCallback((): Weather | null => {
    if (controlledWeather && controlledWeather.remaining > 0) {
      return controlledWeather.weather;
    }
    return weather;
  }, [weather, controlledWeather]);

  // Player Stats calculator (prosperity, material yields, etc.)
  const getPlayerStats = useCallback((playerIdx: number, customPlayersList?: Player[]) => {
    const pList = customPlayersList || players;
    const p = pList[playerIdx];
    if (!p) return { totalProsperity: 0, goldIncome: 0, stoneIncome: 0, woodIncome: 0 };

    const currentW = getActiveWeather();
    const isSunny = currentW?.name === '大晴天';
    let totalProsperity = 0;
    let goldIncome = 2; // base gold yield
    let stoneIncome = 0;
    let woodIncome = 0;

    const accountedBuildingProsperityKeys = new Set<string>();
    const pHasWell = p.buildings.includes('wishingWell');

    p.buildings.forEach((bKey) => {
      // Is building disabled (wrecked by catapult)?
      const isDisabled = p.disabledBuildings.some((d) => d.key === bKey);
      if (isDisabled) return;

      const card = CARD_DEFINITIONS[bKey];
      if (!card) return;

      // Unique-only non-production building prosperity rule
      if (card.prosperity && card.prosperity > 0) {
        if (!accountedBuildingProsperityKeys.has(bKey)) {
          totalProsperity += card.prosperity;
          accountedBuildingProsperityKeys.add(bKey);
        }
      }

      if (card.income) {
        if (card.income.gold) goldIncome += card.income.gold + (isSunny ? 1 : 0);
        if (card.income.stone) stoneIncome += card.income.stone + (isSunny ? 1 : 0);
        if (card.income.wood) woodIncome += card.income.wood + (isSunny ? 1 : 0);
      }
    });

    // Academy special rule: if Player owns Academy, AND total defense points > 0, AND academy is not on cooldown.
    const defenseScore = p.defenseItems.reduce((acc, d) => acc + d.currentDefense, 0);
    // Add warfare and trade acquired prosperity points dynamically
    totalProsperity += (p.warProsperity || 0);
    totalProsperity += (p.tradeProsperity || 0);

    const hasAcademy = p.buildings.includes('academy');
    if (hasAcademy && defenseScore > 0 && p.academyCooldown === 0) {
      totalProsperity += 1; // academy bonus point
    }

    // Apply Weather modifiers
    if (currentW) {
      const isNegativeWeather = currentW.incomeHalve || currentW.name === '暴风雪' || currentW.name === '台风' || currentW.name === '雨天' || currentW.name === '阴天' || currentW.name === '旱灾';
      if (isNegativeWeather && pHasWell) {
        // Wishing Well owner is immune to negative weather effects on harvests!
      } else if (currentW.name === '旱灾') {
        goldIncome = Math.floor(goldIncome / 2);
        stoneIncome = Math.floor(stoneIncome / 2);
        woodIncome = Math.floor(woodIncome / 2);
      } else if (currentW.incomeHalve) {
        goldIncome = Math.ceil(goldIncome / 2);
        stoneIncome = Math.ceil(stoneIncome / 2);
        woodIncome = Math.ceil(woodIncome / 2);
      }
    }

    return {
      totalProsperity,
      goldIncome,
      stoneIncome,
      woodIncome,
    };
  }, [players, getActiveWeather]);

  // Initial initiative roll sequencer to establish action order queue
  const calculateTurnOrder = useCallback((pList: Player[]): TurnOrder[] => {
    let rolls = pList.map((p, idx) => ({
      playerIdx: idx,
      dice: rollD20(),
    }));

    // Ensure no ties by slightly shifting matches so sorting is always deterministic
    rolls.sort((a, b) => b.dice - a.dice);
    for (let i = 1; i < rolls.length; i++) {
      if (rolls[i].dice === rolls[i - 1].dice) {
        rolls[i].dice = Math.max(1, rolls[i].dice - 1);
      }
    }
    rolls.sort((a, b) => b.dice - a.dice);

    return rolls;
  }, []);

  // Central Card Market pool refilling logic (excluding spyGlass)
  const refreshMarketCards = useCallback((
    hasBarracks: boolean,
    hasBlacksmith: boolean,
    hasTemple: boolean,
    hasAcademy: boolean,
    isTyphoonActive: boolean,
    playerGold?: number,
    playerStone?: number,
    playerWood?: number
  ) => {
    const cardKeys = Object.keys(CARD_DEFINITIONS);
    
    const activePlayerIdx = turnOrder[currentTurnIndex]?.playerIdx;
    const activePlayer = activePlayerIdx !== undefined ? players[activePlayerIdx] : undefined;

    const hasActiveContinuousSpell = activePlayer && (
      (activePlayer.guardianSpellRemainingRounds || 0) > 0 ||
      (controlledWeather && controlledWeather.remaining > 0)
    );

    // Filter available card keys according to current weather block
    const validKeys = cardKeys.filter((key) => {
      if (key === 'tradeCargo') return false;
      const card = CARD_DEFINITIONS[key];
      if (isTyphoonActive && card.type === 'military') return false;
      
      // If player already built Witch Altar or Wishing Well, don't show them anymore:
      if (activePlayer) {
        if (key === 'witchAltar' && activePlayer.buildings.includes('witchAltar')) return false;
        if (key === 'wishingWell' && activePlayer.buildings.includes('wishingWell')) return false;
      }

      // Continuous magic shards logic:
      if (hasActiveContinuousSpell) {
        if (key.endsWith('Shard') || (card.type as string) === 'witchcraft') return false;
      }

      return true;
    });

    const unlockedPool: string[] = [];
    const lockedPool: string[] = [];

    validKeys.forEach((key) => {
      const card = CARD_DEFINITIONS[key];
      let locked = false;

      if (card.requiresBarracks && !hasBarracks) locked = true;
      if (card.requiresBlacksmith && !hasBlacksmith) locked = true;
      if (card.id === 'ironWall' && !hasBlacksmith) locked = true;
      if (card.id === 'siege' && (!hasBarracks || !hasBlacksmith)) locked = true;
      if (card.id === 'witchAltar' && (!hasTemple || !hasAcademy)) locked = true;

      if (locked) {
        lockedPool.push(key);
      } else {
        unlockedPool.push(key);
      }
    });

    const filledCards: string[] = [];

    // Draft up to 5 unlocked items (since now we draft up to 7 cards total)
    const availableUnlocked = [...unlockedPool];
    const unlockedCount = Math.min(5, availableUnlocked.length);
    for (let i = 0; i < unlockedCount; i++) {
      const rndIdx = Math.floor(Math.random() * availableUnlocked.length);
      filledCards.push(availableUnlocked.splice(rndIdx, 1)[0]);
    }

    // Fill remaining slots up to 7 using lockedPool (max 2) and unlockedPool
    const remainingCount = 7 - filledCards.length;
    const availableLocked = [...lockedPool];
    const lockedCount = Math.min(2, availableLocked.length, remainingCount);
    for (let i = 0; i < lockedCount; i++) {
      const rndIdx = Math.floor(Math.random() * availableLocked.length);
      filledCards.push(availableLocked.splice(rndIdx, 1)[0]);
    }

    // Still need more to make exactly 7 cards
    while (filledCards.length < 7) {
      const anyRemaining = validKeys.filter((k) => !filledCards.includes(k));
      if (anyRemaining.length > 0) {
        filledCards.push(anyRemaining[Math.floor(Math.random() * anyRemaining.length)]);
      } else {
        filledCards.push(validKeys[Math.floor(Math.random() * validKeys.length)]);
      }
    }

    // Shuffle the final market row list
    for (let i = filledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filledCards[i], filledCards[j]] = [filledCards[j], filledCards[i]];
    }

    // Assign randomized costs map (Ancient Treasure costs 1 to 5 gold coins)
    const nextCosts: Record<number, number> = {};
    filledCards.forEach((cId, idx) => {
      if (cId === 'ancientMap') {
        const randCost = 1 + Math.floor(Math.random() * 5);
        nextCosts[idx] = randCost;
      } else {
        nextCosts[idx] = CARD_DEFINITIONS[cId]?.costGold || 0;
      }
    });

    // If previous refresh was unbuyable and resources supplied, force at least one buyable card
    if (unbuyableHistoryTriggered && playerGold !== undefined) {
      let hasBuyable = false;
      filledCards.forEach((cId, idx) => {
        const card = CARD_DEFINITIONS[cId];
        const costGold = nextCosts[idx];
        const isLocked = (card.requiresBarracks && !hasBarracks) ||
                         (card.requiresBlacksmith && !hasBlacksmith) ||
                         (card.id === 'ironWall' && !hasBlacksmith) ||
                         (card.id === 'siege' && (!hasBarracks || !hasBlacksmith)) ||
                         (card.id === 'witchAltar' && (!hasTemple || !hasAcademy)) ||
                         (isTyphoonActive && card.type === 'military');
        const canAfford = playerGold >= costGold && (playerStone ?? 0) >= card.costStone && (playerWood ?? 0) >= card.costWood;
        if (!isLocked && canAfford) {
          hasBuyable = true;
        }
      });

      if (!hasBuyable) {
        // Search all definitions for a buyable option
        const forcedOptions = Object.values(CARD_DEFINITIONS).filter((c) => {
          if (c.id === 'tradeCargo') return false;
          const isLocked = (c.requiresBarracks && !hasBarracks) ||
                           (c.requiresBlacksmith && !hasBlacksmith) ||
                           (c.id === 'ironWall' && !hasBlacksmith) ||
                           (c.id === 'siege' && (!hasBarracks || !hasBlacksmith)) ||
                           (c.id === 'witchAltar' && (!hasTemple || !hasAcademy)) ||
                           (isTyphoonActive && c.type === 'military');
          const costGold = c.id === 'ancientMap' ? 2 : c.costGold; // fallback 2 gold for treasure
          const canAfford = playerGold >= costGold && (playerStone ?? 0) >= c.costStone && (playerWood ?? 0) >= c.costWood;
          return !isLocked && canAfford;
        });

        if (forcedOptions.length > 0) {
          const pickedCard = forcedOptions[Math.floor(Math.random() * forcedOptions.length)];
          filledCards[0] = pickedCard.id;
          if (pickedCard.id === 'ancientMap') {
            nextCosts[0] = 1 + Math.floor(Math.random() * 5);
          } else {
            nextCosts[0] = pickedCard.costGold;
          }
        }
      }
    }

    // Re-evaluate if more than half of the newly generated cards are unbuyable for this user
    if (playerGold !== undefined) {
      let unbuyableCount = 0;
      filledCards.forEach((cId, idx) => {
        const card = CARD_DEFINITIONS[cId];
        const costGold = nextCosts[idx];
        const isLocked = (card.requiresBarracks && !hasBarracks) ||
                         (card.requiresBlacksmith && !hasBlacksmith) ||
                         (card.id === 'ironWall' && !hasBlacksmith) ||
                         (card.id === 'siege' && (!hasBarracks || !hasBlacksmith)) ||
                         (card.id === 'witchAltar' && (!hasTemple || !hasAcademy)) ||
                         (isTyphoonActive && card.type === 'military');
        const canAfford = playerGold >= costGold && (playerStone ?? 0) >= card.costStone && (playerWood ?? 0) >= card.costWood;
        if (isLocked || !canAfford) {
          unbuyableCount++;
        }
      });

      if (unbuyableCount >= 4) { // 4 out of 7 is greater than half
        setUnbuyableHistoryTriggered(true);
      } else {
        setUnbuyableHistoryTriggered(false);
      }
    }

    const pHasWishingWell = activePlayer && activePlayer.buildings.includes('wishingWell');
    if (pHasWishingWell) {
      const hasResourceCard = filledCards.some(cId => CARD_DEFINITIONS[cId]?.type === 'resource' && cId !== 'tradeCargo');
      if (!hasResourceCard) {
        const resourceCards = Object.values(CARD_DEFINITIONS).filter(c => c.type === 'resource' && c.id !== 'tradeCargo');
        if (resourceCards.length > 0) {
          const randomResourceCard = resourceCards[Math.floor(Math.random() * resourceCards.length)];
          filledCards[0] = randomResourceCard.id;
          nextCosts[0] = randomResourceCard.costGold;
        }
      }
    }

    setDynamicCosts(nextCosts);
    setShopCards(filledCards);
  }, [players, currentTurnIndex, controlledWeather, unbuyableHistoryTriggered, turnOrder]);

  // Clean, complete round-by-round alternating weather transitions
  const triggerNewWeather = useCallback(() => {
    if (weatherOverrideMap && (currentRound in weatherOverrideMap)) {
      const overriddenWeather = weatherOverrideMap[currentRound];
      const details = forecastedData[currentRound];
      setWeather(overriddenWeather);
      
      const isCalm = details ? details.isCalm : (overriddenWeather === null);
      const timer = details ? details.timer : 2;
      
      setWeatherIsCalm(isCalm);
      setWeatherTimer(timer);
      
      if (overriddenWeather) {
        triggerToast(`🔮 气象预测奇准！天空进入预言之中的气象【${overriddenWeather.name}】！它将侵扰行军农收 ${timer} 回合！`, 'war');
      } else {
        triggerToast(`☀️ 云消雨霁，风调雨顺！天空如同预言般回归平静大休养（持续 ${timer} 回合）！`, 'suc');
      }
      return;
    }

    if (weatherIsCalm) {
      // Transition from calm to a special weather with weighted probabilities to reduce Sunny ("大晴天") probability
      // WEATHERS: [大晴天, 雨天, 台风, 阴天, 暴风雪, 旱灾]
      // Weights: 大晴天 (10%), 雨天 (20%), 台风 (15%), 阴天 (20%), 暴风雪 (15%), 旱灾 (20%)
      const weights = [10, 20, 15, 20, 15, 20];
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let rand = Math.random() * totalWeight;
      let selectedWeatherIdx = 0;
      for (let i = 0; i < WEATHERS.length; i++) {
        rand -= weights[i];
        if (rand < 0) {
          selectedWeatherIdx = i;
          break;
        }
      }
      const randomWeather = WEATHERS[selectedWeatherIdx];
      setWeather(randomWeather);
      setWeatherIsCalm(false);
      const chosenDuration = 1 + Math.floor(Math.random() * 5); // 1-5 rounds
      setWeatherTimer(chosenDuration);
      triggerToast(`🌦️ 气象异兆初现！天空被恶势气候【${randomWeather.name}】吞噬，将侵扰行军农收 ${chosenDuration} 回合！`, 'war');
    } else {
      // Transition from special weather to quiet tranquility (lasting 1 to 3 rounds)
      setWeather(null);
      setWeatherIsCalm(true);
      const chosenDuration = 1 + Math.floor(Math.random() * 3); // 1-3 rounds
      setWeatherTimer(chosenDuration);
      triggerToast(`☀️ 云消雨霁，风调雨顺！天空重归平静休养大过渡（持续 ${chosenDuration} 轮战役）！`, 'suc');
    }
  }, [weatherIsCalm, triggerToast, weatherOverrideMap, forecastedData, currentRound]);

  // Predict upcoming weather 2 full turns from now, viewable once every 6 rounds
  const handleExecuteForecast = () => {
    // Check cooldown
    const cooldownPassed = currentRound - lastForecastRound >= 6 || lastForecastRound === -999;
    if (!cooldownPassed) {
      const remainingCooldown = 6 - (currentRound - lastForecastRound);
      triggerToast(`⚠️ 当前气象折射处于强磁偏偏转中，冷却尚未就绪！(还需等待 ${remainingCooldown} 个完整轮次)`, 'war');
      return;
    }

    // Run transition simulation starting from CURRENT state of weather, weatherIsCalm, and weatherTimer:
    let currentCalmSim = weatherIsCalm;
    let timerSim = weatherTimer;
    let weatherSim = weather;

    // Simulation for round N + 1 (transitions at end of currentRound)
    // Decrement timer
    timerSim--;
    if (timerSim <= 0) {
      if (currentCalmSim) {
        // Transition to special
        const weights = [10, 20, 15, 20, 15, 20];
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let rand = Math.random() * totalWeight;
        let selectedWeatherIdx = 0;
        for (let i = 0; i < WEATHERS.length; i++) {
          rand -= weights[i];
          if (rand < 0) {
            selectedWeatherIdx = i;
            break;
          }
        }
        weatherSim = WEATHERS[selectedWeatherIdx];
        currentCalmSim = false;
        timerSim = 1 + Math.floor(Math.random() * 5);
      } else {
        // Transition to calm
        weatherSim = null;
        currentCalmSim = true;
        timerSim = 1 + Math.floor(Math.random() * 3);
      }
    }
    const predictedNextRoundWeather = weatherSim;
    const nextRoundCalm = currentCalmSim;
    const nextRoundTimer = timerSim;

    // Simulation for round N + 2 (transitions at end of NextRound)
    timerSim--;
    if (timerSim <= 0) {
      if (currentCalmSim) {
        // Transition to special
        const weights = [10, 20, 15, 20, 15, 20];
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let rand = Math.random() * totalWeight;
        let selectedWeatherIdx = 0;
        for (let i = 0; i < WEATHERS.length; i++) {
          rand -= weights[i];
          if (rand < 0) {
            selectedWeatherIdx = i;
            break;
          }
        }
        weatherSim = WEATHERS[selectedWeatherIdx];
        currentCalmSim = false;
        timerSim = 1 + Math.floor(Math.random() * 5);
      } else {
        // Transition to calm
        weatherSim = null;
        currentCalmSim = true;
        timerSim = 1 + Math.floor(Math.random() * 3);
      }
    }
    const predictedTwoRoundsAheadWeather = weatherSim;
    const twoRoundsCalm = currentCalmSim;
    const twoRoundsTimer = timerSim;

    // Record both levels of prediction in the overrides mapping
    const roundNPlus1 = currentRound + 1;
    const roundNPlus2 = currentRound + 2;

    setWeatherOverrideMap((prev) => ({
      ...prev,
      [roundNPlus1]: predictedNextRoundWeather,
      [roundNPlus2]: predictedTwoRoundsAheadWeather,
    }));

    setForecastedData((prev) => ({
      ...prev,
      [roundNPlus1]: { isCalm: nextRoundCalm, timer: nextRoundTimer },
      [roundNPlus2]: { isCalm: twoRoundsCalm, timer: twoRoundsTimer },
    }));

    setLastForecastRound(currentRound);
    setShowForecastResult(true);
    triggerToast(`🔮 占星高塔光晕散落！已成功推演并在星图上展现 2 回合后的天时风雨！`, 'suc');
  };

  // Main initialize hook
  const startFreshGame = (targetPoints: number, isAIFlags: boolean[]) => {
    setTargetProsperity(targetPoints);

    const count = isAIFlags.length;
    let cityConfigs = [
      { id: 1, name: '日耀城', colorName: '日耀', themeColor: '#f59e0b' },
      { id: 2, name: '月辉城', colorName: '月辉', themeColor: '#475569' },
      { id: 3, name: '星闪城', colorName: '星闪', themeColor: '#7c3aed' },
    ];
    if (count === 5) {
      cityConfigs = [
        { id: 1, name: '金利城', colorName: '金利', themeColor: '#ca8a04' },
        { id: 2, name: '木荣城', colorName: '木荣', themeColor: '#16a34a' },
        { id: 3, name: '水流城', colorName: '水流', themeColor: '#0891b2' },
        { id: 4, name: '火爆城', colorName: '火爆', themeColor: '#dc2626' },
        { id: 5, name: '土厚城', colorName: '土厚', themeColor: '#78350f' },
      ];
    } else if (count === 4) {
      cityConfigs = [
        { id: 1, name: '黄金城', colorName: '黄金', themeColor: '#ca8a04' },
        { id: 2, name: '翡翠城', colorName: '翡翠', themeColor: '#10b981' },
        { id: 3, name: '珍珠城', colorName: '珍珠', themeColor: '#2dd4bf' },
        { id: 4, name: '钻石城', colorName: '钻石', themeColor: '#60a5fa' },
      ];
    }

    // Bootstrap players
    const initialPlayers: Player[] = cityConfigs.map((config, idx) => ({
      id: config.id,
      name: config.name,
      colorName: config.colorName,
      themeColor: config.themeColor,
      gold: 8,      // Starting gold
      stone: 3,     // Starting stone
      wood: 3,      // Starting wood
      buildings: [],
      defenseItems: [],
      attackCards: [],
      fragments: [],
      attackCount: 0,
      witchCooldown: 0,
      disabledBuildings: [],
      defenseDisabledUntil: 0,
      refreshCost: 1,
      freeRefreshes: 0,
      academyCooldown: 0,
      isAI: isAIFlags[idx] !== undefined ? isAIFlags[idx] : false,
      warProsperity: 0,
      tradeProsperity: 0,
      guardianSpellRemainingRounds: 0,
      currentBuildingDefense: 0,
      buildingDefenseDamageTakers: [],
      tradeRouteCargo: null,
      tradedWithCityIndices: [],
      tradeCargoStone: 0,
      tradeCargoWood: 0,
      tradeGoldSwappedThisTurn: 0,
      tradeTargetIdxThisTurn: null,
    }));

    // Setup initiating order
    const orderedSequence = calculateTurnOrder(initialPlayers);
    setPlayers(initialPlayers);
    setTurnOrder(orderedSequence);
    setCurrentTurnIndex(0);
    setCurrentRound(1);
    setWeather(null);
    setWeatherTimer(0);
    setControlledWeather(null);
    setGameOver(false);
    setWinnerIdx(null);
    setBackMenuConfirmCount(0);
    setLastForecastRound(-999);
    setWeatherOverrideMap({});
    setForecastedData({});
    setShowForecastResult(false);

    // Initial pool refresh
    refreshMarketCards(false, false, false, false, false);
    setGameStarted(true);
    setTurnSecondsLeft(60);
    setIsPaused(false);

    triggerToast('🏰 各路神罗城主皆已归位，争霸大陆拉开大幕！', 'suc');
  };

  // Turn index cycler
  const completeCurrentTurn = useCallback(() => {
    if (gameOver) return;

    // Grab current active index
    const activePlayerIdx = turnOrder[currentTurnIndex]?.playerIdx;
    if (activePlayerIdx === undefined) return;

    // Award income material yield
    const stats = getPlayerStats(activePlayerIdx);
    setPlayers((prev) => {
      const next = [...prev];
      const p = next[activePlayerIdx];
      p.gold += stats.goldIncome;
      p.stone += stats.stoneIncome;
      p.wood += stats.woodIncome;

      // Reset turn limitations
      p.attackCount = 0;
      p.freeRefreshes = 0;
      p.tradeGoldSwappedThisTurn = 0;
      p.tradeTargetIdxThisTurn = null;

      // Academy rotation cooldown triggers
      if (p.buildings.includes('academy')) {
        p.academyCooldown = p.academyCooldown === 0 ? 1 : 0;
      }

      // Tick down witch block altar cooldowns
      if (p.witchCooldown > 0) {
        p.witchCooldown--;
      }

      return next;
    });

    // Check if weather controller ticks down
    if (controlledWeather) {
      if (controlledWeather.ownerIdx === activePlayerIdx) {
        setControlledWeather((prev) => {
          if (!prev) return null;
          const remaining = prev.remaining - 1;
          if (remaining <= 0) {
            triggerToast('🪄 巫师符水术法消退，天令消亡解体。', 'info');
            return null;
          }
          return { ...prev, remaining };
        });
      }
    }

    // Step currentTurnIndex
    const nextTurnIdx = currentTurnIndex + 1;
    if (nextTurnIdx >= turnOrder.length) {
      // -------------------- Round Complete Transition! --------------------
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);

      // Decrement/Tick Guardian Shards for all players and clear trade indices
      setPlayers((prev) => {
        const next = prev.map((p) => {
          const updatedP = { ...p };
          if ((updatedP.guardianSpellRemainingRounds || 0) > 0) {
            updatedP.guardianSpellRemainingRounds = updatedP.guardianSpellRemainingRounds - 1;
            if (updatedP.guardianSpellRemainingRounds === 0) {
              setTimeout(() => {
                triggerToast(`🛡️✨ 【守护碎片】法术时间已到，【${p.name}】的城防壁垒回归正常！`, 'info');
              }, 100);
            }
          }
          updatedP.tradedWithCityIndices = [];
          return updatedP;
        });

        // Evaluate Fog Spell Steal before completing round!
        next.forEach((p) => {
          if (p.foggedByPlayerIdx !== undefined) {
            const thiefIdx = p.foggedByPlayerIdx;
            const stolenGold = p.gold;
            if (stolenGold > 0) {
              next[thiefIdx].gold += stolenGold;
              p.gold = 0;
              setTimeout(() => {
                triggerToast(`🌫️💸 【迷雾法术收网】！【${p.name}】由于在轮末存留了 ${stolenGold} 个未花出的金币，已被迷雾全数缴获，并运往【${next[thiefIdx].name}】的城市金库！`, 'war');
              }, 100);
            }
            delete p.foggedByPlayerIdx;
          }
        });

        // Clean up disabled structures timers that have elapsed
        next.forEach((p) => {
          p.disabledBuildings = p.disabledBuildings.filter((db) => db.untilRound > nextRound);
          p.refreshCost = 1; // restore refresh fee to 1 gold base
          p.freeRefreshes = 0;
        });

        // Recover building defense (Temples & other buildings automatically refresh defense values)
        next.forEach((p) => {
          let structureDefense = 0;
          p.buildings.forEach((bKey) => {
            const isDisabled = p.disabledBuildings.some((d) => d.key === bKey);
            if (isDisabled) return;
            const card = CARD_DEFINITIONS[bKey];
            if (card && card.id === 'temple') {
              structureDefense += 1; // Temple provides 1 Building Defense
            } else if (card && card.defense) {
              structureDefense += card.defense;
            }
          });
          p.currentBuildingDefense = structureDefense;
        });

        const newOrder = calculateTurnOrder(next);
        setTimeout(() => {
          setTurnOrder(newOrder);
        }, 10);

        return next;
      });

      // Decrement weather timer cleanly here (outside pure state updater to avoid multi-execution!)
      if (!controlledWeather) {
        setWeatherTimer((prevTimer) => {
          const nextTimer = prevTimer - 1;
          if (nextTimer <= 0) {
            setTimeout(() => triggerNewWeather(), 20);
            return 0;
          }
          return nextTimer;
        });
      }

      setCurrentTurnIndex(0);
      triggerToast(`🔄 回合大关进入第 ${nextRound} 回合！重新抛骰排列阵线行动顺位！`, 'info');
    } else {
      setCurrentTurnIndex(nextTurnIdx);
      const nextActiveIdx = turnOrder[nextTurnIdx]?.playerIdx;
      triggerToast(`🎲 轮到 【${players[nextActiveIdx]?.name}】 发号施令！`, 'info');
    }

    // Reset clock timer state
    setTurnSecondsLeft(60);
  }, [currentTurnIndex, turnOrder, currentRound, gameOver, getPlayerStats, calculateTurnOrder, controlledWeather, triggerNewWeather, triggerToast]);

  // Turn time loop
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTurnSecondsLeft((prev) => {
        // Play tick beeps during the last 5 seconds (5, 4, 3, 2, 1) of the countdown
        if (prev <= 6 && prev > 1) {
          playWarningBeep();
        }

        if (prev <= 1) {
          triggerToast('⏰ 思考时间磨损在空，自动交接结束回合！', 'info');
          setTimeout(() => completeCurrentTurn(), 0);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, gameOver, isPaused, completeCurrentTurn, triggerToast, playWarningBeep]);

  // Check victory condition
  const checkVictoryStatus = useCallback((playersList: Player[]) => {
    let winner: number | null = null;
    let highestProsperity = -1;

    playersList.forEach((p, idx) => {
      const stats = getPlayerStats(idx, playersList);
      if (stats.totalProsperity >= targetProsperity) {
        if (stats.totalProsperity > highestProsperity) {
          winner = idx;
          highestProsperity = stats.totalProsperity;
        }
      }
    });

    if (winner !== null) {
      setWinnerIdx(winner);
      setGameOver(true);
      triggerToast(`🏆🎉 游戏宣告结束！【${playersList[winner].name}】 率先奠定 ${highestProsperity} 点惊天繁荣，问鼎霸主之席！`, 'suc');
    }
  }, [targetProsperity, getPlayerStats, triggerToast]);

  // Buying card operation
  const handleBuyCardAndExecute = (shopIndex: number) => {
    if (gameOver) return;

    const activePlayerIdx = turnOrder[currentTurnIndex]?.playerIdx;
    if (activePlayerIdx === undefined) return;

    const activeP = players[activePlayerIdx];

    const cardId = shopCards[shopIndex];

    const card = CARD_DEFINITIONS[cardId];
    if (!card) return;

    const p = players[activePlayerIdx];

    // Calculate scaling building costs
    const isBuilding = (card.type === 'build' || card.type === 'dev') && card.id !== 'tradeCargo';
    const extraCost = isBuilding ? Math.floor(p.buildings.filter((bId) => bId === card.id).length / 2) : 0;

    const baseCostGold = dynamicCosts[shopIndex] !== undefined ? dynamicCosts[shopIndex] : card.costGold;
    const cardCostGold = baseCostGold + extraCost;
    const cardCostStone = card.costStone + extraCost;
    const cardCostWood = card.costWood + extraCost;

    // Resources balance verification
    if (p.gold < cardCostGold || p.stone < cardCostStone || p.wood < cardCostWood) {
      triggerToast('⚠️ 领地库存物资不够支付营建契约费用！', 'war');
      return;
    }

    setPlayers((prev) => {
      const next = prev.map((pl, i) => {
        if (i === activePlayerIdx) {
          return {
            ...pl,
            gold: Math.max(0, pl.gold - cardCostGold),
            stone: Math.max(0, pl.stone - cardCostStone),
            wood: Math.max(0, pl.wood - cardCostWood),
            buildings: [...pl.buildings],
            defenseItems: pl.defenseItems.map((di) => ({ ...di })),
            attackCards: [...pl.attackCards],
            fragments: [...pl.fragments],
            disabledBuildings: pl.disabledBuildings.map((db) => ({ ...db })),
            tradedWithCityIndices: pl.tradedWithCityIndices ? [...pl.tradedWithCityIndices] : [],
          };
        }
        return pl;
      });
      const buyer = next[activePlayerIdx];

      // Handle card type distributions
      if (card.isFragment) {
        buyer.fragments.push({ type: card.fragmentType! });
        triggerToast(`🔮 购得 【${card.name}】！拼凑于背包，凑齐 2 对同组碎片将直接引发巫咒法术。`, 'suc');

        // Check fragments immediately inside updater safe slot
        const fragCountsObj = { weather: 0, prosperity: 0, war: 0, guardian: 0 };
        buyer.fragments.forEach((f) => {
          if (f.type === 'weather' || f.type === 'prosperity' || f.type === 'war' || f.type === 'guardian') {
            fragCountsObj[f.type]++;
          }
        });

        if (card.fragmentType === 'weather' && fragCountsObj.weather >= 2) {
          // Remove 2 weather fragments
          let removed = 0;
          buyer.fragments = buyer.fragments.filter((f) => {
            if (f.type === 'weather' && removed < 2) {
              removed++;
              return false;
            }
            return true;
          });

          // Trigger Weather Shards activation
          const weatherOption = WEATHERS[Math.floor(Math.random() * WEATHERS.length)];
          setControlledWeather({
            type: 'fragment',
            weather: weatherOption,
            remaining: 3,
            ownerIdx: activePlayerIdx,
          });
          triggerToast(`🔮 【天象水晶碎片】凑齐狂暴，强制修改未来 3 回合流转天候为 【${weatherOption.name}】！`, 'suc');
        } else if (card.fragmentType === 'war' && fragCountsObj.war >= 2) {
          // Remove 2 war fragments
          let removed = 0;
          buyer.fragments = buyer.fragments.filter((f) => {
            if (f.type === 'war' && removed < 2) {
              removed++;
              return false;
            }
            return true;
          });

          // Perform 5 point attack on all other players
          next.forEach((pl, idx) => {
            if (idx === activePlayerIdx) return;

            const rawDefense = pl.defenseItems.reduce((acc, d) => acc + d.currentDefense, 0) + (pl.currentBuildingDefense || 0);
            const targetIsVulnerable = pl.defenseDisabledUntil >= currentRound;
            let finalDefense = targetIsVulnerable ? 0 : rawDefense;

            if (pl.guardianSpellRemainingRounds && pl.guardianSpellRemainingRounds > 0 && !targetIsVulnerable) {
              finalDefense = finalDefense * 2;
            }

            const activeWeather = getActiveWeather();
            if (activeWeather && activeWeather.defenseHalve) {
              finalDefense = Math.floor(finalDefense / 2);
            }

            const blockedAmt = Math.min(finalDefense, 5);
            const bleedThroughDamage = 5 - blockedAmt;

            // Reduce target defense items
            if (blockedAmt > 0 && !targetIsVulnerable) {
              let runningExpenditure = blockedAmt;
              const deadWallsIndices: number[] = [];
              for (let i = 0; i < pl.defenseItems.length; i++) {
                if (runningExpenditure <= 0) break;
                const absorb = Math.min(pl.defenseItems[i].currentDefense, runningExpenditure);
                pl.defenseItems[i].currentDefense -= absorb;
                runningExpenditure -= absorb;
                if (pl.defenseItems[i].currentDefense <= 0) {
                  deadWallsIndices.push(i);
                }
              }
              for (let i = deadWallsIndices.length - 1; i >= 0; i--) {
                pl.defenseItems.splice(deadWallsIndices[i], 1);
              }
            }

            // Plunder Resources
            if (bleedThroughDamage > 0) {
              const totalBarracksCount = buyer.buildings.filter((b) => b === 'barracks').length;
              const extraBarracksBonus = Math.max(0, totalBarracksCount - 1);
              const finalPlunderedAmt = bleedThroughDamage + extraBarracksBonus;

              const plunderedList: ('gold' | 'stone' | 'wood')[] = [];
              for (let i = 0; i < finalPlunderedAmt; i++) {
                const lootable: ('gold' | 'stone' | 'wood')[] = [];
                if (pl.gold > 0) lootable.push('gold');
                if (pl.stone > 0) lootable.push('stone');
                if (pl.wood > 0) lootable.push('wood');
                if (lootable.length === 0) break;

                const picked = lootable[Math.floor(Math.random() * lootable.length)];
                pl[picked]--;
                buyer[picked]++;
                plunderedList.push(picked);
              }

              if (plunderedList.length > 0) {
                const plunderString = [
                  plunderedList.filter(x => x === 'gold').length > 0 ? `🪙x${plunderedList.filter(x => x === 'gold').length}` : '',
                  plunderedList.filter(x => x === 'stone').length > 0 ? `🪨x${plunderedList.filter(x => x === 'stone').length}` : '',
                  plunderedList.filter(x => x === 'wood').length > 0 ? `🪵x${plunderedList.filter(x => x === 'wood').length}` : '',
                ].filter(Boolean).join('、');
                setTimeout(() => {
                  triggerToast(`💥 【狂澜战巫出击】对城邦 【${pl.name}】 发起劫杀掠夺，破防盾甲 ${blockedAmt}，洗劫到对方物资：${plunderString}！`, 'suc');
                }, 100);
              } else {
                setTimeout(() => {
                  triggerToast(`💥 【狂澜战巫出击】击碎了 【${pl.name}】 的城甲盾防！但对方家徒四壁未能抄到任何物资！`, 'war');
                }, 100);
              }
            } else {
              setTimeout(() => {
                triggerToast(`💥 【狂澜战巫出击】狂袭其 【${pl.name}】 城外盾门，被其固若金汤的壁垒防护 (${blockedAmt} 防值) 给完美消化！`, 'war');
              }, 105);
            }
          });

          triggerToast(`🔮 【战争主宰巫残片】凑齐激活！召唤远古战甲巨尊，对所有异邦异域诸城降下 5 点火力的终极疯狂兵祸掠夺！`, 'suc');
        } else if (card.fragmentType === 'guardian' && fragCountsObj.guardian >= 2) {
          // Remove 2 guardian fragments
          let removed = 0;
          buyer.fragments = buyer.fragments.filter((f) => {
            if (f.type === 'guardian' && removed < 2) {
              removed++;
              return false;
            }
            return true;
          });

          buyer.guardianSpellRemainingRounds = 2;
          triggerToast(`🔮 【金盾神迹守护残片】凑齐激活！神光遮蔽，天罩加持！您的首都防御值翻倍，维持 2 回合不磨损金防！`, 'suc');
        } else if (card.fragmentType === 'prosperity' && fragCountsObj.prosperity >= 2) {
          // Remove 2 prosperity fragments
          let removed = 0;
          buyer.fragments = buyer.fragments.filter((f) => {
            if (f.type === 'prosperity' && removed < 2) {
              removed++;
              return false;
            }
            return true;
          });

          // Calculate the production of ONLY active built production buildings
          let extraGold = 0;
          let extraStone = 0;
          let extraWood = 0;

          // Check if Sunny for building production bonus
          const currentW = getActiveWeather();
          const isSunny = currentW?.name === '大晴天';

          buyer.buildings.forEach((bKey) => {
            const isDisabled = buyer.disabledBuildings.some((d) => d.key === bKey);
            if (isDisabled) return;

            const bCard = CARD_DEFINITIONS[bKey];
            if (!bCard || !bCard.income) return;

            if (bCard.income.gold) {
              extraGold += bCard.income.gold + (isSunny ? 1 : 0);
            }
            if (bCard.income.stone) {
              extraStone += bCard.income.stone + (isSunny ? 1 : 0);
            }
            if (bCard.income.wood) {
              extraWood += bCard.income.wood + (isSunny ? 1 : 0);
            }
          });

          // If the weather halves income, apply it to these production yields too
          if (currentW?.name === '旱灾') {
            extraGold = Math.floor(extraGold / 2);
            extraStone = Math.floor(extraStone / 2);
            extraWood = Math.floor(extraWood / 2);
          } else if (currentW?.incomeHalve) {
            extraGold = Math.ceil(extraGold / 2);
            extraStone = Math.ceil(extraStone / 2);
            extraWood = Math.ceil(extraWood / 2);
          }

          buyer.gold += extraGold;
          buyer.stone += extraStone;
          buyer.wood += extraWood;

          triggerToast(`✨ 【繁荣水晶碎片】共鸣震荡：城内所有运转中的产出类建筑获得一次瞬时生产！(+${extraGold} 块金币, +${extraStone} 堆石料, +${extraWood} 捆木材)`, 'suc');
        }
      } else if (card.isGamble) {
        // Trigger Lucky Coin Gamble
        setGamblePlayerIdxRef(activePlayerIdx);
        setCoinGambleActive(true);
        // Play dice random values inside setter
        const coinFlipResult = Math.random() < 0.5 ? 'heads' : 'tails';
        setCoinGambleResult(coinFlipResult);

        // Apply coin values inside delay callback to keep animation sequence beautiful
      } else if (card.isRandomResource) {
        // Ancient map treasure digs
        const digType = Math.random() < 0.5 ? 'gold' : 'wood_stone';
        if (digType === 'gold') {
          const goldBonusCoins = 2 + Math.floor(Math.random() * 4); // 2-5 Gold
          buyer.gold += goldBonusCoins;
          triggerToast(`🗺️ 【远古金山古图】发挥功力，掘地掏得高纯度碎金 +${goldBonusCoins} 💰`, 'suc');
        } else {
          const stoneAmt = 1 + Math.floor(Math.random() * 3); // 1-3
          const woodAmt = 1 + Math.floor(Math.random() * 3);  // 1-3
          buyer.stone += stoneAmt;
          buyer.wood += woodAmt;
          triggerToast(`🗺️ 【远古木石遗图】指示方位，发掘采矿得 🪨+${stoneAmt}, 🪵+${woodAmt}！`, 'suc');
        }
      } else if (card.freeRefreshes) {
        buyer.freeRefreshes += card.freeRefreshes;
        triggerToast(`🧳 商旅歇脚！本回合额外在柜台塞入 ${card.freeRefreshes} 次不消耗金币的市场刷新特权！`, 'suc');
      } else if (card.type === 'resource') {
        // Consumable material cards
        if (card.bonus) {
          if (card.bonus.gold) buyer.gold += card.bonus.gold;
          if (card.bonus.stone) buyer.stone += card.bonus.stone;
          if (card.bonus.wood) buyer.wood += card.bonus.wood;
          triggerToast(`🍗 使用 【${card.name}】 充裕府库！立即获得所载增量金石。`, 'suc');
        }
      } else if (card.type === 'defense') {
        // Consumable defensive wall points
        buyer.defenseItems.push({ key: cardId, currentDefense: card.defensePoints! });
        triggerToast(`🧱 营建并垒叠消耗围堵防堵工事：【${card.name} (+${card.defensePoints} 护甲)】！`, 'suc');
      } else if (card.attackPower || card.catapult || card.siege) {
        // Attack cards go into inventory (raid, plunder, weapons)
        buyer.attackCards.push(cardId);
        triggerToast(`⚔️ 征募囤积攻袭卡储备 【${card.name}】 放至卡库，需要时可派军发动奇袭！`, 'suc');
      } else {
        // Regular buildings
        buyer.buildings.push(cardId);
        triggerToast(`🏠 恭喜！购买落成建筑 【${card.name}】！它将在后续回合提供源源不断的物资或特权储备。`, 'suc');
      }

      // Re-trigger visual refresh for other parts
      setTimeout(() => checkVictoryStatus(next), 200);
      return next;
    });

    // Replace purchased item in central shop rows
    const allKeys = Object.keys(CARD_DEFINITIONS).filter((k) => k !== cardId && k !== 'tradeCargo');
    const replacementCardKey = allKeys[Math.floor(Math.random() * allKeys.length)] || 'farm';
    setShopCards((prev) => {
      const next = [...prev];
      next[shopIndex] = replacementCardKey;
      return next;
    });

    // Clear dynamic costs for this shopIndex upon purchase to fix Traveling Merchant price-stickiness
    setDynamicCosts((prev) => {
      const next = { ...prev };
      delete next[shopIndex];
      return next;
    });
  };

  // Complete gamble animation sequence
  const finishCoinGamble = () => {
    if (gamblePlayerIdxRef === null || coinGambleResult === null) return;

    setPlayers((prev) => {
      const next = [...prev];
      const p = next[gamblePlayerIdxRef];
      if (coinGambleResult === 'heads') {
        p.gold += 3;
        triggerToast(`🍀 抛金币博弈得中！正面朝上，外赏赐金币 +3 💰`, 'suc');
      } else {
        p.gold = Math.max(0, p.gold - 1);
        triggerToast(`😔 掷出金币反面落泥！自罚消退金币 -1 🪙`, 'war');
      }
      return next;
    });

    // Reset gamble triggers
    setCoinGambleActive(false);
    setCoinGambleResult(null);
    setGamblePlayerIdxRef(null);
  };

  // Add Stone to backpack trade cargo
  const handleAddStoneToTradeCargo = (pIdx: number) => {
    setPlayers((prev) => {
      return prev.map((pl, i) => {
        if (i === pIdx) {
          const updated = {
            ...pl,
            stone: pl.stone,
            tradeCargoStone: pl.tradeCargoStone ?? 0,
          };
          if (updated.stone > 0) {
            updated.stone--;
            updated.tradeCargoStone++;
          }
          return updated;
        }
        return pl;
      });
    });
  };

  // Remove Stone from backpack trade cargo
  const handleRemoveStoneFromTradeCargo = (pIdx: number) => {
    setPlayers((prev) => {
      return prev.map((pl, i) => {
        if (i === pIdx) {
          const updated = {
            ...pl,
            stone: pl.stone,
            tradeCargoStone: pl.tradeCargoStone ?? 0,
          };
          if (updated.tradeCargoStone > 0) {
            updated.tradeCargoStone--;
            updated.stone++;
          }
          return updated;
        }
        return pl;
      });
    });
  };

  // Add Wood to backpack trade cargo
  const handleAddWoodToTradeCargo = (pIdx: number) => {
    setPlayers((prev) => {
      return prev.map((pl, i) => {
        if (i === pIdx) {
          const updated = {
            ...pl,
            wood: pl.wood,
            tradeCargoWood: pl.tradeCargoWood ?? 0,
          };
          if (updated.wood > 0) {
            updated.wood--;
            updated.tradeCargoWood++;
          }
          return updated;
        }
        return pl;
      });
    });
  };

  // Remove Wood from backpack trade cargo
  const handleRemoveWoodFromTradeCargo = (pIdx: number) => {
    setPlayers((prev) => {
      return prev.map((pl, i) => {
        if (i === pIdx) {
          const updated = {
            ...pl,
            wood: pl.wood,
            tradeCargoWood: pl.tradeCargoWood ?? 0,
          };
          if (updated.tradeCargoWood > 0) {
            updated.tradeCargoWood--;
            updated.wood++;
          }
          return updated;
        }
        return pl;
      });
    });
  };

  // Execute 4:1 forced sandsea trade action
  const handleExecuteTrade = (
    pIdx: number,
    targetIdx: number,
    stoneCountToSwap: number,
    woodCountToSwap: number
  ) => {
    if (gameOver) return;

    const goldFromStone = Math.floor(stoneCountToSwap / 4);
    const goldFromWood = Math.floor(woodCountToSwap / 4);
    const totalGoldToGet = goldFromStone + goldFromWood;

    if (totalGoldToGet <= 0) {
      triggerToast('⚠️ 强换物资数量不足，单项物资必须达到 4 的倍数才能交易成功！', 'war');
      return;
    }

    const p = players[pIdx];
    const targetP = players[targetIdx];

    // Check trade restrictions
    if (p.tradeTargetIdxThisTurn !== null && p.tradeTargetIdxThisTurn !== undefined && p.tradeTargetIdxThisTurn !== targetIdx) {
      triggerToast(`⚠️ 每回合只能选择同一个城市进行此项操作！(本回合您已锚定与 【${players[p.tradeTargetIdxThisTurn]?.name}】 贸易)`, 'war');
      return;
    }

    const currentSwapped = p.tradeGoldSwappedThisTurn ?? 0;
    if (currentSwapped + totalGoldToGet > 15) {
      triggerToast(`⚠️ 超出限额！每回合从其他城镇强行交换所得金币上限为 15 块（您本回合已换得 ${currentSwapped} 块）！`, 'war');
      return;
    }

    if (targetP.gold < totalGoldToGet) {
      triggerToast(`⚠️ 强换失败！对方城镇 【${targetP.name}】 的国库内已无多余金币可供搜刮分配！(其当前只有 ${targetP.gold} 块金币)`, 'war');
      return;
    }

    setPlayers((prev) => {
      return prev.map((pl, i) => {
        if (i === pIdx) {
          return {
            ...pl,
            gold: pl.gold + totalGoldToGet,
            tradeCargoStone: Math.max(0, (pl.tradeCargoStone ?? 0) - stoneCountToSwap),
            tradeCargoWood: Math.max(0, (pl.tradeCargoWood ?? 0) - woodCountToSwap),
            tradeProsperity: (pl.tradeProsperity ?? 0) + 1, // Clicking once adds exactly 1 point of prosperity
            tradeGoldSwappedThisTurn: (pl.tradeGoldSwappedThisTurn ?? 0) + totalGoldToGet,
            tradeTargetIdxThisTurn: targetIdx,
            // also copy deep arrays
            buildings: [...pl.buildings],
            defenseItems: pl.defenseItems.map((di) => ({ ...di })),
            attackCards: [...pl.attackCards],
            fragments: [...pl.fragments],
            disabledBuildings: pl.disabledBuildings.map((db) => ({ ...db })),
            tradedWithCityIndices: pl.tradedWithCityIndices ? [...pl.tradedWithCityIndices] : [],
          };
        } else if (i === targetIdx) {
          return {
            ...pl,
            gold: Math.max(0, pl.gold - totalGoldToGet),
            stone: pl.stone + stoneCountToSwap,
            wood: pl.wood + woodCountToSwap,
            // also copy deep arrays
            buildings: [...pl.buildings],
            defenseItems: pl.defenseItems.map((di) => ({ ...di })),
            attackCards: [...pl.attackCards],
            fragments: [...pl.fragments],
            disabledBuildings: pl.disabledBuildings.map((db) => ({ ...db })),
            tradedWithCityIndices: pl.tradedWithCityIndices ? [...pl.tradedWithCityIndices] : [],
          };
        }
        return {
          ...pl,
          buildings: [...pl.buildings],
          defenseItems: pl.defenseItems.map((di) => ({ ...di })),
          attackCards: [...pl.attackCards],
          fragments: [...pl.fragments],
          disabledBuildings: pl.disabledBuildings.map((db) => ({ ...db })),
          tradedWithCityIndices: pl.tradedWithCityIndices ? [...pl.tradedWithCityIndices] : [],
        };
      });
    });

    triggerToast(`🐫 砂海强行贸易大成！您向 【${targetP.name}】 强制倾销了 ${stoneCountToSwap > 0 ? `🪨 ${stoneCountToSwap} 堆石石` : ''} ${woodCountToSwap > 0 ? `🪵 ${woodCountToSwap} 捆木木` : ''}，强行兑兑得对方 🪙 ${totalGoldToGet} 块金币，您本轮累积获得 +${totalGoldToGet} 点【贸易繁荣度】！`, 'suc');

    // Trigger visual victory verification
    setTimeout(() => {
      setPlayers((currentPlayers) => {
        checkVictoryStatus(currentPlayers);
        return currentPlayers;
      });
    }, 200);
  };

  // Manual shop row refresh action
  const handleManualRefreshShop = () => {
    const activePlayerIdx = turnOrder[currentTurnIndex]?.playerIdx;
    if (activePlayerIdx === undefined) return;

    const p = players[activePlayerIdx];
    const isFree = p.freeRefreshes > 0;

    if (!isFree && p.gold < p.refreshCost) {
      triggerToast('⚠️ 领主金库枯竭，不足以支付中央自选市场的重置劳务费！', 'war');
      return;
    }

    setPlayers((prev) => {
      return prev.map((pl, i) => {
        if (i === activePlayerIdx) {
          const updated = {
            ...pl,
            buildings: [...pl.buildings],
            defenseItems: pl.defenseItems.map((di) => ({ ...di })),
            attackCards: [...pl.attackCards],
            fragments: [...pl.fragments],
            disabledBuildings: pl.disabledBuildings.map((db) => ({ ...db })),
            tradedWithCityIndices: pl.tradedWithCityIndices ? [...pl.tradedWithCityIndices] : [],
          };
          if (isFree) {
            updated.freeRefreshes = Math.max(0, (updated.freeRefreshes ?? 0) - 1);
          } else {
            updated.gold = Math.max(0, updated.gold - (updated.refreshCost ?? 1));
            updated.refreshCost = (updated.refreshCost ?? 1) + 1;
          }
          return updated;
        }
        return pl;
      });
    });

    // Unlock flags for pooling
    const hasBarracks = p.buildings.includes('barracks');
    const hasBlacksmith = p.buildings.includes('blacksmith');
    const hasTemple = p.buildings.includes('temple');
    const hasAcademy = p.buildings.includes('academy');
    const isTyphoon = getActiveWeather()?.name === '台风';

    refreshMarketCards(hasBarracks, hasBlacksmith, hasTemple, hasAcademy, isTyphoon);
    triggerToast('🔄 市场卡牌已全面重置更新！一打全新兵刃神物已上架供选！', 'info');
  };

  // Heavy weapon mechanics: Catapult (Catapult) destroys target building for 2 turns
  const executeCatapultFling = (attackerIdx: number, targetIdx: number) => {
    const pTarget = players[targetIdx];
    // Find un-broken operating buildings
    const activeBuildingsKey = pTarget.buildings.filter(
      (bKey) => !pTarget.disabledBuildings.some((d) => d.key === bKey)
    );

    if (activeBuildingsKey.length === 0) {
      triggerToast(`🪨 【投石巨车】轰天砸去，然而【${pTarget.name}】领土中竟然已废如废墟没有可破坏的生产性砖瓦了！`, 'war');
      return;
    }

    const randomVictimBuilding = activeBuildingsKey[Math.floor(Math.random() * activeBuildingsKey.length)];
    setPlayers((prev) => {
      const next = [...prev];
      next[targetIdx].disabledBuildings.push({
        key: randomVictimBuilding,
        untilRound: currentRound + 2, // Disabled for 2 full rounds
      });
      return next;
    });

    const targetBuildingName = CARD_DEFINITIONS[randomVictimBuilding]?.name || '神秘民房';
    triggerToast(`🪨 投石弩车狂掷雷击！巨大的碎石从高空呼啸砸在 【${pTarget.name}】 上，其精良的主力生产线建筑 【${targetBuildingName}】 直接损毁坍塌瘫痪 (2回合内在计算岁入与繁荣度时将失去一切产出效应)！`, 'war');
  };

  // Heavy weapon mechanics: Siege RAM (Siege) suppresses defense points for 2 turns
  const executeSiegeRamCharge = (attackerIdx: number, targetIdx: number) => {
    setPlayers((prev) => {
      const next = [...prev];
      next[targetIdx].defenseDisabledUntil = currentRound + 2; // disabled for 2 turns
      return next;
    });

    triggerToast(`🐏 攻城猛撞巨羊车蓄力冲杀！巨大的金属羊头凿开了 【${targetKeepName(targetIdx)}】 的大门护梁，其城防护栏点数直接宣告【完全失效归零】(未来 2 回合内将裸露肉体，防御值在攻打计算中完全视作 0)！`, 'war');
  };

  // Attack Execution core mechanics (Active attack, Raid & Plunder cards) with barrage barracks bonus
  const handleExecuteAttackToTarget = (targetIdx: number) => {
    if (pendingAttackInfo === null) return;

    const activePlayerIdx = turnOrder[currentTurnIndex]?.playerIdx;
    if (activePlayerIdx === undefined) return;

    const attacker = players[activePlayerIdx];
    const targetKeep = players[targetIdx];

    // Determine attack parameters
    let attackPower = 2; // Base active attack or raid
    let cardTitle = '领主军主动出征';
    let isWeaponCatapult = false;
    let isWeaponSiege = false;

    if (pendingAttackInfo.isCustomActiveAttack) {
      // Manual Active attack
      if (attacker.gold < 2 || attacker.wood < 1) {
        triggerToast('⚠️ 领主缺少发兵开拔的开销资源！(需要 2金币 + 1捆木材)', 'war');
        return;
      }
      setPlayers((prev) => {
        const next = [...prev];
        next[activePlayerIdx].gold -= 2;
        next[activePlayerIdx].wood -= 1;
        next[activePlayerIdx].attackCount++;
        return next;
      });
    } else {
      // Hand Card Attack
      const cardKey = attacker.attackCards[pendingAttackInfo.cardIdx];
      const card = CARD_DEFINITIONS[cardKey];

      if (cardKey === 'fogSpell') {
        // Remove card from player asset lists and apply fog spell on target
        setPlayers((prev) => {
          const next = [...prev];
          next[activePlayerIdx].attackCards.splice(pendingAttackInfo.cardIdx, 1);
          next[targetIdx].foggedByPlayerIdx = activePlayerIdx;
          return next;
        });

        setPendingAttackInfo(null);
        setBackpackPlayerIdx(null);
        setBarracksPlayerIdx(null);
        setMilitaryDeckPlayerIdx(null);

        triggerToast(`🌫️ 【迷雾法术】施法成功！大雾笼罩了【${targetKeep.name}】，隐藏了其资产。回合大结算时，其任何未花完之金币都将被你缴获！`, 'war');
        return;
      }

      if (card) {
        cardTitle = card.name;
        attackPower = card.attackPower || 2;
        isWeaponCatapult = !!card.catapult;
        isWeaponSiege = !!card.siege;
      }

      // Remove card from player asset lists
      setPlayers((prev) => {
        const next = [...prev];
        next[activePlayerIdx].attackCards.splice(pendingAttackInfo.cardIdx, 1);
        return next;
      });
    }

    // Dismiss dialogues
    setPendingAttackInfo(null);
    setBackpackPlayerIdx(null);
    setBarracksPlayerIdx(null);
    setMilitaryDeckPlayerIdx(null);

    // If heavy war weapon, bypass standard damage-absorption blocks
    if (isWeaponCatapult) {
      executeCatapultFling(activePlayerIdx, targetIdx);
      return;
    }

    if (isWeaponSiege) {
      executeSiegeRamCharge(activePlayerIdx, targetIdx);
      return;
    }

    // ---------------- Standard direct plundering damage block ----------------
    // Calculate effective defense in alignment with weather blocks (Rain-halving)
    const rawDefense = targetKeep.defenseItems.reduce((acc, d) => acc + d.currentDefense, 0) + 
      (targetKeep.currentBuildingDefense || 0);
    const activeWeather = getActiveWeather();
    const targetIsVulnerable = targetKeep.defenseDisabledUntil >= currentRound;
    let finalDefense = targetIsVulnerable ? 0 : rawDefense;

    // Guardian Spell doubles final defenses
    if (targetKeep.guardianSpellRemainingRounds && targetKeep.guardianSpellRemainingRounds > 0 && !targetIsVulnerable) {
      finalDefense = finalDefense * 2;
    }

    if (activeWeather && activeWeather.defenseHalve) {
      finalDefense = Math.floor(finalDefense / 2);
    }

    // Determine damage penetration
    let blockedAmt = Math.min(finalDefense, attackPower);
    let bleedThroughDamage = attackPower - blockedAmt;

    // Expend consumable defense items
    if (blockedAmt > 0 && !targetIsVulnerable) {
      setPlayers((prev) => {
        const next = [...prev];
        const keep = next[targetIdx];
        let runningExpenditure = blockedAmt;

        const deadWallsIndices: number[] = [];
        for (let i = 0; i < keep.defenseItems.length; i++) {
          if (runningExpenditure <= 0) break;
          const absorb = Math.min(keep.defenseItems[i].currentDefense, runningExpenditure);
          keep.defenseItems[i].currentDefense -= absorb;
          runningExpenditure -= absorb;

          if (keep.defenseItems[i].currentDefense <= 0) {
            deadWallsIndices.push(i);
          }
        }

        // Strip collapsed wall items
        for (let i = deadWallsIndices.length - 1; i >= 0; i--) {
          keep.defenseItems.splice(deadWallsIndices[i], 1);
        }

        return next;
      });
    }

    // Handle resource plunder payouts
    if (bleedThroughDamage > 0) {
      // Barracks Boost rule: every additional Barracks (beyond the first) grants a permanent output +1 to plunder!
      const totalBarracksCount = attacker.buildings.filter((b) => b === 'barracks').length;
      const extraBarracksBonus = Math.max(0, totalBarracksCount - 1);
      const finalPlunderedAmt = bleedThroughDamage + extraBarracksBonus;

      const stolenCounts = { gold: 0, stone: 0, wood: 0 };

      setPlayers((prev) => {
        const next = [...prev];
        const att = next[activePlayerIdx];
        const vic = next[targetIdx];

        for (let i = 0; i < finalPlunderedAmt; i++) {
          const lootable: ('gold' | 'stone' | 'wood')[] = [];
          if (vic.gold > 0) lootable.push('gold');
          if (vic.stone > 0) lootable.push('stone');
          if (vic.wood > 0) lootable.push('wood');

          if (lootable.length === 0) break;

          const picked = lootable[Math.floor(Math.random() * lootable.length)];
          vic[picked]--;
          att[picked]++;
          stolenCounts[picked]++;
        }
        return next;
      });

      const stoleAny = stolenCounts.gold > 0 || stolenCounts.stone > 0 || stolenCounts.wood > 0;

      if (!stoleAny) {
        triggerToast(`⚔️ 【${cardTitle}】 突入敌阵城墙！然而 【${targetKeep.name}】 的国库竟然大厦倾倒空无一物，无法斩获任何粮草石料物资！`, 'war');
      } else {
        const stolenDetails: string[] = [];
        if (stolenCounts.gold > 0) stolenDetails.push(`🪙 金币 x${stolenCounts.gold}`);
        if (stolenCounts.stone > 0) stolenDetails.push(`🪨 精石 x${stolenCounts.stone}`);
        if (stolenCounts.wood > 0) stolenDetails.push(`🪵 原木 x${stolenCounts.wood}`);

        let successMessage = `⚔️ 【${cardTitle}】攻杀成功！越过了防守大盾(消耗敌方 ${blockedAmt} 护甲)，长驱直入掠夺！从 【${targetKeep.name}】 夺走：${stolenDetails.join('、')}！`;
        if (extraBarracksBonus > 0) {
          successMessage += ` (包含多造兵营发动的战术掠夺加成：额外 +${extraBarracksBonus} 掠夺量！)`;
        }

        triggerToast(successMessage, 'suc');
      }
    } else {
      triggerToast(`🛡️ 偷天换日！【${cardTitle}】 发动的闪电奔袭，被 【${targetKeep.name}】 固若金汤的壁垒盾墙 (${blockedAmt} 防值) 给完美阻隔在护城河外！`, 'war');
    }

    // Refresh layout victory triggers
    setTimeout(() => {
      setPlayers((prev) => {
        checkVictoryStatus(prev);
        return prev;
      });
    }, 250);
  };

  // Launching Weather Witch Altar custom selector
  const handleWitchWeatherActivation = (chosenWeather: Weather) => {
    const activePlayerIdx = turnOrder[currentTurnIndex]?.playerIdx;
    if (activePlayerIdx === undefined) return;

    const caller = players[activePlayerIdx];

    // Altar rule: Caller must have total defense index > 0 to feed the spirits, and altar must have cooled down
    const defSum = caller.defenseItems.reduce((acc, d) => acc + d.currentDefense, 0);
    if (defSum <= 0) {
      triggerToast('🪄 【巫术祭台】神灵枯萎：祭天需要您城内当前拥有至少 1点 壁垒城墙或神殿作为祭品供奉点数！', 'war');
      return;
    }

    // Higher prosperity check: Altar can only be activated if Caller is the leader, or ties with highest prosperity!
    // "繁荣最高者优先，若其他城长繁荣度更高，则祈天失败。"
    const callerProsperity = getPlayerStats(activePlayerIdx).totalProsperity;
    let isHighest = true;
    let rivalName = '';

    players.forEach((p, idx) => {
      if (idx === activePlayerIdx) return;
      const otherProsperity = getPlayerStats(idx).totalProsperity;
      if (otherProsperity > callerProsperity) {
        isHighest = false;
        rivalName = p.name;
      }
    });

    if (!isHighest) {
      triggerToast(`🪄 祭天仪式遭遇天谴反噬！【${rivalName}】的繁荣势头比您更加耀目，天地星网将改运灵符优先指派向了强者！您的祈天被迫【失败作废】。`, 'war');
      return;
    }

    // Deduct defense point as sacrifice
    setPlayers((prev) => {
      const next = [...prev];
      const p = next[activePlayerIdx];
      
      // Consume 1 defense item point
      if (p.defenseItems.length > 0) {
        p.defenseItems[0].currentDefense--;
        if (p.defenseItems[0].currentDefense <= 0) {
          p.defenseItems.splice(0, 1);
        }
      }

      // 2 round altar cooling trigger
      p.witchCooldown = 2;
      return next;
    });

    setControlledWeather({
      type: 'witch',
      weather: chosenWeather,
      remaining: 2, // Lasts 2 full rounds
      ownerIdx: activePlayerIdx,
    });

    triggerToast(`🪄 【${caller.name}】奉上了城防作为祭品，点燃巫术法阵！天地雷劫异动：强制逆天改变未来 2 回合天候为 【${chosenWeather.name} (${chosenWeather.desc})】！`, 'suc');
  };

  // Safe names helper
  const targetKeepName = (idx: number) => {
    return players[idx]?.name || '未知城池';
  };

  // --------------------------------------------------------------------------
  // AI Bot decision engine execution wrapper
  // --------------------------------------------------------------------------
  const executeAIStepSequence = useCallback(async () => {
    const activePlayerIdx = turnOrder[currentTurnIndex]?.playerIdx;
    if (activePlayerIdx === undefined || gameOver || isPaused) return;

    const p = players[activePlayerIdx];
    if (!p || !p.isAI || isAILocking) return;

    setIsAILocking(true);
    setAiActionMessage('统治阶级思考治理策略中...');

    try {
      // Comfort time delay helper
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      await sleep(1000);

      const hasBarracks = p.buildings.includes('barracks');
      const hasBlacksmith = p.buildings.includes('blacksmith');
      const hasTemple = p.buildings.includes('temple');
      const hasAcademy = p.buildings.includes('academy');
      const isTyphoon = getActiveWeather()?.name === '台风';

      // ---------------------------------------------------------
      // Step A: Decide if playing high-value hand card from inventory space
      // ---------------------------------------------------------
      if (p.attackCards.length > 0 && hasBarracks) {
        setAiActionMessage('军事司令部密谋攻防中...');
        const candidateTargets = players.filter((item, idx) => idx !== activePlayerIdx);
        if (candidateTargets.length > 0) {
          // Prioritize: target who has the largest prosperity but lowest shield, or random choice
          let targetIdx = 0;
          let highestP = -1;

          players.forEach((rival, idx) => {
            if (idx === activePlayerIdx) return;
            const rivalProsperity = getPlayerStats(idx).totalProsperity;
            if (rivalProsperity > highestP) {
              highestP = rivalProsperity;
              targetIdx = idx;
            }
          });

          // Play first card
          const randomMoveSeed = Math.random();
          if (randomMoveSeed < 0.85) {
            setPendingAttackInfo({ cardIdx: 0, isCustomActiveAttack: false });
            // Select targetIdx as command
            await sleep(800);
            handleExecuteAttackToTarget(targetIdx);
            await sleep(1000);
          }
        }
      }

      // ---------------------------------------------------------
      // Step B: Check Altar operations for AI
      // ---------------------------------------------------------
      const aiDefScore = p.defenseItems.reduce((acc, d) => acc + d.currentDefense, 0);
      if (p.buildings.includes('witchAltar') && p.witchCooldown === 0 && aiDefScore > 0) {
        // AI chooses Great Sun (大晴天) code
        const sunnyWeather = WEATHERS.find(w => w.name === '大晴天');
        if (sunnyWeather) {
          setAiActionMessage('祭天坛沟通天地中...');
          await sleep(650);
          handleWitchWeatherActivation(sunnyWeather);
          await sleep(1000);
        }
      }

      // ---------------------------------------------------------
      // Step C: Shop transactions (AI purchases)
      // ---------------------------------------------------------
      setAiActionMessage('国库筹备选修物产中...');
      let buyAttemptsCount = 0;
      let aiCanKeepBuying = true;

      while (aiCanKeepBuying && buyAttemptsCount < 4) {
        buyAttemptsCount++;
        let boughtSomethingThisLoop = false;

        // Gather list of affordable and unlocked items from market row
        const eligibleDeals: { id: string; shopIdx: number }[] = [];

        shopCards.forEach((cId, sIdx) => {
          const card = CARD_DEFINITIONS[cId];
          if (!card) return;

          // Locks check
          let isCardLocked = false;
          if (card.requiresBarracks && !hasBarracks) isCardLocked = true;
          else if (card.requiresBlacksmith && !hasBlacksmith) isCardLocked = true;
          else if (card.id === 'ironWall' && !hasBlacksmith) isCardLocked = true;
          else if (card.id === 'siege' && (!hasBarracks || !hasBlacksmith)) isCardLocked = true;
          else if (card.id === 'witchAltar' && (!hasTemple || !hasAcademy)) isCardLocked = true;

          if (isTyphoon && card.type === 'military') isCardLocked = true;

          // Purchase capacity check
          const canBuy = p.gold >= card.costGold && p.stone >= card.costStone && p.wood >= card.costWood;

          if (!isCardLocked && canBuy) {
            eligibleDeals.push({ id: cId, shopIdx: sIdx });
          }
        });

        if (eligibleDeals.length > 0) {
          // AI Preference Weighting: Farm/Treasury/Mining > Caravan > Shards > Walls/Combat
          eligibleDeals.sort((a, b) => {
            const cardA = CARD_DEFINITIONS[a.id];
            const cardB = CARD_DEFINITIONS[b.id];
            
            const scoreA = cardA.income ? 15 : cardA.bonus ? 10 : cardA.isFragment ? 8 : 4;
            const scoreB = cardB.income ? 15 : cardB.bonus ? 10 : cardB.isFragment ? 8 : 4;

            return scoreB - scoreA;
          });

          const selectedDeal = eligibleDeals[0];
          setAiActionMessage(`购入 【${CARD_DEFINITIONS[selectedDeal.id]?.name}】 拓展领疆...`);
          await sleep(800);
          handleBuyCardAndExecute(selectedDeal.shopIdx);
          boughtSomethingThisLoop = true;
          await sleep(800);
        }

        if (!boughtSomethingThisLoop) {
          aiCanKeepBuying = false;
        }
      }

      // ---------------------------------------------------------
      // Step D: Spend excess gold to refresh market if no buys were done
      // ---------------------------------------------------------
      if (p.gold >= 5 && Math.random() < 0.4) {
        setAiActionMessage('重金打探新一批商物...');
        await sleep(600);
        handleManualRefreshShop();
        await sleep(800);
      }

      // ---------------------------------------------------------
      // Step E: Manual Active Committing Attacks if wealth allows
      // ---------------------------------------------------------
      if (hasBarracks && p.attackCount < 2 && p.gold >= 4 && p.wood >= 2) {
        // Find best target Keep (leader or easiest shield target)
        let targetIdx = 0;
        let highestP = -1;

        players.forEach((rival, idx) => {
          if (idx === activePlayerIdx) return;
          const rivalProsperity = getPlayerStats(idx).totalProsperity;
          if (rivalProsperity > highestP) {
            highestP = rivalProsperity;
            targetIdx = idx;
          }
        });

        setAiActionMessage(`行军突袭 【${targetKeepName(targetIdx)}】...`);
        setPendingAttackInfo({ cardIdx: -1, isCustomActiveAttack: true });
        await sleep(900);
        handleExecuteAttackToTarget(targetIdx);
        await sleep(1000);
      }

      // ---------------------------------------------------------
      // Step F: Conclude AI Turn
      // ---------------------------------------------------------
      setAiActionMessage('政务落笔，结束回合！');
      await sleep(1000);
      completeCurrentTurn();

    } catch (err) {
      // Catch exceptions gracefully
    } finally {
      setIsAILocking(false);
      setAiActionMessage('');
    }
  }, [turnOrder, currentTurnIndex, players, isAILocking, gameOver, isPaused, shopCards, completeCurrentTurn, handleBuyCardAndExecute, handleManualRefreshShop, handleExecuteAttackToTarget, handleWitchWeatherActivation, getPlayerStats, triggerToast]);

  // Hook watching AI turns triggers
  useEffect(() => {
    let aiTimeout: NodeJS.Timeout;
    
    const activePlayerIdx = turnOrder[currentTurnIndex]?.playerIdx;
    if (activePlayerIdx !== undefined && gameStarted && !gameOver && !isPaused) {
      const p = players[activePlayerIdx];
      if (p && p.isAI && !isAILocking) {
        aiTimeout = setTimeout(() => {
          executeAIStepSequence();
        }, 1500);
      }
    }

    return () => clearTimeout(aiTimeout);
  }, [currentTurnIndex, turnOrder, gameStarted, gameOver, isPaused, players, isAILocking, executeAIStepSequence]);

  // Hook to control battle background music sequence
  useEffect(() => {
    if (!gameStarted) {
      const interactToPlay = () => {
        if (!gameStarted) {
          battleMusic.start();
        }
      };
      window.addEventListener('click', interactToPlay, { once: true });
      window.addEventListener('touchstart', interactToPlay, { once: true });
      
      battleMusic.start();

      return () => {
        window.removeEventListener('click', interactToPlay);
        window.removeEventListener('touchstart', interactToPlay);
        battleMusic.stop();
      };
    } else {
      battleMusic.stop();
    }
  }, [gameStarted]);

  return (
    <div className="game-container min-h-screen text-stone-800 flex flex-col font-sans relative select-none selection:bg-[#7a5d1b]/20">
      
      {/* 1. Setup screen overlays */}
      {!gameStarted && (
        <SetupScreen onStartGame={(target, isAI) => startFreshGame(target, isAI)} />
      )}

      {/* Main Container workspace */}
      {gameStarted && (
        <div className="w-full max-w-7xl mx-auto flex flex-col min-h-screen px-3 md:px-5 py-4 gap-4 justify-between">
          
          {/* Header Bar */}
          <div className="bg-[#faf6eb] border-2 border-[#7a5d1b]/40 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-md text-stone-800">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              {/* Back to main setup screen button in the top-left corner */}
              <button
                onClick={() => {
                  if (backMenuConfirmCount === 0) {
                    setBackMenuConfirmCount(1);
                    triggerToast('⚠️ 确定要返回主界面吗？请连续点击确认 2 次！', 'info');
                  } else if (backMenuConfirmCount === 1) {
                    setBackMenuConfirmCount(2);
                    triggerToast('⚠️ 请连续点击确认最后 1 次！确认后游戏将重置！', 'war');
                  } else {
                    setBackMenuConfirmCount(0);
                    setGameStarted(false);
                    triggerToast('🔄 战局已重置，返回主菜单。', 'info');
                  }
                }}
                className={`w-full sm:w-auto p-2.5 rounded-lg border-2 transition-all shrink-0 text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs font-retro font-bold ${
                  backMenuConfirmCount === 0
                    ? 'border-[#7a5d1b]/40 bg-white hover:bg-[#f6efe2] text-[#7a5d1b]'
                    : backMenuConfirmCount === 1
                    ? 'border-amber-500 bg-[#fef3c7] text-amber-800 hover:bg-[#fde68a] animate-pulse'
                    : 'border-red-500 bg-[#fee2e2] text-red-800 hover:bg-[#fecaca] animate-bounce font-black'
                }`}
                title="重置当前战况返回主界面 (需连续确认)"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="text-[10px]">
                  {backMenuConfirmCount === 0
                    ? '返回主界面'
                    : backMenuConfirmCount === 1
                    ? '确认返回？(需再点2次)'
                    : '⚠️ 强制返回！(最后1次)'}
                </span>
              </button>

              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Crown className="w-5 h-5 text-amber-600 filter drop-shadow animate-bounce" />
                  <h1 className="font-retro text-sm md:text-base font-black tracking-widest text-[#7a5d1b]">
                    城 邦 争 霸
                  </h1>
                  <span className="text-[9px] font-retro text-stone-600 bg-stone-200/80 border border-stone-300 px-1 rounded-sm">
                    v2.1
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 font-sans mt-0.5 leading-none">
                  率先夺得 <b className="text-[#7a5d1b] font-bold">⭐ {targetProsperity} 繁荣度</b> 的领主流名大陆！
                </p>
              </div>
            </div>

            {/* Quick dashboard tools */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Climate board widget */}
              <div
                className={`py-1.5 px-3 rounded-lg border-2 text-xs flex items-center gap-2 relative overflow-hidden bg-gradient-to-r text-stone-800 ${
                  getActiveWeather() ? getActiveWeather()!.color + ' border-blue-300' : 'from-[#fffbeb]/90 to-[#fef3c7]/60 border-amber-300'
                }`}
              >
                <div className="flex items-center gap-1.5 z-10">
                  <span className="text-xl filter drop-shadow select-none">
                    {getActiveWeather() ? getActiveWeather()!.icon : '😌'}
                  </span>
                  <div>
                    <p className="text-[9px] font-retro font-bold text-stone-800 leading-none">
                      {getActiveWeather() ? getActiveWeather()!.name : '平静的大陆'}
                    </p>
                    <p className="text-[7.5px] text-stone-500 font-sans mt-1.5 opacity-90 leading-tight">
                      {getActiveWeather() ? getActiveWeather()!.desc : '没有浮冰或旱涝异常干预城内日常。'}
                    </p>
                  </div>
                </div>

                {/* Micro particle lights */}
                <div className="absolute inset-0 bg-white/5 pointer-events-none filter blur shadow" />
              </div>

              {/* Volume audio toggler */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 bg-white border-2 border-[#7a5d1b]/30 text-stone-600 hover:text-[#7a5d1b] hover:border-[#7a5d1b] rounded-lg transition-colors cursor-pointer"
                title="开启/静音音效"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* TOP 1/3: 4 MINI EMPIRE CITIES VIEW PANEL WITH GRAPHIC LAYERS */}
          {/* ------------------------------------------------------------- */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            
            {/* Realtime low-res weather canvas particle simulation */}
            <WeatherCanvas weather={getActiveWeather()} />

            {/* Render 4 mini cityscapes */}
            <PixelCityView
              players={players}
              activePlayerIdx={turnOrder[currentTurnIndex]?.playerIdx ?? 0}
            />
          </div>

          {/* Status Display Area */}
          <div className="bg-[#faf6eb] border-2 border-[#7a5d1b]/40 p-2.5 px-3 rounded-xl flex flex-col md:flex-row justify-between items-center text-xs text-stone-700 gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Dices className="w-4 h-4 text-amber-600 animate-pulse" />
                <div className="text-[10px] font-retro font-bold text-stone-800">
                  重天历期第 <span className="text-[#a16207]">{currentRound}</span> 轮
                </div>
              </div>

              {/* Weather Forecast Action Triggers */}
              <div className="h-4 w-[1px] bg-[#e2d5bd] hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleExecuteForecast}
                  className={`px-2 py-0.5 rounded text-[8px] font-retro font-bold uppercase transition-all flex items-center gap-1 cursor-pointer select-none ${
                    currentRound - lastForecastRound >= 6 || lastForecastRound === -999
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                      : 'bg-stone-200 text-stone-400 border border-stone-300 cursor-not-allowed opacity-75'
                  }`}
                  title="预测观测离今日后2轮完整回合天之异变"
                >
                  <span>🔮 天气预报</span>
                  {currentRound - lastForecastRound < 6 && lastForecastRound !== -999 && (
                    <span className="text-[7.5px] text-stone-500 font-mono">
                      (余 {6 - (currentRound - lastForecastRound)} 轮)
                    </span>
                  )}
                </button>
                {lastForecastRound !== -999 && (
                  <button
                    onClick={() => setShowForecastResult(true)}
                    className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200/50 text-[#7a5d1b] text-[8px] font-retro font-bold hover:bg-amber-100 flex items-center gap-0.5"
                    title="点击重新查看最近一次测算出的气象星海预言内容"
                  >
                    <span>📜 预言纸</span>
                  </button>
                )}
              </div>
            </div>

            {/* Current Turn Order initiative track queue visual layout */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[8.5px] font-retro text-stone-500 uppercase mr-1">行动顺位:</span>
              {turnOrder.map((tok, index) => {
                const targetP = players[tok.playerIdx];
                const isCurrent = index === currentTurnIndex;
                if (!targetP) return null;
                return (
                  <div
                    key={tok.playerIdx}
                    className={`px-2 py-0.5 rounded text-[9px] font-retro flex items-center gap-1.5 font-bold transition-all ${
                      isCurrent
                        ? 'bg-[#7a5d1b] text-white scale-102 ring-2 ring-yellow-500 shadow-sm'
                        : 'bg-white text-stone-600 border border-[#e2d5bd]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: targetP.themeColor }} />
                    <span>{targetP.name} (🎲{tok.dice})</span>
                    {!isCurrent && index > currentTurnIndex && <span className="text-[7.5px] opacity-40">⏳</span>}
                    {isCurrent && <span className="text-[7.5px] animate-pulse">📡</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* MIDDLE: CARD MERCHANDISING SHOP ROWS MARKET */}
          {/* ------------------------------------------------------------- */}
          {(() => {
            const activeIdx = turnOrder[currentTurnIndex]?.playerIdx;
            const activeP = players[activeIdx];
            if (!activeP) return null;

            return (
              <CardMarket
                shopCards={shopCards}
                dynamicCosts={dynamicCosts}
                onBuyCard={(sIdx) => handleBuyCardAndExecute(sIdx)}
                refreshCost={activeP.refreshCost}
                freeRefreshes={activeP.freeRefreshes}
                onRefreshShop={handleManualRefreshShop}
                gold={activeP.gold}
                stone={activeP.stone}
                wood={activeP.wood}
                hasBarracks={activeP.buildings.includes('barracks')}
                hasBlacksmith={activeP.buildings.includes('blacksmith')}
                hasTemple={activeP.buildings.includes('temple')}
                hasAcademy={activeP.buildings.includes('academy')}
                isTyphoon={getActiveWeather()?.name === '台风'}
              />
            );
          })()}

          {/* ------------------------------------------------------------- */}
          {/* BOTTOM: THE 4 PLAYER OPERATIONAL PANEL SLOTS */}
          {/* ------------------------------------------------------------- */}
          <PlayerPanels
            players={players}
            activePlayerIdx={turnOrder[currentTurnIndex]?.playerIdx ?? 0}
            onOpenBackpack={(idx) => setBackpackPlayerIdx(idx)}
            onOpenMilitaryDeck={(idx) => setMilitaryDeckPlayerIdx(idx)}
            onOpenWitchcraft={(idx) => setWitchcraftPlayerIdx(idx)}
            onOpenTradeRoute={(idx) => setTradeRoutePlayerIdx(idx)}
            onActiveAttack={(attacker, defender) => {
              setPendingAttackInfo({ cardIdx: -1, isCustomActiveAttack: true });
              // Triggers dialog modal reveal done inside component button click
            }}
            onOpenWitchAltar={(idx) => {
              // Custom selection panel
              const witchNode = document.getElementById('witch-weather-selector-dialog');
              if (witchNode) {
                witchNode.style.display = 'flex';
              }
            }}
            isCloudy={getActiveWeather()?.name === '阴天'}
          />

          {/* Footer Controls Action belt */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-[#130f1b] border border-slate-850 p-3 rounded-xl shadow-inner mt-2">
            
            {/* Clock timing system widget */}
            <div className="flex items-center gap-3">
              <span
                className={`py-1.5 px-3 rounded-lg border font-retro text-[10px] flex items-center gap-1.5 leading-none transition-all ${
                  turnSecondsLeft <= 10
                    ? 'bg-red-950/40 border-red-800 text-red-400 animate-pulse'
                    : 'bg-black/35 border-slate-800 text-yellow-400'
                }`}
              >
                <span>⌛ 本轮限时: {turnSecondsLeft} 秒</span>
              </span>

              {/* Pause system */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`p-2 rounded-lg border text-xs flex items-center justify-center gap-1 font-bold font-retro cursor-pointer transition-colors ${
                  isPaused
                    ? 'bg-yellow-500 border-yellow-600 text-slate-950 hover:bg-yellow-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span className="text-[9px]">{isPaused ? '继续' : '暂停'}</span>
              </button>


            </div>

            {/* AI Action thinker bar */}
            {isAILocking ? (
              <div className="flex items-center gap-2 bg-purple-950/30 border border-purple-800 rounded-lg px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping inline-block" />
                <span className="text-[10px] font-retro text-purple-300">
                  AI:【{players[turnOrder[currentTurnIndex]?.playerIdx]?.name}】-{aiActionMessage}
                </span>
              </div>
            ) : (
              <div className="text-[10px] text-zinc-500 italic font-mono uppercase tracking-tighter">
                &bull; Fun and educational, enhances thinking ability &bull;
              </div>
            )}

            {/* Main Round Committer: End turn button */}
            <button
              onClick={() => completeCurrentTurn()}
              disabled={isAILocking}
              className="w-full sm:w-auto py-2.5 px-6 rounded-lg font-retro text-[10px] font-black text-slate-950 shadow-md transform hover:-translate-y-0.5 active:translate-y-0 transition-all border-b-2 cursor-pointer bg-[#eab308] hover:bg-[#ebd269] border-yellow-800 disabled:opacity-40 disabled:cursor-not-allowed text-shadow-sm select-none"
            >
              ▶ 结束此轮政务
            </button>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. TEMPLATED POPUP OVERLAYS MODALS ACTIONS PANEL */}
      {/* ------------------------------------------------------------- */}

      {/* Modal: Backpack Dialog query panel */}
      <AnimatePresence>
        {backpackPlayerIdx !== null && (
          <BackpackDialog
            player={players[backpackPlayerIdx]}
            playerIdx={backpackPlayerIdx}
            activePlayerIdx={turnOrder[currentTurnIndex]?.playerIdx ?? 0}
            onClose={() => setBackpackPlayerIdx(null)}
          />
        )}
      </AnimatePresence>

      {/* Modal: Witchcraft Shards Dialog */}
      <AnimatePresence>
        {witchcraftPlayerIdx !== null && (
          <WitchcraftDialog
            player={players[witchcraftPlayerIdx]}
            onClose={() => setWitchcraftPlayerIdx(null)}
          />
        )}
      </AnimatePresence>

      {/* Modal: Trade Route Backpack Dialog */}
      <AnimatePresence>
        {tradeRoutePlayerIdx !== null && (
          <TradeRouteDialog
            player={players[tradeRoutePlayerIdx]}
            playerIdx={tradeRoutePlayerIdx}
            players={players}
            onClose={() => setTradeRoutePlayerIdx(null)}
            onAddStone={handleAddStoneToTradeCargo}
            onRemoveStone={handleRemoveStoneFromTradeCargo}
            onAddWood={handleAddWoodToTradeCargo}
            onRemoveWood={handleRemoveWoodFromTradeCargo}
            onExecuteTrade={handleExecuteTrade}
          />
        )}
      </AnimatePresence>

      {/* Modal: Military war Deck Dialog */}
      <AnimatePresence>
        {militaryDeckPlayerIdx !== null && (
          <MilitaryDeckDialog
            player={players[militaryDeckPlayerIdx]}
            playerIdx={militaryDeckPlayerIdx}
            activePlayerIdx={turnOrder[currentTurnIndex]?.playerIdx ?? 0}
            onClose={() => setMilitaryDeckPlayerIdx(null)}
            onUseAttackCard={(cardIndex) => {
              // Initiate target selecting pipeline
              setPendingAttackInfo({ cardIdx: cardIndex, isCustomActiveAttack: false });
              setMilitaryDeckPlayerIdx(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal: Barracks (兵营) direct-use dialogue panel */}
      <AnimatePresence>
        {barracksPlayerIdx !== null && (
          <div className="fixed inset-0 bg-black/75 z-40 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#1e1424] border-2 border-red-500 rounded-xl p-5 relative"
            >
              <button
                onClick={() => setBarracksPlayerIdx(null)}
                className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
              <h3 className="font-retro text-[10.5px] text-red-400 font-bold mb-1">
                ⚔️ 兵营军事大本营控制台
              </h3>
              <p className="text-[8.5px] text-zinc-400 mb-3 leading-tight">
                您可以在此直接集结并差遣您城里所持的一切攻击战术性卡牌！
              </p>

              {(() => {
                const p = players[barracksPlayerIdx];
                if (!p) return null;
                const handCombatCards = p.attackCards;

                if (handCombatCards.length === 0) {
                  return (
                    <div className="p-3 bg-black/20 text-center border border-slate-900 rounded">
                      <p className="text-xs text-zinc-500 italic">当前领主军火武器库内两手空空，没有任何攻击卡可调遣。</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                    {handCombatCards.map((cKey, idx) => {
                      const card = CARD_DEFINITIONS[cKey];
                      return (
                        <div
                          key={`${cKey}-${idx}`}
                          className="flex items-center justify-between p-2 rounded bg-black/30 border border-red-950 text-xs"
                        >
                          <div className="flex gap-2 items-center">
                            <span className="text-xl select-none">{card?.icon}</span>
                            <div>
                              <p className="font-bold text-slate-100">{card?.name}</p>
                              <p className="text-[8.5px] text-zinc-400 leading-none mt-0.5">{card?.effect}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setPendingAttackInfo({ cardIdx: idx, isCustomActiveAttack: false });
                              setBarracksPlayerIdx(null);
                            }}
                            className="bg-red-800 hover:bg-red-500 text-white font-retro text-[8px] py-1 px-2.5 rounded cursor-pointer transition-colors"
                          >
                            出征发布
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Target Selector Dialogue popup */}
      {(() => {
        const isTargetScreenShowing = pendingAttackInfo !== null;
        if (!isTargetScreenShowing) return null;

        const activePlayerIdx = turnOrder[currentTurnIndex]?.playerIdx;
        const pAttacker = players[activePlayerIdx];
        if (!pAttacker) return null;

        return (
          <div
            id="target-select-dialog"
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm bg-[#1e1526] border-2 border-[#ff4d4d] rounded-xl p-5 text-center shadow-2xl relative">
              
              <button
                type="button"
                onClick={() => {
                  setPendingAttackInfo(null);
                }}
                className="absolute top-2.5 right-2 text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>

              <h3 className="font-retro text-[10px] text-white font-bold mb-1 flex items-center gap-1 justify-center">
                <span>🛡️ 指派袭击进攻矛头 🛡️</span>
              </h3>
              <p className="text-[10px] text-zinc-400 mb-4 font-sans leading-tight">
                请挑选本次攻势 (对战或消耗武器卡) 所欲袭卷劫掠的对应敌对城邦国都：
              </p>

              <div className="flex flex-col gap-2">
                {players.map((item, idx) => {
                  if (idx === activePlayerIdx) return null;

                  // Evaluate defense point display
                  let defenseScore = item.defenseItems.reduce((acc, d) => acc + d.currentDefense, 0);
                  item.buildings.forEach((bKey) => {
                    const card = CARD_DEFINITIONS[bKey];
                    if (card && card.defense) {
                      defenseScore += card.defense;
                    }
                  });

                  // Vulnerability flags
                  const isVuln = item.defenseDisabledUntil >= currentRound;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleExecuteAttackToTarget(idx)}
                      className="group p-2.5 rounded-lg border-2 border-slate-800 hover:border-red-500 bg-slate-900/40 text-neutral-100 font-sans font-semibold text-xs transition-all flex justify-between items-center cursor-pointer active:scale-98"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.themeColor }} />
                        <span className="font-retro text-[9px] font-bold text-neutral-200">
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px]" style={{ fontFamily: 'monospace' }}>
                        <span className="text-[#e2b025] font-retro text-[8px]">⭐P: {getPlayerStats(idx).totalProsperity}</span>
                        {isVuln ? (
                          <span className="text-red-500 font-bold bg-red-950 px-1 py-0.2 rounded scale-90">🛡️ 破防归零!</span>
                        ) : (
                          <span className="text-sky-400 font-bold">🛡️ D: {defenseScore} HP</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal: Witch Altar Weather Selection Panel Overlay popup */}
      <div
        id="witch-weather-selector-dialog"
        style={{ display: 'none' }}
        className="fixed inset-0 bg-black/85 z-50 items-center justify-center p-4 justify-center"
      >
        <div className="w-full max-w-sm bg-[#1a0f26] border-2 border-purple-600 rounded-xl p-5 text-center relative shadow-[0_0_20px_purple]">
          
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('witch-weather-selector-dialog');
              if (el) el.style.display = 'none';
            }}
            className="absolute top-2.5 right-2 text-zinc-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>

          <h3 className="font-retro text-[9.5px] text-purple-400 font-bold mb-1.5 flex items-center justify-center gap-1">
            <CloudSun className="w-4 h-4 text-purple-400" />
            <span>巫巫大祭台 · 呼风唤雨</span>
          </h3>
          <p className="text-[10px] text-zinc-300 font-sans mb-4 leading-tight">
            选择仪式呼唤降临对应上空之全局天气 (共耗费当前领地 1点 消耗性护墙：
          </p>

          <div className="flex flex-col gap-1.5">
            {WEATHERS.map((wInfo, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  handleWitchWeatherActivation(wInfo);
                  const el = document.getElementById('witch-weather-selector-dialog');
                  if (el) el.style.display = 'none';
                }}
                className="p-2 border border-purple-950 bg-purple-950/20 hover:bg-purple-900/40 text-left rounded-lg text-xs font-sans text-neutral-100 flex items-center gap-2 cursor-pointer relative overflow-hidden transition-all hover:border-purple-600"
              >
                <span className="text-2xl filter drop-shadow select-none">{wInfo.icon}</span>
                <div>
                  <p className="font-bold text-purple-300 text-[11px] font-retro">{wInfo.name}</p>
                  <p className="text-[8.5px] text-zinc-400 leading-tight pr-2 mt-0.5">{wInfo.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Weather Forecast Details Screen Overlay */}
      <AnimatePresence>
        {showForecastResult && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-xs font-sans p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#faf6eb] border-2 border-[#7a5d1b] rounded-2xl p-5 shadow-2xl max-w-sm w-full relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowForecastResult(false)}
                className="absolute top-3 right-3 text-stone-400 hover:text-[#7a5d1b] font-bold text-sm cursor-pointer"
              >
                ✕
              </button>

              <div className="space-y-4">
                <div className="text-center pb-2.5 border-b border-[#e2d5bd]">
                  <h3 className="text-xs font-retro font-bold text-[#7a5d1b] tracking-wider uppercase flex items-center justify-center gap-1.5">
                    🔮 观星望气台 · 天机神示
                  </h3>
                  <p className="text-[7.5px] text-stone-500 mt-1 font-retro">
                    测算日期: 重天历第 {lastForecastRound} 轮 (本次预演在第 {lastForecastRound + 6} 轮前不可重测)
                  </p>
                </div>

                <div className="text-[10px] space-y-3.5 leading-relaxed text-stone-700">
                  {/* Round N+1 Forecast */}
                  <div className="p-3 bg-white/70 rounded-xl border border-[#e2d5bd] space-y-1">
                    <span className="text-[8.5px] font-retro text-stone-500 font-bold block">
                      🗓️ 完整 1 轮之后 (第 {currentRound + 1} 轮):
                    </span>
                    {(() => {
                      const nextW = weatherOverrideMap[currentRound + 1];
                      if (nextW) {
                        return (
                          <div className="flex items-start gap-2 pt-1">
                            <span className="text-xl">{nextW.icon}</span>
                            <div>
                              <div className="font-bold text-amber-900 border-b border-dashed border-amber-900/20 pb-0.5 text-[9px] flex items-center gap-1">
                                {nextW.name} <span className="text-[7.5px] px-1 bg-red-100 text-red-800 rounded">天灾恶兆</span>
                              </div>
                              <p className="text-[8px] text-stone-500 mt-1 leading-normal">{nextW.desc}</p>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="flex items-start gap-2 pt-1">
                            <span className="text-xl">☀️</span>
                            <div>
                              <div className="font-bold text-emerald-900 border-b border-dashed border-emerald-900/20 pb-0.5 text-[9px] flex items-center gap-1">
                                风调雨顺 (平静期) <span className="text-[7.5px] px-1 bg-emerald-100 text-emerald-800 rounded">安享太平</span>
                              </div>
                              <p className="text-[8px] text-stone-500 mt-1 leading-normal">万里无云，休养生息。各城市可在此平静期放心耕种劳作！</p>
                            </div>
                          </div>
                        );
                      }
                    })()}
                  </div>

                  {/* Round N+2 Forecast */}
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/50 space-y-1 ring-1 ring-amber-500/10">
                    <span className="text-[8.5px] font-retro text-amber-700 font-bold block flex items-center gap-1">
                      🔔 完整 2 轮之后 (第 {currentRound + 2} 轮 - 天数主推演点):
                    </span>
                    {(() => {
                      const futureW = weatherOverrideMap[currentRound + 2];
                      if (futureW) {
                        return (
                          <div className="flex items-start gap-2 pt-1">
                            <span className="text-xl">{futureW.icon}</span>
                            <div>
                              <div className="font-bold text-amber-950 border-b border-dashed border-amber-950/20 pb-0.5 text-[9px] flex items-center gap-1">
                                {futureW.name} <span className="text-[7.5px] px-1 bg-red-100 text-red-800 rounded">天灾恶兆</span>
                              </div>
                              <p className="text-[8px] text-stone-500 mt-1 leading-normal">{futureW.desc}</p>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="flex items-start gap-2 pt-1">
                            <span className="text-xl">☀️</span>
                            <div>
                              <div className="font-bold text-[#7a5d1b] border-b border-dashed border-[#7a5d1b]/20 pb-0.5 text-[9px] flex items-center gap-1">
                                风调雨顺 (平静期) <span className="text-[7.5px] px-1 bg-emerald-100 text-emerald-800 rounded">安享太平</span>
                              </div>
                              <p className="text-[8px] text-stone-500 mt-1 leading-normal">万里无云，休养生息。各城市可尽享生产优势！</p>
                            </div>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#e2d5bd] flex justify-end">
                  <button
                    onClick={() => setShowForecastResult(false)}
                    className="px-3 py-1 bg-[#7a5d1b] hover:bg-[#6c5115] text-white rounded-lg text-[9px] font-retro font-bold shadow-sm tracking-wide cursor-pointer flex items-center gap-1"
                  >
                    <span>知道了 (天机不可泄露)</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Coin Gamble view controller components */}
      <CoinTossView
        isTossing={coinGambleActive}
        result={coinGambleResult}
        onComplete={finishCoinGamble}
      />

      {/* 3. Global Notification Floating alert panels */}
      <div className="fixed bottom-3 right-3 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              layout
              key={toast.id}
              initial={{ x: 100, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 100, opacity: 0, scale: 0.9 }}
              className={`p-3 rounded-lg shadow-xl border flex items-start gap-2 backdrop-blur pointer-events-auto select-none ${
                toast.type === 'suc'
                  ? 'bg-emerald-950/90 border-emerald-800 text-emerald-400'
                  : toast.type === 'war'
                  ? 'bg-red-950/90 border-red-900 text-red-400'
                  : 'bg-indigo-950/90 border-indigo-900 text-indigo-300'
              }`}
            >
              <Bell className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[10px] font-sans font-medium leading-relaxed">
                {toast.msg}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 5. Winner dialogue screen modal and coronation stickman pixel animation */}
      {gameOver && winnerIdx !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4">
          
          {/* Floating Balloons and Ribbons on the sides of the viewport */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {/* Left side column */}
            <div className="absolute left-0 top-0 bottom-0 w-24 md:w-32 flex flex-col justify-around overflow-hidden">
              {[...Array(6)].map((_, i) => {
                const delay = i * 0.7;
                const leftOffset = Math.sin(i) * 15 + 20; // wiggle left and right
                return (
                  <motion.div
                    key={`balloon-l-${i}`}
                    initial={{ y: '100vh', opacity: 0 }}
                    animate={{ y: '-120%', opacity: [0, 1, 1, 0] }}
                    transition={{
                      duration: 9,
                      repeat: Infinity,
                      delay: delay,
                      ease: 'linear'
                    }}
                    style={{ left: `${leftOffset}%` }}
                    className="absolute text-3xl md:text-5xl select-none"
                  >
                    {i % 2 === 0 ? '🎈' : '🎊'}
                  </motion.div>
                );
              })}
              {[...Array(8)].map((_, i) => {
                const colors = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'];
                const delay = i * 0.4;
                const rotateValue = i * 45;
                const leftOffset = 10 + (i * 12) % 30;
                return (
                  <motion.div
                    key={`ribbon-l-${i}`}
                    initial={{ y: '-10vh', opacity: 0, rotate: 0 }}
                    animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: rotateValue + 360 }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      delay: delay,
                      ease: 'linear'
                    }}
                    style={{ left: `${leftOffset}%`, backgroundColor: colors[i % colors.length] }}
                    className="absolute w-2 h-6 md:w-2.5 md:h-8 rounded-sm shrink-0"
                  />
                );
              })}
            </div>

            {/* Right side column */}
            <div className="absolute right-0 top-0 bottom-0 w-24 md:w-32 flex flex-col justify-around overflow-hidden">
              {[...Array(6)].map((_, i) => {
                const delay = i * 0.7 + 0.35;
                const rightOffset = Math.cos(i) * 15 + 20; // wiggle left and right
                return (
                  <motion.div
                    key={`balloon-r-${i}`}
                    initial={{ y: '100vh', opacity: 0 }}
                    animate={{ y: '-120%', opacity: [0, 1, 1, 0] }}
                    transition={{
                      duration: 9,
                      repeat: Infinity,
                      delay: delay,
                      ease: 'linear'
                    }}
                    style={{ right: `${rightOffset}%` }}
                    className="absolute text-3xl md:text-5xl select-none"
                  >
                    {i % 2 === 0 ? '🎊' : '🎈'}
                  </motion.div>
                );
              })}
              {[...Array(8)].map((_, i) => {
                const colors = ['#ec4899', '#f59e0b', '#3b82f6', '#10b981', '#ef4444'];
                const delay = i * 0.4 + 0.2;
                const rotateValue = i * -45;
                const rightOffset = 10 + (i * 12) % 30;
                return (
                  <motion.div
                    key={`ribbon-r-${i}`}
                    initial={{ y: '-10vh', opacity: 0, rotate: 0 }}
                    animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: rotateValue - 360 }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      delay: delay,
                      ease: 'linear'
                    }}
                    style={{ right: `${rightOffset}%`, backgroundColor: colors[i % colors.length] }}
                    className="absolute w-2 h-6 md:w-2.5 md:h-8 rounded-sm shrink-0"
                  />
                );
              })}
            </div>
          </div>

          <div className="text-center bg-[#fdfbf7] border-4 border-[#7a5d1b] p-8 rounded-2xl max-w-md w-full shadow-[0_12px_45px_rgba(46,31,18,0.4)] relative z-30 text-stone-800">
            
            {/* Triumphant Water, Fire, Emerald, and Gold Pixel Stickman SVGA Animation with Clapping Royalty */}
            <div className="mb-4">
              <svg viewBox="0 0 100 100" className="w-36 h-36 mx-auto bg-black/40 border-2 border-[#caa43c] rounded-xl overflow-hidden relative shadow-lg">
                {/* Pixel Grid Layout */}
                <defs>
                  <pattern id="pixel-grid-cov" width="4" height="4" patternUnits="userSpaceOnUse">
                    <rect width="4" height="4" fill="none" stroke="#252528" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="#141416" />
                <rect width="100" height="100" fill="url(#pixel-grid-cov)" />
                
                {/* Water and Fire background sparks */}
                <g className="animate-pulse">
                  {/* Fire pixels (Orange/Red) */}
                  <rect x="36" y="24" width="3" height="3" fill="#f97316" />
                  <rect x="26" y="16" width="3" height="3" fill="#ef4444" />
                  <rect x="12" y="18" width="3" height="3" fill="#ef4444" />
                  {/* Water pixels (Blue/Cyan) */}
                  <rect x="62" y="24" width="3" height="3" fill="#3b82f6" />
                  <rect x="70" y="16" width="3" height="3" fill="#06b6d4" />
                  <rect x="85" y="18" width="3" height="3" fill="#0ea5e9" />
                </g>

                {/* Left Side Clapping King */}
                <g>
                  <image href={kingImage} x="4" y="44" width="30" height="40" preserveAspectRatio="xMidYMidSlice" />
                  {/* Floating Clapping Indicator */}
                  <g className="animate-[bounce_0.5s_infinite_alternate]">
                    <text x="19" y="38" fontSize="9" textAnchor="middle">👏</text>
                  </g>
                </g>

                {/* Right Side Clapping Queen */}
                <g>
                  <image href={queenImage} x="66" y="44" width="30" height="40" preserveAspectRatio="xMidYMidSlice" />
                  {/* Floating Clapping Indicator */}
                  <g className="animate-[bounce_0.5s_infinite_alternate_reverse]">
                    <text x="81" y="38" fontSize="9" textAnchor="middle">👏</text>
                  </g>
                </g>

                {/* White Stickman */}
                <g>
                  {/* Head */}
                  <rect x="46" y="44" width="8" height="8" fill="#ffffff" />
                  {/* Torso */}
                  <rect x="49" y="52" width="2" height="14" fill="#ffffff" />
                  {/* Spire Arms */}
                  <rect x="43" y="55" width="14" height="2" fill="#ffffff" />
                  {/* Left Leg */}
                  <rect x="46" y="66" width="2" height="12" fill="#ffffff" />
                  <rect x="43" y="78" width="5" height="2" fill="#ffffff" />
                  {/* Right Leg */}
                  <rect x="52" y="66" width="2" height="12" fill="#ffffff" />
                  <rect x="52" y="78" width="5" height="2" fill="#ffffff" />
                </g>
                
                {/* Coronation bouncing Emerald-Gold and Water-Fire Crown */}
                <g className="animate-[bounce_1.4s_infinite]">
                  {/* Gold platform base */}
                  <rect x="36" y="36" width="28" height="4" fill="#caa43c" />
                  
                  {/* Emerald inlaid gems */}
                  <rect x="42" y="37" width="4" height="2" fill="#10b981" />
                  <rect x="54" y="37" width="4" height="2" fill="#10b981" />
                  
                  {/* Left crown peak: Fire element (Red/Orange) */}
                  <rect x="38" y="32" width="4" height="4" fill="#caa43c" />
                  <rect x="38" y="28" width="4" height="4" fill="#ef4444" />
                  
                  {/* Center crown peak: Pure Emerald green */}
                  <rect x="48" y="30" width="4" height="6" fill="#caa43c" />
                  <rect x="48" y="24" width="4" height="6" fill="#10b981" />
                  
                  {/* Right crown peak: Water element (Blue) */}
                  <rect x="58" y="32" width="4" height="4" fill="#caa43c" />
                  <rect x="58" y="28" width="4" height="4" fill="#3b82f6" />
                </g>
              </svg>
            </div>

            <h2 className="font-retro text-[#7a5d1b] text-xs font-black mb-3 select-none">
              🏆 绝代城邦霸主加冕之巅 🏆
            </h2>

            <div className="inline-block p-4 bg-[#f8f5eb] border-2 border-[#7a5d1b]/40 rounded-xl my-4 text-center">
              <span
                className="w-4 h-4 rounded-full inline-block mr-1.5 align-middle shadow-inner animate-pulse"
                style={{ backgroundColor: players[winnerIdx]?.themeColor }}
              />
              <span className="font-retro text-xs text-stone-800 font-bold align-middle">
                {players[winnerIdx]?.name}
              </span>
              <p className="text-stone-600 text-[10px] font-sans mt-3">
                斩获超凡繁荣上限： ⭐ <b>{getPlayerStats(winnerIdx).totalProsperity} 点</b>
              </p>
            </div>

            <p className="text-stone-500 text-[10px] leading-relaxed mb-6 font-sans">
              在一波波大日金雨、暴雪寒霜天气变幻及弩阵刀光洗劫过后，您力压群雄，成功戴上神罗翡翠水火王冠！
            </p>

            <button
              onClick={() => setGameStarted(false)}
              className="py-2.5 px-8 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 text-slate-950 font-retro text-[10px] font-black tracking-widest border-[#7a5d1b] border-b-4 hover:brightness-110 active:translate-y-1 block mx-auto cursor-pointer"
            >
              ◀ 卸甲荣归主界面
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
