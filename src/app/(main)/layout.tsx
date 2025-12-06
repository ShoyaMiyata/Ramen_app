import { Header, BottomNav } from "@/components/layout/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <main className="max-w-md mx-auto px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}
