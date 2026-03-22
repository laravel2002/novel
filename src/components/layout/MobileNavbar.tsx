"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IconSun,
  IconMoon,
  IconUserCircle,
  IconLogout,
  IconUser,
  IconSettings,
  IconBook2,
} from "@tabler/icons-react";
import { Logo } from "@/components/shared/Logo";
import { Search } from "./Search";
import { LoginModal } from "@/features/auth/components/LoginModal";
import { cn } from "@/lib/utils";

export function MobileNavbar() {
  const { setTheme } = useTheme();
  const { data: session, status } = useSession();

  return (
    <div className="container mx-auto px-3 flex h-14 items-center justify-between">
      {/* Left: Mobile Compact Logo */}
      <div className="flex items-center gap-3 cursor-pointer">
        <Link href="/" className="flex items-center space-x-2 shrink-0">
          <Logo />
        </Link>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Search />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="flex shrink-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
            >
              <IconSun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <IconMoon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="glass-panel border-primary/10"
          >
            <DropdownMenuItem
              onClick={() => setTheme("light")}
              className="cursor-pointer font-medium"
            >
              Sáng
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("dark")}
              className="cursor-pointer font-medium"
            >
              Tối
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("system")}
              className="cursor-pointer font-medium"
            >
              Hệ thống
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Auth */}
        {status === "loading" ? (
          <div className="w-9 h-9 border border-input bg-muted/50 rounded-full animate-pulse ml-1" />
        ) : session?.user ? (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-full h-9 w-9 p-0 hover:bg-transparent ml-1 relative group"
                >
                  <div className="absolute inset-[-2px] rounded-full bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity blur-xs" />
                  <Avatar className="h-9 w-9 cursor-pointer border-2 border-background shadow-sm relative z-10">
                    <AvatarImage
                      src={session.user.image || ""}
                      alt={session.user.name || "User"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 mt-2 glass-panel border-primary/20 shadow-xl"
              >
                <div className="flex items-center justify-start gap-3 p-3 bg-secondary/10 rounded-t-md mb-2">
                  <div className="flex flex-col space-y-1 block max-w-full">
                    <p className="font-heading font-bold text-sm text-foreground truncate">
                      {session.user.name}
                    </p>
                    <p className="w-full truncate text-xs font-medium text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  className="cursor-pointer py-2 focus:bg-primary/10 focus:text-primary transition-colors"
                  asChild
                >
                  <Link href="/ca-nhan">
                    <IconUser className="mr-2 h-4 w-4" />
                    <span className="font-medium">Hồ sơ cá nhân</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer py-2 focus:bg-primary/10 focus:text-primary transition-colors"
                  asChild
                >
                  <Link href="/tu-truyen">
                    <IconBook2 className="mr-2 h-4 w-4" />
                    <span className="font-medium">Tủ truyện của tôi</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-2 focus:bg-primary/10 focus:text-primary transition-colors">
                  <IconSettings className="mr-2 h-4 w-4" />
                  <span className="font-medium">Cài đặt hệ thống</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  className="cursor-pointer py-2 mt-1 text-red-500 focus:text-red-500 focus:bg-red-500/10 transition-colors"
                  onClick={() => signOut()}
                >
                  <IconLogout className="mr-2 h-4 w-4" />
                  <span className="font-medium">Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <LoginModal>
            <Button
              variant="default"
              size="sm"
              className="flex ml-2 font-heading font-bold rounded-full px-5 py-5 shadow-md hover:shadow-primary/25 transition-all text-[14px]"
            >
              Đăng Nhập
            </Button>
          </LoginModal>
        )}
      </div>
    </div>
  );
}
