'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { 
  User, 
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
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageAlert } from '@/components/ui/message-alert';
import { FormError } from '@/components/ui/form-error';
import { FieldError } from '@/components/ui/field-error';
import { PasswordValidator } from '@/components/ui/password-validator';
import { EmergencyContactsManager } from '@/components/profile/EmergencyContactsManager';
import { LegalModal } from '@/components/legal/LegalModal';
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY, LEGAL_TENDER } from '@/lib/legal-content';
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
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [editData, setEditData] = useState<PatientData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordData, setPasswordData] = useState({ old: '', new: '', confirm: '' });
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({
    old: '',
    new: '',
    confirm: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [legalModals, setLegalModals] = useState({
    termsOpen: false,
    privacyOpen: false,
    legalOpen: false,
  });
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time new password validation
  useEffect(() => {
    if (!passwordData.new) {
      setPasswordFieldErrors((prev) => ({ ...prev, new: '' }));
      return;
    }

    const errors: string[] = [];
    if (passwordData.new.length < 8) {
      errors.push("At least 8 characters");
    }
    if (!/[A-Z]/.test(passwordData.new)) {
      errors.push("One uppercase letter");
    }
    if (!/[0-9]/.test(passwordData.new)) {
      errors.push("One number");
    }

    setPasswordFieldErrors((prev) => ({
      ...prev,
      new: errors.length > 0 ? `Missing: ${errors.join(", ")}` : "",
    }));
  }, [passwordData.new]);

  // Real-time confirm password validation
  useEffect(() => {
    if (!passwordData.confirm) {
      setPasswordFieldErrors((prev) => ({ ...prev, confirm: '' }));
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      setPasswordFieldErrors((prev) => ({
        ...prev,
        confirm: "Passwords do not match",
      }));
    } else {
      setPasswordFieldErrors((prev) => ({
        ...prev,
        confirm: "",
      }));
    }
  }, [passwordData.new, passwordData.confirm]);

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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toUpperCase() !== 'DELETE') {
      setError('Please type "DELETE" exactly to confirm');
      return;
    }

    setIsDeleting(true);
    try {
      await api.post('/auth/delete-account');
      setMessage('Account deleted successfully. Redirecting...');
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account. Please contact support.');
      setIsDeleting(false);
    }
  };

  if (isLoading || !mounted) return null;

  const bmi = calculateBMI();
  const bmiStatus = bmi ? getBMIStatus(parseFloat(bmi)) : null;

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'medical', label: 'Medical Details', icon: Heart },
    { id: 'emergency', label: 'Emergency Contacts', icon: AlertTriangle },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'legal', label: 'Legal & Policies', icon: FileText },
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
                {message && <MessageAlert message={message} type="success" />}
                {error && <MessageAlert message={error} type="error" />}

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
                      {error && (
                        <FormError
                          error={error}
                          onDismiss={() => setError("")}
                          autoScroll
                        />
                      )}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Current Password</label>
                        <input 
                          type="password"
                          value={passwordData.old}
                          onChange={(e) => setPasswordData({ ...passwordData, old: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border border-border/40 bg-muted/30 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all ${
                            passwordFieldErrors.old ? "border-red-500" : ""
                          }`}
                          required
                        />
                        {passwordFieldErrors.old && (
                          <FieldError error={passwordFieldErrors.old} />
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">New Password</label>
                        <input 
                          type="password"
                          value={passwordData.new}
                          onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border border-border/40 bg-muted/30 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all ${
                            passwordFieldErrors.new ? "border-red-500" : ""
                          }`}
                          required
                        />
                        <PasswordValidator
                          password={passwordData.new}
                          confirmPassword={passwordData.confirm}
                          showValidation={true}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Confirm Password</label>
                        <input 
                          type="password"
                          value={passwordData.confirm}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                          className={`w-full px-4 py-2 rounded-lg border border-border/40 bg-muted/30 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all ${
                            passwordFieldErrors.confirm ? "border-red-500" : ""
                          }`}
                          required
                        />
                        {passwordFieldErrors.confirm && (
                          <FieldError error={passwordFieldErrors.confirm} />
                        )}
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={
                          Object.values(passwordFieldErrors).some((e) => e) ||
                          !passwordData.old ||
                          !passwordData.new ||
                          !passwordData.confirm
                        }
                      >
                        Change Password
                      </Button>
                    </form>

                    {/* Danger Zone - Delete Account */}
                    <div className="pt-6 border-t border-border/40">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-red-400 mb-4">
                        <AlertTriangle className="h-5 w-5" /> Danger Zone
                      </h3>
                      <div className="p-4 rounded-lg border border-red-900/50 bg-red-950/40">
                        <h4 className="font-semibold text-red-400 mb-2">Delete Account</h4>
                        <p className="text-sm text-red-300 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                        <Button 
                          onClick={() => setDeleteAccountModal(true)}
                          variant="destructive"
                          className="w-full"
                        >
                          Delete Account Permanently
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Legal & Policies */}
                {activeTab === 'legal' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Legal Documents & Policies</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Terms and Conditions */}
                      <button
                        onClick={() => setLegalModals({ ...legalModals, termsOpen: true })}
                        className="p-6 rounded-lg border border-border/40 bg-card hover:bg-muted/50 hover:border-primary/50 transition-all text-left"
                      >
                        <FileText className="h-6 w-6 text-blue-500 mb-3" />
                        <h4 className="font-semibold text-foreground mb-2">Terms and Conditions</h4>
                        <p className="text-sm text-muted-foreground">Read our terms of service and usage guidelines</p>
                        <span className="inline-block mt-3 text-xs text-primary font-medium">Click to view →</span>
                      </button>

                      {/* Privacy Policy */}
                      <button
                        onClick={() => setLegalModals({ ...legalModals, privacyOpen: true })}
                        className="p-6 rounded-lg border border-border/40 bg-card hover:bg-muted/50 hover:border-primary/50 transition-all text-left"
                      >
                        <FileText className="h-6 w-6 text-green-500 mb-3" />
                        <h4 className="font-semibold text-foreground mb-2">Privacy Policy</h4>
                        <p className="text-sm text-muted-foreground">Learn how we collect and protect your data</p>
                        <span className="inline-block mt-3 text-xs text-primary font-medium">Click to view →</span>
                      </button>

                      {/* Legal Tender & Liability */}
                      <button
                        onClick={() => setLegalModals({ ...legalModals, legalOpen: true })}
                        className="p-6 rounded-lg border border-border/40 bg-card hover:bg-muted/50 hover:border-primary/50 transition-all text-left"
                      >
                        <FileText className="h-6 w-6 text-amber-500 mb-3" />
                        <h4 className="font-semibold text-foreground mb-2">Legal Tender & Liability</h4>
                        <p className="text-sm text-muted-foreground">Understand our disclaimers and liability limits</p>
                        <span className="inline-block mt-3 text-xs text-primary font-medium">Click to view →</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        <p className="font-medium mb-1">Important Information</p>
                        <p>These documents were last updated on April 21, 2026. We recommend reviewing them periodically for any updates or changes.</p>
                      </div>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>

        </div>

        {/* Legal Modals */}
        <LegalModal
          isOpen={legalModals.termsOpen}
          onClose={() => setLegalModals({ ...legalModals, termsOpen: false })}
          title="Terms and Conditions"
          content={TERMS_AND_CONDITIONS}
        />
        <LegalModal
          isOpen={legalModals.privacyOpen}
          onClose={() => setLegalModals({ ...legalModals, privacyOpen: false })}
          title="Privacy Policy"
          content={PRIVACY_POLICY}
        />
        <LegalModal
          isOpen={legalModals.legalOpen}
          onClose={() => setLegalModals({ ...legalModals, legalOpen: false })}
          title="Legal Tender & Liability"
          content={LEGAL_TENDER}
        />

        {/* Delete Account Confirmation Modal */}
        {deleteAccountModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-red-900/50 bg-slate-900/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-5 w-5" /> Delete Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50">
                  <p className="text-sm text-red-300">
                    <strong>Warning:</strong> This action is permanent and cannot be undone. All your data, appointments, medical records, and prescriptions will be permanently deleted.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Type <strong className="text-red-400">DELETE</strong> below to confirm account deletion:
                </p>
                <input
                  type="text"
                  placeholder='Type "DELETE" to confirm'
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-red-900/50 bg-red-950/20 text-foreground focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  disabled={isDeleting}
                />
                {deleteConfirmText.length > 0 && deleteConfirmText.toUpperCase() !== 'DELETE' && (
                  <p className="text-xs text-amber-400">Please type DELETE exactly to confirm</p>
                )}
              </CardContent>
              <CardContent className="border-t border-red-900/50 pt-4 flex gap-3">
                <Button 
                  onClick={() => {
                    setDeleteAccountModal(false);
                    setDeleteConfirmText('');
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeleteAccount}
                  variant="destructive"
                  className="flex-1"
                  disabled={isDeleting || deleteConfirmText.toUpperCase() !== 'DELETE'}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
};

export default ProfilePage;