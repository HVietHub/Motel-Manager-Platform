/**
 * HomeLink Theme Configuration
 * 
 * This file documents the design system used throughout the application.
 */

export const theme = {
  // Brand Colors
  colors: {
    primary: {
      DEFAULT: "oklch(0.205 0 0)",
      foreground: "oklch(0.985 0 0)",
      gradient: "from-blue-600 to-indigo-600",
    },
    secondary: {
      DEFAULT: "oklch(0.97 0 0)",
      foreground: "oklch(0.205 0 0)",
    },
    success: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
    },
    warning: {
      bg: "bg-orange-100 dark:bg-orange-900/30",
      text: "text-orange-700 dark:text-orange-400",
      border: "border-orange-200 dark:border-orange-800",
    },
    error: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
    },
    info: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
    },
  },

  // Spacing Scale (based on 4px)
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem",  // 8px
    md: "1rem",    // 16px
    lg: "1.5rem",  // 24px
    xl: "2rem",    // 32px
    "2xl": "3rem", // 48px
    "3xl": "4rem", // 64px
  },

  // Border Radius
  radius: {
    sm: "calc(var(--radius) - 4px)",
    md: "calc(var(--radius) - 2px)",
    lg: "var(--radius)",
    xl: "calc(var(--radius) + 4px)",
    "2xl": "calc(var(--radius) + 8px)",
    full: "9999px",
  },

  // Typography
  typography: {
    fontFamily: {
      sans: "var(--font-geist-sans), Inter, system-ui, sans-serif",
      mono: "var(--font-geist-mono), monospace",
    },
    fontSize: {
      xs: "0.75rem",    // 12px
      sm: "0.875rem",   // 14px
      base: "1rem",     // 16px
      lg: "1.125rem",   // 18px
      xl: "1.25rem",    // 20px
      "2xl": "1.5rem",  // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },

  // Shadows
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  },

  // Transitions
  transitions: {
    fast: "150ms ease-in-out",
    base: "200ms ease-in-out",
    slow: "300ms ease-in-out",
  },

  // Z-Index Scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

// Helper functions
export const getStatusColor = (status: string) => {
  const statusMap: Record<string, keyof typeof theme.colors> = {
    success: "success",
    completed: "success",
    active: "success",
    available: "success",
    warning: "warning",
    pending: "warning",
    in_progress: "warning",
    error: "error",
    failed: "error",
    rejected: "error",
    terminated: "error",
    info: "info",
    occupied: "info",
  };

  return theme.colors[statusMap[status.toLowerCase()] || "info"];
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

export const formatDateTime = (date: Date | string) => {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};
