import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CarbonFootprintDisplay from "./CarbonFootprintDisplay";
export default function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Topbar />
        <Outlet />
      </main>
      <CarbonFootprintDisplay />
    </div>
  );
}
