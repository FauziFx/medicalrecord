import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { DashboardNavbar, Footer, SidebarMenu, Breadcrumb } from "@/components";
import routes from "@/routes/routes";

function Layout() {
  const [isChecked, setIsChecked] = React.useState(false);
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);
  return (
    <div className="drawer lg:drawer-open">
      <input
        id="my-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={isChecked}
        onChange={() => setIsChecked(!isChecked)}
      />
      <div className="drawer-content bg-gray-100">
        <DashboardNavbar setIsChecked={setIsChecked} />
        <main className="px-2 md:px-4 pb-4 min-h-[84vh]">
          <Breadcrumb className="md:hidden" />
          <Outlet />
        </main>
        <Footer />
      </div>
      <div className="drawer-side lg:bg-gray-100">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay bg-none"
        ></label>
        <ul className="menu bg-white text-base-content min-h-[calc(100vh-32px)] my-4 ml-4 w-64 rounded-xl border border-gray-300 p-4">
          <h1 className="font-semibold text-lg text-center p-2 mb-6">
            Medical Records
          </h1>
          {SidebarMenu(routes, setIsChecked, currentPath)}
        </ul>
      </div>
    </div>
  );
}

export default Layout;
