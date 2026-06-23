/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HabitCategory = 'health' | 'sport' | 'mind' | 'work' | 'custom';

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  createdAt: string; // ISO String
  completedDates: string[]; // List of 'YYYY-MM-DD' strings
  color: string; // Theme color for Material design (e.g. 'indigo', 'emerald', 'teal', 'amber', 'rose')
  icon: string; // Lucide icon name
  frequency: 'daily';
  archived: boolean;
  notes?: Record<string, string>; // dateString -> note text
  focusMinutes?: Record<string, number>; // dateString -> focus minutes spent
}

export interface CategoryInfo {
  id: HabitCategory;
  name: string;
  icon: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}
