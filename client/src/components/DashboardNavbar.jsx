import { Bell, Menu, User, LogOut } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb } from "@/components";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export function DashboardNavbar({ setIsChecked }) {
  const token = Cookies.get("token");
  const userName = Cookies.get("user")
    ? Cookies.get("user")
    : token
      ? jwtDecode(token).name
      : "Admin";

  const navigate = useNavigate();

  return (
    <div className="navbar bg-transparent px-4 md:px-6 py-3 min-h-12">
      <div className="flex-1 gap-2">
        {/* Tombol Hamburger di Mobile */}
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square lg:hidden bg-base-100 border border-base-300/50 shadow-sm rounded-lg"
          onClick={() => setIsChecked(true)}
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Breadcrumb Desktop */}
        <Breadcrumb className="hidden md:block" />
      </div>

      {/* Sisi Kanan Navigasi */}
      <div className="flex items-center gap-3">
        {/* Dropdown Notifikasi */}
        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            className="btn btn-ghost btn-sm btn-square bg-base-100 border border-base-300/50 shadow-sm rounded-lg"
          >
            <Bell className="h-4 w-4" />
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-2xl border border-base-300/60 w-72 mt-2 z-50"
          >
            <li className="menu-title text-xs font-semibold px-3 py-2 border-b border-base-100">
              Notifikasi Terbaru
            </li>
            <li>
              <div className="flex flex-col items-start gap-0.5 p-3">
                <span className="font-semibold text-xs text-base-content">
                  Pasien Baru Terdaftar
                </span>
                <span className="text-[11px] text-base-content/60">
                  Sistem mendeteksi penambahan data pasien.
                </span>
              </div>
            </li>
          </ul>
        </div>

        {/* Dropdown User Profile */}
        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            className="btn btn-ghost btn-sm gap-2 bg-base-100 border border-base-300/50 shadow-sm rounded-lg pl-2 pr-3"
          >
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-medium hidden sm:block">
              {userName}
            </span>
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-1.5 shadow-lg bg-base-100 rounded-2xl border border-base-300/60 w-52 mt-2 z-50"
          >
            <li>
              <Link to="/profile" className="text-xs rounded-xl py-2">
                Detail Profil
              </Link>
            </li>
            <div className="divider my-1 opacity-60"></div>
            <li>
              <button
                className="text-xs text-error rounded-xl py-2 hover:bg-error/10"
                onClick={() => {
                  Cookies.remove("token");
                  Cookies.remove("user");
                  navigate("/login");
                }}
              >
                <LogOut className="h-3.5 w-3.5" /> Keluar Aplikasi
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DashboardNavbar;
