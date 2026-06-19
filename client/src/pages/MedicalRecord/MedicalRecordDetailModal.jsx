import React, { useState } from "react";
import {
  CircleMinus,
  CirclePlus,
  CornerDownRight,
  User,
  ClipboardList,
  Calendar,
  FilePlus,
  X,
  Eye,
  Contact,
} from "lucide-react";
import api from "@/utils/api";
import useSWR from "swr";
import { Link, useLocation } from "react-router-dom";
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

export function MedicalRecordDetailModal({ patientId, onClose }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const [openRow, setOpenRow] = useState(null);

  const toggleRow = (rowId) => {
    setOpenRow(openRow === rowId ? null : rowId);
  };

  const fetcher = async (url) => {
    const response = await api.get(url);
    return response.data;
  };

  // SWR hanya akan berjalan jika patientId dikirim (Modal Terbuka)
  const {
    data: dataPatient,
    error: errorPatient,
    isLoading: isLoadingPatient,
  } = useSWR(patientId ? `/patient/${patientId}?detail=full` : null, fetcher, {
    revalidateOnFocus: false,
  });

  const showAttachment = (img) => {
    Swal.fire({
      imageUrl: `${API_URL}/upload/image/${img}`,
      showCloseButton: true,
      showConfirmButton: false,
    });
  };

  if (!patientId) return null;

  return (
    <dialog
      id="detail_patient_modal"
      className="modal modal-bottom sm:modal-middle modal-open"
    >
      <div className="modal-box p-0 max-w-2xl rounded-t-2xl sm:rounded-2xl bg-base-100 border border-base-300/60 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* HEADER MODAL (AKSEN DIGITAL HEALTH CARD) */}
        <div className="bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-4 flex justify-between items-center border-b border-base-200 shrink-0">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-extrabold text-base text-base-content tracking-tight">
                BERKAS REKAM MEDIS PASIEN
              </h3>
              <p className="text-[10px] text-base-content/40 font-mono tracking-wider uppercase">
                ID Pasien: #{patientId}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* BODY MODAL DENGAN SCROLL INDEPENDEN */}
        <div className="p-5 space-y-5 overflow-y-auto grow [scrollbar-width:thin] bg-base-200/20">
          {errorPatient && (
            <div className="alert alert-error text-xs rounded-xl">
              Gagal memuat rekam medis.
            </div>
          )}

          {isLoadingPatient ? (
            <div className="py-12 text-center">
              <span className="loading loading-spinner text-primary"></span>
            </div>
          ) : (
            dataPatient?.success && (
              <>
                {/* SECTION 1: PROFIL RINGKAS FISIK PASIEN (KARTU ATAS) */}
                <div className="card bg-base-100 border border-base-300/60 shadow-3xs p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 pb-1.5 border-b border-base-200">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-extrabold text-base-content/50 uppercase tracking-wider">
                      Identitas Pasien
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                    <div>
                      <span className="text-base-content/40 block text-[9px] uppercase font-bold">
                        Nama Lengkap
                      </span>
                      <p className="font-extrabold text-base-content text-sm tracking-tight">
                        {formatNama(dataPatient.data.name)}
                      </p>
                    </div>
                    <div>
                      <span className="text-base-content/40 block text-[9px] uppercase font-bold">
                        Kontak / WhatsApp
                      </span>
                      <p className="font-mono font-bold text-base-content/80 mt-0.5">
                        {dataPatient.data.phone_number || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-base-content/40 block text-[9px] uppercase font-bold">
                        Gender & Umur
                      </span>
                      <p className="font-semibold text-base-content/80 mt-0.5">
                        {dataPatient.data.gender} •{" "}
                        {dayjs().diff(
                          dayjs(dataPatient.data.date_of_birth?.split("T")[0]),
                          "year",
                        )}{" "}
                        Tahun
                      </p>
                    </div>
                    <div>
                      <span className="text-base-content/40 block text-[9px] uppercase font-bold">
                        Pekerjaan
                      </span>
                      <p className="font-semibold text-base-content/80 mt-0.5">
                        {dataPatient.data.occupation || "—"}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-base-content/40 block text-[9px] uppercase font-bold">
                        Alamat Rumah
                      </span>
                      <p className="font-medium text-base-content/70 leading-relaxed mt-0.5">
                        {dataPatient.data.address}
                      </p>
                    </div>

                    {/* Kondisi Medis */}
                    <div className="sm:col-span-2 pt-1">
                      <span className="text-base-content/40 block text-[9px] uppercase font-bold mb-1">
                        Riwayat Penyakit Sistemik
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {dataPatient.data.medicalconditions?.length > 0 ? (
                          dataPatient.data.medicalconditions.map(
                            (item, key) => (
                              <span
                                key={key}
                                className="bg-error/10 text-error font-extrabold text-[9px] px-2 py-0.5 rounded"
                              >
                                {item.name.toUpperCase()}
                              </span>
                            ),
                          )
                        ) : (
                          <span className="text-base-content/30 italic text-[11px]">
                            Tidak ada riwayat penyakit
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: HISTORI KUNJUNGAN & RESEP LENSA (KARTU BAWAH) */}
                <div className="card bg-base-100 border border-base-300/60 shadow-3xs p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center pb-1.5 border-b border-base-200">
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-extrabold text-base-content/50 uppercase tracking-wider">
                        Histori Hasil Refraksi
                      </span>
                    </div>
                    <Link
                      to="/rekam-medis/tambah"
                      state={{
                        patientId: patientId,
                        prevPage: location.pathname,
                      }}
                      className="btn btn-primary btn-xs rounded-lg font-bold gap-1 shadow-3xs px-2.5"
                    >
                      <FilePlus className="h-3 w-3" /> Tambah Periksa
                    </Link>
                  </div>

                  {/* List Pemeriksaan Accordion */}
                  <div className="divide-y divide-base-200/60">
                    {dataPatient.data.medicalRecord?.length > 0 ? (
                      dataPatient.data.medicalRecord.map((item) => (
                        <div key={item.id} className="py-2.5 space-y-2">
                          {/* Judul Row Accordion */}
                          <div
                            onClick={() => toggleRow(item.id)}
                            className="flex justify-between items-center cursor-pointer p-1.5 hover:bg-base-200/50 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-3 text-xs">
                              <div className="flex items-center gap-1 font-bold text-base-content/80">
                                <Calendar className="h-3.5 w-3.5 text-base-content/30" />
                                {dayjs(
                                  item.visit_date || item.createdAt,
                                ).format("DD MMM YYYY")}
                              </div>
                              <span className="text-[11px] text-base-content/40">
                                |
                              </span>
                              <div className="text-[11px] text-base-content/50">
                                {item.is_olddata
                                  ? "Data Lama"
                                  : `Oleh: ${item.checked_by}`}
                              </div>
                            </div>
                            <div>
                              {openRow === item.id ? (
                                <CircleMinus className="h-4 w-4 text-error" />
                              ) : (
                                <CirclePlus className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          </div>

                          {/* Konten Dropdown Resep Lensa Matriks */}
                          {openRow === item.id && (
                            <div className="pl-4 pr-1 pb-2 space-y-3 border-l-2 border-primary/40 mt-1">
                              {/* Catatan Dokter */}
                              {item.note && (
                                <div className="space-y-0.5">
                                  <span className="text-[9px] font-bold text-base-content/40 uppercase tracking-wider block">
                                    Catatan / Detail Item:
                                  </span>
                                  <p className="whitespace-pre-wrap bg-base-200/30 border border-base-300/40 p-2 rounded-lg text-xs text-base-content/80 leading-relaxed font-sans">
                                    {item.note}
                                  </p>
                                </div>
                              )}

                              {/* Tombol Lampiran */}
                              {!item.is_olddata && item.image && (
                                <button
                                  className="btn btn-xs btn-neutral rounded-lg font-semibold shadow-3xs"
                                  onClick={() => showAttachment(item.image)}
                                >
                                  Lihat Lampiran Gambar
                                </button>
                              )}

                              {/* Matriks Ukuran Kacamata */}
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-bold text-base-content/40 uppercase tracking-wider block">
                                  Spesifikasi Lensa (OD/OS):
                                </span>
                                <div className="border border-base-300/70 rounded-xl overflow-hidden shadow-3xs bg-base-100">
                                  <table className="table table-xs w-full text-center border-none font-mono">
                                    <thead>
                                      <tr className="bg-base-200/50 text-[9px] font-bold text-base-content/40 border-b border-base-200">
                                        <th className="py-1.5 text-left pl-2.5 font-sans">
                                          MATA
                                        </th>
                                        <th className="py-1.5">SPH</th>
                                        <th className="py-1.5">CYL</th>
                                        <th className="py-1.5">AXIS</th>
                                        <th className="py-1.5">ADD</th>
                                        <th className="py-1.5 pr-2.5 font-sans">
                                          PD
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="text-[11px] font-bold text-base-content/90">
                                      <tr className="border-b border-base-200/60">
                                        <td className="py-1.5 text-left pl-2.5 font-sans text-primary">
                                          OD (R)
                                        </td>
                                        <td className="py-1.5 bg-primary/2%">
                                          {item.od?.split("/")[0] || "0.00"}
                                        </td>
                                        <td className="py-1.5">
                                          {item.od?.split("/")[1] || "—"}
                                        </td>
                                        <td className="py-1.5">
                                          {item.od?.split("/")[2] || "—"}
                                        </td>
                                        <td className="py-1.5">
                                          {item.od?.split("/")[3] || "—"}
                                        </td>
                                        <td
                                          className="py-1.5 pr-2.5 align-middle font-sans text-base-content/50"
                                          rowSpan={2}
                                        >
                                          {item.far_pd
                                            ? item.near_pd
                                              ? `${item.far_pd}/${item.near_pd}`
                                              : `${item.far_pd}`
                                            : "—"}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="py-1.5 text-left pl-2.5 font-sans text-secondary">
                                          OS (L)
                                        </td>
                                        <td className="py-1.5 bg-secondary/2%">
                                          {item.os?.split("/")[0] || "0.00"}
                                        </td>
                                        <td className="py-1.5">
                                          {item.os?.split("/")[1] || "—"}
                                        </td>
                                        <td className="py-1.5">
                                          {item.os?.split("/")[2] || "—"}
                                        </td>
                                        <td className="py-1.5">
                                          {item.os?.split("/")[3] || "—"}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-6 text-xs text-base-content/40 italic">
                        Belum ada riwayat rekam medis.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )
          )}
        </div>

        {/* FOOTER ACTION PANEL MODAL */}
        <div className="modal-action m-0 p-3 bg-base-200/50 border-t border-base-200 shrink-0">
          <button
            onClick={onClose}
            className="btn btn-sm btn-neutral rounded-xl font-bold w-full sm:w-28 sm:ml-auto"
          >
            Tutup Berkas
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default MedicalRecordDetailModal;
