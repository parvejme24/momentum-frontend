"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";

import customer from "@/data/customer.json";
import { PasswordInput } from "@/components/auth/password-input";
import { useToast } from "@/components/auth/toast";
import { fadeUpSoft, staggerContainer } from "@/components/home/motion";
import { ConfirmSheet } from "@/components/settings/confirm-sheet";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth/context";
import { isAdmin } from "@/lib/auth/role";
import { ApiError } from "@/lib/api/errors";

type WeekStart = "saturday" | "sunday" | "monday";

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

type Device = {
  id: string;
  name: string;
  meta: string;
  current?: boolean;
};

const TIMEZONES = [
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Europe/London",
  "America/New_York",
];

const INITIAL_DEVICES: Device[] = customer.devices as Device[];

function initialFromName(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export function SettingsPage() {
  const reduce = useReducedMotion();
  const { pushToast } = useToast();
  const { user, updateMe, changePassword, logoutAll } = useAuth();
  const admin = isAdmin(user);

  const defaultName = user?.name?.trim() || customer.profile.name;
  const defaultEmail = user?.email?.trim() || customer.profile.email;
  const defaultTimezone = user?.timezone || customer.profile.timezone;

  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
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
  const [signingOutAll, setSigningOutAll] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );

  const [pushPhone, setPushPhone] = useState(customer.notifications.pushPhone);
  const [pushBrowser, setPushBrowser] = useState(customer.notifications.pushBrowser);
  const [weeklyEmail, setWeeklyEmail] = useState(customer.notifications.weeklyEmail);
  const [quietFrom, setQuietFrom] = useState(customer.notifications.quietFrom);
  const [quietTo, setQuietTo] = useState(customer.notifications.quietTo);

  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const avatarInitial = useMemo(() => initialFromName(name), [name]);
  const canDelete = deleteConfirm.trim().toUpperCase() === "DELETE";

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Enter your name";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email";
    }
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

  function signOutDevice(id: string, deviceName: string) {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    pushToast(`Signed out ${deviceName}`);
  }

  function exportData(format: "JSON" | "CSV") {
    pushToast(`Export ready — check your downloads`);
    void format;
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
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={reduce ? undefined : staggerContainer}
      >
        <motion.header
          className="page-head"
          variants={reduce ? undefined : fadeUpSoft}
        >
          <p className="eyebrow">Account</p>
          <h1>Settings</h1>
        </motion.header>

        <div className="settings-layout">
          <div className="settings-col">
            <motion.section
              className="card"
              aria-labelledby="profile-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className="panel-head">
                <h2 id="profile-heading" className="section-title">
                  Profile
                </h2>
              </div>

              <form className="settings-stack" onSubmit={saveProfile} noValidate>
                <div className="settings-avatar-row">
                  <div className="avatar avatar-lg" aria-hidden>
                    {avatarInitial}
                  </div>
                  <div>
                    <button type="button" className="btn btn-ghost btn-sm">
                      Change photo
                    </button>
                    <p className="hint mono" style={{ marginTop: 8 }}>
                      JPG or PNG, up to 2 MB.
                    </p>
                  </div>
                </div>

                <label className="field">
                  <span className="label-row">
                    <span className="label">Name</span>
                    <span className="label-req" aria-hidden>
                      *
                    </span>
                  </span>
                  <input
                    className="input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-invalid={Boolean(profileErrors.name)}
                    required
                  />
                  {profileErrors.name ? (
                    <span className="hint hint-err">{profileErrors.name}</span>
                  ) : null}
                </label>

                <label className="field">
                  <span className="label-row">
                    <span className="label">Email</span>
                    <span className="label-req" aria-hidden>
                      *
                    </span>
                  </span>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={Boolean(profileErrors.email)}
                    required
                  />
                  {profileErrors.email ? (
                    <span className="hint hint-err">{profileErrors.email}</span>
                  ) : (
                    <span className="hint">
                      Used for sign-in and password resets
                    </span>
                  )}
                </label>

                <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                  {savingProfile ? "Saving…" : "Save changes"}
                </button>
              </form>
            </motion.section>

            <motion.section
              className="card"
              aria-labelledby="time-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className="panel-head">
                <div>
                  <h2 id="time-heading" className="section-title">
                    Time and week
                  </h2>
                  <p className="hint" style={{ marginTop: 4 }}>
                    Decides when your day starts and ends
                  </p>
                </div>
              </div>

              <form className="settings-stack" onSubmit={saveTime}>
                <label className="field">
                  <span className="label">Timezone</span>
                  <select
                    className="select"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    {TIMEZONES.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                  <span className="hint">
                    Days already logged keep their original date; only new marks
                    and reminders use the new zone.
                  </span>
                </label>

                <fieldset className="field">
                  <legend className="label">Week starts on</legend>
                  <div className="opt-list settings-week-opts">
                    {(
                      [
                        ["saturday", "Saturday"],
                        ["sunday", "Sunday"],
                        ["monday", "Monday"],
                      ] as const
                    ).map(([value, label]) => (
                      <label key={value}>
                        <input
                          type="radio"
                          name="weekStartsOn"
                          value={value}
                          checked={weekStartsOn === value}
                          onChange={() => setWeekStartsOn(value)}
                        />
                        <span className="opt">
                          <span className="opt-dot" aria-hidden />
                          <span className="opt-t">{label}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <button type="submit" className="btn btn-primary" disabled={savingTime}>
                  {savingTime ? "Saving…" : "Save changes"}
                </button>
              </form>
            </motion.section>

            <motion.section
              className="card"
              aria-labelledby="password-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className="panel-head">
                <h2 id="password-heading" className="section-title">
                  Password
                </h2>
              </div>

              <form
                className="settings-stack"
                onSubmit={updatePassword}
                noValidate
              >
                <label className="field">
                  <span className="label-row">
                    <span className="label">Current password</span>
                    <span className="label-req" aria-hidden>
                      *
                    </span>
                  </span>
                  <PasswordInput
                    name="currentPassword"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    aria-invalid={Boolean(passwordErrors.currentPassword)}
                    required
                  />
                  {passwordErrors.currentPassword ? (
                    <span className="hint hint-err">
                      {passwordErrors.currentPassword}
                    </span>
                  ) : null}
                </label>

                <label className="field">
                  <span className="label-row">
                    <span className="label">New password</span>
                    <span className="label-req" aria-hidden>
                      *
                    </span>
                  </span>
                  <PasswordInput
                    name="newPassword"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    aria-invalid={Boolean(passwordErrors.newPassword)}
                    required
                  />
                  {passwordErrors.newPassword ? (
                    <span className="hint hint-err">
                      {passwordErrors.newPassword}
                    </span>
                  ) : (
                    <span className="hint">
                      Changing password signs you out everywhere else
                    </span>
                  )}
                </label>

                <button type="submit" className="btn btn-primary" disabled={savingPassword}>
                  {savingPassword ? "Updating…" : "Update password"}
                </button>
              </form>
            </motion.section>
          </div>

          <div className="settings-col">
            <motion.section
              className="card"
              aria-labelledby="notifications-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className="panel-head">
                <div>
                  <h2 id="notifications-heading" className="section-title">
                    Notifications
                  </h2>
                  <p className="hint" style={{ marginTop: 4 }}>
                    Per-habit times live on each habit
                  </p>
                </div>
              </div>

              <div className="settings-stack">
                <div className="switch-row">
                  <div>
                    <div className="switch-row-title">Push on this phone</div>
                    <p className="hint" style={{ marginTop: 2 }}>
                      Habit reminders at the time you set
                    </p>
                  </div>
                  <Switch
                    id="push-phone"
                    checked={pushPhone}
                    onCheckedChange={setPushPhone}
                  />
                </div>

                <div className="switch-row">
                  <div>
                    <div className="switch-row-title">Push in the browser</div>
                    <p className="hint" style={{ marginTop: 2 }}>
                      Only while a tab is open
                    </p>
                  </div>
                  <Switch
                    id="push-browser"
                    checked={pushBrowser}
                    onCheckedChange={setPushBrowser}
                  />
                </div>

                <div className="switch-row">
                  <div>
                    <div className="switch-row-title">Weekly summary email</div>
                    <p className="hint" style={{ marginTop: 2 }}>
                      Sunday evening, one message
                    </p>
                  </div>
                  <Switch
                    id="weekly-email"
                    checked={weeklyEmail}
                    onCheckedChange={setWeeklyEmail}
                  />
                </div>

                <div className="quiet-hours">
                  <span className="label">Quiet hours</span>
                  <div className="quiet-hours-row">
                    <label className="field">
                      <span className="sr-only">From</span>
                      <input
                        className="input"
                        type="time"
                        value={quietFrom}
                        onChange={(e) => setQuietFrom(e.target.value)}
                      />
                    </label>
                    <span className="quiet-hours-to mono">to</span>
                    <label className="field">
                      <span className="sr-only">To</span>
                      <input
                        className="input"
                        type="time"
                        value={quietTo}
                        onChange={(e) => setQuietTo(e.target.value)}
                      />
                    </label>
                  </div>
                  <p className="hint">
                    Nothing sent between these times; reminders in the window
                    are skipped, not delayed.
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section
              className="card"
              aria-labelledby="devices-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className="panel-head">
                <h2 id="devices-heading" className="section-title">
                  Signed-in devices
                </h2>
              </div>

              <ul className="device-list">
                {devices.map((device) => (
                  <li key={device.id} className="device-row">
                    <div className="device-copy">
                      <div className="device-name">{device.name}</div>
                      <div className="device-meta mono">{device.meta}</div>
                    </div>
                    {device.current ? (
                      <span className="chip chip-blue">Current</span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => signOutDevice(device.id, device.name)}
                      >
                        Sign out
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="btn btn-ghost btn-block"
                style={{ marginTop: 16 }}
                disabled={signingOutAll}
                onClick={() => void signOutEverywhere()}
              >
                {signingOutAll ? "Signing out…" : "Sign out everywhere"}
              </button>
            </motion.section>

            {!admin ? (
            <motion.section
              className="card"
              aria-labelledby="billing-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className="panel-head">
                <h2 id="billing-heading" className="section-title">
                  Subscription
                </h2>
              </div>
              <p className="lede" style={{ maxWidth: "42ch" }}>
                Plan, renewal date, and invoices — keep the year chain without
                surprise charges.
              </p>
              <div className="settings-actions" style={{ marginTop: 16 }}>
                <Link href="/subscription" className="btn btn-ghost">
                  Manage subscription
                </Link>
              </div>
            </motion.section>
            ) : null}

            <motion.section
              className="card"
              aria-labelledby="data-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className="panel-head">
                <h2 id="data-heading" className="section-title">
                  Your data
                </h2>
              </div>
              <p className="lede" style={{ maxWidth: "42ch" }}>
                Every habit and every logged day, in a file you can keep —
                nothing locked in.
              </p>
              <div className="settings-actions" style={{ marginTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => exportData("JSON")}
                >
                  Download JSON
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => exportData("CSV")}
                >
                  Download CSV
                </button>
              </div>
            </motion.section>

            <motion.section
              className="card card-danger"
              aria-labelledby="delete-heading"
              variants={reduce ? undefined : fadeUpSoft}
            >
              <div className="panel-head">
                <h2
                  id="delete-heading"
                  className="section-title danger-title"
                >
                  Delete account
                </h2>
              </div>
              <p className="lede" style={{ maxWidth: "42ch" }}>
                Removes account, all six habits, all 358 days — can&apos;t be
                undone, no backup on our side.
              </p>
              <button
                type="button"
                className="btn btn-danger"
                style={{ marginTop: 16 }}
                onClick={() => {
                  setDeleteConfirm("");
                  setDeleteOpen(true);
                }}
              >
                Delete my account
              </button>
            </motion.section>
          </div>
        </div>
      </motion.div>

      <ConfirmSheet
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete your account?"
      >
        <p className="lede" style={{ marginTop: 12 }}>
          358 days of history goes with it — download data first if you want to
          keep it.
        </p>
        <label className="field" style={{ marginTop: 18 }}>
          <span className="label">Type DELETE to confirm</span>
          <input
            className="input"
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <div className="settings-actions" style={{ marginTop: 20 }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setDeleteOpen(false)}
          >
            Keep my account
          </button>
          <button
            type="button"
            className="btn btn-danger"
            disabled={!canDelete}
            onClick={confirmDelete}
          >
            Delete everything
          </button>
        </div>
      </ConfirmSheet>
    </MotionConfig>
  );
}
