// Next.js instrumentation hook — lightweight error monitoring (no external SaaS).
// Logs structured JSON to stdout, captured by Vercel's runtime logs.

type RequestErrorContext = {
  routerKind: "Pages Router" | "App Router";
  routePath: string;
  routeType: "render" | "route" | "action" | "middleware";
};

type RequestLike = {
  path?: string;
  url?: string;
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
};

export async function register(): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    // No-op in development to keep dev logs clean.
    return;
  }
  // Lazy side-effect import slot — reserved for future runtime wiring.
  // Keeping this async-shaped so future instrumentation providers can be plugged in
  // without changing the call site.
  await Promise.resolve();
}

export async function onRequestError(
  error: unknown,
  request: RequestLike,
  context: RequestErrorContext,
): Promise<void> {
  const err =
    error instanceof Error
      ? error
      : new Error(typeof error === "string" ? error : "Unknown error");

  const stackLines = (err.stack ?? "").split("\n").slice(0, 5).join("\n");

  const payload = {
    level: "error",
    timestamp: new Date().toISOString(),
    name: err.name,
    message: err.message,
    stack: stackLines,
    path: request.path ?? request.url ?? "unknown",
    method: request.method ?? "unknown",
    routerKind: context.routerKind,
    routePath: context.routePath,
    routeType: context.routeType,
  };

  // Structured single-line JSON for log aggregation.
  // eslint-disable-next-line no-console
  console.error(JSON.stringify(payload));
}
