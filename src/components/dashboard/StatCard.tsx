import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  badge?: string;
  badgeVariant?: "success" | "warning" | "danger" | "info";
  delay?: number;
}

const badgeStyles = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
  info: "text-primary",
};

export function StatCard({ title, value, badge, badgeVariant = "info", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card p-5"
    >
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
      <div className="flex items-end justify-between mt-2">
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {badge && (
          <span className={`text-xs font-semibold ${badgeStyles[badgeVariant]}`}>
            {badge}
          </span>
        )}
      </div>
    </motion.div>
  );
}
