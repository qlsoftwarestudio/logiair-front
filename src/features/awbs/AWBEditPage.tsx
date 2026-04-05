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
  const { currentAWB: awb, loading, fetchAWB, updateAWB, clearCurrent, awbs, fetchAWBs } = useAWBStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { toast } = useToast();
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (id) fetchAWB(id);
    fetchCustomers();
    fetchAWBs();
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
        pieces: awb.pieces != null ? String(awb.pieces) : "",
        weightKg: awb.weightKg != null ? String(awb.weightKg) : "",
        shipper: awb.shipper || "",
        consignee: awb.consignee || "",
        awbType: awb.awbType || "MASTER",
        parentAwbId: awb.parentAwbId ? String(awb.parentAwbId) : "",
      });
    }
  }, [awb]);

  if (!form) return <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando...</div>;

  const masterAwbs = awbs.filter((a) => a.awbType === "MASTER" && a.id !== Number(id));
  const set = (field: string, value: string) => setForm((f: any) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateAWB(id, {
        awbNumber: form.awbNumber,
        customerId: Number(form.customerId),
        operationType: form.operationType,
        airline: form.airline,
        origin: form.origin,
        destination: form.destination,
        arrivalOrDepartureDate: form.arrivalOrDepartureDate,
        manifestNumber: form.manifestNumber || undefined,
        observations: form.observations || undefined,
        pieces: form.pieces ? Number(form.pieces) : undefined,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
        shipper: form.shipper || undefined,
        consignee: form.consignee || undefined,
        awbType: form.awbType,
        parentAwbId: form.awbType === "HOUSE" && form.parentAwbId ? Number(form.parentAwbId) : undefined,
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
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Datos principales</h3>
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

          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pt-4">Tipo de guía</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.awbType} onValueChange={(v) => set("awbType", v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MASTER">Master (Guía madre)</SelectItem>
                  <SelectItem value="HOUSE">House (Guía hija)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.awbType === "HOUSE" && (
              <div className="space-y-2">
                <Label>Guía madre</Label>
                <Select value={form.parentAwbId} onValueChange={(v) => set("parentAwbId", v)}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Seleccionar guía madre" /></SelectTrigger>
                  <SelectContent>
                    {masterAwbs.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.awbNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pt-4">Detalle de carga</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bultos (pieces)</Label>
              <Input type="number" min={0} value={form.pieces} onChange={(e) => set("pieces", e.target.value)} placeholder="Cantidad" className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Peso (Kg)</Label>
              <Input type="number" min={0} step="0.01" value={form.weightKg} onChange={(e) => set("weightKg", e.target.value)} placeholder="Peso" className="bg-secondary border-border" />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pt-4">Intervinientes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Remitente (Shipper)</Label>
              <Input value={form.shipper} onChange={(e) => set("shipper", e.target.value)} placeholder="Remitente" className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Destinatario (Consignee)</Label>
              <Input value={form.consignee} onChange={(e) => set("consignee", e.target.value)} placeholder="Destinatario" className="bg-secondary border-border" />
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
