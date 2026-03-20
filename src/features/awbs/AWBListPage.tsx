import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAWBStore } from "@/stores/awbStore";
import { useAuthStore } from "@/stores/authStore";
import { motion } from "framer-motion";
import { Search, Plus, Plane } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_COLORS, STATUS_LABELS, AWB_STATUSES } from "@/constants/awbStatuses";
import { AppBreadcrumb } from "@/components/molecules/AppBreadcrumb";
import { TablePagination } from "@/components/molecules/TablePagination";
import { EmptyState } from "@/components/molecules/EmptyState";
import { SortableHeader, type SortDir, toggleSort, useSort } from "@/components/molecules/SortableHeader";

export default function AWBListPage() {
  const { awbs, loading, fetchAWBs } = useAWBStore();
  const { hasPermission } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const { sortData } = useSort(awbs);

  useEffect(() => { fetchAWBs(); }, []);

  const filtered = awbs.filter((a) => {
    const matchSearch = !search ||
      a.awbNumber.toLowerCase().includes(search.toLowerCase()) ||
      (a.customer?.companyName || "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || a.operationType === typeFilter;
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const sorted = sortData(filtered, sortField, sortDir);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (field: string) => {
    const result = toggleSort(field, sortField, sortDir);
    setSortField(result.field);
    setSortDir(result.dir);
  };

  const statusColors = (status: string) => STATUS_COLORS[status] || { bg: "bg-muted", text: "text-muted-foreground" };

  return (
    <div className="space-y-6">
      <AppBreadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Guías Aéreas" }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Guías Aéreas (AWB)</h1>
          <p className="text-sm text-muted-foreground">{awbs.length} operaciones registradas</p>
        </div>
        {hasPermission("awbs.create") && (
          <Button onClick={() => navigate("/awbs/new")} className="gradient-primary text-primary-foreground gap-2">
            <Plus className="h-4 w-4" /> Nueva Guía
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar AWB o cliente..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 bg-secondary border-border" />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40 bg-secondary border-border"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="IMPO">Importación</SelectItem>
            <SelectItem value="EXPO">Exportación</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-52 bg-secondary border-border"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {AWB_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Plane}
            title="No se encontraron guías"
            description={search || typeFilter !== "all" || statusFilter !== "all" ? "Probá ajustando los filtros de búsqueda" : "Creá tu primera guía aérea para empezar"}
            actionLabel={hasPermission("awbs.create") ? "Nueva Guía" : undefined}
            onAction={hasPermission("awbs.create") ? () => navigate("/awbs/new") : undefined}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <SortableHeader label="AWB" field="awbNumber" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ruta</th>
                    <SortableHeader label="Aerolínea" field="airline" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                    <SortableHeader label="Estado" field="status" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                    <SortableHeader label="Fecha" field="createdAt" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((awb, i) => {
                    const sc = statusColors(awb.status);
                    return (
                      <motion.tr
                        key={awb.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => navigate(`/awbs/${awb.id}`)}
                        className="border-b border-border/50 hover:bg-secondary/50 cursor-pointer transition-colors"
                      >
                        <td className="p-4"><span className="font-mono font-semibold text-foreground">{awb.awbNumber}</span></td>
                        <td className="p-4 text-sm text-foreground">{awb.customer?.companyName || "-"}</td>
                        <td className="p-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${awb.operationType?.toUpperCase() === "IMPO" ? "bg-primary/15 text-primary" : "bg-chart-4/15 text-chart-4"}`}>
                            {awb.operationType?.toUpperCase() === "IMPO" ? "IMPO" : "EXPO"}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-mono text-muted-foreground">{awb.origin} → {awb.destination}</td>
                        <td className="p-4 text-sm text-muted-foreground">{awb.airline}</td>
                        <td className="p-4"><span className={`status-badge ${sc.bg} ${sc.text}`}>{STATUS_LABELS[awb.status as keyof typeof STATUS_LABELS] || awb.status}</span></td>
                        <td className="p-4 text-sm text-muted-foreground">{awb.createdAt}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={setPageSize} />
          </>
        )}
      </div>
    </div>
  );
}
