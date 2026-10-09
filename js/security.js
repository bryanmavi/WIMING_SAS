window.WM_SECURITY = (() => {
  const memoryAttempts = new Map();

  function cleanText(value, maxLength = 1000) {
    return String(value ?? '')
      .normalize('NFC')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
      .trim()
      .slice(0, maxLength);
  }

  function allowSubmission(scope, limit = 3, windowMs = 600000) {
    const key = `wiming-rate:${scope}`;
    const now = Date.now();
    let attempts;

    try {
      const stored = JSON.parse(sessionStorage.getItem(key) || '[]');
      attempts = Array.isArray(stored) ? stored : [];
    } catch {
      attempts = memoryAttempts.get(scope) || [];
    }

    attempts = attempts.filter((timestamp) => Number.isFinite(timestamp) && timestamp <= now && now - timestamp < windowMs);
    if (attempts.length >= limit) {
      memoryAttempts.set(scope, attempts);
      return false;
    }

    attempts.push(now);
    memoryAttempts.set(scope, attempts);
    try {
      sessionStorage.setItem(key, JSON.stringify(attempts));
    } catch {
      // Keep the per-page limit if browser storage is unavailable.
    }
    return true;
  }

  return Object.freeze({ cleanText, allowSubmission });
})();