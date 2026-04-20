"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface Hospital {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  website?: string;
  totalBeds?: number;
  availableBeds?: number;
}

interface BloodBank {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  availability?: string;
}

interface PoliceStation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"hospitals" | "blood-banks" | "police-stations">("hospitals");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [policeStations, setPoliceStations] = useState<PoliceStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [hospitalsRes, bloodBanksRes, policeRes] = await Promise.all([
          api.get("/resources/hospitals"),
          api.get("/resources/blood-banks"),
          api.get("/resources/police-stations"),
        ]);
        setHospitals(hospitalsRes.data);
        setBloodBanks(bloodBanksRes.data);
        setPoliceStations(policeRes.data);
      } catch (err) {
        console.error("Error fetching resources:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const handleDelete = async (id: string, type: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      const endpoint = activeTab === "hospitals" 
        ? `resources/hospitals/${id}`
        : activeTab === "blood-banks"
        ? `resources/blood-banks/${id}`
        : `resources/police-stations/${id}`;
      
      await api.delete(`/${endpoint}`);
      
      if (activeTab === "hospitals") {
        setHospitals(hospitals.filter(h => h.id !== id));
      } else if (activeTab === "blood-banks") {
        setBloodBanks(bloodBanks.filter(b => b.id !== id));
      } else {
        setPoliceStations(policeStations.filter(p => p.id !== id));
      }
      alert("Resource deleted successfully!");
    } catch (err) {
      console.error("Error deleting resource:", err);
      alert("Failed to delete resource");
    }
  };

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let endpoint = "";
      let data = formData;

      if (activeTab === "hospitals") {
        endpoint = editingId ? `/resources/hospitals/${editingId}` : `/resources/hospitals`;
        data = {
          name: formData.name,
          address: formData.address,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          phone: formData.phone,
          website: formData.website || undefined,
          totalBeds: parseInt(formData.totalBeds) || 0,
          availableBeds: parseInt(formData.availableBeds) || 0,
        };
      } else if (activeTab === "blood-banks") {
        endpoint = editingId ? `/resources/blood-banks/${editingId}` : `/resources/blood-banks`;
        data = {
          name: formData.name,
          address: formData.address,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          phone: formData.phone,
          availability: formData.availability || "24/7",
          bloodTypes: formData.bloodTypes?.split(",").map((b: string) => b.trim()) || [],
        };
      } else {
        endpoint = editingId ? `/resources/police-stations/${editingId}` : `/resources/police-stations`;
        data = {
          name: formData.name,
          address: formData.address,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          phone: formData.phone,
          email: formData.email || undefined,
        };
      }

      if (editingId) {
        await api.patch(endpoint, data);
      } else {
        await api.post(endpoint, data);
      }

      // Refresh data
      const fetchResources = async () => {
        try {
          const [hospitalsRes, bloodBanksRes, policeRes] = await Promise.all([
            api.get("/resources/hospitals"),
            api.get("/resources/blood-banks"),
            api.get("/resources/police-stations"),
          ]);
          setHospitals(hospitalsRes.data);
          setBloodBanks(bloodBanksRes.data);
          setPoliceStations(policeRes.data);
        } catch (err) {
          console.error("Error fetching resources:", err);
        }
      };
      await fetchResources();

      setShowForm(false);
      setEditingId(null);
      setFormData({});
      alert(editingId ? "Resource updated successfully!" : "Resource added successfully!");
    } catch (err) {
      console.error("Error saving resource:", err);
      alert("Failed to save resource");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData(item);
    setShowForm(true);
  };

  const handleNewResource = () => {
    setEditingId(null);
    setFormData({
      latitude: 23.2156,
      longitude: 72.6369,
      ...(activeTab === "blood-banks" ? { availability: "24/7", bloodTypes: [] } : {}),
    });
    setShowForm(true);
  };

  if (!user || user.role !== "ADMIN") {
    return <div className="text-center py-8">Access denied. Admin only.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Admin Panel</h2>
        <p className="text-sm text-muted-foreground">Manage hospitals, blood banks, and police stations.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {["hospitals", "blood-banks", "police-stations"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "hospitals" ? "🏥 Hospitals" : tab === "blood-banks" ? "🩸 Blood Banks" : "🚔 Police"}
          </button>
        ))}
      </div>

      {/* Add Resource Button */}
      {!showForm && (
        <Button onClick={handleNewResource} className="gap-2">
          <Plus className="h-4 w-4" />
          Add {activeTab === "hospitals" ? "Hospital" : activeTab === "blood-banks" ? "Blood Bank" : "Police Station"}
        </Button>
      )}

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? "Edit" : "Add"} {activeTab === "hospitals" ? "Hospital" : activeTab === "blood-banks" ? "Blood Bank" : "Police Station"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddOrEdit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude *</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.latitude || ""}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitude *</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.longitude || ""}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Hospital specific fields */}
              {activeTab === "hospitals" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Website</label>
                    <input
                      type="url"
                      value={formData.website || ""}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Total Beds</label>
                      <input
                        type="number"
                        value={formData.totalBeds || ""}
                        onChange={(e) => setFormData({ ...formData, totalBeds: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Available Beds</label>
                      <input
                        type="number"
                        value={formData.availableBeds || ""}
                        onChange={(e) => setFormData({ ...formData, availableBeds: e.target.value })}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Blood Bank specific fields */}
              {activeTab === "blood-banks" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Availability</label>
                    <input
                      type="text"
                      placeholder="e.g., 24/7 or 9 AM - 6 PM"
                      value={formData.availability || ""}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Blood Types (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g., O+, O-, A+, A-, B+, B-, AB+, AB-"
                      value={Array.isArray(formData.bloodTypes) ? formData.bloodTypes.join(", ") : ""}
                      onChange={(e) => setFormData({ ...formData, bloodTypes: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                </>
              )}

              {/* Police Station specific fields */}
              {activeTab === "police-stations" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : editingId ? "Update" : "Add"} Resource
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({});
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Resources List */}
      {!showForm && (
        <div className="grid gap-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading resources...</p>
          ) : activeTab === "hospitals" ? (
            hospitals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hospitals found</p>
            ) : (
              hospitals.map((hospital) => (
                <Card key={hospital.id}>
                  <CardContent className="pt-6 flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium">{hospital.name}</p>
                      <p className="text-xs text-muted-foreground">{hospital.address}</p>
                      <p className="text-xs">{hospital.phone}</p>
                      <p className="text-xs">Beds: {hospital.availableBeds}/{hospital.totalBeds}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(hospital)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(hospital.id, "hospital")}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )
          ) : activeTab === "blood-banks" ? (
            bloodBanks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No blood banks found</p>
            ) : (
              bloodBanks.map((bank) => (
                <Card key={bank.id}>
                  <CardContent className="pt-6 flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium">{bank.name}</p>
                      <p className="text-xs text-muted-foreground">{bank.address}</p>
                      <p className="text-xs">{bank.phone}</p>
                      <p className="text-xs">{bank.availability}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(bank)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(bank.id, "blood-bank")}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )
          ) : (
            policeStations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No police stations found</p>
            ) : (
              policeStations.map((station) => (
                <Card key={station.id}>
                  <CardContent className="pt-6 flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium">{station.name}</p>
                      <p className="text-xs text-muted-foreground">{station.address}</p>
                      <p className="text-xs">{station.phone}</p>
                      {station.email && <p className="text-xs">{station.email}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(station)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(station.id, "police-station")}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
}
