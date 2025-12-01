
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import UsersAdmin from "./pages/admin/Users";
import AccessGroupsAdmin from "./pages/admin/AccessGroups";
import CompaniesAdmin from "./pages/admin/Companies";
import AuditLog from "./pages/admin/AuditLog";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredPermission="users.view"><UsersAdmin /></ProtectedRoute>} />
          <Route path="/admin/access-groups" element={<ProtectedRoute requiredPermission="access_groups.view"><AccessGroupsAdmin /></ProtectedRoute>} />
          <Route path="/admin/companies" element={<ProtectedRoute requiredPermission="companies.view"><CompaniesAdmin /></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute requiredPermission="system.logs"><AuditLog /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;