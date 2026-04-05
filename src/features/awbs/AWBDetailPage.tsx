import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAWBStore } from "@/stores/awbStore";
import { useAuthStore } from "@/stores/authStore";
import { awbService } from "@/services/awbService";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Trash2, ChevronRight, Plane, Calendar, FileText, Package, Weight, Users, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AWB_WORKFLOW, STATUS_COLORS, STATUS_LABELS, AWB_TRANSITIONS } from "@/constants/awbStatuses";
import { AWBTypeBadge } from "@/components/awb/AWBTypeBadge";
import type { AWBStatus, AirWaybill } from "@/lib/types";

export default function AWBDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentAWB: awb, loading, fetchAWB, updateStatus, deleteAWB, clearCurrent } = useAWBStore();
  const { hasPermission } = useAuthStore();
  const { toast } = useToast();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusObs, setStatusObs] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [childAwbs, setChildAwbs] = useState<AirWaybill[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);

  useEffect(() => {
    if (id) fetchAWB(id);
    return () => clearCurrent();
  }, [id]);

  useEffect(() => {
    if (awb?.awbType === "MASTER") {
      setLoadingChildren(true);
      awbService.getChildren(awb.id)
        .then(setChildAwbs)
        .catch(() => setChildAwbs(awb.childAwbs || []))
        .finally(() => setLoadingChildren(false));
    }
  }, [awb?.id, awb?.awbType]);

  if (loading || !awb) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando...</div>;
  }

  const states = AWB_WORKFLOW;
  const currentIdx = states.indexOf(awb.status as any);

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    try {
      await updateStatus(awb.id, newStatus as AWBStatus, statusObs || undefined);
      toast({ title: "Estado actualizado", description: `Nuevo estado: ${STATUS_LABELS[newStatus as AWBStatus] || newStatus}` });
      setShowStatusModal(false);
      setNewStatus("");
      setStatusObs("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAWB(awb.id);
      toast({ title: "Guía eliminada" });
      navigate("/awbs");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/awbs")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground font-mono">{awb.awbNumber}</h1>
              <AWBTypeBadge type={awb.awbType} />
            </div>
            <p className="text-sm text-muted-foreground">{awb.customer?.companyName} · {awb.operationType === "IMPO" ? "Importación" : "Exportación"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {hasPermission("awbs.status") && (AWB_TRANSITIONS[awb.status as AWBStatus] || []).length > 0 && (
            <Button onClick={() => setShowStatusModal(true)} className="gradient-primary text-primary-foreground gap-2">
              <ChevronRight className="h-4 w-4" /> Avanzar estado
            </Button>
          )}
          {hasPermission("awbs.edit") && (
            <Button variant="outline" onClick={() => navigate(`/awbs/${awb.id}/edit`)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {hasPermission("awbs.delete") && (
            <Button variant="outline" className="text-destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ruta</h3>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-lg font-bold font-mono text-foreground">{awb.origin}</p>
              <p className="text-xs text-muted-foreground">Origen</p>
            </div>
            <Plane className="h-4 w-4 text-primary mx-2" />
            <div className="text-center">
              <p className="text-lg font-bold font-mono text-foreground">{awb.destination}</p>
              <p className="text-xs text-muted-foreground">Destino</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{awb.airline}</p>
        </div>
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fechas</h3>
          <div className="space-y-2">
            {awb.arrivalOrDepartureDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-foreground">{awb.operationType === "IMPO" ? "Llegada" : "Salida"}: {awb.arrivalOrDepartureDate}</span>
              </div>
            )}
            {awb.manifestNumber && <div className="flex items-center gap-2 text-sm"><FileText className="h-3 w-3 text-muted-foreground" /><span className="text-foreground font-mono">{awb.manifestNumber}</span></div>}
          </div>
        </div>
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado actual</h3>
          {(() => {
            const sc = STATUS_COLORS[awb.status] || { bg: "bg-muted", text: "text-muted-foreground" };
            return <span className={`status-badge text-sm ${sc.bg} ${sc.text}`}>{STATUS_LABELS[awb.status] || awb.status}</span>;
          })()}
          {awb.observations && <p className="text-sm text-muted-foreground">{awb.observations}</p>}
        </div>
      </div>

      {/* Cargo & Participants */}
      {(awb.pieces != null || awb.weightKg != null || awb.shipper || awb.consignee) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(awb.pieces != null || awb.weightKg != null) && (
            <div className="glass-card p-5 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detalle de carga</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Bultos</p>
                    <p className="text-lg font-bold text-foreground">{awb.pieces ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Peso (Kg)</p>
                    <p className="text-lg font-bold text-foreground">{awb.weightKg != null ? awb.weightKg.toLocaleString("es-AR", { maximumFractionDigits: 2 }) : "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {(awb.shipper || awb.consignee) && (
            <div className="glass-card p-5 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Intervinientes</h3>
              <div className="space-y-2">
                {awb.shipper && (
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Remitente</p>
                      <p className="text-sm font-medium text-foreground">{awb.shipper}</p>
                    </div>
                  </div>
                )}
                {awb.consignee && (
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Destinatario</p>
                      <p className="text-sm font-medium text-foreground">{awb.consignee}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hierarchy: Parent link for HOUSE */}
      {awb.awbType === "HOUSE" && awb.parentAwbId && (
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <GitBranch className="h-4 w-4" /> Jerarquía
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Guía madre:</span>
            <Link to={`/awbs/${awb.parentAwbId}`} className="text-sm font-mono font-semibold text-primary hover:underline">
              {awb.parentAwbNumber || `#${awb.parentAwbId}`}
            </Link>
          </div>
        </div>
      )}

      {/* Hierarchy: Children table for MASTER */}
      {awb.awbType === "MASTER" && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <GitBranch className="h-4 w-4" /> Guías Hijas ({childAwbs.length})
          </h3>
          {loadingChildren ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : childAwbs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay guías hijas asociadas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">AWB</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Cliente</th>
                    <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase">Bultos</th>
                    <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase">Peso Kg</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {childAwbs.map((child) => {
                    const sc = STATUS_COLORS[child.status] || { bg: "bg-muted", text: "text-muted-foreground" };
                    return (
                      <tr
                        key={child.id}
                        onClick={() => navigate(`/awbs/${child.id}`)}
                        className="border-b border-border/30 hover:bg-secondary/50 cursor-pointer transition-colors"
                      >
                        <td className="p-3 font-mono font-semibold text-sm text-foreground">{child.awbNumber}</td>
                        <td className="p-3 text-sm text-foreground">{child.customer?.companyName || "—"}</td>
                        <td className="p-3 text-sm text-right text-muted-foreground">{child.pieces ?? "—"}</td>
                        <td className="p-3 text-sm text-right text-muted-foreground">{child.weightKg != null ? child.weightKg.toLocaleString("es-AR", { maximumFractionDigits: 2 }) : "—"}</td>
                        <td className="p-3"><span className={`status-badge text-xs ${sc.bg} ${sc.text}`}>{STATUS_LABELS[child.status] || child.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">Timeline operativo</h3>
        <div className="relative">
          {states.map((state, i) => {
            const isCompleted = i <= currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <motion.div
                key={state}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4 pb-6 last:pb-0"
              >
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    isCompleted ? "border-success bg-success" :
                    "border-border bg-secondary"
                  }`} />
                  {i < states.length - 1 && (
                    <div className={`w-0.5 flex-1 mt-1 ${isCompleted ? "bg-success/50" : "bg-border"}`} />
                  )}
                </div>
                <div className={`flex-1 pb-2 ${!isCompleted ? "opacity-40" : ""}`}>
                  <p className={`text-sm font-semibold ${isCurrent ? "text-primary" : "text-foreground"}`}>{STATUS_LABELS[state] || state}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Status update modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar estado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nuevo estado</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                <SelectContent>
                  {(AWB_TRANSITIONS[awb.status as AWBStatus] || []).map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s] || s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Observaciones</label>
              <Textarea value={statusObs} onChange={(e) => setStatusObs(e.target.value)} placeholder="Opcional..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>Cancelar</Button>
            <Button onClick={handleStatusUpdate} disabled={!newStatus} className="gradient-primary text-primary-foreground">Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar guía {awb.awbNumber}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
