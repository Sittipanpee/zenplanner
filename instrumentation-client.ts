// Next.js client-side instrumentation hook.
// Captures uncaught browser errors and forwards them to a stub monitoring endpoint.
// TODO: Implement /api/monitoring/error route to receive these payloads.

const MONITORING_ENDPOINT = "/api/monitoring/error";

type ClientErrorPayload = {
  level: "error";
  timestamp: string;
  name: string;
  message: string;
  stack: string;
  url: string;
  userAgent: string;
};

function buildPayload(error: unknown, fallbackMessage: string): ClientErrorPayload {
  const err =
    error instanceof Error
      ? error
      : new Error(typeof error === "string" ? error : fallbackMessage);
  return {
    level: "error",
    timestamp: new Date().toISOString(),
    name: err.name,
    message: err.message,
    stack: (err.stack ?? "").split("\n").slice(0, 5).join("\n"),
    url: typeof window !== "undefined" ? window.location.href : "unknown",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
  };
}

function postError(payload: ClientErrorPayload): void {
  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(MONITORING_ENDPOINT, blob);
      return;
    }
    void fetch(MONITORING_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Swallow — we never want monitoring failures to break the app.
    });
  } catch {
    // Defensive: never let the error reporter throw.
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("error", (event: ErrorEvent) => {
    postError(buildPayload(event.error ?? event.message, "window.error"));
  });
  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    postError(buildPayload(event.reason, "unhandledrejection"));
  });
}

export function onRouterTransitionStart(href: string, navigationType: string): void {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[router]", navigationType, href);
  }
}
