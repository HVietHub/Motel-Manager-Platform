"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

// Configure NProgress
NProgress.configure({
  minimum: 0.15,
  easing: "ease",
  speed: 300,
  showSpinner: false,
  trickleSpeed: 200,
});

function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept all link clicks to start progress
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Only trigger for internal navigation
      const isInternal =
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !target.hasAttribute("download") &&
        target.target !== "_blank";

      if (isInternal && href !== pathname) {
        NProgress.start();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  return null;
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  );
}
