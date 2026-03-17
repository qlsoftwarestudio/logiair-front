import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { motion } from "framer-motion";
import { User, Shield, Mail, Lock, Save, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ROLE_LABELS, ROLE_PERMISSIONS } from "@/constants/roles";
import type { UserRole } from "@/constants/roles";
import { AppBreadcrumb } from "@/components/molecules/AppBreadcrumb";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  if (!user) return null;

  const permissions = ROLE_PERMISSIONS[user.role as UserRole] || [];
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  const handleSaveProfile = async () => {
    toast({ title: "Función no disponible", description: "El endpoint de actualización de perfil aún no está implementado en el backend", variant: "destructive" });
    setEditing(false);
  };

  const handleChangePassword = async () => {
    toast({ title: "Función no disponible", description: "El endpoint de cambio de contraseña aún no está implementado en el backend", variant: "destructive" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <AppBreadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Mi perfil" }]} />
      <h1 className="text-2xl font-bold text-foreground">Mi perfil</h1>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
                {initials}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <Camera className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{ROLE_LABELS[user.role as UserRole]}</p>
            </div>
          </div>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Editar</Button>
          )}
        </div>

        {editing ? (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setEditing(false); setForm({ name: user.name, email: user.email }); }}>Cancelar</Button>
              <Button size="sm" onClick={handleSaveProfile} disabled={savingProfile} className="gradient-primary text-primary-foreground gap-1">
                <Save className="h-3.5 w-3.5" /> Guardar
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{ROLE_LABELS[user.role as UserRole]}</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Change password */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cambiar contraseña</h3>
        </div>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Contraseña actual</Label>
            <Input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} className="bg-secondary border-border" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Nueva contraseña</Label>
              <Input type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Confirmar nueva</Label>
              <Input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="bg-secondary border-border" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={handleChangePassword} disabled={savingPassword || !passwordForm.current || !passwordForm.newPass}>
              Cambiar contraseña
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Permissions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Permisos del rol</h3>
        <div className="flex flex-wrap gap-2">
          {permissions.map((p) => (
            <span key={p} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-mono">{p}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
