"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { BarChart3, LayoutDashboard, LogOut, Shield, Users, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils/utils";

const menuItems = [
  {
    title: "Bảng điều khiển",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Người dùng",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Nhật ký hoạt động",
    href: "/admin/dashboard#activity-log",
    icon: Activity,
  },
  {
    title: "Phân tích",
    href: "/admin/dashboard#analytics",
    icon: BarChart3,
  },
];

function getInitials(name?: string | null) {
  if (!name) return "AD";
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-72 flex-col border-r bg-slate-950 text-white">
      <div className="p-6">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <Image src="/icon.webp" alt="HouseSea" width={36} height={36} className="rounded-xl" />
          <div>
            <h1 className="text-xl font-bold">Quản trị HouseSea</h1>
            <p className="text-xs text-slate-400">Quản lý nền tảng</p>
          </div>
        </Link>
      </div>

      <Separator className="bg-slate-800" />

      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hrefPath = item.href.split("#")[0];
          const isActive = pathname === hrefPath || pathname?.startsWith(hrefPath + "/");

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-slate-300 hover:bg-slate-900 hover:text-white",
                  isActive && "bg-slate-900 text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Shield className="h-4 w-4 text-emerald-400" />
            Quyền quản trị
          </div>
          <p className="mt-1 text-xs text-slate-400">Bảng điều khiển dành riêng cho phân tích và sức khỏe nền tảng.</p>
        </div>
      </div>
    </div>
  );
}

export function AdminTopBar() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <div className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div>
        <p className="text-sm font-semibold text-slate-900">Bảng điều khiển quản trị và phân tích</p>
        <p className="text-xs text-slate-500">Hành vi người dùng, doanh thu, chuyển đổi, duy trì và sức khỏe nền tảng</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-3 h-auto py-2">
            <div className="flex flex-col items-end text-sm">
              <span className="font-medium">{session?.user?.name || "Quản trị viên"}</span>
              <span className="text-xs text-muted-foreground">{session?.user?.email || ""}</span>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarFallback>{getInitials(session?.user?.name)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Tài khoản quản trị</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
