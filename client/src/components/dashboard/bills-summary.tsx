"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BillItem {
  name: string;
  amount: number;
}

interface Bill {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  items: BillItem[];
  createdAt?: string;
}

export function BillsSummary() {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBills = async () => {
      if (!user || user.role !== "PATIENT") {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/bills/patient");
        setBills(response.data);
      } catch (error) {
        console.error("Failed to load bills:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBills();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "UNPAID":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const totalPaid = bills.filter((b) => b.status.toUpperCase() === "PAID").reduce((sum, bill) => sum + bill.amount, 0);
  const totalPending = bills
    .filter((b) => b.status.toUpperCase() !== "PAID")
    .reduce((sum, bill) => sum + bill.amount, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bills</CardTitle>
          <CardDescription>Your billing information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bills Summary</CardTitle>
        <CardDescription>Your billing history ({bills.length} bills)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted p-2 rounded">
            <p className="text-xs text-muted-foreground mb-1">Total</p>
            <p className="font-bold">${totalAmount.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <p className="text-xs text-muted-foreground mb-1">Paid</p>
            <p className="font-bold text-green-700">${totalPaid.toFixed(2)}</p>
          </div>
          <div className="bg-red-50 p-2 rounded">
            <p className="text-xs text-muted-foreground mb-1">Pending</p>
            <p className="font-bold text-red-700">${totalPending.toFixed(2)}</p>
          </div>
        </div>

        {bills.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm">No bills yet</div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {bills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-sm">{bill.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground">{bill.items.length} items</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">${bill.amount.toFixed(2)}</p>
                  <Badge className={`text-xs ${getStatusColor(bill.status)}`}>{bill.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
