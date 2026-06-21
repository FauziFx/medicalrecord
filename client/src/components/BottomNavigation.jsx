import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import {
  Home,
  ClipboardList,
  ShieldCheck,
  Menu,
  Box,
  Store,
  Users,
  User,
  Trash2,
  X,
} from "lucide-react";

export function BottomNavigation() {
  const userRole = Cookies.get("token")
    ? jwtDecode(Cookies.get("token")).role
    : "";

  const location = useLocation();
  const [isOpenMenu, setIsOpenMenu] = useState(false);

  // Fungsi helper untuk ngecek rute aktif agar ikon berubah warna
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      {/* ========================================================== */}
      {/* 1. BOTTOM NAVIGATION BAR (FIXED DI BAWAH LAYAR HP)        */}
      {/* ========================================================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300/60 pb-safe-bottom z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-4 h-16">
          {/* MENU 1: DASHBOARD */}
          <Link
            to="/dashboard"
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${isActive("/dashboard") ? "text-primary" : "text-base-content/40"}`}
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>

          {/* MENU 2: REKAM MEDIS */}
          <Link
            to="/rekam-medis"
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${isActive("/rekam-medis") ? "text-primary" : "text-base-content/40"}`}
          >
            <ClipboardList className="h-5 w-5" />
            <span>Rekam Medis</span>
          </Link>

          {/* MENU 3: KARTU GARANSI */}
          <Link
            to="/kartu-garansi"
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${isActive("/kartu-garansi") ? "text-primary" : "text-base-content/40"}`}
          >
            <ShieldCheck className="h-5 w-5" />
            <span>Garansi</span>
          </Link>

          {/* MENU 4: MENU MORE / STOK LENSA */}
          {userRole === "admin" ? (
            <button
              type="button"
              onClick={() => setIsOpenMenu(true)}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${isOpenMenu ? "text-primary" : "text-base-content/40"}`}
            >
              <Menu className="h-5 w-5" />
              <span>Lainnya</span>
            </button>
          ) : (
            <Link
              to="/stok-lensa"
              className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${isActive("/stok-lensa") ? "text-primary" : "text-base-content/40"}`}
            >
              <Box className="h-5 w-5" />
              <span>Stok Lensa</span>
            </Link>
          )}
        </div>
      </div>

      {/* ========================================================== */}
      {/* 2. DRAWER / BOTTOM SHEET OVERLAY (WADAH MENU SISAAN SIDEBAR) */}
      {/* ========================================================== */}
      <div
        className={`md:hidden fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${isOpenMenu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpenMenu(false)}
      >
        <div
          className={`absolute bottom-0 left-0 right-0 bg-base-100 rounded-t-3xl p-5 border-t border-base-200 transition-transform duration-300 space-y-4 shadow-2xl ${isOpenMenu ? "translate-y-0" : "translate-y-full"}`}
          onClick={(e) => e.stopPropagation()} // Cegah modal menutup saat area dalam diklik
        >
          {/* Header Drawer */}
          <div className="flex justify-between items-center pb-2 border-b border-base-200">
            <span className="text-xs font-extrabold text-base-content/40 uppercase tracking-wider">
              Menu Operasional Lain
            </span>
            <button
              onClick={() => setIsOpenMenu(false)}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Grid Grid Menu Sisaan Sidebar */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-xs font-bold text-base-content/80">
            <Link
              to="/stok-lensa"
              onClick={() => setIsOpenMenu(false)}
              className="flex flex-col items-center gap-2 p-3 bg-base-200/40 rounded-2xl border border-base-300/30 hover:bg-base-200"
            >
              <Box className="h-5 w-5 text-primary" />
              <span>Stok Lensa</span>
            </Link>
            <Link
              to="/optik"
              onClick={() => setIsOpenMenu(false)}
              className="flex flex-col items-center gap-2 p-3 bg-base-200/40 rounded-2xl border border-base-300/30 hover:bg-base-200"
            >
              <Store className="h-5 w-5 text-primary" />
              <span>Optik</span>
            </Link>
            <Link
              to="/users"
              onClick={() => setIsOpenMenu(false)}
              className="flex flex-col items-center gap-2 p-3 bg-base-200/40 rounded-2xl border border-base-300/30 hover:bg-base-200"
            >
              <Users className="h-5 w-5 text-primary" />
              <span>Users</span>
            </Link>
            <Link
              to="/recycle-bin"
              onClick={() => setIsOpenMenu(false)}
              className="flex flex-col items-center gap-2 p-3 bg-base-200/40 rounded-2xl border border-base-300/30 hover:bg-base-200"
            >
              <Trash2 className="h-5 w-5 text-error" />
              <span className="text-error">Recycle Bin</span>
            </Link>
            <Link
              to="/profile"
              onClick={() => setIsOpenMenu(false)}
              className="flex flex-col items-center gap-2 p-3 bg-base-200/40 rounded-2xl border border-base-300/30 hover:bg-base-200"
            >
              <User className="h-5 w-5 text-primary" />
              <span>Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
