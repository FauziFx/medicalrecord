import { FilePlus, Info, Pencil, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import api from "@/utils/api";
import useSWR, { useSWRConfig } from "swr";
import { LoadingTable } from "@/components";
import dayjs from "dayjs"; // Core Day.js
import utc from "dayjs/plugin/utc"; // Plugin UTC
import timezone from "dayjs/plugin/timezone"; // Plugin Timezone
import { Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

// Extend plugins ke Day.js
dayjs.extend(utc);
dayjs.extend(timezone);

export function Patients() {
  const userRole = Cookies.get("token")
    ? jwtDecode(Cookies.get("token")).role
    : "";
  const { mutate } = useSWRConfig();
  const [name, setName] = useState("");
  const [opticId, setOpticId] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 15; // Default limit 15

  const [optic, setOptic] = useState([]);

  const location = useLocation();

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
      setOptic(resOptic.data.data);

      return response.data;
    } catch (error) {
      console.log(error);
    }
  };
  const {
    data: dataPatient,
    error: errorPatient,
    isLoading: isLoadingPatient,
  } = useSWR(`/patient?${query.toString()}`, fetcher);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Move to Trash?",
      showDenyButton: true,
      showCancelButton: true,
      showConfirmButton: false,
      denyButtonText: `Yes, Move to trash`,
    }).then((result) => {
      // Confirm Delete
      if (result.isDenied) {
        deletePatient(id);
      }
    });
  };

  const deletePatient = async (id) => {
    try {
      const response = await api.delete(`/patient/${id}`);

      if (response.data.success) {
        mutate(`/patient?${query.toString()}`);
        Swal.fire(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (errorPatient) return <p>Error loading data.</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Patients</h1>
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
            {optic.length >= 1 &&
              optic.map((item, index) => (
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
          <Link
            to="/medical-record/add-patient-data"
            className="btn btn-primary btn-sm w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Data
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto card bg-white shadow-md mt-4 p-2 pb-6">
        <table className="table table-xs w-full min-w-[768px] table-auto">
          {/* Head */}
          <thead>
            <tr>
              {[
                "#",
                "Name",
                "Gender",
                "Address",
                "Medical History",
                "Optic",
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
            {!isLoadingPatient ? (
              dataPatient.data.map(
                (
                  {
                    id,
                    name,
                    address,
                    phone_number,
                    date_of_birth,
                    gender,
                    optic,
                    createdAt,
                    medicalconditions,
                  },
                  index
                ) => (
                  <tr key={index}>
                    <td className="border-b border-gray-200">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="border-b border-gray-200">
                      <p className="text-xs font-semibold capitalize">
                        {name.toLowerCase()}
                      </p>
                      <p className="text-xs text-gray-500 font-light">
                        {phone_number}
                      </p>
                    </td>
                    <td className="border-b border-gray-200 text-center">
                      <p className="text-xs font-semibold">
                        {gender == "Perempuan" ? "P" : "L"}
                      </p>
                      <p className="text-xs text-gray-500 font-light">
                        {dayjs().diff(
                          dayjs(date_of_birth.split("T")[0]),
                          "year"
                        )}{" "}
                        Thn
                      </p>
                    </td>
                    <td className="border-b border-gray-200">
                      <p className="text-xs text-gray-700 font-semibold">
                        {address}
                      </p>
                    </td>
                    <td className="border-b border-gray-200">
                      <ul className="list-inside list-disc">
                        {medicalconditions &&
                          medicalconditions.map(({ name }, index2) => (
                            <li key={index2}>{name}</li>
                          ))}
                      </ul>
                    </td>
                    <td className="border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-700">
                        {optic.optic_name}
                      </p>
                      <p className="text-xs text-gray-500 font-light">
                        {dayjs(createdAt)
                          .tz("Asia/Jakarta")
                          .format("DD-MM-YYYY")}
                      </p>
                    </td>
                    <td className="w-28 flex justify-end">
                      <Link
                        to="/medical-record/add-medical-record"
                        state={{ patientId: id, prevPage: location.pathname }}
                        className="btn btn-xs btn-ghost btn-circle text-neutral tooltip"
                        data-tip="Add Medical Record"
                      >
                        <FilePlus className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/medical-record/patients/${id}`}
                        className="btn btn-xs btn-ghost btn-circle text-info tooltip"
                        data-tip="Detail"
                      >
                        <Info className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/medical-record/edit-patient-data/${id}`}
                        className="btn btn-xs btn-ghost btn-circle text-success tooltip"
                        data-tip="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      {userRole == "admin" && (
                        <button
                          className="btn btn-xs btn-ghost btn-circle text-error tooltip"
                          data-tip="Delete"
                          onClick={() => handleDelete(id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
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
            Page {page} of {!isLoadingPatient && dataPatient.totalPages}
          </button>
          <button
            className="join-item btn btn-sm bg-white"
            disabled={page >= (!isLoadingPatient && dataPatient.totalPages)}
            onClick={() => setPage(page + 1)}
          >
            Next »
          </button>
        </div>
        <div className="text-xs mt-4">
          Total Data: {!isLoadingPatient && dataPatient.totalData}
        </div>
      </div>
    </div>
  );
}

export default Patients;
