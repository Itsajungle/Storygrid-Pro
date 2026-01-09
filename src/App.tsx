
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ContentHub from "./pages/ContentHub";
import StoryGridApp from "./pages/StoryGridApp";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import SystemMonitor from "./pages/SystemMonitor";
import VideoLibrary from "./pages/VideoLibrary";
import RTEArticles from "./pages/RTEArticles";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ContentHub />
                </ProtectedRoute>
              }
            />
            <Route path="/app" element={<StoryGridApp />} />
            <Route
              path="/system-monitor"
              element={
                <ProtectedRoute>
                  <SystemMonitor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/video-library"
              element={
                <ProtectedRoute>
                  <VideoLibrary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rte-articles"
              element={
                <ProtectedRoute>
                  <RTEArticles />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
