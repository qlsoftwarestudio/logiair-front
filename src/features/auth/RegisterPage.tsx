import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "@/components/templates/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/stores/authStore";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/constants/roles";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", lastname: "", email: "", password: "", role: "OPERATOR_LOGISTICS" as UserRole });
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(form);
      toast({ title: "Usuario creado", description: "El usuario fue registrado exitosamente" });
      navigate("/login");
    } catch {
      // error in store
    }
  };

  return (
    <AuthLayout title="Registrar usuario" subtitle="Solo administradores pueden crear usuarios">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value }); clearError(); }}
              placeholder="Juan"
              className="bg-secondary border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Apellido</Label>
            <Input
              value={form.lastname}
              onChange={(e) => { setForm({ ...form, lastname: e.target.value }); clearError(); }}
              placeholder="Pérez"
              className="bg-secondary border-border"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => { setForm({ ...form, email: e.target.value }); clearError(); }}
            className="bg-secondary border-border"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Contraseña</Label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) => { setForm({ ...form, password: e.target.value }); clearError(); }}
            className="bg-secondary border-border"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Rol</Label>
          <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPERATOR_LOGISTICS">Operador Logístico</SelectItem>
              <SelectItem value="ADMINISTRATION">Administración</SelectItem>
              <SelectItem value="CLIENT">Cliente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={loading || !form.name || !form.email || !form.password}
          className="w-full gradient-primary text-primary-foreground gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Registrar usuario
        </Button>

        <div className="text-center">
          <Link to="/login" className="text-sm text-primary hover:underline">
            ← Volver al login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
