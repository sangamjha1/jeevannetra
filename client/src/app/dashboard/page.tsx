"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DashboardStats } from "@/components/dashboard/stats-overview";
import { AppointmentHistory } from "@/components/dashboard/appointment-history";
import { PrescriptionsList } from "@/components/dashboard/prescriptions-list";
import { BillsSummary } from "@/components/dashboard/bills-summary";
import { HealthReport } from "@/components/dashboard/health-report";
import { PendingAppointments } from "@/components/dashboard/pending-appointments";
import { IssuePrescription } from "@/components/dashboard/issue-prescription";
import { ManageFees } from "@/components/dashboard/manage-fees";
import { HospitalDashboard } from "@/components/dashboard/hospital-dashboard";
import { StaffDashboard } from "@/components/dashboard/staff-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading || !user) {
    return (
      <div className="space-y-6 py-8 text-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome, {user.firstName}</h2>
          <p className="text-muted-foreground">Your hospital operations overview.</p>
        </div>
        {user.role === "PATIENT" && (
          <Button asChild>
            <Link href="/dashboard/appointments/book">Book Appointment</Link>
          </Button>
        )}
        {user.role === "DOCTOR" && (
          <Button asChild>
            <Link href="/dashboard/prescriptions">View All Prescriptions</Link>
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <DashboardStats />

      {/* PATIENT Dashboard */}
      {user.role === "PATIENT" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <AppointmentHistory />
            <PrescriptionsList />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <HealthReport />
            <BillsSummary />
          </div>
        </div>
      )}

      {/* DOCTOR Dashboard */}
      {user.role === "DOCTOR" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <PendingAppointments />
            <IssuePrescription />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <ManageFees />
          </div>
        </div>
      )}

      {/* STAFF Dashboard */}
      {user.role === "STAFF" && (
        <StaffDashboard />
      )}

      {/* HOSPITAL Admin Dashboard */}
      {user.role === "HOSPITAL" && (
        <HospitalDashboard />
      )}

      {/* ADMIN Dashboard */}
      {user.role === "ADMIN" && (
        <AdminDashboard />
      )}
    </div>
  );
}
