import React, { useState } from "react";
import { CircleMinus, CirclePlus, CornerDownRight, Save } from "lucide-react";
import api from "@/utils/api";
import useSWR from "swr";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
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

export function Details() {
  const { id } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;
  const location = useLocation();

  // Validasi
  if (!/^\d+$/.test(id)) {
    return <Navigate to="/medical-record/patients" replace />;
  }

  const [openRow, setOpenRow] = useState(null); // Menyimpan ID baris yang terbuka
  const toggleRow = (rowId) => {
    setOpenRow(openRow === rowId ? null : rowId); // Buka/tutup baris
  };

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
  } = useSWR(`/patient/${id}?detail=full`, fetcher);

  const showAttachment = (img) => {
    Swal.fire({
      imageUrl: `${API_URL}/upload/image/${img}`,
      showCloseButton: true,
      showConfirmButton: false,
    });
  };

  if (errorPatient) return <p>Error loading data.</p>;
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Patient Details</h1>
      <div className="grid md:grid-cols-5 gap-4">
        <div className="md:col-span-2 card carx-sm bg-white shadow-md">
          <div className="card-body p-4">
            <h2 className="card-title">Informasi Pasien</h2>
            <table className="table table-xs md:table-sm max-w-md rounded-box border border-base-content/5 bg-base-100">
              <tbody>
                {isLoadingPatient ? (
                  <LoadingTable row="8" colspan="3" />
                ) : dataPatient.success ? (
                  <>
                    <tr>
                      <th width="35%">Nama</th>
                      <td width="1%">:</td>
                      <th className="uppercase">{dataPatient.data.name}</th>
                    </tr>
                    <tr>
                      <th>Optik</th>
                      <td>:</td>
                      <td>{dataPatient.data.optic.optic_name}</td>
                    </tr>
                    <tr>
                      <th>Jenis Kelamin</th>
                      <td>:</td>
                      <td>{dataPatient.data.gender}</td>
                    </tr>
                    <tr>
                      <th>Alamat</th>
                      <td>:</td>
                      <td>{dataPatient.data.address}</td>
                    </tr>
                    <tr>
                      <th>TTL</th>
                      <td>:</td>
                      <td>
                        {dataPatient.data.place_of_birth},{" "}
                        {dayjs(dataPatient.data.date_of_birth)
                          .tz("Asia/Jakarta")
                          .format("DD MMM YYYY")}
                      </td>
                    </tr>
                    <tr>
                      <th>Pekerjaan</th>
                      <td>:</td>
                      <td>{dataPatient.data.occupation}</td>
                    </tr>
                    <tr>
                      <th className="align-top">Riwayat Penyakit</th>
                      <td className="align-top">:</td>
                      <td>
                        <ul className="list-inside list-disc">
                          {dataPatient.data.medicalconditions.length >= 1 &&
                            dataPatient.data.medicalconditions.map(
                              (item, key) => <li key={key}>{item.name}</li>
                            )}
                        </ul>
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center">
                      Data Not Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="md:col-span-3 card carx-sm bg-white shadow-md">
          <div className="card-body p-4">
            <div className="flex flex-col md:flex-row md:justify-between">
              <h2 className="card-title">Daftar Pemeriksaan</h2>
              <div>
                <Link
                  to="/medical-record/add-medical-record"
                  state={{ patientId: id, prevPage: location.pathname }}
                  className="btn btn-primary btn-xs"
                >
                  + Tambah Pemeriksaan
                </Link>
              </div>
            </div>
            <table className="table table-sm table-auto border-collapse border border-gray-300 w-full text-left">
              <thead>
                <tr>
                  {["Date", "Optician", "Detail"].map((el) => (
                    <th key={el} className="border border-gray-300 px-4 py-2">
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
              <tbody>
                {isLoadingPatient ? (
                  <LoadingTable row="8" colspan="3" />
                ) : dataPatient.data.medicalRecord.length >= 1 ? (
                  dataPatient.data.medicalRecord.map((item) => (
                    <React.Fragment key={item.id}>
                      <tr
                        onClick={() => toggleRow(item.id)}
                        className="cursor-pointer hover:bg-gray-200"
                      >
                        <td className="border border-gray-300 ">
                          {item.visit_date
                            ? dayjs(item.visit_date)
                                .tz("Asia/Jakarta")
                                .format("DD MMM YYYY")
                            : dayjs(item.createdAt)
                                .tz("Asia/Jakarta")
                                .format("DD MMM YYYY")}
                        </td>
                        <td className="border border-gray-300 ">
                          <p className="text-xs font-semibold">
                            {item.is_olddata ? "" : item.optic.optic_name}
                          </p>
                          <p className="text-xs text-gray-500 font-light">
                            {item.is_olddata ? "Ukuran Lama" : item.checked_by}
                          </p>
                        </td>
                        <td className="border border-gray-300 ">
                          {openRow === item.id ? (
                            <CircleMinus className="h-4 w-4" />
                          ) : (
                            <CirclePlus className="h-4 w-4" />
                          )}
                        </td>
                      </tr>
                      {openRow === item.id && (
                        <tr className="bg-gray-100">
                          <td
                            className="border border-gray-300 px-4 py-2"
                            colSpan={3}
                          >
                            <div className="md:flex md:items-start gap-2 w-full">
                              <CornerDownRight className="h-4 w-4" />
                              <div>
                                <p className="whitespace-pre-wrap">
                                  {item.note}
                                </p>
                                {!item.is_olddata && (
                                  <button
                                    className="btn btn-xs btn-neutral my-1"
                                    onClick={() => showAttachment(item.image)}
                                  >
                                    Lihat Lampiran
                                  </button>
                                )}
                                <table className="table table-auto">
                                  <tbody>
                                    <tr>
                                      <th className="border border-gray-300 py-0"></th>
                                      <th className="border border-gray-300 py-0">
                                        Sph
                                      </th>
                                      <th className="border border-gray-300 py-0">
                                        Cyl
                                      </th>
                                      <th className="border border-gray-300 py-0">
                                        Axis
                                      </th>
                                      <th className="border border-gray-300 py-0">
                                        Add
                                      </th>
                                      <th className="border border-gray-300 py-0">
                                        PD
                                      </th>
                                    </tr>
                                    <tr>
                                      <th className="border border-gray-300 py-0">
                                        OD
                                      </th>
                                      <td className="border border-gray-300 py-0">
                                        {item.od.split("/")[0]}
                                      </td>
                                      <td className="border border-gray-300 py-0">
                                        {item.od.split("/")[1]}
                                      </td>
                                      <td className="border border-gray-300 py-0">
                                        {item.od.split("/")[2]}
                                      </td>
                                      <td className="border border-gray-300 py-0">
                                        {item.od.split("/")[3]}
                                      </td>
                                      <td
                                        className="border border-gray-300 py-0"
                                        rowSpan={2}
                                      >
                                        {item.far_pd && item.near_pd
                                          ? `${item.far_pd}/${item.near_pd}`
                                          : item.far_pd
                                          ? item.far_pd
                                          : null}
                                      </td>
                                    </tr>
                                    <tr>
                                      <th className="border border-gray-300 py-0">
                                        OS
                                      </th>
                                      <td className="border border-gray-300 py-0">
                                        {item.os.split("/")[0]}
                                      </td>
                                      <td className="border border-gray-300 py-0">
                                        {item.os.split("/")[1]}
                                      </td>
                                      <td className="border border-gray-300 py-0">
                                        {item.os.split("/")[2]}
                                      </td>
                                      <td className="border border-gray-300 py-0">
                                        {item.os.split("/")[3]}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center">
                      Data Not Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Details;
