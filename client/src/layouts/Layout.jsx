import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { DashboardNavbar, Footer, SidebarMenu, Breadcrumb } from "@/components";
import routes from "@/routes/routes";

function Layout() {
  const [isChecked, setIsChecked] = useState(false);
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200">
      <input
        id="my-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={isChecked}
        onChange={() => setIsChecked(!isChecked)}
      />

      {/* AREA KONTEN UTAMA */}
      <div className="drawer-content flex flex-col min-h-screen">
        <DashboardNavbar setIsChecked={setIsChecked} />

        {/* Margin & padding dibuat breathable */}
        <main className="flex-grow px-4 md:px-6 pb-6 space-y-4">
          {/* Breadcrumb hanya untuk mobile di bawah navbar */}
          <Breadcrumb className="md:hidden bg-base-100 p-3 rounded-xl border border-base-300/50 shadow-sm" />
          <Outlet />
        </main>

        <Footer />
      </div>

      {/* AREA SIDEBAR */}
      <div className="drawer-side z-30">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>

        {/* Menggunakan pewarnaan berbasis tema token v4 */}
        <div className="bg-base-100">
          <div className="bg-gradient-to-r from-primary/10 via-base-100 to-base-100 text-base-content min-h-screen lg:min-h-[calc(100vh-24px)] lg:my-3 lg:ml-4 w-64 lg:rounded-2xl border-r lg:border border-base-300/70 p-4 flex flex-col shadow-sm">
            {/* Branding */}
            <div className="flex items-center gap-2 px-3 py-4 mb-4 border-b border-base-200">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-content font-bold text-lg">
                +
              </div>
              <span className="font-bold text-base tracking-tight">
                Rekam Medis
              </span>
            </div>

            {/* Navigasi List */}
            <ul className="menu menu-md w-full p-0 grow gap-1">
              {SidebarMenu(routes, setIsChecked, currentPath)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
