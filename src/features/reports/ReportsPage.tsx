import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Plane, DollarSign, Users, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/dashboard/StatCard";
import { AppBreadcrumb } from "@/components/molecules/AppBreadcrumb";
import { formatCurrency } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import { reportService } from "@/services/reportService";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { format, subMonths } from "date-fns";

const COLORS = ["hsl(210,100%,50%)", "hsl(142,71%,45%)", "hsl(38,92%,50%)", "hsl(280,65%,60%)", "hsl(0,72%,51%)"];

type ReportTab = "general" | "operations" | "customers" | "financial" | "commissions";

export default function ReportsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ReportTab>("general");
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [operationsData, setOperationsData] = useState<any>(null);
  const [customersData, setCustomersData] = useState<any>(null);
  const [invoicingData, setInvoicingData] = useState<any>(null);
  const [commissionsData, setCommissionsData] = useState<any>(null);

  const dateParams = { startDate, endDate };

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab: ReportTab) => {
    setLoading(true);
    try {
      switch (tab) {
        case "general":
          if (!dashboardData) {
            const data = await reportService.getDashboard();
            setDashboardData(data);
          }
          break;
        case "operations":
          { const ops = await reportService.getOperations(dateParams);
          setOperationsData(ops);
          break; }
        case "customers":
          if (!customersData) {
            const cust = await reportService.getCustomerReport();
            setCustomersData(cust);
          }
          break;
        case "financial":
          { const inv = await reportService.getInvoicingReport(dateParams);
          setInvoicingData(inv);
          break; }
        case "commissions":
          { const comm = await reportService.getCommissions(dateParams);
          setCommissionsData(comm);
          break; }
      }
    } catch (err: any) {
      console.error("Report load error:", err);
      toast({ title: "Error cargando reporte", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (reportType: string, exportFormat: string = "excel") => {
    try {
      const blob = await reportService.exportReport(reportType, exportFormat, dateParams);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-${reportType}-${startDate}-${endDate}.${exportFormat === "excel" ? "xlsx" : exportFormat}`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Reporte exportado" });
    } catch (err: any) {
      toast({ title: "Error al exportar", description: err.response?.data?.message || err.message, variant: "destructive" });
    }
  };

  const handleRefresh = () => {
    switch (activeTab) {
      case "operations":
        setOperationsData(null);
        break;
      case "financial":
        setInvoicingData(null);
        break;
      case "commissions":
        setCommissionsData(null);
        break;
    }
    loadTabData(activeTab);
  };

  const tabs = [
    { id: "general" as const, label: "General", icon: BarChart3 },
    { id: "operations" as const, label: "Operaciones", icon: Plane },
    { id: "customers" as const, label: "Clientes", icon: Users },
    { id: "financial" as const, label: "Financiero", icon: DollarSign },
    { id: "commissions" as const, label: "Comisiones", icon: DollarSign },
  ];

  const tooltipStyle = { background: "hsl(220,25%,12%)", border: "1px solid hsl(220,20%,18%)", borderRadius: "8px", color: "hsl(210,20%,92%)" };
  const needsDateFilter = activeTab === "operations" || activeTab === "financial" || activeTab === "commissions";

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Reportes" }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
          <p className="text-sm text-muted-foreground">Análisis operativo y financiero</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => handleExport(activeTab)}>
          <Download className="h-4 w-4" /> Exportar
        </Button>
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

      {needsDateFilter && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Desde</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40 bg-secondary border-border" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Hasta</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40 bg-secondary border-border" />
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1">
            <Calendar className="h-3 w-3" /> Aplicar
          </Button>
        </div>
      )}

      {loading && <div className="p-8 text-center text-muted-foreground">Cargando reporte...</div>}

      {!loading && activeTab === "general" && dashboardData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total operaciones" value={dashboardData.totalAirWaybills ?? 0} delay={0} />
            <StatCard title="Pendientes" value={dashboardData.pendingAirWaybills ?? 0} badgeVariant="warning" delay={0.05} />
            <StatCard title="Clientes" value={dashboardData.totalCustomers ?? 0} delay={0.1} />
            <StatCard title="Facturas" value={dashboardData.totalInvoices ?? 0} delay={0.15} />
          </div>
          {dashboardData.chartData && dashboardData.chartData.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Tendencia de operaciones</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,18%)" />
                  <XAxis dataKey="date" stroke="hsl(215,15%,55%)" fontSize={12} />
                  <YAxis stroke="hsl(215,15%,55%)" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="imports" stroke="hsl(210,100%,50%)" strokeWidth={2} name="Importaciones" />
                  <Line type="monotone" dataKey="exports" stroke="hsl(142,71%,45%)" strokeWidth={2} name="Exportaciones" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      )}

      {!loading && activeTab === "operations" && operationsData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Reporte de operaciones</h3>
            {Array.isArray(operationsData) && operationsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={operationsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,18%)" />
                  <XAxis dataKey="date" stroke="hsl(215,15%,55%)" fontSize={12} />
                  <YAxis stroke="hsl(215,15%,55%)" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="imports" fill="hsl(210,100%,50%)" radius={[6, 6, 0, 0]} name="Importaciones" />
                  <Bar dataKey="exports" fill="hsl(142,71%,45%)" radius={[6, 6, 0, 0]} name="Exportaciones" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{JSON.stringify(operationsData, null, 2)}</pre>
            )}
          </div>
        </motion.div>
      )}

      {!loading && activeTab === "customers" && customersData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Reporte de clientes</h3>
            {Array.isArray(customersData) && customersData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={customersData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,18%)" />
                  <XAxis dataKey="companyName" stroke="hsl(215,15%,55%)" fontSize={11} />
                  <YAxis stroke="hsl(215,15%,55%)" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="totalOperations" fill="hsl(210,100%,50%)" radius={[6, 6, 0, 0]} name="Operaciones" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{JSON.stringify(customersData, null, 2)}</pre>
            )}
          </div>
        </motion.div>
      )}

      {!loading && activeTab === "financial" && invoicingData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Reporte financiero</h3>
            {Array.isArray(invoicingData) && invoicingData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={invoicingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,18%)" />
                  <XAxis dataKey="period" stroke="hsl(215,15%,55%)" fontSize={12} />
                  <YAxis stroke="hsl(215,15%,55%)" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="total" fill="hsl(38,92%,50%)" radius={[6, 6, 0, 0]} name="Facturación" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{JSON.stringify(invoicingData, null, 2)}</pre>
            )}
          </div>
        </motion.div>
      )}

      {!loading && activeTab === "commissions" && commissionsData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Reporte de comisiones</h3>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{JSON.stringify(commissionsData, null, 2)}</pre>
          </div>
        </motion.div>
      )}
    </div>
  );
}
