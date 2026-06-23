/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'zh' | 'en' | 'ja';

export interface TranslationSchema {
  // App Header
  appName: string;
  appSubtitle: string;
  langSelector: string;
  resetDefault: string;
  themeToggle: string;
  confirmReset: string;

  // Stats Panel
  totalCheckins: string;
  currentStreak: string;
  longestStreak: string;
  activeGoals: string;
  monthlyAverage: string;
  radarTitle: string;
  radarDescription: string;
  insightsTitle: string;
  noHabitsInsight: string;
  noCheckinsInsight: string;
  insightExpert: string;
  insightProgressing: string;
  insightNewbie: string;
  insightImprovement: string;
  insightExpandGrid: string;
  insightGoldenRule: string;

  // Focus Timer
  timerTitle: string;
  timerSubtitle: string;
  timerFocusFocus: string;
  timerChoosePreset: string;
  timerFocusMin: string;
  timerStart: string;
  timerPause: string;
  timerChimeNotice: string;
  timerManualLogTitle: string;
  timerManualLogSub: string;
  timerMinutesLabel: string;
  timerMinutesText: string;
  timerSubmitLog: string;
  timerSuccessTitle: string;
  timerSuccessSub: string;
  timerQuickLogSuccess: string;
  timerAchievementCount: string;
  timerTomatoUnit: string;

  // Filters & Toolbar
  filterSearchPlaceholder: string;
  filterAll: string;
  filterHealth: string;
  filterSport: string;
  filterMind: string;
  filterWork: string;
  filterCustom: string;
  showArchived: string;
  activeHabitsCount: string;
  allHabitsFilter: string;

  // Add Habit Dialog
  addHabitTitle: string;
  addHabitNameLabel: string;
  addHabitCategoryLabel: string;
  addHabitIconLabel: string;
  addHabitColorLabel: string;
  addHabitPlaceholder: string;
  addHabitCancel: string;
  addHabitSubmit: string;
  addHabitDefault: string;

  // Habit Card
  habitCardStreak: string;
  habitCardMaxStreak: string;
  habitCardFocusCount: string;
  habitCardRate: string;
  habitCardWeekRecords: string;
  habitCardTotalCheckins: string;
  habitCardNotesHeader: string;
  habitCardPillTimer: string;
  habitCardPillCalendar: string;
  habitCardConfirm: string;
  habitCardCancel: string;
  habitCardDoubleclickNotice: string;
  habitCardSelectedDate: string;
  habitCardToday: string;
  habitCardManualCheckin: string;
  habitCardCancelCheckin: string;
  habitCardDiaryBtn: string;
  habitCardWriteDiaryNotice: string;
  habitCardDiaryTitle: string;
  habitCardDiaryPlaceholder: string;
  habitCardDiarySub: string;
  habitCardSaveDiary: string;
  habitCardEditNoteTitle: string;
}

