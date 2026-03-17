import { useCustomerStore } from "@/stores/customerStore";
import { useAWBStore } from "@/stores/awbStore";
import { motion } from "framer-motion";
import { Users, Plus, Search, Building2, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const ClientesPage = () => {
  const [search, setSearch] = useState("");
  const { customers, fetchCustomers } = useCustomerStore();
  const { awbs, fetchAWBs } = useAWBStore();

  useEffect(() => { fetchCustomers(); fetchAWBs(); }, []);

  const filtered = customers.filter(
    (c) =>
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.taxId.includes(search)
  );

  const getOpsCount = (customerId: number) =>
    awbs.filter((a) => a.customer?.id === customerId).length;

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
        <Button className="gradient-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> Nuevo Cliente
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por empresa o CUIT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-secondary border-border"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((client, i) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
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
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3" /> {client.contactName}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" /> {client.contactEmail}
              </div>
              {client.contactPhone && <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" /> {client.contactPhone}
              </div>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ClientesPage;
