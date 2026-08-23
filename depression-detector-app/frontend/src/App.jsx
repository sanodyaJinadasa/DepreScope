import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Predict from "./pages/Predict";
import BiasProbeLab from "./pages/BiasProbeLab";
import ModelCharts from "./pages/ModelCharts";
import About from "./pages/About";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/compare" element={<BiasProbeLab />} />
            <Route path="/charts" element={<ModelCharts />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
