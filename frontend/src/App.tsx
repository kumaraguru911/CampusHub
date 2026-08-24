import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-64">
        <Header />

        <Dashboard />
      </div>
    </div>
  );
}

export default App;