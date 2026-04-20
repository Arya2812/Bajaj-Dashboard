import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/pages/Dashboard";
import Retailers from "@/pages/Retailers";
import Form from "@/pages/Form";
import Environment from "@/pages/Environment";
import Agent from "@/pages/Agent";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen" style={{ background: "#EBEFF5" }}>
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64 min-h-screen overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/retailers" element={<Retailers />} />
            <Route path="/form" element={<Form />} />
            <Route path="/environment" element={<Environment />} />
            <Route path="/agent" element={<Agent />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
