"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { LegalModal } from "@/components/legal/LegalModal";
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY, LEGAL_TENDER } from "@/lib/legal-content";
import { Eye, EyeOff, Mail, CheckCircle, Loader } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (mounted && !authLoading && user) {
      router.push("/dashboard");
    }
  }, [mounted, authLoading, user, router]);

  const [formData, setFormData] = useState({
    email: "",
    role: "PATIENT",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    bloodGroup: "",
    height: "",
    weight: "",
    emergencyContact: "",
  });

  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [legalCheckboxes, setLegalCheckboxes] = useState({
    termsAccepted: false,
    privacyAccepted: false,
    legalAccepted: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [modals, setModals] = useState({
    termsOpen: false,
    privacyOpen: false,
    legalOpen: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleCheckboxChange = (key: keyof typeof legalCheckboxes) => {
    setLegalCheckboxes({ ...legalCheckboxes, [key]: !legalCheckboxes[key] });
  };

  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      setError("Invalid email format");
      return;
    }

    setVerificationLoading(true);
    setError("");

    try {
      await api.post("/auth/send-verification-email", {
        email: formData.email,
        role: formData.role,
      });
      setVerificationSent(true);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send verification code");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (verificationCode.length < 6) {
      setError("Verification code must be 6 characters");
      return;
    }

    setVerificationLoading(true);
    setError("");

    try {
      await api.post("/auth/verify-email-code", {
        email: formData.email,
        code: verificationCode,
        role: formData.role,
      });
      setEmailVerified(true);
      setError("");
      setVerificationSent(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired verification code");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailVerified) {
      setError("Please verify your email first");
      return;
    }

    // Password validation
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      setError("Password must contain at least one number");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate legal checkboxes
    if (!legalCheckboxes.termsAccepted || !legalCheckboxes.privacyAccepted || !legalCheckboxes.legalAccepted) {
      setError("You must accept all terms and conditions to continue");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const signupData = { ...formData };
      delete (signupData as any).confirmPassword;
      await api.post("/auth/signup", signupData);
      router.push("/login?registered=true&verified=true");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4" suppressHydrationWarning>
      <Card className="w-full max-w-2xl border-slate-200 shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold">Create account</CardTitle>
          <CardDescription>Register to start using the hospital system</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <CardContent className="grid gap-4 sm:grid-cols-2 max-h-[70vh] overflow-y-auto flex-1">
            {error && (
              <div className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Email Verification Section */}
            <div className="sm:col-span-2 space-y-3 border-b border-slate-200 pb-4">
              <Label className="text-base font-semibold">Email Verification *</Label>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={emailVerified}
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Register as *</Label>
                <select
                  id="role"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={emailVerified}
                >
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="STAFF">Staff</option>
                  <option value="HOSPITAL">Hospital</option>
                </select>
              </div>

              {!emailVerified && !verificationSent && (
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleSendVerificationCode}
                  disabled={verificationLoading || !formData.email || !formData.role}
                >
                  {verificationLoading ? (
                    <>
                      <Loader size={16} className="mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={16} className="mr-2" />
                      Send Verification Code
                    </>
                  )}
                </Button>
              )}

              {verificationSent && !emailVerified && (
                <div className="space-y-3">
                  <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-600 flex items-center gap-2">
                    <Mail size={16} />
                    Verification code sent to {formData.email}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="verify-code">Verification Code *</Label>
                    <Input
                      id="verify-code"
                      type="text"
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                      placeholder="e.g., ABC123"
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground">6-character code from your email</p>
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleVerifyCode}
                    disabled={verificationLoading || verificationCode.length < 6}
                  >
                    {verificationLoading ? (
                      <>
                        <Loader size={16} className="mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Email"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setVerificationSent(false);
                      setVerificationCode("");
                      setError("");
                    }}
                  >
                    Change email
                  </Button>
                </div>
              )}

              {emailVerified && (
                <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>✓ Email verified: {formData.email}</span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First name *</Label>
              <Input
                id="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name *</Label>
              <Input
                id="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
              />
            </div>

            {/* Password */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  suppressHydrationWarning
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                At least 8 characters, 1 uppercase letter, and 1 number
              </p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={(formData as any).confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="Contact number"
              />
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
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            {/* Address */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main Street"
              />
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

            {/* Physical Measurements */}
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                value={formData.height}
                onChange={handleChange}
                placeholder="170"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={handleChange}
                placeholder="70"
              />
            </div>

            {/* Legal Checkboxes */}
            <div className="sm:col-span-2 space-y-3 pt-4 border-t border-border/40">
              <Label className="text-base font-semibold">Legal Requirements *</Label>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={legalCheckboxes.termsAccepted}
                  onChange={() => handleCheckboxChange("termsAccepted")}
                  className="mt-1 w-4 h-4 rounded border-border"
                />
                <label htmlFor="terms" className="text-sm text-foreground flex items-center gap-2 cursor-pointer">
                  I accept the{" "}
                  <button
                    type="button"
                    onClick={() => setModals({ ...modals, termsOpen: true })}
                    className="text-primary hover:underline font-medium"
                  >
                    Terms and Conditions
                  </button>
                </label>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={legalCheckboxes.privacyAccepted}
                  onChange={() => handleCheckboxChange("privacyAccepted")}
                  className="mt-1 w-4 h-4 rounded border-border"
                />
                <label htmlFor="privacy" className="text-sm text-foreground flex items-center gap-2 cursor-pointer">
                  I accept the{" "}
                  <button
                    type="button"
                    onClick={() => setModals({ ...modals, privacyOpen: true })}
                    className="text-primary hover:underline font-medium"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="legal"
                  checked={legalCheckboxes.legalAccepted}
                  onChange={() => handleCheckboxChange("legalAccepted")}
                  className="mt-1 w-4 h-4 rounded border-border"
                />
                <label htmlFor="legal" className="text-sm text-foreground flex items-center gap-2 cursor-pointer">
                  I accept the{" "}
                  <button
                    type="button"
                    onClick={() => setModals({ ...modals, legalOpen: true })}
                    className="text-primary hover:underline font-medium"
                  >
                    Legal Tender & Liability
                  </button>
                </label>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t border-slate-200">
            <Button
              className="w-full"
              type="submit"
              disabled={
                loading ||
                !emailVerified ||
                !legalCheckboxes.termsAccepted ||
                !legalCheckboxes.privacyAccepted ||
                !legalCheckboxes.legalAccepted
              }
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-slate-900 underline hover:no-underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      {/* Legal Modals */}
      <LegalModal
        isOpen={modals.termsOpen}
        onClose={() => setModals({ ...modals, termsOpen: false })}
        title="Terms and Conditions"
        content={TERMS_AND_CONDITIONS}
      />
      <LegalModal
        isOpen={modals.privacyOpen}
        onClose={() => setModals({ ...modals, privacyOpen: false })}
        title="Privacy Policy"
        content={PRIVACY_POLICY}
      />
      <LegalModal
        isOpen={modals.legalOpen}
        onClose={() => setModals({ ...modals, legalOpen: false })}
        title="Legal Tender & Liability"
        content={LEGAL_TENDER}
      />
    </div>
  );
}
