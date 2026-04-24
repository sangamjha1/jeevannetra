"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageAlert } from "@/components/ui/message-alert";
import { Users, Bed, Plus, Trash2, Edit2 } from "lucide-react";

interface Staff {
  id: string;
  userId: string;
  type: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  tasks?: any;
}

const STAFF_TYPES = [
  { value: "NURSE", label: "👩‍⚕️ Nurse", color: "bg-blue-100 text-blue-800" },
  { value: "ICU_STAFF", label: "🏥 ICU Staff", color: "bg-red-100 text-red-800" },
  { value: "OT_STAFF", label: "🔪 OT Staff (Operating Theatre)", color: "bg-purple-100 text-purple-800" },
  { value: "OPD_STAFF", label: "📋 OPD Staff (Out-Patient)", color: "bg-green-100 text-green-800" },
  { value: "DOCTOR", label: "👨‍⚕️ Doctor", color: "bg-indigo-100 text-indigo-800" },
  { value: "SURGEON", label: "✂️ Surgeon", color: "bg-orange-100 text-orange-800" },
  { value: "ANESTHETIST", label: "💉 Anesthetist", color: "bg-cyan-100 text-cyan-800" },
  { value: "PHYSIOTHERAPIST", label: "🏃 Physiotherapist", color: "bg-lime-100 text-lime-800" },
  { value: "LAB_TECHNICIAN", label: "🧪 Lab Technician", color: "bg-yellow-100 text-yellow-800" },
  { value: "RECEPTIONIST", label: "📞 Receptionist", color: "bg-pink-100 text-pink-800" },
  { value: "AMBULANCE_DRIVER", label: "🚑 Ambulance Driver", color: "bg-slate-100 text-slate-800" },
  { value: "WARD_BOY", label: "🧹 Ward Boy", color: "bg-gray-100 text-gray-800" },
  { value: "SECURITY", label: "🛡️ Security", color: "bg-zinc-100 text-zinc-800" },
];

export function HospitalDashboard() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    type: "NURSE",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setError(null);
      const response = await api.get("/staff/hospital");
      console.log("✓ Staff API Response:", response.data);
      console.log("✓ Response Type:", typeof response.data);
      console.log("✓ Is Array:", Array.isArray(response.data));
      
      const staffData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      
      console.log(`✓ Staff Count: ${staffData.length}`);
      console.log("✓ Staff Data:", staffData);
      
      // Log each staff member's type
      staffData.forEach((s: Staff, idx: number) => {
        console.log(`Staff ${idx + 1}: ${s.user?.firstName} ${s.user?.lastName} (Type: ${s.type})`);
      });
      
      setStaff(staffData);
    } catch (err: any) {
      console.error("✗ Failed to load staff:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to load staff data";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.type) {
      setError("All fields are required");
      return;
    }

    setSubmitting(true);
    try {
      // Create staff with user account info - backend handles user creation
      await api.post("/staff", {
        type: formData.type,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        tasks: {},
      });

      setFormData({ email: "", firstName: "", lastName: "", phone: "", type: "NURSE" });
      setShowForm(false);
      setError(null);
      loadStaff();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add staff");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this staff member?")) return;

    try {
      await api.delete(`/staff/${userId}`);
      loadStaff();
    } catch (err) {
      setError("Failed to delete staff");
    }
  };

  const getStaffLabel = (type: string) => {
    return STAFF_TYPES.find(t => t.value === type)?.label || type;
  };

  const getStaffColor = (type: string) => {
    return STAFF_TYPES.find(t => t.value === type)?.color || "bg-gray-100 text-gray-800";
  };

  const countByType = (type: string) => {
    const count = staff.filter(s => s.type === type).length;
    if (count > 0) {
      console.log(`${type}: ${count} staff members`);
    }
    return count;
  };

  if (loading) {
    return <div className="text-center py-6">Loading hospital dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Hospital Management</h1>
        <p className="text-muted-foreground">Manage your hospital staff and resources</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{staff.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">🏥 ICU</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{countByType("ICU_STAFF")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">🔪 OT</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{countByType("OT_STAFF")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">👨‍⚕️ Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{countByType("DOCTOR")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Staff Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Management
              </CardTitle>
              <CardDescription>Add and manage hospital staff members</CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <MessageAlert message={error} type="error" />}

          {/* Add Staff Form */}
          {showForm && (
            <form onSubmit={handleAddStaff} className="bg-muted/20 p-4 rounded-lg space-y-3 border border-border/40">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <Input
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                type="tel"
                placeholder="Phone (Optional)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <div>
                <label className="text-sm font-medium block mb-2">Staff Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-foreground"
                >
                  {STAFF_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? "Adding..." : "Add Staff Member"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Staff List by Type */}
          {staff.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              No staff members added yet. Click "Add Staff" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Debug Info */}
              <div className="text-xs bg-muted/20 p-2 rounded border border-border/40 text-muted-foreground">
                <p>Debug: {staff.length} total staff member(s)</p>
                <p>Available staff types: {staff.map(s => s.type).join(", ")}</p>
              </div>
              
              {STAFF_TYPES.map((type) => {
                const typeStaff = staff.filter(s => s.type === type.value);
                if (typeStaff.length === 0) return null;

                return (
                  <div key={type.value} className="border-t pt-4">
                    <p className="font-semibold text-sm mb-3">{type.label}</p>
                    <div className="space-y-2">
                      {typeStaff.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/30 transition-all"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {member.user?.firstName} {member.user?.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.user?.email}
                            </p>
                            {member.user?.phone && (
                              <p className="text-xs text-muted-foreground">
                                📱 {member.user.phone}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStaffColor(member.type)}>
                              {type.label}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteStaff(member.userId)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
