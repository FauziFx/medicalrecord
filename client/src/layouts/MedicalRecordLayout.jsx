import React from "react";
import { Link, Outlet } from "react-router-dom";

function MedicalRecordLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default MedicalRecordLayout;
