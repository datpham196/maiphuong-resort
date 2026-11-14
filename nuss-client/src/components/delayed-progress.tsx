"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useDelayedBusy } from "@/hooks/use-delayed-busy";
import { beginNav, clearNav, markNavigation } from "@/lib/busy-bus";
import "@/styles/delayed-progress.css";

export { markNavigation };

type Props = {
  variant?: "public" | "admin";
};

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function isInternalNavigationAnchor(anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== "_self") {
    return false;
  }
  if (anchor.hasAttribute("download")) {
    return false;
  }

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) {
      return false;
    }
    const nextPath = `${url.pathname}${url.search}${url.hash}`;
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    return nextPath !== currentPath;
  } catch {
    return false;
  }
}

export function DelayedProgress({ variant = "public" }: Props) {
  const pathname = usePathname();
  const show = useDelayedBusy();

  useEffect(() => {
    clearNav();
  }, [pathname]);

  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      if (isModifiedClick(event) || event.defaultPrevented) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (!isInternalNavigationAnchor(anchor)) {
        return;
      }

      beginNav();
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, []);

  return (
    <div
      className={`delayed-progress is-${variant}${show ? " is-visible" : ""}`}
      role="progressbar"
      aria-hidden={!show}
      aria-valuetext={show ? "Loading" : undefined}
    >
      <span className="delayed-progress-bar" />
    </div>
  );
}
