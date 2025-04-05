import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { LoadingTable } from "@/components";
import api from "@/utils/api";
import useSWR, { useSWRConfig } from "swr";
import dayjs from "dayjs"; // Core Day.js
import utc from "dayjs/plugin/utc"; // Plugin UTC
import timezone from "dayjs/plugin/timezone"; // Plugin Timezone
import {
  CircleMinus,
  CirclePlus,
  CornerDownRight,
  Info,
  Trash2,
} from "lucide-react";
import Swal from "sweetalert2";

// Extend plugins ke Day.js
dayjs.extend(utc);
dayjs.extend(timezone);

export function WarrantyClaim() {
  const { mutate } = useSWRConfig();
  const [name, setName] = useState("");
  const [opticId, setOpticId] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 15; // Default limit 15
  const location = useLocation();

  const [openRow, setOpenRow] = useState(null); // Menyimpan ID baris yang terbuka
  const toggleRow = (rowId) => {
    setOpenRow(openRow === rowId ? null : rowId); // Buka/tutup baris
  };

  // Query string berdasarkan filter
  const query = new URLSearchParams({ page, limit });
  if (name) query.append("name", name);
  if (opticId) query.append("opticId", opticId);
  if (startDate) query.append("startDate", startDate);
  if (endDate) query.append("endDate", endDate);

  const fetcher = async (url) => {
    try {
      const response = await api.get(url);
      const resOptic = await api.get("/optic?status=active");

      const data = {
        dataOptic: resOptic.data.data,
        data: response.data.data,
        totalData: response.data.totalData,
        totalPages: response.data.totalPages,
      };

      return data;
    } catch (error) {
      console.log(error);
    }
  };

  const { data, error, isLoading } = useSWR(
    `/warranty/claim?${query.toString()}`,
    fetcher
  );

  const handleDelete = (id) => {
    Swal.fire({
      title: "Permanently Deleted?",
      showDenyButton: true,
      showCancelButton: true,
      showConfirmButton: false,
      denyButtonText: `Yes, Deleted`,
    }).then((result) => {
      // Confirm Delete
      if (result.isDenied) {
        deleteWarrantyClaim(id);
      }
    });
  };

  const deleteWarrantyClaim = async (id) => {
    try {
      const response = await api.delete(`/warranty/claim/${id}`);

      if (response.data.success) {
        mutate(`/warranty/claim?${query.toString()}`);
        Swal.fire(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (error) return <p>Error loading data.</p>;
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Warranty Claims</h1>
      <div className="card bg-white shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-2 md:items-center justify-between">
          <input
            type="search"
            placeholder="Search by name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input input-sm shadow w-full md:1/5"
          />
          <select
            value={opticId}
            onChange={(e) => setOpticId(e.target.value)}
            className="select select-sm shadow w-full md:1/5"
          >
            <option value="">All Store</option>
            {!isLoading &&
              data.dataOptic.map((item, index) => (
                <option key={index} value={item.id}>
                  {item.optic_name}
                </option>
              ))}
          </select>
          <div className="flex gap-1 items-center w-full md:w-1/2">
            <fieldset className="fieldset w-full py-0 md:w-1/2">
              <legend className="fieldset-legend font-normal md:hidden py-1">
                From
              </legend>
              <label className="join shadow">
                <button className="join-item btn btn-sm font-normal hidden md:block">
                  From
                </button>
                <input
                  type="date"
                  className="join-item rounded-l md:rounded-l-none md:rounded-r input input-sm"
                  value={startDate || ""}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
            </fieldset>
            <span className="pt-4 md:pt-0">-</span>
            <fieldset className="fieldset w-full py-0 md:w-1/2">
              <legend className="fieldset-legend font-normal md:hidden py-1">
                To
              </legend>
              <label className="join shadow">
                <button className="join-item btn btn-sm font-normal hidden md:block">
                  To
                </button>
                <input
                  type="date"
                  className="join-item rounded-l md:rounded-l-none md:rounded-r input input-sm"
                  value={endDate || ""}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
            </fieldset>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto card bg-white shadow-md mt-4 p-2 pb-6">
        <table className="table table-xs w-full min-w-[768px] table-auto">
          {/* Head */}
          <thead>
            <tr>
              {[
                "",
                "#",
                "Name",
                "Warranty Type",
                "Optic",
                "Date",
                "Action",
              ].map((el) => (
                <th
                  key={el}
                  className="border-b border-blue-gray-50 py-3 px-2 text-left"
                >
                  <p
                    variant="small"
                    className="text-[11px] font-bold uppercase text-blue-gray-400"
                  >
                    {el}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          {/* Body */}
          <tbody>
            {!isLoading ? (
              data.data.map(
                (
                  { id, warranty, warranty_type, damage, repair, claim_date },
                  index
                ) => (
                  <React.Fragment key={index}>
                    <tr>
                      <td className="border-b border-gray-200" width="1%">
                        <button
                          className="btn btn-xs btn-ghost btn-circle my-1"
                          onClick={() => toggleRow(id)}
                        >
                          {openRow === id ? (
                            <CircleMinus className="h-4 w-4 cursor-pointer text-error" />
                          ) : (
                            <CirclePlus className="h-4 w-4 cursor-pointer text-primary" />
                          )}
                        </button>
                      </td>
                      <td className="border-b border-gray-200">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="border-b border-gray-200">
                        <p className="text-xs font-semibold capitalize">
                          {warranty.name.toLowerCase()}
                        </p>
                      </td>
                      <td className="border-b border-gray-200">
                        <p className="text-xs capitalize">{warranty_type}</p>
                      </td>
                      <td className="border-b border-gray-200">
                        <p className="text-xs text-gray-700 font-semibold">
                          {warranty.optic.optic_name}
                        </p>
                      </td>
                      <td className="border-b border-gray-200">
                        <p className="text-xs text-gray-500 font-light">
                          {dayjs(claim_date)
                            .tz("Asia/Jakarta")
                            .format("DD-MM-YYYY")}
                        </p>
                      </td>
                      <td className="w-28">
                        <button
                          onClick={() => handleDelete(id)}
                          className="btn btn-xs btn-ghost btn-circle text-error tooltip"
                          data-tip="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    {openRow === id && (
                      <tr className="bg-gray-100">
                        <td
                          className="border border-gray-300 px-4 py-2"
                          colSpan={7}
                        >
                          <div className="flex items-start gap-2 w-full">
                            <CornerDownRight className="h-4 w-4" />
                            <div className="text-xs">
                              <p>
                                Kerusakan :{" "}
                                <span className="text-gray-500">{damage}</span>{" "}
                              </p>
                              <p>
                                Perbaikan :{" "}
                                <span className="text-gray-500">{repair}</span>{" "}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              )
            ) : (
              <LoadingTable row="10" colspan="7" />
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex flex-col justify-center items-center mt-4">
        <div className="join">
          <button
            className="join-item btn btn-sm bg-white"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            « Prev
          </button>
          <button className="join-item btn btn-sm bg-white font-normal">
            Page {page} of {!isLoading && data.totalPages}
          </button>
          <button
            className="join-item btn btn-sm bg-white"
            disabled={page >= (!isLoading && data.totalPages)}
            onClick={() => setPage(page + 1)}
          >
            Next »
          </button>
        </div>
        <div className="text-xs mt-4">
          Total Data: {!isLoading && data.totalData}
        </div>
      </div>
    </div>
  );
}

export default WarrantyClaim;
