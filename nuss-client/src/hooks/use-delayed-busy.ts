"use client";

import { useEffect, useState } from "react";
import { BUSY_DELAY_MS, subscribeBusy } from "@/lib/busy-bus";

/**
 * Returns true only when the app has been busy longer than BUSY_DELAY_MS.
 * Fast navigations / API calls never flip this to true.
 */
export function useDelayedBusy(delayMs: number = BUSY_DELAY_MS): boolean {
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    return subscribeBusy((snapshot) => {
      setBusy(snapshot.any);
    });
  }, []);

  useEffect(() => {
    if (!busy) {
      setShow(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShow(true);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [busy, delayMs]);

  return show;
}
