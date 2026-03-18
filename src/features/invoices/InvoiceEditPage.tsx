import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInvoiceStore } from "@/stores/invoiceStore";
import { useCustomerStore } from "@/stores/customerStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

  const [form, setForm] = useState({ customerId: "", invoiceDate: "" });
  const [items, setItems] = useState<{ description: string; quantity: string; unitPrice: string; taxRate: string }[]>([]);

  useEffect(() => {
    fetchCustomers();
    if (id) fetchInvoice(id);
    return () => clearCurrent();
  }, [id]);

  useEffect(() => {
    if (currentInvoice) {
      setForm({
        customerId: String(currentInvoice.customer?.id || ""),
        invoiceDate: currentInvoice.invoiceDate,
      });
      setItems((currentInvoice.items || []).map((item) => ({
        description: item.serviceDescription || "",
        quantity: "1",
        unitPrice: String(item.amount || 0),
        taxRate: "0",
      })));
    }
  }, [currentInvoice]);

  const total = items.reduce((s, item) => {
    const subtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
    const tax = subtotal * ((parseFloat(item.taxRate) || 0) / 100);
    return s + subtotal + tax;
  }, 0);

  const addItem = () => setItems([...items, { description: "", quantity: "1", unitPrice: "", taxRate: "21" }]);
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
        .filter((item) => item.description && item.unitPrice)
        .map((item) => {
          const qty = parseInt(item.quantity) || 1;
          const price = parseFloat(item.unitPrice);
          const tax = parseFloat(item.taxRate) || 0;
          const amount = qty * price * (1 + tax / 100);
          return {
            serviceDescription: item.description,
            amount: Math.round(amount * 100) / 100,
          };
        });

      await updateInvoice(id, {
        customerId: Number(form.customerId),
        invoiceDate: form.invoiceDate,
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
            <div key={i} className="flex gap-3 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Descripción</Label>
                <Input value={item.description} onChange={(e) => updateSvc(i, "description", e.target.value)} className="bg-secondary border-border" />
              </div>
              <div className="w-20 space-y-1">
                <Label className="text-xs">Cant.</Label>
                <Input type="number" value={item.quantity} onChange={(e) => updateSvc(i, "quantity", e.target.value)} className="bg-secondary border-border" />
              </div>
              <div className="w-28 space-y-1">
                <Label className="text-xs">Precio unit.</Label>
                <Input type="number" value={item.unitPrice} onChange={(e) => updateSvc(i, "unitPrice", e.target.value)} className="bg-secondary border-border" />
              </div>
              <div className="w-20 space-y-1">
                <Label className="text-xs">IVA %</Label>
                <Input type="number" value={item.taxRate} onChange={(e) => updateSvc(i, "taxRate", e.target.value)} className="bg-secondary border-border" />
              </div>
              {items.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
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
