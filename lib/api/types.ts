export type UserRole = "admin" | "customer";

export type User = {
  id: string;
  name: string;
  email: string;
  timezone: string;
  weekStartsOn: number;
  avatarUrl: string | null;
  role?: UserRole;
  emailVerified?: boolean;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

/** BFF auth responses never include the refresh token. */
export type ClientAuthResponse = {
  user: User;
  accessToken: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  timezone: string;
};

export type RefreshRequest = {
  refreshToken: string;
};

export type LogoutRequest = {
  refreshToken: string;
};

export type UpdateMeRequest = {
  name?: string;
  timezone?: string;
  weekStartsOn?: number;
  avatarUrl?: string | null;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  password: string;
};

export type VerifyEmailRequest = {
  token: string;
};

export type HabitTypeApi = "BUILD" | "BREAK";

export type HabitScheduleType =
  | "DAILY"
  | "SPECIFIC_DAYS"
  | "TIMES_PER_WEEK"
  | "INTERVAL";

export type Habit = {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  color: string;
  type: HabitTypeApi;
  scheduleType: HabitScheduleType;
  scheduleDays: number[];
  targetPerWeek: number | null;
  intervalDays: number | null;
  targetValue: number | null;
  unit: string | null;
  startDate: string;
  sortOrder: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  currentStreak: number;
  scheduleLabel: string;
  completionRate?: number;
  history?: unknown[];
};

export type HabitListResponse = {
  habits: Habit[];
};

export type HabitResponse = {
  habit: Habit;
};

export type CreateHabitRequest = {
  title: string;
  startDate: string;
  description?: string | null;
  icon?: string;
  color?: string;
  type?: HabitTypeApi;
  scheduleType?: HabitScheduleType;
  scheduleDays?: number[];
  targetPerWeek?: number | null;
  intervalDays?: number | null;
  targetValue?: number | null;
  unit?: string | null;
};

export type UpdateHabitRequest = Partial<CreateHabitRequest>;

export type ReorderHabitsRequest = {
  ids: string[];
};

export type ListHabitsQuery = {
  archived?: boolean;
};

export type LogStatus = "DONE" | "PARTIAL" | "SKIPPED";

export type LogEntry = {
  localDate: string;
  status: LogStatus;
  value: number | null;
  note: string | null;
};

export type HabitLogListItem = LogEntry & {
  habitId: string;
};

export type StreakSnapshot = {
  current: number;
  longest: number;
};

export type UpsertLogRequest = {
  status?: LogStatus;
  value?: number;
  note?: string | null;
};

export type UpsertLogResponse = {
  log: LogEntry;
  streak: StreakSnapshot;
};

export type DeleteLogResponse = {
  log: null;
  streak: StreakSnapshot;
};

export type LogRangeQuery = {
  from: string;
  to: string;
};

export type Reminder = {
  id: string;
  habitId: string;
  timeLocal: string;
  daysOfWeek: number[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateReminderRequest = {
  timeLocal: string;
  daysOfWeek?: number[];
  enabled?: boolean;
};

export type UpdateReminderRequest = {
  timeLocal?: string;
  daysOfWeek?: number[];
  enabled?: boolean;
};

export type ReminderMutationResponse = {
  reminder: Reminder;
  warnings: string[];
};

export type ReminderHabitGroup = {
  habitId: string;
  title: string;
  icon: string;
  reminders: Reminder[];
};

export type GroupedRemindersResponse = {
  habits: ReminderHabitGroup[];
};

export type StatsRange = "7d" | "30d" | "90d" | "365d" | "all";

export type StatsRangeInfo = {
  from: string;
  to: string;
  days: number;
};

export type HabitStatsResponse = {
  range: StatsRangeInfo;
  streak: { current: number; longest: number };
  completion: {
    rate: number;
    due: number;
    done: number;
    skipped: number;
    missed: number;
  };
  byWeekday: Array<{
    day: number;
    name: string;
    due: number;
    done: number;
    rate: number;
  }>;
  byWeek: Array<{
    weekStart: string;
    due: number;
    done: number;
    rate: number;
  }>;
  heatmap: Array<{
    date: string;
    status: LogStatus;
    value: number | null;
    level: number;
  }>;
  totalValue: number | null;
};

export type OverviewStatsResponse = {
  range: StatsRangeInfo;
  totals: {
    activeHabits: number;
    daysTracked: number;
    perfectDays: number;
  };
  completion: {
    rate: number;
    due: number;
    done: number;
  };
  bestStreak: {
    habitId: string;
    title: string;
    length: number;
  } | null;
  byWeekday: Array<{ day: number; name: string; rate: number }>;
  habits: Array<{
    id: string;
    title: string;
    icon: string;
    streak: { current: number; longest: number };
    rate: number;
  }>;
  byWeek: Array<{ weekStart: string; rate: number }>;
};

export type TodayLogSnapshot = {
  status: LogStatus;
  value: number | null;
  note: string | null;
};

export type TodayHabitItem = {
  id: string;
  title: string;
  icon: string;
  color: string;
  type: HabitTypeApi;
  schedule: string;
  targetValue: number | null;
  unit: string | null;
  log: TodayLogSnapshot | null;
  streak: { current: number; longest: number };
  atRisk: boolean;
};

export type TodayNotDueItem = {
  id: string;
  title: string;
  icon: string;
  schedule: string;
  nextDueDate: string | null;
};

export type TodayResponse = {
  date: string;
  summary: {
    total: number;
    completed: number;
    skipped: number;
    rate: number;
  };
  habits: TodayHabitItem[];
  notDueToday: TodayNotDueItem[];
};

export type DevicePlatform = "WEB" | "IOS" | "ANDROID";

export type Device = {
  id: string;
  deviceName: string | null;
  platform: DevicePlatform;
  lastSeenAt: string;
  createdAt: string;
};

export type RegisterDeviceRequest = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  deviceName?: string;
  platform?: DevicePlatform;
};

export type VapidPublicKeyResponse = {
  publicKey: string;
};

export type ApiErrorDetail = {
  field?: string;
  message?: string;
  code?: string;
};

export type ApiErrorEnvelope = {
  error: {
    code: string;
    message: string;
    details: ApiErrorDetail[];
  };
};
