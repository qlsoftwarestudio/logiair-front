import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export type SortDir = "asc" | "desc" | null;

interface SortableHeaderProps {
  label: string;
  field: string;
  currentField: string | null;
  currentDir: SortDir;
  onSort: (field: string) => void;
  className?: string;
}

export function SortableHeader({ label, field, currentField, currentDir, onSort, className = "" }: SortableHeaderProps) {
  const active = currentField === field;
  return (
    <th
      className={`text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors ${className}`}
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active && currentDir === "asc" && <ArrowUp className="h-3 w-3" />}
        {active && currentDir === "desc" && <ArrowDown className="h-3 w-3" />}
        {!active && <ArrowUpDown className="h-3 w-3 opacity-40" />}
      </span>
    </th>
  );
}

export function useSort<T>(data: T[]) {
  const sortData = (items: T[], field: string | null, dir: SortDir): T[] => {
    if (!field || !dir) return items;
    return [...items].sort((a, b) => {
      const va = (a as any)[field];
      const vb = (b as any)[field];
      if (va == null) return 1;
      if (vb == null) return -1;
      const cmp = typeof va === "string" ? va.localeCompare(vb) : va - vb;
      return dir === "asc" ? cmp : -cmp;
    });
  };
  return { sortData };
}

export function toggleSort(field: string, currentField: string | null, currentDir: SortDir): { field: string; dir: SortDir } {
  if (currentField !== field) return { field, dir: "asc" };
  if (currentDir === "asc") return { field, dir: "desc" };
  return { field: field, dir: null };
}
