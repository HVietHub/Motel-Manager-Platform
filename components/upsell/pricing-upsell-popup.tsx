"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Gem, Building2, DoorOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DashboardStats = {
  totalBuildings: number;
  totalRooms: number;
};

type PopupReason = "LOGIN" | "FREE_LIMIT_EXCEEDED";

const FREE_PLAN_MAX_BUILDINGS = 1;
const FREE_PLAN_MAX_ROOMS = 3;
const LOGIN_PROMO_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h
const LIMIT_PROMO_COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6h

const buildLoginPromptKey = (landlordId: string) => `upsell-login-prompt-${landlordId}`;
const buildLimitPromptKey = (landlordId: string) => `upsell-limit-prompt-${landlordId}`;

const shouldShowByCooldown = (lastTimestampRaw: string | null, cooldownMs: number) => {
  if (!lastTimestampRaw) return true;
  const lastTimestamp = Number(lastTimestampRaw);
  if (Number.isNaN(lastTimestamp)) return true;
  return Date.now() - lastTimestamp >= cooldownMs;
};

export function PricingUpsellPopup() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reason, setReason] = useState<PopupReason>("LOGIN");

  const landlordId = session?.user?.landlordId;
  const isLandlord = session?.user?.role === "LANDLORD";

  const isOverFreePlanLimit = useMemo(() => {
    if (!stats) return false;
    return (
      stats.totalBuildings > FREE_PLAN_MAX_BUILDINGS ||
      stats.totalRooms > FREE_PLAN_MAX_ROOMS
    );
  }, [stats]);

  useEffect(() => {
    const fetchStatsAndDecidePopup = async () => {
      if (status !== "authenticated" || !isLandlord || !landlordId) {
        return;
      }

      setIsLoadingStats(true);
      try {
        const response = await fetch(`/api/dashboard/stats?landlordId=${landlordId}`);
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as DashboardStats;
        setStats(data);

        const loginPromptKey = buildLoginPromptKey(landlordId);
        const limitPromptKey = buildLimitPromptKey(landlordId);

        const exceeded =
          data.totalBuildings > FREE_PLAN_MAX_BUILDINGS ||
          data.totalRooms > FREE_PLAN_MAX_ROOMS;

        if (exceeded) {
          const canShowLimitPopup = shouldShowByCooldown(
            localStorage.getItem(limitPromptKey),
            LIMIT_PROMO_COOLDOWN_MS
          );
          if (canShowLimitPopup) {
            setReason("FREE_LIMIT_EXCEEDED");
            setOpen(true);
            return;
          }
        }

        const canShowLoginPopup = shouldShowByCooldown(
          localStorage.getItem(loginPromptKey),
          LOGIN_PROMO_COOLDOWN_MS
        );

        if (canShowLoginPopup) {
          setReason("LOGIN");
          setOpen(true);
        }
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStatsAndDecidePopup();
  }, [status, isLandlord, landlordId]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen && landlordId) {
      const key =
        reason === "FREE_LIMIT_EXCEEDED"
          ? buildLimitPromptKey(landlordId)
          : buildLoginPromptKey(landlordId);
      localStorage.setItem(key, String(Date.now()));
    }
  };

  const handleUpgradeClick = () => {
    if (landlordId) {
      const key =
        reason === "FREE_LIMIT_EXCEEDED"
          ? buildLimitPromptKey(landlordId)
          : buildLoginPromptKey(landlordId);
      localStorage.setItem(key, String(Date.now()));
    }
    setOpen(false);
    router.push("/landlord/payment");
  };

  if (status === "loading" || !isLandlord || isLoadingStats) {
    return null;
  }

  const title =
    reason === "FREE_LIMIT_EXCEEDED"
      ? "Bạn đã vượt giới hạn gói Miễn Phí"
      : "Nâng cấp để quản lý nhà trọ hiệu quả hơn";

  const description =
    reason === "FREE_LIMIT_EXCEEDED"
      ? "Tài khoản hiện đã vượt mức gói miễn phí. Nâng cấp để tiếp tục mở rộng tòa nhà và phòng trọ mà không bị giới hạn."
      : "Khám phá các gói Cơ Bản và Siêu Cấp để tự động hóa hóa đơn, báo cáo chi tiết và hỗ trợ ưu tiên.";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl border-blue-200/70 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />

        <DialogHeader className="pt-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold w-fit">
            <Sparkles className="h-3.5 w-3.5" />
            Ưu đãi nâng cấp dịch vụ
          </div>
          <DialogTitle className="text-2xl leading-tight mt-2">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid sm:grid-cols-2 gap-3 mt-1">
          <div className="rounded-xl border p-4 bg-slate-50/70">
            <p className="font-semibold mb-2 inline-flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              Tòa nhà
            </p>
            <p className="text-sm text-muted-foreground">
              Hiện tại: <span className="font-semibold text-foreground">{stats?.totalBuildings ?? 0}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Miễn phí tối đa: <span className="font-semibold text-foreground">{FREE_PLAN_MAX_BUILDINGS}</span>
            </p>
          </div>

          <div className="rounded-xl border p-4 bg-slate-50/70">
            <p className="font-semibold mb-2 inline-flex items-center gap-2">
              <DoorOpen className="h-4 w-4 text-indigo-600" />
              Phòng trọ
            </p>
            <p className="text-sm text-muted-foreground">
              Hiện tại: <span className="font-semibold text-foreground">{stats?.totalRooms ?? 0}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Miễn phí tối đa: <span className="font-semibold text-foreground">{FREE_PLAN_MAX_ROOMS}</span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Để sau
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={handleUpgradeClick}>
            <Gem className="mr-2 h-4 w-4" />
            Xem gói dịch vụ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
