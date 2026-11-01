"use client";

export const SESSION_EXPIRED_EVENT = "tagseal:session-expired";
export const SESSION_RESTORED_EVENT = "tagseal:session-restored";
const returnToKey = "tagseal:return-to";
const expiredFlagKey = "tagseal:session-expired-flag";

export function markSessionExpired() {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (path.startsWith("/dashboard")) {
    window.sessionStorage.setItem(returnToKey, `${path}${window.location.search}`);
    window.sessionStorage.setItem(expiredFlagKey, "1");
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  } else {
    clearSessionExpiredFlag();
  }
}

export function isSessionExpiredFlagged() {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  if (!path.startsWith("/dashboard") && !path.startsWith("/login")) {
    window.sessionStorage.removeItem(expiredFlagKey);
    return false;
  }
  return window.sessionStorage.getItem(expiredFlagKey) === "1";
}

export function clearSessionExpiredFlag() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(expiredFlagKey);
}

export function markSessionRestored() {
  if (typeof window !== "undefined") {
    clearSessionExpiredFlag();
    window.dispatchEvent(new Event(SESSION_RESTORED_EVENT));
  }
}

export function saveReturnTo(path?: string) {
  if (typeof window === "undefined") return;
  const target = path ?? `${window.location.pathname}${window.location.search}`;
  if (target.startsWith("/dashboard")) {
    window.sessionStorage.setItem(returnToKey, target);
  }
}

export function consumeReturnTo() {
  if (typeof window === "undefined") return null;
  const value = window.sessionStorage.getItem(returnToKey);
  window.sessionStorage.removeItem(returnToKey);
  if (!value) return null;
  const path = value.split("?")[0].replace(/\/+$/, "") || "/";
  return path === "/dashboard" || path.startsWith("/dashboard/") ? value : null;
}

export async function authenticatedFetch(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  if (response.status === 401) {
    markSessionExpired();
  }
  return response;
}
