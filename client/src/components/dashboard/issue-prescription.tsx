"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageAlert } from "@/components/ui/message-alert";
import { Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Patient {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

export function IssuePrescription() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    diagnosis: "",
    instructions: "",
    medicines: [] as Medicine[],
  });
  const [currentMedicine, setCurrentMedicine] = useState<Medicine>({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPatientList, setShowPatientList] = useState(false);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const response = await api.get("/patients");
        setPatients(response.data);
      } catch (err) {
        console.error("Failed to load patients:", err);
      }
    };
    loadPatients();
  }, []);

  const handleSelectPatient = (patient: Patient) => {
    setFormData({
      ...formData,
      patientId: patient.id,
      patientName: `${patient.user.firstName} ${patient.user.lastName}`,
    });
    setShowPatientList(false);
  };

  const filteredPatients = patients.filter((p) =>
    `${p.user.firstName} ${p.user.lastName}`
      .toLowerCase()
      .includes(formData.patientName.toLowerCase())
  );

  const handleAddMedicine = () => {
    if (!currentMedicine.name || !currentMedicine.dosage) {
      setError("Medicine name and dosage are required");
      return;
    }
    setFormData({
      ...formData,
      medicines: [...formData.medicines, currentMedicine],
    });
    setCurrentMedicine({ name: "", dosage: "", frequency: "", duration: "" });
    setError(null);
  };

  const handleRemoveMedicine = (index: number) => {
    setFormData({
      ...formData,
      medicines: formData.medicines.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.diagnosis || formData.medicines.length === 0) {
      setError("Patient selection, diagnosis, and at least one medicine are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post("/prescriptions", {
        patientId: formData.patientId,
        diagnosis: formData.diagnosis,
        instructions: formData.instructions,
        medicines: formData.medicines,
      });
      setSuccess(true);
      setFormData({
        patientId: "",
        patientName: "",
        diagnosis: "",
        instructions: "",
        medicines: [],
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to issue prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issue Prescription</CardTitle>
      </CardHeader>
      <CardContent>
        {success && <MessageAlert message="Prescription issued successfully!" type="success" />}
        
        {error && <MessageAlert message={error} type="error" />}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Patient Selection */}
          <div className="space-y-2 relative">
            <label className="text-sm font-medium">Select Patient</label>
            <Input
              placeholder="Search patient by name..."
              value={formData.patientName}
              onChange={(e) => {
                setFormData({ ...formData, patientName: e.target.value });
                setShowPatientList(true);
              }}
              onFocus={() => setShowPatientList(true)}
            />
            {showPatientList && filteredPatients.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border/40 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => handleSelectPatient(patient)}
                    className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors text-sm"
                  >
                    <p className="font-medium">
                      {patient.user.firstName} {patient.user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{patient.id.slice(0, 8)}...</p>
                  </button>
                ))}
              </div>
            )}
            {formData.patientId && (
              <p className="text-xs text-emerald-600">✓ Selected: {formData.patientName}</p>
            )}
          </div>

          {/* Diagnosis */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Diagnosis</label>
            <textarea
              placeholder="Enter diagnosis details"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="w-full min-h-24 px-3 py-2 rounded-lg border border-border/40 bg-muted/30 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          {/* Medicines Section */}
          <div className="space-y-3 border-t pt-4">
            <p className="font-semibold text-sm">Medicines</p>
            
            {/* Add Medicine Form */}
            <div className="space-y-2 bg-muted/20 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Medicine name"
                  value={currentMedicine.name}
                  onChange={(e) => setCurrentMedicine({ ...currentMedicine, name: e.target.value })}
                />
                <Input
                  placeholder="Dosage (e.g., 500mg)"
                  value={currentMedicine.dosage}
                  onChange={(e) => setCurrentMedicine({ ...currentMedicine, dosage: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Frequency (e.g., Twice daily)"
                  value={currentMedicine.frequency}
                  onChange={(e) => setCurrentMedicine({ ...currentMedicine, frequency: e.target.value })}
                />
                <Input
                  placeholder="Duration (e.g., 7 days)"
                  value={currentMedicine.duration}
                  onChange={(e) => setCurrentMedicine({ ...currentMedicine, duration: e.target.value })}
                />
              </div>
              <Button
                type="button"
                onClick={handleAddMedicine}
                variant="outline"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </div>

            {/* Medicine List */}
            {formData.medicines.length > 0 && (
              <div className="space-y-2">
                {formData.medicines.map((medicine, index) => (
                  <div key={index} className="flex items-center justify-between bg-primary/5 p-3 rounded-lg border border-primary/20">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{medicine.name} - {medicine.dosage}</p>
                      <p className="text-xs text-muted-foreground">
                        {medicine.frequency && `${medicine.frequency}`}
                        {medicine.duration && ` • ${medicine.duration}`}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMedicine(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Special Instructions (Optional)</label>
            <textarea
              placeholder="Enter any special instructions for the patient"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full min-h-20 px-3 py-2 rounded-lg border border-border/40 bg-muted/30 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || formData.medicines.length === 0}
            className="w-full"
          >
            {loading ? "Issuing..." : "Issue Prescription"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
