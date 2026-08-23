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

export type GoogleLoginRequest = {
  idToken?: string;
  credential?: string;
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

export type PlanInterval = "one_time" | "month" | "year" | "forever";
export type PlanStatus = "draft" | "published" | "archived";
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "expired";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";
export type PaymentMethod =
  | "card"
  | "bank_transfer"
  | "cash"
  | "manual"
  | "other";
export type RevenueGroupBy = "day" | "week" | "month";
export type AdminUserAccountStatus = "active" | "banned" | "trashed";
export type AdminUserStatusFilter =
  | "live"
  | "active"
  | "banned"
  | "trashed"
  | "all";
export type AdminUserSort = "createdAt" | "lastActiveAt" | "name" | "email";
export type SortOrder = "asc" | "desc";

export type PlanLimits = {
  maxHabits?: number | null;
  heatmapDays?: number | null;
  reminders?: number | "one_device" | "all_devices";
  export?: Array<"csv" | "json">;
  sharedBoards?: boolean;
  adminSeats?: number | null;
  stats?: boolean;
};

export type PackageFeature = {
  isActive: boolean;
  name: string;
};

export type PublicPlan = {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  priceCents: number;
  currency: string;
  interval: PlanInterval;
  intervalCount: number;
  seatBased: boolean;
  highlighted: boolean;
  ctaLabel: string;
  ctaHref: string;
  features: PackageFeature[];
  limits: PlanLimits;
};

export type AdminPlan = PublicPlan & {
  status: PlanStatus;
  sortOrder: number;
  currentVersion: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
};

export type CreatePlanInput = {
  slug: string;
  name: string;
  blurb: string;
  priceCents: number;
  currency?: string;
  interval: PlanInterval;
  intervalCount?: number;
  seatBased?: boolean;
  highlighted?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  features: string[];
  limits?: PlanLimits;
};

export type UpdatePlanInput = Partial<CreatePlanInput>;

export type UpdatePlanResponse = {
  plan: AdminPlan;
  versionCreated: boolean;
  message: string | null;
};

export type CompareRow = {
  key: string;
  label: string;
  values: Record<string, PackageFeature>;
};

export type ComparePlanSummary = {
  slug: string;
  name: string;
  highlighted: boolean;
  priceCents: number;
  price: number;
  currency: string;
  interval: PlanInterval;
  ctaLabel: string;
};

export type CompareResponse = {
  plans: ComparePlanSummary[];
  features: CompareRow[];
};

export type PricingPackage = {
  package: string;
  slug: string;
  price: number;
  priceCents: number;
  currency: string;
  interval: PlanInterval;
  highlighted: boolean;
  ctaLabel: string;
  ctaHref: string;
  blurb: string;
  features: PackageFeature[];
};

export type GrantPlanAccessInput = {
  planSlug?: "pro-year" | "pro-lifetime";
  accessType: "timed" | "lifetime";
  days?: number;
  notes?: string;
};

export type UserEntitlements = {
  planSlug: string;
  planName: string;
  tier: "free" | "pro";
  source: "subscription" | "complimentary" | "default";
  limits: PlanLimits;
  aiEnabled: boolean;
  activeHabits: number;
  maxHabits: number | null;
  expiresAt: string | null;
  isLifetime: boolean;
};

export type AdminUserPlan = {
  id: string;
  slug: string;
  name: string;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  timezone: string;
  role: UserRole;
  status: AdminUserAccountStatus;
  emailVerified: boolean;
  createdAt: string;
  lastActiveAt: string | null;
  bannedAt: string | null;
  bannedReason: string | null;
  deletedAt: string | null;
  habitCount: number;
  plan: AdminUserPlan | null;
};

export type AdminUserListResponse = {
  users: AdminUser[];
  page: number;
  limit: number;
  total: number;
  pageCount: number;
};

export type ListAdminUsersQuery = {
  q?: string;
  role?: UserRole;
  status?: AdminUserStatusFilter;
  planSlug?: string;
  emailVerified?: "true" | "false";
  page?: number;
  limit?: number;
  sort?: AdminUserSort;
  order?: SortOrder;
};

export type UpdateAdminUserInput = {
  name?: string;
  role?: UserRole;
};

export type BanUserInput = {
  reason?: string;
};

export type PersonRef = {
  id: string;
  name: string;
  email: string;
};

export type AdminSubscription = {
  id: string;
  status: SubscriptionStatus;
  seats: number;
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  trialEndsAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user: PersonRef;
  plan: {
    id: string;
    slug: string;
    name: string;
    priceCents: number;
    currency: string;
    interval: PlanInterval;
    intervalCount: number;
  };
};

export type AdminSubscriptionListResponse = {
  subscriptions: AdminSubscription[];
  page: number;
  limit: number;
  total: number;
  pageCount: number;
};

export type ListAdminSubscriptionsQuery = {
  q?: string;
  status?: SubscriptionStatus;
  planId?: string;
  userId?: string;
  page?: number;
  limit?: number;
};

export type SubscriptionPaymentInput = {
  amountCents?: number;
  currency?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
  paidAt?: string;
  description?: string;
};

export type CreateSubscriptionInput = {
  userId: string;
  planId: string;
  status?: SubscriptionStatus;
  seats?: number;
  currentPeriodStart?: string;
  currentPeriodEnd?: string | null;
  trialEndsAt?: string | null;
  notes?: string;
  payment?: SubscriptionPaymentInput;
};

export type UpdateSubscriptionInput = {
  planId?: string;
  status?: SubscriptionStatus;
  seats?: number;
  currentPeriodStart?: string;
  currentPeriodEnd?: string | null;
  trialEndsAt?: string | null;
  notes?: string | null;
};

export type CancelSubscriptionInput = {
  atPeriodEnd?: boolean;
  notes?: string;
};

export type RenewSubscriptionInput = {
  payment?: SubscriptionPaymentInput;
};

export type AdminPayment = {
  id: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  provider: string | null;
  providerRef: string | null;
  description: string | null;
  notes: string | null;
  paidAt: string;
  refundedAt: string | null;
  createdAt: string;
  user: PersonRef;
  plan: { id: string; slug: string; name: string } | null;
  subscriptionId: string | null;
  recordedById: string | null;
};

export type AdminPaymentListResponse = {
  payments: AdminPayment[];
  page: number;
  limit: number;
  total: number;
  pageCount: number;
};

export type ListAdminPaymentsQuery = {
  q?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  userId?: string;
  planId?: string;
  subscriptionId?: string;
  currency?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export type CreatePaymentInput = {
  userId?: string;
  subscriptionId?: string;
  planId?: string;
  amountCents: number;
  currency?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  provider?: string;
  providerRef?: string;
  description?: string;
  notes?: string;
  paidAt?: string;
};

export type UpdatePaymentInput = {
  status?: "pending" | "succeeded" | "failed";
  notes?: string | null;
  description?: string | null;
  provider?: string | null;
  providerRef?: string | null;
};

export type RefundPaymentInput = {
  notes?: string;
};

export type AdminUserDetail = {
  user: AdminUser & {
    weekStartsOn: number;
    emailVerifiedAt: string | null;
  };
  subscriptions: AdminSubscription[];
  payments: AdminPayment[];
};

export type RevenueQuery = {
  from?: string;
  to?: string;
  groupBy?: RevenueGroupBy;
  currency?: string;
  planId?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
};

export type RevenueTotals = {
  grossCents: number;
  refundedCents: number;
  netCents: number;
  paymentCount: number;
  refundCount: number;
  averageCents: number;
};

export type RevenueSeriesPoint = {
  period: string;
  grossCents: number;
  refundedCents: number;
  netCents: number;
  paymentCount: number;
};

export type RevenueBreakdownRow = {
  key: string;
  label: string;
  grossCents: number;
  refundedCents: number;
  netCents: number;
  paymentCount: number;
};

export type RevenueResponse = {
  from: string;
  to: string;
  groupBy: RevenueGroupBy;
  currency: string | null;
  totals: RevenueTotals;
  series: RevenueSeriesPoint[];
  byPlan: RevenueBreakdownRow[];
  byMethod: RevenueBreakdownRow[];
  byStatus: RevenueBreakdownRow[];
};

export type PaymentProvider = "stripe" | "sslcommerz";

export type BillingConfig = {
  /** @deprecated Use billingConfig.stripe.publishableKey */
  publishableKey: string;
  /** @deprecated Use billingConfig.stripe.configured || billingConfig.sslcommerz.configured */
  configured: boolean;
  stripe: {
    publishableKey: string;
    configured: boolean;
  };
  sslcommerz: {
    configured: boolean;
    sandbox: boolean;
    successUrl: string;
    failUrl: string;
    cancelUrl: string;
  };
};

export type CustomerPlanSummary = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
  interval: PlanInterval;
  intervalCount: number;
  features: string[];
};

export type CustomerSubscription = {
  id: string;
  status: SubscriptionStatus;
  seats: number;
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  cancelAtPeriodEnd: boolean;
  plan: CustomerPlanSummary;
};

export type CustomerInvoice = {
  id: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  paidAt: string;
  description: string | null;
  receiptUrl: string | null;
};

export type CheckoutInput = {
  planId: string;
  provider?: PaymentProvider;
  seats?: number;
  successUrl?: string;
  cancelUrl?: string;
};

export type ConfirmCheckoutInput =
  | { provider: "stripe"; sessionId: string }
  | { provider: "sslcommerz"; tranId: string; valId?: string };

export type CheckoutResponse = {
  provider: PaymentProvider;
  url: string | null;
  sessionId: string | null;
  publishableKey: string;
  subscription: CustomerSubscription | null;
};

export type NotificationAudience = "user" | "admin";

export type NotificationType =
  | "welcome"
  | "email_verified"
  | "habit_created"
  | "habit_completed"
  | "habit_streak"
  | "payment_succeeded"
  | "payment_failed"
  | "payment_refunded"
  | "subscription_started"
  | "subscription_renewed"
  | "subscription_canceled"
  | "subscription_past_due"
  | "user_banned"
  | "user_unbanned"
  | "plan_published"
  | "admin_new_user"
  | "admin_new_payment"
  | "admin_subscription_canceled"
  | "admin_user_banned";

export type AppNotification = {
  id: string;
  audience: NotificationAudience;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
};

export type NotificationListResponse = {
  notifications: AppNotification[];
  page: number;
  limit: number;
  total: number;
  pageCount: number;
  unreadCount: number;
};

export type ListNotificationsQuery = {
  unread?: "true" | "false";
  type?: NotificationType;
  page?: number;
  limit?: number;
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

export type AiFocus = "habits" | "streaks" | "schedule" | "general";

export type AiSuggestionsInput = {
  focus?: AiFocus;
  prompt?: string;
};

export type AiHabitIdeasInput = {
  goal?: string;
  interests?: string;
  count?: number;
};

export type AiHabitMessageInput = {
  habitId: string;
  context?: "check_in" | "streak" | "missed" | "celebration" | "general";
};

export type AiSuggestion = {
  title: string;
  body: string;
  category: "habit" | "schedule" | "motivation" | "recovery";
};

export type AiSuggestionsResponse = {
  suggestions: AiSuggestion[];
  planSlug: string;
  source: "gemini" | "fallback";
};

export type AiHabitIdea = {
  title: string;
  description: string;
  type: HabitTypeApi;
  scheduleType: HabitScheduleType;
  scheduleLabel: string;
  reason: string;
  icon: string;
};

export type AiHabitIdeasResponse = {
  ideas: AiHabitIdea[];
  planSlug: string;
  source: "gemini" | "fallback";
};

export type AiHabitMessageResponse = {
  habitId: string;
  habitTitle: string;
  message: string;
  planSlug: string;
  source: "gemini" | "fallback";
};

export type AiStatusResponse = {
  enabled: boolean;
  planSlug: string;
  tier: "free" | "pro";
  geminiConfigured: boolean;
};
