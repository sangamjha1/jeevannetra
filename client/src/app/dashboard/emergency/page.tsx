"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, MapPin, AlertTriangle, Activity } from "lucide-react";

interface NearestService {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: number;
  latitude: number;
  longitude: number;
  bloodTypes?: string[];
  departments?: string[];
  officersAvailable?: number;
}

export default function EmergencyPage() {
  const { user } = useAuth();
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [hospitals, setHospitals] = useState<NearestService[]>([]);
  const [bloodBanks, setBloodBanks] = useState<NearestService[]>([]);
  const [policeStations, setPoliceStations] = useState<NearestService[]>([]);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [reportingAccident, setReportingAccident] = useState(false);
  const [accidentSeverity, setAccidentSeverity] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [manualLat, setManualLat] = useState<string>("");
  const [manualLon, setManualLon] = useState<string>("");
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    // Get user location
    const getLocation = async () => {
      try {
        if (!navigator.geolocation) {
          setServicesError("Geolocation not supported by this browser");
          setLocationLoading(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              setUserLocation({ lat: latitude, lon: longitude });

              // Fetch nearest services
              try {
                const [hospitalsRes, bloodBanksRes, policeRes] = await Promise.all([
                  api.get(`/resources/hospitals/nearest?latitude=${latitude}&longitude=${longitude}&radius=10`),
                  api.get(`/resources/blood-banks/nearest?latitude=${latitude}&longitude=${longitude}&radius=5`),
                  api.get(`/resources/police-stations/nearest?latitude=${latitude}&longitude=${longitude}&radius=5`),
                ]);
                setHospitals(hospitalsRes.data);
                setBloodBanks(bloodBanksRes.data);
                setPoliceStations(policeRes.data);
                setServicesError(null);
              } catch (err) {
                console.error("Error fetching services:", err);
                setServicesError("Failed to load nearby services. Please try again.");
              } finally {
                setLocationLoading(false);
              }
            } catch (err) {
              console.error("Error processing location:", err);
              setServicesError("Error processing your location");
              setLocationLoading(false);
            }
          },
          (error) => {
            let errorMsg = "Unable to access location";
            
            if (error.code === 1) {
              errorMsg = "Location permission denied. You can still search by entering coordinates manually.";
            } else if (error.code === 2) {
              errorMsg = "Location unavailable. Please check GPS/location settings on your device.";
            } else if (error.code === 3) {
              errorMsg = "Location request timed out. Try again or enter coordinates manually.";
            }
            
            // Log for debugging
            console.warn("Geolocation error code:", error.code, "message:", error.message);
            
            setServicesError(errorMsg);
            setLocationLoading(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } catch (err) {
        console.error("Location setup error:", err);
        setServicesError("Failed to initialize location services");
        setLocationLoading(false);
      }
    };

    getLocation();

    const fetchEmergencies = async () => {
      try {
        const res = await api.get("/emergency");
        setEmergencies(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role !== "PATIENT") {
      fetchEmergencies();
      timer = setInterval(fetchEmergencies, 15000);
    } else {
      setLoading(false);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [user]);

  const handleTrigger = async () => {
    setSending(true);
    try {
      await api.post("/emergency/trigger", {
        latitude: userLocation?.lat || 23.2156,
        longitude: userLocation?.lon || 72.6369,
        message: "Patient requested emergency support",
      });
      alert("Emergency alert sent!");
    } catch (err) {
      console.error(err);
      alert("Failed to send emergency alert");
    } finally {
      setSending(false);
    }
  };

  const handleReportAccident = async () => {
    if (!userLocation) {
      alert("Location not available");
      return;
    }
    setReportingAccident(true);
    try {
      await api.post("/emergency/accident/report", {
        latitude: userLocation.lat,
        longitude: userLocation.lon,
        severity: accidentSeverity,
        description: "User reported an accident",
      });
      alert(`Accident report submitted with severity: ${accidentSeverity}`);
    } catch (err) {
      console.error(err);
      alert("Failed to report accident");
    } finally {
      setReportingAccident(false);
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleNavigate = (lat: number, lon: number) => {
    window.open(`https://maps.google.com/?q=${lat},${lon}`, "_blank");
  };

  const handleManualCoordinates = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);

    if (isNaN(lat) || isNaN(lon)) {
      alert("Please enter valid latitude and longitude");
      return;
    }

    setUserLocation({ lat, lon });

    try {
      const [hospitalsRes, bloodBanksRes, policeRes] = await Promise.all([
        api.get(`/resources/hospitals/nearest?latitude=${lat}&longitude=${lon}&radius=10`),
        api.get(`/resources/blood-banks/nearest?latitude=${lat}&longitude=${lon}&radius=5`),
        api.get(`/resources/police-stations/nearest?latitude=${lat}&longitude=${lon}&radius=5`),
      ]);
      setHospitals(hospitalsRes.data);
      setBloodBanks(bloodBanksRes.data);
      setPoliceStations(policeRes.data);
      setServicesError(null);
      setShowManualInput(false);
    } catch (err) {
      console.error("Error fetching services:", err);
      setServicesError("Failed to load nearby services");
    }
  };

  const handleRespond = async (id: string) => {
    try {
      await api.patch(`/emergency/${id}/respond`);
      setEmergencies((prev) => prev.map((item) => (item.id === id ? { ...item, status: "DISPATCHED" } : item)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Emergency Services</h2>
          <p className="text-sm text-muted-foreground">Access emergency services and monitor urgent requests.</p>
        </div>
        {user?.role === "PATIENT" && (
          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleTrigger} disabled={sending}>
              {sending ? "Sending..." : "🆘 SOS Alert"}
            </Button>
            <Button variant="outline" onClick={() => {
              const acc = prompt("Report accident - Enter severity (LOW/MEDIUM/HIGH/CRITICAL):", "MEDIUM");
              if (acc) {
                setAccidentSeverity(acc as any);
                handleReportAccident();
              }
            }} disabled={reportingAccident}>
              {reportingAccident ? "Reporting..." : "🚨 Report Accident"}
            </Button>
          </div>
        )}
      </div>

      {/* Nearest Services - Patient View */}
      {user?.role === "PATIENT" && (
        <div className="grid gap-4">
          {/* Manual Coordinates Input (if location fails) */}
          {showManualInput && (
            <Card className="border-blue-500/50 bg-blue-500/10">
              <CardHeader>
                <CardTitle className="text-base">Enter Your Location Manually</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualCoordinates} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        placeholder="e.g., 23.1815"
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm bg-background"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        placeholder="e.g., 72.6311"
                        value={manualLon}
                        onChange={(e) => setManualLon(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm bg-background"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      Find Nearby Services
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowManualInput(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can get your coordinates from Google Maps - right-click any location and select coordinates
                  </p>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Geolocation Loading/Error State */}
          {locationLoading && (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                📍 Requesting your location...
              </CardContent>
            </Card>
          )}

          {servicesError && !showManualInput && (
            <Card className="border-amber-500/50 bg-amber-500/10">
              <CardContent className="pt-6">
                <p className="text-sm text-amber-700 mb-3">⚠️ {servicesError}</p>
                <Button
                  size="sm"
                  onClick={() => setShowManualInput(true)}
                  className="gap-2"
                >
                  📍 Enter Location Manually
                </Button>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Nearest Hospitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {locationLoading ? (
                <p className="text-sm text-muted-foreground">Loading location...</p>
              ) : hospitals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hospitals found nearby</p>
              ) : (
                <div className="space-y-3">
                  {hospitals.map((hospital) => (
                    <div key={hospital.id} className="border rounded p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{hospital.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {hospital.distance.toFixed(1)} km away
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleCall(hospital.phone)}>
                          <Phone className="h-4 w-4 mr-1" /> Call
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">{hospital.address}</p>
                      <Button size="sm" variant="ghost" onClick={() => handleNavigate(hospital.latitude, hospital.longitude)}>
                        Navigate →
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nearest Blood Banks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🩸 Nearest Blood Banks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bloodBanks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No blood banks found nearby</p>
              ) : (
                <div className="space-y-3">
                  {bloodBanks.map((bank) => (
                    <div key={bank.id} className="border rounded p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{bank.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {bank.distance.toFixed(1)} km away
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleCall(bank.phone)}>
                          <Phone className="h-4 w-4 mr-1" /> Call
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">{bank.address}</p>
                      {bank.bloodTypes && (
                        <p className="text-xs">Available: {bank.bloodTypes.join(", ")}</p>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleNavigate(bank.latitude, bank.longitude)}>
                        Navigate →
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nearest Police Stations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🚔 Nearest Police Stations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {policeStations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No police stations found nearby</p>
              ) : (
                <div className="space-y-3">
                  {policeStations.map((station) => (
                    <div key={station.id} className="border rounded p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{station.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {station.distance.toFixed(1)} km away
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleCall(station.phone)}>
                          <Phone className="h-4 w-4 mr-1" /> Call
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">{station.address}</p>
                      {station.officersAvailable && (
                        <p className="text-xs">Officers available: {station.officersAvailable}</p>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleNavigate(station.latitude, station.longitude)}>
                        Navigate →
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Emergency Requests - Staff/Hospital View */}
      {user?.role !== "PATIENT" && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Active Emergency Requests</h3>
            <span className="text-sm text-muted-foreground">{emergencies.length} active</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading emergency feed...</div>
          ) : emergencies.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">No active emergency requests.</CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {emergencies.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Request #{item.id.slice(0, 8)}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">User:</span> {item.user?.firstName} {item.user?.lastName}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {item.user?.phone || "N/A"}</p>
                    <p><span className="text-muted-foreground">Coordinates:</span> {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}</p>
                    <p><span className="text-muted-foreground">Status:</span> {item.status}</p>
                    {item.status === "PENDING" && (
                      <Button size="sm" onClick={() => handleRespond(item.id)}>Mark dispatched</Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
