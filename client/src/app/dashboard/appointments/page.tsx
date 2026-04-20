"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "status">("latest");

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        const endpoint = user.role === "PATIENT" ? "/appointments/patient" : user.role === "DOCTOR" ? "/appointments/doctor" : null;
        if (!endpoint) {
          setAppointments([]);
          return;
        }

        const res = await api.get(endpoint);
        setAppointments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const getSortedAppointments = () => {
    const sorted = [...appointments];
    
    if (sortBy === "latest") {
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === "oldest") {
      sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === "status") {
      const statusOrder: { [key: string]: number } = { PENDING: 0, CONFIRMED: 1, COMPLETED: 2, CANCELLED: 3 };
      sorted.sort((a, b) => {
        const statusDiff = (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999);
        if (statusDiff !== 0) return statusDiff;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }
    
    return sorted;
  };

  if (user && user.role !== "PATIENT" && user.role !== "DOCTOR") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Appointments are currently available for patient and doctor accounts.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Appointments</h2>
          <p className="text-sm text-muted-foreground">Track your upcoming and completed appointments.</p>
        </div>
        {user?.role === "PATIENT" && (
          <Button asChild>
            <Link href="/dashboard/appointments/book">Book appointment</Link>
          </Button>
        )}
      </div>

      {/* Sort Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Sort by:</label>
            <div className="flex gap-2">
              <Button
                variant={sortBy === "latest" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("latest")}
              >
                Latest First
              </Button>
              <Button
                variant={sortBy === "oldest" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("oldest")}
              >
                Oldest First
              </Button>
              <Button
                variant={sortBy === "status" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("status")}
              >
                By Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No appointments found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>{user?.role === "PATIENT" ? "Doctor" : "Patient"}</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getSortedAppointments().map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{new Date(appointment.date).toLocaleString()}</TableCell>
                    <TableCell>
                      {user?.role === "PATIENT"
                        ? `Dr. ${appointment.doctor?.user?.firstName ?? ""} ${appointment.doctor?.user?.lastName ?? ""}`
                        : `${appointment.patient?.user?.firstName ?? ""} ${appointment.patient?.user?.lastName ?? ""}`}
                    </TableCell>
                    <TableCell>{appointment.reason}</TableCell>
                    <TableCell>
                      <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                        appointment.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                        appointment.status === "CONFIRMED" ? "bg-blue-100 text-blue-800" :
                        appointment.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {appointment.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {user?.role === "DOCTOR" && appointment.status === "PENDING" && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/prescriptions/create?appointmentId=${appointment.id}&patientId=${appointment.patientId}`}>
                            Issue prescription
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
