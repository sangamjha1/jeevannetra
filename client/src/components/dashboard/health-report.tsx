"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PatientData {
  id: string;
  bloodGroup: string;
  weight?: number;
  height?: number;
  emergencyContact?: string;
  appointments?: any[];
  prescriptions?: any[];
  bills?: any[];
}

export function HealthReport() {
  const { user } = useAuth();
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatientData = async () => {
      if (!user || user.role !== "PATIENT") {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/patients/profile");
        setPatientData(response.data);
      } catch (error) {
        console.error("Failed to load patient data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
  }, [user]);

  const calculateBMI = () => {
    if (!patientData?.weight || !patientData?.height) return null;
    const heightInMeters = patientData.height / 100;
    return (patientData.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "bg-blue-100 text-blue-800" };
    if (bmi < 25) return { label: "Normal", color: "bg-green-100 text-green-800" };
    if (bmi < 30) return { label: "Overweight", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Obese", color: "bg-red-100 text-red-800" };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!patientData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Patient data not available</div>
        </CardContent>
      </Card>
    );
  }

  const bmi = calculateBMI();
  const bmiStatus = bmi ? getBMIStatus(parseFloat(bmi)) : null;
  const completedAppointments = patientData.appointments?.filter((a) => a.status === "COMPLETED").length || 0;
  const activeWithoutPrescription = patientData.appointments?.filter(
    (a) => a.status === "COMPLETED" && !a.prescription
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Report</CardTitle>
        <CardDescription>Your health metrics and statistics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Blood Group */}
        <div className="border-b pb-3">
          <p className="text-xs text-muted-foreground mb-1">Blood Group</p>
          <Badge className="bg-blue-100 text-blue-800">{patientData.bloodGroup || "Not specified"}</Badge>
        </div>

        {/* Physical Metrics */}
        <div className="grid grid-cols-2 gap-4 border-b pb-3">
          {patientData.weight && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Weight</p>
              <p className="font-semibold">{patientData.weight} kg</p>
            </div>
          )}
          {patientData.height && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Height</p>
              <p className="font-semibold">{patientData.height} cm</p>
            </div>
          )}
        </div>

        {/* BMI */}
        {bmi && (
          <div className="border-b pb-3">
            <p className="text-xs text-muted-foreground mb-1">BMI</p>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{bmi}</p>
              {bmiStatus && <Badge className={bmiStatus.color}>{bmiStatus.label}</Badge>}
            </div>
          </div>
        )}

        {/* Medical Statistics */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">Medical History</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-muted p-2 rounded text-center">
              <p className="text-xs text-muted-foreground">Total Appointments</p>
              <p className="font-bold text-lg">{patientData.appointments?.length || 0}</p>
            </div>
            <div className="bg-muted p-2 rounded text-center">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="font-bold text-lg text-green-600">{completedAppointments}</p>
            </div>
            <div className="bg-muted p-2 rounded text-center">
              <p className="text-xs text-muted-foreground">Active Prescriptions</p>
              <p className="font-bold text-lg">{patientData.prescriptions?.length || 0}</p>
            </div>
            <div className="bg-muted p-2 rounded text-center">
              <p className="text-xs text-muted-foreground">Total Bills</p>
              <p className="font-bold text-lg">{patientData.bills?.length || 0}</p>
            </div>
          </div>
        </div>

        {patientData.emergencyContact && (
          <div className="border-t pt-3">
            <p className="text-xs text-muted-foreground mb-1">Emergency Contact</p>
            <p className="font-mono text-sm">{patientData.emergencyContact}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
