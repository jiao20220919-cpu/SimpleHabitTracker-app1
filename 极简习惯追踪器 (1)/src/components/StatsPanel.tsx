/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Flame, CheckCircle, Percent, Trophy } from 'lucide-react';
import { Habit, HabitCategory } from '../types';
import { calculateStreaks, getLocalDateString } from '../utils';

import { Language, translations } from '../locales';

interface StatsPanelProps {
  habits: Habit[];
  lang: Language;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ habits, lang }) => {
  const t = translations[lang];
  const activeHabits = habits.filter(h => !h.archived);
  const totalActive = activeHabits.length;
  const todayStr = getLocalDateString();
  
  const completedToday = activeHabits.filter(h => h.completedDates.includes(todayStr)).length;
  const completionRate = totalActive > 0 ? Math.round((completedToday / totalActive) * 100) : 0;

  // Calculate highest current streak and total active habit streak days
  let highestStreak = 0;
  let totalCheckins = 0;

  activeHabits.forEach(h => {
    const { currentStreak } = calculateStreaks(h.completedDates);
    if (currentStreak > highestStreak) {
      highestStreak = currentStreak;
    }
    totalCheckins += h.completedDates.length;
  });

  const categories: { id: HabitCategory; label: string; rawLabel: string; color: string }[] = [
    { id: 'health', label: `🏥 ${t.filterHealth}`, rawLabel: t.filterHealth, color: 'bg-indigo-500 dark:bg-indigo-400' },
    { id: 'sport', label: `💪 ${t.filterSport}`, rawLabel: t.filterSport, color: 'bg-emerald-500 dark:bg-emerald-400' },
    { id: 'mind', label: `🧘 ${t.filterMind}`, rawLabel: t.filterMind, color: 'bg-amber-500 dark:bg-amber-400' },
    { id: 'work', label: `💼 ${t.filterWork}`, rawLabel: t.filterWork, color: 'bg-rose-500 dark:bg-rose-450' },
    { id: 'custom', label: `✨ ${t.filterCustom}`, rawLabel: t.filterCustom, color: 'bg-violet-500 dark:bg-violet-400' },
  ];

  const categoryStats = categories.map(cat => {
    const catHabits = activeHabits.filter(h => h.category === cat.id);
    const count = catHabits.length;
    let rate = 0;
    if (count > 0) {
      const totalRate = catHabits.reduce((acc, h) => {
        const hRate = Math.min(100, Math.round((h.completedDates.length / 30) * 100));
        return acc + hRate;
      }, 0);
      rate = Math.round(totalRate / count);
    }
    return { ...cat, count, rate };
  });

  // Calculate annual contribution heatmap data (53 weeks * 7 days = 371 days)
  const today = new Date();
  const startOfGrid = new Date(today);
  // Go back 52 weeks (364 days)
  startOfGrid.setDate(today.getDate() - 364);
  const startDayOfWeek = startOfGrid.getDay(); // 0 is Sunday
  // Align to Sunday of that start week
  startOfGrid.setDate(startOfGrid.getDate() - startDayOfWeek);

  const gridDays: { dateString: string; count: number; label: string }[] = [];
  const tempDate = new Date(startOfGrid);

  for (let i = 0; i < 371; i++) {
    const dateStr = getLocalDateString(tempDate);
    let completedCount = 0;
    activeHabits.forEach(h => {
      if (h.completedDates.includes(dateStr)) {
        completedCount++;
      }
    });

    let formattedLabel = '';
    if (lang === 'zh') {
      formattedLabel = `${tempDate.getFullYear()}年${tempDate.getMonth() + 1}月${tempDate.getDate()}日`;
    } else if (lang === 'ja') {
      formattedLabel = `${tempDate.getFullYear()}年${tempDate.getMonth() + 1}月${tempDate.getDate()}日`;
    } else {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      formattedLabel = `${months[tempDate.getMonth()]} ${tempDate.getDate()}, ${tempDate.getFullYear()}`;
    }
    const label = lang === 'zh' 
      ? `${formattedLabel} · 打卡 ${completedCount} 项习惯` 
      : lang === 'ja' 
        ? `${formattedLabel} · ${completedCount}個の習慣を記録` 
        : `${formattedLabel} · Completed ${completedCount} habits`;

    gridDays.push({
      dateString: dateStr,
      count: completedCount,
      label,
    });

    tempDate.setDate(tempDate.getDate() + 1);
  }

  // Get intensity color scale
  const getIntensityColor = (count: number) => {
    if (count === 0) return 'bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/20';
    if (totalActive === 0) return 'bg-emerald-400';
    const ratio = count / totalActive;
    if (ratio <= 0.25) return 'bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200/10';
    if (ratio <= 0.5) return 'bg-emerald-300 dark:bg-emerald-800/40';
    if (ratio <= 0.75) return 'bg-emerald-500 dark:bg-emerald-600/70';
    return 'bg-emerald-600 dark:bg-emerald-400';
  };

  // Radar layout configuration
  // 5 categories: health, sport, mind, work, custom
  const numSides = 5;
  const radius = 55;
  const cx = 110;
  const cy = 100;
  
  // Helper to compute (x, y) for an index and scale factor
  const getCoordinates = (idx: number, valPercent: number) => {
    // Offset by -Math.PI / 2 to start straight up
    const angle = (idx * 2 * Math.PI) / numSides - Math.PI / 2;
    // Cap at maximum of 100% and min of 10% for layout safety
    const safePercent = Math.max(10, Math.min(100, valPercent));
    const r = radius * (safePercent / 100);
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  // Generate customized warm self-discipline insights with emojis
  const generateInsights = () => {
    if (activeHabits.length === 0) {
      return t.noHabitsInsight;
    }
    
    // Sort categoryStats by rate
    const statsWithCount = categoryStats.filter(s => s.count > 0);
    if (statsWithCount.length === 0) {
      return t.noCheckinsInsight;
    }
    
    const sortedStats = [...statsWithCount].sort((a, b) => b.rate - a.rate);
    const best = sortedStats[0];
    const needsImprovement = sortedStats[sortedStats.length - 1];
    
    let parts = [];
    
    // Warm custom wisdom messages
    if (best.rate >= 80) {
      parts.push(t.insightExpert.replace('{category}', best.rawLabel).replace('{rate}', String(best.rate)));
    } else if (best.rate > 45) {
      parts.push(t.insightProgressing.replace('{category}', best.rawLabel));
    } else {
      parts.push(t.insightNewbie.replace('{category}', best.rawLabel));
    }
    
    if (needsImprovement && needsImprovement.id !== best.id && needsImprovement.rate < 40) {
      parts.push(t.insightImprovement.replace('{category}', needsImprovement.rawLabel).replace('{rate}', String(needsImprovement.rate)));
    } else if (statsWithCount.length < 4) {
      parts.push(t.insightExpandGrid);
    } else {
      parts.push(t.insightGoldenRule);
    }
    
    return parts.join('\n\n');
  };

  const fillPoints = categoryStats
    .map((stat, i) => {
      const val = stat.count > 0 ? stat.rate : 12;
      const { x, y } = getCoordinates(i, val);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-4" id="stats-panel-wrapper">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" id="stats-panel">
        {/* Metric 1: Today's Completion Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-4 rounded-2xl border border-zinc-150 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900"
          id="stat-today-completion"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
              {lang === 'zh' ? '今日打卡进度' : lang === 'ja' ? '今日の進捗' : "Today's Progress"}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <h4 className="text-2xl font-bold font-mono text-zinc-800 dark:text-zinc-100">{completedToday}</h4>
              <span className="text-sm font-semibold text-zinc-400">
                {lang === 'zh' ? `/ ${totalActive} 个习惯` : lang === 'ja' ? `/ ${totalActive} 個の習慣` : `/ ${totalActive} habits`}
              </span>
            </div>
            {/* Micro Progress Bar */}
            <div className="mt-2.5 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-indigo-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Metric 2: Streak Level */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 rounded-2xl border border-zinc-150 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900"
          id="stat-highest-streak"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-950/30 dark:text-amber-400">
            <Flame className="h-6 w-6 fill-current" />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">{t.currentStreak}</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <h4 className="text-2xl font-bold font-mono text-zinc-800 dark:text-zinc-100">{highestStreak}</h4>
              <span className="text-sm font-semibold text-zinc-400">
                {lang === 'zh' ? '天' : lang === 'ja' ? '日' : 'days'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              {lang === 'zh' ? '持续坚守，星光不问赶路人' : lang === 'ja' ? '星光は道を急ぐ人に問いません' : 'Small inputs shape grand futures'}
            </p>
          </div>
        </motion.div>

        {/* Metric 3: Total Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-4 rounded-2xl border border-zinc-150 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900"
          id="stat-total-checkins"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">{t.totalCheckins}</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <h4 className="text-2xl font-bold font-mono text-zinc-800 dark:text-zinc-100">{totalCheckins}</h4>
              <span className="text-sm font-semibold text-zinc-400">
                {lang === 'zh' ? '次' : lang === 'ja' ? '回' : 'times'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              {lang === 'zh' ? '点滴积累，见证更好的自己' : lang === 'ja' ? '一歩一歩が美しい成長を描く' : 'Every solid step designs a better future'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bento Smart Insights Charts & Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl border border-zinc-150 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900"
        id="category-stats-breakdown"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Left Column: List stats & Warm speech insights (7/12) */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {lang === 'zh' ? '🧬 多维度自律指标 (30天均值)' : lang === 'ja' ? '🧬 多次元の自己成長指標（30日間平均）' : '🧬 Multi-Dimensional Indicators (30d average)'}
                </h5>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">{t.radarDescription}</span>
              </div>

              {/* Progress bars list */}
              <div className="space-y-3.5">
                {categoryStats.map((stat) => (
                  <div key={stat.id} className="space-y-1.5" id={`category-stat-${stat.id}`}>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-zinc-750 dark:text-zinc-300 flex items-center gap-1">
                        {stat.label}
                        <span className="text-[10px] font-normal text-zinc-400 dark:text-zinc-500">
                          {lang === 'zh' ? `(${stat.count}项)` : lang === 'ja' ? `(${stat.count}件)` : `(${stat.count} goals)`}
                        </span>
                      </span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200">{stat.rate}%</span>
                    </div>
                    
                    <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.rate}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${stat.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warm Intelligent Behavior Insights card/bubble */}
            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/60 p-4.5 space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">✨</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{t.insightsTitle}</span>
              </div>
              <p className="text-xs text-zinc-650 dark:text-zinc-450 leading-relaxed whitespace-pre-line">
                {generateInsights().split('\n\n').map((para, i) => {
                  // Direct HTML rendering support for bold texts
                  const isBold = para.includes('**');
                  const renderedText = para.replace(/\*\*(.*?)\*\*/g, '$1');
                  return (
                    <span key={i} className="block mt-1.5 first:mt-0 font-medium">
                      {renderedText}
                    </span>
                  );
                })}
              </p>
            </div>
          </div>

          {/* Right Column: Visual custom SVG Radar Chart pentagon (5/12) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800/80 pt-6 md:pt-0 md:pl-6">
            <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mb-3 block text-center uppercase tracking-wider">
              🕸️ {t.radarTitle}
            </span>

            <div className="relative w-[220px] h-[200px] flex items-center justify-center">
              <svg width="220" height="200" className="overflow-visible">
                {/* Background Concentric pentagons */}
                {gridLevels.map((level) => {
                  const points = Array.from({ length: numSides })
                    .map((_, i) => {
                      const { x, y } = getCoordinates(i, level * 100);
                      return `${x},${y}`;
                    })
                    .join(' ');
                  return (
                    <polygon
                      key={level}
                      points={points}
                      className="fill-none stroke-zinc-150 dark:stroke-zinc-800"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Concentric grid percentage indicators (optional but premium) */}
                <text x={cx} y={cy - radius * 1.0 + 8} textAnchor="middle" className="text-[7px] font-mono fill-zinc-300 dark:fill-zinc-600 select-none">100%</text>
                <text x={cx} y={cy - radius * 0.5 + 8} textAnchor="middle" className="text-[7px] font-mono fill-zinc-300 dark:fill-zinc-600 select-none">50%</text>

                {/* Spokes axis lines */}
                {Array.from({ length: numSides }).map((_, i) => {
                  const { x, y } = getCoordinates(i, 100);
                  return (
                    <line
                      key={i}
                      x1={cx}
                      y1={cy}
                      x2={x}
                      y2={y}
                      className="stroke-zinc-150 dark:stroke-zinc-800/60"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  );
                })}

                {/* Active radar dynamic polygon */}
                <polygon
                  points={fillPoints}
                  className="fill-indigo-500/15 stroke-indigo-500 dark:fill-indigo-400/15 dark:stroke-indigo-400"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />

                {/* Radar vertex dots */}
                {categoryStats.map((stat, i) => {
                  const val = stat.count > 0 ? stat.rate : 12;
                  const { x, y } = getCoordinates(i, val);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="4"
                      className="fill-white stroke-indigo-500 dark:fill-zinc-900 dark:stroke-indigo-400"
                      strokeWidth="2"
                    />
                  );
                })}

                {/* Category Labels aligned radially */}
                {categoryStats.map((stat, i) => {
                  const label = stat.label.substring(2); // Strip emoji if too long, e.g. "健康"
                  const { x, y } = getCoordinates(i, 120);
                  let textAnchor = 'middle';
                  if (x < cx - 15) textAnchor = 'end';
                  if (x > cx + 15) textAnchor = 'start';
                  
                  return (
                    <text
                      key={i}
                      x={x}
                      y={y + 4}
                      textAnchor={textAnchor}
                      className="text-[9.5px] font-bold fill-zinc-500 dark:fill-zinc-400 select-none"
                    >
                      {label}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Annual Contribution Graph Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-zinc-150 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900 overflow-hidden"
        id="annual-heatmap-panel"
      >
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
            <span>{lang === 'zh' ? '📅 年度习惯打卡活跃度' : lang === 'ja' ? '📅 年間チェックイン記録' : '📅 Annual Habit Logs Intensity'}</span>
            <span className="text-[10px] font-normal text-zinc-400 dark:text-zinc-500">
              {lang === 'zh' ? '(过去 53 周)' : lang === 'ja' ? '(過去 53 週)' : '(Past 53 Weeks)'}
            </span>
          </h5>
          <div className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
            <span>{lang === 'zh' ? '少' : lang === 'ja' ? '少' : 'Less'}</span>
            <div className="h-2 w-2 rounded-[1.5px] bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-250/25" />
            <div className="h-2 w-2 rounded-[1.5px] bg-emerald-100 dark:bg-emerald-950/40" />
            <div className="h-2 w-2 rounded-[1.5px] bg-emerald-300 dark:bg-emerald-800/40" />
            <div className="h-2 w-2 rounded-[1.5px] bg-emerald-500" />
            <div className="h-2 w-2 rounded-[1.5px] bg-emerald-600 dark:bg-emerald-400" />
            <span>{lang === 'zh' ? '多' : lang === 'ja' ? '多' : 'More'}</span>
          </div>
        </div>

        {/* Heatmap Layout with horizontal scroll */}
        <div className="overflow-x-auto pb-1 -mx-2 px-2 scrollbar-thin">
          <div className="flex gap-1 min-w-[640px] items-start">
            {/* Week Labels Column aligned with rows */}
            <div className="grid grid-rows-7 gap-[2.5px] text-[8px] text-zinc-400 dark:text-zinc-500 font-bold pr-2 h-[75px] select-none text-right shrink-0">
              <span>{lang === 'zh' ? '日' : lang === 'ja' ? '日' : 'S'}</span>
              <span />
              <span>{lang === 'zh' ? '二' : lang === 'ja' ? '火' : 'T'}</span>
              <span />
              <span>{lang === 'zh' ? '四' : lang === 'ja' ? '木' : 'T'}</span>
              <span />
              <span>{lang === 'zh' ? '六' : lang === 'ja' ? '土' : 'S'}</span>
            </div>

            {/* Grid Days Columns (flows vertically with vertical grid-flow-col) */}
            <div className="grid grid-flow-col grid-rows-7 gap-[2.5px] flex-1 h-[75px]">
              {gridDays.map((day, idx) => (
                <div
                  key={`${day.dateString}-${idx}`}
                  className={`h-20 w-20 rounded-[1.5px] transition-all hover:scale-125 duration-100 cursor-help ${getIntensityColor(day.count)}`}
                  style={{ width: '8.5px', height: '8.5px' }}
                  title={day.label}
                  id={`heatmap-cell-${idx}`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
