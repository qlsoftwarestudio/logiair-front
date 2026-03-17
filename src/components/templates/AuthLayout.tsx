import { ReactNode } from "react";
import { Plane } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Plane className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-primary-foreground">LogiAir OS</h1>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">
            Gestión de carga aérea simplificada
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            Digitaliza el seguimiento de guías aéreas, manifiestos y facturación desde una sola plataforma.
          </p>
        </div>
        <p className="text-primary-foreground/50 text-sm">
          © {new Date().getFullYear()} LogiAir OS — SaaS Logístico
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Plane className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">LogiAir OS</h1>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
