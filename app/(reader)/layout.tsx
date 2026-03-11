import { Navbar } from "@/components/layout/Navbar";

export default function ReaderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
