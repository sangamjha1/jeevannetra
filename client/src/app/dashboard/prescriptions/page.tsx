"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadPrescriptionText } from "@/lib/prescription-download";

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const endpoint = user.role === "PATIENT" ? "/prescriptions/patient" : user.role === "DOCTOR" ? "/prescriptions/doctor" : null;
        if (!endpoint) {
          setItems([]);
          return;
        }

        const res = await api.get(endpoint);
        setItems(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Prescriptions</h2>
        <p className="text-sm text-muted-foreground">Digital prescriptions from your appointments.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading prescriptions...</div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No prescriptions found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>{user?.role === "PATIENT" ? "Doctor" : "Patient"}</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Medicines</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {user?.role === "PATIENT"
                        ? `Dr. ${item.doctor?.user?.firstName ?? ""} ${item.doctor?.user?.lastName ?? ""}`
                        : `${item.patient?.user?.firstName ?? ""} ${item.patient?.user?.lastName ?? ""}`}
                    </TableCell>
                    <TableCell>{item.diagnosis}</TableCell>
                    <TableCell>{Array.isArray(item.medicines) ? item.medicines.length : 0}</TableCell>
                    <TableCell className="text-right">
                      {user?.role === "PATIENT" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => downloadPrescriptionText(item, `${user?.firstName} ${user?.lastName}`)}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
