"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Cookies from "js-cookie"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Home,
  Calendar,
  Package,
  Plus,
  Settings,
  MessageSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  LogOut,
  Image as ImageIcon,
  Receipt,
  Ticket,
} from "lucide-react"

const sidebarItems = [
  { group: "MAIN MENU", items: [
    { icon: Home, label: "Overview", href: "/super-admin/dashboard" },
    { icon: Package, label: "Packages", href: "/super-admin/packages" },
    { icon: Calendar, label: "Bookings", href: "/super-admin/booking" },
    { icon: Ticket, label: "Booking Vouchers", href: "/super-admin/booking-voucher" },
    { icon: Receipt, label: "Invoices", href: "/super-admin/invoice" },
    { icon: FileText, label: "Blog Posts", href: "/super-admin/blog" },
    { icon: MessageSquare, label: "Testimonials", href: "/super-admin/testimonials" },
  ]},
  { group: "FEATURES", items: [
    { icon: ImageIcon, label: "Gallery", href: "/super-admin/gallery" },
  ]},
  { group: "GENERAL", items: [
    { icon: Settings, label: "Settings", href: "/super-admin/settings" },
  ]}
]

export function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigation = (href) => {
    router.push(href)
  }

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    Cookies.remove("role", { path: "/" });
    router.push("/login");
  }

  const userInfo = Cookies.get("user");
  const userDetail = userInfo ? JSON.parse(userInfo) : null;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden p-2">
      <div className="flex flex-1 rounded-[20px] overflow-hidden bg-background">
        
        {/* Sidebar */}
        <div className="w-64 flex flex-col bg-sidebar h-full rounded-[20px] border border-sidebar-border/50 shadow-sm overflow-hidden z-10 flex-shrink-0">
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transform -rotate-12">
              <span className="text-white font-bold text-lg leading-none transform rotate-12">M</span>
            </div>
            <span className="font-bold text-xl text-foreground">MakaGrace</span>
          </div>



          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-6 scrollbar-none">
            {sidebarItems.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2">
                  {group.group}
                </h4>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Button
                      key={item.label}
                      variant="ghost"
                      className={cn(
                        "w-full justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 h-10 rounded-xl px-3",
                        pathname === item.href
                          ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shadow-sm"
                          : "text-sidebar-foreground font-medium"
                      )}
                      onClick={() => handleNavigation(item.href)}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-[18px] w-[18px]" />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-xs font-semibold">{item.badge}</span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="space-y-1 pt-2">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-10 rounded-xl px-3 font-medium"
              >
                <LogOut className="h-[18px] w-[18px] mr-3" />
                <span className="text-sm">Log out</span>
              </Button>
            </div>
          </nav>

        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden relative rounded-r-[20px]">
          
          {/* Header */}
          <header className="h-20 flex items-center justify-between px-8">
            <div className="flex items-center gap-2 bg-sidebar rounded-full border border-sidebar-border/50 p-1 px-3 shadow-sm h-10">
              <button onClick={() => router.back()} className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => router.forward()} className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors"><ChevronRight className="w-4 h-4" /></button>
              <div className="h-4 w-[1px] bg-border mx-1"></div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-muted-foreground">Maka Grace</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                <span className="font-semibold text-foreground capitalize">
                  {sidebarItems.flatMap(g => g.items).find(i => pathname.startsWith(i.href))?.label || pathname.split('/').pop().replace(/-/g, ' ')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-sidebar rounded-full p-1 pl-1 pr-3 border border-sidebar-border/50 shadow-sm h-10">
                <Avatar className="h-8 w-8 rounded-full border border-border/50">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">AD</AvatarFallback>
                </Avatar>
                <ChevronRight className="w-4 h-4 text-muted-foreground rotate-90" />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-none">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
