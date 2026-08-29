import { useState } from "react";
import { Outlet } from "react-router";
import { TopBar } from "./TopBar";
import { EditModeProvider } from "../contexts/EditModeContext";

export function AdminLayout() {
  return (
    <EditModeProvider>
      <AdminLayoutInner />
    </EditModeProvider>
  );
}

function AdminLayoutInner() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <TopBar
        onMobileMenuToggle={() => setMobileMenuOpen(v => !v)}
        isMobileMenuOpen={mobileMenuOpen}
      />
      <div className="pt-14">
        <Outlet />
      </div>
    </div>
  );
}
