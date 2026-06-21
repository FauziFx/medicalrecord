import React, { useState } from "react";
import api from "@/utils/api";
import useSWR, { useSWRConfig } from "swr";
import { LoadingTable } from "@/components";
import {
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  X,
  Save,
  Shield,
  Store,
  Mail,
  Key,
  ToggleLeft,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

export function Users() {
  const idLoggedIn = jwtDecode(Cookies.get("token")).id;
  const { mutate } = useSWRConfig();

  // State Kontrol Modal Form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [modalMode, setModalMode] = useState("add");

  // State Field Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [opticId, setOpticId] = useState("");
  const [userStatus, setUserStatus] = useState(1); // 1 = Aktif, 0 = Terblokir

  const fetcher = async (url) => {
    const response = await api.get(url);
    return response.data;
  };

  const { data, error, isLoading } = useSWR("/user", fetcher);

  const { data: opticsList } = useSWR(
    "/optic?status=active",
    async (url) => {
      const res = await api.get(url);
      return res.data;
    },
    { revalidateOnFocus: false },
  );

  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("user");
    setOpticId("");
    setUserStatus(1); // Default aktif saat buat baru
    document.getElementById("user_form_modal").showModal();
  };

  const handleOpenEdit = (user) => {
    setModalMode("edit");
    setSelectedId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
    setOpticId(user.opticId || "");
    setUserStatus(user.status); // Ambil status asli untuk di-edit di dalam modal
    document.getElementById("user_form_modal").showModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      let response;

      const payload = {
        name,
        email,
        password,
        role,
        opticId: opticId || null,
        status: Number(userStatus), // Status ikut dikirim via form submit modal
      };

      if (modalMode === "add") {
        response = await api.post("/user", payload);
      } else {
        response = await api.patch(`/user/${selectedId}`, payload);
      }

      if (response.data.success) {
        mutate("/user");
        document.getElementById("user_form_modal").close();
        Swal.fire({
          title: "Berhasil!",
          text:
            modalMode === "add"
              ? "User berhasil didaftarkan!"
              : "Data akun berhasil diperbarui!",
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

  const handleDelete = (id) => {
    Swal.fire({
      title: "Hapus Akun Pengguna?",
      text: "Tindakan ini tidak bisa dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser(id);
      }
    });
  };

  const deleteUser = async (id) => {
    try {
      const response = await api.delete(`/user/${id}`);
      if (response.data.success) {
        mutate("/user");
        Swal.fire({
          title: "Terhapus!",
          text: response.data.message || "Pengguna berhasil dihapus.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (error)
    return (
      <div className="alert alert-error max-w-md mx-auto mt-10 rounded-2xl">
        Gagal memuat manajemen data pengguna.
      </div>
    );

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12">
      {/* HEADER UTAMA */}
      <div className="bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-4 rounded-2xl border border-base-300/60 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-base-content">
            Manajemen Pengguna & Staf
          </h1>
          <p className="text-xs text-base-content/50">
            Atur kredensial, tingkat hak akses, dan penempatan cabang optik staf
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn btn-primary btn-sm rounded-xl font-bold gap-1.5 shadow-sm w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4" /> Tambah Pengguna
        </button>
      </div>

      {/* AREA DATA UTAMA */}
      <div className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm overflow-hidden p-2">
        {/* VIEW 1: SEKTOR RESPONSIVE MOBILE */}
        <div className="block md:hidden divide-y divide-base-200/60">
          {isLoading ? (
            <div className="p-6 text-center">
              <span className="loading loading-spinner text-primary"></span>
            </div>
          ) : (
            data?.data?.map((user, index) => (
              <div key={user.id} className="p-4 flex flex-col space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-base-content">
                      {user.name}
                    </h4>
                    <p className="text-[11px] text-base-content/40 font-mono">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="badge badge-sm font-bold uppercase bg-base-200 text-base-content/70 border-none text-[9px]">
                      {user.role}
                    </span>
                    <span
                      className={`badge badge-sm font-bold text-[9px] ${user.status === 1 ? "badge-primary badge-soft" : "badge-error badge-soft"}`}
                    >
                      {user.status === 1 ? "AKTIF" : "DIBLOKIR"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 text-xs">
                  <p className="text-base-content/40 font-medium">
                    Cabang:{" "}
                    <span className="text-primary font-bold">
                      {user.optic?.optic_name || "Semua Toko"}
                    </span>
                  </p>
                  {idLoggedIn !== user.id ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(user)}
                        className="btn btn-outline btn-xs btn-success bg-base-200 rounded-lg gap-1"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(user.id)}
                        className="btn btn-outline btn-xs btn-error bg-base-200 rounded-lg gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-base-content/30 italic">
                      Akun Anda
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* VIEW 2: TAMPILAN DESKTOP RINGKAS & AMAN */}
        <div className="hidden md:block overflow-hidden w-full">
          <table className="table table-sm w-full table-fixed">
            <thead>
              <tr className="border-b border-base-200 text-base-content/50 text-[11px] uppercase tracking-wider bg-base-200/40">
                <th className="w-[5%] text-center py-3">#</th>
                <th className="w-[25%]">Nama & Kontak Email</th>
                <th className="w-[10%]">Hak Akses</th>
                <th className="w-[20%]">Cabang</th>
                <th className="w-[10%] text-center">Status Akun</th>
                <th className="w-[15%] text-right pr-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && data?.data ? (
                data.data.map((user, index) => (
                  <tr
                    key={user.id}
                    className="hover:bg-base-200/30 border-b border-base-200"
                  >
                    <td className="text-center font-mono text-xs text-base-content/40 py-3">
                      {index + 1}
                    </td>
                    <td className="truncate">
                      <p className="text-xs font-bold text-base-content truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-base-content/40 font-mono truncate mt-0.5">
                        {user.email}
                      </p>
                    </td>
                    <td className="text-xs font-semibold capitalize text-base-content/80">
                      {user.role}
                    </td>
                    <td className="text-xs font-bold text-dark truncate">
                      {user.optic ? user.optic.optic_name : "Semua Toko"}
                    </td>
                    <td className="text-center">
                      {/* AMAN: Di tabel sekarang murni hanya label indikator statis (bukan tombol toggle) */}
                      <span
                        className={`badge badge-sm font-bold ${user.status === 1 ? "badge-primary badge-soft" : "badge-error badge-soft"}`}
                      >
                        {user.status === 1 ? "Aktif" : "Diblokir"}
                      </span>
                    </td>
                    <td className="text-right pr-4">
                      {idLoggedIn !== user.id ? (
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="btn btn-outline btn-success btn-xs rounded-lg tooltip gap-1"
                            data-tip="Ubah Akun"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user.id)}
                            className="btn btn-outline btn-error btn-xs rounded-lg tooltip gap-1"
                            data-tip="Hapus Akun"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Hapus
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-base-content/30 italic pr-2">
                          Akun Anda
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <LoadingTable row="8" colspan="6" />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================== */}
      {/* DIALOG MODAL: CENTRAL FORM TAMBAH / UBAH USER               */}
      {/* ========================================================== */}
      <dialog id="user_form_modal" className="modal modal-middle">
        <div className="modal-box p-0 max-w-sm rounded-t-2xl sm:rounded-2xl bg-base-100 border border-base-300/60 shadow-2xl overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-4 flex justify-between items-center border-b border-base-200 shrink-0">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <div>
                <h3 className="font-extrabold text-sm text-base-content tracking-tight">
                  {modalMode === "add"
                    ? "DAFTARKAN PENGGUNA BARU"
                    : "PERBARUI AKUN AKSES"}
                </h3>
                <p className="text-[9px] text-base-content/40 font-semibold uppercase tracking-wider">
                  {modalMode === "add"
                    ? "Pembuatan kredensial user baru"
                    : `Mengubah Kredensial ID: #${selectedId}`}
                </p>
              </div>
            </div>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost">
                <X className="h-4 w-4" />
              </button>
            </form>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="p-5 space-y-3.5 bg-base-100 text-xs">
              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Nama Lengkap Anggota Staf *
                </legend>
                <input
                  type="text"
                  placeholder="Nama lengkap"
                  className="input input-bordered input-sm rounded-xl h-9 w-full bg-base-100 font-medium"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Alamat Email *
                </legend>
                <label className="input input-bordered input-sm flex items-center gap-2 bg-base-100 rounded-xl h-9 w-full">
                  <Mail className="h-3.5 w-3.5 text-base-content/40" />
                  <input
                    type="email"
                    placeholder="staf@optic.com"
                    className="grow text-xs font-mono"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  {modalMode === "add"
                    ? "Kata Sandi (Password) *"
                    : "Ganti Kata Sandi (Kosongkan jika tetap)"}
                </legend>
                <label className="input input-bordered input-sm flex items-center gap-2 bg-base-100 rounded-xl h-9 w-full">
                  <Key className="h-3.5 w-3.5 text-base-content/40" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="grow text-xs font-mono"
                    required={modalMode === "add"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Otoritas (Role) *
                </legend>
                <label className="input input-bordered input-sm flex items-center gap-2 bg-base-100 rounded-xl h-9 w-full">
                  <Shield className="h-3.5 w-3.5 text-base-content/40" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="grow text-xs bg-transparent border-none outline-none p-0 capitalize"
                  >
                    <option value="user">User / Kasir</option>
                    <option value="lab">Admin Lab</option>
                    <option value="admin">Administrator</option>
                  </select>
                </label>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Penempatan Cabang
                </legend>
                <label className="input input-bordered input-sm flex items-center gap-2 bg-base-100 rounded-xl h-9 w-full">
                  <Store className="h-3.5 w-3.5 text-base-content/40" />
                  <select
                    value={opticId}
                    onChange={(e) => setOpticId(e.target.value)}
                    className="grow text-xs bg-transparent border-none outline-none p-0"
                  >
                    <option value="">Semua Cabang Toko</option>
                    {opticsList?.data?.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.optic_name}
                      </option>
                    ))}
                  </select>
                </label>
              </fieldset>

              {/* 🔒 INPUT BARU: Kontrol Status Akun dipindahkan dengan aman di dalam modal edit */}
              {modalMode === "edit" && (
                <fieldset className="fieldset">
                  <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                    Status Akses Login Pengguna
                  </legend>
                  <label className="input input-bordered input-sm flex items-center gap-2 bg-base-100 rounded-xl h-9 w-full">
                    <ToggleLeft className="h-3.5 w-3.5 text-base-content/40" />
                    <select
                      value={userStatus}
                      onChange={(e) => setUserStatus(Number(e.target.value))}
                      className="grow text-xs bg-transparent border-none outline-none p-0"
                    >
                      <option value={1}>
                        Aktif (Bisa Melakukan Akses Sistem)
                      </option>
                      <option value={0}>
                        Blokir (Kunci Hak Akses Pengguna)
                      </option>
                    </select>
                  </label>
                </fieldset>
              )}
            </div>

            {/* PANEL FOOTER ACTION */}
            <div className="modal-action m-0 p-3 bg-base-200/50 border-t border-base-200 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  document.getElementById("user_form_modal").close()
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

export default Users;
