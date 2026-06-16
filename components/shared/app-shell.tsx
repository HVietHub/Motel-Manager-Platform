"use client";

import { ReactNode } from "react";

interface AppShellProps {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
  /** Extra elements rendered inside the shell (e.g. upsell popups) */
  extras?: ReactNode;
  /** CSS class to offset main content area — use for fixed sidebars (e.g. tenant mobile) */
  contentClassName?: string;
}

/**
 * Shared app shell used by both landlord and tenant layouts.
 * Provides the flex h-screen structure with sidebar + topbar + main content.
 */
export function AppShell({ sidebar, topbar, children, extras, contentClassName }: AppShellProps) {
  return (
    <div className="flex h-dvh min-h-dvh overflow-hidden">
      {/* Sidebar */}
      {sidebar}

      {/* Main area */}
      <div className={`flex-1 flex flex-col overflow-hidden ${contentClassName ?? ""}`}>
        {/* Top bar */}
        {topbar}

        {/* Optional extras (modals, popups, etc.) */}
        {extras}

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto bg-muted/30 custom-scrollbar"
          role="main"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
