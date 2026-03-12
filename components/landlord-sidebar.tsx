"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
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
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

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
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return "CN";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Header */}
      <div className="p-6">
        <Link href="/landlord/dashboard">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity">
            HouseSea
          </h1>
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
    </div>
  );
}

export function LandlordTopBar() {
  const router = useRouter();
  const { data: session } = useSession();

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
    <div className="h-16 border-b bg-background flex items-center justify-end px-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-3 h-auto py-2">
            <div className="flex flex-col items-end text-sm">
              <span className="font-medium">{session?.user?.name || "Chủ Nhà"}</span>
              <span className="text-xs text-muted-foreground">
                {session?.user?.email || ""}
              </span>
            </div>
            <Avatar className="h-8 w-8">
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
  );
}
