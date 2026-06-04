"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        {Icon && (
          <div className="mb-4 rounded-full bg-muted p-4">
            <Icon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm">
            {description}
          </p>
        )}
        {actionLabel && onAction && (
          <Button onClick={onAction} className="mt-6">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
