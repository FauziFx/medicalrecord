import React from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const userRole = Cookies.get("token")
  ? jwtDecode(Cookies.get("token")).role
  : "";

export const SidebarMenu = (menuItems, setIsChecked, currentPath) => {
  return (
    <>
      {menuItems
        .filter(
          (menu) =>
            (menu.roles.length === 0 || menu.roles.includes(userRole)) &&
            menu.showInMenu,
        )
        .map((item, index) => {
          const isParentActive =
            currentPath.split("/")[1] === item.path.split("/")[1];
          const isChildActive = currentPath === item.path;

          return (
            <li key={index} className="w-full">
              {item.children ? (
                <details open={isParentActive} className="w-full">
                  <summary
                    className={`font-medium py-2.5 px-3 rounded-xl transition-all ${
                      isParentActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-base-200"
                    }`}
                  >
                    {item.icon} <span>{item.name}</span>
                  </summary>
                  <ul className="before:bg-base-300 ml-4 mt-1 pl-2 gap-1 flex flex-col border-l border-base-200">
                    {SidebarMenu(item.children, setIsChecked, currentPath)}
                  </ul>
                </details>
              ) : (
                <Link
                  to={item.path}
                  onClick={() => setIsChecked(false)}
                  className={`font-medium py-2.5 px-3 rounded-xl transition-all flex items-center gap-3 ${
                    isChildActive
                      ? "bg-primary text-primary-content font-semibold shadow-sm"
                      : "hover:bg-base-200 text-base-content/80"
                  }`}
                >
                  {item.icon} <span>{item.name}</span>
                </Link>
              )}
            </li>
          );
        })}
    </>
  );
};

export default SidebarMenu;
