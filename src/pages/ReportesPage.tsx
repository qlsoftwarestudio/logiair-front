import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const monthlyData = [
  { month: "Jul", operaciones: 28 },
  { month: "Ago", operaciones: 35 },
  { month: "Sep", operaciones: 42 },
  { month: "Oct", operaciones: 38 },
  { month: "Nov", operaciones: 45 },
  { month: "Dic", operaciones: 52 },
];

const clientData = [
  { name: "TechCorp", value: 35 },
  { name: "Global Imports", value: 25 },
  { name: "Dist. Norte", value: 20 },
  { name: "AeroExpress", value: 12 },
  { name: "Otros", value: 8 },
];

const COLORS = ["hsl(210,100%,50%)", "hsl(142,71%,45%)", "hsl(38,92%,50%)", "hsl(280,65%,60%)", "hsl(220,20%,40%)"];

const ReportesPage = () => {
  return (
    <div className="space-y-6 max-w-[1200px]">
      <h1 className="text-2xl font-bold text-foreground">Reportes</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: BarChart3, label: "Operaciones este mes", value: "52", badge: "+15%" },
          { icon: Users, label: "Clientes activos", value: "18", badge: "+3" },
          { icon: DollarSign, label: "Facturación mensual", value: "$142,500", badge: "+15%" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-xl font-bold text-foreground">{item.value}</p>
              </div>
              <span className="ml-auto text-xs text-success font-semibold">{item.badge}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Operaciones por Mes</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,18%)" />
              <XAxis dataKey="month" stroke="hsl(215,15%,55%)" fontSize={12} />
              <YAxis stroke="hsl(215,15%,55%)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220,25%,14%)",
                  border: "1px solid hsl(220,20%,18%)",
                  borderRadius: "8px",
                  color: "hsl(210,20%,92%)",
                }}
              />
              <Bar dataKey="operaciones" fill="hsl(210,100%,50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Distribución por Cliente</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={clientData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                {clientData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220,25%,14%)",
                  border: "1px solid hsl(220,20%,18%)",
                  borderRadius: "8px",
                  color: "hsl(210,20%,92%)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {clientData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                {item.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportesPage;
