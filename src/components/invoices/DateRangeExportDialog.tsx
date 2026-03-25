import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, FileText, BarChart3, Download, Loader2, AlertCircle } from "lucide-react";
import { format, subMonths, differenceInDays, differenceInCalendarMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { invoiceService } from "@/services/invoiceService";

interface ValidationError {
  field: string;
  message: string;
}

export function DateRangeExportDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const today = format(new Date(), "yyyy-MM-dd");
  const lastMonth = format(subMonths(new Date(), 1), "yyyy-MM-dd");

  const [startDate, setStartDate] = useState(lastMonth);
  const [endDate, setEndDate] = useState(today);
  const [customerId, setCustomerId] = useState("");
  const [includeCharts, setIncludeCharts] = useState(false);
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf">("excel");

  const validate = (): boolean => {
    const newErrors: ValidationError[] = [];

    if (!startDate) {
      newErrors.push({ field: "startDate", message: "La fecha de inicio es requerida" });
    }
    if (!endDate) {
      newErrors.push({ field: "endDate", message: "La fecha de fin es requerida" });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        newErrors.push({ field: "endDate", message: "La fecha fin debe ser posterior a la fecha inicio" });
      }

      if (end > new Date()) {
        newErrors.push({ field: "endDate", message: "La fecha fin no puede ser futura" });
      }

      const daysDiff = differenceInDays(end, start);
      if (daysDiff > 365) {
        newErrors.push({
          field: "range",
          message: "El rango de fechas no puede ser mayor a 1 año. Para reportes más extensos, usá múltiples exportaciones.",
        });
      }
    }

    if (customerId && (isNaN(Number(customerId)) || Number(customerId) <= 0)) {
      newErrors.push({ field: "customerId", message: "El ID de cliente debe ser un número válido" });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const getFieldError = (field: string) => errors.find((e) => e.field === field)?.message;

  const handleExport = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const blob = await invoiceService.exportDateRange({
        startDate,
        endDate,
        customerId: customerId || undefined,
        includeCharts,
        format: exportFormat,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const fmtStart = startDate.replace(/-/g, "-");
      const fmtEnd = endDate.replace(/-/g, "-");
      const customerSuffix = customerId ? `_Cliente_${customerId}` : "";
      const chartsSuffix = includeCharts ? "_ConGraficos" : "";
      const ext = exportFormat === "excel" ? "xlsx" : "pdf";

      a.download = `Facturas_${fmtStart}_a_${fmtEnd}${customerSuffix}${chartsSuffix}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: "Reporte exportado", description: `Archivo descargado exitosamente` });
      setOpen(false);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Error al exportar";
      toast({ title: "Error al exportar", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: "lastMonth" | "lastQuarter" | "lastSemester") => {
    const now = new Date();
    setEndDate(format(now, "yyyy-MM-dd"));
    switch (preset) {
      case "lastMonth":
        setStartDate(format(subMonths(now, 1), "yyyy-MM-dd"));
        break;
      case "lastQuarter":
        setStartDate(format(subMonths(now, 3), "yyyy-MM-dd"));
        break;
      case "lastSemester":
        setStartDate(format(subMonths(now, 6), "yyyy-MM-dd"));
        break;
    }
    setErrors([]);
  };

  const rangeDays = startDate && endDate ? differenceInDays(new Date(endDate), new Date(startDate)) : 0;
  const rangeMonths = startDate && endDate ? differenceInCalendarMonths(new Date(endDate), new Date(startDate)) : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" /> Exportar por fechas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Exportación por Rango de Fechas
          </DialogTitle>
          <DialogDescription>
            Generá un reporte de facturas para el período seleccionado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Presets rápidos */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => applyPreset("lastMonth")} className="text-xs">
              Último mes
            </Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset("lastQuarter")} className="text-xs">
              Último trimestre
            </Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset("lastSemester")} className="text-xs">
              Último semestre
            </Button>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Fecha inicio</Label>
              <Input
                type="date"
                value={startDate}
                max={today}
                onChange={(e) => { setStartDate(e.target.value); setErrors([]); }}
                className="bg-secondary border-border"
              />
              {getFieldError("startDate") && (
                <p className="text-xs text-destructive">{getFieldError("startDate")}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Fecha fin</Label>
              <Input
                type="date"
                value={endDate}
                max={today}
                min={startDate}
                onChange={(e) => { setEndDate(e.target.value); setErrors([]); }}
                className="bg-secondary border-border"
              />
              {getFieldError("endDate") && (
                <p className="text-xs text-destructive">{getFieldError("endDate")}</p>
              )}
            </div>
          </div>

          {getFieldError("range") && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {getFieldError("range")}
            </div>
          )}

          {/* Info del rango */}
          {startDate && endDate && rangeDays > 0 && !getFieldError("range") && (
            <p className="text-xs text-muted-foreground">
              Período: {rangeDays} días ({rangeMonths > 0 ? `${rangeMonths} mes${rangeMonths > 1 ? "es" : ""}` : "menos de 1 mes"})
            </p>
          )}

          {/* Cliente opcional */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">ID Cliente (opcional)</Label>
            <Input
              type="number"
              value={customerId}
              onChange={(e) => { setCustomerId(e.target.value); setErrors([]); }}
              placeholder="Ej: 123 — Dejá vacío para todos"
              className="bg-secondary border-border"
              min={1}
            />
            {getFieldError("customerId") && (
              <p className="text-xs text-destructive">{getFieldError("customerId")}</p>
            )}
          </div>

          {/* Formato */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Formato</Label>
            <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as "excel" | "pdf")}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                <SelectItem value="pdf">PDF (.pdf)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Incluir gráficos */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Incluir gráficos</p>
                <p className="text-xs text-muted-foreground">Análisis visual y distribución (solo Excel)</p>
              </div>
            </div>
            <Switch
              checked={includeCharts}
              onCheckedChange={setIncludeCharts}
              disabled={exportFormat === "pdf"}
            />
          </div>

          {/* Características */}
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
            <h4 className="text-xs font-semibold text-primary mb-1.5 flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5" />
              Características del reporte
            </h4>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li>• Resumen estadístico (promedios, totales)</li>
              <li>• Días transcurridos por factura</li>
              <li>• Facturas pendientes resaltadas</li>
              {includeCharts && exportFormat === "excel" && (
                <li>• Top 5 clientes por volumen con gráficos</li>
              )}
            </ul>
          </div>

          {/* Acción */}
          <Button
            onClick={handleExport}
            disabled={loading || !startDate || !endDate}
            className="w-full gradient-primary text-primary-foreground gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exportar facturas
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
