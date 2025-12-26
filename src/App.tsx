import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Library from "./pages/Library";
import Upload from "./pages/Upload";
import Profile from "./pages/Profile";
import LikedSongs from "./pages/LikedSongs";
import RecentlyPlayed from "./pages/RecentlyPlayed";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PlaylistPage from "./pages/Playlist";
import Artist from "./pages/Artist";
import DJ from "./pages/DJ";
import YearlyRecap from "./pages/YearlyRecap";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PlayerProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route
                  path="/library"
                  element={
                    <ProtectedRoute>
                      <Library />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/upload"
                  element={
                    <ProtectedRoute>
                      <Upload />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/liked"
                  element={
                    <ProtectedRoute>
                      <LikedSongs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recent"
                  element={
                    <ProtectedRoute>
                      <RecentlyPlayed />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/playlist/:id"
                  element={
                    <ProtectedRoute>
                      <PlaylistPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/artist/:name" element={<Artist />} />
                <Route path="/dj" element={<DJ />} />
                <Route path="/recap" element={<YearlyRecap />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PlayerProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
