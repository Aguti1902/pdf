"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { toast } from "sonner";

const mockUser = { name: "Alex Johnson", email: "alex@example.com", subscriptionStatus: "trialing" };

export default function ProfilePage() {
  return (
    <DashboardShell user={mockUser}>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your personal information.</p>
        </div>

        {/* Avatar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">AJ</AvatarFallback>
                </Avatar>
                <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium">{mockUser.name}</p>
                <p className="text-xs text-muted-foreground">{mockUser.email}</p>
                <Button variant="outline" size="sm" className="mt-2 h-7 text-xs">
                  Change photo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="Alex" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="Johnson" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={mockUser.email} />
            </div>
            <Button size="sm" onClick={() => toast.success("Profile updated!")}>
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" />
            </div>
            <Button size="sm" variant="outline" onClick={() => toast.success("Password changed!")}>
              Update Password
            </Button>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/50 text-destructive hover:bg-destructive/5 hover:text-destructive"
              onClick={() => toast.error("Please contact support to delete your account.")}
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
