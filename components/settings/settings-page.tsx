"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Camera,
  Check,
  CreditCard,
  Download,
  Globe,
  Lock,
  LogOut,
  Mail,
  Monitor,
  Trash2,
  User,
  type LucideIcon,
} from "lucide-react";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import customer from "@/data/customer.json";
import { PasswordInput } from "@/components/auth/password-input";
import { useToast } from "@/components/auth/toast";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownSelect } from "@/components/ui/dropdown-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TimePicker } from "@/components/ui/time-picker";
import { ApiError } from "@/lib/api/errors";
import { downloadMomentumExport } from "@/lib/account/export";
import { getVapidPublicKey } from "@/lib/api/devices";
import { useAuth } from "@/lib/auth/context";
import { isAdmin } from "@/lib/auth/role";
import { formatDateTime } from "@/lib/dates";
import { useDeleteDevice, useDevices, useRegisterDevice } from "@/lib/devices/hooks";
import {
  getPushSubscription,
  getStoredDeviceId,
  pushSupported,
  setStoredDeviceId,
  subscribeToPush,
  subscriptionToPayload,
  unsubscribeFromPush,
} from "@/lib/devices/push";
import {
  avatar,
  btn,
  btnBlock,
  btnDanger,
  btnGhost,
  btnPrimary,
  btnSm,
  chip,
  chipBlue,
  dialogBtn,
  hint,
  hintErr,
  mono,
} from "@/lib/ui";
import { cn } from "@/lib/utils";

type WeekStart = "saturday" | "sunday" | "monday";

const settingsCard =
  "rounded-2xl bg-paper-white p-5 shadow-paper-sm dark:bg-paper-raised";

const saveBtn = cn(dialogBtn, btnPrimary);
const quietBtn = cn(dialogBtn, btnGhost);
const fieldStack = "grid gap-2";

const WEEK_STARTS: Array<{ value: WeekStart; label: string; note: string }> = [
  { value: "saturday", label: "Saturday", note: "Weekend first" },
  { value: "sunday", label: "Sunday", note: "US default" },
  { value: "monday", label: "Monday", note: "Work week" },
];

const WEEK_START_TO_NUMBER: Record<WeekStart, number> = {
  sunday: 0,
  monday: 1,
  saturday: 6,
};

function weekStartFromNumber(value: number | undefined): WeekStart {
  if (value === 1) return "monday";
  if (value === 6) return "saturday";
  return "sunday";
}

const TIMEZONES = [
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Europe/London",
  "America/New_York",
];

const TIMEZONE_OPTIONS = TIMEZONES.map((zone) => ({
  value: zone,
  label: zone.replaceAll("_", " "),
}));

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

function fileToAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read photo"));
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const size = 384;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not process photo"));
          return;
        }
        const side = Math.min(image.width, image.height);
        const sx = (image.width - side) / 2;
        const sy = (image.height - side) / 2;
        ctx.drawImage(image, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      image.onerror = () => reject(new Error("Could not process photo"));
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function initialFromName(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

function SectionHead({
  id,
  title,
  note,
  icon: Icon,
  tone = "blue",
}: {
  id: string;
  title: string;
  note?: string;
  icon: LucideIcon;
  tone?: "blue" | "danger";
}) {
  return (
    <div className="mb-5 flex items-start gap-3.5">
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl",
          tone === "danger"
            ? "bg-flame-soft text-danger-ink"
            : "bg-blue-soft text-blue",
        )}
      >
        <Icon size={18} strokeWidth={2.2} aria-hidden />
      </span>
      <div className="min-w-0 pt-0.5">
        <h2
          id={id}
          className="m-0 font-heading text-lg font-semibold tracking-tight"
        >
          {title}
        </h2>
        {note ? (
          <p className="mt-1 text-[0.88rem] leading-snug text-muted-foreground">
            {note}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function SettingsPage() {
  const reduce = useReducedMotion();
  const { pushToast } = useToast();
  const { user, updateMe, changePassword, logout, logoutAll, resendVerification } =
    useAuth();
  const admin = isAdmin(user);

  const defaultName = user?.name?.trim() || customer.profile.name;
  const defaultEmail = user?.email?.trim() || customer.profile.email;
  const defaultTimezone = user?.timezone || customer.profile.timezone;

  const [name, setName] = useState(defaultName);
  const [email] = useState(defaultEmail);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
    {},
  );

  const [timezone, setTimezone] = useState(
    TIMEZONES.includes(defaultTimezone) ? defaultTimezone : customer.profile.timezone,
  );
  const [weekStartsOn, setWeekStartsOn] = useState<WeekStart>(
    weekStartFromNumber(user?.weekStartsOn ?? customer.profile.weekStartsOn),
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingTime, setSavingTime] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);
  const [exporting, setExporting] = useState<"JSON" | "CSV" | null>(null);
  const [resendingVerification, setResendingVerification] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );

  const [pushBrowser, setPushBrowser] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [weeklyEmail, setWeeklyEmail] = useState(customer.notifications.weeklyEmail);
  const [quietFrom, setQuietFrom] = useState(customer.notifications.quietFrom);
  const [quietTo, setQuietTo] = useState(customer.notifications.quietTo);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    user?.avatarUrl ?? null,
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const devicesQuery = useDevices();
  const registerDevice = useRegisterDevice();
  const removeDevice = useDeleteDevice();
  const devices = devicesQuery.data ?? [];

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const avatarInitial = useMemo(() => initialFromName(name), [name]);
  const avatarSrc = photoPreview || user?.avatarUrl || null;
  const canDelete = deleteConfirm.trim().toUpperCase() === "DELETE";

  useEffect(() => {
    if (user?.avatarUrl) setPhotoPreview(user.avatarUrl);
  }, [user?.avatarUrl]);

  useEffect(() => {
    setCurrentDeviceId(getStoredDeviceId());
    void getPushSubscription().then((subscription) => {
      if (subscription) setPushBrowser(true);
    });
  }, []);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Enter your name";
    setProfileErrors(next);
    if (Object.keys(next).length) return;

    setSavingProfile(true);
    try {
      await updateMe({ name: name.trim() });
      pushToast("Profile saved");
    } catch (err) {
      if (err instanceof ApiError) {
        const fromApi = err.fieldErrors();
        if (Object.keys(fromApi).length) setProfileErrors(fromApi);
        else pushToast(err.message);
      } else {
        pushToast("Couldn’t save profile");
      }
    } finally {
      setSavingProfile(false);
    }
  }

  async function onPhotoPicked(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      pushToast("Choose a JPG or PNG photo");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      pushToast("Photo must be 2 MB or smaller");
      return;
    }

    setUploadingPhoto(true);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setPhotoPreview(dataUrl);
      await updateMe({ avatarUrl: dataUrl });
      pushToast("Photo updated");
    } catch (err) {
      pushToast(
        err instanceof ApiError ? err.message : "Couldn’t update photo",
      );
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function saveTime(event: React.FormEvent) {
    event.preventDefault();
    setSavingTime(true);
    try {
      await updateMe({
        timezone,
        weekStartsOn: WEEK_START_TO_NUMBER[weekStartsOn],
      });
      pushToast("Timezone updated — reminders moved with you");
    } catch (err) {
      pushToast(
        err instanceof ApiError ? err.message : "Couldn’t update timezone",
      );
    } finally {
      setSavingTime(false);
    }
  }

  async function updatePassword(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!currentPassword) next.currentPassword = "Enter your current password";
    if (newPassword.length < 8) {
      next.newPassword = "Password must be at least 8 characters";
    }
    setPasswordErrors(next);
    if (Object.keys(next).length) return;

    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      pushToast("Password changed — other devices signed out");
    } catch (err) {
      if (err instanceof ApiError) {
        const fromApi = err.fieldErrors();
        if (Object.keys(fromApi).length) setPasswordErrors(fromApi);
        else pushToast(err.message);
      } else {
        pushToast("Couldn’t update password");
      }
    } finally {
      setSavingPassword(false);
    }
  }

  async function sendVerification() {
    setResendingVerification(true);
    try {
      await resendVerification();
      pushToast("Verification email sent");
    } catch (err) {
      pushToast(
        err instanceof ApiError
          ? err.message
          : "Couldn’t send verification email",
      );
    } finally {
      setResendingVerification(false);
    }
  }

  async function signOut() {
    setSigningOut(true);
    try {
      await logout();
    } catch (err) {
      setSigningOut(false);
      pushToast(
        err instanceof ApiError ? err.message : "Couldn’t sign out",
      );
    }
  }

  async function signOutEverywhere() {
    setSigningOutAll(true);
    try {
      await logoutAll();
    } catch (err) {
      setSigningOutAll(false);
      pushToast(
        err instanceof ApiError ? err.message : "Couldn’t sign out everywhere",
      );
    }
  }

  async function onPushBrowser(next: boolean) {
    if (!pushSupported()) {
      pushToast("This browser does not support push reminders");
      return;
    }
    setPushBusy(true);
    try {
      if (next) {
        const publicKey = await getVapidPublicKey();
        const subscription = await subscribeToPush(publicKey);
        const device = await registerDevice.mutateAsync(
          subscriptionToPayload(subscription),
        );
        setStoredDeviceId(device.id);
        setCurrentDeviceId(device.id);
        setPushBrowser(true);
        pushToast("Browser reminders on");
        return;
      }
      await unsubscribeFromPush();
      const id = getStoredDeviceId();
      if (id) await removeDevice.mutateAsync(id);
      setStoredDeviceId(null);
      setCurrentDeviceId(null);
      setPushBrowser(false);
      pushToast("Browser reminders off");
    } catch (err) {
      pushToast(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Couldn’t update browser reminders",
      );
    } finally {
      setPushBusy(false);
    }
  }

  async function removePushDevice(id: string, deviceName: string) {
    try {
      if (id === currentDeviceId) {
        await unsubscribeFromPush();
        setStoredDeviceId(null);
        setCurrentDeviceId(null);
        setPushBrowser(false);
      }
      await removeDevice.mutateAsync(id);
      pushToast(`Removed ${deviceName}`);
    } catch (err) {
      pushToast(
        err instanceof ApiError ? err.message : "Couldn’t remove this browser",
      );
    }
  }

  async function exportData(format: "JSON" | "CSV") {
    if (!user) {
      pushToast("Sign in to download your data");
      return;
    }
    setExporting(format);
    try {
      await downloadMomentumExport(user, format);
      pushToast(
        format === "JSON"
          ? "JSON downloaded — check your downloads"
          : "CSV downloaded — check your downloads",
      );
    } catch (err) {
      pushToast(
        err instanceof ApiError
          ? err.message
          : "Couldn’t prepare the download",
      );
    } finally {
      setExporting(null);
    }
  }

  function confirmDelete() {
    if (!canDelete) return;
    setDeleteOpen(false);
    setDeleteConfirm("");
    pushToast("Account deletion is a demo — nothing was removed");
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className="min-w-0"
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={reduce ? undefined : staggerContainer}
      >
        <motion.header
          className="mb-6"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <p className="mb-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-blue">
            Account
          </p>
          <h1 className="mb-1.5 font-heading text-2xl font-bold tracking-tight">
            Settings
          </h1>
          <p className="mt-2.5 max-w-[46ch] text-[clamp(1rem,1.6vw,1.18rem)] text-muted-foreground">
            Photo, password, reminders, and the rest of the account — all in one
            place.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 items-start gap-4.5 nav:grid-cols-2">
          <div className="grid min-w-0 gap-4.5">
            <motion.section
              className={settingsCard}
              aria-labelledby="profile-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <SectionHead id="profile-heading" title="Profile" icon={User} />

              <form className="grid gap-4" onSubmit={saveProfile} noValidate>
                <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-paper-raised/80 px-3.5 py-3">
                  <div
                    className={cn(
                      avatar,
                      "size-18 overflow-hidden rounded-2xl text-[1.8rem] dark:border-transparent",
                    )}
                    aria-hidden
                  >
                    {avatarSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarSrc}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      avatarInitial
                    )}
                  </div>
                  <div className="min-w-0">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(event) => void onPhotoPicked(event)}
                    />
                    <button
                      type="button"
                      className={cn(btn, btnGhost, btnSm, "min-h-9 px-3.5")}
                      disabled={uploadingPhoto}
                      onClick={() => photoInputRef.current?.click()}
                    >
                      <Camera size={15} strokeWidth={2.2} aria-hidden />
                      {uploadingPhoto ? "Uploading…" : "Change photo"}
                    </button>
                    <p className={cn(hint, "mt-2")}>JPG or PNG, up to 2 MB.</p>
                  </div>
                </div>

                <div className={fieldStack}>
                  <Label htmlFor="settings-name">Name</Label>
                  <Input
                    id="settings-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-invalid={Boolean(profileErrors.name)}
                    required
                  />
                  {profileErrors.name ? (
                    <span className={cn(hint, hintErr)}>{profileErrors.name}</span>
                  ) : null}
                </div>

                <div className={fieldStack}>
                  <Label htmlFor="settings-email">Email</Label>
                  <Input
                    id="settings-email"
                    type="email"
                    value={email}
                    disabled
                    readOnly
                    aria-readonly="true"
                  />
                  <span className={hint}>
                    Used for sign-in. Email can’t be changed.
                  </span>
                  {user?.emailVerified === false ? (
                    <button
                      type="button"
                      className={cn(btn, btnGhost, btnSm, "mt-1 min-h-9 w-fit px-3.5")}
                      onClick={() => void sendVerification()}
                      disabled={resendingVerification}
                    >
                      <Mail size={15} strokeWidth={2.2} aria-hidden />
                      {resendingVerification
                        ? "Sending…"
                        : "Resend verification email"}
                    </button>
                  ) : null}
                </div>

                <button type="submit" className={saveBtn} disabled={savingProfile}>
                  {savingProfile ? "Saving…" : "Save changes"}
                </button>
              </form>
            </motion.section>

            <motion.section
              className={settingsCard}
              aria-labelledby="time-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <SectionHead
                id="time-heading"
                title="Time and week"
                note="When your day starts, and which day opens the week"
                icon={Globe}
              />

              <form className="grid gap-4" onSubmit={saveTime}>
                <div className={fieldStack}>
                  <Label>Timezone</Label>
                  <DropdownSelect
                    value={timezone}
                    onChange={setTimezone}
                    placeholder="Choose timezone"
                    aria-label="Timezone"
                    icon={Globe}
                    options={TIMEZONE_OPTIONS}
                  />
                  <span className={hint}>
                    Days already logged keep their original date.
                  </span>
                </div>

                <fieldset className={fieldStack}>
                  <Label>Week starts on</Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {WEEK_STARTS.map((item) => {
                      const selected = weekStartsOn === item.value;
                      return (
                        <label key={item.value} className="block cursor-pointer">
                          <input
                            type="radio"
                            name="weekStartsOn"
                            value={item.value}
                            className="sr-only"
                            checked={selected}
                            onChange={() => setWeekStartsOn(item.value)}
                          />
                          <span
                            className={cn(
                              "flex min-h-18 flex-col justify-center gap-1 rounded-xl px-3.5 py-3 transition-colors",
                              selected
                                ? "bg-blue-soft text-blue-deep"
                                : "bg-paper-raised text-ink hover:bg-paper-white",
                            )}
                          >
                            <span className="flex items-center justify-between gap-2">
                              <span className="font-semibold tracking-tight">
                                {item.label}
                              </span>
                              {selected ? (
                                <Check size={16} strokeWidth={2.4} aria-hidden />
                              ) : null}
                            </span>
                            <span className="text-[0.75rem] text-muted-foreground">
                              {item.note}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <button type="submit" className={saveBtn} disabled={savingTime}>
                  {savingTime ? "Saving…" : "Save changes"}
                </button>
              </form>
            </motion.section>

            <motion.section
              className={settingsCard}
              aria-labelledby="password-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <SectionHead
                id="password-heading"
                title="Password"
                note="Changing it signs you out everywhere else"
                icon={Lock}
              />

              <form className="grid gap-4" onSubmit={updatePassword} noValidate>
                <div className={fieldStack}>
                  <Label htmlFor="settings-current-password">Current password</Label>
                  <PasswordInput
                    id="settings-current-password"
                    name="currentPassword"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    aria-invalid={Boolean(passwordErrors.currentPassword)}
                    required
                  />
                  {passwordErrors.currentPassword ? (
                    <span className={cn(hint, hintErr)}>
                      {passwordErrors.currentPassword}
                    </span>
                  ) : null}
                </div>

                <div className={fieldStack}>
                  <Label htmlFor="settings-new-password">New password</Label>
                  <PasswordInput
                    id="settings-new-password"
                    name="newPassword"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    aria-invalid={Boolean(passwordErrors.newPassword)}
                    required
                  />
                  {passwordErrors.newPassword ? (
                    <span className={cn(hint, hintErr)}>
                      {passwordErrors.newPassword}
                    </span>
                  ) : (
                    <span className={hint}>At least 8 characters</span>
                  )}
                </div>

                <button
                  type="submit"
                  className={saveBtn}
                  disabled={savingPassword}
                >
                  {savingPassword ? "Updating…" : "Update password"}
                </button>
              </form>
            </motion.section>
          </div>

          <div className="grid min-w-0 gap-4.5">
            <motion.section
              className={settingsCard}
              aria-labelledby="notifications-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <SectionHead
                id="notifications-heading"
                title="Notifications"
                note="Per-habit times live on each habit"
                icon={Bell}
              />

              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-paper-raised/80 px-4 py-3.5">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-blue-soft text-blue">
                      <Bell size={16} strokeWidth={2.2} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold tracking-tight">
                        Push in the browser
                      </div>
                      <p className={cn(hint, "mt-0.5")}>
                        Habit reminders on this device
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="push-browser"
                    checked={pushBrowser}
                    disabled={pushBusy || !pushSupported()}
                    onCheckedChange={(checked) => void onPushBrowser(checked)}
                  />
                </div>

                <div className="flex items-center justify-between gap-4 rounded-2xl bg-paper-raised/80 px-4 py-3.5">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-blue-soft text-blue">
                      <Mail size={16} strokeWidth={2.2} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold tracking-tight">
                        Weekly summary email
                      </div>
                      <p className={cn(hint, "mt-0.5")}>
                        Sunday evening, one message
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="weekly-email"
                    checked={weeklyEmail}
                    onCheckedChange={setWeeklyEmail}
                  />
                </div>

                <div className="rounded-2xl bg-paper-raised/80 px-4 py-3.5">
                  <Label>Quiet hours</Label>
                  <div className="mt-2.5 grid grid-cols-1 items-center gap-2.5 sm:grid-cols-[1fr_auto_1fr]">
                    <TimePicker
                      id="quiet-from"
                      value={quietFrom}
                      onChange={setQuietFrom}
                      placeholder="From"
                    />
                    <span className={cn(mono, "text-center text-[0.78rem] font-semibold text-muted-foreground")}>
                      to
                    </span>
                    <TimePicker
                      id="quiet-to"
                      value={quietTo}
                      onChange={setQuietTo}
                      placeholder="To"
                    />
                  </div>
                  <p className={cn(hint, "mt-2")}>
                    Nothing sent between these times; reminders in the window
                    are skipped, not delayed.
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section
              className={settingsCard}
              aria-labelledby="devices-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <SectionHead
                id="devices-heading"
                title="Push devices"
                note="Browsers registered for reminders"
                icon={Monitor}
              />

              {devicesQuery.error ? (
                <p className={cn(hint, hintErr)}>
                  {devicesQuery.error instanceof ApiError
                    ? devicesQuery.error.message
                    : "Could not load devices"}
                </p>
              ) : null}

              {devices.length === 0 ? (
                <p className={hint}>No browsers registered yet.</p>
              ) : (
                <ul className="m-0 grid list-none gap-2 p-0">
                  {devices.map((device) => {
                    const deviceLabel = device.deviceName || "Web browser";
                    const current = device.id === currentDeviceId;
                    return (
                      <li
                        key={device.id}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-paper-raised/80 px-3.5 py-3 max-nav:flex-wrap"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-soft text-blue">
                            <Monitor size={16} strokeWidth={2.2} aria-hidden />
                          </span>
                          <div className="min-w-0">
                            <div className="truncate font-semibold tracking-tight">
                              {deviceLabel}
                            </div>
                            <div className={cn(mono, "mt-0.5 text-[0.72rem] text-muted-foreground")}>
                              Last seen {formatDateTime(device.lastSeenAt)}
                            </div>
                          </div>
                        </div>
                        {current ? (
                          <span className={cn(chip, chipBlue)}>This browser</span>
                        ) : (
                          <button
                            type="button"
                            className={cn(btn, btnGhost, btnSm, "min-h-9 px-3.5")}
                            disabled={removeDevice.isPending}
                            onClick={() => void removePushDevice(device.id, deviceLabel)}
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              <button
                type="button"
                className={cn(quietBtn, btnBlock, "mt-4")}
                disabled={signingOutAll}
                onClick={() => void signOutEverywhere()}
              >
                {signingOutAll ? "Signing out…" : "Sign out everywhere"}
              </button>
            </motion.section>

            <motion.section
              className={settingsCard}
              aria-labelledby="billing-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <SectionHead id="billing-heading" title="Subscription" icon={CreditCard} />
              <p className="max-w-[42ch] text-[0.95rem] leading-relaxed text-muted-foreground">
                {admin
                  ? "Complimentary Pro access for your personal habits — no renewal required."
                  : "Plan, renewal date, and invoices — keep the year chain without surprise charges."}
              </p>
              <Link
                href="/subscription"
                className={cn(quietBtn, "mt-4")}
              >
                Manage subscription
              </Link>
            </motion.section>

            <motion.section
              className={settingsCard}
              aria-labelledby="data-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <SectionHead id="data-heading" title="Your data" icon={Download} />
              <p className="max-w-[42ch] text-[0.95rem] leading-relaxed text-muted-foreground">
                Every habit and every logged day, in a file you can keep —
                nothing locked in.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  className={quietBtn}
                  disabled={exporting !== null}
                  onClick={() => void exportData("JSON")}
                >
                  {exporting === "JSON" ? "Preparing JSON…" : "Download JSON"}
                </button>
                <button
                  type="button"
                  className={quietBtn}
                  disabled={exporting !== null}
                  onClick={() => void exportData("CSV")}
                >
                  {exporting === "CSV" ? "Preparing CSV…" : "Download CSV"}
                </button>
              </div>
            </motion.section>

            <motion.section
              className={settingsCard}
              aria-labelledby="session-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <SectionHead
                id="session-heading"
                title="Session"
                note="Sign out of this device"
                icon={LogOut}
              />
              <button
                type="button"
                className={cn(quietBtn, btnBlock, "mt-4")}
                disabled={signingOut || signingOutAll}
                onClick={() => void signOut()}
              >
                <LogOut size={16} strokeWidth={2.4} aria-hidden />
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </motion.section>

            <motion.section
              className="rounded-2xl bg-flame-soft/70 p-5 dark:bg-[color-mix(in_srgb,#c97a6a_12%,var(--paper-raised))]"
              aria-labelledby="delete-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <SectionHead
                id="delete-heading"
                title="Delete account"
                note="This cannot be undone"
                icon={Trash2}
                tone="danger"
              />
              <p className="max-w-[42ch] text-[0.95rem] leading-relaxed text-muted-foreground">
                Removes the account, habits, and logged days. Download your data
                first if you want to keep it.
              </p>
              <button
                type="button"
                className={cn(dialogBtn, btnDanger, "mt-4")}
                onClick={() => {
                  setDeleteConfirm("");
                  setDeleteOpen(true);
                }}
              >
                <Trash2 size={16} strokeWidth={2.2} aria-hidden />
                Delete my account
              </button>
            </motion.section>
          </div>
        </div>
      </motion.div>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription className="leading-relaxed">
              History goes with it. Download your data first if you want to keep
              it.
            </DialogDescription>
          </DialogHeader>
          <div className={fieldStack}>
            <Label htmlFor="delete-confirm">Type DELETE to confirm</Label>
            <Input
              id="delete-confirm"
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <DialogFooter>
            <button
              type="button"
              className={quietBtn}
              onClick={() => setDeleteOpen(false)}
            >
              Keep my account
            </button>
            <button
              type="button"
              className={cn(dialogBtn, btnDanger)}
              disabled={!canDelete}
              onClick={confirmDelete}
            >
              Delete everything
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MotionConfig>
  );
}
