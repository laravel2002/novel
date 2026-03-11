import type { Metadata } from "next";
import {
  DM_Sans,
  Inter,
  Be_Vietnam_Pro,
  Source_Serif_4,
  Lora,
  Montserrat,
} from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { headers } from "next/headers";
import { getDeviceTypeFromHeaders } from "@/lib/device";
import { DeviceProvider } from "@/components/providers/DeviceProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { BookmarkProvider } from "@/lib/contexts/BookmarkContext";
import { ReadingProgressProvider } from "@/lib/contexts/ReadingProgressContext";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { ReadingSettingsProvider } from "@/lib/contexts/ReadingSettingsContext";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

const inter = Inter({
  subsets: ["latin", "vietnamese"], // Hỗ trợ tốt tiếng Việt
  variable: "--font-inter", // Tạo biến CSS để dùng với Tailwind
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"], // Các độ đậm nhạt thường dùng
  variable: "--font-be-vietnam",
  display: "swap",
});

// Brand Guidelines: Montserrat thay cho Poppins vì hỗ trợ tiếng Việt rất tốt
const montserrat = Montserrat({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

// Brand Guidelines: Lora cho body text / nội dung truyện
const loraFont = Lora({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source-serif",
  display: "swap",
});

export const viewport: import("next").Viewport = {
  themeColor: "#141413", // Updated to match dark brand color
};

export const metadata: Metadata = {
  title: "Novel - Read and Share Stories",
  description: "A platform for reading and sharing novels and stories.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Novel",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const deviceType = getDeviceTypeFromHeaders(headersList);

  return (
    <html
      lang="vi"
      className={`${dmSans.variable} ${inter.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`${beVietnamPro.variable} ${loraFont.variable} ${sourceSerif.variable} antialiased bg-background text-foreground tracking-tight`}
      >
        <DeviceProvider initialDevice={deviceType}>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              themes={["light", "dark", "sepia"]}
              disableTransitionOnChange
            >
              <ReadingSettingsProvider>
                <BookmarkProvider>
                  <ReadingProgressProvider>
                    {children}
                    <SpeedInsights />
                    <Analytics />
                  </ReadingProgressProvider>
                </BookmarkProvider>
              </ReadingSettingsProvider>
            </ThemeProvider>
          </AuthProvider>
        </DeviceProvider>
        <Toaster />
      </body>
    </html>
  );
}
