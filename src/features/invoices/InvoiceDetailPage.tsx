import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInvoiceStore } from "@/stores/invoiceStore";
import { useAuthStore } from "@/stores/authStore";
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle, Send, Download } from "lucide-react";
import { invoiceService } from "@/services/invoiceService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatters";
import { AppBreadcrumb } from "@/components/molecules/AppBreadcrumb";
import type { InvoiceStatus } from "@/lib/types";

const statusStyle: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: "bg-muted/50", text: "text-muted-foreground", label: "Borrador" },
  SENT: { bg: "bg-info/15", text: "text-info", label: "Enviada" },
  PAID: { bg: "bg-success/15", text: "text-success", label: "Pagada" },
  OVERDUE: { bg: "bg-warning/15", text: "text-warning", label: "Vencida" },
  CANCELLED: { bg: "bg-destructive/15", text: "text-destructive", label: "Anulada" },
};

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentInvoice: invoice, loading, fetchInvoice, updateStatus, deleteInvoice, clearCurrent } = useInvoiceStore();
  const { hasPermission } = useAuthStore();
  const { toast } = useToast();
  const [showDelete, setShowDelete] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    setDownloading(true);
    try {
      const blob = await invoiceService.exportPDF(invoice.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast({ title: "Error al descargar PDF", description: err.message, variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (id) fetchInvoice(id);
    return () => clearCurrent();
  }, [id]);

  if (loading || !invoice) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando...</div>;
  }

  const ss = statusStyle[invoice.status] || statusStyle.DRAFT;
  const canEdit = invoice.status === "DRAFT";
  const canMarkPaid = invoice.status === "SENT" || invoice.status === "OVERDUE";
  const canSend = invoice.status === "DRAFT";
  const canCancel = invoice.status !== "CANCELLED" && invoice.status !== "PAID";

  const handleStatusChange = async (status: InvoiceStatus) => {
    try {
      await updateStatus(invoice.id, status);
      toast({ title: "Estado actualizado", description: `Factura marcada como ${statusStyle[status]?.label || status}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInvoice(invoice.id);
      toast({ title: "Factura eliminada" });
      navigate("/invoices");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <AppBreadcrumb items={[{ label: "Facturación", href: "/invoices" }, { label: invoice.invoiceNumber }]} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/invoices")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-mono">{invoice.invoiceNumber}</h1>
            <p className="text-sm text-muted-foreground">{invoice.customer?.companyName} · {invoice.invoiceDate}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {hasPermission("invoices.edit") && canEdit && (
            <Button onClick={() => navigate(`/invoices/${invoice.id}/edit`)} variant="outline" className="gap-2">
              <Edit className="h-4 w-4" /> Editar
            </Button>
          )}
          {hasPermission("invoices.edit") && canSend && (
            <Button onClick={() => handleStatusChange("SENT")} variant="outline" className="text-info gap-2">
              <Send className="h-4 w-4" /> Enviar
            </Button>
          )}
          {hasPermission("invoices.edit") && canMarkPaid && (
            <Button onClick={() => handleStatusChange("PAID")} variant="outline" className="text-success gap-2">
              <CheckCircle className="h-4 w-4" /> Marcar pagada
            </Button>
          )}
          {hasPermission("invoices.edit") && canCancel && (
            <Button onClick={() => handleStatusChange("CANCELLED")} variant="outline" className="text-destructive gap-2">
              <XCircle className="h-4 w-4" /> Anular
            </Button>
          )}
          <Button variant="outline" className="gap-2" onClick={handleDownloadPDF} disabled={downloading}>
            <Download className="h-4 w-4" /> {downloading ? "Descargando..." : "PDF"}
          </Button>
          {hasPermission("invoices.delete") && (
            <Button variant="outline" className="text-destructive" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
          <p className="text-3xl font-bold text-foreground mt-1">{formatCurrency(invoice.totalAmount)}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Estado</p>
          <span className={`status-badge text-sm mt-2 inline-block ${ss.bg} ${ss.text}`}>{ss.label}</span>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Creación</p>
          <p className="text-lg font-semibold text-foreground mt-1">{invoice.createdAt?.split("T")[0] || "—"}</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Detalle de ítems</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Descripción</th>
              <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase">Monto</th>
              <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase">Comisión</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).map((item, idx) => (
              <tr key={idx} className="border-b border-border/30">
                <td className="p-3 text-sm text-foreground">{item.serviceDescription}</td>
                <td className="p-3 text-sm text-right font-semibold text-foreground">{formatCurrency(item.amount)}</td>
                <td className="p-3 text-sm text-right text-muted-foreground">{item.agencyCommission != null ? formatCurrency(item.agencyCommission) : "—"}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={2} className="p-3 text-sm font-semibold text-foreground text-right">Total</td>
              <td className="p-3 text-right font-bold text-lg text-foreground">{formatCurrency(invoice.totalAmount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader><DialogTitle>¿Eliminar {invoice.invoiceNumber}?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
