"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Users,
  Building2,
  MapPin,
  Phone,
  Mail,
  Badge,
} from "lucide-react";

interface StaffProfile {
  id: string;
  userId: string;
  type: string;
  tasks: any;
  hospital: {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

interface EmergencyAlert {
  id: string;
  type: string;
  severity: string;
  status: string;
  description: string;
  createdAt: string;
}

const STAFF_TYPE_COLORS: Record<string, { badge: string; bg: string; icon: string }> = {
  NURSE: { badge: "bg-red-100 text-red-800", bg: "from-red-500/20 to-red-600/20", icon: "🏥" },
  ICU_STAFF: { badge: "bg-purple-100 text-purple-800", bg: "from-purple-500/20 to-purple-600/20", icon: "🛏️" },
  OT_STAFF: { badge: "bg-blue-100 text-blue-800", bg: "from-blue-500/20 to-blue-600/20", icon: "⚕️" },
  OPD_STAFF: { badge: "bg-green-100 text-green-800", bg: "from-green-500/20 to-green-600/20", icon: "📋" },
  DOCTOR: { badge: "bg-indigo-100 text-indigo-800", bg: "from-indigo-500/20 to-indigo-600/20", icon: "👨‍⚕️" },
  SURGEON: { badge: "bg-orange-100 text-orange-800", bg: "from-orange-500/20 to-orange-600/20", icon: "🔪" },
  ANESTHETIST: { badge: "bg-yellow-100 text-yellow-800", bg: "from-yellow-500/20 to-yellow-600/20", icon: "💊" },
  PHYSIOTHERAPIST: { badge: "bg-cyan-100 text-cyan-800", bg: "from-cyan-500/20 to-cyan-600/20", icon: "🏃" },
  LAB_TECHNICIAN: { badge: "bg-pink-100 text-pink-800", bg: "from-pink-500/20 to-pink-600/20", icon: "🧪" },
  RECEPTIONIST: { badge: "bg-teal-100 text-teal-800", bg: "from-teal-500/20 to-teal-600/20", icon: "📞" },
  AMBULANCE_DRIVER: { badge: "bg-red-100 text-red-800", bg: "from-red-500/20 to-red-600/20", icon: "🚑" },
  WARD_BOY: { badge: "bg-gray-100 text-gray-800", bg: "from-gray-500/20 to-gray-600/20", icon: "👷" },
  SECURITY: { badge: "bg-slate-100 text-slate-800", bg: "from-slate-500/20 to-slate-600/20", icon: "🛡️" },
};

export function StaffDashboard() {
  const { user } = useAuth();
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [emergencies, setEmergencies] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadStaffData();
  }, [user]);

  const loadStaffData = async () => {
    try {
      setError(null);
      setLoading(true);

      // Fetch staff profile
      const staffRes = await api.get("/staff/me");
      console.log("✓ Staff Profile:", staffRes.data);
      setStaffProfile(staffRes.data);

      // Fetch emergency alerts
      try {
        const emergencyRes = await api.get("/emergency/active");
        console.log("✓ Active Emergencies:", emergencyRes.data);
        setEmergencies(emergencyRes.data || []);
      } catch (e) {
        console.log("Note: Could not load emergency alerts");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to load staff data";
      console.error("Error:", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 text-muted-foreground">Loading staff dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-500 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!staffProfile) {
    return (
      <div className="space-y-6">
        <Card className="border-yellow-500 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
              <p>Staff profile not found. Please complete onboarding.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const staffType = staffProfile.type as keyof typeof STAFF_TYPE_COLORS;
  const staffTypeInfo = STAFF_TYPE_COLORS[staffType] || STAFF_TYPE_COLORS.NURSE;
  const shift = staffProfile.tasks?.shift || "Not Assigned";
  const ward = staffProfile.tasks?.ward || "General";

  return (
    <div className="space-y-6">
      {/* Emergency Alerts */}
      {emergencies.length > 0 && (
        <Card className="border-red-500 bg-gradient-to-r from-red-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Active Emergencies ({emergencies.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencies.map((emergency) => (
              <div
                key={emergency.id}
                className="flex items-start justify-between rounded-lg border border-red-200 bg-white p-4"
              >
                <div>
                  <p className="font-semibold text-red-600">{emergency.type}</p>
                  <p className="text-sm text-muted-foreground">{emergency.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(emergency.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge className={`${emergency.severity === 'high' ? 'bg-red-600' : 'bg-orange-600'}`}>
                  {emergency.severity}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Staff Profile Card */}
      <Card className={`border-l-4 border-l-blue-500 bg-gradient-to-br ${staffTypeInfo.bg}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{staffTypeInfo.icon}</span>
              <div>
                <p>
                  {staffProfile.user.firstName} {staffProfile.user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{staffProfile.user.email}</p>
              </div>
            </div>
            <Badge className={staffTypeInfo.badge}>{staffProfile.type}</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Shift & Assignment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Shift & Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Shift</p>
              <p className="text-lg font-semibold text-blue-600">{shift}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Assigned To</p>
              <p className="text-lg font-semibold text-green-600">{ward}</p>
            </div>
            <Button className="w-full" variant="outline">
              Update Shift Status
            </Button>
          </CardContent>
        </Card>

        {/* Hospital Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-500" />
              Hospital Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Badge className="mt-0.5 bg-purple-100 text-purple-800">
                {staffProfile.hospital.name}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {staffProfile.hospital.address}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                {staffProfile.hospital.phone}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {staffProfile.hospital.email}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-orange-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <Button variant="outline" className="h-24 flex flex-col gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-xs text-center">Complete Task</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2">
            <AlertCircle className="h-5 w-5" />
            <span className="text-xs text-center">Report Issue</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2">
            <Users className="h-5 w-5" />
            <span className="text-xs text-center">View Patients</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2">
            <Clock className="h-5 w-5" />
            <span className="text-xs text-center">Check In/Out</span>
          </Button>
        </CardContent>
      </Card>

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-amber-500" />
            Today's Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {staffProfile.tasks?.tasks && Array.isArray(staffProfile.tasks.tasks) ? (
              staffProfile.tasks.tasks.map((task: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">{task.title || task}</p>
                    {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No tasks assigned for today</p>
                <p className="text-xs mt-1">Your shift appears to be clear</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
