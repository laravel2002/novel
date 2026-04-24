import { Navbar } from "@/components/layout/Navbar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { Footer } from "@/components/layout/Footer";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Navbar />
      {/* Padding bottom for mobile nav bar */}
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNavigation />
    </div>
  );
}
