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
            menu.showInMenu
        )
        .map((item, index) => (
          <li key={index}>
            {item.children ? (
              <details open={true} className="mb-2">
                <summary
                  className={
                    currentPath.split("/")[1] == item.path.split("/")[1]
                      ? "bg-neutral text-white shadow-md rounded-md"
                      : ""
                  }
                >
                  {item.icon} {item.name}
                </summary>
                <ul className="menu bg-white text-base-content min-h-1/2 w-auto pr-0">
                  {SidebarMenu(item.children, setIsChecked, currentPath)}
                </ul>
              </details>
            ) : (
              <Link
                to={item.path}
                onClick={() => setIsChecked(false)}
                className={
                  "mb-2 " +
                  (currentPath == item.path
                    ? "bg-neutral text-white shadow-md rounded-md"
                    : "")
                }
              >
                {item.icon} {item.name}
              </Link>
            )}
          </li>
        ))}
    </>
  );
};

export default SidebarMenu;
