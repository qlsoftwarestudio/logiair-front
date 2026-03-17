import { useEffect, useState } from "react";
import { useAWBStore } from "@/stores/awbStore";
import { useInvoiceStore } from "@/stores/invoiceStore";
import { useCustomerStore } from "@/stores/customerStore";
import { motion } from "framer-motion";
import { Download, Plane, DollarSign, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { AppBreadcrumb } from "@/components/molecules/AppBreadcrumb";
import { formatCurrency } from "@/utils/formatters";
import { STATUS_LABELS } from "@/constants/awbStatuses";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell,
} from "recharts";

const COLORS = ["hsl(210,100%,50%)", "hsl(142,71%,45%)", "hsl(38,92%,50%)", "hsl(280,65%,60%)", "hsl(0,72%,51%)"];

type ReportTab = "general" | "awbs" | "customers" | "financial";

export default function ReportsPage() {
  const { awbs, fetchAWBs } = useAWBStore();
  const { invoices, fetchInvoices } = useInvoiceStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const [activeTab, setActiveTab] = useState<ReportTab>("general");

  useEffect(() => { fetchAWBs(); fetchInvoices(); fetchCustomers(); }, []);

  const imports = awbs.filter((a) => a.operationType === "IMPORT").length;
  const exports = awbs.filter((a) => a.operationType === "EXPORT").length;

  const statusCounts = awbs.reduce((acc, a) => {
    const label = STATUS_LABELS[a.status as keyof typeof STATUS_LABELS] || a.status;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const barData = [{ name: "Importación", value: imports }, { name: "Exportación", value: exports }];

  const totalRevenue = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const paidRevenue = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.totalAmount, 0);
  const pendingRevenue = invoices.filter((i) => i.status !== "PAID" && i.status !== "CANCELLED").reduce((s, i) => s + i.totalAmount, 0);

  const topClients = customers.map((c) => ({
    name: c.companyName,
    ops: awbs.filter((a) => a.customer?.id === c.id).length,
    revenue: invoices.filter((i) => i.customer?.id === c.id).reduce((s, inv) => s + inv.totalAmount, 0),
  })).sort((a, b) => b.ops - a.ops).slice(0, 5);

  const tabs = [
    { id: "general" as const, label: "General", icon: BarChart3 },
    { id: "awbs" as const, label: "AWBs", icon: Plane },
    { id: "customers" as const, label: "Clientes", icon: Users },
    { id: "financial" as const, label: "Financiero", icon: DollarSign },
  ];

  const tooltipStyle = { background: "hsl(220,25%,12%)", border: "1px solid hsl(220,20%,18%)", borderRadius: "8px", color: "hsl(210,20%,92%)" };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Reportes" }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
          <p className="text-sm text-muted-foreground">Análisis operativo y financiero</p>
        </div>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Exportar</Button>
      </div>

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

      {activeTab === "general" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total operaciones" value={awbs.length} delay={0} />
            <StatCard title="Importaciones" value={imports} badge={`${Math.round((imports / (awbs.length || 1)) * 100)}%`} badgeVariant="info" delay={0.05} />
            <StatCard title="Exportaciones" value={exports} badge={`${Math.round((exports / (awbs.length || 1)) * 100)}%`} badgeVariant="info" delay={0.1} />
            <StatCard title="Facturación total" value={formatCurrency(totalRevenue)} badge={`${formatCurrency(paidRevenue)} cobrado`} badgeVariant="success" delay={0.15} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Operaciones por tipo</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,18%)" />
                  <XAxis dataKey="name" stroke="hsl(215,15%,55%)" fontSize={12} />
                  <YAxis stroke="hsl(215,15%,55%)" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="hsl(210,100%,50%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Distribución por estado</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RePieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "awbs" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total AWBs" value={awbs.length} delay={0} />
            <StatCard title="Entregadas" value={awbs.filter((a) => a.status === "DELIVERED").length} badgeVariant="success" delay={0.05} />
            <StatCard title="En proceso" value={awbs.filter((a) => a.status !== "DELIVERED" && a.status !== "CANCELLED").length} badgeVariant="warning" delay={0.1} />
          </div>
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">AWBs por estado</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pieData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,18%)" />
                <XAxis type="number" stroke="hsl(215,15%,55%)" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="hsl(215,15%,55%)" fontSize={11} width={160} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="hsl(210,100%,50%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {activeTab === "customers" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total clientes" value={customers.length} delay={0} />
            <StatCard title="Con operaciones" value={customers.filter((c) => awbs.some((a) => a.customer?.id === c.id)).length} delay={0.05} />
            <StatCard title="Promedio ops/cliente" value={(awbs.length / (customers.length || 1)).toFixed(1)} delay={0.1} />
          </div>
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Top clientes por operaciones</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topClients}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,18%)" />
                <XAxis dataKey="name" stroke="hsl(215,15%,55%)" fontSize={11} />
                <YAxis stroke="hsl(215,15%,55%)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="ops" fill="hsl(142,71%,45%)" radius={[6, 6, 0, 0]} name="Operaciones" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {activeTab === "financial" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Facturación total" value={formatCurrency(totalRevenue)} delay={0} />
            <StatCard title="Cobrado" value={formatCurrency(paidRevenue)} badgeVariant="success" delay={0.05} />
            <StatCard title="Pendiente cobro" value={formatCurrency(pendingRevenue)} badgeVariant="warning" delay={0.1} />
          </div>
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Facturación por cliente</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topClients.filter((c) => c.revenue > 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,18%)" />
                <XAxis dataKey="name" stroke="hsl(215,15%,55%)" fontSize={11} />
                <YAxis stroke="hsl(215,15%,55%)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="hsl(38,92%,50%)" radius={[6, 6, 0, 0]} name="Facturación" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}
