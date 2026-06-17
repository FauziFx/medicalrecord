import React, { useState } from "react";
import {
  CircleMinus,
  CirclePlus,
  CornerDownRight,
  User,
  Eye,
  ClipboardList,
  Calendar,
  Plus,
  ArrowLeft,
  FilePlus,
} from "lucide-react";
import api from "@/utils/api";
import useSWR from "swr";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { LoadingTable } from "@/components";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/id";
import Swal from "sweetalert2";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("id");

const formatNama = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export function MedicalRecordDetail() {
  const { id } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const navigate = useNavigate();

  // Validasi ID Angka murni
  if (!/^\d+$/.test(id)) {
    return <Navigate to="/rekam-medis" replace />;
  }

  const [openRow, setOpenRow] = useState(null);
  const toggleRow = (rowId) => {
    setOpenRow(openRow === rowId ? null : rowId);
  };

  const fetcher = async (url) => {
    const response = await api.get(url);
    return response.data;
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

  if (errorPatient)
    return (
      <div className="alert alert-error max-w-md mx-auto mt-10 rounded-2xl">
        Gagal memuat detail pasien.
      </div>
    );
  if (isLoadingPatient)
    return (
      <div className="p-10 text-center">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  if (!dataPatient?.success)
    return (
      <div className="text-center py-10 font-medium">
        Data pasien tidak ditemukan.
      </div>
    );

  const pt = dataPatient.data;

  return (
    <div className="space-y-5">
      {/* HEADER PAGE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 p-4 sm:p-5 rounded-2xl border border-base-300/60 shadow-sm">
        <div className="flex items-center gap-3">
          {/* TOMBOL KEMBALI KANAN/KIRI YANG ERGONOMIS */}
          <button
            onClick={() => navigate(-1)}
            className="btn btn-soft btn-sm btn-square rounded-xl"
            title="Kembali"
          >
            <ArrowLeft className="h-4 w-4 text-base-content/70" />
          </button>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-base-content flex items-center gap-2">
              Detail Pasien
            </h1>
            <p className="text-xs text-base-content/50">
              Data pribadi dan riwayat rekam medis pasien
            </p>
          </div>
        </div>
      </div>

      {/* RESPONSIVE LAYOUT SYSTEM */}
      {/* Di HP: numpuk ke bawah (1 kolom), Di Desktop: Berdampingan (Grid 5 Kolom: 2 Kiri, 3 Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-5">
        {/* ========================================================== */}
        {/* KIRI: INFORMASI DATA PRIBADI PASIEN (2/5 Kolom di Desktop)  */}
        {/* ========================================================== */}
        <div className="lg:col-span-3 card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl overflow-hidden h-fit">
          <div className="card-body p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-base-200">
              <User className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-sm text-base-content">
                Informasi Pasien
              </h2>
            </div>

            {/* List Detail Menggunakan Struktur Ringkas Tanpa Border Tebal */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-base-content/40 block text-[10px] uppercase tracking-wider mb-0.5">
                  Nama Lengkap Pasien
                </span>
                <p className="font-bold text-sm text-base-content tracking-tight">
                  {formatNama(pt.name)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-base-content/40 block text-[10px] uppercase tracking-wider mb-0.5">
                    Jenis Kelamin
                  </span>
                  <span
                    className={`badge badge-sm font-semibold mt-0.5 ${pt.gender === "Perempuan" ? "badge-secondary" : "badge-neutral"}`}
                  >
                    {pt.gender}
                  </span>
                </div>
                <div>
                  <span className="text-base-content/40 block text-[10px] uppercase tracking-wider mb-0.5">
                    Kontak / HP
                  </span>
                  <p className="font-mono font-medium text-base-content/80 mt-0.5">
                    {pt.phone_number || "-"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-base-content/40 block text-[10px] uppercase tracking-wider mb-0.5">
                    Tempat, Tanggal Lahir
                  </span>
                  <p className="font-medium text-base-content/80">
                    {pt.place_of_birth || "-"},{" "}
                    {pt.date_of_birth
                      ? dayjs(pt.date_of_birth).format("DD MMM YYYY")
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-base-content/40 block text-[10px] uppercase tracking-wider mb-0.5">
                    Pekerjaan
                  </span>
                  <p className="font-medium text-base-content/80">
                    {pt.occupation || "-"}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-base-content/40 block text-[10px] uppercase tracking-wider mb-0.5">
                  Alamat Tempat Tinggal
                </span>
                <p className="font-medium text-base-content/70 leading-relaxed bg-base-200/40 p-2.5 rounded-xl border border-base-300/30">
                  {pt.address}
                </p>
              </div>
              <div>
                <span className="text-base-content/40 block text-[10px] uppercase tracking-wider mb-0.5">
                  Toko Pendaftaran / Optik
                </span>
                <p className="font-semibold text-primary">
                  {pt.optic?.optic_name || "-"}
                </p>
              </div>
              <div>
                <span className="text-base-content/40 block text-[10px] uppercase tracking-wider mb-0.5">
                  Riwayat Penyakit Sistemik
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {pt.medicalconditions?.length > 0 ? (
                    pt.medicalconditions.map((item, key) => (
                      <span
                        key={key}
                        className="bg-error/10 text-error font-medium text-[10px] px-2 py-0.5 rounded-md"
                      >
                        {item.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-base-content/30 italic">
                      Tidak ada riwayat penyakit
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* KANAN: LIST DAFTAR RIWAYAT PEMERIKSAAN (3/5 Kolom)         */}
        {/* ========================================================== */}
        <div className="lg:col-span-4 card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl overflow-hidden">
          <div className="card-body p-5">
            <div className="flex justify-between items-center pb-3 border-b border-base-200 mb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" />
                <h2 className="font-bold text-sm text-base-content">
                  Histori Pemeriksaan
                </h2>
              </div>
              <Link
                to="/rekam-medis/tambah"
                state={{ patientId: id, prevPage: location.pathname }}
                className="btn btn-primary btn-xs rounded-lg font-semibold gap-1 shadow-2xs"
              >
                <FilePlus className="h-3 w-3" /> Periksa
              </Link>
            </div>

            {/* TABEL RESPONSIF DENGAN DETAIL RESEP BEBAS TABEL BERSARANG */}
            <div className="overflow-x-auto w-full">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="border-b border-base-200 text-base-content/50 text-[11px] uppercase tracking-wider bg-base-200/40">
                    <th className="py-2.5">Tanggal Periksa</th>
                    <th className="py-2.5">Pemeriksa / Optik</th>
                  </tr>
                </thead>
                <tbody>
                  {pt.medicalRecord?.length > 0 ? (
                    pt.medicalRecord.map((item) => (
                      <React.Fragment key={item.id}>
                        {/* Baris Utama Induk */}
                        <tr
                          onClick={() => toggleRow(item.id)}
                          className="cursor-pointer hover:bg-base-300/50 transition-colors border-b border-base-200"
                        >
                          <td className="py-3 font-medium text-xs text-base-content/90">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-base-content/30" />
                              {dayjs(item.visit_date || item.createdAt).format(
                                "DD MMMM YYYY",
                              )}
                            </div>
                          </td>
                          <td className="py-3">
                            <p className="text-xs font-semibold text-base-content/80">
                              {item.is_olddata ? "—" : item.optic?.optic_name}
                            </p>
                            <p className="text-[10px] text-base-content/50 font-light">
                              {item.is_olddata
                                ? "Data Lama"
                                : `Oleh: ${item.checked_by}`}
                            </p>
                          </td>
                        </tr>

                        {/* Expandable Panel: Grid Resep Kacamata Modern */}
                        {openRow === item.id && (
                          <tr className="bg-base-200/30">
                            <td
                              colSpan={3}
                              className="p-4 border-l-2 border-primary"
                            >
                              <div className="flex items-start gap-2 text-xs w-full">
                                <CornerDownRight className="h-4 w-4 text-base-content/20 mt-1 shrink-0" />
                                <div className="space-y-4 grow">
                                  {/* Catatan Dokter */}
                                  {item.note && (
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider block">
                                        Catatan Tambahan:
                                      </span>
                                      <p className="whitespace-pre-wrap bg-base-100 border border-base-300/50 p-2.5 rounded-xl text-base-content/80 leading-relaxed shadow-3xs">
                                        {item.note}
                                      </p>
                                    </div>
                                  )}

                                  {/* Tombol Lampiran */}
                                  {!item.is_olddata && item.image && (
                                    <button
                                      className="btn btn-xs btn-neutral rounded-lg font-medium shadow-3xs"
                                      onClick={() => showAttachment(item.image)}
                                    >
                                      Lihat Lampiran Gambar
                                    </button>
                                  )}

                                  {/* PANEL VISUAL UKURAN LENSA MATA (SUBSTITUSI TABEL LAMA) */}
                                  <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider block">
                                      Spesifikasi Ukuran Lensa:
                                    </span>

                                    {/* Grid OD & OS Card */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {/* Kartu Mata Kanan (OD) */}
                                      <div className="bg-base-100 border border-base-300/50 rounded-xl p-3 shadow-3xs relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-primary/10 text-primary font-bold text-[10px] px-2 py-0.5 rounded-bl-lg">
                                          OD (Kanan)
                                        </div>
                                        <div className="grid grid-cols-4 gap-1 text-center pt-2">
                                          <div>
                                            <span className="text-[9px] text-base-content/40 uppercase block">
                                              Sph
                                            </span>
                                            <span className="font-mono font-bold text-xs">
                                              {item.od.split("/")[0] || "-"}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-[9px] text-base-content/40 uppercase block">
                                              Cyl
                                            </span>
                                            <span className="font-mono font-bold text-xs">
                                              {item.od.split("/")[1] || "-"}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-[9px] text-base-content/40 uppercase block">
                                              Axis
                                            </span>
                                            <span className="font-mono font-bold text-xs">
                                              {item.od.split("/")[2] || "-"}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-[9px] text-base-content/40 uppercase block">
                                              Add
                                            </span>
                                            <span className="font-mono font-bold text-xs">
                                              {item.od.split("/")[3] || "-"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Kartu Mata Kiri (OS) */}
                                      <div className="bg-base-100 border border-base-300/50 rounded-xl p-3 shadow-3xs relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-secondary/10 text-secondary font-bold text-[10px] px-2 py-0.5 rounded-bl-lg">
                                          OS (Kiri)
                                        </div>
                                        <div className="grid grid-cols-4 gap-1 text-center pt-2">
                                          <div>
                                            <span className="text-[9px] text-base-content/40 uppercase block">
                                              Sph
                                            </span>
                                            <span className="font-mono font-bold text-xs">
                                              {item.os.split("/")[0] || "-"}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-[9px] text-base-content/40 uppercase block">
                                              Cyl
                                            </span>
                                            <span className="font-mono font-bold text-xs">
                                              {item.os.split("/")[1] || "-"}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-[9px] text-base-content/40 uppercase block">
                                              Axis
                                            </span>
                                            <span className="font-mono font-bold text-xs">
                                              {item.os.split("/")[2] || "-"}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-[9px] text-base-content/40 uppercase block">
                                              Add
                                            </span>
                                            <span className="font-mono font-bold text-xs">
                                              {item.os.split("/")[3] || "-"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Indikator Pupil Distance (PD) */}
                                    {item.far_pd && (
                                      <div className="bg-base-100 border border-base-300/40 rounded-xl p-2.5 px-3 flex justify-between items-center max-w-xs shadow-3xs text-xs">
                                        <span className="font-medium text-base-content/60">
                                          Pupil Distance (PD)
                                        </span>
                                        <span className="font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-lg">
                                          {item.near_pd
                                            ? `${item.far_pd} / ${item.near_pd} mm`
                                            : `${item.far_pd} mm`}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-6 text-xs text-base-content/40 italic"
                      >
                        Belum ada riwayat riwayat pemeriksaan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicalRecordDetail;
