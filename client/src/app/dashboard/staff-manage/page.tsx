"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StaffManagePage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      if (!user) return;

      try {
        const endpoint = user.role === "ADMIN" ? "/staff/all" : "/staff/hospital";
        const res = await api.get(endpoint);
        setStaff(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [user]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Staff</h2>
        <p className="text-sm text-muted-foreground">Hospital team directory and roles.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team members</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading staff...</div>
          ) : staff.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No staff members found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Hospital</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member) => (
                    <tr key={member.id} className="border-b">
                      <td className="py-3 pr-4 font-medium">
                        {member.user?.firstName} {member.user?.lastName}
                      </td>
                      <td className="py-3 pr-4">{member.user?.email || "-"}</td>
                      <td className="py-3 pr-4">{String(member.type || "").replaceAll("_", " ")}</td>
                      <td className="py-3 pr-4">{member.hospital?.name || "-"}</td>
                      <td className="py-3 pr-4">Active</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
