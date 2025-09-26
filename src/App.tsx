import { Outlet, useLocation } from "react-router";
import { ThemeProvider } from "./contexts/theme-context";
import { AuthProvider } from "./contexts/supabase-auth-context";
import { AuthModalProvider } from "./components/auth/AuthModalProvider";
import { Toaster } from "./components/ui/sonner";
import { AppLayout } from "./components/layout/app-layout";
import { MarketingLayout, shouldUseMarketingLayout } from "./components/layout/marketing-layout";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  const location = useLocation();
  const useMarketingLayout = shouldUseMarketingLayout(location.pathname);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AuthModalProvider>
            {useMarketingLayout ? (
              <MarketingLayout>
                <Outlet />
              </MarketingLayout>
            ) : (
              <AppLayout>
                <Outlet />
              </AppLayout>
            )}
            <Toaster richColors position="top-right" />
          </AuthModalProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
