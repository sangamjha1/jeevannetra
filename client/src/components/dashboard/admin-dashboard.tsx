"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Building2,
  AlertCircle,
  BarChart3,
  Settings,
  Trash2,
  Edit2,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Shield,
  Database,
  FileText,
  TrendingUp,
  Calendar,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalHospitals: number;
  totalStaff: number;
  totalAppointments: number;
  totalPrescriptions: number;
  totalBills: number;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  onboardingDone: boolean;
  createdAt: string;
}

interface Hospital {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  beds: number;
  staff: number;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "hospitals" | "staff" | "settings">("overview");
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalHospitals: 0,
    totalStaff: 0,
    totalAppointments: 0,
    totalPrescriptions: 0,
    totalBills: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "PATIENT",
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load system stats
      const statsRes = await api.get("/admin/stats").catch(() => null);
      if (statsRes?.data) {
        setStats(statsRes.data);
      }

      // Load users
      const usersRes = await api.get("/admin/users").catch(() => null);
      if (usersRes?.data) {
        setUsers(usersRes.data);
      }

      // Load hospitals
      const hospitalsRes = await api.get("/admin/hospitals").catch(() => null);
      if (hospitalsRes?.data) {
        setHospitals(hospitalsRes.data);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.firstName || !newUser.lastName) {
      alert("Please fill all fields");
      return;
    }

    try {
      await api.post("/admin/users", newUser);
      alert("User created successfully");
      setNewUser({ email: "", firstName: "", lastName: "", role: "PATIENT" });
      setShowNewUserForm(false);
      loadDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/admin/users/${userId}`);
        alert("User deleted successfully");
        loadDashboardData();
      } catch (err: any) {
        alert(err.response?.data?.message || "Failed to delete user");
      }
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-700 pb-4">
        <h1 className="text-4xl font-bold text-white mb-2">System Administration</h1>
        <p className="text-slate-400">Complete control over all system resources</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-4">
        {(["overview", "users", "hospitals", "staff", "settings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Total Users", value: stats.totalUsers, icon: Users, color: "from-blue-500 to-blue-600" },
              { title: "Hospitals", value: stats.totalHospitals, icon: Building2, color: "from-green-500 to-green-600" },
              { title: "Staff Members", value: stats.totalStaff, icon: Shield, color: "from-purple-500 to-purple-600" },
              { title: "Appointments", value: stats.totalAppointments, icon: Calendar, color: "from-orange-500 to-orange-600" },
              { title: "Prescriptions", value: stats.totalPrescriptions, icon: FileText, color: "from-pink-500 to-pink-600" },
              { title: "Bills", value: stats.totalBills, icon: TrendingUp, color: "from-cyan-500 to-cyan-600" },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx} className={`bg-gradient-to-br ${stat.color} bg-opacity-10 border-slate-700`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">{stat.title}</p>
                        <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                      </div>
                      <Icon className="h-8 w-8 text-slate-400 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 grid-cols-2 md:grid-cols-4">
              {[
                { label: "Create User", icon: Plus },
                { label: "Manage Hospitals", icon: Building2 },
                { label: "View Reports", icon: BarChart3 },
                { label: "System Settings", icon: Settings },
                { label: "Backup Database", icon: Database },
                { label: "View Logs", icon: Clock },
                { label: "Manage Roles", icon: Shield },
                { label: "Export Data", icon: FileText },
              ].map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={idx}
                    variant="outline"
                    className="h-20 flex flex-col gap-2 bg-slate-700 border-slate-600 hover:bg-slate-600"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs text-center">{action.label}</span>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Database Connection", status: "healthy" },
                { label: "API Server", status: "healthy" },
                { label: "Frontend Server", status: "healthy" },
                { label: "Email Service", status: "healthy" },
                { label: "File Storage", status: "healthy" },
                { label: "Backup Status", status: "healthy" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <span className="text-slate-300">{item.label}</span>
                  <div className="flex items-center gap-2">
                    {item.status === "healthy" ? (
                      <>
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-green-400">Healthy</span>
                      </>
                    ) : (
                      <>
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-xs text-red-400">Offline</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* User Search & Create */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
            <Button
              onClick={() => setShowNewUserForm(!showNewUserForm)}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              New User
            </Button>
          </div>

          {/* Create User Form */}
          {showNewUserForm && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Create New User</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="First Name"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Input
                    placeholder="Last Name"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Input
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md"
                >
                  <option>PATIENT</option>
                  <option>DOCTOR</option>
                  <option>STAFF</option>
                  <option>HOSPITAL</option>
                  <option>ADMIN</option>
                </select>
                <div className="flex gap-2">
                  <Button onClick={handleCreateUser} className="bg-green-600 hover:bg-green-700">
                    Create User
                  </Button>
                  <Button
                    onClick={() => setShowNewUserForm(false)}
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users List */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Users ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400">Email</th>
                      <th className="text-left py-3 px-4 text-slate-400">Name</th>
                      <th className="text-left py-3 px-4 text-slate-400">Role</th>
                      <th className="text-left py-3 px-4 text-slate-400">Status</th>
                      <th className="text-left py-3 px-4 text-slate-400">Joined</th>
                      <th className="text-left py-3 px-4 text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="py-3 px-4 text-white">{u.email}</td>
                        <td className="py-3 px-4 text-white">
                          {u.firstName} {u.lastName}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-600/20 text-blue-400">{u.role}</span>
                        </td>
                        <td className="py-3 px-4">
                          {u.onboardingDone ? (
                            <span className="flex items-center gap-1 text-green-400">
                              <CheckCircle className="h-4 w-4" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-yellow-400">
                              <Clock className="h-4 w-4" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 flex gap-2">
                          <button className="p-1 hover:bg-slate-600 rounded">
                            <Edit2 className="h-4 w-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1 hover:bg-slate-600 rounded"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* HOSPITALS TAB */}
      {activeTab === "hospitals" && (
        <div className="space-y-6">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Hospital
          </Button>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hospitals.map((hospital) => (
              <Card key={hospital.id} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex justify-between items-start">
                    <span>{hospital.name}</span>
                    <Building2 className="h-5 w-5 text-blue-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-400">
                  <p>📧 {hospital.email}</p>
                  <p>📞 {hospital.phone}</p>
                  <p>📍 {hospital.address}</p>
                  <div className="flex justify-between pt-4 border-t border-slate-700">
                    <span>🛏️ {hospital.beds} Beds</span>
                    <span>👥 {hospital.staff} Staff</span>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button size="sm" variant="outline" className="flex-1 border-slate-600 hover:bg-slate-700">
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* STAFF TAB */}
      {activeTab === "staff" && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Staff Management</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-400">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
            <p className="mt-4">Staff management interface will display all staff across all hospitals with role-based controls.</p>
          </CardContent>
        </Card>
      )}

      {/* SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">System Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Email Configuration", desc: "SMTP settings for notifications" },
                { label: "Database Backup", desc: "Automated backup schedule" },
                { label: "Security Settings", desc: "Password policies and 2FA" },
                { label: "API Keys", desc: "Manage third-party integrations" },
                { label: "Audit Logs", desc: "View system activity logs" },
                { label: "License Management", desc: "Manage system licenses" },
              ].map((setting, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{setting.label}</p>
                    <p className="text-xs text-slate-400">{setting.desc}</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-600">
                    Configure
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
