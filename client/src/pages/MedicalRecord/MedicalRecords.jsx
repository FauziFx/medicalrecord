import React, { useState } from "react";
import api from "@/utils/api";
import useSWR, { useSWRConfig } from "swr";
import { LoadingTable } from "@/components";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/id";
import { Link, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { useDebounce } from "@/hooks/useDebounce";
import {
  FilePlus,
  Info,
  Pencil,
  Plus,
  Trash2,
  Search,
  Store,
  Calendar,
  CirclePlus,
  CircleMinus,
  CornerDownRight,
  Users,
  ClipboardList,
} from "lucide-react";
import { format } from "date-fns";
import MedicalRecordDetailModal from "./MedicalRecordDetailModal";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("id");

// Fungsi pembantu penulisan nama (Title Case)
const formatNama = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export function MedicalRecords() {
  const userRole = Cookies.get("token")
    ? jwtDecode(Cookies.get("token")).role
    : "";
  const { mutate } = useSWRConfig();
  const location = useLocation();

  // STATE MANAGEMENT
  const [name, setName] = useState("");
  const [opticId, setOpticId] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(1);

  const [activePatientId, setActivePatientId] = useState(null);

  const [state, setState] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  const handleDateChange = (item) => {
    setState([item.selection]);
    setStartDate(format(item.selection.startDate, "yyyy-MM-dd"));
    setEndDate(format(item.selection.endDate, "yyyy-MM-dd"));
  };

  const resetDate = () => {
    setState([
      {
        startDate: null,
        endDate: null,
        key: "selection",
      },
    ]);
    setStartDate(null);
    setEndDate(null);
  };

  const limit = 15;
  const API_URL = import.meta.env.VITE_API_URL;

  const debouncedName = useDebounce(name, 500);
  const debouncedOpticId = useDebounce(opticId, 300);
  const debouncedStartDate = useDebounce(startDate, 500);
  const debouncedEndDate = useDebounce(endDate, 500);

  // QUERY GENERATOR
  const query = new URLSearchParams({ page, limit });
  if (name) query.append("name", debouncedName);
  if (opticId) query.append("opticId", debouncedOpticId);
  if (startDate) query.append("startDate", debouncedStartDate);
  if (endDate) query.append("endDate", debouncedEndDate);

  // FETCHER SWR
  const fetcher = async (url) => {
    const response = await api.get(url);
    return response.data;
  };

  const { data: dataOptic } = useSWR(`/optic?status=active`, fetcher);

  // Memuat data secara dinamis tergantung tab aktif
  const endpoint = `/patient?${query.toString()}`;
  const { data: mainData, error, isLoading } = useSWR(endpoint, fetcher);

  // HANDLERS
  const handleHapusPasien = (id) => {
    Swal.fire({
      title: "Pindahkan ke Tempat Sampah?",
      text: "Data pasien akan dinonaktifkan.",
      icon: "warning",
      showDenyButton: true,
      confirmButtonText: "Batal",
      denyButtonText: "Ya, Hapus",
      denyButtonColor: "var(--color-error)",
    }).then(async (result) => {
      if (result.isDenied) {
        const res = await api.delete(`/patient/${id}`);
        if (res.data.success) {
          mutate(endpoint);
          Swal.fire("Berhasil", "Data pasien berhasil dihapus.", "success");
        }
      }
    });
  };

  const handleHapusRekamMedis = (id) => {
    Swal.fire({
      title: "Hapus Rekam Medis?",
      icon: "warning",
      showDenyButton: true,
      confirmButtonText: "Batal",
      denyButtonText: "Ya, Hapus",
      denyButtonColor: "var(--color-error)",
    }).then(async (result) => {
      if (result.isDenied) {
        const res = await api.delete(`/medicalrecord/${id}`);
        if (res.data.success) {
          mutate(endpoint);
          Swal.fire("Berhasil", "Data rekam medis dihapus.", "success");
        }
      }
    });
  };

  const lihatLampiran = (img) => {
    Swal.fire({
      imageUrl: `${API_URL}/upload/image/${img}`,
      showCloseButton: true,
      showConfirmButton: false,
    });
  };

  return (
    <div className="space-y-4">
      {/* HEADER UTAMA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-4 rounded-2xl border border-base-300/60 shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-base-content">
            Sistem Rekam Medis
          </h1>
          <p className="text-xs text-base-content/50">
            Kelola master data pasien dan log riwayat pemeriksaan optik
          </p>
        </div>
        <Link
          to="/rekam-medis/tambah-pasien"
          className="btn btn-primary btn-sm rounded-xl font-semibold gap-1.5 shadow-sm w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Tambah Pasien
        </Link>
      </div>

      {/* KARTU FILTER PANEL */}
      <div className="card bg-base-100 border border-base-300/60 shadow-sm p-4 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Cari Nama */}
          <label className="input input-bordered input-sm flex items-center gap-2 bg-base-100 rounded-xl">
            <Search className="h-3.5 w-3.5 text-base-content/40" />
            <input
              type="search"
              placeholder="Cari nama..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="grow text-xs"
            />
          </label>

          {/* Pilih Optik */}
          <label className="input input-bordered input-sm flex items-center gap-2 bg-base-100 rounded-xl">
            <Store className="h-3.5 w-3.5 text-base-content/40" />
            <select
              value={opticId}
              onChange={(e) => setOpticId(e.target.value)}
              className="grow text-xs bg-transparent border-none outline-none focus:ring-0 p-0"
            >
              <option value="">Semua Toko/Optik</option>
              {dataOptic?.data?.map((item, idx) => (
                <option key={idx} value={item.id}>
                  {item.optic_name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center">
            <div className="dropdown dropdown-bottom w-full">
              <div
                tabIndex={0}
                role="button"
                className={`btn btn-sm bg-base-100 flex items-center text-xs justify-start font-normal ${startDate && endDate ? "rounded-e-none rounded-s-xl" : "rounded-xl"}`}
              >
                <Calendar className="h-3.5 w-3.5 text-base-content/40" />
                {startDate === endDate || !startDate || !endDate
                  ? "Semua Tanggal"
                  : `${format(new Date(startDate), "dd/MM/yyyy")} - ${format(
                      new Date(endDate),
                      "dd/MM/yyyy",
                    )}`}
              </div>
              <ul
                tabIndex="-1"
                className="dropdown-content menu bg-base-100 rounded-box z-1 p-2 shadow-sm"
              >
                <div>
                  <DateRange
                    editableDateInputs={true}
                    onChange={handleDateChange}
                    maxDate={new Date()}
                    moveRangeOnFirstSelection={false}
                    ranges={state}
                  />
                </div>
              </ul>
            </div>
            {startDate && endDate && (
              <button
                className="btn btn-sm btn-error rounded-full hover:text-error/70 rounded-s-none rounded-e-xl"
                onClick={(e) => {
                  e.stopPropagation();
                  resetDate();
                }}
              >
                x
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AREA DATA UTAMA */}
      <div className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm overflow-hidden p-2">
        {isLoading ? (
          <div className="p-6 text-center">
            <span className="loading loading-spinner text-primary"></span>
          </div>
        ) : error ? (
          <div className="p-4 text-error text-center text-xs font-medium">
            Gagal memuat data dari server.
          </div>
        ) : (
          /* ======================================= */
          /* TAB 1: DATA PASIEN (MOBILE & DESKTOP)   */
          /* ======================================= */
          <div>
            {/* LAYOUT KHUSUS MOBILE (Akan muncul di layar < md) */}
            <div className="md:hidden divide-y divide-base-200/60">
              {mainData?.data?.map((pt, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-base-100 rounded-xl border border-base-300/40 shadow-xs mb-3 space-y-3"
                >
                  {/* Baris Atas: Nama & Gender */}
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-base-content truncate">
                        {formatNama(pt.name)}
                      </h4>
                      <p className="text-xs font-mono text-base-content/50 mt-0.5">
                        {pt.phone_number || "-"}
                      </p>
                    </div>
                    <span
                      className={`badge badge-xs font-bold shrink-0 ${pt.gender === "Perempuan" ? "badge-secondary" : "badge-neutral"}`}
                    >
                      {pt.gender === "Perempuan" ? "P" : "L"} •{" "}
                      {dayjs().diff(
                        dayjs(pt.date_of_birth?.split("T")[0]),
                        "year",
                      )}{" "}
                      Thn
                    </span>
                  </div>

                  {/* Baris Tengah: Detail Alamat Singkat */}
                  <div className="text-xs text-base-content/60 line-clamp-2 bg-base-200 p-2 rounded-lg">
                    <span className="font-semibold text-base-content/80 block text-[10px] uppercase tracking-wider mb-0.5">
                      Alamat:
                    </span>
                    {pt.address}
                  </div>

                  {/* Baris Bawah: Aksi Cepat Menggunakan Tombol Berjarak Aman */}
                  <div className="flex justify-between items-center pt-2 border-t border-base-200/60">
                    <span className="text-[10px] text-base-content/40 font-mono">
                      Reg: {dayjs(pt.createdAt).format("DD MMM YY")}
                    </span>

                    <div className="flex gap-1">
                      {/* Tombol Prioritas Utama untuk Mobile: Input Rekam Medis Baru */}
                      <Link
                        to="/rekam-medis/tambah"
                        state={{
                          patientId: pt.id,
                          prevPage: location.pathname,
                        }}
                        className="btn btn-primary btn-xs rounded-lg gap-1"
                      >
                        <FilePlus className="h-3 w-3" /> Periksa
                      </Link>

                      <button
                        onClick={() => setActivePatientId(pt.id)}
                        className="btn btn-outline btn-xs rounded-lg"
                      >
                        Detail
                      </button>
                      {/* Tombol Edit dimasukkan ke Dropdown jika di mobile agar tidak sempit */}
                      <div className="dropdown dropdown-end dropdown-top">
                        <div
                          tabIndex={0}
                          role="button"
                          className="btn btn-ghost btn-xs px-2 rounded-lg"
                        >
                          •••
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu p-1.5 shadow-xl bg-base-100 rounded-xl border border-base-300/60 w-32 z-50 mb-1"
                        >
                          <li>
                            <Link
                              to={`/rekam-medis/${pt.id}/edit`}
                              className="text-xs py-1.5 text-success"
                            >
                              Ubah Data
                            </Link>
                          </li>
                          {userRole === "admin" && (
                            <li>
                              <button
                                onClick={() => handleHapusPasien(pt.id)}
                                className="text-xs py-1.5 text-error"
                              >
                                Hapus
                              </button>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* LAYOUT KHUSUS DESKTOP (Akan tersembunyi di layar mobile, muncul di >= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="table table-xs w-full min-w-[768px] table-auto mt-4">
                {/* Head */}
                <thead>
                  <tr className="border-b border-base-200 text-base-content/50 text-[11px] uppercase tracking-wider bg-base-200/40">
                    {/* Kita atur persentase atau lebar statis kolom di thead agar proporsional */}
                    <th className="w-12 text-center py-3">#</th>
                    <th className="w-[22%] text-left">Biodata Pasien</th>
                    <th className="w-[15%] text-center">Gender & Umur</th>
                    <th className="w-[25%] text-left">Alamat Tinggal</th>
                    <th className="w-[18%] text-left">Cabang / Tgl Daftar</th>
                    <th className="w-[20%] text-center pr-4">Aksi</th>
                  </tr>
                </thead>
                {/* Body */}
                <tbody>
                  {mainData?.data?.map((pt, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-base-200/30 border-b border-base-200"
                    >
                      <td className="text-center font-mono text-xs text-base-content/40">
                        {(page - 1) * limit + idx + 1}
                      </td>
                      <td className="truncate">
                        <p className="text-xs font-bold text-base-content truncate">
                          {formatNama(pt.name)}
                        </p>
                        <p className="text-[11px] font-mono text-base-content/50 truncate">
                          {pt.phone_number || "-"}
                        </p>
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge badge-xs font-semibold ${pt.gender === "Perempuan" ? "badge-secondary" : "badge-neutral"}`}
                        >
                          {pt.gender === "Perempuan" ? "P" : "L"}
                        </span>
                        <p className="text-[11px] font-medium text-base-content/60 mt-0.5">
                          {dayjs().diff(
                            dayjs(pt.date_of_birth?.split("T")[0]),
                            "year",
                          )}{" "}
                          Tahun
                        </p>
                      </td>
                      <td className="text-xs text-base-content/70 max-w-[220px] truncate">
                        {pt.address}
                      </td>
                      <td>
                        <p className="text-xs font-semibold text-base-content/80">
                          {pt.optic?.optic_name}
                        </p>
                        <p className="text-[10px] text-base-content/40 font-mono">
                          {dayjs(pt.createdAt).format("DD-MM-YYYY")}
                        </p>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {/* Tombol Prioritas Utama untuk Mobile: Input Rekam Medis Baru */}
                          <Link
                            to="/rekam-medis/tambah"
                            state={{
                              patientId: pt.id,
                              prevPage: location.pathname,
                            }}
                            className="btn btn-primary btn-xs rounded-lg gap-1"
                          >
                            <FilePlus className="h-3 w-3" /> Periksa
                          </Link>
                          <button
                            onClick={() => setActivePatientId(pt.id)}
                            className="btn btn-outline btn-xs rounded-lg"
                          >
                            Detail
                          </button>

                          {userRole === "admin" ? (
                            <div className="dropdown dropdown-end dropdown-top">
                              <div
                                tabIndex={0}
                                role="button"
                                className="btn btn-ghost btn-xs px-2 rounded-lg"
                              >
                                •••
                              </div>
                              <ul
                                tabIndex={0}
                                className="dropdown-content menu p-1.5 shadow-xl bg-base-100 rounded-xl border border-base-300/60 w-32 z-auto mb-1"
                              >
                                <li>
                                  <Link
                                    to={`/rekam-medis/${pt.id}/edit`}
                                    className="text-xs py-1.5 text-success"
                                  >
                                    Ubah Data
                                  </Link>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleHapusPasien(pt.id)}
                                    className="text-xs py-1.5 text-error"
                                  >
                                    Hapus
                                  </button>
                                </li>
                              </ul>
                            </div>
                          ) : (
                            <Link
                              to={`/rekam-medis/${pt.id}/edit`}
                              className="btn btn-success btn-xs rounded-lg"
                            >
                              Edit
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* PAGINASI GLOBAL */}
      {!isLoading && mainData && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 bg-base-100 p-3 rounded-2xl border border-base-300/60 shadow-2xs">
          <div className="text-xs text-base-content/50">
            Total Data:{" "}
            <span className="font-bold text-base-content">
              {mainData.totalData || 0}
            </span>
          </div>
          <div className="join">
            <button
              className="join-item btn btn-xs px-3 bg-base-100"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              «
            </button>
            <button className="join-item btn btn-xs font-semibold bg-base-200 no-animation">
              Hal {page} dari {mainData.totalPages || 1}
            </button>
            <button
              className="join-item btn btn-xs px-3 bg-base-100"
              disabled={page >= mainData.totalPages}
              onClick={() => setPage(page + 1)}
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* Modal Medical Record Detail*/}
      {activePatientId && (
        <MedicalRecordDetailModal
          patientId={activePatientId}
          onClose={() => setActivePatientId(null)} // Reset ke null untuk menutup modal
        />
      )}
    </div>
  );
}

export default MedicalRecords;
