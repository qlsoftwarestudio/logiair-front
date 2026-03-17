import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "@/components/templates/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RecoverPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.recoverPassword(email);
      setSent(true);
      toast({ title: "Email enviado", description: "Revisá tu casilla de correo" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Revisá tu email" subtitle="Te enviamos un enlace para restablecer tu contraseña">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
            <Mail className="h-8 w-8 text-success" />
          </div>
          <p className="text-muted-foreground text-sm">
            Si el email está registrado, recibirás un enlace para crear una nueva contraseña.
          </p>
          <Link to="/login" className="text-primary hover:underline text-sm">
            ← Volver al login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Recuperar contraseña" subtitle="Ingresá tu email para recibir un enlace de recuperación">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="bg-secondary border-border"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !email}
          className="w-full gradient-primary text-primary-foreground gap-2"
        >
          <Mail className="h-4 w-4" />
          Enviar enlace
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
