// Lightweight client error reporter used by the root error boundary.
export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  try {
    if (typeof window === "undefined") return;
    const err = error instanceof Error ? error : new Error(String(error));
    window.parent?.postMessage(
      { type: "lovable:error", message: err.message, stack: err.stack, context },
      "*",
    );
  } catch {
    // never let reporting crash the app
  }
}
