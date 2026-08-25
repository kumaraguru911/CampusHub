import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";

import Dashboard from "./pages/Dashboard";
import Buildings from "./pages/Buildings";
import Assets from "./pages/Assets";
import AssetDetail from "./pages/AssetDetail";

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

            {/* Asset Details */}
            <Route
              path="/assets/:assetId"
              element={<AssetDetail />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;