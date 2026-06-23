/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Trophy, 
  Trash2, 
  Archive, 
  Check, 
  Sparkles, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  NotebookPen, 
  BookmarkCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { Habit } from '../types';
import { calculateStreaks, getColorClasses, getLocalDateString, DayItem, triggerHaptic } from '../utils';
import { HabitIcon } from './HabitIcon';
import { Language, translations } from '../locales';

interface HabitCardProps {
  habit: Habit;
  days: DayItem[];
  onToggleDate: (habitId: string, dateString: string) => void;
  onDelete: (habitId: string) => void;
  onToggleArchive: (habitId: string) => void;
  onUpdateNotes?: (habitId: string, dateString: string, note: string) => void;
  onAddFocusMinutes?: (habitId: string, dateString: string, minutes: number) => void;
  lang?: Language;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  days,
  onToggleDate,
  onDelete,
  onToggleArchive,
  onUpdateNotes,
  onAddFocusMinutes,
  lang = 'zh',
}) => {
  const t = translations[lang];
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { currentStreak, longestStreak } = calculateStreaks(habit.completedDates);
  const colorSchema = getColorClasses(habit.color);
  const todayStr = getLocalDateString();
  const isCompletedToday = habit.completedDates.includes(todayStr);

  // Focus Timer States
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Month Calendar states
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(todayStr);

  // Diary editing state
  const [selectedDiaryDate, setSelectedDiaryDate] = useState<string | null>(null);
  const [diaryNoteInput, setDiaryNoteInput] = useState('');

  // Synchronise timer initial seconds when active minutes selector changes
  useEffect(() => {
    if (!isTimerRunning) {
      setTimeRemaining(timerMinutes * 60);
    }
  }, [timerMinutes]);

  // Audio crystal sound chime for countdown finishes
  const triggerBellSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High ring (A5)
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.12); // P5 interval up
      
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.warn('Audio Context is locked or unsupported: ', e);
    }
  };

  // Timer Tick implementation
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Completed!
            setIsTimerRunning(false);
            triggerBellSound();
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

            // Record focus minutes and check in automatically
            if (onAddFocusMinutes) {
              onAddFocusMinutes(habit.id, todayStr, timerMinutes);
            }
            
            // Re-initialize to chosen minutes
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
  }, [isTimerRunning, timerMinutes, habit.id, onAddFocusMinutes]);

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // Generate current month coordinates
  const getMonthDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed
    
    const firstDay = new Date(year, month, 1);
    const startNum = firstDay.getDay(); // 0 is Sunday
    
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const calendarDaysList: { dateString: string; dayNumber: number; isPadding: boolean; label: string }[] = [];
    
    // Padding from previous month
    const prevMonthTotal = new Date(year, month, 0).getDate();
    for (let i = startNum - 1; i >= 0; i--) {
      const prevNum = prevMonthTotal - i;
      const prevDate = new Date(year, month - 1, prevNum);
      calendarDaysList.push({
        dateString: getLocalDateString(prevDate),
        dayNumber: prevNum,
        isPadding: true,
        label: `${prevDate.getMonth() + 1}/${prevNum}`,
      });
    }
    
    // Month active days
    for (let i = 1; i <= totalDays; i++) {
      const currDate = new Date(year, month, i);
      calendarDaysList.push({
        dateString: getLocalDateString(currDate),
        dayNumber: i,
        isPadding: false,
        label: `${i}`,
      });
    }
    
    return calendarDaysList;
  };

  const monthCells = getMonthDays();
  const currentMonthLabel = `${new Date().getFullYear()}年 ${new Date().getMonth() + 1}月`;

  // Handle saving diary notes
  const saveDiaryNote = () => {
    if (selectedDiaryDate && onUpdateNotes) {
      onUpdateNotes(habit.id, selectedDiaryDate, diaryNoteInput);
      setSelectedDiaryDate(null);
      setDiaryNoteInput('');
    }
  };

  // Open note selector
  const openDiaryEditor = (dateStr: string) => {
    setSelectedDiaryDate(dateStr);
    setDiaryNoteInput(habit.notes?.[dateStr] || '');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: -10 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className={`relative overflow-hidden rounded-3xl border p-5 transition-all duration-300 md:p-6 bg-white dark:bg-zinc-900 group ${
        isCompletedToday
          ? `${colorSchema.glowActiveShadow} border-transparent`
          : `border-zinc-200/70 dark:border-zinc-800/80 shadow-md shadow-zinc-100/30 dark:shadow-none ${colorSchema.glowShadow} ${colorSchema.glowBorder}`
      }`}
      id={`habit-card-${habit.id}`}
    >
      {/* Background Radial Glow accent */}
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none ${colorSchema.bg}`} />
      {isCompletedToday && (
        <div className={`absolute -right-14 -top-14 h-36 w-36 rounded-full blur-3xl opacity-30 dark:opacity-20 pointer-events-none ${colorSchema.bg}`} />
      )}

      {/* Main Row: Header Info */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Animated App Icon Wrapper */}
          <motion.div
            whileHover={{ scale: 1.12, rotate: 6 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 450, damping: 14 }}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${colorSchema.bg} ${colorSchema.text} border ${colorSchema.border}`}
          >
            <HabitIcon name={habit.icon} className="h-6 w-6" />
          </motion.div>

          <div>
            <h3 className="font-sans text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
              {habit.name}
              {isCompletedToday && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex text-amber-500"
                  title="今日已打卡"
                >
                  <Sparkles className="h-4 w-4 fill-current" />
                </motion.span>
              )}
            </h3>
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {habit.category === 'health' && `🏥 ${t.filterHealth}`}
              {habit.category === 'sport' && `💪 ${t.filterSport}`}
              {habit.category === 'mind' && `🧘 ${t.filterMind}`}
              {habit.category === 'work' && `💼 ${t.filterWork}`}
              {habit.category === 'custom' && `✨ ${t.filterCustom}`}
            </span>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <button
                onClick={() => {
                  triggerHaptic();
                  setIsTimerOpen(!isTimerOpen);
                  setIsCalendarOpen(false);
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all duration-200 ${
                  isTimerOpen
                    ? 'bg-indigo-605 bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500'
                    : 'bg-indigo-50 text-indigo-650 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400'
                }`}
                title="开启番茄钟，深度专注学习"
                id={`btn-pill-timer-${habit.id}`}
              >
                <Timer className="h-3 w-3" />
                <span>{t.habitCardPillTimer}</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic();
                  setIsCalendarOpen(!isCalendarOpen);
                  setIsTimerOpen(false);
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all duration-200 ${
                  isCalendarOpen
                    ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 shadow-sm ring-2 ring-zinc-500'
                    : 'bg-zinc-100 text-zinc-650 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
                }`}
                title="查看日历以及书写心情心情日志"
                id={`btn-pill-calendar-${habit.id}`}
              >
                <Calendar className="h-3 w-3" />
                <span>{t.habitCardPillCalendar}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Small Utility Menu Buttons */}
        <div className="flex items-center gap-1 relative z-10">
          {/* Toggle focus timer button */}
          <button
            onClick={() => {
              setIsTimerOpen(!isTimerOpen);
              setIsCalendarOpen(false);
            }}
            className={`rounded-lg p-1.5 transition-colors ${
              isTimerOpen 
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' 
                : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-650 dark:text-zinc-500 dark:hover:bg-zinc-800'
            }`}
            title="番茄专注钟"
            id={`btn-toggle-timer-${habit.id}`}
          >
            <Timer className="h-4.5 w-4.5" />
          </button>

          {/* Toggle calendar view button */}
          <button
            onClick={() => {
              setIsCalendarOpen(!isCalendarOpen);
              setIsTimerOpen(false);
            }}
            className={`rounded-lg p-1.5 transition-colors ${
              isCalendarOpen 
                ? 'bg-zinc-100 text-zinc-805 dark:bg-zinc-800 dark:text-zinc-200' 
                : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-650 dark:text-zinc-500 dark:hover:bg-zinc-800'
            }`}
            title="月度打卡日历"
            id={`btn-toggle-calendar-${habit.id}`}
          >
            <Calendar className="h-4.5 w-4.5" />
          </button>

          <button
            onClick={() => onToggleArchive(habit.id)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-650 dark:text-zinc-500 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-300 transition-colors"
            title={habit.archived ? "取消归档" : "归档习惯"}
            id={`btn-archive-${habit.id}`}
          >
            <Archive className="h-4.5 w-4.5" />
          </button>
          
          {showConfirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDelete(habit.id)}
                className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400"
                id={`btn-confirm-delete-${habit.id}`}
              >
                确认
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="rounded-lg bg-zinc-50 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400"
                id={`btn-cancel-delete-${habit.id}`}
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-500 dark:text-zinc-500 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors"
              title="删除习惯"
              id={`btn-delete-${habit.id}`}
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Micro Focus Timer Block */}
      <AnimatePresence>
        {isTimerOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-indigo-50/40 dark:bg-zinc-950/30 border border-indigo-100/30 dark:border-zinc-800/40 rounded-2xl p-4 mt-4 space-y-3 relative z-10"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Timer className="h-3.5 w-3.5" />
                番茄自律番：打卡前的高效专注监督
              </span>

              {/* Ready presets */}
              <div className="flex items-center gap-1">
                {[5, 10, 15, 25, 45].map((m) => (
                  <button
                    key={m}
                    disabled={isTimerRunning}
                    onClick={() => {
                      triggerHaptic();
                      setTimerMinutes(m);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                      timerMinutes === m
                        ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            {/* Countdown layout panel */}
            <div className="flex items-center justify-between p-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[34px] font-extrabold font-mono text-zinc-850 dark:text-zinc-100 tracking-tight leading-none">
                  {formatTime(timeRemaining)}
                </span>
                <span className="text-xs text-zinc-450 dark:text-zinc-500 font-medium">
                  目标：今日专注 {timerMinutes} 分钟
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    triggerHaptic();
                    setIsTimerRunning(!isTimerRunning);
                  }}
                  className={`flex h-9 px-3.5 items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all shadow ${
                    isTimerRunning
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400'
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      <span>暂停</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>开始专注</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    triggerHaptic();
                    setIsTimerRunning(false);
                    setTimeRemaining(timerMinutes * 60);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-850 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                  title="重制秒表"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Micro instructions */}
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-snug">
              ℹ️ 倒计时结束后，本产品将发出和缓 chime 并**自动完成今日打卡**，打卡与时长监督合二为一！
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Month Calendar Expandable view */}
      <AnimatePresence>
        {isCalendarOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-150/80 dark:border-zinc-850 rounded-2xl p-4.5 mt-4 space-y-3.5 relative z-10"
          >
            <div className="flex items-center justify-between border-b border-zinc-150/70 pb-2 dark:border-zinc-800/60">
              <span className="text-xs font-bold text-zinc-650 dark:text-zinc-300 flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {currentMonthLabel} 月度自律见证 (点击日期可打卡/写日记)
              </span>
              <button
                onClick={() => setIsCalendarOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Grid days layout */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {['日', '一', '二', '三', '四', '五', '六'].map((label) => (
                <span key={label} className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 select-none">
                  {label}
                </span>
              ))}

              {monthCells.map((cell, index) => {
                const isCompleted = habit.completedDates.includes(cell.dateString);
                const hasNote = habit.notes?.[cell.dateString] && habit.notes[cell.dateString].trim().length > 0;
                const isToday = cell.dateString === todayStr;

                return (
                  <button
                    key={`${cell.dateString}-${index}`}
                    onClick={() => {
                      triggerHaptic();
                      setSelectedCalendarDate(cell.dateString);
                    }}
                    onDoubleClick={() => {
                      triggerHaptic();
                      onToggleDate(habit.id, cell.dateString);
                    }}
                    className={`relative flex flex-col items-center justify-center h-[34px] rounded-lg transition-all border ${
                      isCompleted 
                        ? `${colorSchema.accentBg} text-white border-transparent shadow-sm font-semibold` 
                        : cell.isPadding
                          ? 'border-transparent text-zinc-300 dark:text-zinc-700 pointer-events-none'
                          : isToday
                            ? `border-indigo-500 ${colorSchema.text} bg-white dark:bg-zinc-900 font-bold`
                            : 'border-zinc-200/50 dark:border-zinc-800 text-zinc-550 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    } ${
                      selectedCalendarDate === cell.dateString 
                        ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 scale-105 z-10' 
                        : ''
                    }`}
                    title={`${cell.dateString} ${isCompleted ? '(已打卡)' : ''}`}
                  >
                    <span className="text-[11px] font-mono leading-none">{cell.dayNumber}</span>
                    
                    {/* Has Notes yellow tiny speck indicator */}
                    {hasNote && (
                      <span className={`absolute bottom-1 h-1 w-1 rounded-full ${
                        isCompleted ? 'bg-amber-300' : 'bg-indigo-500 dark:bg-indigo-400'
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Notes Info Bar & quick inline editor */}
            <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-zinc-550 dark:text-zinc-400 flex items-center gap-1">
                  <BookmarkCheck className="h-3.5 w-3.5 text-indigo-500" />
                  <span>{t.habitCardSelectedDate}</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-200">{selectedCalendarDate}</span>
                  {selectedCalendarDate === todayStr && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1 rounded dark:bg-indigo-950/40 dark:text-indigo-400">{t.habitCardToday}</span>}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      triggerHaptic();
                      onToggleDate(habit.id, selectedCalendarDate);
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                      habit.completedDates.includes(selectedCalendarDate)
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-100'
                        : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 hover:bg-indigo-100'
                    }`}
                  >
                    {habit.completedDates.includes(selectedCalendarDate) ? t.habitCardCancelCheckin : t.habitCardManualCheckin}
                  </button>
                  <button
                    onClick={() => openDiaryEditor(selectedCalendarDate)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[10px] font-bold"
                  >
                    <NotebookPen className="h-2.5 w-2.5" />
                    <span>{t.habitCardDiaryBtn}</span>
                  </button>
                </div>
              </div>

              {/* Show existing note on select */}
              {habit.notes?.[selectedCalendarDate] ? (
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-950 p-2.5 text-xs border border-zinc-100 dark:border-zinc-800 relative group/insight">
                  <p className="font-medium text-zinc-750 dark:text-zinc-300 leading-relaxed italic block pr-8">
                    💬 “ {habit.notes[selectedCalendarDate]} ”
                  </p>
                  <button
                    onClick={() => openDiaryEditor(selectedCalendarDate)}
                    className="absolute right-2 top-2.5 opacity-0 group-hover/insight:opacity-100 transition-opacity bg-white dark:bg-zinc-850 p-1 rounded border shadow-sm text-zinc-500 hover:text-zinc-800"
                    title={t.habitCardEditNoteTitle}
                  >
                    <NotebookPen className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic">
                  ✍️ {lang === 'zh' ? '该日期暂无心情手账。点击右侧的「手账日志」按钮写一句简短感言吧！' : lang === 'ja' ? 'この日付の自律手帳はまだありません。右側の日誌ボタンからコメントを残しましょう！' : 'No logs for this date. Click the Diary button on the right to append notes!'}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diary editor dialog overlay / modal inline */}
      <AnimatePresence>
        {selectedDiaryDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-sm rounded-[24px] border border-zinc-150 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5 mb-3">
                <NotebookPen className="h-4.5 w-4.5 text-indigo-650" />
                {t.habitCardDiaryTitle} ( {selectedDiaryDate} )
              </h3>

              <textarea
                value={diaryNoteInput}
                onChange={(e) => setDiaryNoteInput(e.target.value)}
                placeholder={t.habitCardDiaryPlaceholder}
                rows={4}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-xs text-zinc-800 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
              />

              <div className="flex items-center justify-between mt-4">
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 italic">{t.habitCardDiarySub}</span>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDiaryDate(null);
                      setDiaryNoteInput('');
                    }}
                    className="px-3 py-2 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-xl"
                  >
                    {t.addHabitCancel}
                  </button>
                  <button
                    type="button"
                    onClick={saveDiaryNote}
                    className="bg-indigo-650 text-white dark:bg-indigo-500 hover:opacity-90 px-4 py-2 text-xs font-bold rounded-xl shadow-sm"
                  >
                    {t.habitCardSaveDiary}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-4.5 flex flex-wrap items-center gap-4 border-t border-b border-zinc-100 dark:border-zinc-800/80 py-3 text-zinc-600 dark:text-zinc-300">
        <div className="flex items-center gap-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-500">
            <Flame className="h-4 w-4 fill-current" />
          </div>
          <div>
            <div className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 leading-none">{t.habitCardStreak}</div>
            <div className="text-[13px] font-bold font-mono text-zinc-800 dark:text-zinc-200">
              {currentStreak} {lang === 'zh' ? '天' : lang === 'ja' ? '日' : 'days'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950/20 text-violet-500">
            <Trophy className="h-4 w-4 fill-current" />
          </div>
          <div>
            <div className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 leading-none">{t.habitCardMaxStreak}</div>
            <div className="text-[13px] font-bold font-mono text-zinc-800 dark:text-zinc-200">
              {longestStreak} {lang === 'zh' ? '天' : lang === 'ja' ? '日' : 'days'}
            </div>
          </div>
        </div>

        {/* Focus Minutes Sum Tracker */}
        {Object.keys(habit.focusMinutes || {}).length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-55/60 dark:bg-indigo-950/20 text-indigo-500">
              <Timer className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 leading-none">{t.habitCardFocusCount}</div>
              <div className="text-[13px] font-bold font-mono text-zinc-800 dark:text-zinc-200">
                {Object.values(habit.focusMinutes || {}).reduce((a: any, b: any) => Number(a) + Number(b), 0)} {lang === 'zh' ? '分钟' : lang === 'ja' ? '分' : 'mins'}
              </div>
            </div>
          </div>
        )}

        {/* Completion rate */}
        <div className="ml-auto text-right">
          <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 block leading-none">{t.habitCardRate}</span>
          <span className="text-[13px] font-bold font-mono text-zinc-800 dark:text-zinc-200">
            {habit.completedDates.length > 0 
              ? `${Math.round((habit.completedDates.length / 30) * 100)}%`
              : '0%'
            }
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal ml-0.5">
              {lang === 'zh' ? '/30天' : lang === 'ja' ? '/30日' : '/30d'}
            </span>
          </span>
        </div>
      </div>

      {/* Week Grid checklist */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          <span>{t.habitCardWeekRecords}</span>
          <span>
            {lang === 'zh'
              ? `${habit.completedDates.length} 次总打卡`
              : lang === 'ja'
                ? `${habit.completedDates.length} 回の打刻総数`
                : `${habit.completedDates.length} check-ins total`}
          </span>
        </div>
        
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day) => {
            const isCompleted = habit.completedDates.includes(day.dateString);
            const hasWeeklyDayNote = habit.notes?.[day.dateString] && habit.notes[day.dateString].trim().length > 0;

            const dayNameMapping: Record<string, Record<Language, string>> = {
              '日': { zh: '日', en: 'Sun', ja: '日' },
              '一': { zh: '一', en: 'Mon', ja: '月' },
              '二': { zh: '二', en: 'Tue', ja: '火' },
              '三': { zh: '三', en: 'Wed', ja: '水' },
              '四': { zh: '四', en: 'Thu', ja: '木' },
              '五': { zh: '五', en: 'Fri', ja: '金' },
              '六': { zh: '六', en: 'Sat', ja: '土' },
            };
            const localizedDayName = dayNameMapping[day.dayName]?.[lang] || day.dayName;

            return (
              <div key={day.dateString} className="flex flex-col items-center group/tooltip relative">
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-1.5 font-medium">
                  {localizedDayName}
                </span>
                
                <motion.button
                  whileHover={{ scale: 1.18, rotate: isCompleted ? -3 : 3 }}
                  whileTap={{ scale: 0.82 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  onClick={() => {
                    triggerHaptic();
                    onToggleDate(habit.id, day.dateString);
                  }}
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
                    isCompleted
                      ? `${colorSchema.accentBg} text-white border-transparent shadow`
                      : day.isToday
                        ? `${colorSchema.text} ${colorSchema.bg} border-2 ${colorSchema.border}`
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-450 dark:hover:border-zinc-650 bg-transparent'
                  }`}
                  id={`btn-day-${habit.id}-${day.dateString}`}
                  title={`${day.dateString} ${isCompleted ? '已打卡，点击取消' : '点击打卡'}`}
                >
                  {isCompleted ? (
                    <Check className="h-4.5 w-4.5 stroke-[3]" />
                  ) : (
                    <span className={`text-[12px] font-mono font-semibold ${day.isToday ? 'font-bold' : ''}`}>
                      {day.dayNumber}
                    </span>
                  )}

                  {/* Has Note tiny yellow indicator dot */}
                  {hasWeeklyDayNote && (
                    <span className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                      isCompleted ? 'bg-amber-300' : 'bg-indigo-500'
                    }`} />
                  )}
                </motion.button>

                {/* Inline elegant note tooltip */}
                {hasWeeklyDayNote && (
                  <div className="absolute top-[52px] left-1/2 -translate-x-1/2 hidden group-hover/tooltip:block bg-zinc-850 dark:bg-black text-[10px] text-white p-2 rounded-lg shadow-md z-30 max-w-[120px] text-center w-max">
                    <p className="font-semibold line-clamp-3 leading-snug">
                      “ {habit.notes?.[day.dateString]} ”
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional Quick note entry if completed today */}
      {isCompletedToday && (
        <div className="mt-4 pt-3 border-t border-dashed border-zinc-150 dark:border-zinc-800/60 flex items-center gap-1.5" id={`diary-footer-note-${habit.id}`}>
          <span className="text-[10px] shrink-0 font-bold text-indigo-600 dark:text-indigo-400">{t.habitCardWriteDiaryNotice}</span>
          {habit.notes?.[todayStr] ? (
            <span 
              onClick={() => openDiaryEditor(todayStr)}
              className="text-[11px] text-zinc-600 dark:text-zinc-300 truncate cursor-pointer hover:underline italic flex-1"
            >
              “ {habit.notes[todayStr]} ”
            </span>
          ) : (
            <button
              onClick={() => openDiaryEditor(todayStr)}
              className="text-[11px] text-zinc-400 dark:text-zinc-500 hover:text-indigo-500 transition-colors text-left flex-1"
            >
              {lang === 'zh' ? '点击此处记录此刻的感言或微小进步...' : lang === 'ja' ? 'クリックして今日の気付きやちょっとした進歩を記録...' : 'Click here to capture thoughts or mini achievements for today...'}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};
