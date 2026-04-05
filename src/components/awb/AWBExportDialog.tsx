import { useState } from "react";
import { awbService } from "@/services/awbService";
import { useCustomerStore } from "@/stores/customerStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AWB_STATUSES, STATUS_LABELS } from "@/constants/awbStatuses";

interface AWBExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AWBExportDialog({ open, onOpenChange }: AWBExportDialogProps) {
  const { customers } = useCustomerStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerId, setCustomerId] = useState("all");
  const [awbType, setAwbType] = useState("all");
  const [status, setStatus] = useState("all");

  const handleExport = async () => {
    setLoading(true);
    try {
      const blob = await awbService.exportExcel({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        customerId: customerId !== "all" ? Number(customerId) : undefined,
        awbType: awbType !== "all" ? (awbType as "MASTER" | "HOUSE") : undefined,
        status: status !== "all" ? status : undefined,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const dateSuffix = startDate && endDate ? `_${startDate}_${endDate}` : "";
      a.download = `guias_aereas${dateSuffix}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: "Exportación exitosa", description: "El archivo Excel se descargó correctamente" });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error al exportar", description: err.response?.data?.message || err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Exportar Guías a Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Fecha desde</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Fecha hasta</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-secondary border-border" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Cliente</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clientes</SelectItem>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.companyName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Tipo de guía</Label>
              <Select value={awbType} onValueChange={setAwbType}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="MASTER">Master</SelectItem>
                  <SelectItem value="HOUSE">House</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Estado</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {AWB_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleExport} disabled={loading} className="gradient-primary text-primary-foreground gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {loading ? "Exportando..." : "Exportar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
