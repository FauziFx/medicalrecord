import React from "react";
import { Link, useLocation } from "react-router-dom";

export function Breadcrumb({ className }) {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div className={`text-xs breadcrumbs ${className}`}>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          return (
            <li
              key={index}
              className={
                index === pathnames.length - 1
                  ? "text-primary font-semibold"
                  : ""
              }
            >
              <Link to={to}>
                {value.charAt(0).toUpperCase() +
                  value.replaceAll("-", " ").slice(1)}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Breadcrumb;
