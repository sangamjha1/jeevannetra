"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageAlert } from "@/components/ui/message-alert";

export default function BookAppointmentPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingBeds, setFetchingBeds] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: "",
    hospitalId: "",
    bedId: "",
    date: "",
    reason: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, hospitalsRes] = await Promise.all([
          api.get("/doctors"),
          api.get("/hospitals")
        ]);
        setDoctors(doctorsRes.data);
        setHospitals(hospitalsRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchBeds = async () => {
      if (!formData.hospitalId) {
        setBeds([]);
        return;
      }

      setFetchingBeds(true);
      try {
        const res = await api.get(`/beds/hospital/${formData.hospitalId}`);
        setBeds(res.data || []);
      } catch (err) {
        console.error("Failed to fetch beds", err);
        setBeds([]);
      } finally {
        setFetchingBeds(false);
      }
    };

    fetchBeds();
  }, [formData.hospitalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/appointments", formData);
      router.push("/dashboard/appointments?success=true");
    } catch (err: any) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Book Appointment</CardTitle>
          <CardDescription>Select a hospital, doctor, bed, and preferred time.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <MessageAlert message={error} type="error" />}

            <div className="space-y-2">
              <Label htmlFor="hospitalId">Hospital</Label>
              <select
                id="hospitalId"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                required
                value={formData.hospitalId}
                onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value, bedId: "" })}
              >
                <option value="">Choose hospital</option>
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bedId">Bed (Optional)</Label>
              <select
                id="bedId"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
                value={formData.bedId}
                onChange={(e) => setFormData({ ...formData, bedId: e.target.value })}
                disabled={!formData.hospitalId || fetchingBeds}
              >
                <option value="">Choose bed</option>
                {beds.map((bed) => (
                  <option key={bed.id} value={bed.id}>
                    Bed {bed.bedNumber || bed.id.slice(0, 8)} - {bed.type} ({bed.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctorId">Doctor</Label>
              <select
                id="doctorId"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                required
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              >
                <option value="">Choose doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.user?.firstName} {doctor.user?.lastName} ({doctor.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date and time</Label>
              <Input
                id="date"
                type="datetime-local"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <textarea
                id="reason"
                className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Booking..." : "Confirm"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
