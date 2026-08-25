import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";

import Dashboard from "./pages/Dashboard";
import AssetDetail from "./pages/AssetDetail";
import Assets from "./pages/Assets";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <div className="ml-64">
          <Header />

          <Routes>
            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/assets/:assetId"
              element={<AssetDetail />}
            />

            <Route
  path="/assets"
  element={<Assets />}
/>
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;