import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/awb/StatusBadge";
import { OpTypeBadge } from "@/components/awb/OpTypeBadge";
import { useAWBStore } from "@/stores/awbStore";
import { useInvoiceStore } from "@/stores/invoiceStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ArrowRight, Bot, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { awbs, fetchAWBs } = useAWBStore();
  const { invoices, fetchInvoices } = useInvoiceStore();

  useEffect(() => { fetchAWBs(); fetchInvoices(); }, []);

  const activeOps = awbs.filter((a) => a.status !== "DELIVERED" && a.status !== "CANCELLED").length;
  const completedOps = awbs.filter((a) => a.status === "DELIVERED").length;
  const pendingInvoice = invoices.filter((i) => i.status !== "PAID" && i.status !== "CANCELLED").length;
  const monthlyRevenue = invoices.reduce((acc, i) => acc + i.totalAmount, 0);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Operaciones Activas" value={activeOps} badge="↗ +12%" badgeVariant="success" delay={0} />
        <StatCard title="Completadas" value={completedOps} delay={0.05} />
        <StatCard title="Pendientes de Facturar" value={pendingInvoice} badge="▲ Crítico" badgeVariant="danger" delay={0.1} />
        <StatCard title="Facturación Mes (USD)" value={`$${monthlyRevenue.toLocaleString()}`} badge="↗ +15%" badgeVariant="success" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card"
        >
          <div className="flex items-center justify-between p-5 pb-0">
            <h2 className="text-lg font-bold text-foreground">Guías Aéreas Prioritarias</h2>
            <button onClick={() => navigate("/awbs")} className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todas <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-x-auto p-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                  <th className="text-left pb-3 font-medium">Nro AWB</th>
                  <th className="text-left pb-3 font-medium">Cliente</th>
                  <th className="text-left pb-3 font-medium">Operación</th>
                  <th className="text-left pb-3 font-medium">Estado</th>
                  <th className="text-left pb-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {awbs.slice(0, 5).map((awb, i) => (
                  <motion.tr
                    key={awb.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 + i * 0.05 }}
                    onClick={() => navigate(`/awbs/${awb.id}`)}
                    className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3 font-mono font-semibold text-foreground">{awb.awbNumber}</td>
                    <td className="py-3 text-muted-foreground">{awb.customer?.companyName || "-"}</td>
                    <td className="py-3"><OpTypeBadge type={awb.operationType} /></td>
                    <td className="py-3"><StatusBadge status={awb.status} /></td>
                    <td className="py-3 text-muted-foreground text-xs">
                      {awb.arrivalOrDepartureDate
                        ? new Date(awb.arrivalOrDepartureDate).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })
                        : "—"}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <Bot className="h-4 w-4 text-primary" /> Alertas de IA
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-success uppercase tracking-wider">Lectura Automática</span>
                  <CheckCircle className="h-3.5 w-3.5 text-success" />
                </div>
                <p className="text-xs text-foreground/80">
                  Se detectó una nueva pre-alerta de <strong>Emirates SkyCargo</strong>. ¿Deseas procesar los datos?
                </p>
                <Button size="sm" className="mt-2 w-full gradient-primary text-primary-foreground text-xs h-8">
                  Procesar Ahora
                </Button>
              </div>

              <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-destructive uppercase tracking-wider">Error Detectado</span>
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                </div>
                <p className="text-xs text-foreground/80">
                  Inconsistencia de pesos en el manifiesto <strong>#MA-9283</strong> vs Guía Master.
                </p>
                <div className="flex gap-2 mt-2">
                  <button className="text-xs text-primary hover:underline font-medium">Revisar</button>
                  <button className="text-xs text-muted-foreground hover:underline">Descartar</button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Optimización</span>
                  <Zap className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-xs text-foreground/80">
                  3 guías pendientes pueden ser consolidadas en el vuelo <strong>LH501</strong> de mañana.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
