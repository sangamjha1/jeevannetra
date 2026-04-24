"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageAlert } from "@/components/ui/message-alert";
import { Plus, Trash2 } from "lucide-react";

function PrescriptionForm() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const patientId = searchParams.get("patientId");
  const router = useRouter();

  const [formData, setFormData] = useState({
    appointmentId: appointmentId || "",
    patientId: patientId || "",
    diagnosis: "",
    instructions: "",
    medicines: [{ name: "", dosage: "", frequency: "", duration: "" }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddMedicine = () => {
    setFormData((prev) => ({ ...prev, medicines: [...prev.medicines, { name: "", dosage: "", frequency: "", duration: "" }] }));
  };

  const handleRemoveMedicine = (index: number) => {
    setFormData((prev) => ({ ...prev, medicines: prev.medicines.filter((_, i) => i !== index) }));
  };

  const handleMedicineChange = (index: number, field: string, value: string) => {
    const updated = [...formData.medicines];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, medicines: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/prescriptions", formData);
      router.push("/dashboard/prescriptions?created=true");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Create prescription</CardTitle>
          <CardDescription>Add diagnosis and medicines for this appointment.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && <MessageAlert message={error} type="error" />}

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <textarea
                id="diagnosis"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions (optional)</Label>
              <textarea
                id="instructions"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Medicines</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddMedicine}>
                  <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>

              {formData.medicines.map((med, index) => (
                <div key={index} className="grid grid-cols-1 gap-3 rounded-md border p-3 md:grid-cols-4">
                  <Input placeholder="Name" value={med.name} onChange={(e) => handleMedicineChange(index, "name", e.target.value)} />
                  <Input placeholder="Dosage" value={med.dosage} onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)} />
                  <Input placeholder="Frequency" value={med.frequency} onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)} />
                  <div className="flex gap-2">
                    <Input placeholder="Duration" value={med.duration} onChange={(e) => handleMedicineChange(index, "duration", e.target.value)} />
                    {formData.medicines.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveMedicine(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save prescription"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function CreatePrescriptionPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading form...</div>}>
      <PrescriptionForm />
    </Suspense>
  );
}
