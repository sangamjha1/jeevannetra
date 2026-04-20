"use client";

import React, { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";

interface MedicineResult {
  name: string;
  brandNames: string;
  genericName: string;
  commonNames: string;
  chemicalName: string;
  manufacturer: string;
  purpose: string;
  description: string;
  dosage: string;
  activeIngredient?: string;
  indication?: string;
  route?: string;
  warnings?: string;
  sideEffects?: string;
  storageConditions?: string;
  formAndStrength?: string;
}

export default function MedicineSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MedicineResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleSearch = async (e: React.FormEvent, searchQuery?: string) => {
    e.preventDefault();
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    setLoading(true);
    setError("");
    setExpandedIndex(null);
    setQuery(finalQuery);

    try {
      const res = await api.get(`/medicine/search?q=${encodeURIComponent(finalQuery)}`);
      
      // Handle new response format with suggestions
      if (res.data.results !== undefined) {
        setResults(res.data.results);
        setSuggestions(res.data.suggestions || []);
      } else {
        // Fallback for old format
        setResults(Array.isArray(res.data) ? res.data : []);
        setSuggestions([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch results");
      setResults([]);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Medicine Search</h2>
        <p className="text-muted-foreground">Find detailed medicine information from FDA records.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Medicines</CardTitle>
          <CardDescription>Search by brand name, generic name, chemical name, or common name to find detailed medicine information. Includes automatic translation of international medicine names (e.g., Paracetamol → Acetaminophen)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="e.g., Aspirin, Ibuprofen, Amoxicillin, Acetaminophen, Paracetamol..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="px-6">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">🔍 Searches across brand names, generic names, chemical names, descriptions, and international alternative names</p>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600">❌ {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Did You Mean Suggestions */}
      {!loading && results.length === 0 && query && suggestions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <p className="text-sm text-blue-900 font-semibold">💡 Did you mean:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSearch(new Event("submit") as any, suggestion);
                    }}
                    className="cursor-pointer hover:bg-blue-100 border-blue-300"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-blue-700">Click on a suggestion to search, or try another search term</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results / No Suggestions */}
      {!loading && results.length === 0 && query && suggestions.length === 0 && !error && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <p className="text-sm text-orange-900 font-semibold">⚠️ No results found for "{query}"</p>
              <div className="space-y-2 text-sm text-orange-800">
                <p>Try:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>💊 <strong>Brand name:</strong> e.g., "Tylenol" instead of "Paracetamol"</li>
                  <li>🏭 <strong>Generic name:</strong> e.g., "Acetaminophen" or "Ibuprofen"</li>
                  <li>📝 <strong>Different spelling:</strong> e.g., "Amoxicillin" instead of "Amoxycillin"</li>
                  <li>🔤 <strong>Partial name:</strong> e.g., just "Aspir" for "Aspirin"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Found {results.length} result(s)</p>
          {results.map((med, index) => (
            <Card
              key={index}
              className="cursor-pointer transition hover:shadow-md"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{med.name || "Unknown"}</CardTitle>
                    <div className="space-y-1 mt-2">
                      {med.brandNames && med.brandNames !== "N/A" && (
                        <CardDescription className="text-xs">Brand: {med.brandNames}</CardDescription>
                      )}
                      {med.genericName && med.genericName !== "N/A" && (
                        <CardDescription className="text-xs">Generic: {med.genericName}</CardDescription>
                      )}
                      {med.commonNames && med.commonNames !== "N/A" && (
                        <CardDescription className="text-xs">Common Names: {med.commonNames}</CardDescription>
                      )}
                    </div>
                  </div>
                  <span className="text-lg text-muted-foreground">
                    {expandedIndex === index ? "▼" : "▶"}
                  </span>
                </div>
              </CardHeader>

              {/* Collapsed View - Summary */}
              {expandedIndex !== index && (
                <CardContent className="text-xs text-muted-foreground space-y-1">
                  {med.manufacturer && med.manufacturer !== "N/A" && <p>📦 {med.manufacturer}</p>}
                  {med.description && med.description !== "N/A" && (
                    <p className="line-clamp-2">{med.description.substring(0, 100)}...</p>
                  )}
                  {!med.description && med.purpose && med.purpose !== "N/A" && (
                    <p className="line-clamp-2">💊 {med.purpose.substring(0, 100)}...</p>
                  )}
                </CardContent>
              )}

              {/* Expanded View - Full Details */}
              {expandedIndex === index && (
                <CardContent className="space-y-4 border-t pt-4">
                  {/* Comprehensive Description */}
                  {med.description && med.description !== "N/A" && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">📝 Full Description</p>
                      <div className="bg-muted p-3 rounded text-sm overflow-auto max-h-40 text-xs leading-relaxed">
                        {med.description}
                      </div>
                    </div>
                  )}

                  {/* Chemical Name */}
                  {med.chemicalName && med.chemicalName !== "N/A" && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">🧬 Chemical Name</p>
                      <p className="text-sm bg-muted p-2 rounded">{med.chemicalName}</p>
                    </div>
                  )}

                  {/* Manufacturer */}
                  {med.manufacturer && med.manufacturer !== "N/A" && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">📦 Manufacturer</p>
                      <p className="text-sm">{med.manufacturer}</p>
                    </div>
                  )}

                  {/* Active Ingredient */}
                  {med.activeIngredient && med.activeIngredient !== "N/A" && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">🧪 Active Ingredient</p>
                      <Badge variant="secondary">{med.activeIngredient}</Badge>
                    </div>
                  )}

                  {/* Form and Strength */}
                  {med.formAndStrength && med.formAndStrength !== "N/A" && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">💉 Form & Strength</p>
                      <p className="text-sm">{med.formAndStrength}</p>
                    </div>
                  )}

                  {/* Purpose */}
                  {med.purpose && med.purpose !== "N/A" && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">💊 Purpose</p>
                      <p className="text-sm">{med.purpose}</p>
                    </div>
                  )}

                  {/* Route of Administration */}
                  {med.route && med.route !== "N/A" && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">🛣️ Route of Administration</p>
                      <p className="text-sm">{med.route}</p>
                    </div>
                  )}

                  {/* Indication */}
                  {med.indication && med.indication !== "N/A" && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">🎯 Indication / Uses</p>
                      <div className="bg-muted p-3 rounded text-sm overflow-auto max-h-40 text-xs">
                        {med.indication}
                      </div>
                    </div>
                  )}

                  {/* Dosage & Administration */}
                  {med.dosage && med.dosage !== "N/A" && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">📋 Dosage & Administration</p>
                      <div className="bg-muted p-3 rounded text-sm overflow-auto max-h-48 text-xs">
                        {med.dosage}
                      </div>
                    </div>
                  )}

                  {/* Storage Conditions */}
                  {med.storageConditions && med.storageConditions !== "N/A" && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">🌡️ Storage & Handling</p>
                      <div className="bg-muted p-3 rounded text-sm text-xs">
                        {med.storageConditions}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {med.warnings && med.warnings !== "N/A" && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">⚠️ Warnings & Contraindications</p>
                      <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-900 border border-yellow-200 overflow-auto max-h-40 text-xs">
                        {med.warnings}
                      </div>
                    </div>
                  )}

                  {/* Side Effects */}
                  {med.sideEffects && med.sideEffects !== "N/A" && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">⚡ Adverse Reactions / Side Effects</p>
                      <div className="bg-orange-50 p-3 rounded text-sm text-orange-900 border border-orange-200 overflow-auto max-h-40 text-xs">
                        {med.sideEffects}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 p-3 rounded text-xs text-blue-900 border border-blue-200">
                    <p className="font-semibold mb-1">ℹ️ Medical Disclaimer</p>
                    <p>This information is for educational purposes only. Always consult with a healthcare provider before taking any medication.</p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && !query && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Enter a medicine name to search. You can search for medicines by brand name, generic name, or purpose. Try "Aspirin", "Paracetamol", or "Amoxicillin" to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
