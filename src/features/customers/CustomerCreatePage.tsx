import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerStore } from "@/stores/customerStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AppBreadcrumb } from "@/components/molecules/AppBreadcrumb";

export default function CustomerCreatePage() {
  const { createCustomer, loading } = useCustomerStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    companyName: "",
    taxId: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCuit = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 11);
    if (clean.length <= 2) return clean;
    if (clean.length <= 10) return `${clean.slice(0, 2)}-${clean.slice(2)}`;
    return `${clean.slice(0, 2)}-${clean.slice(2, 10)}-${clean.slice(10)}`;
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.companyName.trim()) errs.companyName = "Requerido";
    const cuitClean = form.taxId.replace(/\D/g, "");
    if (cuitClean.length !== 11) errs.taxId = "CUIT debe tener 11 dígitos";
    if (!form.contactName.trim()) errs.contactName = "Requerido";
    if (!form.contactEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) errs.contactEmail = "Email inválido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const set = (field: string, value: string) => {
    if (field === "taxId") value = formatCuit(value);
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await createCustomer(form);
      toast({ title: "Cliente creado", description: `${form.companyName} registrado exitosamente` });
      navigate("/customers");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const inputClass = (field: string) =>
    `bg-secondary border-border ${errors[field] ? "border-destructive focus-visible:ring-destructive" : ""}`;

  return (
    <div className="space-y-6 max-w-2xl">
      <AppBreadcrumb items={[{ label: "Clientes", href: "/customers" }, { label: "Nuevo cliente" }]} />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/customers")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nuevo Cliente</h1>
          <p className="text-sm text-muted-foreground">Registrar un nuevo cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Empresa *</Label>
            <Input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Nombre de la empresa" className={inputClass("companyName")} />
            {errors.companyName && <p className="text-xs text-destructive">{errors.companyName}</p>}
          </div>
          <div className="space-y-2">
            <Label>CUIT *</Label>
            <Input value={form.taxId} onChange={(e) => set("taxId", e.target.value)} placeholder="30-XXXXXXXX-X" className={`${inputClass("taxId")} font-mono`} />
            {errors.taxId && <p className="text-xs text-destructive">{errors.taxId}</p>}
          </div>
          <div className="space-y-2">
            <Label>Contacto *</Label>
            <Input value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Nombre del contacto" className={inputClass("contactName")} />
            {errors.contactName && <p className="text-xs text-destructive">{errors.contactName}</p>}
          </div>
          <div className="space-y-2">
            <Label>Email de contacto *</Label>
            <Input type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="contacto@empresa.com" className={inputClass("contactEmail")} />
            {errors.contactEmail && <p className="text-xs text-destructive">{errors.contactEmail}</p>}
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} placeholder="+54 11 XXXX-XXXX" className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label>Dirección</Label>
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Calle 123, CABA" className="bg-secondary border-border" />
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="outline" onClick={() => navigate("/customers")}>Cancelar</Button>
          <Button type="submit" disabled={loading} className="gradient-primary text-primary-foreground gap-2">
            <Save className="h-4 w-4" /> Crear cliente
          </Button>
        </div>
      </form>
    </div>
  );
}
