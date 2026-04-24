"use client";

import { useState } from "react";
import { User, ShieldCheck } from "lucide-react";
import { GeneralSettings } from "./GeneralSettings";
import { SecuritySettings } from "./SecuritySettings";
import { cn } from "@/lib/utils";

type TabType = "general" | "security";

export function ProfileLayout({
  user,
}: {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
}) {
  const [activeTab, setActiveTab] = useState<TabType>("general");

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0">
        <div className="sticky top-24 bg-card border border-border/50 rounded-xl p-3 shadow-sm flex flex-col gap-1">
          <button
            onClick={() => setActiveTab("general")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full text-left",
              activeTab === "general"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
            )}
          >
            <User className="w-5 h-5" />
            Thông tin chung
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full text-left",
              activeTab === "security"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
            )}
          >
            <ShieldCheck className="w-5 h-5" />
            Bảo mật
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-card border border-border/50 rounded-xl p-6 shadow-sm min-h-[500px]">
        {activeTab === "general" && <GeneralSettings user={user} />}
        {activeTab === "security" && <SecuritySettings />}
      </div>
    </div>
  );
}
