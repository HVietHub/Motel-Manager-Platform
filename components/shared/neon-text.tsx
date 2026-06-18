"use client";

import { cn } from "@/lib/utils/utils";
import { PlanTier } from "@/lib/constants/plans";

interface NeonTextProps {
  text: string;
  plan?: string;
  className?: string;
}

export function NeonText({ text, plan, className }: NeonTextProps) {
  const getNeonClass = () => {
    if (plan === PlanTier.STARTER) {
      return "neon-green";
    }
    if (plan === PlanTier.PRO) {
      return "neon-red";
    }
    return "";
  };

  return (
    <span className={cn(getNeonClass(), className)}>
      {text}
    </span>
  );
}
