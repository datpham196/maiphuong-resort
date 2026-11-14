"use client";

import { useRouter as useNextRouter } from "next/navigation";
import { useMemo } from "react";
import { useRouter as useI18nRouter } from "@/i18n/navigation";
import { markNavigation } from "@/lib/busy-bus";

type NextRouter = ReturnType<typeof useNextRouter>;
type I18nRouter = ReturnType<typeof useI18nRouter>;

/** Admin / non-i18n programmatic navigation with delayed progress. */
export function useNavRouter(): NextRouter {
  const router = useNextRouter();

  return useMemo(() => {
    return {
      ...router,
      push: ((...args: Parameters<NextRouter["push"]>) => {
        markNavigation();
        return router.push(...args);
      }) as NextRouter["push"],
      replace: ((...args: Parameters<NextRouter["replace"]>) => {
        markNavigation();
        return router.replace(...args);
      }) as NextRouter["replace"],
    };
  }, [router]);
}

/** Public site programmatic navigation (next-intl) with delayed progress. */
export function useI18nNavRouter(): I18nRouter {
  const router = useI18nRouter();

  return useMemo(() => {
    return {
      ...router,
      push: ((...args: Parameters<I18nRouter["push"]>) => {
        markNavigation();
        return router.push(...args);
      }) as I18nRouter["push"],
      replace: ((...args: Parameters<I18nRouter["replace"]>) => {
        markNavigation();
        return router.replace(...args);
      }) as I18nRouter["replace"],
    };
  }, [router]);
}
