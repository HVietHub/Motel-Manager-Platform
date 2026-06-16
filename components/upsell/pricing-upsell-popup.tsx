"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Gem, Building2, DoorOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAN_LIMITS, PlanTier } from "@/lib/constants/plans";
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

type LandlordPlanResponse = {
  plan?: PlanTier;
};

type PopupReason = "LOGIN" | "PLAN_LIMIT_EXCEEDED";

const PLAN_LABELS: Record<PlanTier, string> = {
  [PlanTier.FREE]: "Miễn Phí",
  [PlanTier.STARTER]: "Starter",
  [PlanTier.PRO]: "Pro",
};

const LOGIN_PROMO_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const LIMIT_PROMO_COOLDOWN_MS = 6 * 60 * 60 * 1000;

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
  const [currentPlan, setCurrentPlan] = useState<PlanTier>(PlanTier.FREE);
  const [reason, setReason] = useState<PopupReason>("LOGIN");

  const landlordId = session?.user?.landlordId;
  const isLandlord = session?.user?.role === "LANDLORD";

  const currentPlanLimits = PLAN_LIMITS[currentPlan];

  useEffect(() => {
    const fetchStatsAndDecidePopup = async () => {
      if (status !== "authenticated" || !isLandlord || !landlordId) {
        return;
      }

      setIsLoadingStats(true);
      try {
        const [statsResponse, landlordResponse] = await Promise.all([
          fetch(`/api/dashboard/stats?landlordId=${landlordId}`),
          fetch(`/api/landlords/${landlordId}`),
        ]);
        if (!statsResponse.ok || !landlordResponse.ok) {
          return;
        }

        const data = (await statsResponse.json()) as DashboardStats;
        const landlord = (await landlordResponse.json()) as LandlordPlanResponse;
        const plan = landlord.plan ?? PlanTier.FREE;
        const planLimits = PLAN_LIMITS[plan];
        setStats(data);
        setCurrentPlan(plan);

        const loginPromptKey = buildLoginPromptKey(landlordId);
        const limitPromptKey = buildLimitPromptKey(landlordId);

        const exceeded =
          (planLimits.maxBuildings !== -1 && data.totalBuildings > planLimits.maxBuildings) ||
          (planLimits.maxRooms !== -1 && data.totalRooms > planLimits.maxRooms);

        if (exceeded) {
          const canShowLimitPopup = shouldShowByCooldown(
            localStorage.getItem(limitPromptKey),
            LIMIT_PROMO_COOLDOWN_MS
          );
          if (canShowLimitPopup) {
            setReason("PLAN_LIMIT_EXCEEDED");
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
        reason === "PLAN_LIMIT_EXCEEDED"
          ? buildLimitPromptKey(landlordId)
          : buildLoginPromptKey(landlordId);
      localStorage.setItem(key, String(Date.now()));
    }
  };

  const handleUpgradeClick = () => {
    if (landlordId) {
      const key =
        reason === "PLAN_LIMIT_EXCEEDED"
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

  const currentPlanLabel = PLAN_LABELS[currentPlan];
  const nextPlanLabel = currentPlan === PlanTier.STARTER ? PLAN_LABELS[PlanTier.PRO] : `${PLAN_LABELS[PlanTier.STARTER]} hoặc ${PLAN_LABELS[PlanTier.PRO]}`;

  const title =
    reason === "PLAN_LIMIT_EXCEEDED"
      ? `Bạn đã vượt giới hạn gói ${currentPlanLabel}`
      : "Nâng cấp để quản lý nhà trọ hiệu quả hơn";

  const description =
    reason === "PLAN_LIMIT_EXCEEDED"
      ? `Tài khoản hiện đang ở gói ${currentPlanLabel} và đã vượt giới hạn. Nâng cấp lên gói ${nextPlanLabel} để tiếp tục mở rộng tòa nhà và phòng trọ.`
      : "Khám phá các gói Starter và Pro để tự động hóa hóa đơn, báo cáo chi tiết và hỗ trợ ưu tiên.";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92dvh] w-[calc(100vw-1.5rem)] overflow-y-auto border-[#fdb549]/20 rounded-3xl bg-[#fafaf8] p-0 sm:max-w-[680px] sm:rounded-[2.5rem]">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#fdb549] via-[#ed7307] to-[#fdb549]" />

        <div className="p-5 sm:p-8 lg:p-10">
          <DialogHeader className="pt-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fdb549]/10 text-[#ed7307] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] w-fit border border-[#fdb549]/20">
              <Sparkles className="h-3.5 w-3.5" />
              Ưu đãi nâng cấp dịch vụ
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-black leading-tight mt-6 text-[#1f2116] tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-muted-foreground font-medium mt-2 sm:max-w-[90%]">
              {description}
            </DialogDescription>
          </DialogHeader>

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="rounded-2xl border border-[#e2e0d8] p-5 bg-white shadow-sm">
            <p className="font-black text-[#1f2116] mb-3 inline-flex items-center gap-2 text-sm uppercase tracking-wider">
              <Building2 className="h-4 w-4 text-[#ed7307]" />
              Tòa nhà
            </p>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Hiện tại: <span className="font-bold text-[#ed7307]">{stats?.totalBuildings ?? 0}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Gói {currentPlanLabel} tối đa: <span className="font-bold text-[#1f2116]">{currentPlanLimits.maxBuildings === -1 ? "Không giới hạn" : currentPlanLimits.maxBuildings}</span>
              </p>
            </div>
            <div className="h-1.5 w-full bg-[#f8f7f4] rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-[#fdb549] rounded-full" 
                style={{ width: `${currentPlanLimits.maxBuildings === -1 ? 0 : Math.min(((stats?.totalBuildings ?? 0) / currentPlanLimits.maxBuildings) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#e2e0d8] p-5 bg-white shadow-sm">
            <p className="font-black text-[#1f2116] mb-3 inline-flex items-center gap-2 text-sm uppercase tracking-wider">
              <DoorOpen className="h-4 w-4 text-[#8b9c38]" />
              Phòng trọ
            </p>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Hiện tại: <span className="font-bold text-[#ed7307]">{stats?.totalRooms ?? 0}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Gói {currentPlanLabel} tối đa: <span className="font-bold text-[#1f2116]">{currentPlanLimits.maxRooms === -1 ? "Không giới hạn" : currentPlanLimits.maxRooms}</span>
              </p>
            </div>
            <div className="h-1.5 w-full bg-[#f8f7f4] rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-[#8b9c38] rounded-full" 
                style={{ width: `${currentPlanLimits.maxRooms === -1 ? 0 : Math.min(((stats?.totalRooms ?? 0) / currentPlanLimits.maxRooms) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-8 gap-3 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end">
          <Button 
            variant="secondary" 
            className="bg-[#f8f7f4] hover:bg-[#e2e0d8] text-muted-foreground hover:text-[#1f2116] font-bold px-8 h-12 rounded-xl transition-all border border-[#e2e0d8]"
            onClick={() => handleOpenChange(false)}
          >
            Để sau
          </Button>
          <Button 
            className="bg-[#1f2116] hover:bg-[#31361b] text-white font-black px-8 h-12 rounded-xl transition-all shadow-lg shadow-black/10 flex items-center gap-2" 
            onClick={handleUpgradeClick}
          >
            <Gem className="h-4 w-4 text-[#fdb549]" />
            Xem gói dịch vụ
          </Button>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
