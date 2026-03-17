import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/templates/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";

// Auth pages
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import RecoverPage from "@/features/auth/RecoverPage";
import OnboardingPage from "@/features/auth/OnboardingPage";

// Feature pages
import DashboardPage from "@/features/dashboard/DashboardPage";
import AWBListPage from "@/features/awbs/AWBListPage";
import AWBCreatePage from "@/features/awbs/AWBCreatePage";
import AWBDetailPage from "@/features/awbs/AWBDetailPage";
import AWBEditPage from "@/features/awbs/AWBEditPage";
import CustomerListPage from "@/features/customers/CustomerListPage";
import CustomerCreatePage from "@/features/customers/CustomerCreatePage";
import CustomerDetailPage from "@/features/customers/CustomerDetailPage";
import CustomerEditPage from "@/features/customers/CustomerEditPage";
import InvoiceListPage from "@/features/invoices/InvoiceListPage";
import InvoiceCreatePage from "@/features/invoices/InvoiceCreatePage";
import InvoiceDetailPage from "@/features/invoices/InvoiceDetailPage";
import InvoiceEditPage from "@/features/invoices/InvoiceEditPage";
import ReportsPage from "@/features/reports/ReportsPage";
import ProfilePage from "@/features/profile/ProfilePage";
import ConfiguracionPage from "@/pages/ConfiguracionPage";
import IAHubPage from "@/pages/IAHubPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
          <Route path="/register" element={<AuthRedirect><RegisterPage /></AuthRedirect>} />
          <Route path="/recover" element={<AuthRedirect><RecoverPage /></AuthRedirect>} />
          <Route path="/onboarding" element={<AuthRedirect><OnboardingPage /></AuthRedirect>} />

          {/* Protected app routes */}
          <Route path="/" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
          <Route path="/awbs" element={<ProtectedRoute permission="awbs.view"><AppLayout><AWBListPage /></AppLayout></ProtectedRoute>} />
          <Route path="/awbs/new" element={<ProtectedRoute permission="awbs.create"><AppLayout><AWBCreatePage /></AppLayout></ProtectedRoute>} />
          <Route path="/awbs/:id" element={<ProtectedRoute permission="awbs.view"><AppLayout><AWBDetailPage /></AppLayout></ProtectedRoute>} />
          <Route path="/awbs/:id/edit" element={<ProtectedRoute permission="awbs.edit"><AppLayout><AWBEditPage /></AppLayout></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute permission="customers.view"><AppLayout><CustomerListPage /></AppLayout></ProtectedRoute>} />
          <Route path="/customers/new" element={<ProtectedRoute permission="customers.create"><AppLayout><CustomerCreatePage /></AppLayout></ProtectedRoute>} />
          <Route path="/customers/:id" element={<ProtectedRoute permission="customers.view"><AppLayout><CustomerDetailPage /></AppLayout></ProtectedRoute>} />
          <Route path="/customers/:id/edit" element={<ProtectedRoute permission="customers.edit"><AppLayout><CustomerEditPage /></AppLayout></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute permission="invoices.view"><AppLayout><InvoiceListPage /></AppLayout></ProtectedRoute>} />
          <Route path="/invoices/new" element={<ProtectedRoute permission="invoices.create"><AppLayout><InvoiceCreatePage /></AppLayout></ProtectedRoute>} />
          <Route path="/invoices/:id" element={<ProtectedRoute permission="invoices.view"><AppLayout><InvoiceDetailPage /></AppLayout></ProtectedRoute>} />
          <Route path="/invoices/:id/edit" element={<ProtectedRoute permission="invoices.edit"><AppLayout><InvoiceEditPage /></AppLayout></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute permission="reports.view"><AppLayout><ReportsPage /></AppLayout></ProtectedRoute>} />
          <Route path="/ia-hub" element={<ProtectedRoute><AppLayout><IAHubPage /></AppLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
          <Route path="/configuracion" element={<ProtectedRoute permission="config.view"><AppLayout><ConfiguracionPage /></AppLayout></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
