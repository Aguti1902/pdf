"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface UserData {
  id: string; email: string; name: string | null; avatarUrl?: string | null;
}

export default function ProfilePage() {
  const [user,     setUser]     = useState<UserData | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [curPwd,   setCurPwd]   = useState("");
  const [newPwd,   setNewPwd]   = useState("");
  const [confPwd,  setConfPwd]  = useState("");
  const { t, messages } = useLanguage();
  const d = messages ? t("dashboard") : null;

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) {
          setUser(data.user);
          setName(data.user.name ?? "");
          setEmail(data.user.email ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        toast.success(d?.saveChanges ?? "Profile updated!");
      } else {
        toast.error("Could not update profile.");
      }
    } catch {
      toast.error("Connection error.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!curPwd || !newPwd) { toast.error("Please fill all password fields."); return; }
    if (newPwd !== confPwd) { toast.error("Passwords do not match."); return; }
    if (newPwd.length < 8)  { toast.error("Password must be at least 8 characters."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: curPwd, newPassword: newPwd }),
      });
      if (res.ok) {
        toast.success("Password changed successfully!");
        setCurPwd(""); setNewPwd(""); setConfPwd("");
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Could not change password.");
      }
    } catch {
      toast.error("Connection error.");
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.name ?? user?.email ?? "?")
    .split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);

  if (loading) return (
    <DashboardShell>
      <div className="flex items-center justify-center h-64 text-neutral-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        {d?.loading ?? "Loading..."}
      </div>
    </DashboardShell>
  );

  return (
    <DashboardShell user={user ?? undefined}>
      <div className="min-h-full">
        <div className="flex items-center justify-between border-b px-8 py-5">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{d?.profileTitle ?? "Mi cuenta"}</h1>
            <p className="text-sm text-neutral-500 mt-0.5">{d?.profileSubtitle ?? "Gestiona tu información personal."}</p>
          </div>
        </div>
      <div className="px-8 py-6">
        <div className="grid grid-cols-3 gap-6">

          {/* Col 1: Avatar + info */}
          <div className="col-span-2 space-y-5">
            {/* Avatar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{d?.profilePhoto ?? "Foto de perfil"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-opacity">
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div>
                    <p className="text-base font-semibold">{user?.name ?? user?.email}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <Button variant="outline" size="sm" className="mt-2 h-8 text-xs">
                      {d?.changePhoto ?? "Cambiar foto"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{d?.personalInfo ?? "Información personal"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">{d?.firstName ?? "Nombre completo"}</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">{d?.emailAddress ?? "Correo electrónico"}</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
                <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                  {d?.saveChanges ?? "Guardar cambios"}
                </Button>
              </CardContent>
            </Card>

            {/* Password */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{d?.changePassword ?? "Cambiar contraseña"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword">{d?.currentPassword ?? "Contraseña actual"}</Label>
                  <Input id="currentPassword" type="password" value={curPwd} onChange={e => setCurPwd(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword">{d?.newPassword ?? "Nueva contraseña"}</Label>
                    <Input id="newPassword" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">{d?.confirmPassword ?? "Confirmar contraseña"}</Label>
                    <Input id="confirmPassword" type="password" value={confPwd} onChange={e => setConfPwd(e.target.value)} />
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={handleChangePassword} disabled={saving}>
                  {d?.updatePassword ?? "Actualizar contraseña"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Col 2: Danger zone */}
          <div className="space-y-5">
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-base text-destructive">{d?.dangerZone ?? "Zona de peligro"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {d?.deleteAccountDesc ?? "Elimina permanentemente tu cuenta y todos los datos asociados. Esta acción no se puede deshacer."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/50 text-destructive hover:bg-destructive/5 hover:text-destructive"
                  onClick={() => toast.error("Contacta con soporte para eliminar tu cuenta.")}
                >
                  {d?.deleteAccount ?? "Eliminar cuenta"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </DashboardShell>
  );
}
