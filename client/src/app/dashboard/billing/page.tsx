"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingPage() {
  const { user } = useAuth();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      if (!user) return;
      try {
        const endpoint = user.role === "PATIENT" ? "/bills/patient" : user.role === "ADMIN" ? "/bills/all" : "/bills/hospital";
        const res = await api.get(endpoint);
        setBills(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [user]);

  const totals = useMemo(() => {
    const total = bills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
    const unpaid = bills.filter((bill) => bill.status !== "PAID").reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
    return { total, unpaid };
  }, [bills]);

  const handleDownloadPdf = async (billId: string) => {
    try {
      const response = await api.get(`/bills/${billId}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${billId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download PDF", err);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Billing</h2>
        <p className="text-sm text-muted-foreground">Invoices and payment status.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total billed</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">${totals.total.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">${totals.unpaid.toFixed(2)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading bills...</div>
          ) : bills.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No bills found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-4">Invoice</th>
                    <th className="py-2 pr-4">Recipient</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill.id} className="border-b">
                      <td className="py-3 pr-4">{bill.invoiceNumber}</td>
                      <td className="py-3 pr-4">
                        {user?.role === "PATIENT"
                          ? bill.hospital?.name ?? "-"
                          : `${bill.patient?.user?.firstName ?? ""} ${bill.patient?.user?.lastName ?? ""}`.trim() || "-"}
                      </td>
                      <td className="py-3 pr-4">${Number(bill.amount || 0).toFixed(2)}</td>
                      <td className="py-3 pr-4">{new Date(bill.date).toLocaleDateString()}</td>
                      <td className="py-3 pr-4">{bill.status}</td>
                      <td className="py-3 text-right">
                        <Button size="sm" variant="outline" onClick={() => handleDownloadPdf(bill.id)}>
                          Download PDF
                        </Button>
                      </td>
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
