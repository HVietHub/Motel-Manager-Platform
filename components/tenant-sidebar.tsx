"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  DoorOpen,
  FileText,
  Receipt,
  Bell,
  Wrench,
  LogOut,
  Menu,
  X,
  User,
  MessageSquare,
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
import { useSession, signOut } from "next-auth/react";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/tenant/dashboard" },
  { icon: DoorOpen, label: "Phòng Của Tôi", href: "/tenant/room" },
  { icon: FileText, label: "Hợp Đồng", href: "/tenant/contracts" },
  { icon: Receipt, label: "Hóa Đơn", href: "/tenant/invoices" },
  { icon: Bell, label: "Thông Báo", href: "/tenant/notifications" },
  { icon: Wrench, label: "Bảo Trì", href: "/tenant/maintenance" },
  { icon: MessageSquare, label: "Cộng Đồng", href: "/tenant/community" },
];

export function TenantSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    const tenantId = localStorage.getItem("tenantId");
    if (!tenantId) return;

    try {
      const response = await fetch(`/api/notifications?tenantId=${tenantId}`);
      if (response.ok) {
        const notifications = await response.json();
        const unread = notifications.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center justify-between px-4">
        <Link href="/tenant/dashboard">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer">
            HouseSea
          </h1>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-white border-r flex flex-col transition-transform duration-300",
          "lg:translate-x-0 lg:z-10 z-50",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-6 hidden lg:block">
          <Link href="/tenant/dashboard">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity">
              HouseSea
            </h1>
          </Link>
          <p className="text-sm text-muted-foreground mt-1">
            Dành cho Người Thuê
          </p>
        </div>

        <Separator className="hidden lg:block" />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto mt-16 lg:mt-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 relative",
                    isActive && "bg-secondary font-medium"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                  {item.label === "Thông Báo" && unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

export function TenantTopBar() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const getInitials = (name: string) => {
    if (!name) return "NT";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-16 border-b bg-background flex items-center justify-end px-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-3 h-auto py-2">
            <div className="flex flex-col items-end text-sm">
              <span className="font-medium">{session?.user?.name || "Người Thuê"}</span>
              <span className="text-xs text-muted-foreground">
                {session?.user?.email || ""}
              </span>
            </div>
            <Avatar>
              <AvatarFallback>{session?.user?.name ? getInitials(session.user.name) : "NT"}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Tài Khoản</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/tenant/profile")}>
            <User className="mr-2 h-4 w-4" />
            Thông Tin Cá Nhân
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Đăng Xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
