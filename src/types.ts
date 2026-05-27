/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CardType = 'build' | 'military' | 'dev' | 'defense' | 'resource';

export interface Card {
  id: string;
  name: string;
  icon: string;
  type: CardType;
  costGold: number;
  costStone: number;
  costWood: number;
  effect: string;
  prosperity?: number;
  income?: {
    gold?: number;
    stone?: number;
    wood?: number;
  };
  unlocksAttack?: boolean;
  unlocksIronWall?: boolean;
  unlocksSiege?: boolean;
  defense?: number;
  defensePoints?: number;
  attackPower?: number;
  catapult?: boolean;
  siege?: boolean;
  isFragment?: boolean;
  fragmentType?: 'weather' | 'prosperity' | 'war' | 'guardian';
  fragmentNeed?: number;
  isGamble?: boolean;
  isRandomResource?: boolean;
  freeRefreshes?: number;
  bonus?: {
    gold?: number;
    stone?: number;
    wood?: number;
  };
  requiresBarracks?: boolean;
  requiresBlacksmith?: boolean;
  requiresTemple?: boolean;
  requiresAcademy?: boolean;
}

export interface Weather {
  name: string;
  icon: string;
  desc: string;
  incomeBonusGold?: number;
  incomeBonusStone?: number;
  defenseHalve?: boolean;
  hideMilitary?: boolean;
  hideResources?: boolean;
  incomeHalve?: boolean;
  color: string;
}

export interface Player {
  id: number;
  name: string;
  colorName: string;
  themeColor: string; // HEX or tailwind class
  gold: number;
  stone: number;
  wood: number;
  buildings: string[]; // keys of card definitions
  defenseItems: { key: string; currentDefense: number }[];
  attackCards: string[]; // keys in possession
  fragments: { type: 'weather' | 'prosperity' }[];
  attackCount: number; // current round attack count
  witchCooldown: number;
  disabledBuildings: { key: string; untilRound: number }[];
  defenseDisabledUntil: number; // round index
  refreshCost: number;
  freeRefreshes: number;
  academyCooldown: number;
  isAI: boolean;
  foggedByPlayerIdx?: number;
  warProsperity?: number;
  tradeProsperity?: number;
  guardianSpellRemainingRounds?: number;
  currentBuildingDefense?: number;
  buildingDefenseDamageTakers?: { roundDamaged: number; amount: number }[];
  tradeRouteCargo?: { stone: number; wood: number; proposedToIdx: number } | null;
  tradedWithCityIndices?: number[];
  tradeCargoStone?: number;
  tradeCargoWood?: number;
  tradeGoldSwappedThisTurn?: number;
  tradeTargetIdxThisTurn?: number | null;
}

export interface TurnOrder {
  playerIdx: number;
  dice: number;
}

export interface ControlledWeather {
  type: 'witch' | 'fragment';
  weather: Weather;
  remaining: number;
  ownerIdx: number;
}
