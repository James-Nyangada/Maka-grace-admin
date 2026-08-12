"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function AdminSettingsPage() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const apiBaseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

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

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-4xl mx-auto w-full">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account security and preferences.</p>
        </div>

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
