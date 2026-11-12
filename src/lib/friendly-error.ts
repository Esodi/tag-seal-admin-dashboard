/**
 * Translates technical, SQL, or network exceptions into user-friendly, actionable messages.
 */
export function formatFriendlyError(
  error: unknown,
  fallback = "An unexpected error occurred. Please try again.",
): string {
  if (!error) return fallback;

  let message = "";
  if (typeof error === "string") {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (
    typeof error === "object" &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  ) {
    message = (error as Record<string, unknown>).message as string;
  } else {
    return fallback;
  }

  const lower = message.toLowerCase();

  // Database / SQL errors
  if (
    lower.includes("sqlstate") ||
    lower.includes("queryexception") ||
    lower.includes("pdoexception") ||
    lower.includes("column not found") ||
    lower.includes("table doesn't exist") ||
    lower.includes("unknown column") ||
    lower.includes("syntax error") ||
    lower.includes("database query error") ||
    lower.includes("integrity constraint violation")
  ) {
    return "A database schema or query issue occurred. Please check that database migrations are up to date, or try again later.";
  }

  // Database connection errors
  if (
    lower.includes("connection refused") ||
    lower.includes("connection timed out") ||
    lower.includes("access denied for user") ||
    lower.includes("operation not permitted") ||
    lower.includes("no connection could be made") ||
    lower.includes("server has gone away")
  ) {
    return "Unable to connect to the database service. Please ensure the MySQL server is running.";
  }

  // Network / Gateway errors
  if (
    lower.includes("failed to fetch") ||
    lower.includes("network error") ||
    lower.includes("econnrefused") ||
    lower.includes("service is unavailable")
  ) {
    return "Unable to connect to the backend server. Please check your network connection and server status.";
  }

  // Unauthenticated / expired session
  if (
    lower.includes("unauthenticated") ||
    lower.includes("jwt expired") ||
    lower.includes("token has expired")
  ) {
    return "Your session has expired. Please sign in again.";
  }

  return message;
}

