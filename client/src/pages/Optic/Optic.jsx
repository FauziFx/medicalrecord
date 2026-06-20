import React, { useState } from "react";
import api from "@/utils/api";
import useSWR, { useSWRConfig } from "swr";
import { LoadingTable } from "@/components";
import { Pencil, Plus, Trash2, Store, X, Save, ToggleLeft } from "lucide-react";
import Swal from "sweetalert2";

export function Optic() {
  const { mutate } = useSWRConfig();

  // State Kontrol Form & Modal
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [opticName, setOpticName] = useState("");
  const [opticStatus, setOpticStatus] = useState(1); // 1 = Aktif, 0 = Non-Aktif
  const [modalMode, setModalMode] = useState("add"); // "add" atau "edit"

  const fetcher = async (url) => {
    const response = await api.get(url);
    return response.data;
  };

  const {
    data: dataOptic,
    error: errorOptic,
    isLoading: isLoadingOptic,
  } = useSWR("/optic", fetcher);

  // PEMICU MODAL TAMBAH BARU
  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedId(null);
    setOpticName("");
    setOpticStatus(1); // Default langsung aktif saat tambah baru
    document.getElementById("optic_form_modal").showModal();
  };

  // PEMICU MODAL UBAH DATA
  const handleOpenEdit = (id, currentName, currentStatus) => {
    setModalMode("edit");
    setSelectedId(id);
    setOpticName(currentName);
    setOpticStatus(currentStatus); // Ambil status asli toko untuk di-edit di dalam modal
    document.getElementById("optic_form_modal").showModal();
  };

  // LOGIKA SUBMIT (TAMBAH & UBAH DATA - DENGAN ANTI-DOUBLE SUBMIT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      let response;

      if (modalMode === "add") {
        response = await api.post("/optic", {
          optic_name: opticName,
          status: opticStatus,
        });
      } else {
        response = await api.patch(`/optic/${selectedId}`, {
          optic_name: opticName,
          status: Number(opticStatus), // Kirim status baru yang diubah dari dalam modal
        });
      }

      if (response.data.success) {
        mutate("/optic");
        document.getElementById("optic_form_modal").close();
        Swal.fire({
          title: "Berhasil!",
          text:
            modalMode === "add"
              ? "Cabang optik baru berhasil didaftarkan!"
              : "Data cabang optik berhasil diperbarui!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // LOGIKA PENGHAPUSAN DATA
  const handleDelete = (id) => {
    Swal.fire({
      title: "Hapus Permanen?",
      text: "Data cabang toko yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteOptic(id);
      }
    });
  };

  const deleteOptic = async (id) => {
    try {
      const response = await api.delete(`/optic/${id}`);
      mutate("/optic");
      Swal.fire({
        title: "Terhapus!",
        text: response.data.message || "Data berhasil dihapus.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (errorOptic)
    return (
      <div className="alert alert-error max-w-md mx-auto mt-10 rounded-2xl">
        Gagal memuat manajemen data optik.
      </div>
    );

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12">
      {/* HEADER UTAMA */}
      <div className="bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-4 rounded-2xl border border-base-300/60 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-base-content">
            Manajemen Cabang Optik
          </h1>
          <p className="text-xs text-base-content/50">
            Kelola daftar lokasi toko, registrasi cabang baru, serta kontrol
            status operasional
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn btn-primary btn-sm rounded-xl font-bold gap-1.5 shadow-sm w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Tambah Cabang
        </button>
      </div>

      {/* AREA DATA UTAMA */}
      <div className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm overflow-hidden p-2">
        {/* VIEW 1: TAMPILAN MOBILE (KARTU MINIMALIS NYAMAN DI HP) */}
        <div className="block md:hidden divide-y divide-base-200/60">
          {isLoadingOptic ? (
            <div className="p-6 text-center">
              <span className="loading loading-spinner text-primary"></span>
            </div>
          ) : (
            dataOptic?.data?.map((item, index) => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-mono text-base-content/40">
                    Toko #{index + 1}
                  </h4>
                  <p className="text-sm font-bold text-base-content">
                    {item.optic_name}
                  </p>
                  <span
                    className={`badge badge-xs font-bold px-1.5 py-1 rounded ${item.status === 1 ? "badge-primary badge-soft" : "badge-neutral badge-soft"}`}
                  >
                    {item.status === 1 ? "AKTIF" : "NON-AKTIF"}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenEdit(item.id, item.optic_name, item.status)
                    }
                    className="btn btn-ghost btn-xs btn-outline bg-base-200 text-success rounded-lg gap-1"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="btn btn-ghost btn-xs btn-outline bg-base-200 text-error rounded-lg gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* VIEW 2: TAMPILAN DESKTOP (TABEL BERSIH TANPA TOGGLE KLIKS) */}
        <div className="hidden md:block overflow-hidden w-full">
          <table className="table table-sm w-full table-fixed">
            <thead>
              <tr className="border-b border-base-200 text-base-content/50 text-[11px] uppercase tracking-wider bg-base-200/40">
                <th className="w-[10%] text-center py-3">#</th>
                <th className="w-[35%]">Nama Cabang / Toko</th>
                <th className="w-[15%] text-center">Status Sistem</th>
                <th className="w-[15%] text-right pr-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {!isLoadingOptic && dataOptic?.data ? (
                dataOptic.data.map(({ id, optic_name, status }, index) => (
                  <tr
                    key={id}
                    className="hover:bg-base-200/30 border-b border-base-200"
                  >
                    <td className="text-center font-mono text-xs text-base-content/40 py-3">
                      {index + 1}
                    </td>
                    <td className="text-xs font-bold text-base-content truncate">
                      {optic_name}
                    </td>
                    <td className="text-center">
                      <span
                        className={`badge badge-sm font-bold ${status === 1 ? "badge-primary badge-soft" : "badge-neutral badge-soft"}`}
                      >
                        {status === 1 ? "Aktif" : "Non-Aktif"}
                      </span>
                    </td>
                    <td className="text-right pr-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(id, optic_name, status)}
                          className="btn btn-ghost btn-xs btn-outline text-success tooltip gap-1 rounded-lg"
                          data-tip="Ubah Toko"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(id)}
                          className="btn btn-ghost btn-xs btn-outline text-error tooltip gap-1 rounded-lg"
                          data-tip="Hapus Permanen"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <LoadingTable row="6" colspan="4" />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================== */}
      {/* DIALOG MODAL: CENTRAL FORM TAMBAH / UBAH DATA OPTIK         */}
      {/* ========================================================== */}
      <dialog id="optic_form_modal" className="modal modal-middle">
        <div className="modal-box p-0 max-w-sm rounded-t-2xl sm:rounded-2xl bg-base-100 border border-base-300/60 shadow-2xl overflow-hidden flex flex-col">
          {/* HEADER MODAL */}
          <div className="bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-4 flex justify-between items-center border-b border-base-200 shrink-0">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              <div>
                <h3 className="font-extrabold text-sm text-base-content tracking-tight">
                  {modalMode === "add"
                    ? "REGISTRASI OPTIK BARU"
                    : "PERBARUI DATA OPTIK"}
                </h3>
                <p className="text-[9px] text-base-content/40 font-semibold uppercase tracking-wider">
                  {modalMode === "add"
                    ? "Penambahan data cabang toko"
                    : `Mengubah ID Cabang: #${selectedId}`}
                </p>
              </div>
            </div>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost">
                <X className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* FORM ISI UTAMA */}
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="p-5 space-y-4 bg-base-100">
              {/* Input Nama */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Nama Lengkap Cabang Optik *
                </legend>
                <input
                  type="text"
                  placeholder="Masukkan nama cabang (contoh: Cabang Cirebon)"
                  className="input input-bordered input-sm rounded-xl h-9 w-full bg-base-100 text-xs font-medium"
                  required
                  value={opticName}
                  onChange={(e) => setOpticName(e.target.value)}
                />
              </fieldset>

              {/* Input Status (HANYA MUNCUL DI MODAL JIKA DALAM MODE EDIT AGAR LEBIH AMAN) */}
              {modalMode === "edit" && (
                <fieldset className="fieldset">
                  <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                    Status Operasional Cabang Toko
                  </legend>
                  <label className="input input-bordered input-sm flex items-center gap-2 bg-base-100 rounded-xl h-9 w-full">
                    <ToggleLeft className="h-3.5 w-3.5 text-base-content/40" />
                    <select
                      value={opticStatus}
                      onChange={(e) => setOpticStatus(Number(e.target.value))}
                      className="grow text-xs bg-transparent border-none outline-none p-0"
                    >
                      <option value={1}>
                        Aktif (Bisa Digunakan Transaksi)
                      </option>
                      <option value={0}>
                        Non-Aktif (Sistem Cabang Dikunci)
                      </option>
                    </select>
                  </label>
                </fieldset>
              )}
            </div>

            {/* PANEL AKSI FOOTER */}
            <div className="modal-action m-0 p-3 bg-base-200/50 border-t border-base-200 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  document.getElementById("optic_form_modal").close()
                }
                className="btn btn-sm btn-neutral rounded-xl font-bold grow w-1/2"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-sm btn-primary rounded-xl font-bold grow w-1/2 gap-1.5"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading loading-sm loading-spinner"></span>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Simpan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}

export default Optic;
