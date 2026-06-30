import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import DevToolsGuard from "./components/DevToolsGuard";
import KeyAuthDashboard from "./pages/KeyAuthDashboard";
import SellerDetailPage from "./pages/SellerDetailPage";
import AppDetailPage from "./pages/AppDetailPage";
import LoginPage from "./pages/LoginPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Redirect to="/login" />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/keyauth">
        <ProtectedRoute>
          <KeyAuthDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/keyauth/app/:appId">
        <ProtectedRoute>
          <AppDetailPage />
        </ProtectedRoute>
      </Route>
      <Route path="/keyauth/seller/:sellerId">
        <ProtectedRoute>
          <SellerDetailPage />
        </ProtectedRoute>
      </Route>
      <Route path="/">
        <Redirect to="/keyauth" />
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <DevToolsGuard>
              <Router />
            </DevToolsGuard>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
