"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    officeLocation: "",
    phoneNumber: "",
    contactPerson: "",
    emailAddress: "",
    workingHours: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const apiBaseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/settings`);
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        } else {
          toast.error("Failed to fetch settings.");
        }
      } catch (error) {
        toast.error("An error occurred while fetching settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [apiBaseUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('mg_admin_token') : null;
    try {
      const response = await fetch(`${apiBaseUrl}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("Settings updated successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update settings.");
      }
    } catch (error) {
      toast.error("An error occurred while saving settings.");
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSave = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    setSavingPassword(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('mg_admin_token') : null;
    try {
      const response = await fetch(`${apiBaseUrl}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
      });

      if (response.ok) {
        toast.success("Password changed successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to change password.");
      }
    } catch (error) {
      toast.error("An error occurred while changing password.");
      console.error("Password change error:", error);
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Website Settings</h1>
          <p className="text-muted-foreground">Manage the contact information displayed on the public website.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Update the contact details that users see on the website footer and contact page.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                placeholder="e.g. Mary Kala"
                value={settings.contactPerson || ""}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="e.g. +254 705 794 254"
                value={settings.phoneNumber || ""}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="emailAddress">Email Address</Label>
              <Input
                id="emailAddress"
                name="emailAddress"
                type="email"
                placeholder="e.g. makagraceholdings@gmail.com"
                value={settings.emailAddress || ""}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="officeLocation">Office Location</Label>
              <Textarea
                id="officeLocation"
                name="officeLocation"
                placeholder="e.g. Nairobi, Kenya (office coming soon)"
                value={settings.officeLocation || ""}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="workingHours">Working Hours</Label>
              <Textarea
                id="workingHours"
                name="workingHours"
                placeholder="e.g. Monday – Sunday\n8:00 AM – 9:00 PM EAT"
                value={settings.workingHours || ""}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your account password for security.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Enter new password (min 8 characters)"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end pt-4 border-t">
            <Button onClick={handlePasswordSave} disabled={savingPassword} className="min-w-[120px]">
              {savingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
