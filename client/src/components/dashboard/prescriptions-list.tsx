"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { downloadPrescriptionText } from "@/lib/prescription-download";
import { cn } from "@/lib/utils";

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Prescription {
  id: string;
  diagnosis: string;
  instructions: string;
  medicines: Medicine[];
  doctor?: {
    user?: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt?: string;
}

export function PrescriptionsList() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const loadPrescriptions = async () => {
      try {
        setError(null);
        const response = await api.get("/prescriptions/patient");
        setPrescriptions(response.data);
      } catch (err: any) {
        console.error("Failed to load prescriptions:", err);
        if (err.response?.status === 403) {
          setError("Access denied. Please log in with a PATIENT account. Test credentials: patient@chms.com / patient123");
        } else {
          setError("Failed to load prescriptions. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadPrescriptions();
  }, []);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prescriptions</CardTitle>
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
          <CardTitle>Prescriptions</CardTitle>
          <CardDescription>Your active prescriptions</CardDescription>
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
        <CardTitle>Prescriptions</CardTitle>
        <CardDescription>Your active prescriptions ({prescriptions.length})</CardDescription>
      </CardHeader>
      <CardContent>
        {prescriptions.length === 0 ? (
          <div className="text-center text-muted-foreground">No prescriptions yet</div>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="border border-border/40 rounded-lg p-4 hover:border-border/60 hover:bg-white/5 transition-all">
                <div className="flex justify-between items-start gap-4">
                  <button
                    onClick={() => setExpandedId(expandedId === prescription.id ? null : prescription.id)}
                    className="flex-1 text-left hover:opacity-80 transition"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronDown className={cn("h-4 w-4 transition-transform", expandedId === prescription.id && "rotate-180")} />
                      <div>
                        <p className="font-semibold text-sm text-foreground">{prescription.diagnosis}</p>
                        {prescription.doctor && (
                          <p className="text-xs text-muted-foreground">
                            By Dr. {prescription.doctor.user?.firstName} {prescription.doctor.user?.lastName}
                          </p>
                        )}
                        {prescription.createdAt && (
                          <p className="text-xs text-muted-foreground">{format(new Date(prescription.createdAt), "PP")}</p>
                        )}
                      </div>
                    </div>
                  </button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => downloadPrescriptionText(prescription, `${user?.firstName} ${user?.lastName}`)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </div>

                {expandedId === prescription.id && (
                  <div className="mt-4 pt-4 border-t border-border/40 space-y-4">
                    <div>
                      <p className="text-sm font-semibold mb-3 text-foreground">Medicines:</p>
                      <div className="space-y-2">
                        {prescription.medicines && prescription.medicines.length > 0 ? (
                          prescription.medicines.map((med, idx) => (
                            <div key={idx} className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-3 rounded-lg text-xs">
                              <p className="font-semibold text-foreground">{med.name}</p>
                              <div className="grid grid-cols-3 gap-2 mt-2 text-muted-foreground">
                                <div>
                                  <p className="text-xs opacity-70">Dosage</p>
                                  <p className="font-medium text-foreground">{med.dosage}</p>
                                </div>
                                <div>
                                  <p className="text-xs opacity-70">Frequency</p>
                                  <p className="font-medium text-foreground">{med.frequency}</p>
                                </div>
                                <div>
                                  <p className="text-xs opacity-70">Duration</p>
                                  <p className="font-medium text-foreground">{med.duration}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">No medicines listed</p>
                        )}
                      </div>
                    </div>

                    {prescription.instructions && (
                      <div>
                        <p className="text-sm font-semibold mb-2 text-foreground">Instructions:</p>
                        <div className="bg-muted/30 border border-border/40 p-3 rounded-lg text-xs text-muted-foreground leading-relaxed">
                          {prescription.instructions}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
