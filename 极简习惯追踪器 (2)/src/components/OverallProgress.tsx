/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Check, Flame, Percent, Calendar } from 'lucide-react';
import { Habit } from '../types';
import { getLocalDateString } from '../utils';

import { Language } from '../locales';

interface OverallProgressProps {
  habits: Habit[];
  lang: Language;
}

export const OverallProgress: React.FC<OverallProgressProps> = ({ habits, lang }) => {
  const activeHabits = habits.filter((h) => !h.archived);
  const total = activeHabits.length;
  const todayStr = getLocalDateString();
  const completedToday = activeHabits.filter((h) => h.completedDates.includes(todayStr)).length;
  
  // Today's completion rate
  const todayRate = total > 0 ? Math.round((completedToday / total) * 100) : 0;
  
  // Overall check-in density (completed checkins vs theoretical past month max of 30 days per habit)
  const totalCheckinsAllTime = activeHabits.reduce((sum, h) => sum + h.completedDates.length, 0);
  const theoreticalMax = total * 30;
  const overallRate = theoreticalMax > 0 ? Math.min(100, Math.round((totalCheckinsAllTime / theoreticalMax) * 100)) : 0;

  // SVG configurations for the gauge ring
  const sqSize = 130;
  const strokeWidth = 10;
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const dashOffsetToday = dashArray - (dashArray * todayRate) / 100;
  const dashOffsetOverall = dashArray - (dashArray * overallRate) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="overflow-hidden rounded-3xl border border-zinc-150 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900"
      id="overall-progress-card"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Left Side: Dynamic Text Metrics */}
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {lang === 'zh' ? '今日总完成率' : lang === 'ja' ? '今日の総達成率' : "Today's Achievement Circle"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {total > 0 
                ? (lang === 'zh'
                    ? `今天已完成 ${completedToday} 个习惯，守护自律进度条！`
                    : lang === 'ja'
                      ? `本日すでに ${completedToday} 個の習慣を完了させました！`
                      : `You completed ${completedToday} habits today. Guard your streak!`)
                : (lang === 'zh'
                    ? '开始创建一个新习惯并开启您的打卡之旅吧 ✨'
                    : lang === 'ja'
                      ? '新しい習慣を作って、自己律の旅を始めましょう ✨'
                      : 'Seed your very first habit to kickoff the discipline flywheel ✨')
              }
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-950/50">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 block leading-none">
                {lang === 'zh' ? '今日打卡率' : lang === 'ja' ? '今日の達成率' : "Today's Rate"}
              </span>
              <span className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1 block">
                {todayRate}%
              </span>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-950/50">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 block leading-none">
                {lang === 'zh' ? '30天宏观完成率' : lang === 'ja' ? '30日間の広域完成率' : '30-Day Density'}
              </span>
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                {overallRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Dual-circle interactive SVG Meter */}
        <div className="flex shrink-0 items-center justify-center gap-6" id="gauge-container">
          {/* Today's Gauge */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-[130px] w-[130px]">
              <svg width={sqSize} height={sqSize} viewBox={viewBox}>
                {/* Background circle */}
                <circle
                  className="stroke-zinc-100 dark:stroke-zinc-800"
                  cx={sqSize / 2}
                  cy={sqSize / 2}
                  r={radius}
                  strokeWidth={`${strokeWidth}px`}
                  fill="none"
                />
                {/* Animated Inner Highlight ring */}
                <motion.circle
                  className="stroke-indigo-600 dark:stroke-indigo-400"
                  cx={sqSize / 2}
                  cy={sqSize / 2}
                  r={radius}
                  strokeWidth={`${strokeWidth}px`}
                  fill="none"
                  strokeDasharray={dashArray}
                  initial={{ strokeDashoffset: dashArray }}
                  animate={{ strokeDashoffset: dashOffsetToday }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
                />
              </svg>
              {/* Central Text Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black font-mono text-zinc-800 dark:text-zinc-100 leading-none">
                  {todayRate}
                  <span className="text-xs font-semibold text-zinc-400">%</span>
                </span>
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 mt-1">
                  {lang === 'zh' ? '今日完成' : lang === 'ja' ? '今日完了' : 'Today'}
                </span>
              </div>
            </div>
          </div>

          {/* All-time Gauge */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-[130px] w-[130px]">
              <svg width={sqSize} height={sqSize} viewBox={viewBox}>
                {/* Background circle */}
                <circle
                  className="stroke-zinc-100 dark:stroke-zinc-800"
                  cx={sqSize / 2}
                  cy={sqSize / 2}
                  r={radius}
                  strokeWidth={`${strokeWidth}px`}
                  fill="none"
                />
                {/* Animated Inner Highlight ring */}
                <motion.circle
                  className="stroke-emerald-500 dark:stroke-emerald-400"
                  cx={sqSize / 2}
                  cy={sqSize / 2}
                  r={radius}
                  strokeWidth={`${strokeWidth}px`}
                  fill="none"
                  strokeDasharray={dashArray}
                  initial={{ strokeDashoffset: dashArray }}
                  animate={{ strokeDashoffset: dashOffsetOverall }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
                />
              </svg>
              {/* Central Text Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black font-mono text-zinc-800 dark:text-zinc-100 leading-none">
                  {overallRate}
                  <span className="text-xs font-semibold text-zinc-400">%</span>
                </span>
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 mt-1">
                  {lang === 'zh' ? '历史深度' : lang === 'ja' ? '累計深度' : 'Overall'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
