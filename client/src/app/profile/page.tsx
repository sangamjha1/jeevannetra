'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useTheme } from 'next-themes';
import { 
  User, 
  Moon, 
  Sun, 
  LogOut, 
  ChevronRight,
  Heart,
  Lock,
  Mail,
  Phone,
  Check,
  AlertCircle,
  Edit2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmergencyContactsManager } from '@/components/profile/EmergencyContactsManager';
import { cn } from '@/lib/utils';

interface PatientData {
  id?: string;
  userId?: string;
  bloodGroup?: string;
  weight?: number;
  height?: number;
  emergencyContact?: string;
  emergencyContacts?: Array<{ name: string; phone: string }>;
  appointments?: any[];
  prescriptions?: any[];
  medicalHistory?: any[];
  bills?: any[];
  user?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
    emergencyContacts?: Array<{ name: string; phone: string }>;
  };
}

const ProfilePage = () => {
  const { user, logout, isLoading } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [editData, setEditData] = useState<PatientData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordData, setPasswordData] = useState({ old: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user?.role === 'PATIENT') {
      loadPatientData();
    }
  }, [user]);

  const loadPatientData = async () => {
    try {
      const response = await api.get('/patients/profile');
      setPatientData(response.data);
      setEditData(response.data);
    } catch (err) {
      console.error('Failed to load patient data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.patch('/patients/profile', editData);
      setPatientData(editData);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      setError('Passwords do not match');
      setTimeout(() => setError(''), 3000);
      return;
    }
    try {
      await api.post('/auth/change-password', {
        oldPassword: passwordData.old,
        newPassword: passwordData.new,
      });
      setMessage('Password changed successfully!');
      setPasswordData({ old: '', new: '', confirm: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
      setTimeout(() => setError(''), 3000);
    }
  };

  const calculateBMI = () => {
    if (!editData?.weight || !editData?.height) return null;
    const heightInMeters = editData.height / 100;
    return (editData.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
    if (bmi < 25) return { label: 'Normal', color: 'text-emerald-400' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-400' };
    return { label: 'Obese', color: 'text-red-400' };
  };

  if (isLoading || !mounted) return null;

  const bmi = calculateBMI();
  const bmiStatus = bmi ? getBMIStatus(parseFloat(bmi)) : null;

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'medical', label: 'Medical Details', icon: Heart },
    { id: 'emergency', label: 'Emergency Contacts', icon: AlertTriangle },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Sun },
  ];

  const InputField = ({ label, value, onChange, type = 'text' }: any) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      {isEditing ? (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-border/40 bg-muted/50 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
        />
      ) : (
        <div className="px-4 py-2 rounded-lg border border-border/40 bg-muted/30 text-foreground">
          {value || '-'}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-border/40 bg-gradient-to-r from-primary/10 via-accent/5 to-background">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white">
              {user?.firstName?.[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">{user?.firstName} {user?.lastName}</h1>
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">{user?.role}</span>
                <span className="px-3 py-1 rounded-full bg-muted/50 text-muted-foreground text-xs">{user?.email}</span>
              </div>
            </div>
            <Button variant="ghost" onClick={logout} className="text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="border-border/40">
              <CardContent className="p-4 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsEditing(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all',
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </div>
                      {activeTab === tab.id && <ChevronRight className="h-4 w-4" />}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <Card className="border-border/40">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{tabs.find(t => t.id === activeTab)?.label}</CardTitle>
                  {(activeTab === 'personal' || activeTab === 'medical') && (
                    <button
                      onClick={() => {
                        if (isEditing) {
                          setEditData(patientData);
                        }
                        setIsEditing(!isEditing);
                      }}
                      className={cn(
                        'px-3 py-1 rounded-lg text-sm flex items-center gap-2 transition-all',
                        isEditing
                          ? 'bg-destructive/20 text-destructive hover:bg-destructive/30'
                          : 'bg-primary/20 text-primary hover:bg-primary/30'
                      )}
                    >
                      {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Messages */}
                {message && (
                  <div className="p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    {message}
                  </div>
                )}
                {error && (
                  <div className="p-4 rounded-lg bg-destructive/20 border border-destructive/30 text-destructive flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                  </div>
                )}

                {/* Personal Info */}
                {activeTab === 'personal' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="First Name" value={editData?.user?.firstName || user?.firstName} onChange={() => {}} />
                      <InputField label="Last Name" value={editData?.user?.lastName || user?.lastName} onChange={() => {}} />
                      <InputField label="Email Address" value={user?.email} onChange={() => {}} />
                      <InputField label="Phone" value={editData?.user?.phone} onChange={(val: string) => setEditData({ ...editData, user: { ...editData?.user, phone: val } })} />
                      <InputField label="Address" value={editData?.user?.address} onChange={(val: string) => setEditData({ ...editData, user: { ...editData?.user, address: val } })} type="text" />
                      <InputField label="Gender" value={editData?.user?.gender} onChange={(val: string) => setEditData({ ...editData, user: { ...editData?.user, gender: val } })} />
                    </div>
                    {isEditing && (
                      <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    )}
                  </div>
                )}

                {/* Medical Details */}
                {activeTab === 'medical' && (
                  <div className="space-y-6">
                    {loading ? (
                      <div className="text-center text-muted-foreground">Loading medical data...</div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputField label="Blood Group" value={editData?.bloodGroup} onChange={(val: string) => setEditData({ ...editData, bloodGroup: val })} />
                          <InputField label="Height (cm)" value={editData?.height} onChange={(val: string) => setEditData({ ...editData, height: parseFloat(val) })} type="number" />
                          <InputField label="Weight (kg)" value={editData?.weight} onChange={(val: string) => setEditData({ ...editData, weight: parseFloat(val) })} type="number" />
                          {bmi && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">BMI</label>
                              <div className="px-4 py-2 rounded-lg border border-border/40 bg-muted/30">
                                <span className={cn('font-semibold', bmiStatus?.color)}>{bmi} - {bmiStatus?.label}</span>
                              </div>
                            </div>
                          )}
                          <InputField label="Emergency Contact" value={editData?.emergencyContact} onChange={(val: string) => setEditData({ ...editData, emergencyContact: val })} />
                          <InputField label="Date of Birth" value={editData?.user?.dateOfBirth} onChange={(val: string) => setEditData({ ...editData, user: { ...editData?.user, dateOfBirth: val } })} type="date" />
                        </div>
                        {isEditing && (
                          <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                            {saving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Emergency Contacts */}
                {activeTab === 'emergency' && (
                  <EmergencyContactsManager 
                    contacts={patientData?.user?.emergencyContacts || []}
                    onUpdate={(updatedContacts) => {
                      setPatientData({
                        ...patientData,
                        user: {
                          ...patientData?.user,
                          emergencyContacts: updatedContacts,
                        }
                      });
                      return Promise.resolve();
                    }}
                  />
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /> Change Password</h3>
                    
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Current Password</label>
                        <input 
                          type="password"
                          value={passwordData.old}
                          onChange={(e) => setPasswordData({ ...passwordData, old: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-border/40 bg-muted/30 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">New Password</label>
                        <input 
                          type="password"
                          value={passwordData.new}
                          onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-border/40 bg-muted/30 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Confirm Password</label>
                        <input 
                          type="password"
                          value={passwordData.confirm}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-border/40 bg-muted/30 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">Change Password</Button>
                    </form>
                  </div>
                )}

                {/* Appearance Settings */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Theme Preference</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {['light', 'dark', 'system'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={cn(
                            'p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2',
                            theme === t
                              ? 'border-primary bg-primary/10'
                              : 'border-border/40 hover:border-border/60'
                          )}
                        >
                          {t === 'light' && <Sun className="h-6 w-6 text-amber-400" />}
                          {t === 'dark' && <Moon className="h-6 w-6 text-blue-400" />}
                          {t === 'system' && <Sun className="h-6 w-6 text-muted-foreground" />}
                          <span className="text-sm font-medium capitalize">{t}</span>
                        </button>
                      ))}
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/40">
                      <p className="text-sm text-muted-foreground">Current Theme: <span className="font-semibold text-foreground capitalize">{resolvedTheme || 'system'}</span></p>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>

        </div>
    </div>
  );
};

export default ProfilePage;