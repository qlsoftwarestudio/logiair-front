import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInvoiceStore } from "@/stores/invoiceStore";
import { useCustomerStore } from "@/stores/customerStore";
import { useAWBStore } from "@/stores/awbStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AppBreadcrumb } from "@/components/molecules/AppBreadcrumb";

export default function InvoiceEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentInvoice, loading, fetchInvoice, updateInvoice, clearCurrent } = useInvoiceStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { awbs, fetchAWBs } = useAWBStore();

  const [form, setForm] = useState({ invoiceNumber: "", customerId: "", invoiceDate: "", status: "PENDING" as "PENDING" | "PAID", observations: "" });
  const [items, setItems] = useState<{ serviceDescription: string; amount: string; airWaybillId: string }[]>([]);

  useEffect(() => {
    fetchCustomers();
    fetchAWBs();
    if (id) fetchInvoice(id);
    return () => clearCurrent();
  }, [id]);

  useEffect(() => {
    if (currentInvoice) {
      setForm({
        invoiceNumber: currentInvoice.invoiceNumber || "",
        customerId: String(currentInvoice.customer?.id || ""),
        invoiceDate: currentInvoice.invoiceDate,
        status: (currentInvoice.status as "PENDING" | "PAID") || "PENDING",
        observations: (currentInvoice as any).observations || "",
      });
      setItems((currentInvoice.items || []).map((item: any) => ({
        serviceDescription: item.serviceDescription || "",
        amount: String(item.amount ?? 0),
        airWaybillId: item.airWaybillId ? String(item.airWaybillId) : "none",
      })));
    }
  }, [currentInvoice]);

  const total = items.reduce((s, item) => s + (parseFloat(item.amount) || 0), 0);

  const addItem = () => setItems([...items, { serviceDescription: "", amount: "", airWaybillId: "none" }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateSvc = (i: number, field: string, value: string) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !form.customerId) return;
    try {
      const invoiceItems = items
        .filter((item) => item.serviceDescription && item.amount)
        .map((item) => ({
          serviceDescription: item.serviceDescription,
          amount: parseFloat(item.amount),
          airWaybillId: item.airWaybillId && item.airWaybillId !== "none" ? Number(item.airWaybillId) : null,
        }));

      await updateInvoice(id, {
        invoiceNumber: form.invoiceNumber,
        customerId: Number(form.customerId),
        invoiceDate: form.invoiceDate,
        totalAmount: Math.round(total * 100) / 100,
        status: form.status,
        observations: form.observations || undefined,
        items: invoiceItems,
      });
      toast({ title: "Factura actualizada" });
      navigate(`/invoices/${id}`);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (loading && !currentInvoice) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando...</div>;
  }

  const customerAwbs = form.customerId
    ? awbs.filter((a) => a.customer?.id === Number(form.customerId))
    : awbs;

  return (
    <div className="space-y-6 max-w-3xl">
      <AppBreadcrumb items={[{ label: "Facturación", href: "/invoices" }, { label: currentInvoice?.invoiceNumber || "Editar", href: `/invoices/${id}` }, { label: "Editar" }]} />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/invoices/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Factura</h1>
          <p className="text-sm text-muted-foreground">{currentInvoice?.invoiceNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 space-y-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Datos de factura</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nº Factura *</Label>
              <Input value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} className="bg-secondary border-border" required />
            </div>
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v })}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.companyName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha emisión</Label>
              <Input type="date" value={form.invoiceDate} onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "PENDING" | "PAID" })}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="PAID">Pagada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Observaciones</Label>
            <Textarea value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} className="bg-secondary border-border" rows={2} />
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ítems</h3>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
              <Plus className="h-3 w-3" /> Agregar
            </Button>
          </div>
          {items.map((item, i) => (
            <div key={i} className="space-y-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Descripción del servicio</Label>
                  <Input value={item.serviceDescription} onChange={(e) => updateSvc(i, "serviceDescription", e.target.value)} className="bg-secondary border-border" />
                </div>
                <div className="w-28 space-y-1">
                  <Label className="text-xs">Monto</Label>
                  <Input type="number" step="0.01" value={item.amount} onChange={(e) => updateSvc(i, "amount", e.target.value)} placeholder="0.00" className="bg-secondary border-border" />
                </div>
                {items.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Guía asociada</Label>
                  <Select value={item.airWaybillId} onValueChange={(v) => updateSvc(i, "airWaybillId", v)}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Sin guía" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin guía</SelectItem>
                      {customerAwbs.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.awbNumber}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-end pt-2 border-t border-border">
            <p className="text-lg font-bold text-foreground">Total: ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(`/invoices/${id}`)}>Cancelar</Button>
          <Button type="submit" disabled={loading || !form.customerId} className="gradient-primary text-primary-foreground gap-2">
            <Save className="h-4 w-4" /> Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
