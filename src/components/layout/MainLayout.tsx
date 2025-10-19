import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Player from "./Player";

const MainLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
      <Player />
    </div>
  );
};

export default MainLayout;
