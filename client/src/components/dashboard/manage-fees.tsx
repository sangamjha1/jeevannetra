"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageAlert } from "@/components/ui/message-alert";
import { format } from "date-fns";
import { TrendingUp, DollarSign, Plus } from "lucide-react";

interface Bill {
  id: string;
  patientId: string;
  amount: number;
  status: string;
  date: string;
  patient?: {
    user?: {
      firstName: string;
      lastName: string;
    };
  };
}

interface Patient {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

export function ManageFees() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ patientId: "", patientName: "", amount: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showPatientList, setShowPatientList] = useState(false);

  useEffect(() => {
    loadBills();
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await api.get("/patients");
      setPatients(response.data);
    } catch (err) {
      console.error("Failed to load patients:", err);
    }
  };

  const loadBills = async () => {
    try {
      setError(null);
      const response = await api.get("/bills/doctor");
      setBills(response.data || []);
    } catch (err: any) {
      console.error("Failed to load bills:", err);
      setError("Failed to load fees data");
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.amount) {
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/bills", {
        patientId: formData.patientId,
        amount: parseFloat(formData.amount),
        description: "Consultation Fee",
      });
      setFormData({ patientId: "", patientName: "", amount: "" });
      setShowForm(false);
      loadBills();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add fee");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotalEarnings = () => {
    return bills.reduce((sum, bill) => sum + bill.amount, 0);
  };

  const calculatePending = () => {
    return bills.filter(bill => bill.status === "PENDING").length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Fees</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Manage Fees
            </CardTitle>
            <CardDescription>Track consultation fees and charges</CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Fee
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-950/40 border border-green-900/50 rounded-lg p-3">
            <p className="text-xs text-green-400 font-semibold">Total Earnings</p>
            <p className="text-2xl font-bold text-green-300 mt-1">
              ₹{calculateTotalEarnings().toFixed(2)}
            </p>
          </div>
          <div className="bg-amber-950/40 border border-amber-900/50 rounded-lg p-3">
            <p className="text-xs text-amber-400 font-semibold">Pending Payments</p>
            <p className="text-2xl font-bold text-amber-300 mt-1">{calculatePending()}</p>
          </div>
        </div>

        {error && <MessageAlert message={error} type="error" />}

        {/* Add Fee Form */}
        {showForm && (
          <form onSubmit={handleAddFee} className="bg-muted/20 p-4 rounded-lg space-y-3 border border-border/40">
            <div className="relative">
              <label className="text-xs font-medium block mb-1">Patient Name</label>
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
                      className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors text-sm border-b border-border/20 last:border-0"
                    >
                      <p className="font-medium">
                        {patient.user.firstName} {patient.user.lastName}
                      </p>
                    </button>
                  ))}
                </div>
              )}
              {formData.patientId && (
                <p className="text-xs text-emerald-600 mt-1">✓ Selected: {formData.patientName}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Amount (₹)</label>
              <Input
                type="number"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting || !formData.patientId} className="flex-1">
                {submitting ? "Adding..." : "Add Fee"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Fees List */}
        <div className="space-y-2">
          {bills.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              No fees added yet
            </div>
          ) : (
            bills.slice(0, 5).map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/30 transition-all"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {bill.patient?.user?.firstName} {bill.patient?.user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bill.date ? format(new Date(bill.date), "PP") : "N/A"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold">₹{bill.amount.toFixed(2)}</p>
                  <Badge className={getStatusColor(bill.status)}>
                    {bill.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>

        {bills.length > 5 && (
          <Button variant="outline" className="w-full">
            View All Fees ({bills.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
