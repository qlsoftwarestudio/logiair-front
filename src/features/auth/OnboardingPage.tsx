import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { Building2, User, Check, ArrowRight, ArrowLeft } from "lucide-react";

const steps = ["Empresa", "Administrador", "Confirmar"];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [company, setCompany] = useState({ name: "", cuit: "", address: "", phone: "" });
  const [admin, setAdmin] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const formatCuit = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 11);
    if (clean.length <= 2) return clean;
    if (clean.length <= 10) return `${clean.slice(0, 2)}-${clean.slice(2)}`;
    return `${clean.slice(0, 2)}-${clean.slice(2, 10)}-${clean.slice(10)}`;
  };

  const canNext = () => {
    if (step === 0) return company.name && company.cuit.replace(/\D/g, "").length === 11;
    if (step === 1) return admin.name && admin.email && admin.password.length >= 6 && admin.password === admin.confirmPassword;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await authService.onboarding({
        businessName: company.name,
        taxId: company.cuit,
        adminName: admin.name,
        adminEmail: admin.email,
        adminPassword: admin.password,
      });
      toast({ title: "¡Empresa registrada!", description: `${company.name} creada exitosamente. Iniciá sesión para continuar.` });
      navigate("/login");
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "No se pudo crear la empresa", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">LogiAir<span className="text-gradient"> OS</span></h1>
          <p className="text-muted-foreground mt-2">Configurá tu empresa en minutos</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < step ? "gradient-success text-primary-foreground" : i === step ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i < step ? "bg-success" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="glass-card p-6 space-y-5">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Datos de la empresa</h2>
              </div>
              <div className="space-y-2">
                <Label>Nombre de empresa *</Label>
                <Input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} placeholder="Mi Empresa SRL" className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label>CUIT *</Label>
                <Input value={company.cuit} onChange={(e) => setCompany({ ...company, cuit: formatCuit(e.target.value) })} placeholder="30-XXXXXXXX-X" className="bg-secondary border-border font-mono" />
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Usuario administrador</h2>
              </div>
              <div className="space-y-2">
                <Label>Nombre completo *</Label>
                <Input value={admin.name} onChange={(e) => setAdmin({ ...admin, name: e.target.value })} placeholder="Juan Pérez" className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={admin.email} onChange={(e) => setAdmin({ ...admin, email: e.target.value })} placeholder="admin@empresa.com" className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label>Contraseña * (mín. 6 caracteres)</Label>
                <Input type="password" value={admin.password} onChange={(e) => setAdmin({ ...admin, password: e.target.value })} placeholder="••••••" className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label>Confirmar contraseña *</Label>
                <Input type="password" value={admin.confirmPassword} onChange={(e) => setAdmin({ ...admin, confirmPassword: e.target.value })} placeholder="••••••" className="bg-secondary border-border" />
                {admin.confirmPassword && admin.password !== admin.confirmPassword && (
                  <p className="text-xs text-destructive">Las contraseñas no coinciden</p>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Check className="h-5 w-5 text-success" />
                <h2 className="text-lg font-semibold text-foreground">Confirmar datos</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Empresa</p>
                  <p className="font-semibold text-foreground">{company.name}</p>
                  <p className="text-muted-foreground font-mono">{company.cuit}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Administrador</p>
                  <p className="font-semibold text-foreground">{admin.name}</p>
                  <p className="text-muted-foreground">{admin.email}</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Atrás
              </Button>
            )}
            <div className="flex-1" />
            {step < 2 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="gradient-primary text-primary-foreground gap-2">
                Siguiente <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="gradient-primary text-primary-foreground gap-2">
                {loading ? "Creando..." : "Crear empresa"}
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Ya tenés cuenta? <button onClick={() => navigate("/login")} className="text-primary hover:underline">Iniciar sesión</button>
        </p>
      </motion.div>
    </div>
  );
}
