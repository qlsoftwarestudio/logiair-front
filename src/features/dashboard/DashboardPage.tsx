import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAWBStore } from "@/stores/awbStore";
import { useCustomerStore } from "@/stores/customerStore";
import { useInvoiceStore } from "@/stores/invoiceStore";
import { useAuthStore } from "@/stores/authStore";
import { motion } from "framer-motion";
import { Plane, Users, Receipt, ArrowRight, AlertCircle, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { STATUS_COLORS, STATUS_LABELS } from "@/constants/awbStatuses";
import { ROLE_LABELS } from "@/constants/roles";
import { formatCurrency } from "@/utils/formatters";

export default function DashboardPage() {
  const { awbs, fetchAWBs } = useAWBStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { invoices, fetchInvoices } = useInvoiceStore();
  const { user, hasPermission } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAWBs();
    fetchCustomers();
    if (hasPermission("invoices.view")) fetchInvoices();
  }, []);

  const inProgress = awbs.filter((a) => a.status !== "DELIVERED" && a.status !== "CANCELLED");
  const completed = awbs.filter((a) => a.status === "DELIVERED");
  const totalBilling = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.totalAmount, 0);
  const pendingBilling = invoices.filter((i) => i.status !== "PAID" && i.status !== "CANCELLED").reduce((s, i) => s + i.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Hola, {user?.name?.split(" ")[0] || "Usuario"} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            {ROLE_LABELS[user?.role]} · Panel de control
          </p>
        </div>
        <div className="flex gap-2">
          {hasPermission("awbs.create") && (
            <Button onClick={() => navigate("/awbs/new")} className="gradient-primary text-primary-foreground gap-2">
              <Plus className="h-4 w-4" /> Nueva Guía
            </Button>
          )}
          {hasPermission("customers.create") && (
            <Button onClick={() => navigate("/customers/new")} variant="outline" className="gap-2">
              <Users className="h-4 w-4" /> Nuevo Cliente
            </Button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Guías activas" value={inProgress.length} badge={`${awbs.length} total`} badgeVariant="info" delay={0} />
        <StatCard title="Completadas" value={completed.length} badge={`${Math.round((completed.length / (awbs.length || 1)) * 100)}%`} badgeVariant="success" delay={0.05} />
        <StatCard title="Clientes" value={customers.length} delay={0.1} />
        {hasPermission("invoices.view") && (
          <StatCard title="Facturación" value={formatCurrency(totalBilling)} badge={`${formatCurrency(pendingBilling)} pend.`} badgeVariant="warning" delay={0.15} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent AWBs */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Últimas operaciones</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate("/awbs")} className="text-primary gap-1">
              Ver todas <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2">
            {awbs.slice(0, 6).map((awb) => {
              const sc = STATUS_COLORS[awb.status] || { bg: "bg-muted", text: "text-muted-foreground" };
              return (
                <motion.div
                  key={awb.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => navigate(`/awbs/${awb.id}`)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${awb.operationType === "IMPORT" ? "bg-primary/10" : "bg-chart-4/10"}`}>
                      <Plane className={`h-4 w-4 ${awb.operationType === "IMPORT" ? "text-primary" : "text-chart-4"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-mono font-semibold text-foreground">{awb.awbNumber}</p>
                      <p className="text-xs text-muted-foreground">{awb.customer?.companyName || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-mono">{awb.origin}→{awb.destination}</span>
                    <span className={`status-badge ${sc.bg} ${sc.text}`}>{STATUS_LABELS[awb.status as keyof typeof STATUS_LABELS] || awb.status}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Alerts / Quick actions */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Alertas</h3>
            <div className="space-y-3">
              {inProgress.slice(0, 3).map((awb) => (
                <div key={awb.id} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{awb.awbNumber}</p>
                    <p className="text-xs text-muted-foreground">Pendiente: {STATUS_LABELS[awb.status as keyof typeof STATUS_LABELS] || awb.status}</p>
                  </div>
                </div>
              ))}
              {inProgress.length === 0 && (
                <p className="text-xs text-muted-foreground">Sin alertas pendientes</p>
              )}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Accesos rápidos</h3>
            <div className="space-y-2">
              {hasPermission("awbs.create") && (
                <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => navigate("/awbs/new")}>
                  <Plane className="h-4 w-4" /> Nueva guía aérea
                </Button>
              )}
              {hasPermission("customers.create") && (
                <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => navigate("/customers/new")}>
                  <Users className="h-4 w-4" /> Nuevo cliente
                </Button>
              )}
              {hasPermission("invoices.create") && (
                <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => navigate("/invoices/new")}>
                  <Receipt className="h-4 w-4" /> Nueva factura
                </Button>
              )}
              {hasPermission("reports.view") && (
                <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => navigate("/reports")}>
                  <TrendingUp className="h-4 w-4" /> Ver reportes
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
