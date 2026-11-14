"use client";

import type { ReactNode } from "react";
import { DelayedProgress } from "@/components/delayed-progress";

type Props = {
  children: ReactNode;
};

export function PublicChrome({ children }: Props) {
  return (
    <>
      <DelayedProgress variant="public" />
      {children}
    </>
  );
}
