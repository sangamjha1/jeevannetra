"use client";

import { useAuth } from "@/context/AuthContext";
import { useAccidentSystem } from "@/context/AccidentDetectionContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  CreditCard,
  Users,
  Bed,
  AlertCircle,
  LogOut,
  Search,
  Menu,
  X,
  Plus,
  ChevronLeft,
  User,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import AccidentDetectionIndicator from "@/components/emergency/AccidentDetectionIndicator";

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["PATIENT", "DOCTOR", "STAFF", "HOSPITAL", "ADMIN"] },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar, roles: ["PATIENT", "DOCTOR"] },
  { name: "Prescriptions", href: "/dashboard/prescriptions", icon: FileText, roles: ["PATIENT", "DOCTOR"] },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard, roles: ["PATIENT", "HOSPITAL", "ADMIN"] },
  { name: "Emergency", href: "/dashboard/emergency", icon: AlertCircle, roles: ["PATIENT", "STAFF", "HOSPITAL"] },
  { name: "Beds", href: "/dashboard/beds", icon: Bed, roles: ["STAFF", "HOSPITAL", "ADMIN"] },
  { name: "Staff", href: "/dashboard/staff-manage", icon: Users, roles: ["HOSPITAL", "ADMIN"] },
  { name: "Medicine", href: "/dashboard/medicine", icon: Search, roles: ["PATIENT", "DOCTOR"] },
  { name: "Admin", href: "/dashboard/admin", icon: Users, roles: ["ADMIN"] },
  { name: "Profile", href: "/profile", icon: User, roles: ["PATIENT", "DOCTOR", "STAFF", "HOSPITAL", "ADMIN"] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const { triggerEmergencyManually } = useAccidentSystem();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const filteredItems = useMemo(() => {
    if (!user) return [];
    return sidebarItems.filter((item) => item.roles.includes(user.role));
  }, [user]);

  if (isLoading || !user) {
    return null;
  }

  return (
    <div suppressHydrationWarning className="flex min-h-screen bg-gradient-to-br from-background via-background to-background text-foreground">
      {isMobileMenuOpen && (
        <div suppressHydrationWarning className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 border-r border-border/20 bg-gradient-to-b from-[#0f172a]/95 to-[#0a0f1f]/95 backdrop-blur-xl transition-all duration-300 ease-out",
          sidebarCollapsed ? "w-20 lg:w-20" : "w-64 lg:w-64",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Area */}
          <div className="flex items-center justify-between border-b border-border/10 px-4 py-5">
            {!sidebarCollapsed && (
              <Link href="/dashboard" className="flex items-center gap-2.5 transition-all duration-300">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-accent to-purple-600 text-white shadow-lg shadow-primary/30">
                  <Plus className="h-5 w-5" />
                </span>
                <span className="bg-gradient-to-r from-primary via-accent to-purple-400 bg-clip-text text-sm font-bold text-transparent">Jeevan Netra</span>
              </Link>
            )}
            {sidebarCollapsed && (
              <Link href="/dashboard" className="flex items-center justify-center w-full">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-accent to-purple-600 text-white shadow-lg shadow-primary/30">
                  <Plus className="h-5 w-5" />
                </span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex h-8 w-8"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", sidebarCollapsed && "rotate-180")} />
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/20">
            {filteredItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative group",
                  pathname === item.href
                    ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary shadow-lg shadow-primary/10 border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className={cn(
                  "flex-shrink-0 rounded-lg p-2 transition-all duration-200",
                  pathname === item.href ? "bg-primary/20" : "group-hover:bg-white/10",
                )}>
                  <item.icon className="h-4 w-4" />
                </span>
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {pathname === item.href && (
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </>
                )}
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="border-t border-border/10 p-3">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200",
                sidebarCollapsed && "justify-center"
              )}
              onClick={logout}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              {!sidebarCollapsed && "Sign out"}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex min-w-0 flex-1 flex-col transition-all duration-300",
        sidebarCollapsed ? "lg:ml-20" : "lg:ml-64",
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/10 bg-gradient-to-r from-background/80 via-background/70 to-background/60 px-4 backdrop-blur-2xl sm:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm font-semibold text-foreground">{filteredItems.find((i) => i.href === pathname)?.name ?? "Dashboard"}</p>
              <p className="text-xs text-muted-foreground">Welcome back to your workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={triggerEmergencyManually}
              className="hidden sm:flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg px-4 py-2 transition-all duration-200 active:scale-95"
            >
              <Phone size={18} /> SOS
            </Button>
            <Link href="/profile" className="hidden sm:flex items-center gap-3 rounded-lg border border-border/20 bg-white/5 backdrop-blur px-4 py-2.5 cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-border/40">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-white">
                {user.firstName?.[0]}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </div>
      </main>

      {/* Accident Detection Indicator */}
      <AccidentDetectionIndicator />
    </div>
  );
}
