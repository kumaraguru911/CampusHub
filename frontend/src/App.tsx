import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";

import Dashboard from "./pages/Dashboard";
import Buildings from "./pages/Buildings";
import Assets from "./pages/Assets";
import BuildingDetail from "./pages/BuildingDetail";
import AssetDetail from "./pages/AssetDetail";
import RoomDetail from "./pages/RoomDetail";
import Monitoring from "./pages/Monitoring";
import Alerts from "./pages/Alerts";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <div className="ml-64">
          <Header />

          <Routes>
            {/* Dashboard */}
            <Route
              path="/"
              element={<Dashboard />}
            />

            {/* Buildings */}
            <Route
              path="/buildings"
              element={<Buildings />}
            />

            {/* Assets */}
            <Route
              path="/assets"
              element={<Assets />}
            />
            <Route
  path="/buildings/:buildingId"
  element={<BuildingDetail />}
/>
            {/* Asset Details */}
            <Route
              path="/assets/:assetId"
              element={<AssetDetail />}
            />
            <Route
  path="/rooms/:roomId"
  element={<RoomDetail />}
/>
            <Route
  path="/monitoring"
  element={<Monitoring />}
/>

<Route
  path="/alerts"
  element={<Alerts />}
/>
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;