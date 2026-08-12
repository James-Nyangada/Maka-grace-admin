import { Geist, Geist_Mono } from "next/font/google";
import { AppSidebar } from "@/components/app-sidebar";
import { AdminSiteHeader } from "@/components/admin-site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuthGuard } from "@/components/auth-guard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Admin Dashboard",
  description: "Manage your application settings and users",
};

export default function RootLayout({ children }) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
      <AuthGuard>
        <SidebarProvider
          style={{
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          }}
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <AdminSiteHeader />
            <div className="flex flex-1 flex-col">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </AuthGuard>
    </div>
  );
}
