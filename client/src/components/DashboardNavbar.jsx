import { Bell, Menu, User } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb } from "@/components";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export function DashboardNavbar({ setIsChecked }) {
  const userName = Cookies.get("user")
    ? Cookies.get("user")
    : jwtDecode(Cookies.get("token")).name;
  const navigate = useNavigate();
  return (
    <div className="navbar bg-transparent py-0">
      <div className="flex-1">
        <button
          role="button"
          className="btn btn-ghost btn-circle lg:hidden"
          onClick={() => setIsChecked(true)}
        >
          <Menu className="h-4 w-4" />
        </button>
        <Link to="/" className="btn btn-ghost text-lg md:hidden">
          daisyUI
        </Link>
        <Breadcrumb className="hidden md:block pl-5" />
      </div>
      <div className="flex items-center gap-2">
        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle"
          >
            <div className="indicator">
              <Bell className="h-4 w-4" />
              {/* <span className="badge badge-xs badge-primary indicator-item">
                8
              </span> */}
            </div>
          </button>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-72 p-2 shadow"
          >
            <li>
              <div className="d-flex flex-column justify-content-center">
                <h6 className="text-xs mb-1">
                  <span className="font-bold">New message</span>
                  <br /> Lorem ipsum dolor sit amet.
                </h6>
                <p className="text-xs text-secondary mb-0">13 minutes ago</p>
              </div>
            </li>
            <li>
              <div className="d-flex flex-column justify-content-center">
                <h6 className="text-xs mb-1">
                  <span className="font-bold">New message</span>
                  <br /> Lorem ipsum dolor sit amet.
                </h6>
                <p className="text-xs text-secondary mb-0">13 minutes ago</p>
              </div>
            </li>
          </ul>
        </div>
        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            role="button"
            className="btn btn-ghost rounded-full md:rounded px-3 avatar"
          >
            <User className="h-4 w-4" />{" "}
            <span className="text-xs hidden md:block">{userName}</span>
          </button>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link to="/profile" className="justify-between">
                Profile
              </Link>
            </li>
            <div className="divider my-0"></div>
            <li>
              <button
                onClick={() => {
                  Cookies.remove("token");
                  Cookies.remove("user");
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DashboardNavbar;
