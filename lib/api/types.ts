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
