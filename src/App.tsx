import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SoundProvider } from "@/contexts/SoundContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "sonner";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

// Lazy load pages for code splitting
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const LoginPage = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const StudySession = lazy(() => import("@/pages/StudySession"));
const DeckDetail = lazy(() => import("@/pages/DeckDetail"));
const AddCardsPage = lazy(() => import("@/pages/AddCardsPage"));
const LibraryPage = lazy(() => import("@/pages/Library"));
const DemoPage = lazy(() => import("@/pages/DemoPage"));
const StorePage = lazy(() => import("@/pages/Store"));

// Simple loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

export default function App() {
  return (
    <SoundProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/demo" element={<DemoPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/study"
                  element={
                    <ProtectedRoute>
                      <AppLayout hideHeader hideFooter bgTheme="study">
                        <StudySession />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/study/:deckId"
                  element={
                    <ProtectedRoute>
                      <AppLayout hideHeader hideFooter bgTheme="study">
                        <StudySession />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/decks/:deckId"
                  element={
                    <ProtectedRoute>
                      <AppLayout hideHeader bgTheme="deck">
                        <DeckDetail />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/decks/:deckId/add"
                  element={
                    <ProtectedRoute>
                      <AppLayout hideHeader bgTheme="deck">
                        <AddCardsPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/library"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <LibraryPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/store"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <StorePage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <AudioPlayer />
            </Suspense>
          </BrowserRouter>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </QueryClientProvider>
    </SoundProvider>
  );
}
