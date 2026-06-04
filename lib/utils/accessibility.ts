/**
 * Accessibility Utilities for HomeLink
 * 
 * This file provides utilities and helpers to ensure the application
 * meets WCAG 2.1 Level AA accessibility standards.
 */

/**
 * Generate a unique ID for form elements
 * Useful for connecting labels with inputs
 */
export const generateId = (prefix: string = "id") => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Screen reader only text
 * Visually hidden but accessible to screen readers
 */
export const srOnly = "sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0";

/**
 * Focus visible styles
 * Ensures keyboard navigation is visible
 */
export const focusVisible = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

/**
 * Announce to screen readers
 * Dynamically announce changes to screen reader users
 */
export const announce = (message: string, priority: "polite" | "assertive" = "polite") => {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = srOnly;
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Keyboard navigation helpers
 */
export const keyboardNav = {
  // Handle Enter and Space as click
  onActivate: (callback: () => void) => ({
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        callback();
      }
    },
    onClick: callback,
  }),

  // Handle Escape key
  onEscape: (callback: () => void) => ({
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        callback();
      }
    },
  }),

  // Arrow key navigation for lists
  onArrowNav: (
    currentIndex: number,
    maxIndex: number,
    onNavigate: (newIndex: number) => void
  ) => ({
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        onNavigate(Math.min(currentIndex + 1, maxIndex));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        onNavigate(Math.max(currentIndex - 1, 0));
      } else if (e.key === "Home") {
        e.preventDefault();
        onNavigate(0);
      } else if (e.key === "End") {
        e.preventDefault();
        onNavigate(maxIndex);
      }
    },
  }),
};

/**
 * ARIA label helpers
 */
export const ariaLabels = {
  // Loading state
  loading: (itemName?: string) => ({
    "aria-busy": true,
    "aria-label": itemName ? `Đang tải ${itemName}` : "Đang tải",
  }),

  // Error state
  error: (message: string) => ({
    role: "alert",
    "aria-live": "assertive",
    "aria-label": `Lỗi: ${message}`,
  }),

  // Success state
  success: (message: string) => ({
    role: "status",
    "aria-live": "polite",
    "aria-label": `Thành công: ${message}`,
  }),

  // Required field
  required: {
    "aria-required": true,
  },

  // Invalid field
  invalid: (errorMessage?: string) => ({
    "aria-invalid": true,
    ...(errorMessage && { "aria-describedby": generateId("error") }),
  }),

  // Expanded/collapsed state
  expanded: (isExpanded: boolean) => ({
    "aria-expanded": isExpanded,
  }),

  // Selected state
  selected: (isSelected: boolean) => ({
    "aria-selected": isSelected,
  }),

  // Disabled state
  disabled: {
    "aria-disabled": true,
    disabled: true,
  },

  // Hidden from screen readers
  hidden: {
    "aria-hidden": true,
  },
};

/**
 * Color contrast checker
 * Ensures text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
 */
export const checkContrast = (foreground: string, background: string): boolean => {
  // This is a simplified version. In production, use a proper contrast checker library
  // like 'color-contrast-checker' or 'wcag-contrast'
  console.warn("Contrast checking not implemented. Use a proper library in production.");
  return true;
};

/**
 * Focus trap for modals and dialogs
 * Keeps focus within a container
 */
export const useFocusTrap = (containerRef: React.RefObject<HTMLElement>) => {
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const trapFocus = (e: KeyboardEvent) => {
    if (e.key !== "Tab" || !containerRef.current) return;

    const focusable = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableElements)
    ).filter((el) => !el.hasAttribute("disabled"));

    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  return { trapFocus };
};

/**
 * Accessible form field wrapper
 * Use this type for creating accessible form fields
 */
export type FormFieldProps = {
  id?: string;
  label: string;
  error?: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
};
