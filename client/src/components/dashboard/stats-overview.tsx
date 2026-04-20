"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, Pill, FileText, DollarSign, TrendingUp } from "lucide-react";

interface StatsData {
  appointmentsCount: number;
  prescriptionsCount: number;
  billsCount: number;
  totalBilled?: number;
  patientsCount?: number;
}

export function DashboardStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    appointmentsCount: 0,
    prescriptionsCount: 0,
    billsCount: 0,
    totalBilled: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;

      try {
        const newStats: StatsData = {
          appointmentsCount: 0,
          prescriptionsCount: 0,
          billsCount: 0,
          totalBilled: 0,
        };

        // Load appointments
        try {
          const appointmentEndpoint =
            user.role === "PATIENT" ? "/appointments/patient" : user.role === "DOCTOR" ? "/appointments/doctor" : user.role === "HOSPITAL" ? "/appointments/hospital/all" : null;
          if (appointmentEndpoint) {
            const appRes = await api.get(appointmentEndpoint);
            newStats.appointmentsCount = appRes.data.length;
          }
        } catch (e) {
          console.log("Could not load appointments");
        }

        // Load prescriptions
        try {
          const prescriptionEndpoint =
            user.role === "PATIENT" ? "/prescriptions/patient" : user.role === "DOCTOR" ? "/prescriptions/doctor" : user.role === "HOSPITAL" ? "/prescriptions/hospital/all" : null;
          if (prescriptionEndpoint) {
            const preRes = await api.get(prescriptionEndpoint);
            newStats.prescriptionsCount = preRes.data.length;
          }
        } catch (e) {
          console.log("Could not load prescriptions");
        }

        // Load bills
        try {
          const billEndpoint = user.role === "PATIENT" ? "/bills/patient" : user.role === "DOCTOR" ? "/bills/doctor" : user.role === "HOSPITAL" ? "/bills/hospital" : null;
          if (billEndpoint) {
            const billRes = await api.get(billEndpoint);
            newStats.billsCount = billRes.data.length;
            newStats.totalBilled = billRes.data.reduce((sum: number, bill: any) => sum + bill.amount, 0);
          }
        } catch (e) {
          console.log("Could not load bills");
        }

        setStats(newStats);
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  const allStatCards = [
    {
      title: "Appointments",
      value: loading ? "-" : stats.appointmentsCount,
      icon: Calendar,
      gradient: "from-blue-500/20 to-blue-600/20",
      iconColor: "text-blue-400",
      borderColor: "border-blue-500/30",
      count: stats.appointmentsCount,
    },
    {
      title: "Prescriptions",
      value: loading ? "-" : stats.prescriptionsCount,
      icon: Pill,
      gradient: "from-emerald-500/20 to-emerald-600/20",
      iconColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      count: stats.prescriptionsCount,
    },
    {
      title: "Bills",
      value: loading ? "-" : stats.billsCount,
      icon: FileText,
      gradient: "from-amber-500/20 to-amber-600/20",
      iconColor: "text-amber-400",
      borderColor: "border-amber-500/30",
      count: stats.billsCount,
    },
    {
      title: "Total Billed",
      value: loading ? "-" : `₹${(stats.totalBilled || 0).toFixed(2)}`,
      icon: DollarSign,
      gradient: "from-violet-500/20 to-violet-600/20",
      iconColor: "text-violet-400",
      borderColor: "border-violet-500/30",
      count: stats.totalBilled || 0,
    },
  ];

  // Filter to only show stats with data (non-zero values)
  const statCards = allStatCards.filter(card => !loading && card.count > 0);

  // If no stats to show, return nothing (or empty state)
  if (!loading && statCards.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className={`relative overflow-hidden border ${card.borderColor} bg-gradient-to-br ${card.gradient} backdrop-blur-xl hover:border-opacity-100 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 group`}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/5 to-transparent" />

            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{card.title}</h3>
                <div className={`p-2 rounded-lg bg-white/10 backdrop-blur ${card.iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Updated today</span>
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
