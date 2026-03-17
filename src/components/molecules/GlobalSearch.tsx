import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plane, Building2, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAWBStore } from "@/stores/awbStore";
import { useCustomerStore } from "@/stores/customerStore";
import { useInvoiceStore } from "@/stores/invoiceStore";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  const { awbs } = useAWBStore();
  const { customers } = useCustomerStore();
  const { invoices } = useInvoiceStore();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const q = query.toLowerCase().trim();
  const results = q.length < 2 ? [] : [
    ...awbs
      .filter((a) => a.awbNumber.toLowerCase().includes(q) || a.customer?.companyName?.toLowerCase().includes(q))
      .slice(0, 4)
      .map((a) => ({ id: a.id, label: a.awbNumber, sub: a.customer?.companyName || "", icon: Plane, path: `/awbs/${a.id}` })),
    ...customers
      .filter((c) => c.companyName.toLowerCase().includes(q) || c.taxId.includes(q))
      .slice(0, 4)
      .map((c) => ({ id: c.id, label: c.companyName, sub: c.taxId, icon: Building2, path: `/customers/${c.id}` })),
    ...invoices
      .filter((i) => i.invoiceNumber.toLowerCase().includes(q) || i.customer?.companyName?.toLowerCase().includes(q))
      .slice(0, 3)
      .map((i) => ({ id: i.id, label: i.invoiceNumber, sub: i.customer?.companyName || "", icon: FileText, path: `/invoices/${i.id}` })),
  ];

  return (
    <div ref={ref} className="relative hidden md:block">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar AWB, Cliente o Factura..."
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => query.length >= 2 && setOpen(true)}
        className="pl-9 w-80 bg-secondary border-border text-sm h-9"
      />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {results.map((r) => (
            <button
              key={r.path + r.id}
              onClick={() => { navigate(r.path); setOpen(false); setQuery(""); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-secondary/80 transition-colors"
            >
              <r.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{r.label}</p>
                <p className="text-xs text-muted-foreground truncate">{r.sub}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {open && q.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg p-4 z-50">
          <p className="text-sm text-muted-foreground text-center">Sin resultados</p>
        </div>
      )}
    </div>
  );
}
