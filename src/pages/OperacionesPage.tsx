import { useState, useEffect } from "react";
import { useAWBStore } from "@/stores/awbStore";
import { StatusBadge } from "@/components/awb/StatusBadge";
import { OpTypeBadge } from "@/components/awb/OpTypeBadge";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OperacionesPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const { awbs, fetchAWBs } = useAWBStore();

  useEffect(() => { fetchAWBs(); }, []);

  const filtered = awbs.filter((awb) => {
    const matchSearch =
      awb.awbNumber.toLowerCase().includes(search.toLowerCase()) ||
      (awb.customer?.companyName || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "ALL" || awb.operationType === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Operaciones</h1>
        <Button className="gradient-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> Nueva Guía
        </Button>
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por AWB o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40 bg-secondary border-border">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas</SelectItem>
            <SelectItem value="IMPO">Importación</SelectItem>
            <SelectItem value="EXPO">Exportación</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card overflow-hidden"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border bg-secondary/30">
              <th className="text-left p-4 font-medium">AWB</th>
              <th className="text-left p-4 font-medium">Cliente</th>
              <th className="text-left p-4 font-medium">Tipo</th>
              <th className="text-left p-4 font-medium">Aerolínea</th>
              <th className="text-left p-4 font-medium">Ruta</th>
              <th className="text-left p-4 font-medium">Estado</th>
              <th className="text-left p-4 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((awb, i) => (
              <motion.tr
                key={awb.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/awbs/${awb.id}`)}
                className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors"
              >
                <td className="p-4 font-mono font-semibold text-foreground">{awb.awbNumber}</td>
                <td className="p-4 text-muted-foreground">{awb.customer?.companyName || "-"}</td>
                <td className="p-4"><OpTypeBadge type={awb.operationType} /></td>
                <td className="p-4 text-muted-foreground">{awb.airline}</td>
                <td className="p-4 text-muted-foreground">{awb.origin} → {awb.destination}</td>
                <td className="p-4"><StatusBadge status={awb.status} /></td>
                <td className="p-4 text-xs text-muted-foreground">{awb.arrivalOrDepartureDate || "—"}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">No se encontraron operaciones.</div>
        )}
      </motion.div>
    </div>
  );
};

export default OperacionesPage;
