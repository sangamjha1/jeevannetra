'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, AlertCircle, Phone, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageAlert } from '@/components/ui/message-alert';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface EmergencyContact {
  name: string;
  phone: string;
}

interface EmergencyContactsManagerProps {
  contacts: EmergencyContact[];
  onUpdate: (contacts: EmergencyContact[]) => Promise<void>;
}

export const EmergencyContactsManager: React.FC<EmergencyContactsManagerProps> = ({ contacts, onUpdate }) => {
  const [contactsList, setContactsList] = useState<EmergencyContact[]>(contacts || []);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newContact, setNewContact] = useState<EmergencyContact>({ name: '', phone: '' });
  const [isSaving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleAddContact = () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      setError('Name and phone number are required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const updatedList = [...contactsList, newContact];
    setContactsList(updatedList);
    setNewContact({ name: '', phone: '' });
    setIsAdding(false);
    saveContacts(updatedList);
  };

  const handleEditContact = (index: number, updatedContact: EmergencyContact) => {
    if (!updatedContact.name.trim() || !updatedContact.phone.trim()) {
      setError('Name and phone number are required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const updatedList = [...contactsList];
    updatedList[index] = updatedContact;
    setContactsList(updatedList);
    setEditingIndex(null);
    saveContacts(updatedList);
  };

  const handleDeleteContact = (index: number) => {
    const updatedList = contactsList.filter((_, i) => i !== index);
    setContactsList(updatedList);
    saveContacts(updatedList);
  };

  const saveContacts = async (newContacts: EmergencyContact[]) => {
    setSaving(true);
    try {
      // Update user profile with emergency contacts
      await api.patch('/users/profile', {
        emergencyContacts: newContacts,
      });
      await onUpdate(newContacts);
      setMessage('Emergency contacts updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save emergency contacts');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert */}
      <div className="flex gap-3 p-4 rounded-lg bg-primary/10 border border-primary/30">
        <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Emergency Contacts</p>
          <p className="text-xs text-muted-foreground mt-1">
            These contacts will be notified immediately if an accident is detected. Add your parents, family members, or trusted contacts.
          </p>
        </div>
      </div>

      {/* Messages */}
      {message && <MessageAlert message={message} type="success" />}
      {error && <MessageAlert message={error} type="error" />}

      {/* Contacts List */}
      <div className="space-y-3">
        {contactsList.length > 0 ? (
          contactsList.map((contact, index) => (
            <Card key={index} className="border-border/40">
              <CardContent className="p-4">
                {editingIndex === index ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => {
                          const updated = [...contactsList];
                          updated[index].name = e.target.value;
                          setContactsList(updated);
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-border/40 bg-muted/50 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="Contact name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => {
                          const updated = [...contactsList];
                          updated[index].phone = e.target.value;
                          setContactsList(updated);
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-border/40 bg-muted/50 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditContact(index, contactsList[index])}
                        disabled={isSaving}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingIndex(null)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{contact.name}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {contact.phone}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingIndex(index)}
                        className="p-2 rounded-lg hover:bg-muted/50 transition-all text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(index)}
                        disabled={isSaving}
                        className="p-2 rounded-lg hover:bg-red-500/10 transition-all text-muted-foreground hover:text-red-500 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 px-4 rounded-lg border border-dashed border-border/40 bg-muted/30">
            <User className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No emergency contacts added yet</p>
          </div>
        )}
      </div>

      {/* Add Contact Section */}
      {isAdding ? (
        <Card className="border-border/40">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <input
                type="text"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border/40 bg-muted/50 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Contact name (e.g., Mom, Dad, Brother)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
              <input
                type="tel"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border/40 bg-muted/50 text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Phone number (with country code if international)"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddContact}
                disabled={isSaving}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAdding(false);
                  setNewContact({ name: '', phone: '' });
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Emergency Contact
        </Button>
      )}
    </div>
  );
};
