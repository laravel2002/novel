export default function ReaderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
