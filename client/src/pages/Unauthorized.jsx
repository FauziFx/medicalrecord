import React from "react";
import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold text-red-500">403 - Unauthorized</h1>
      <p className="text-lg text-gray-700 mt-2">
        Anda tidak memiliki izin untuk mengakses halaman ini.
      </p>
      <Link
        to="/"
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}

export default Unauthorized;
