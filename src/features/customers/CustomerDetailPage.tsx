import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCustomerStore } from "@/stores/customerStore";
import { useAWBStore } from "@/stores/awbStore";
import { useAuthStore } from "@/stores/authStore";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Trash2, Building2, Mail, Phone, Users, Calendar } from "lucide-react";
import { CustomerAIHub } from "@/components/customers/CustomerAIHub";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { STATUS_COLORS, STATUS_LABELS } from "@/constants/awbStatuses";
import { useState } from "react";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentCustomer: customer, loading, fetchCustomer, deleteCustomer, updateCustomer, updateAIConfig, clearCurrent } = useCustomerStore();
  const { awbs, fetchAWBs } = useAWBStore();
  const { hasPermission } = useAuthStore();
  const { toast } = useToast();
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (id) fetchCustomer(id);
    fetchAWBs();
    return () => clearCurrent();
  }, [id]);

  if (loading || !customer) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Cargando...</div>;
  }

  const clientAWBs = awbs.filter((a) => a.customer?.id === customer.id);

  const handleDelete = async () => {
    try {
      await deleteCustomer(customer.id);
      toast({ title: "Cliente eliminado" });
      navigate("/customers");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/customers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{customer.companyName}</h1>
              <p className="text-sm text-muted-foreground font-mono">{customer.taxId}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {hasPermission("customers.edit") && (
            <Button variant="outline" onClick={() => navigate(`/customers/${customer.id}/edit`)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {hasPermission("customers.delete") && (
            <Button variant="outline" className="text-destructive" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contacto</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-foreground"><Users className="h-4 w-4 text-muted-foreground" />{customer.contactName}</div>
            <div className="flex items-center gap-2 text-sm text-foreground"><Mail className="h-4 w-4 text-muted-foreground" />{customer.contactEmail}</div>
            {customer.contactPhone && <div className="flex items-center gap-2 text-sm text-foreground"><Phone className="h-4 w-4 text-muted-foreground" />{customer.contactPhone}</div>}
          </div>
        </div>
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operaciones</h3>
          <p className="text-3xl font-bold text-foreground">{clientAWBs.length}</p>
          <p className="text-sm text-muted-foreground">guías registradas</p>
        </div>
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registrado</h3>
          <div className="flex items-center gap-2 text-sm text-foreground"><Calendar className="h-4 w-4 text-muted-foreground" />{customer.createdAt}</div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Historial de operaciones</h3>
        {clientAWBs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Sin operaciones registradas</p>
        ) : (
          <div className="space-y-2">
            {clientAWBs.map((awb) => {
              const sc = STATUS_COLORS[awb.status] || { bg: "bg-muted", text: "text-muted-foreground" };
              return (
                <div
                  key={awb.id}
                  onClick={() => navigate(`/awbs/${awb.id}`)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-sm text-foreground">{awb.awbNumber}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${awb.operationType === "IMPO" ? "bg-primary/15 text-primary" : "bg-chart-4/15 text-chart-4"}`}>
                      {awb.operationType === "IMPO" ? "IMP" : "EXP"}
                    </span>
                  </div>
                  <span className={`status-badge ${sc.bg} ${sc.text}`}>{STATUS_LABELS[awb.status as keyof typeof STATUS_LABELS] || awb.status}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {hasPermission("customers.edit") && (
        <CustomerAIHub
          customer={customer}
          onUpdateAI={async (id, data) => { await updateAIConfig(id, data); }}
        />
      )}

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader><DialogTitle>¿Eliminar {customer.companyName}?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Se eliminarán todos los datos del cliente.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