export const translations: Record<Language, TranslationSchema> = {
  zh: {
    appName: "Minimalist 极简自律飞轮",
    appSubtitle: "高能量时间与习惯微雕 · 双轨心智自律平台",
    langSelector: "🌐 语言 (Language)",
    resetDefault: "恢复内置默认",
    themeToggle: "转换环境光效",
    confirmReset: "您确定要恢复系统默认的初始自律目标吗？现有改动将被重置。",

    totalCheckins: "累计自律打卡",
    currentStreak: "当前最高连续",
    longestStreak: "历史最高连续",
    activeGoals: "进行中自律微习惯",
    monthlyAverage: "30天平均打卡率",
    radarTitle: "五维自律能量雷达",
    radarDescription: "分类打卡率",
    insightsTitle: "智能自律洞察",
    noHabitsInsight: "✨ 记录自律生活，从添加第一个每日好习惯开始吧！每天迈出一小步也是胜利。",
    noCheckinsInsight: "💡 您还没有为各分类习惯打卡，点击下角日历按钮或者卡片日期可快速打卡、记录日记。",
    insightExpert: "🌟 **自律达人**：你的「{category}」习惯本月完成率高达 **{rate}%**，属于硬核选手！这股势不可挡的力量，正默默重塑你的人生。",
    insightProgressing: "🔥 **渐入佳境**：你在「{category}」领域最热烈！已形成身心惯性，继续捍卫连续天数，让优秀变成习惯。",
    insightNewbie: "🌱 **萌芽新星**：目前最活跃的是「{category}」，万事开头难，微小习惯的持续叠加，会在时间里产生惊人的复利。",
    insightImprovement: "💡 **温馨关怀**：相比之下，「{category}」有些小小卡顿（完成率仅 **{rate}%**）。今天不妨开启 5 分钟极简微目标，用低难度攻克拖延症~",
    insightExpandGrid: "🎯 **拓展边界**：尝试挑战其他维度的习惯（例如「心智练习」或「工作提升」），把自律雷达网越编越美！",
    insightGoldenRule: "✨ **黄金法则**：降低门槛先行一步，多类别综合推进。今天的微小付出，都是未来的蓄力加冕！",

    timerTitle: "⏱️ 自律番茄能量飞轮 (Central Focus Console)",
    timerSubtitle: "番茄工作法：选定当前的自律重心进行沉浸式高能量专注。完成倒计时即可自动打卡、同步累积专注时间！",
    timerFocusFocus: "当前自律关注重心：",
    timerChoosePreset: "目标单次专注周期：",
    timerFocusMin: "分钟",
    timerStart: "启动高效计时",
    timerPause: "暂停专注",
    timerChimeNotice: "ℹ️ 倒计时结束后，将发出和缓磬音并自动完成今日打卡，打卡与时长监督合二为一！",
    timerManualLogTitle: "🚀 极速登记 · 飞轮加倍",
    timerManualLogSub: "手工直录学习时长与打卡",
    timerMinutesLabel: "输入今日实际专注时长 (分钟)：",
    timerMinutesText: "分钟",
    timerSubmitLog: "直接补登 & 同步打卡",
    timerSuccessTitle: "🎉 功德加持！恭喜您斩获一个自律时间！",
    timerSuccessSub: "刚才专注的 {minutes} 分钟已成功录入指定习惯。今天的坚持，铸就明天的伟岸丰碑！",
    timerQuickLogSuccess: "登记完成！今日好习惯打卡已同步刷新。",
    timerAchievementCount: "今日番茄钟战绩",
    timerTomatoUnit: "个番茄",

    filterSearchPlaceholder: "搜寻您的手账习惯与成就...",
    filterAll: "全部维度",
    filterHealth: "健康",
    filterSport: "运动",
    filterMind: "心智",
    filterWork: "工作",
    filterCustom: "自定义",
    showArchived: "查看已归档的旧习惯",
    activeHabitsCount: "个进行中好习惯",
    allHabitsFilter: "习惯分类筛选：",

    addHabitTitle: "🌱 开辟新的微小成就习惯",
    addHabitNameLabel: "习惯名称 (如：冥想10分钟)",
    addHabitCategoryLabel: "习惯维度维度",
    addHabitIconLabel: "推荐图标",
    addHabitColorLabel: "卡片微光色彩主题",
    addHabitPlaceholder: "输入自律微目标，从极简开始...",
    addHabitCancel: "取消",
    addHabitSubmit: "种下习惯种子",
    addHabitDefault: "种下一个好习惯",

    habitCardStreak: "当前连续",
    habitCardMaxStreak: "历史最高",
    habitCardFocusCount: "专注学习",
    habitCardRate: "打卡率",
    habitCardWeekRecords: "最近打卡记录 (本周)",
    habitCardTotalCheckins: "次总打卡",
    habitCardNotesHeader: "最近手账心情：",
    habitCardPillTimer: "⏱️ 专注番茄钟",
    habitCardPillCalendar: "📅 见证/日记",
    habitCardConfirm: "确认",
    habitCardCancel: "取消",
    habitCardDoubleclickNotice: "月度自律见证 (点击日期可打卡/写日记)",
    habitCardSelectedDate: "已选中日期：",
    habitCardToday: "今天",
    habitCardManualCheckin: "标记打卡",
    habitCardCancelCheckin: "取消打卡",
    habitCardDiaryBtn: "手账日志",
    habitCardWriteDiaryNotice: "✍️ 记下心得:",
    habitCardDiaryTitle: "自律手账日志",
    habitCardDiaryPlaceholder: "记录打卡备注、进度或此时的心情心情日志，如：‘今天完成了5公里破了记录，感觉棒极了！’",
    habitCardDiarySub: "点滴文字，铭刻不凡的脚印",
    habitCardSaveDiary: "保存手账",
    habitCardEditNoteTitle: "编辑本条日志",
  },
  en: {
    appName: "Minimalist Discipline Flywheel",
    appSubtitle: "High-Energy Time & Habit Sculpting · Dual Mind-Body Platform",
    langSelector: "🌐 Lang",
    resetDefault: "Reset Default Goals",
    themeToggle: "Toggle Ambient Mode",
    confirmReset: "Are you sure you want to reset all your goals to system defaults? Your current modifications will be safe but overwritten.",

    totalCheckins: "Total Check-ins",
    currentStreak: "Current Streak",
    longestStreak: "Max Streak",
    activeGoals: "Active Micro Habits",
    monthlyAverage: "30-Day Success Rate",
    radarTitle: "5D Discipline Energy Radar",
    radarDescription: "Success Rate",
    insightsTitle: "Intelligent Discipline Insights",
    noHabitsInsight: "✨ Every grand journey starts with a small step. Log your first baby habit now!",
    noCheckinsInsight: "💡 No check-ins locked yet! Double-click calendar cells or check off weekdays below to record your logs.",
    insightExpert: "🌟 **Champion**: Your micro goal \"{category}\" is soaring with a **{rate}%** rate this month! Keep fueling this momentum.",
    insightProgressing: "🔥 **Unstoppable**: You are progressing amazingly in \"{category}\"! The body-mind loop is locked. Protect your streak.",
    insightNewbie: "🌱 **Budding Star**: \"{category}\" is starting to click. Minimal steps compounding daily reap compounding dividends.",
    insightImprovement: "💡 **Supportive Eye**: \"{category}\" is sliding slightly (only **{rate}%** done). Aim for a low-cost 5-min ritual today!",
    insightExpandGrid: "🎯 **Expand Horizons**: Challenge yourself in secondary spheres like Mindfulness or Work to stretch your radar wider!",
    insightGoldenRule: "✨ **Golden Rule**: Lower the hurdle to start, composite categories simultaneously. Small inputs shape grand futures!",

    timerTitle: "⏱️ Pomodoro discipline energy fly-wheel (Central Focus Console)",
    timerSubtitle: "Pomodoro Protocol: Focus on your active focus node. Timer wrap-ups automatically log and complete today's task!",
    timerFocusFocus: "Focus Center of Mass:",
    timerChoosePreset: "Target Segment Cycle:",
    timerFocusMin: "Min",
    timerStart: "Deploy High-Energy Wave",
    timerPause: "Hold Wave",
    timerChimeNotice: "ℹ️ Upon complete, a gentle bell ring chimes and automatically fires check-ins, combining logs & focus closely!",
    timerManualLogTitle: "🚀 Speed Check-in · Flywheel Boost",
    timerManualLogSub: "Directly Append Spent Minutes",
    timerMinutesLabel: "Spent minutes to record today:",
    timerMinutesText: "min",
    timerSubmitLog: "Fast Submit & Check-in",
    timerSuccessTitle: "🎉 Awesome Focus Zone Completed!",
    timerSuccessSub: "Those {minutes} minutes are securely saved onto the habit target. Small micro-milestones cement deep longevity!",
    timerQuickLogSuccess: "Success! Your habit and spent focus limits are synced and updated.",
    timerAchievementCount: "Today's Pomodoros",
    timerTomatoUnit: "Tomatoes",

    filterSearchPlaceholder: "Search through your micro-journaling achievements...",
    filterAll: "All Spheres",
    filterHealth: "Health",
    filterSport: "Sport",
    filterMind: "Mindfulness",
    filterWork: "Work productivity",
    filterCustom: "Custom",
    showArchived: "Show archived micro goals",
    activeHabitsCount: "Active habits in progress",
    allHabitsFilter: "Habit categorization filters:",

    addHabitTitle: "🌱 Seed a Fresh Habit",
    addHabitNameLabel: "Habit Name (e.g., Meditate 10m)",
    addHabitCategoryLabel: "Habit Sphere / Category",
    addHabitIconLabel: "Launcher Icon",
    addHabitColorLabel: "Aura Ambient Theme Color",
    addHabitPlaceholder: "Define your baby-step target. Simplify to lock down...",
    addHabitCancel: "Close",
    addHabitSubmit: "Seed This Goal",
    addHabitDefault: "Plant a solid habit",

    habitCardStreak: "Current Streak",
    habitCardMaxStreak: "All-Time High",
    habitCardFocusCount: "Focus Time",
    habitCardRate: "Sucess Rate",
    habitCardWeekRecords: "Recent Check-ins (This Week)",
    habitCardTotalCheckins: "check-ins total",
    habitCardNotesHeader: "Recent feeling-tones:",
    habitCardPillTimer: "⏱️ Focus Timer",
    habitCardPillCalendar: "📅 Monthly Logs",
    habitCardConfirm: "OK",
    habitCardCancel: "Undo",
    habitCardDoubleclickNotice: "Monthly Calendar Ledger (Click to view; Double-click to toggle)",
    habitCardSelectedDate: "Target Ledger Date:",
    habitCardToday: "Today",
    habitCardManualCheckin: "Unlock Check-in",
    habitCardCancelCheckin: "Drop Check-in",
    habitCardDiaryBtn: "Diary Entry",
    habitCardWriteDiaryNotice: "✍️ Moment Journal:",
    habitCardDiaryTitle: "Discipline Moment Journal",
    habitCardDiaryPlaceholder: "Record thoughts, lessons, or feelings, e.g., 'Completed a 5k jog running with swift style, felt majestic!'",
    habitCardDiarySub: "Handwritten marks tracing your beautiful self-growth path",
    habitCardSaveDiary: "Attach Entry",
    habitCardEditNoteTitle: "Edit this moment card",
  },
  ja: {
    appName: "Minimalist 自己律エネルギー駒",
    appSubtitle: "時差分散習慣微彫刻 · 心身デュアル自動フィードバック",
    langSelector: "🌐 言語選択",
    resetDefault: "既定値を復元",
    themeToggle: "ライトモード切替",
    confirmReset: "プリセットされた自己規律目標を復元してもよろしいですか？現在の調整はリセットされます。",

    totalCheckins: "累計チェックイン数",
    currentStreak: "現在継続日数",
    longestStreak: "過去最高継続",
    activeGoals: "実行中の習慣ターゲット",
    monthlyAverage: "30日平均達成率",
    radarTitle: "五次元自律エネルギーレーダー",
    radarDescription: "完了率",
    insightsTitle: "AI自己律インサイト",
    noHabitsInsight: "✨ 自己管理の生活を記録しましょう！最初の習慣を追加することから始めます。",
    noCheckinsInsight: "💡 まだチェックイン記録がありません。カレンダーをダブルクリック、またはチェックして記録を開始しましょう。",
    insightExpert: "🌟 **インフルエンサー**：あなたの「{category}」は今月 **{rate}%** の高い完成率を達成しています！素晴らしい進度です。",
    insightProgressing: "🔥 **順風満帆**：あなたは「{category}」分野で最も熱心です！この調子で連勝記録を守りましょう。",
    insightNewbie: "🌱 **未来の星**：現在活発なのは「{category}」です。小さな一歩を続けることで複利の効果が生まれます。",
    insightImprovement: "💡 **暖かい配慮**：比較すると、「{category}」が少し遅れています（達成率 **{rate}%**）。今日は5分のミニ目標から始めましょう。",
    insightExpandGrid: "🎯 **限界を広げる**：ほかの次元（例えばマインドフルネスや仕事効率）の習慣にも挑戦し、レーダーを大きくしましょう！",
    insightGoldenRule: "✨ **黄金律**：始める障壁を下げて複数カテゴリーを並行。今日の小さな行動が明日の大きな成果になります！",

    timerTitle: "⏱️ 集中ポモドーロ自律エネルギー (Central Focus Console)",
    timerSubtitle: "ポモドーロテクニック：目標を選択して没頭します。カウントダウン完了で自動打刻、フォーカス時間が蓄積されます！",
    timerFocusFocus: "今日の集中習慣ノード：",
    timerChoosePreset: "フォーカス目標時間：",
    timerFocusMin: "分",
    timerStart: "集中サイクルを開始",
    timerPause: "一時停止",
    timerChimeNotice: "ℹ️ タイマーが切れると、心地よいチャイムが鳴り今日を自動チェックインします！",
    timerManualLogTitle: "🚀 クイック登録 · スピードアップ",
    timerManualLogSub: "本日の自学時間を手動で追加入力",
    timerMinutesLabel: "今日の学習時間 (分)：",
    timerMinutesText: "分",
    timerSubmitLog: "手動チェックイン & 登録",
    timerSuccessTitle: "🎉 素晴らしいポモドーロセッション完了！",
    timerSuccessSub: "費やした {minutes} 分が習慣に保存されました。今日のこだわりが、より強い自分を作ります！",
    timerQuickLogSuccess: "登録完了！本日の習慣チェックインが連動更新されました。",
    timerAchievementCount: "本日のポモドーロ数",
    timerTomatoUnit: "ポモドーロ",

    filterSearchPlaceholder: "習慣目標やチェックイン日誌を検索...",
    filterAll: "すべての次元",
    filterHealth: "健康増進",
    filterSport: "体力づくり",
    filterMind: "マインドケア",
    filterWork: "仕事効率",
    filterCustom: "マイカスタム",
    showArchived: "アーカイブ済みの習慣を表示する",
    activeHabitsCount: "個の進行中の習慣",
    allHabitsFilter: "習慣カテゴリー絞り込み：",

    addHabitTitle: "🌱 新しいミニ習慣の種をまく",
    addHabitNameLabel: "習慣マイルストーン (例：10分読書)",
    addHabitCategoryLabel: "推奨習慣カテゴリー",
    addHabitIconLabel: "代表的なアイコン",
    addHabitColorLabel: "オーラテーマカラー",
    addHabitPlaceholder: "小さな目標を入力して、自己コントロールを開始...",
    addHabitCancel: "キャンセル",
    addHabitSubmit: "習慣を作成する",
    addHabitDefault: "習慣を追加",

    habitCardStreak: "連続日数",
    habitCardMaxStreak: "最大継続",
    habitCardFocusCount: "フォーカス総量",
    habitCardRate: "完了比率",
    habitCardWeekRecords: "直近の打刻ログ (今週)",
    habitCardTotalCheckins: "打刻総数",
    habitCardNotesHeader: "最近の日誌の一言：",
    habitCardPillTimer: "⏱️ ポモドーロ",
    habitCardPillCalendar: "📅 カレンダー",
    habitCardConfirm: "はい",
    habitCardCancel: "いいえ",
    habitCardDoubleclickNotice: "月間チェックイン台帳 (日付クリックで日誌作成 / ダブルクリックで打刻)",
    habitCardSelectedDate: "選択された日付：",
    habitCardToday: "今日",
    habitCardManualCheckin: "チェックイン",
    habitCardCancelCheckin: "チェック消去",
    habitCardDiaryBtn: "カレンダー日誌",
    habitCardWriteDiaryNotice: "✍️ 思いやり手帳:",
    habitCardDiaryTitle: "カレンダー自律日誌",
    habitCardDiaryPlaceholder: "今日学んだこと、体調、やり遂げた小さな勝利を書き留めましょう。『毎日5％の進歩！』等",
    habitCardDiarySub: "あなたの内省の軌跡を文字に刻む",
    habitCardSaveDiary: "日誌を保存",
    habitCardEditNoteTitle: "日誌エントリーを編集",
  }
};
