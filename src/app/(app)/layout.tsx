import { NavBar } from "@/components/layout/nav-bar";
import { Sidebar } from "@/components/layout/sidebar";
import { AuthProvider } from "@/components/providers/auth-provider";
import { OfflineProvider } from "@/components/providers/offline-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <OfflineProvider>
        <div className="flex h-screen flex-col overflow-hidden">
          <NavBar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </OfflineProvider>
    </AuthProvider>
  );
}
