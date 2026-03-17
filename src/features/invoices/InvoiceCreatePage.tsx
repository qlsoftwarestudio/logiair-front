import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useInvoiceStore } from "@/stores/invoiceStore";
import { useCustomerStore } from "@/stores/customerStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function InvoiceCreatePage() {
  const { createInvoice, loading } = useInvoiceStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    customerId: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
  });
  const [items, setItems] = useState<{ description: string; quantity: string; unitPrice: string; taxRate: string }[]>([
    { description: "", quantity: "1", unitPrice: "", taxRate: "21" },
  ]);

  useEffect(() => { fetchCustomers(); }, []);

  const total = items.reduce((s, item) => {
    const subtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
    const tax = subtotal * ((parseFloat(item.taxRate) || 0) / 100);
    return s + subtotal + tax;
  }, 0);

  const addItem = () => setItems([...items, { description: "", quantity: "1", unitPrice: "", taxRate: "21" }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: string) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId) return;
    try {
      const invoiceItems = items
        .filter((item) => item.description && item.unitPrice)
        .map((item) => ({
          description: item.description,
          quantity: parseInt(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice),
          taxRate: parseFloat(item.taxRate) || 0,
        }));

      await createInvoice({
        customerId: Number(form.customerId),
        issueDate: form.issueDate,
        dueDate: form.dueDate || undefined,
        items: invoiceItems,
      });
      toast({ title: "Factura creada" });
      navigate("/invoices");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/invoices")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nueva Factura</h1>
          <p className="text-sm text-muted-foreground">Crear factura con servicios</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 space-y-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Datos de factura</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v })}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.companyName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha emisión *</Label>
              <Input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} className="bg-secondary border-border" required />
            </div>
            <div className="space-y-2">
              <Label>Fecha vencimiento</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="bg-secondary border-border" />
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
                <Input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} placeholder="Servicio..." className="bg-secondary border-border" />
              </div>
              <div className="w-20 space-y-1">
                <Label className="text-xs">Cant.</Label>
                <Input type="number" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} className="bg-secondary border-border" />
              </div>
              <div className="w-28 space-y-1">
                <Label className="text-xs">Precio unit.</Label>
                <Input type="number" value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", e.target.value)} placeholder="0" className="bg-secondary border-border" />
              </div>
              <div className="w-20 space-y-1">
                <Label className="text-xs">IVA %</Label>
                <Input type="number" value={item.taxRate} onChange={(e) => updateItem(i, "taxRate", e.target.value)} placeholder="21" className="bg-secondary border-border" />
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
          <Button type="button" variant="outline" onClick={() => navigate("/invoices")}>Cancelar</Button>
          <Button type="submit" disabled={loading || !form.customerId} className="gradient-primary text-primary-foreground gap-2">
            <Save className="h-4 w-4" /> Crear factura
          </Button>
        </div>
      </form>
    </div>
  );
}
