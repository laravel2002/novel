"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useState, useEffect } from "react";

// 1. Định nghĩa kiểu dữ liệu cho Cài đặt
type ReadingSettings = {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  textAlign: "justify" | "left";
  readingMode: "scroll" | "pagination";
};

// 2. Cài đặt mặc định (Dùng font-serif làm mặc định để chữ đẹp như sách in)
const defaultSettings: ReadingSettings = {
  fontSize: 20,
  lineHeight: 1.8,
  fontFamily: "font-serif",
  textAlign: "justify",
  readingMode: "scroll",
};

interface ReadingSettingsContextType {
  settings: ReadingSettings;
  updateSettings: (newSettings: Partial<ReadingSettings>) => void;
  resetSettings: () => void;
  isLoaded: boolean; // Tránh chớp nháy giao diện khi Next.js render lần đầu
}

const ReadingSettingsContext = createContext<
  ReadingSettingsContextType | undefined
>(undefined);

export function ReadingSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<ReadingSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // 3. Lấy dữ liệu từ localStorage khi người dùng vừa vào web
  useEffect(() => {
    const savedSettings = localStorage.getItem("reading_settings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Lỗi đọc cài đặt:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // 4. Lưu lại vào localStorage mỗi khi có thay đổi
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("reading_settings", JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  const updateSettings = (newSettings: Partial<ReadingSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <ReadingSettingsContext.Provider
      value={{ settings, updateSettings, resetSettings, isLoaded }}
    >
      {children}
    </ReadingSettingsContext.Provider>
  );
}

// Custom hook để gọi dùng ở các Component khác
export function useReadingSettings() {
  const context = useContext(ReadingSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useReadingSettings phải được bọc bên trong ReadingSettingsProvider",
    );
  }
  return context;
}
