import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCustomerStore } from "@/stores/customerStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CustomerEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentCustomer: customer, loading, fetchCustomer, updateCustomer, clearCurrent } = useCustomerStore();
  const { toast } = useToast();
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (id) fetchCustomer(id);
    return () => clearCurrent();
  }, [id]);

  useEffect(() => {
    if (customer && !form) {
      setForm({
        companyName: customer.companyName,
        taxId: customer.taxId,
        contactName: customer.contactName,
        contactEmail: customer.contactEmail,
        contactPhone: customer.contactPhone || "",
        address: customer.address || "",
      });
    }
  }, [customer]);

  if (!form) return <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando...</div>;

  const set = (field: string, value: string) => setForm((f: any) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateCustomer(id, form);
      toast({ title: "Cliente actualizado" });
      navigate(`/customers/${id}`);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/customers/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar {form.companyName}</h1>
          <p className="text-sm text-muted-foreground">Modificar datos del cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Empresa</Label>
            <Input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} className="bg-secondary border-border" required />
          </div>
          <div className="space-y-2">
            <Label>CUIT</Label>
            <Input value={form.taxId} onChange={(e) => set("taxId", e.target.value)} className="bg-secondary border-border font-mono" required />
          </div>
          <div className="space-y-2">
            <Label>Contacto</Label>
            <Input value={form.contactName} onChange={(e) => set("contactName", e.target.value)} className="bg-secondary border-border" required />
          </div>
          <div className="space-y-2">
            <Label>Email de contacto</Label>
            <Input type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} className="bg-secondary border-border" required />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label>Dirección</Label>
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} className="bg-secondary border-border" />
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="outline" onClick={() => navigate(`/customers/${id}`)}>Cancelar</Button>
          <Button type="submit" disabled={loading} className="gradient-primary text-primary-foreground gap-2">
            <Save className="h-4 w-4" /> Guardar
          </Button>
        </div>
      </form>
    </div>
  );
}
