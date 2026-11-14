export const BUSY_DELAY_MS = 200;
const NAV_TIMEOUT_MS = 10_000;

type BusySnapshot = {
  nav: number;
  api: number;
  any: boolean;
};

type Listener = (snapshot: BusySnapshot) => void;

let navCount = 0;
let apiCount = 0;
let navTimeoutId: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<Listener>();

function snapshot(): BusySnapshot {
  return {
    nav: navCount,
    api: apiCount,
    any: navCount > 0 || apiCount > 0,
  };
}

function emit() {
  const next = snapshot();
  for (const listener of listeners) {
    listener(next);
  }
}

function clearNavTimeout() {
  if (navTimeoutId !== null) {
    clearTimeout(navTimeoutId);
    navTimeoutId = null;
  }
}

function scheduleNavTimeout() {
  clearNavTimeout();
  navTimeoutId = setTimeout(() => {
    if (navCount > 0) {
      navCount = 0;
      emit();
    }
    navTimeoutId = null;
  }, NAV_TIMEOUT_MS);
}

export function subscribeBusy(listener: Listener): () => void {
  listeners.add(listener);
  listener(snapshot());
  return () => {
    listeners.delete(listener);
  };
}

export function getBusySnapshot(): BusySnapshot {
  return snapshot();
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function beginNav() {
  if (!isBrowser()) {
    return;
  }
  navCount += 1;
  scheduleNavTimeout();
  emit();
}

export function endNav() {
  if (!isBrowser() || navCount <= 0) {
    return;
  }
  navCount = Math.max(0, navCount - 1);
  if (navCount === 0) {
    clearNavTimeout();
  } else {
    scheduleNavTimeout();
  }
  emit();
}

/** Reset all nav busy flags after a route change settles. */
export function clearNav() {
  if (!isBrowser() || navCount === 0) {
    return;
  }
  navCount = 0;
  clearNavTimeout();
  emit();
}

export function beginApi() {
  if (!isBrowser()) {
    return;
  }
  apiCount += 1;
  emit();
}

export function endApi() {
  if (!isBrowser() || apiCount <= 0) {
    return;
  }
  apiCount = Math.max(0, apiCount - 1);
  emit();
}

/** Call right before programmatic router.push / replace. */
export function markNavigation() {
  beginNav();
}
