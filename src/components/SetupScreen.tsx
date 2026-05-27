/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Gamepad2, Play, HelpCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import kingImage from '../assets/images/king_pixel_1779844440623.png';
import queenImage from '../assets/images/queen_pixel_1779844461629.png';

interface SetupScreenProps {
  onStartGame: (targetProps: number, isAIFlags: boolean[]) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame }) => {
  const [targetProsperity, setTargetProsperity] = useState<number>(15);
  const [cityCount, setCityCount] = useState<number>(4); // Range: 3 to 5
  const [showRules, setShowRules] = useState<boolean>(false);

  const handleStart = () => {
    if (targetProsperity < 5 || targetProsperity > 50) {
      alert('请输入合理的繁荣度边界：5至50点！');
      return;
    }
    const isAIFlags = new Array(cityCount).fill(false);
    onStartGame(targetProsperity, isAIFlags);
  };

  const getCityNames = (count: number) => {
    if (count === 3) return ['日耀城', '月辉城', '星闪城'];
    if (count === 5) return ['金利城', '木荣城', '水流城', '火爆城', '土厚城'];
    return ['黄金城', '翡翠城', '珍珠城', '钻石城']; // For 4 cities
  };

  const getCityBadges = (count: number) => {
    if (count === 3) {
      return [
        { name: '日耀城 ☀️', color: '#f59e0b', desc: '金光万丈，骄日普照' },
        { name: '月辉城 🌙', color: '#94a3b8', desc: '银芒洒落，碧影清波' },
        { name: '星闪城 ✨', color: '#a855f7', desc: '紫落天元，繁星灿烂' },
      ];
    }
    if (count === 5) {
      return [
        { name: '金利城 🪙', color: '#eab308', desc: '庚金利刃，金玉满堂' },
        { name: '木荣城 🌲', color: '#22c55e', desc: '建木成荫，欣欣向荣' },
        { name: '水流城 💧', color: '#06b6d4', desc: '流水长川，奔流不息' },
        { name: '火爆城 🔥', color: '#ef4444', desc: '烈火燎原，爆裂炽热' },
        { name: '土厚城 🪨', color: '#854d0e', desc: '厚德载物，安若泰山' },
      ];
    }
    return [
      { name: '黄金城 🪙', color: '#ca8a04', desc: '富贵崇金之勋' },
      { name: '翡翠城 🌲', color: '#10b981', desc: '仙幽翠绿之辉' },
      { name: '珍珠城 🦪', color: '#2dd4bf', desc: '温润沧海之珍' },
      { name: '钻石城 💎', color: '#60a5fa', desc: '璀璨极寒之精' },
    ];
  };

  const activeBadges = getCityBadges(cityCount);

  return (
    <div className="fixed inset-0 bg-[#f6efe2] flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_center,rgba(230,218,184,0.35),transparent)] overflow-y-auto z-[60] select-none">
      
      {/* Left Column: King Illustration Panel */}
      <div 
        className="fixed left-0 top-0 bottom-0 w-[240px] xl:w-[325px] hidden lg:flex flex-col border-r-4 border-[#7a5d1b] bg-[#1e1510] shadow-2xl overflow-hidden z-10 select-none animate-fade-in"
        id="menu-illustration-left"
      >
        <div className="absolute inset-0 bg-cover bg-center opacity-90 hover:scale-105 transition-all duration-700 ease-out" style={{ backgroundImage: `url(${kingImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40 pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6 text-center border-t border-[#7a5d1b]/20">
          <h4 className="font-retro text-xs text-amber-500 font-extrabold tracking-widest mb-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            👑 黄金大帝 · 塞迪尔二世
          </h4>
          <p className="text-[9px] text-[#ebdcc3]/70 font-sans tracking-tight leading-relaxed italic drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            "日月星辰尽批我身。尔等逆臣，迎接帝国的宣战吧！"
          </p>
        </div>
      </div>

      {/* Right Column: Queen Illustration Panel */}
      <div 
        className="fixed right-0 top-0 bottom-0 w-[240px] xl:w-[325px] hidden lg:flex flex-col border-l-4 border-[#7a5d1b] bg-[#0c1410] shadow-2xl overflow-hidden z-10 select-none animate-fade-in"
        id="menu-illustration-right"
      >
        <div className="absolute inset-0 bg-cover bg-center opacity-90 hover:scale-105 transition-all duration-700 ease-out" style={{ backgroundImage: `url(${queenImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/40 pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6 text-center border-t border-[#7a5d1b]/20">
          <h4 className="font-retro text-xs text-emerald-400 font-extrabold tracking-widest mb-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            🌲 翡翠法皇 · 芙蕾雅女王
          </h4>
          <p className="text-[9px] text-[#ace5d4]/70 font-sans tracking-tight leading-relaxed italic drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            "五行轮转，珍珠映霜。巫鸣起处，狂风扫尽傲慢之尘！"
          </p>
        </div>
      </div>

      {/* Central Configuration Form */}
      <div className="w-full max-w-xl bg-[#fdfbf7] border-4 border-[#7a5d1b] rounded-2xl shadow-[0_12px_55px_rgba(46,31,18,0.45)] relative p-6 md:p-8 shrink-0 my-8 z-20">
        
        {/* Corner Accents */}
        <div className="absolute top-2.5 left-2.5 text-[#7a5d1b] font-retro text-[10px] select-none pointer-events-none">🛡️</div>
        <div className="absolute top-2.5 right-2.5 text-[#7a5d1b] font-retro text-[10px] select-none pointer-events-none">🛡️</div>
        <div className="absolute bottom-2.5 left-2.5 text-[#7a5d1b] font-retro text-[10px] select-none pointer-events-none">🛡️</div>
        <div className="absolute bottom-2.5 right-2.5 text-[#7a5d1b] font-retro text-[10px] select-none pointer-events-none">🛡️</div>

        {/* Header Title */}
        <div className="text-center mb-6">
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl md:text-3xl font-retro text-[#7a5d1b] font-black tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
          >
            城 邦 争 霸
          </motion.h1>
          <div className="h-0.5 w-1/3 bg-gradient-to-r from-transparent via-[#7a5d1b] to-transparent mx-auto my-2" />
          <p className="text-xs text-stone-600 font-sans tracking-wide mt-1 font-medium">
            🏰 纯粹而古典的奇幻城邦建造对局 🏰
          </p>
        </div>

        {/* 1. Target Score Setting */}
        <div className="bg-[#f7f3e8] border border-[#e2d5bd] rounded-xl p-4 mb-4">
          <h3 className="text-xs font-retro text-[#7a5d1b] mb-2.5 flex items-center gap-1.5 font-bold">
            <Sparkles className="w-4 h-4 text-amber-600" />
            竞逐大目标 (繁荣上限)
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <span className="text-[11px] text-stone-600 font-sans pr-2 leading-relaxed">
              率先达成指定繁荣度（⭐）的城主，将夺取本界至尊胜利冠冕。
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTargetProsperity(Math.max(5, targetProsperity - 5))}
                className="w-8 h-8 rounded-lg bg-stone-200 hover:bg-stone-300 border border-stone-400 text-[#7a5d1b] font-bold transition-colors cursor-pointer select-none"
              >
                -
              </button>
              <input
                type="number"
                min="5"
                max="50"
                value={targetProsperity}
                onChange={(e) => setTargetProsperity(Math.min(50, Math.max(5, parseInt(e.target.value) || 15)))}
                className="w-16 h-8 rounded-lg bg-white border-2 border-[#7a5d1b] font-retro text-center text-[#7a5d1b] font-bold text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setTargetProsperity(Math.min(50, targetProsperity + 5))}
                className="w-8 h-8 rounded-lg bg-stone-200 hover:bg-stone-300 border border-stone-400 text-[#7a5d1b] font-bold transition-colors cursor-pointer select-none"
              >
                +
              </button>
            </div>
          </div>
          <div className="text-[9px] text-stone-500 mt-2 text-right">
            (快速局：10点 &bull; 经典局：15点-20点 &bull; 长线博弈：30-40点)
          </div>
        </div>

        {/* 2. Dynamic City Count Setting Component */}
        <div className="bg-[#f7f3e8] border border-[#e2d5bd] rounded-xl p-4 mb-5">
          <h3 className="text-xs font-retro text-[#7a5d1b] mb-2 flex items-center gap-1.5 font-bold">
            <Gamepad2 className="w-4 h-4 text-emerald-700" />
            开启城池数量选取
          </h3>
          <p className="text-[10px] text-stone-500 font-sans mb-3 leading-relaxed">
            最少 <b>3</b> 个城市，最多 <b>5</b> 个城市。
          </p>

          {/* Button selector for 3, 4, 5 */}
          <div className="flex gap-2 justify-center mb-4">
            {[3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setCityCount(num)}
                className={`py-2 px-5 rounded-xl text-xs font-retro border-2 transition-all cursor-pointer ${
                  cityCount === num
                    ? 'bg-[#7a5d1b] border-[#44310d] text-white shadow-md'
                    : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {num} 个城邦
              </button>
            ))}
          </div>

          {/* Visual Badges Indicator */}
          <div className="bg-white border border-stone-200 rounded-lg p-3">
            <p className="text-[9.5px] font-retro text-zinc-500 mb-2 border-b border-dashed border-stone-100 pb-1.5 font-bold">
              👑 即将入驻的城邦代表及名字个性风格：
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {activeBadges.map((badge, bIdx) => (
                <div
                  key={bIdx}
                  className="p-2 rounded-lg border flex flex-col justify-center items-center text-center shadow-xs"
                  style={{ borderColor: badge.color + '40', backgroundColor: badge.color + '0a' }}
                >
                  <span className="text-[10px] font-bold font-retro text-stone-800" style={{ color: badge.color === '#94a3b8' ? '#475569' : badge.color }}>
                    {badge.name}
                  </span>
                  <span className="text-[8.5px] text-stone-500 font-sans mt-1">
                    {badge.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Button Options */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <button
            type="button"
            onClick={() => setShowRules(!showRules)}
            className="w-full sm:w-auto flex-1 font-sans font-bold py-3 px-4 bg-[#fbf5eb] hover:bg-[#ebdcc3] text-stone-700 rounded-xl border border-stone-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
          >
            <HelpCircle className="w-4 h-4 text-[#7a5d1b]" />
            <span>阅读规则圣典</span>
          </button>

          <button
            type="button"
            onClick={handleStart}
            className="w-full sm:w-auto flex-[1.4] font-retro text-[10.5px] font-black py-3 px-6 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5 border-b-4 border-amber-900 cursor-pointer animate-pulse"
          >
            <Play className="w-3.5 h-3.5 fill-white text-white" />
            <span>吹响号角 · 热血开战</span>
          </button>
        </div>

        {/* Rules Collapse Panel */}
        {showRules && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 bg-[#f8f6f0] border-2 border-[#7a5d1b]/40 rounded-xl p-4 text-stone-800 font-sans text-xs leading-relaxed max-h-[300px] overflow-y-auto"
          >
            <h4 className="font-retro text-[11px] text-[#7a5d1b] mb-3 font-black flex items-center gap-1.5 border-b border-dashed border-[#7a5d1b]/20 pb-1.5">
              📜 细则宝典汇总 (规则圣典最新版)
            </h4>
            <div className="space-y-4">
              <div>
                <p className="font-bold text-amber-900 text-[10.5px]">🎲 行动权顺位机制</p>
                <p className="text-stone-600 text-[10px]">
                  智夺轮次先声夺人：每回合开始时，各城邦自动掷 20 面大骰。数大者豪夺首发权，平局依微调逻辑进行顺位安排，各领主依序顺位交替筹划政务！
                </p>
              </div>
              <div>
                <p className="font-bold text-amber-900 text-[10.5px]">🌾 城赋产出与兵营加成</p>
                <p className="text-stone-600 text-[10px]">
                  兵马未动粮草先行：城邦初始在无任何产量建筑时，每回合保底自产 3 块基础金币。建造<b>首座兵营</b>将激活军事吉袭、掠夺类卡片使用特权；而营建<b>第二座或更多兵营</b>时，每座多余兵营均将永久增加 1 个点数的最终战争掠获物资保底收入。
                </p>
              </div>
              <div>
                <p className="font-bold text-red-700 text-[10.5px]">⚔️ 军事战备与攻击突夺</p>
                <p className="text-stone-600 text-[10px]">
                  兵锋耀世，强攻大掠：<b>突袭卡</b>可随机抄到敌城 3 份木石资源；<b>掠夺卡</b>更进一步，能指定直接任意挑选敌城 5 份特定物资进库。
                </p>
              </div>
              <div>
                <p className="font-bold text-emerald-700 text-[10.5px]">🐫 贸易线路与行商背包</p>
                <p className="text-stone-600 text-[10px]">
                  万里无疆，倾商天下：游戏伊始<b>所有城市均已默认获得自由行商旅行背包</b>。玩家随时可无损存入或起出仓库的石料和木质资源。一旦自省建造出<b>【贸易集市】</b>建筑，背包中的<b>强制吞币交易按钮将永久解锁</b>：您可以打包背包里的原木或精石，以 <b>3:1</b> 兑换比率直接向任意指定的敌国强行榨取兑现其国库金币！每次成交不仅帮您套出金硬币，更额外攫获 <b>1点【城市繁荣度】</b>。每大回合最多强换套现 <b>15枚金币</b>。
                </p>
              </div>
              <div>
                <p className="font-bold text-zinc-700 text-[10.5px]">🧱 相同建筑涨价规则</p>
                <p className="text-stone-600 text-[10px]">
                  城邦筑建消耗递升：购买相同的建筑卡，累计买造过 <b>2次</b> 后，后续每次营建所需耗费的所有门类资源<b>均永久上涨 1 点</b>；购买过 <b>4次</b> 后<b>再上涨 2 点</b>，以此类推。军事、防御物、技能残片卡不受此通膨膨胀规则限制。
                </p>
              </div>
              <div>
                <p className="font-bold text-teal-700 text-[10.5px]">⛲ 许愿神井至臻奇迹</p>
                <p className="text-stone-600 text-[10px]">
                  神圣地标，福泽万祀：提供巨大 +5 贸易繁荣度。该奇观持有城邦<b>将恒久豁免并免疫世间所有极端负面天候灾难的产能侵害</b>，且额外强制为您在自选卡市多展示 1 枚特等高级物资契约！
                </p>
              </div>
              <div>
                <p className="font-bold text-yellow-600 text-[10.5px]">☀️ 天界气候星宿变迁</p>
                <p className="text-stone-600 text-[10px]">
                  天意难测，宿命轮转：<br />
                  &bull; <b>大晴天</b>：金色和煦。所有城邦的生产建筑在回合大结算时，<b>其额外产能额外增加 +1 份物资！</b><br />
                  &bull; <b>旱灾天气</b>：🔥 赤地万里。<b>全图所有建筑物产量直接遭遇折半折损，单数个向下取整</b>，维生维困！<br />
                  &bull; <b>暴风雪天</b>：极寒之劫。所有城邦下层产出对半折算，但单数个会<b>向上取进</b>。<br />
                  &bull; <b>雨天</b>：泥泞打滑。各都城的所有城防护垒、防御物防御效果遭遇折半削弱。<br />
                  &bull; <b>台风天</b>：海港关闭。自选集市市场强制禁绝上架、更新或贩售红色的军事、攻袭类卡牌。<br />
                  &bull; <b>阴天/沙尘</b>：塞外阴晦，看不见别国的富庶虚实，外交迷雾浓烈。
                </p>
              </div>
              <div>
                <p className="font-bold text-purple-750 text-[10.5px]">🪄 远古晶能巫术大祭祠</p>
                <p className="text-stone-600 text-[10px]">
                  晶魔共鸣神降法界：在自选集市收集满 2 枚同样魔能残片，得手时瞬间共振并在局内发起超级魔法：<br />
                  &bull; <b>天象气象碎片（天蓝）</b>：2 碎即可暴走强制置换天空大气，改写未来 3 回合流转天象为极端阵列天候之一。<br />
                  &bull; <b>神罗丰登碎片（明黄色）</b>：2 碎即可在城中引爆生命元气，全部运转中的非瘫痪产量建筑立刻额外瞬时收获一轮！<br />
                  &bull; <b>狂澜烈焰战争（深红色）</b>：2 碎召唤深渊掠夺军战巫，<b>立马对全海域其他所有邻邦国都发起一次高达 5 点巨大毁伤力度的末世总掠夺奇袭</b>！<br />
                  &bull; <b>金盾神迹守护（浅绿色）</b>：2 碎神罩附体护庇城墙，<b>都城所有护甲盾防值瞬间超额翻倍并屹立 2 个大轮次</b>永不损磨！
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
