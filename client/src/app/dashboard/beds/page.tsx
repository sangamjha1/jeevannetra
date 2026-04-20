"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BedsPage() {
  const { user } = useAuth();
  const [beds, setBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBeds = async () => {
    try {
      const res = await api.get("/beds");
      setBeds(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeds();
  }, []);

  const toggleStatus = async (id: string, status: string) => {
    try {
      const next = status === "AVAILABLE" ? "OCCUPIED" : "AVAILABLE";
      await api.patch(`/beds/${id}/status`, { status: next });
      setBeds((prev) => prev.map((bed) => (bed.id === id ? { ...bed, status: next } : bed)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBed = async () => {
    try {
      await api.post("/beds", { type: "GENERAL", pricePerDay: 0 });
      fetchBeds();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Beds</h2>
          <p className="text-sm text-muted-foreground">Current hospital bed availability.</p>
        </div>
        {user?.role === "HOSPITAL" && <Button onClick={handleAddBed}>Add bed</Button>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-8 text-center text-sm text-muted-foreground">Loading beds...</div>
        ) : beds.length === 0 ? (
          <div className="col-span-full py-8 text-center text-sm text-muted-foreground">No beds available yet.</div>
        ) : (
          beds.map((bed) => (
            <Card key={bed.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Bed #{bed.id.slice(0, 6)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Type:</span> {bed.type}</p>
                <p><span className="text-muted-foreground">Price/day:</span> {bed.pricePerDay}</p>
                <p><span className="text-muted-foreground">Status:</span> {bed.status}</p>
                {(user?.role === "STAFF" || user?.role === "HOSPITAL" || user?.role === "ADMIN") && (
                  <Button variant="outline" size="sm" onClick={() => toggleStatus(bed.id, bed.status)}>
                    Mark {bed.status === "AVAILABLE" ? "occupied" : "available"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
