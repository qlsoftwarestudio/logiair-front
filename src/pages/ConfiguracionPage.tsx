import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Bell, Plus, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ROLE_LABELS, type UserRole } from "@/constants/roles";
import { AppBreadcrumb } from "@/components/molecules/AppBreadcrumb";
import { authService } from "@/services/authService";

interface ManagedUser {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: UserRole;
}

export default function ConfiguracionPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"users" | "notifications">("users");
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", lastname: "", email: "", password: "", role: "" as UserRole });
  const [creating, setCreating] = useState(false);
  const [notifications, setNotifications] = useState({ statusChange: true, invoiceDue: true, newAWB: false, dailySummary: true });

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.lastname || !newUser.email || !newUser.password) return;
    setCreating(true);
    try {
      await authService.register({
        name: newUser.name,
        lastname: newUser.lastname,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      });
      setUsers([...users, { name: newUser.name, lastname: newUser.lastname, email: newUser.email, role: newUser.role, id: `u${Date.now()}` }]);
      setShowAdd(false);
      setNewUser({ name: "", lastname: "", email: "", password: "", role: "CUSTOMER" });
      toast({ title: "Usuario creado", description: `${newUser.name} ${newUser.lastname} registrado exitosamente` });
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "No se pudo crear el usuario", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const tabs = [
    { id: "users" as const, label: "Usuarios", icon: Users },
    { id: "notifications" as const, label: "Notificaciones", icon: Bell },
  ];

  return (
    <div className="space-y-6 max-w-[900px]">
      <AppBreadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Configuración" }]} />
      <h1 className="text-2xl font-bold text-foreground">Configuración</h1>

      <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "users" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>El listado de usuarios del tenant aún no está disponible desde el backend. Podés crear nuevos usuarios con el botón de abajo.</span>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setShowAdd(true)} className="gradient-primary text-primary-foreground gap-2">
              <Plus className="h-4 w-4" /> Nuevo usuario
            </Button>
          </div>

          {users.length > 0 && (
            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nombre</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                            {u.name[0]}{u.lastname[0]}
                          </div>
                          <span className="font-medium text-foreground">{u.name} {u.lastname}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                      <td className="p-4 text-sm text-muted-foreground">{ROLE_LABELS[u.role]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === "notifications" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 space-y-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Preferencias de notificaciones</h3>
          {[
            { key: "statusChange" as const, label: "Cambio de estado AWB", desc: "Recibir notificaciones cuando cambie el estado de una guía" },
            { key: "invoiceDue" as const, label: "Vencimiento de facturas", desc: "Alerta cuando una factura está próxima a vencer" },
            { key: "newAWB" as const, label: "Nuevas guías aéreas", desc: "Notificar cuando se registra una nueva guía" },
            { key: "dailySummary" as const, label: "Resumen diario", desc: "Recibir un resumen por email cada mañana" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch checked={notifications[item.key]} onCheckedChange={(v) => setNotifications({ ...notifications, [item.key]: v })} />
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Preferencias guardadas" })}>
              <Save className="h-4 w-4 mr-1" /> Guardar preferencias
            </Button>
          </div>
        </motion.div>
      )}

      {/* Add user dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo usuario</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="Juan" className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label>Apellido *</Label>
                <Input value={newUser.lastname} onChange={(e) => setNewUser({ ...newUser, lastname: e.target.value })} placeholder="Pérez" className="bg-secondary border-border" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Contraseña * (mín. 6 caracteres)</Label>
              <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v as UserRole })}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_LABELS) as UserRole[]).filter(r => r !== "CLIENT").map((role) => (
                    <SelectItem key={role} value={role}>{ROLE_LABELS[role]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancelar</Button>
            <Button onClick={handleAddUser} disabled={creating || !newUser.name || !newUser.lastname || !newUser.email || newUser.password.length < 6} className="gradient-primary text-primary-foreground">
              {creating ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
