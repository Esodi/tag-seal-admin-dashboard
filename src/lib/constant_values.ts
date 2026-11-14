/**
 * Portal session behaviour. Change a value here and redeploy; nothing else
 * needs editing.
 *
 * - idleTimeoutEnabled: watch for inactivity at all. `false` keeps the admin
 *   signed in until the session itself expires.
 * - idleTimeoutMinutes: minutes without mouse, keyboard, scroll or touch
 *   activity before the portal reacts.
 * - showCountdown: `true` shows the "Are you still working?" dialog with a
 *   countdown; `false` skips the dialog and applies `autoLogout` immediately.
 * - countdownSeconds: length of that countdown.
 * - autoLogout: `true` signs the admin out when the countdown (or the idle
 *   time, without a countdown) runs out. `false` only shows the reminder and
 *   leaves the admin signed in.
 * - keepAliveHours: how long "Stay signed in" extends the session.
 * - signInHours / rememberMeDays: session length at sign-in.
 * - sessionCheckIntervalSeconds: how often the portal re-checks that the
 *   session is still valid in the background.
 */
export type SessionSettings = {
  idleTimeoutEnabled: boolean;
  idleTimeoutMinutes: number;
  showCountdown: boolean;
  countdownSeconds: number;
  autoLogout: boolean;
  keepAliveHours: number;
  signInHours: number;
  rememberMeDays: number;
  sessionCheckIntervalSeconds: number;
};

export const SESSION_SETTINGS: Readonly<SessionSettings> = {
  idleTimeoutEnabled: true,
  idleTimeoutMinutes: 5,
  showCountdown: true,
  countdownSeconds: 30,
  autoLogout: true,
  keepAliveHours: 20,
  signInHours: 20,
  rememberMeDays: 30,
  sessionCheckIntervalSeconds: 60,
};

export const INACTIVITY_TIMEOUT_MINUTES = SESSION_SETTINGS.idleTimeoutMinutes;
export const INACTIVITY_WARNING_COUNTDOWN_SECONDS = SESSION_SETTINGS.countdownSeconds;
