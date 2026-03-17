import { useInvoiceStore } from "@/stores/invoiceStore";
import { motion } from "framer-motion";
import { Plus, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { formatCurrency } from "@/utils/formatters";

const statusStyles: Record<string, string> = {
  PENDING: "bg-warning/15 text-warning",
  PAID: "bg-success/15 text-success",
  CANCELLED: "bg-destructive/15 text-destructive",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagada",
  CANCELLED: "Anulada",
};

const FacturacionPage = () => {
  const { invoices, fetchInvoices } = useInvoiceStore();

  useEffect(() => { fetchInvoices(); }, []);

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Facturación</h1>
        <Button className="gradient-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> Nueva Factura
        </Button>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border bg-secondary/30">
              <th className="text-left p-4 font-medium">Nro Factura</th>
              <th className="text-left p-4 font-medium">Cliente</th>
              <th className="text-left p-4 font-medium">Fecha</th>
              <th className="text-left p-4 font-medium">Total</th>
              <th className="text-left p-4 font-medium">Estado</th>
              <th className="text-left p-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <motion.tr
                key={inv.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
              >
                <td className="p-4 font-mono font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {inv.invoiceNumber}
                </td>
                <td className="p-4 text-muted-foreground">{inv.customer?.companyName || "-"}</td>
                <td className="p-4 text-muted-foreground">{inv.issueDate}</td>
                <td className="p-4 font-semibold text-foreground">{formatCurrency(inv.totalAmount)}</td>
                <td className="p-4">
                  <span className={`status-badge ${statusStyles[inv.status] || ""}`}>{statusLabels[inv.status] || inv.status}</span>
                </td>
                <td className="p-4">
                  <button className="text-primary hover:text-primary/80 transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default FacturacionPage;
