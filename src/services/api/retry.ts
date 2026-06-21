interface RetryOptions {
  retries?: number;
  delayMs?: number;
}

// Retries `fn` on failure with a fixed delay between attempts. Used by the
// course API calls so a flaky network blip doesn't immediately surface as
// an error to the user — only the last failure (after all retries) is thrown.
export async function withRetry<T>(
  fn: () => Promise<T>,
  { retries = 2, delayMs = 1000 }: RetryOptions = {},
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}
