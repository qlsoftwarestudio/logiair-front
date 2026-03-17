import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAWBStore } from "@/stores/awbStore";
import { useCustomerStore } from "@/stores/customerStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AWBEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentAWB: awb, loading, fetchAWB, updateAWB, clearCurrent } = useAWBStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { toast } = useToast();
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (id) fetchAWB(id);
    fetchCustomers();
    return () => clearCurrent();
  }, [id]);

  useEffect(() => {
    if (awb && !form) {
      setForm({
        awbNumber: awb.awbNumber,
        customerId: String(awb.customer?.id || ""),
        operationType: awb.operationType,
        airline: awb.airline,
        origin: awb.origin,
        destination: awb.destination,
        arrivalOrDepartureDate: awb.arrivalOrDepartureDate || "",
        manifestNumber: awb.manifestNumber || "",
        observations: awb.observations || "",
      });
    }
  }, [awb]);

  if (!form) return <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando...</div>;

  const set = (field: string, value: string) => setForm((f: any) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateAWB(id, {
        ...form,
        customerId: Number(form.customerId),
      });
      toast({ title: "Guía actualizada" });
      navigate(`/awbs/${id}`);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/awbs/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar {form.awbNumber}</h1>
          <p className="text-sm text-muted-foreground">Modificar datos de la guía</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número AWB</Label>
              <Input value={form.awbNumber} onChange={(e) => set("awbNumber", e.target.value)} className="bg-secondary border-border" required />
            </div>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={form.customerId} onValueChange={(v) => set("customerId", v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.companyName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Aerolínea</Label>
              <Input value={form.airline} onChange={(e) => set("airline", e.target.value)} className="bg-secondary border-border" required />
            </div>
            <div className="space-y-2">
              <Label>Nº Manifiesto</Label>
              <Input value={form.manifestNumber} onChange={(e) => set("manifestNumber", e.target.value)} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Origen</Label>
              <Input value={form.origin} onChange={(e) => set("origin", e.target.value.toUpperCase())} className="bg-secondary border-border font-mono" maxLength={3} required />
            </div>
            <div className="space-y-2">
              <Label>Destino</Label>
              <Input value={form.destination} onChange={(e) => set("destination", e.target.value.toUpperCase())} className="bg-secondary border-border font-mono" maxLength={3} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Observaciones</Label>
            <Textarea value={form.observations} onChange={(e) => set("observations", e.target.value)} className="bg-secondary border-border" rows={3} />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(`/awbs/${id}`)}>Cancelar</Button>
          <Button type="submit" disabled={loading} className="gradient-primary text-primary-foreground gap-2">
            <Save className="h-4 w-4" /> Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
