"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/login", { email, password });
      const { accessToken, refreshToken, user } = response.data;
      login(accessToken, refreshToken, user);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background via-background to-background" suppressHydrationWarning>
      <Card className="w-full max-w-2xl border-slate-200 shadow-lg" suppressHydrationWarning>
        <CardHeader className="space-y-1 text-center" suppressHydrationWarning>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-purple-400 bg-clip-text text-transparent">
            Jeevan Netra
          </CardTitle>
          <CardDescription>Jeevan Netra - Healthcare Management System</CardDescription>
        </CardHeader>
        <div className="p-6 max-w-md mx-auto" suppressHydrationWarning>
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
            {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <div className="space-y-2" suppressHydrationWarning>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2" suppressHydrationWarning>
              <Label htmlFor="password">Password</Label>
              <div className="relative" suppressHydrationWarning>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
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
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button className="w-full" type="submit" disabled={loading} suppressHydrationWarning>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              No account? <Link href="/register" className="text-primary underline">Create one</Link>
            </p>
          </form>
        </div>
      </Card>
    </div>
  );
}
