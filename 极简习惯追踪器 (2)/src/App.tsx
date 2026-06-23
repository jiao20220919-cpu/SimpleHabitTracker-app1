/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import localforage from 'localforage';
import { 
  Plus, 
  Search, 
  Sparkles, 
  Sun, 
  Moon, 
  RotateCcw, 
  Check, 
  CalendarMinus2,
  Trash2,
  Download
} from 'lucide-react';
import { Habit, HabitCategory } from './types';
import { 
  getInitialHabits, 
  getLast7Days, 
  getLocalDateString,
  triggerHaptic
} from './utils';
import { StatsPanel } from './components/StatsPanel';
import { HabitCard } from './components/HabitCard';
import { AddHabitModal } from './components/AddHabitModal';
import { OverallProgress } from './components/OverallProgress';
import { GlobalFocusTimer } from './components/GlobalFocusTimer';
import { Language, translations } from './locales';

// Configure localForage with IndexedDB as driver priority for premium robust offline persistence
localforage.config({
  name: 'MinimalHabitTracker',
  storeName: 'habits_store',
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE]
});

const STORAGE_KEY = 'minimal_habit_tracker_habits';
const THEME_KEY = 'minimal_habit_tracker_theme';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('minimal_habit_tracker_language');
    if (saved === 'en' || saved === 'zh' || saved === 'ja') {
      return saved as Language;
    }
    const navLang = navigator.language.toLowerCase();
    if (navLang.includes('ja')) return 'ja';
    if (navLang.includes('en')) return 'en';
    return 'zh';
  });

  const t = translations[lang];

  const [habits, setHabits] = useState<Habit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');
  const [currentTab, setCurrentTab] = useState<'active' | 'archived'>('active');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [days, setDays] = useState(getLast7Days());

  const [lastCelebratedDate, setLastCelebratedDate] = useState<string>(() => {
    return localStorage.getItem('minimal_habit_tracker_last_celebrated') || '';
  });

  const triggerCelebration = () => {
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      // Confetti burst from left side of screen
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.75 },
        colors: ['#6366f1', '#10b981', '#14b8a6', '#f59e0b', '#f43f5e', '#8b5cf6']
      });
      // Confetti burst from right side of screen
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.75 },
        colors: ['#6366f1', '#10b981', '#14b8a6', '#f59e0b', '#f43f5e', '#8b5cf6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  // 1. Initialize state from localforage (IndexedDB) with localStorage fallback
  useEffect(() => {
    const initializeDataAndStorage = async () => {
      try {
        const storedHabits = await localforage.getItem<Habit[]>(STORAGE_KEY);
        if (storedHabits && storedHabits.length > 0) {
          setHabits(storedHabits);
          // Sync to localStorage as redundant helper
          localStorage.setItem(STORAGE_KEY, JSON.stringify(storedHabits));
          return;
        }
      } catch (err) {
        console.warn('Trouble grabbing from IndexedDB, trying localStorage fallback...', err);
      }

      // LocalStorage Fallback if localforage fails or has not been instantiated
      const rawHabits = localStorage.getItem(STORAGE_KEY);
      if (rawHabits) {
        try {
          const parsed = JSON.parse(rawHabits);
          setHabits(parsed);
          // Sync with IndexedDB
          await localforage.setItem(STORAGE_KEY, parsed);
        } catch (e) {
          const initial = getInitialHabits();
          setHabits(initial);
          await localforage.setItem(STORAGE_KEY, initial);
        }
      } else {
        const initial = getInitialHabits();
        setHabits(initial);
        await localforage.setItem(STORAGE_KEY, initial);
      }
    };

    initializeDataAndStorage();

    // Load theme setting
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // Refresh calendar scale to match the current day
    const interval = setInterval(() => {
      setDays(getLast7Days());
    }, 60000); // refresh every minute

    return () => clearInterval(interval);
  }, []);

  // 2. Persist state to localforage (IndexedDB) and localStorage on updates
  const saveHabitsToStorage = (newHabits: Habit[]) => {
    setHabits(newHabits);
    
    // Save, preferring high-reliability IndexedDB
    localforage.setItem(STORAGE_KEY, newHabits).catch((err) => {
      console.error('IndexedDB save failed:', err);
    });

    // Mirror to standard localStorage as immediate synchronous redundance fallback
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHabits));

    // Evaluate today's completed items vs total active ones for confetti reward
    const activeHabits = newHabits.filter((h) => !h.archived);
    const todayStr = getLocalDateString();
    const completedToday = activeHabits.filter((h) => h.completedDates.includes(todayStr)).length;

    if (activeHabits.length > 0 && completedToday === activeHabits.length) {
      if (lastCelebratedDate !== todayStr) {
        setLastCelebratedDate(todayStr);
        localStorage.setItem('minimal_habit_tracker_last_celebrated', todayStr);
        triggerCelebration();
      }
    } else {
      // If no longer at 100%, allow them to earn the celebration again
      if (lastCelebratedDate === todayStr) {
        setLastCelebratedDate('');
        localStorage.removeItem('minimal_habit_tracker_last_celebrated');
      }
    }
  };

  // 3. Toggle Dark style theme
  const toggleTheme = () => {
    triggerHaptic();
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  };

  // 4. Reset to Initial Habits
  const handleResetDefaults = () => {
    triggerHaptic();
    const defaults = getInitialHabits();
    saveHabitsToStorage(defaults);
  };

  // 5. Clear all data
  const handleClearAll = () => {
    if (window.confirm('您确定要清空所有习惯和打卡数据吗？此操作无法撤销。')) {
      saveHabitsToStorage([]);
    }
  };

  // 5.5 Action Handle: Export Habit Data
  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(habits, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `minimal_habit_data_${getLocalDateString()}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (e) {
      console.error('导出数据失败：', e);
    }
  };

  // 6. Action Handle: Toggle Date Complete
  const handleToggleDate = (habitId: string, dateString: string) => {
    const nextHabits = habits.map((habit) => {
      if (habit.id === habitId) {
        const completed = [...habit.completedDates];
        const index = completed.indexOf(dateString);
        if (index > -1) {
          completed.splice(index, 1); // remove
        } else {
          completed.push(dateString); // add
        }
        return { ...habit, completedDates: completed };
      }
      return habit;
    });
    saveHabitsToStorage(nextHabits);
  };

  // 7. Action Handle: Archive Habit
  const handleToggleArchive = (habitId: string) => {
    const nextHabits = habits.map((habit) => {
      if (habit.id === habitId) {
        return { ...habit, archived: !habit.archived };
      }
      return habit;
    });
    saveHabitsToStorage(nextHabits);
  };

  // 8. Action Handle: Delete Habit
  const handleDeleteHabit = (habitId: string) => {
    const nextHabits = habits.filter((habit) => habit.id !== habitId);
    saveHabitsToStorage(nextHabits);
  };

  // 8.5 Action Handle: Update Habit journal notes
  const handleUpdateNotes = (habitId: string, dateString: string, note: string) => {
    const nextHabits = habits.map((habit) => {
      if (habit.id === habitId) {
        const nextNotes = { ...(habit.notes || {}) };
        if (!note || note.trim() === '') {
          delete nextNotes[dateString];
        } else {
          nextNotes[dateString] = note;
        }
        return { ...habit, notes: nextNotes };
      }
      return habit;
    });
    saveHabitsToStorage(nextHabits);
  };

  // 8.6 Action Handle: Add Focus minutes
  const handleAddFocusMinutes = (habitId: string, dateString: string, minutes: number) => {
    const nextHabits = habits.map((habit) => {
      if (habit.id === habitId) {
        const nextMins = { ...(habit.focusMinutes || {}) };
        nextMins[dateString] = (nextMins[dateString] || 0) + minutes;
        
        // Also automatically mark as completed for today if not already
        const completed = [...habit.completedDates];
        if (!completed.includes(dateString)) {
          completed.push(dateString);
        }
        
        return { ...habit, focusMinutes: nextMins, completedDates: completed };
      }
      return habit;
    });
    saveHabitsToStorage(nextHabits);
  };

  // 9. Action Handle: Add Custom Habit
  const handleAddHabit = (newHabitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'archived'>) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: `habit-${Date.now()}`,
      createdAt: new Date().toISOString(),
      completedDates: [],
      archived: false,
    };
    saveHabitsToStorage([newHabit, ...habits]);
  };

  // 10. Filter and Search Logic
  const filteredHabits = habits.filter((habit) => {
    const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || habit.category === selectedCategory;
    const matchesTab = currentTab === 'active' ? !habit.archived : habit.archived;
    return matchesSearch && matchesCategory && matchesTab;
  });

  // Calculate day headers in Chinese, Japanese or English
  const getFormattedToday = () => {
    const d = new Date();
    if (lang === 'zh') {
      const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const date = d.getDate();
      const dayName = days[d.getDay()];
      return `${year}年${month}月${date}日 · ${dayName}`;
    } else if (lang === 'ja') {
      const days = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const date = d.getDate();
      const dayName = days[d.getDay()];
      return `${year}年${month}月${date}日 · ${dayName}`;
    } else {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayName = days[d.getDay()];
      const monthName = months[d.getMonth()];
      const date = d.getDate();
      const year = d.getFullYear();
      return `${dayName}, ${monthName} ${date}, ${year}`;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50" id="app-root">
      {/* Dynamic top elevation glass bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/50 bg-white/80 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md dark:bg-indigo-500">
              <Sparkles className="h-5.5 w-5.5 fill-current" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-zinc-955 dark:text-zinc-50 leading-tight">
                {t.appName}
              </h1>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 block">
                {getFormattedToday()}
              </span>
            </div>
          </div>

          {/* Theme custom settings & Quick Add triggers */}
          <div className="flex items-center gap-2">
            {/* Minimalist International Language Selector Dropdown */}
            <select
              value={lang}
              onChange={(e) => {
                triggerHaptic();
                const nextLang = e.target.value as Language;
                setLang(nextLang);
                localStorage.setItem('minimal_habit_tracker_language', nextLang);
              }}
              className="flex h-10 px-2 sm:px-3 text-xs font-semibold items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-650 outline-none hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-all shadow-sm cursor-pointer"
              title="切换语言 / Switch Language / 言語切替"
              id="language-selector"
            >
              <option value="zh">🇨🇳 中文</option>
              <option value="en">🇺🇸 EN</option>
              <option value="ja">🇯🇵 日本語</option>
            </select>

            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-650 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-all shadow-sm"
              title={isDarkMode ? '切换浅色模式' : '切换深色模式'}
              id="theme-toggler"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all dark:bg-indigo-500 dark:hover:bg-indigo-400"
              id="btn-trigger-add-habit"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span className="hidden sm:inline">{t.addHabitDefault}</span>
            </motion.button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 space-y-6" id="main-content">
        {/* Overall dynamic circular progress gauge */}
        <OverallProgress habits={habits} lang={lang} />

        {/* Dynamic header stats board */}
        <StatsPanel habits={habits} lang={lang} />

        {/* Global Focus Pomodoro Console */}
        <GlobalFocusTimer
          habits={habits}
          onAddFocusMinutes={handleAddFocusMinutes}
          onToggleDate={handleToggleDate}
          lang={lang}
        />

        {/* Dynamic filter toolbar */}
        <div className="rounded-3xl border border-zinc-150 bg-white p-4.5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900 space-y-3.5" id="filter-bar">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.filterSearchPlaceholder}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2.5 text-xs text-zinc-805 placeholder-zinc-400 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-indigo-400"
                id="search-habits-input"
              />
            </div>

            {/* Segmented Switch for Tabs: Active vs Archived */}
            <div className="inline-flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-950 self-start sm:self-auto">
              <button
                onClick={() => setCurrentTab('active')}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                  currentTab === 'active'
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
                id="tab-active"
              >
                {lang === 'zh' ? '正在进行' : lang === 'ja' ? '実行中' : 'Active'}
              </button>
              <button
                onClick={() => setCurrentTab('archived')}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                  currentTab === 'archived'
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-805 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
                id="tab-archived"
              >
                {lang === 'zh' ? '已归档' : lang === 'ja' ? 'アーカイブ' : 'Archived'}
              </button>
            </div>
          </div>

          {/* Quick Category Filtering Chips */}
          <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-3.5">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold mr-1">{t.allHabitsFilter}</span>
            {[
              { id: 'all', label: t.filterAll },
              { id: 'health', label: `🏥 ${t.filterHealth}` },
              { id: 'sport', label: `💪 ${t.filterSport}` },
              { id: 'mind', label: `🧘 ${t.filterMind}` },
              { id: 'work', label: `💼 ${t.filterWork}` },
              { id: 'custom', label: `✨ ${t.filterCustom}` }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-400'
                    : 'text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
                }`}
                id={`chip-cat-${cat.id}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Habit items lists */}
        <div className="relative">
          <AnimatePresence mode="popLayout">
            {filteredHabits.length > 0 ? (
              <motion.div 
                layout 
                className="grid grid-cols-1 gap-5 md:grid-cols-2"
                id="habit-cards-grid"
              >
                {filteredHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    days={days}
                    onToggleDate={handleToggleDate}
                    onDelete={handleDeleteHabit}
                    onToggleArchive={handleToggleArchive}
                    onUpdateNotes={handleUpdateNotes}
                    onAddFocusMinutes={handleAddFocusMinutes}
                    lang={lang}
                  />
                ))}
              </motion.div>
            ) : (
              // Empty State view card
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800/80 p-12 text-center bg-white dark:bg-zinc-900/40"
                id="empty-state-container"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900/60 text-zinc-400 dark:text-zinc-500 mb-4 shadow-inner">
                  <CalendarMinus2 className="h-8 w-8 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">没有查找到习惯</h3>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500 max-w-xs mx-auto">
                  {searchQuery || selectedCategory !== 'all' 
                    ? '尝试更改您的筛选条件或搜索关键词' 
                    : currentTab === 'archived'
                      ? '暂无已归档的习惯项目'
                      : '记录自律生活，从添加第一个每日好习惯开始吧！'
                  }
                </p>

                <div className="mt-5.5 flex items-center justify-center gap-2.5">
                  {!searchQuery && selectedCategory === 'all' && currentTab === 'active' ? (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center gap-1 rounded-2xl bg-indigo-600 px-4.5 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                      id="btn-empty-add"
                    >
                      <Plus className="h-4 w-4" />
                      <span>创建习惯</span>
                    </button>
                  ) : null}
                  
                  {habits.length === 0 && (
                    <button
                      onClick={handleResetDefaults}
                      className="flex items-center gap-1 rounded-2xl bg-zinc-100 border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      id="btn-empty-reset"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>载入精选推荐</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Control Preferences Actions (Lower priority footer action) */}
        {habits.length > 0 && (
          <div className="flex justify-between items-center text-xs text-zinc-400 pt-6 border-t border-zinc-200/40 dark:border-zinc-800/40" id="footer-actions">
            <span className="font-mono">自律，即是绝对的自由 · {habits.length} 个习惯</span>
            <div className="flex gap-4">
              <button 
                onClick={handleExportData} 
                className="hover:text-indigo-500 dark:hover:text-indigo-400 flex items-center gap-1 font-medium transition-colors"
                id="btn-footer-export"
              >
                <Download className="h-3.5 w-3.5" />
                导出习惯数据
              </button>
              <button 
                onClick={handleResetDefaults} 
                className="hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center gap-1 font-medium transition-colors"
                id="btn-footer-reset"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                重置默认习惯
              </button>
              <button 
                onClick={handleClearAll} 
                className="hover:text-rose-500 flex items-center gap-1 font-medium transition-colors"
                id="btn-footer-clear"
              >
                <Trash2 className="h-3.5 w-3.5" />
                清空数据
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Add Habit dynamic Form Modality */}
      <AddHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddHabit={handleAddHabit}
        lang={lang}
      />
    </div>
  );
}
