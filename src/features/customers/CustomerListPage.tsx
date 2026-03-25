import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerStore } from "@/stores/customerStore";
import { useAuthStore } from "@/stores/authStore";
import { useAWBStore } from "@/stores/awbStore";
import { motion } from "framer-motion";
import { Search, Plus, Building2, Mail, Phone, Users, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppBreadcrumb } from "@/components/molecules/AppBreadcrumb";
import { TablePagination } from "@/components/molecules/TablePagination";
import { EmptyState } from "@/components/molecules/EmptyState";

export default function CustomerListPage() {
  const { customers, loading, fetchCustomers } = useCustomerStore();
  const { awbs, fetchAWBs } = useAWBStore();
  const { hasPermission } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => { fetchCustomers(); fetchAWBs(); }, []);

  const filtered = customers.filter(
    (c) => c.companyName.toLowerCase().includes(search.toLowerCase()) || c.taxId.includes(search)
  );

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const getOpsCount = (customerId: number) => awbs.filter((a) => a.customer?.id === customerId).length;

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Clientes" }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground">{customers.length} clientes registrados</p>
        </div>
        {hasPermission("customers.create") && (
          <Button onClick={() => navigate("/customers/new")} className="gradient-primary text-primary-foreground gap-2">
            <Plus className="h-4 w-4" /> Nuevo Cliente
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por empresa o CUIT..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 bg-secondary border-border" />
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No se encontraron clientes"
          description={search ? "Probá ajustando la búsqueda" : "Registrá tu primer cliente para empezar"}
          actionLabel={hasPermission("customers.create") ? "Nuevo Cliente" : undefined}
          onAction={hasPermission("customers.create") ? () => navigate("/customers/new") : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((client, i) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/customers/${client.id}`)}
                className="glass-card p-5 hover:border-primary/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{client.companyName}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{client.taxId}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                    {getOpsCount(client.id)} ops
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="h-3 w-3" />{client.contactName}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{client.contactEmail}</div>
                  {client.contactPhone && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{client.contactPhone}</div>}
                </div>
                {(client.aiPreAlerts || client.aiPdfExtraction || client.aiAutoReports || client.aiBillingSuggestions) && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5">
                    <Bot className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-semibold text-primary">
                      {[client.aiPreAlerts, client.aiPdfExtraction, client.aiAutoReports, client.aiBillingSuggestions].filter(Boolean).length} IA activas
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          {filtered.length > pageSize && (
            <div className="glass-card">
              <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={setPageSize} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
