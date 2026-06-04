"use client";

/**
 * Skip to Content Link
 * 
 * Allows keyboard users to skip navigation and go directly to main content.
 * This is a WCAG 2.1 Level A requirement.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
    >
      Bỏ qua đến nội dung chính
    </a>
  );
}
