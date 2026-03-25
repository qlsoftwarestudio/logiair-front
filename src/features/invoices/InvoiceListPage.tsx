import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInvoiceStore } from "@/stores/invoiceStore";
import { useAuthStore } from "@/stores/authStore";
import { motion } from "framer-motion";
import { Search, Plus, FileText, Download, CalendarDays } from "lucide-react";
import { DateRangeExportDialog } from "@/components/invoices/DateRangeExportDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/utils/formatters";
import { AppBreadcrumb } from "@/components/molecules/AppBreadcrumb";
import { TablePagination } from "@/components/molecules/TablePagination";
import { EmptyState } from "@/components/molecules/EmptyState";
import { SortableHeader, type SortDir, toggleSort, useSort } from "@/components/molecules/SortableHeader";
import { invoiceService } from "@/services/invoiceService";
import { useToast } from "@/hooks/use-toast";

const statusStyle: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: "bg-muted/50", text: "text-muted-foreground", label: "Borrador" },
  SENT: { bg: "bg-info/15", text: "text-info", label: "Enviada" },
  PAID: { bg: "bg-success/15", text: "text-success", label: "Pagada" },
  OVERDUE: { bg: "bg-warning/15", text: "text-warning", label: "Vencida" },
  CANCELLED: { bg: "bg-destructive/15", text: "text-destructive", label: "Anulada" },
};

export default function InvoiceListPage() {
  const { invoices, loading, fetchInvoices } = useInvoiceStore();
  const { hasPermission } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const { sortData } = useSort(invoices);

  useEffect(() => { fetchInvoices(); }, []);

  const handleGenerateMonthly = async () => {
    const now = new Date();
    try {
      await invoiceService.generateMonthly(now.getMonth() + 1, now.getFullYear());
      toast({ title: "Facturas generadas", description: "Se generaron las facturas del mes actual" });
      fetchInvoices();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || err.message, variant: "destructive" });
    }
  };

  const handleDownloadPDF = async (e: React.MouseEvent, invoiceId: number) => {
    e.stopPropagation();
    try {
      const blob = await invoiceService.exportInvoice(invoiceId, "pdf");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `factura-${invoiceId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || err.message, variant: "destructive" });
    }
  };

  const filtered = invoices.filter((inv) => {
    const matchSearch = !search ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (inv.customer?.companyName || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const sorted = sortData(filtered, sortField, sortDir);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);
  const pendingBilling = invoices.filter((i) => i.status !== "PAID" && i.status !== "CANCELLED").reduce((s, i) => s + i.totalAmount, 0);

  const handleSort = (field: string) => {
    const result = toggleSort(field, sortField, sortDir);
    setSortField(result.field);
    setSortDir(result.dir);
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Facturación" }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Facturación</h1>
          <p className="text-sm text-muted-foreground">{invoices.length} facturas · Pendiente: {formatCurrency(pendingBilling)}</p>
        </div>
        <div className="flex gap-2">
          <DateRangeExportDialog />
          {hasPermission("invoices.create") && (
            <Button onClick={() => navigate("/invoices/new")} className="gradient-primary text-primary-foreground gap-2">
              <Plus className="h-4 w-4" /> Nueva Factura
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar factura o cliente..." className="pl-9 bg-secondary border-border" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40 bg-secondary border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="PENDING">Pendiente</SelectItem>
            <SelectItem value="PAID">Pagada</SelectItem>
            <SelectItem value="CANCELLED">Anulada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No se encontraron facturas"
            description={search || statusFilter !== "all" ? "Probá ajustando los filtros" : "Creá tu primera factura para empezar"}
            actionLabel={hasPermission("invoices.create") ? "Nueva Factura" : undefined}
            onAction={hasPermission("invoices.create") ? () => navigate("/invoices/new") : undefined}
          />
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <SortableHeader label="Factura" field="invoiceNumber" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente</th>
                  <SortableHeader label="Fecha" field="invoiceDate" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Total" field="totalAmount" currentField={sortField} currentDir={sortDir} onSort={handleSort} className="text-right" />
                  <SortableHeader label="Estado" field="status" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-10"></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((inv, i) => {
                  const ss = statusStyle[inv.status] || statusStyle.DRAFT;
                  return (
                    <motion.tr
                      key={inv.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => navigate(`/invoices/${inv.id}`)}
                      className="border-b border-border/50 hover:bg-secondary/50 cursor-pointer transition-colors"
                    >
                      <td className="p-4 font-mono font-semibold text-foreground">{inv.invoiceNumber}</td>
                      <td className="p-4 text-sm text-foreground">{inv.customer?.companyName || "-"}</td>
                      <td className="p-4 text-sm text-muted-foreground">{inv.invoiceDate}</td>
                      <td className="p-4 text-right font-semibold text-foreground">{formatCurrency(inv.totalAmount)}</td>
                      <td className="p-4"><span className={`status-badge ${ss.bg} ${ss.text}`}>{ss.label}</span></td>
                      <td className="p-4">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handleDownloadPDF(e, inv.id)} title="Descargar PDF">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={setPageSize} />
          </>
        )}
      </div>
    </div>
  );
}
