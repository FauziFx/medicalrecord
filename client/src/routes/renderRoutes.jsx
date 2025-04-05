import React from "react";
import { Route } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const userRole = Cookies.get("token")
  ? jwtDecode(Cookies.get("token")).role
  : "";

const renderRoutes = (items) =>
  items
    .filter(
      (route) => route.roles.length === 0 || route.roles.includes(userRole)
    )
    .flatMap((item) => [
      item.children ? (
        <Route key={item.path} path={item.path} element={<item.component />}>
          {renderRoutes(item.children)}
        </Route>
      ) : item.path ? (
        <Route key={item.path} path={item.path} element={<item.component />} />
      ) : null,
    ])
    .filter(Boolean);

export default renderRoutes;
