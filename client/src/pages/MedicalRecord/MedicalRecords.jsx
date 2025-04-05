import { CircleMinus, CirclePlus, CornerDownRight, Trash2 } from "lucide-react";
import React, { useState } from "react";
import api from "@/utils/api";
import useSWR, { useSWRConfig } from "swr";
import { LoadingTable } from "@/components";
import dayjs from "dayjs"; // Core Day.js
import utc from "dayjs/plugin/utc"; // Plugin UTC
import timezone from "dayjs/plugin/timezone"; // Plugin Timezone
import "dayjs/locale/id";
import Swal from "sweetalert2";

// Extend plugins ke Day.js
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("id");

export function MedicalRecords() {
  const { mutate } = useSWRConfig();
  const [name, setName] = useState("");
  const [opticId, setOpticId] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 15; // Default limit 15
  const API_URL = import.meta.env.VITE_API_URL;

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

      return response.data;
    } catch (error) {
      console.log(error);
    }
  };
  const {
    data: dataOptic,
    error: errorOptic,
    isLoading: isLoadingOptic,
  } = useSWR(`/optic?status=active`, fetcher);
  const {
    data: dataMedicalRecord,
    error: errorMedicalRecord,
    isLoading: isLoadingMedicalRecord,
  } = useSWR(`/medicalrecord?${query.toString()}`, fetcher);

  const showAttachment = (img) => {
    Swal.fire({
      imageUrl: `${API_URL}/upload/image/${img}`,
      showCloseButton: true,
      showConfirmButton: false,
    });
  };

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
        deleteMedicalRecord(id);
      }
    });
  };

  const deleteMedicalRecord = async (id) => {
    try {
      const response = await api.delete(`/medicalrecord/${id}`);

      if (response.data.success) {
        mutate(`/medicalrecord?${query.toString()}`);
        Swal.fire(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (errorOptic || errorMedicalRecord) return <p>Error loading data.</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Medical Records</h1>
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
            {!isLoadingOptic &&
              dataOptic.data.map((item, index) => (
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
                "Prescription",
                "Visit Date",
                "Optician",
                "Status",
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
            {!isLoadingMedicalRecord ? (
              dataMedicalRecord.data.map(
                (
                  {
                    id,
                    patient,
                    od,
                    os,
                    far_pd,
                    near_pd,
                    visit_date,
                    optic,
                    checked_by,
                    note,
                    image,
                    is_olddata,
                    createdAt,
                  },
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
                          {patient.name.toLowerCase()}
                        </p>
                      </td>
                      <td className="border-b border-gray-200">
                        <p className="text-xs text-gray-500">
                          <span className="text-black">od </span>
                          {od.split("/")[0] && "S" + od.split("/")[0]}
                          {od.split("/")[1] && " C" + od.split("/")[1]}
                          {od.split("/")[2] && " X" + od.split("/")[2]}
                          {od.split("/")[3] && " A" + od.split("/")[3]}
                        </p>
                        <p className="text-xs text-gray-500">
                          <span className="text-black">os </span>
                          {os.split("/")[0] && "S" + os.split("/")[0]}
                          {os.split("/")[1] && " C" + os.split("/")[1]}
                          {os.split("/")[2] && " X" + os.split("/")[2]}
                          {os.split("/")[3] && " A" + os.split("/")[3]}
                        </p>
                        <p className="text-xs text-gray-500">
                          {far_pd && near_pd ? (
                            <>
                              <span className="text-black">pd </span> {far_pd}/
                              {near_pd}
                            </>
                          ) : far_pd ? (
                            <>
                              <span className="text-black">pd </span> {far_pd}
                            </>
                          ) : null}
                        </p>
                      </td>
                      <td className="border-b border-gray-200">
                        <p className="text-xs text-gray-700 font-semibold">
                          {visit_date
                            ? dayjs(visit_date)
                                .tz("Asia/Jakarta")
                                .format("DD MMM YYYY")
                            : dayjs(createdAt)
                                .tz("Asia/Jakarta")
                                .format("DD MMM YYYY")}
                        </p>
                      </td>
                      <td className="border-b border-gray-200">
                        <p className="text-xs font-semibold text-gray-700">
                          {optic.optic_name}
                        </p>
                        <p className="text-xs text-gray-500 font-light">
                          {checked_by}
                        </p>
                      </td>
                      <td className="border-b border-gray-200">
                        {is_olddata == 0 ? (
                          <div className="badge badge-soft badge-xs badge-primary">
                            new
                          </div>
                        ) : (
                          <div className="badge badge-soft badge-xs badge-neutral">
                            old
                          </div>
                        )}
                      </td>
                      <td className="w-28">
                        <button
                          className="btn btn-xs btn-ghost btn-circle text-error tooltip"
                          data-tip="Delete"
                          onClick={() => handleDelete(id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    {openRow === id && (
                      <tr className="bg-gray-100">
                        <td
                          className="border border-gray-300 px-4 py-2"
                          colSpan={8}
                        >
                          <div className="flex items-start gap-2 w-full">
                            <CornerDownRight className="h-4 w-4" />
                            <div>
                              <p className="whitespace-pre-wrap">{note}</p>
                              {!is_olddata && (
                                <button
                                  className="btn btn-xs btn-neutral my-1"
                                  onClick={() => showAttachment(image)}
                                >
                                  Lihat Lampiran
                                </button>
                              )}
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
            Page {page} of{" "}
            {!isLoadingMedicalRecord && dataMedicalRecord.totalPages}
          </button>
          <button
            className="join-item btn btn-sm bg-white"
            disabled={
              page >= (!isLoadingMedicalRecord && dataMedicalRecord.totalPages)
            }
            onClick={() => setPage(page + 1)}
          >
            Next »
          </button>
        </div>
        <div className="text-xs mt-4">
          Total Data: {!isLoadingMedicalRecord && dataMedicalRecord.totalData}
        </div>
      </div>
    </div>
  );
}

export default MedicalRecords;
