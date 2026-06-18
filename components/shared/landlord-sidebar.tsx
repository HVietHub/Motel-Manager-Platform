"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/utils";
import {
  Home,
  Menu,
  X,
  Building2,
  DoorOpen,
  Users,
  FileText,
  Receipt,
  Bell,
  Wrench,
  LogOut,
  BarChart3,
  MessageSquare,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { NeonText } from "@/components/shared/neon-text";

const menuItems = [
  {
    title: "Dashboard",
    href: "/landlord/dashboard",
    icon: Home,
  },
  {
    title: "Tòa Nhà",
    href: "/landlord/buildings",
    icon: Building2,
  },
  {
    title: "Phòng Trọ",
    href: "/landlord/rooms",
    icon: DoorOpen,
  },
  {
    title: "Người Thuê",
    href: "/landlord/tenants",
    icon: Users,
  },
  {
    title: "Hợp Đồng",
    href: "/landlord/contracts",
    icon: FileText,
  },
  {
    title: "Hóa Đơn",
    href: "/landlord/invoices",
    icon: Receipt,
  },
  {
    title: "Thông Báo",
    href: "/landlord/notifications",
    icon: Bell,
  },
  {
    title: "Bảo Trì",
    href: "/landlord/maintenance",
    icon: Wrench,
  },
  {
    title: "Cộng Đồng",
    href: "/landlord/community",
    icon: MessageSquare,
  },
  {
    title: "Báo Cáo & AI",
    href: "/landlord/reports",
    icon: BarChart3,
  },
  {
    title: "Nâng Cấp Gói",
    href: "/landlord/payment",
    icon: CreditCard,
  },
];

export function LandlordSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-dvh w-64 shrink-0 flex-col border-r bg-background lg:flex">
      {/* Header */}
      <div className="p-6">
        <Link href="/landlord/dashboard">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <Image src="/icon.webp" alt="HouseSea" width={32} height={32} className="rounded-lg" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              HouseSea
            </h1>
          </div>
        </Link>
        <p className="text-sm text-muted-foreground mt-1">
          Dành cho Chủ Nhà
        </p>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "bg-secondary font-medium"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function LandlordTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const getInitials = (name: string) => {
    if (!name) return "CN";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <div className="h-16 shrink-0 border-b bg-background flex items-center justify-between gap-3 px-3 sm:px-4 lg:justify-end lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/landlord/dashboard" className="flex items-center gap-2 lg:hidden min-w-0">
          <Image src="/icon.webp" alt="HouseSea" width={28} height={28} className="rounded-lg shrink-0" />
          <span className="truncate text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            HouseSea
          </span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-auto py-2 px-2 sm:gap-3">
              <div className="hidden sm:flex flex-col items-end text-sm min-w-0">
                <NeonText 
                  text={session?.user?.name || "Chủ Nhà"} 
                  plan={session?.user?.subscriptionPlan}
                  className="font-medium max-w-40 truncate"
                />
                <span className="text-xs text-muted-foreground max-w-44 truncate">
                  {session?.user?.email || ""}
                </span>
              </div>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>{session?.user?.name ? getInitials(session.user.name) : "CN"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Tài Khoản</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/landlord/profile")}>
              Thông Tin Cá Nhân
            </DropdownMenuItem>
            <DropdownMenuItem>
              Cài Đặt
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Đăng Xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Đóng menu"
          />
          <aside className="relative flex h-dvh w-[min(82vw,20rem)] flex-col border-r bg-background shadow-xl">
            <div className="flex items-center justify-between p-4">
              <Link href="/landlord/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <div className="flex items-center gap-2">
                  <Image src="/icon.webp" alt="HouseSea" width={32} height={32} className="rounded-lg" />
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                      HouseSea
                    </h1>
                    <p className="text-xs text-muted-foreground">Dành cho Chủ Nhà</p>
                  </div>
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} aria-label="Đóng menu">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <Separator />

            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-11",
                        isActive && "bg-secondary font-medium"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
