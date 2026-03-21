import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./contexts/AuthContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import TermsGuard from "./components/auth/TermsGuard";
import MainLayout from "./components/layout/MainLayout";
import Terms from "./pages/Terms";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Albums from "./pages/Albums";
import Album from "./pages/Album";
import Library from "./pages/Library";
import Upload from "./pages/Upload";
import Profile from "./pages/Profile";
import LikedSongs from "./pages/LikedSongs";
import LikedAlbums from "./pages/LikedAlbums";
import RecentlyPlayed from "./pages/RecentlyPlayed";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PlaylistPage from "./pages/Playlist";
import Artist from "./pages/Artist";
import DJ from "./pages/DJ";
import YearlyRecap from "./pages/YearlyRecap";
import Admin from "./pages/Admin";
import Welcome from "./pages/Welcome";
import Settings from "./pages/Settings";
import Explore from "./pages/Explore";
import Radio from "./pages/Radio";
import Podcasts from "./pages/Podcasts";
import Live from "./pages/Live";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <AuthProvider>
          <PlayerProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <TermsGuard>
                  <Routes>
                    <Route path="/" element={<Welcome />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route element={<MainLayout />}>
                    <Route path="/home" element={<Home />} />
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
                      path="/liked-albums"
                      element={
                        <ProtectedRoute>
                          <LikedAlbums />
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
                    <Route path="/albums" element={<Albums />} />
                    <Route path="/album/:id" element={<Album />} />
                    <Route path="/dj" element={<DJ />} />
                    <Route path="/recap" element={<YearlyRecap />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/radio" element={<Radio />} />
                    <Route path="/podcasts" element={<Podcasts />} />
                    <Route path="/live" element={<Live />} />
                  </Route>
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </TermsGuard>
              </BrowserRouter>
            </TooltipProvider>
          </PlayerProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
