"use client";

import { useReadingSettings } from "@/lib/contexts/ReadingSettingsContext";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  IconSettings,
  IconAlignJustified,
  IconAlignLeft,
  IconMinus,
  IconPlus,
  IconRotate,
  IconSun,
  IconMoon,
  IconCoffee,
} from "@tabler/icons-react";

export function ChapterSettings() {
  const { settings, updateSettings, resetSettings } = useReadingSettings();
  const { theme, setTheme } = useTheme();

  const handleFontSizeChange = (delta: number) => {
    updateSettings({
      fontSize: Math.max(14, Math.min(32, settings.fontSize + delta)),
    });
  };

  const handleLineHeightChange = (value: number) => {
    updateSettings({ lineHeight: value });
  };

  const handleFontFamilyChange = (value: string) => {
    updateSettings({ fontFamily: value });
  };

  const handleTextAlignChange = (value: "justify" | "left") => {
    updateSettings({ textAlign: value });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Cài đặt hiển thị">
          <IconSettings className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-4">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Cài đặt hiển thị</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={resetSettings}
            title="Mặc định"
          >
            <IconRotate className="h-3 w-3" />
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Font Size */}
        <div className="py-2">
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Cỡ chữ
          </div>
          <div className="flex items-center justify-between gap-2 bg-muted/50 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault();
                handleFontSizeChange(-1);
              }}
            >
              <IconMinus className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-8 text-center">
              {settings.fontSize}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault();
                handleFontSizeChange(1);
              }}
            >
              <IconPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Font Family */}
        <div className="py-2">
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Phông chữ
          </div>
          <div className="flex gap-2">
            <Button
              variant={
                settings.fontFamily === "font-sans" ? "default" : "outline"
              }
              size="sm"
              className="flex-1 font-sans"
              onClick={(e) => {
                e.preventDefault();
                handleFontFamilyChange("font-sans");
              }}
            >
              Sans
            </Button>
            <Button
              variant={
                settings.fontFamily === "font-serif" ? "default" : "outline"
              }
              size="sm"
              className="flex-1 font-serif"
              onClick={(e) => {
                e.preventDefault();
                handleFontFamilyChange("font-serif");
              }}
            >
              Serif
            </Button>
            <Button
              variant={
                settings.fontFamily === "font-mono" ? "default" : "outline"
              }
              size="sm"
              className="flex-1 font-mono"
              onClick={(e) => {
                e.preventDefault();
                handleFontFamilyChange("font-mono");
              }}
            >
              Mono
            </Button>
          </div>
        </div>

        {/* Line Height */}
        <div className="py-2">
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Giãn dòng
          </div>
          <div className="flex gap-2">
            <Button
              variant={settings.lineHeight === 1.5 ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                handleLineHeightChange(1.5);
              }}
            >
              1.5
            </Button>
            <Button
              variant={settings.lineHeight === 1.8 ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                handleLineHeightChange(1.8);
              }}
            >
              1.8
            </Button>
            <Button
              variant={settings.lineHeight === 2.0 ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                handleLineHeightChange(2.0);
              }}
            >
              2.0
            </Button>
          </div>
        </div>

        {/* Text Align */}
        <div className="py-2">
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Căn lề
          </div>
          <div className="flex gap-2">
            <Button
              variant={settings.textAlign === "left" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                handleTextAlignChange("left");
              }}
            >
              <IconAlignLeft className="h-4 w-4 mr-2" /> Trái
            </Button>
            <Button
              variant={settings.textAlign === "justify" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                handleTextAlignChange("justify");
              }}
            >
              <IconAlignJustified className="h-4 w-4 mr-2" /> Đều
            </Button>
          </div>
        </div>

        {/* Reading Mode */}
        <div className="py-2">
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Chế độ đọc
          </div>
          <div className="flex gap-2">
            <Button
              variant={
                settings.readingMode === "scroll" ? "default" : "outline"
              }
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                updateSettings({ readingMode: "scroll" });
              }}
            >
              Cuộn
            </Button>
            <Button
              variant={
                settings.readingMode === "pagination" ? "default" : "outline"
              }
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                updateSettings({ readingMode: "pagination" });
              }}
            >
              Trang
            </Button>
          </div>
        </div>

        {/* Theme Switcher */}
        <div className="py-2">
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Giao diện (Theme)
          </div>
          <div className="flex gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                setTheme("light");
              }}
              title="Sáng"
            >
              <IconSun className="h-4 w-4" />
            </Button>
            <Button
              variant={theme === "sepia" ? "default" : "outline"}
              size="sm"
              className="flex-1 bg-[#f4ecd8] text-[#433422] hover:bg-[#e6ddc3] hover:text-[#433422] border-[#d3c7a8]"
              onClick={(e) => {
                e.preventDefault();
                setTheme("sepia");
              }}
              title="Màu giấy (Sepia)"
            >
              <IconCoffee className="h-4 w-4" />
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              size="sm"
              className="flex-1 bg-slate-950 text-white hover:bg-slate-800"
              onClick={(e) => {
                e.preventDefault();
                setTheme("dark");
              }}
              title="Tối"
            >
              <IconMoon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
