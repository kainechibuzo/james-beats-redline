import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Player from "./Player";
import { useIsMobile } from "@/hooks/use-mobile";

const MainLayout = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className={isMobile ? "p-4 pt-16" : "p-8"}>
          <Outlet />
        </div>
      </main>
      <Player />
    </div>
  );
};

export default MainLayout;
