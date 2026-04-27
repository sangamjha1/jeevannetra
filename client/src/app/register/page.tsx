"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageAlert } from "@/components/ui/message-alert";
import { FormError } from "@/components/ui/form-error";
import { FieldError } from "@/components/ui/field-error";
import { PasswordValidator } from "@/components/ui/password-validator";
import Link from "next/link";
import { LegalModal } from "@/components/legal/LegalModal";
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY, LEGAL_TENDER } from "@/lib/legal-content";
import { Eye, EyeOff, CheckCircle, Loader } from "lucide-react";
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
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [legalCheckboxes, setLegalCheckboxes] = useState({
    termsAccepted: false,
    privacyAccepted: false,
    legalAccepted: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
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

  // Real-time password validation
  useEffect(() => {
    if (!formData.password) {
      setFieldErrors((prev) => ({ ...prev, password: "" }));
      return;
    }

    const errors: string[] = [];
    if (formData.password.length < 8) {
      errors.push("At least 8 characters");
    }
    if (!/[A-Z]/.test(formData.password)) {
      errors.push("One uppercase letter");
    }
    if (!/[0-9]/.test(formData.password)) {
      errors.push("One number");
    }

    setFieldErrors((prev) => ({
      ...prev,
      password: errors.length > 0 ? `Missing: ${errors.join(", ")}` : "",
    }));
  }, [formData.password]);

  // Real-time confirm password validation
  useEffect(() => {
    if (!formData.confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
    } else {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: "",
      }));
    }
  }, [formData.password, formData.confirmPassword]);

  // Real-time email validation
  useEffect(() => {
    if (!formData.email) {
      setFieldErrors((prev) => ({ ...prev, email: "" }));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFieldErrors((prev) => ({ ...prev, email: "Invalid email format" }));
    } else {
      setFieldErrors((prev) => ({ ...prev, email: "" }));
    }
  }, [formData.email]);

  // Real-time first name validation
  useEffect(() => {
    if (!formData.firstName) {
      setFieldErrors((prev) => ({ ...prev, firstName: "" }));
      return;
    }
    if (formData.firstName.length < 2) {
      setFieldErrors((prev) => ({
        ...prev,
        firstName: "First name must be at least 2 characters",
      }));
    } else {
      setFieldErrors((prev) => ({ ...prev, firstName: "" }));
    }
  }, [formData.firstName]);

  // Real-time last name validation
  useEffect(() => {
    if (!formData.lastName) {
      setFieldErrors((prev) => ({ ...prev, lastName: "" }));
      return;
    }
    if (formData.lastName.length < 2) {
      setFieldErrors((prev) => ({
        ...prev,
        lastName: "Last name must be at least 2 characters",
      }));
    } else {
      setFieldErrors((prev) => ({ ...prev, lastName: "" }));
    }
  }, [formData.lastName]);

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
      setShowOTP(true);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send verification code");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpCode.length < 6) {
      setError("OTP code must be 6 characters");
      return;
    }

    setVerificationLoading(true);
    setError("");

    try {
      await api.post("/auth/verify-email-code", {
        email: formData.email,
        code: otpCode,
        role: formData.role,
      });
      setEmailVerified(true);
      setShowOTP(false);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired OTP code");
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
      <div className="flex min-h-screen items-center justify-center p-4" suppressHydrationWarning>
        <div className="text-center" suppressHydrationWarning>
          <Loader className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-900 flex flex-col" suppressHydrationWarning>
      {/* Header */}
      <div className="flex-1 overflow-y-auto" suppressHydrationWarning>
        <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8" suppressHydrationWarning>
          <div className="rounded-lg border border-slate-700 shadow-2xl overflow-hidden bg-slate-900/40 backdrop-blur-sm">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-slate-900/40 border-b border-slate-700 px-8 py-8 text-center space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-400 to-primary/70 bg-clip-text text-transparent">Create Account</h1>
              <p className="text-sm text-slate-300">Join our healthcare system</p>
            </div>

            {/* Card Content */}
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="space-y-4 px-8 py-6 flex-1 overflow-y-auto bg-slate-900/20">
                {error && (
                  <FormError
                    error={error}
                    onDismiss={() => setError("")}
                    autoScroll
                  />
                )}

                {/* Select Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">Select Role *</Label>
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

                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      className={fieldErrors.firstName ? "border-red-500" : ""}
                    />
                    {fieldErrors.firstName && (
                      <FieldError error={fieldErrors.firstName} />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className={fieldErrors.lastName ? "border-red-500" : ""}
                    />
                    {fieldErrors.lastName && (
                      <FieldError error={fieldErrors.lastName} />
                    )}
                  </div>
                </div>

                {/* Email with Inline Verify Button */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      disabled={emailVerified}
                      placeholder="your@email.com"
                      className={`pr-12 ${
                        fieldErrors.email ? "border-red-500" : ""
                      }`}
                    />
                    {!emailVerified ? (
                      <button
                        type="button"
                        onClick={handleSendVerificationCode}
                        disabled={
                          verificationLoading || !formData.email || !!fieldErrors.email
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {verificationLoading ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          "Verify"
                        )}
                      </button>
                    ) : (
                      <button type="button" disabled className="absolute right-2 top-1/2 -translate-y-1/2">
                        <CheckCircle size={20} className="text-green-500" />
                      </button>
                    )}
                  </div>
                  {fieldErrors.email && <FieldError error={fieldErrors.email} />}
                </div>

                {/* OTP Field - Appears after Verify is clicked */}
                {showOTP && !emailVerified && (
                  <div className="space-y-2 animate-in fade-in duration-300">
                    <Label htmlFor="otp">Verification Code *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="otp"
                        type="text"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.toUpperCase())}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={verificationLoading || otpCode.length < 6}
                        className="px-4"
                      >
                        {verificationLoading ? (
                          <Loader size={16} className="animate-spin" />
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`pr-10 ${
                        fieldErrors.password ? "border-red-500" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      suppressHydrationWarning
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  <PasswordValidator
                    password={formData.password}
                    confirmPassword={formData.confirmPassword}
                    showValidation={true}
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={(formData as any).confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`pr-10 ${
                        fieldErrors.confirmPassword ? "border-red-500" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      suppressHydrationWarning
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <FieldError error={fieldErrors.confirmPassword} />
                  )}
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
                <div className="space-y-2">
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
                <div className="grid grid-cols-2 gap-3">
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
                </div>

                {/* Legal Checkboxes */}
                <div className="space-y-3 pt-4 border-t border-slate-700">
                  <Label className="text-base font-semibold text-slate-100">Legal Requirements *</Label>

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
              </div>

              {/* Divider */}
              <div className="border-t border-slate-700"></div>

              {/* Action Buttons */}
              <div className="px-8 py-6 flex flex-col gap-3 bg-slate-800/30 border-t border-slate-700">
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
                <p className="text-center text-sm text-slate-300">
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-primary underline hover:text-primary/80">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

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
