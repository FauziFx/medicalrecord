import React from "react";

function LoadingDashboard() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-4">
        <div className="animate-pulse bg-gray-300 h-28 shadow-md rounded-xl"></div>
        <div className="animate-pulse bg-gray-300 h-28 shadow-md rounded-xl"></div>
        <div className="animate-pulse bg-gray-300 h-28 shadow-md rounded-xl"></div>
        <div className="animate-pulse bg-gray-300 h-28 shadow-md rounded-xl"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2">
        <div className="mb-4 animate-pulse bg-gray-300 h-56 rounded-xl shadow-md p-4"></div>

        <div className="mb-4 animate-pulse bg-gray-300 h-56 rounded-xl shadow-md p-4"></div>
      </div>
    </>
  );
}

export default LoadingDashboard;
