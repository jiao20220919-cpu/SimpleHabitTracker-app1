/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Habit, HabitCategory } from './types';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

/**
 * Trigger subtle haptic vibration overlay back on Android + web
 */
export async function triggerHaptic(): Promise<void> {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (e) {
    // Elegant fallback to navigator.vibrate if running under web view/browser
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(12);
    }
  }
}

/**
 * Returns a timezone-safe 'YYYY-MM-DD' representation of a Date
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates current and longest streaks from an array of completed dates
 */
export function calculateStreaks(completedDates: string[]): { currentStreak: number; longestStreak: number } {
  if (!completedDates || completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Ensure unique dates and sort them ascending
  const uniqueDates = Array.from(new Set(completedDates)).sort();
  if (uniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // 1. Calculate longest streak
  let longestStreak = 0;
  let runningStreak = 0;
  let prevTime: number | null = null;

  for (const dateStr of uniqueDates) {
    // Parse Date as local midnight to avoid timezone issues
    const parts = dateStr.split('-');
    if (parts.length !== 3) continue;
    
    const currentDate = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10)
    );
    const currentTime = currentDate.getTime();

    if (prevTime === null) {
      runningStreak = 1;
    } else {
      const diffDays = Math.round((currentTime - prevTime) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        runningStreak += 1;
      } else if (diffDays > 1) {
        runningStreak = 1;
      }
    }

    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    prevTime = currentTime;
  }

  // 2. Calculate current streak (active today or yesterday)
  const todayStr = getLocalDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  const hasToday = uniqueDates.includes(todayStr);
  const hasYesterday = uniqueDates.includes(yesterdayStr);

  let currentStreak = 0;
  if (hasToday || hasYesterday) {
    let checkDate = hasToday ? new Date() : yesterday;
    while (true) {
      const checkStr = getLocalDateString(checkDate);
      if (uniqueDates.includes(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
}

/**
 * Returns list of last 7 days with details for calendar checklist
 */
export interface DayItem {
  dateString: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
}

export function getLast7Days(): DayItem[] {
  const result: DayItem[] = [];
  const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = getLocalDateString(d);
    result.push({
      dateString,
      dayName: daysOfWeek[d.getDay()],
      dayNumber: d.getDate(),
      isToday: i === 0,
    });
  }
  return result;
}

/**
 * Gets color class names mapping for Material Design theme
 */
export function getColorClasses(colorName: string): {
  text: string;
  bg: string;
  border: string;
  accentBg: string;
  ripple: string;
  bgActive: string;
  glowShadow: string;
  glowActiveShadow: string;
  glowBorder: string;
} {
  const colorMap: Record<string, any> = {
    indigo: {
      text: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-indigo-100 dark:border-indigo-900/60',
      accentBg: 'bg-indigo-600 dark:bg-indigo-500',
      ripple: 'focus:ripple-indigo',
      bgActive: 'bg-indigo-100 dark:bg-indigo-900/30',
      glowShadow: 'hover:shadow-[0_12px_40px_rgba(99,102,241,0.15)] dark:hover:shadow-[0_12px_45px_rgba(99,102,241,0.22)]',
      glowActiveShadow: 'shadow-[0_12px_40px_-5px_rgba(99,102,241,0.22)] dark:shadow-[0_12px_45px_rgba(99,102,241,0.35)]',
      glowBorder: 'hover:border-indigo-300 dark:hover:border-indigo-800'
    },
    emerald: {
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-100 dark:border-emerald-900/60',
      accentBg: 'bg-emerald-600 dark:bg-emerald-500',
      ripple: 'focus:ripple-emerald',
      bgActive: 'bg-emerald-100 dark:bg-emerald-900/30',
      glowShadow: 'hover:shadow-[0_12px_40px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_12px_45px_rgba(16,185,129,0.22)]',
      glowActiveShadow: 'shadow-[0_12px_40px_-5px_rgba(16,185,129,0.22)] dark:shadow-[0_12px_45px_rgba(16,185,129,0.35)]',
      glowBorder: 'hover:border-emerald-300 dark:hover:border-emerald-800'
    },
    teal: {
      text: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      border: 'border-teal-100 dark:border-teal-900/60',
      accentBg: 'bg-teal-600 dark:bg-teal-500',
      ripple: 'focus:ripple-teal',
      bgActive: 'bg-teal-100 dark:bg-teal-900/30',
      glowShadow: 'hover:shadow-[0_12px_40px_rgba(20,184,166,0.15)] dark:hover:shadow-[0_12px_45px_rgba(20,184,166,0.22)]',
      glowActiveShadow: 'shadow-[0_12px_40px_-5px_rgba(20,184,166,0.22)] dark:shadow-[0_12px_45px_rgba(20,184,166,0.35)]',
      glowBorder: 'hover:border-teal-300 dark:hover:border-teal-800'
    },
    amber: {
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-100 dark:border-amber-900/60',
      accentBg: 'bg-amber-600 dark:bg-amber-500',
      ripple: 'focus:ripple-amber',
      bgActive: 'bg-amber-100 dark:bg-amber-900/30',
      glowShadow: 'hover:shadow-[0_12px_40px_rgba(245,158,11,0.12)] dark:hover:shadow-[0_12px_45px_rgba(245,158,11,0.18)]',
      glowActiveShadow: 'shadow-[0_12px_40px_-5px_rgba(245,158,11,0.18)] dark:shadow-[0_12px_45px_rgba(245,158,11,0.30)]',
      glowBorder: 'hover:border-amber-300 dark:hover:border-amber-800'
    },
    rose: {
      text: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-100 dark:border-rose-900/60',
      accentBg: 'bg-rose-600 dark:bg-rose-500',
      ripple: 'focus:ripple-rose',
      bgActive: 'bg-rose-100 dark:bg-rose-900/30',
      glowShadow: 'hover:shadow-[0_12px_40px_rgba(244,63,94,0.15)] dark:hover:shadow-[0_12px_45px_rgba(244,63,94,0.22)]',
      glowActiveShadow: 'shadow-[0_12px_40px_-5px_rgba(244,63,94,0.22)] dark:shadow-[0_12px_45px_rgba(244,63,94,0.35)]',
      glowBorder: 'hover:border-rose-300 dark:hover:border-rose-800'
    },
    violet: {
      text: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950/40',
      border: 'border-violet-100 dark:border-violet-900/60',
      accentBg: 'bg-violet-600 dark:bg-violet-500',
      ripple: 'focus:ripple-violet',
      bgActive: 'bg-violet-100 dark:bg-violet-900/30',
      glowShadow: 'hover:shadow-[0_12px_40px_rgba(139,92,246,0.15)] dark:hover:shadow-[0_12px_45px_rgba(139,92,246,0.22)]',
      glowActiveShadow: 'shadow-[0_12px_40px_-5px_rgba(139,92,246,0.22)] dark:shadow-[0_12px_45px_rgba(139,92,246,0.35)]',
      glowBorder: 'hover:border-violet-300 dark:hover:border-violet-800'
    },
  };

  return colorMap[colorName] || colorMap['indigo'];
}

/**
 * Initial beautiful habits for empty state preview
 */
export function getInitialHabits(): Habit[] {
  const today = new Date();
  const formatOffsetDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    return getLocalDateString(d);
  };

  return [
    {
      id: 'habit-1',
      name: '每日早睡早起',
      category: 'health',
      createdAt: new Date().toISOString(),
      completedDates: [formatOffsetDate(3), formatOffsetDate(2), formatOffsetDate(1)],
      color: 'indigo',
      icon: 'Moon',
      frequency: 'daily',
      archived: false,
    },
    {
      id: 'habit-2',
      name: '充分饮水 2L',
      category: 'health',
      createdAt: new Date().toISOString(),
      completedDates: [formatOffsetDate(4), formatOffsetDate(2), formatOffsetDate(1), formatOffsetDate(0)],
      color: 'teal',
      icon: 'Droplet',
      frequency: 'daily',
      archived: false,
    },
    {
      id: 'habit-3',
      name: '半小时有氧运动',
      category: 'sport',
      createdAt: new Date().toISOString(),
      completedDates: [formatOffsetDate(5), formatOffsetDate(3), formatOffsetDate(1)],
      color: 'emerald',
      icon: 'Activity',
      frequency: 'daily',
      archived: false,
    },
    {
      id: 'habit-4',
      name: '日落冥想/复盘',
      category: 'mind',
      createdAt: new Date().toISOString(),
      completedDates: [formatOffsetDate(1), formatOffsetDate(0)],
      color: 'amber',
      icon: 'Sparkles',
      frequency: 'daily',
      archived: false,
    },
  ];
}
