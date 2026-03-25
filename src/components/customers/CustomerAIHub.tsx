import { motion } from "framer-motion";
import { Bot, Mail, FileText, Zap, Brain } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Customer } from "@/lib/types";

interface AIFeature {
  key: keyof Pick<Customer, "aiPreAlerts" | "aiPdfExtraction" | "aiAutoReports" | "aiBillingSuggestions">;
  icon: typeof Mail;
  title: string;
  description: string;
}

const AI_FEATURES: AIFeature[] = [
  {
    key: "aiPreAlerts",
    icon: Mail,
    title: "Lectura de Pre-Alertas por Email",
    description: "Extracción automática de datos de pre-alertas recibidas por email de aerolíneas.",
  },
  {
    key: "aiPdfExtraction",
    icon: FileText,
    title: "Extracción de PDFs",
    description: "Procesamiento automático de documentos PDF para extraer datos de guías y manifiestos.",
  },
  {
    key: "aiAutoReports",
    icon: Brain,
    title: "Reportes Automáticos",
    description: "Generación automática de reportes operativos y de facturación con IA.",
  },
  {
    key: "aiBillingSuggestions",
    icon: Zap,
    title: "Sugerencias de Facturación",
    description: "Recomendaciones inteligentes para optimizar la facturación mensual.",
  },
];

interface CustomerAIHubProps {
  customer: Customer;
  onUpdate?: (customerId: number, data: Partial<Customer>) => Promise<void>;
  editable?: boolean;
}

export function CustomerAIHub({ customer, onUpdate, editable = true }: CustomerAIHubProps) {
  const { toast } = useToast();
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggle = async (key: AIFeature["key"], checked: boolean) => {
    if (!onUpdate) return;
    setToggling(key);
    try {
      await onUpdate(customer.id, { [key]: checked });
      toast({
        title: checked ? "Feature activada" : "Feature desactivada",
        description: `${AI_FEATURES.find((f) => f.key === key)?.title} fue ${checked ? "activada" : "desactivada"} para ${customer.companyName}.`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

  const activeCount = AI_FEATURES.filter((f) => customer[f.key]).length;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">IA Hub</h3>
          <p className="text-xs text-muted-foreground">
            {activeCount} de {AI_FEATURES.length} funcionalidades activas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {AI_FEATURES.map((feature, i) => {
          const isActive = !!customer[feature.key];
          return (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-lg border p-4 transition-colors ${
                isActive ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
                    isActive ? "bg-primary/15" : "bg-muted"
                  }`}>
                    <feature.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                  </div>
                </div>
                {editable && (
                  <Switch
                    checked={isActive}
                    disabled={toggling === feature.key}
                    onCheckedChange={(checked) => handleToggle(feature.key, checked)}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
