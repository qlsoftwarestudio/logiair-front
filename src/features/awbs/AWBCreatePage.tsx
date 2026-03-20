import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAWBStore } from "@/stores/awbStore";
import { useCustomerStore } from "@/stores/customerStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AppBreadcrumb } from "@/components/molecules/AppBreadcrumb";
import type { OperationType } from "@/lib/types";

export default function AWBCreatePage() {
  const { createAWB, loading } = useAWBStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    awbNumber: "",
    customerId: "",
    operationType: "IMPO" as OperationType,
    airline: "",
    origin: "",
    destination: "",
    arrivalOrDepartureDate: "",
    manifestNumber: "",
    observations: "",
  });

  useEffect(() => { fetchCustomers(); }, []);

  const selectedClient = customers.find((c) => String(c.id) === form.customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAWB({
        awbNumber: form.awbNumber,
        customerId: Number(form.customerId),
        operationType: form.operationType,
        airline: form.airline,
        origin: form.origin,
        destination: form.destination,
        arrivalOrDepartureDate: form.arrivalOrDepartureDate,
        manifestNumber: form.manifestNumber,
        observations: form.observations,
      });
      toast({ title: "Guía creada", description: `${form.awbNumber} registrada exitosamente` });
      navigate("/awbs");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="space-y-6 max-w-3xl">
      <AppBreadcrumb items={[{ label: "Guías Aéreas", href: "/awbs" }, { label: "Nueva guía" }]} />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/awbs")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nueva Guía Aérea</h1>
          <p className="text-sm text-muted-foreground">Registrar una nueva operación</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 space-y-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Datos principales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número AWB *</Label>
              <Input value={form.awbNumber} onChange={(e) => set("awbNumber", e.target.value)} placeholder="AWB-XXX-XXXX" className="bg-secondary border-border" required />
            </div>
            <div className="space-y-2">
              <Label>Tipo de operación *</Label>
              <Select value={form.operationType} onValueChange={(v) => set("operationType", v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="IMPO">Importación</SelectItem>
                  <SelectItem value="EXPO">Exportación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select value={form.customerId} onValueChange={(v) => set("customerId", v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.companyName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Aerolínea *</Label>
              <Input value={form.airline} onChange={(e) => set("airline", e.target.value)} placeholder="Nombre de aerolínea" className="bg-secondary border-border" required />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pt-4">Ruta y fechas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Origen (IATA) *</Label>
              <Input value={form.origin} onChange={(e) => set("origin", e.target.value.toUpperCase())} placeholder="EZE" maxLength={3} className="bg-secondary border-border font-mono" required />
            </div>
            <div className="space-y-2">
              <Label>Destino (IATA) *</Label>
              <Input value={form.destination} onChange={(e) => set("destination", e.target.value.toUpperCase())} placeholder="MIA" maxLength={3} className="bg-secondary border-border font-mono" required />
            </div>
            <div className="space-y-2">
              <Label>{form.operationType === "IMPO" ? "Fecha de llegada" : "Fecha de salida"}</Label>
              <Input type="date" value={form.arrivalOrDepartureDate} onChange={(e) => set("arrivalOrDepartureDate", e.target.value)} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Nº Manifiesto</Label>
              <Input value={form.manifestNumber} onChange={(e) => set("manifestNumber", e.target.value)} placeholder="MAN-XXXX-XXXX" className="bg-secondary border-border" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observaciones</Label>
            <Textarea value={form.observations} onChange={(e) => set("observations", e.target.value)} placeholder="Notas adicionales..." className="bg-secondary border-border" rows={3} />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/awbs")}>Cancelar</Button>
          <Button type="submit" disabled={loading || !form.awbNumber || !form.customerId || !form.airline || !form.origin || !form.destination} className="gradient-primary text-primary-foreground gap-2">
            <Save className="h-4 w-4" /> Crear guía
          </Button>
        </div>
      </form>
    </div>
  );
}
