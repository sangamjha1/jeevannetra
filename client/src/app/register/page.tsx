"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "PATIENT",
    gender: "",
    dateOfBirth: "",
    address: "",
    bloodGroup: "",
    height: "",
    weight: "",
    emergencyContact: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/signup", formData);
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4" suppressHydrationWarning>
      <Card className="w-full max-w-xl border-slate-200 shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold">Create account</CardTitle>
          <CardDescription>Register to start using the hospital system</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4 sm:grid-cols-2 max-h-96 overflow-y-auto">
            {error && <div className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            
            {/* Basic Info */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First name *</Label>
              <Input id="firstName" required value={formData.firstName} onChange={handleChange} placeholder="John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name *</Label>
              <Input id="lastName" required value={formData.lastName} onChange={handleChange} placeholder="Doe" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" required value={formData.email} onChange={handleChange} placeholder="john@example.com" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" />
            </div>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input id="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="Contact number" />
            </div>
            
            {/* Personal Info */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
            </div>
            
            {/* Address */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={formData.address} onChange={handleChange} placeholder="123 Main Street" />
            </div>
            
            {/* Medical Info */}
            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <select
                id="bloodGroup"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={formData.bloodGroup}
                onChange={handleChange}
              >
                <option value="">Select blood group</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <select
                id="role"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
                <option value="STAFF">Staff</option>
                <option value="HOSPITAL">Hospital</option>
              </select>
            </div>
            
            {/* Physical Measurements */}
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" type="number" step="0.1" value={formData.height} onChange={handleChange} placeholder="170" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" step="0.1" value={formData.weight} onChange={handleChange} placeholder="70" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account? <Link href="/login" className="text-slate-900 underline">Sign in</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
