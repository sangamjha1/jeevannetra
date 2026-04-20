"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface PendingAppointment {
  id: string;
  reason: string;
  date: string;
  status: string;
  patient?: {
    user?: {
      firstName: string;
      lastName: string;
      phone: string;
    };
    bloodGroup?: string;
  };
}

export function PendingAppointments() {
  const [appointments, setAppointments] = useState<PendingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setError(null);
        const response = await api.get("/appointments/doctor");
        // Filter for pending/confirmed appointments only
        const pending = response.data.filter((apt: any) => 
          apt.status === "PENDING" || apt.status === "CONFIRMED"
        );
        setAppointments(pending);
      } catch (err: any) {
        console.error("Failed to load appointments:", err);
        if (err.response?.status === 403) {
          setError("Access denied. Please log in with a DOCTOR account.");
        } else {
          setError("Failed to load appointments.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await api.patch(`/appointments/${appointmentId}`, { status: "CONFIRMED" });
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: "CONFIRMED" } : apt
      ));
    } catch (err) {
      console.error("Failed to confirm appointment:", err);
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await api.patch(`/appointments/${appointmentId}`, { status: "COMPLETED" });
      setAppointments(appointments.filter(apt => apt.id !== appointmentId));
    } catch (err) {
      console.error("Failed to complete appointment:", err);
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Appointments</CardTitle>
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
          <CardTitle>Pending Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading appointments...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          Pending Appointments
        </CardTitle>
        <CardDescription>Appointments awaiting your action ({appointments.length})</CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            ✓ No pending appointments. Great job!
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border border-border/40 rounded-lg p-4 hover:bg-muted/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{appointment.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Patient: {appointment.patient?.user?.firstName} {appointment.patient?.user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      📅 {format(new Date(appointment.date), "PPp")}
                    </p>
                    {appointment.patient?.bloodGroup && (
                      <p className="text-xs text-muted-foreground">
                        Blood: <Badge variant="secondary" className="text-xs">{appointment.patient.bloodGroup}</Badge>
                      </p>
                    )}
                  </div>
                  <Badge className={appointment.status === "PENDING" ? "bg-yellow-600" : "bg-blue-600"}>
                    {appointment.status}
                  </Badge>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {appointment.status === "PENDING" && (
                    <Button 
                      size="sm" 
                      onClick={() => handleConfirmAppointment(appointment.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirm
                    </Button>
                  )}
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => handleCompleteAppointment(appointment.id)}
                  >
                    Mark Complete
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`/dashboard/appointments/${appointment.id}`}>View Details</a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
