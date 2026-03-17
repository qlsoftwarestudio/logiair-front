import { motion } from "framer-motion";
import { Bot, Mail, FileText, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Mail,
    title: "Lectura de Pre-Alertas por Email",
    description: "Extracción automática de datos de pre-alertas recibidas por email de aerolíneas.",
    status: "Próximamente",
  },
  {
    icon: FileText,
    title: "Extracción de PDFs",
    description: "Procesamiento automático de documentos PDF para extraer datos de guías y manifiestos.",
    status: "Próximamente",
  },
  {
    icon: Brain,
    title: "Reportes Automáticos",
    description: "Generación automática de reportes operativos y de facturación con IA.",
    status: "Próximamente",
  },
  {
    icon: Zap,
    title: "Sugerencias de Facturación",
    description: "Recomendaciones inteligentes para optimizar la facturación mensual.",
    status: "Próximamente",
  },
];

const IAHubPage = () => {
  return (
    <div className="space-y-6 max-w-[900px]">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <Bot className="h-7 w-7 text-primary" /> IA Hub
        </h1>
        <p className="text-muted-foreground mt-1">
          Funcionalidades de inteligencia artificial para optimizar tus operaciones logísticas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-6 flex flex-col"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-warning font-semibold px-2 py-1 rounded-md bg-warning/10">
                {feature.status}
              </span>
              <Button variant="outline" size="sm" disabled className="text-xs border-border">
                Activar
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default IAHubPage;
