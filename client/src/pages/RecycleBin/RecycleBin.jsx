import { RotateCcw, Trash2 } from "lucide-react";
import React, { useState } from "react";
import api from "@/utils/api";
import useSWR, { useSWRConfig } from "swr";
import { LoadingTable } from "@/components";
import dayjs from "dayjs"; // Core Day.js
import utc from "dayjs/plugin/utc"; // Plugin UTC
import timezone from "dayjs/plugin/timezone"; // Plugin Timezone;
import Swal from "sweetalert2";

// Extend plugins ke Day.js
dayjs.extend(utc);
dayjs.extend(timezone);

export function RecycleBin() {
  const { mutate } = useSWRConfig();
  const [namePatient, setNamePatient] = useState("");
  const [pagePatient, setPagePatient] = useState(1);
  const limitPatient = 10; // Default limit 15
  const [nameMedicalrecord, setNameMedicalrecord] = useState("");
  const [pageMedicalrecord, setPageMedicalrecord] = useState(1);
  const limitMedicalrecord = 10; // Default limit 15

  const queryPatient = new URLSearchParams({ pagePatient, limitPatient });
  if (namePatient) queryPatient.append("name", namePatient);

  const queryMedicalrecord = new URLSearchParams({
    pageMedicalrecord,
    limitMedicalrecord,
  });
  if (nameMedicalrecord) queryMedicalrecord.append("name", nameMedicalrecord);

  const fetcher = async (url) => {
    try {
      const response = await api.get(url);

      return response.data;
    } catch (error) {
      console.log(error);
    }
  };
  const {
    data: dataPatient,
    error: errorPatient,
    isLoading: isLoadingPatient,
  } = useSWR(`/patient?isDeleted=true&${queryPatient.toString()}`, fetcher);

  const {
    data: dataMedicalRecord,
    error: errorMedicalRecord,
    isLoading: isLoadingMedicalRecord,
  } = useSWR(
    `/medicalrecord?isDeleted=true&${queryMedicalrecord.toString()}`,
    fetcher
  );

  const handleRestorePatient = async (id) => {
    try {
      const response = await api.put(`/patient/${id}/restore`);

      if (response.data.success) {
        mutate(`/patient?isDeleted=true&${queryPatient.toString()}`);
        Swal.fire(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeletePatient = (id) => {
    Swal.fire({
      title: "Permanently delete? This cannot be undone",
      showDenyButton: true,
      showCancelButton: true,
      showConfirmButton: false,
      denyButtonText: `Yes, Permanently delete`,
    }).then((result) => {
      // Confirm Delete
      if (result.isDenied) {
        deletePatient(id);
      }
    });
  };

  const deletePatient = async (id) => {
    try {
      const response = await api.delete(`/patient/${id}?force=true`);

      if (response.data.success) {
        mutate(`/patient?isDeleted=true&${queryPatient.toString()}`);
        Swal.fire(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleRestoreMedicalRecord = async (id) => {
    try {
      const response = await api.put(`/medicalrecord/${id}/restore`);

      if (response.data.success) {
        mutate(
          `/medicalrecord?isDeleted=true&${queryMedicalrecord.toString()}`
        );
        Swal.fire(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteMedicalRecord = (id) => {
    Swal.fire({
      title: "Permanently delete? This cannot be undone",
      showDenyButton: true,
      showCancelButton: true,
      showConfirmButton: false,
      denyButtonText: `Yes, Permanently delete`,
    }).then((result) => {
      // Confirm Delete
      if (result.isDenied) {
        deleteMedicalRecord(id);
      }
    });
  };

  const deleteMedicalRecord = async (id) => {
    try {
      const response = await api.delete(`/medicalrecord/${id}?force=true`);

      if (response.data.success) {
        mutate(
          `/medicalrecord?isDeleted=true&${queryMedicalrecord.toString()}`
        );
        Swal.fire(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (errorPatient || errorMedicalRecord) return <p>Error loading data.</p>;
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Recycle Bin</h1>
      {/* Patients */}
      <div className="card bg-white shadow-md p-4">
        <h2 className="card-title">Patients</h2>
        <div className="flex flex-col md:flex-row gap-2 md:items-center justify-between">
          <input
            type="search"
            placeholder="Search by name"
            value={namePatient}
            onChange={(e) => setNamePatient(e.target.value)}
            className="input input-sm shadow w-full md:1/5"
          />
        </div>
        <div className="overflow-x-auto card bg-white shadow-md p-2 pb-6 mt-2">
          <table className="table table-xs w-full min-w-[768px] table-auto">
            {/* Head */}
            <thead>
              <tr>
                {["#", "Name", "Address", "Optic", "Deleted At", "Action"].map(
                  (el) => (
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
                  )
                )}
              </tr>
            </thead>
            {/* Body */}
            <tbody>
              {!isLoadingPatient ? (
                dataPatient.data.map(
                  (
                    { id, name, address, phone_number, optic, deletedAt },
                    index
                  ) => (
                    <tr key={index}>
                      <td className="border-b border-gray-200">
                        {(pagePatient - 1) * limitPatient + index + 1}
                      </td>
                      <td className="border-b border-gray-200">
                        <p className="text-xs font-semibold">{name}</p>
                        <p className="text-xs text-gray-500 font-light">
                          {phone_number}
                        </p>
                      </td>
                      <td className="border-b border-gray-200">
                        <p className="text-xs text-gray-700 font-semibold">
                          {address}
                        </p>
                      </td>
                      <td className="border-b border-gray-200">
                        <p className="text-xs font-semibold text-gray-700">
                          {optic.optic_name}
                        </p>
                      </td>
                      <td className="border-b border-gray-200">
                        {dayjs(deletedAt)
                          .tz("Asia/Jakarta")
                          .format("DD-MM-YYYY")}
                      </td>
                      <td className="w-28 flex justify-end">
                        <button
                          className="btn btn-xs btn-ghost btn-circle text-success tooltip"
                          data-tip="Restore"
                          onClick={() => handleRestorePatient(id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button
                          className="btn btn-xs btn-ghost btn-circle text-error tooltip"
                          data-tip="Delete"
                          onClick={() => handleDeletePatient(id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
      </div>
      {/* Pagination Patient */}
      <div className="flex flex-col justify-center items-center mt-2">
        <div className="join">
          <button
            className="join-item btn btn-sm bg-white"
            disabled={pagePatient <= 1}
            onClick={() => setPagePatient(pagePatient - 1)}
          >
            « Prev
          </button>
          <button className="join-item btn btn-sm bg-white font-normal">
            Page {pagePatient} of {!isLoadingPatient && dataPatient.totalPages}
          </button>
          <button
            className="join-item btn btn-sm bg-white"
            disabled={
              pagePatient >= (!isLoadingPatient && dataPatient.totalPages)
            }
            onClick={() => setPagePatient(pagePatient + 1)}
          >
            Next »
          </button>
        </div>
        <div className="text-xs mt-1">
          Total Data: {!isLoadingPatient && dataPatient.totalData}
        </div>
      </div>

      {/* Medical Record */}
      <div className="card bg-white shadow-md p-4 mt-4">
        <h2 className="card-title">Medical Record</h2>
        <div className="flex flex-col md:flex-row gap-2 md:items-center justify-between">
          <input
            type="search"
            placeholder="Search by name"
            value={nameMedicalrecord}
            onChange={(e) => setNameMedicalrecord(e.target.value)}
            className="input input-sm shadow w-full md:1/5"
          />
        </div>
        <div className="overflow-x-auto card bg-white shadow-md p-2 pb-6 mt-2">
          <table className="table table-xs w-full min-w-[768px] table-auto">
            {/* Head */}
            <thead>
              <tr>
                {[
                  "Name",
                  "Prescription",
                  "Visit Date",
                  "Optician",
                  "Deleted At",
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
                      deletedAt,
                    },
                    index
                  ) => (
                    <React.Fragment key={index}>
                      <tr>
                        <td className="border-b border-gray-200">
                          <p className="text-xs font-semibold">
                            {patient.name}
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
                                <span className="text-black">pd </span> {far_pd}
                                /{near_pd}
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
                          {dayjs(deletedAt)
                            .tz("Asia/Jakarta")
                            .format("DD-MM-YYYY")}
                        </td>
                        <td className="w-28">
                          <button
                            className="btn btn-xs btn-ghost btn-circle text-success tooltip"
                            data-tip="Restore"
                            onClick={() => handleRestoreMedicalRecord(id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                          <button
                            className="btn btn-xs btn-ghost btn-circle text-error tooltip"
                            data-tip="Delete"
                            onClick={() => handleDeleteMedicalRecord(id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
                  )
                )
              ) : (
                <LoadingTable row="10" colspan="7" />
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination Medical Record */}
      <div className="flex flex-col justify-center items-center mt-2">
        <div className="join">
          <button
            className="join-item btn btn-sm bg-white"
            disabled={pageMedicalrecord <= 1}
            onClick={() =>
              setPageMedicalpageMedicalrecord(pageMedicalrecord - 1)
            }
          >
            « Prev
          </button>
          <button className="join-item btn btn-sm bg-white font-normal">
            Page {pageMedicalrecord} of{" "}
            {!isLoadingMedicalRecord && dataMedicalRecord.totalPages}
          </button>
          <button
            className="join-item btn btn-sm bg-white"
            disabled={
              pageMedicalrecord >=
              (!isLoadingMedicalRecord && dataMedicalRecord.totalPages)
            }
            onClick={() => setPageMedicalrecord(pageMedicalrecord + 1)}
          >
            Next »
          </button>
        </div>
        <div className="text-xs mt-1">
          Total Data: {!isLoadingMedicalRecord && dataMedicalRecord.totalData}
        </div>
      </div>
    </div>
  );
}

export default RecycleBin;
