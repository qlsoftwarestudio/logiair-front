import {
  LayoutDashboard,
  Plane,
  Users,
  Receipt,
  Bot,
  BarChart3,
  Settings,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, permission: "dashboard.view" },
  { title: "Guías AWB", url: "/awbs", icon: Plane, permission: "awbs.view" },
  { title: "Clientes", url: "/customers", icon: Users, permission: "customers.view" },
  { title: "Facturación", url: "/invoices", icon: Receipt, permission: "invoices.view" },
  { title: "IA Hub", url: "/ia-hub", icon: Bot, permission: "dashboard.view" },
  { title: "Reportes", url: "/reports", icon: BarChart3, permission: "reports.view" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { hasPermission } = useAuthStore();

  const visibleNav = mainNav.filter((item) => hasPermission(item.permission));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
          <Plane className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-sm font-bold text-sidebar-accent-foreground">LogiAir OS</h1>
            <p className="text-[10px] text-sidebar-foreground">SaaS Logístico</p>
          </div>
        )}
      </div>

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-primary font-semibold"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                      {!collapsed && item.title === "IA Hub" && (
                        <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded gradient-success text-success-foreground font-bold">
                          NEW
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {hasPermission("config.view") && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/configuracion"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  activeClassName="bg-sidebar-accent text-primary font-semibold"
                >
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="text-sm">Configuración</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
