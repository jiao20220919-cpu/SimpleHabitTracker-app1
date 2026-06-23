/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Play, Pause, RotateCcw, Flame, CheckCircle, Sparkles, BookOpen, Clock } from 'lucide-react';
import { Habit } from '../types';
import { triggerHaptic, getLocalDateString } from '../utils';
import confetti from 'canvas-confetti';

import { Language, translations } from '../locales';

interface GlobalFocusTimerProps {
  habits: Habit[];
  onAddFocusMinutes: (habitId: string, dateString: string, minutes: number) => void;
  onToggleDate: (habitId: string, dateString: string) => void;
  lang: Language;
}

export const GlobalFocusTimer: React.FC<GlobalFocusTimerProps> = ({
  habits,
  onAddFocusMinutes,
  onToggleDate,
  lang,
}) => {
  const t = translations[lang];
  const activeHabits = habits.filter(h => !h.archived);
  const [selectedHabitId, setSelectedHabitId] = useState<string>('');
  
  // Timer States
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompletedToday, setSessionsCompletedToday] = useState(0);
  const [interactiveLogMinutes, setInteractiveLogMinutes] = useState('10');
  const [showQuickLogSuccess, setShowQuickLogSuccess] = useState(false);
  const [showTimerSuccess, setShowTimerSuccess] = useState(false);
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync selected habit if empty
  useEffect(() => {
    if (!selectedHabitId && activeHabits.length > 0) {
      setSelectedHabitId(activeHabits[0].id);
    }
  }, [activeHabits, selectedHabitId]);

  // Sync timer remaining when preset selection changes
  useEffect(() => {
    if (!isRunning) {
      setTimeRemaining(timerMinutes * 60);
    }
  }, [timerMinutes, isRunning]);

  // Trigger bell ring sound with high ring A5 harmonic progression
  const triggerBellSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 ring
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15); // Pure 5th up
      
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio Context supporting error: ', e);
    }
  };

  // Timer Ticking Mechanism
  useEffect(() => {
    if (isRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Completed pomodoro focus segment successfully!
            setIsRunning(false);
            triggerBellSound();
            triggerHaptic();

            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            
            // Success celebrate using confetti launcher
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.7 }
            });

            const todayStr = getLocalDateString();
            if (selectedHabitId) {
              onAddFocusMinutes(selectedHabitId, todayStr, timerMinutes);
              
              // Automatically check in / complete the habit for today if not already completed
              const targetHabit = habits.find(h => h.id === selectedHabitId);
              if (targetHabit && !targetHabit.completedDates.includes(todayStr)) {
                onToggleDate(selectedHabitId, todayStr);
              }
            }

            setSessionsCompletedToday(prevCount => prevCount + 1);
            setShowTimerSuccess(true);
            setTimeout(() => setShowTimerSuccess(false), 5000);

            return timerMinutes * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRunning, timerMinutes, selectedHabitId, habits, onAddFocusMinutes, onToggleDate]);

  // Format MM:SS
  const formatTime = (totalSeconds: number) => {
    const mm = Math.floor(totalSeconds / 60);
    const ss = totalSeconds % 60;
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };

  // Handle manual direct quick-logging
  const handleDirectQuickLog = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();
    const mins = Number(interactiveLogMinutes);
    if (!selectedHabitId || isNaN(mins) || mins <= 0) return;

    const todayStr = getLocalDateString();
    onAddFocusMinutes(selectedHabitId, todayStr, mins);
    
    // Automatically complete habit for today if they quick-log focus focus minutes is a great proxy of completing it
    const targetHabit = habits.find(h => h.id === selectedHabitId);
    if (targetHabit && !targetHabit.completedDates.includes(todayStr)) {
      onToggleDate(selectedHabitId, todayStr);
    }

    // Celebratory micro-burst
    confetti({
      particleCount: 30,
      spread: 40,
      origin: { y: 0.85 }
    });

    setShowQuickLogSuccess(true);
    setTimeout(() => setShowQuickLogSuccess(false), 3000);
    setInteractiveLogMinutes('10');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-zinc-150 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900 overflow-hidden relative"
      id="global-focus-timer-container"
    >
      {/* Decorative gradient light backing */}
      <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-indigo-500/5 dark:bg-indigo-400/5 blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Interactive Timer Console & Dial (7/12) */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Timer className="h-4.5 w-4.5" />
              </div>
              <h4 className="text-sm font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight">
                {t.timerTitle}
              </h4>
            </div>
            <p className="text-xs text-zinc-450 dark:text-zinc-500 leading-normal">
              {t.timerSubtitle}
            </p>
          </div>

          {/* Quick Select focusing habit drop down */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
              {t.timerFocusFocus}
            </label>
            {activeHabits.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 p-3 text-center text-xs text-zinc-400">
                {lang === 'zh' ? '请先在下方添加一个好习惯！' : lang === 'ja' ? '最初に習慣を追加してください！' : 'Please seed a fresh habit first below!'}
              </div>
            ) : (
              <select
                disabled={isRunning}
                value={selectedHabitId}
                onChange={(e) => {
                  triggerHaptic();
                  setSelectedHabitId(e.target.value);
                }}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-55 bg-zinc-50 px-3.5 py-2.5 text-xs font-semibold text-zinc-855 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-150 dark:focus:border-indigo-400 cursor-pointer"
              >
                {activeHabits.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.icon} {h.name} ({h.category === 'health' && t.filterHealth}
                    {h.category === 'sport' && t.filterSport}
                    {h.category === 'mind' && t.filterMind}
                    {h.category === 'work' && t.filterWork}
                    {h.category === 'custom' && t.filterCustom})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Countdown Layout Grid */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/60 rounded-2xl p-4.5">
            {/* Countdown Large Numerics */}
            <div className="flex flex-col">
              <span className="text-[44px] font-extrabold font-mono text-zinc-850 dark:text-zinc-100 tracking-tighter leading-none">
                {formatTime(timeRemaining)}
              </span>
              <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3 inline text-indigo-500" />
                {t.timerChoosePreset} {timerMinutes} {t.timerFocusMin}
              </span>
            </div>

            {/* Presets and controllers column */}
            <div className="space-y-3 shrink-0">
              {/* Presets Selector layout */}
              <div className="flex items-center gap-1.5">
                {[5, 10, 15, 25, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    disabled={isRunning}
                    onClick={() => {
                      triggerHaptic();
                      setTimerMinutes(mins);
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                      timerMinutes === mins
                        ? 'bg-indigo-600 text-white dark:bg-indigo-500 shadow-sm'
                        : 'bg-white border border-zinc-250 hover:bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-450 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              {/* Central control play buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    triggerHaptic();
                    setIsRunning(!isRunning);
                  }}
                  disabled={activeHabits.length === 0}
                  className={`flex-1 flex h-10 px-5 items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    isRunning
                      ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-100 dark:shadow-none'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 dark:shadow-none dark:bg-indigo-500 dark:hover:bg-indigo-400'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-4 w-4 stroke-[2.5]" />
                      <span>{t.timerPause}</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current stroke-[2.5]" />
                      <span>{t.timerStart}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    triggerHaptic();
                    setIsRunning(false);
                    setTimeRemaining(timerMinutes * 60);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-zinc-250 text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-850 dark:border-zinc-800/40 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                  title={lang === 'zh' ? '重置计时器' : lang === 'ja' ? 'タイマーリセット' : 'Reset Timer'}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Succeeded Banner overlays */}
          <AnimatePresence>
            {showTimerSuccess && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50 rounded-2xl p-3 text-xs text-emerald-650 dark:text-emerald-400 font-semibold space-y-1 block"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <CheckCircle className="h-4 w-4 text-emerald-500 fill-current bg-white rounded-full dark:bg-transparent" />
                  <span>{t.timerSuccessTitle}</span>
                </div>
                <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90 font-medium pl-5.5 leading-relaxed">
                  {t.timerSuccessSub.replace('{minutes}', String(timerMinutes))}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Fast Manual Manual Checkin Logging (5/12) */}
        <div className="md:col-span-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-800/80 pt-5 md:pt-0 md:pl-6 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 tracking-wider uppercase flex items-center gap-1">
              🚀 {t.timerManualLogTitle}
            </span>
            <h5 className="text-[13px] font-bold text-zinc-750 dark:text-zinc-200">
              {t.timerManualLogSub}
            </h5>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
              {lang === 'zh' 
                ? '觉得倒计时太繁冗？在这里，不论是今天跑了 30 分钟还是看书 10 分钟，您都可以马上在下方手工一键登记并完成打卡！' 
                : lang === 'ja' 
                  ? 'カウントダウンが不便だとお感じですか？本日頑張った時間（読書やジョギングなど）をこちらからワンクリックで登録し、連動チェックインできます！' 
                  : 'Prefer not to wait for a timer? Directly log your active self-discipline focus minutes (e.g. 10m, 30m) here and simultaneously complete check-ins!'}
            </p>
          </div>

          <form onSubmit={handleDirectQuickLog} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                {t.timerMinutesLabel}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={interactiveLogMinutes}
                  onChange={(e) => setInteractiveLogMinutes(e.target.value)}
                  placeholder="如：25, 45, 60"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-3.5 pr-14 text-xs font-mono font-bold text-zinc-800 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] bg-zinc-100 dark:bg-zinc-850 font-bold text-zinc-450 dark:text-zinc-400 px-1.5 py-0.5 rounded">
                  {t.timerFocusMin}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={activeHabits.length === 0}
              className="w-full flex h-9.5 items-center justify-center gap-1.5 rounded-xl bg-zinc-805 bg-zinc-800 text-white hover:bg-zinc-900 text-xs font-bold transition-all shadow-sm dark:bg-zinc-200 dark:text-zinc-950 dark:hover:bg-zinc-100"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{t.timerSubmitLog}</span>
            </button>
          </form>

          {/* Quick Log Success micro feedback */}
          <AnimatePresence>
            {showQuickLogSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150 text-[11px] text-indigo-600 dark:text-indigo-400 p-2.5 rounded-xl font-semibold flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-500 fill-current" />
                <span>{t.timerQuickLogSuccess}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Today's achievements counter */}
          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950 p-3 flex items-center justify-between border border-zinc-150/50 dark:border-zinc-850 select-none">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-rose-500 fill-current" />
              {t.timerAchievementCount}
            </span>
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-350 pr-1">
              <span className="font-mono text-indigo-600 dark:text-indigo-400 text-sm">{sessionsCompletedToday}</span> {t.timerTomatoUnit}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
