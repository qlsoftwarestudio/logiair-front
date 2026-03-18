import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { motion } from "framer-motion";
import { Plane, Users, Receipt, ArrowRight, AlertCircle, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { STATUS_COLORS, STATUS_LABELS } from "@/constants/awbStatuses";
import { ROLE_LABELS } from "@/constants/roles";

import { reportService, type DashboardResponse } from "@/services/reportService";

export default function DashboardPage() {
  const { user, hasPermission } = useAuthStore();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await reportService.getDashboard();
        setDashboard(data);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !dashboard) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando dashboard...</div>;
  }

  const byStatus = dashboard.airWaybillsByStatus || {};
  const completedCount = (byStatus["INVOICED"] || 0) + (byStatus["PROCESS_COMPLETED"] || 0);
  const pendingCount = (dashboard.totalAirWaybills ?? 0) - completedCount;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Hola, {user?.name?.split(" ")[0] || "Usuario"} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            {ROLE_LABELS[user?.role || "OPERATOR_LOGISTICS"]} · Panel de control
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
        <StatCard title="Guías activas" value={pendingCount} badge={`${dashboard.totalAirWaybills ?? 0} total`} badgeVariant="info" delay={0} />
        <StatCard title="Completadas" value={completedCount} badge={`${dashboard.totalAirWaybills ? Math.round((completedCount / dashboard.totalAirWaybills) * 100) : 0}%`} badgeVariant="success" delay={0.05} />
        <StatCard title="Clientes" value={dashboard.totalCustomers ?? 0} delay={0.1} />
        {hasPermission("invoices.view") && (
          <StatCard title="Facturas" value={dashboard.totalInvoices} delay={0.15} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AWBs by status */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Guías por estado</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate("/awbs")} className="text-primary gap-1">
              Ver todas <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2">
            {Object.entries(byStatus).length > 0 ? (
              Object.entries(byStatus).map(([status, count]) => {
                const sc = STATUS_COLORS[status] || { bg: "bg-muted", text: "text-muted-foreground" };
                return (
                  <div key={status} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                    <span className={`status-badge ${sc.bg} ${sc.text}`}>
                      {STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{count}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No hay operaciones</p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Resumen</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground">{pendingCount} guías en proceso</p>
                  <p className="text-xs text-muted-foreground">De un total de {dashboard.totalAirWaybills ?? 0}</p>
                </div>
              </div>
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
