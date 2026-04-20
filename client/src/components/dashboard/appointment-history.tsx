"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Appointment {
  id: string;
  reason: string;
  date: string;
  status: string;
  doctor?: {
    user?: {
      firstName: string;
      lastName: string;
    };
    specialization?: string;
  };
}

export function AppointmentHistory() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setError(null);
        const response = await api.get("/appointments/patient");
        setAppointments(response.data);
      } catch (err: any) {
        console.error("Failed to load appointments:", err);
        if (err.response?.status === 403) {
          setError("Access denied. Please log in with a PATIENT account. Test credentials: patient@chms.com / patient123");
        } else {
          setError("Failed to load appointments. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment History</CardTitle>
          <CardDescription>Your recent appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment History</CardTitle>
        <CardDescription>Your recent appointments ({appointments.length})</CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center text-muted-foreground">No appointments yet</div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-sm">{appointment.reason}</p>
                  {appointment.doctor && (
                    <p className="text-xs text-muted-foreground">
                      Dr. {appointment.doctor.user?.firstName} {appointment.doctor.user?.lastName}
                      {appointment.doctor.specialization && ` • ${appointment.doctor.specialization}`}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{format(new Date(appointment.date), "PPp")}</p>
                </div>
                <Badge className={`ml-2 ${getStatusColor(appointment.status)}`}>{appointment.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
