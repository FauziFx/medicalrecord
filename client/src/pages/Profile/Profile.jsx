import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Save, User, Mail, Key } from "lucide-react";
import api from "@/utils/api";
import Swal from "sweetalert2";

export function Profile() {
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const token = Cookies.get("token");
  const decode = jwtDecode(token);

  const [user] = useState({
    id: decode.id,
    name: Cookies.get("user") ? Cookies.get("user") : decode.name,
    email: decode.email,
    role: decode.role,
    status: decode.status,
    opticId: decode.opticId,
  });

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    password: "",
    confirmPassword: "",
  });

  const [isMatch, setIsMatch] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };

    // Validasi panjang password jika user mulai mengetik sesuatu
    if (name === "password") {
      setIsPasswordValid(value === "" || value.length >= 5);
    }

    setFormData(updatedFormData);

    // Validasi kecocokan konfirmasi password
    if (name === "password" || name === "confirmPassword") {
      setIsMatch(updatedFormData.password === updatedFormData.confirmPassword);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // PENGAMAN 1: Cegah double submit dari klik ganda
    if (isLoadingSave) return;

    if (!isPasswordValid && formData.password !== "") {
      Swal.fire({
        title: "Validasi Gagal",
        text: "Kata sandi baru minimal harus 5 karakter.",
        icon: "error",
      });
      return;
    }
    if (!isMatch) {
      Swal.fire({
        title: "Validasi Gagal",
        text: "Konfirmasi kata sandi tidak cocok.",
        icon: "error",
      });
      return;
    }

    try {
      setIsLoadingSave(true);
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password, // Jika kosong, backend otomatis mempertahankan password lama
        role: user.role,
        status: user.status,
        opticId: user.opticId,
      };

      const response = await api.patch(`/user/${user.id}`, payload);

      if (response.data.success) {
        setIsLoadingSave(false);
        setFormData((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));

        // Perbarui Cookies nama pengguna lokal selama 90 hari
        Cookies.set("user", formData.name, { expires: 90 });

        Swal.fire({
          title: "Profil Diperbarui!",
          text: "Perubahan informasi profil Anda berhasil disimpan.",
          icon: "success",
        });
      }
    } catch (error) {
      console.log(error);
      // PENGAMAN 2: Buka kunci jika server mengalami kendala/error
      setIsLoadingSave(false);
    }
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-12">
      {/* HEADER UTAMA */}
      <div className="bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-4 rounded-2xl border border-base-300/60 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-base-content">
          Pengaturan Akun Anda
        </h1>
        <p className="text-xs text-base-content/50">
          Perbarui data nama lengkap pribadi dan lakukan perubahan kata sandi
          secara berkala
        </p>
      </div>

      {/* CARD FORM UTAMA */}
      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
        <div className="card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl">
          <div className="card-body p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-base-200">
              <User className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-sm text-base-content">
                Informasi Profil Pengguna
              </h2>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Fieldset Email (Read Only) */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Alamat Email
                </legend>
                <label className="input input-bordered input-sm flex items-center gap-2 bg-base-200/50 rounded-xl h-9 w-full border-base-300">
                  <Mail className="h-3.5 w-3.5 text-base-content/30" />
                  <input
                    type="email"
                    className="grow text-xs font-mono text-base-content/50 cursor-not-allowed"
                    value={formData.email}
                    readOnly
                  />
                </label>
              </fieldset>

              {/* Fieldset Nama Lengkap */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Nama Lengkap Anda *
                </legend>
                <input
                  type="text"
                  name="name"
                  placeholder="Masukkan nama"
                  className="input input-bordered input-sm rounded-xl h-9 w-full bg-base-100 text-xs font-semibold text-base-content"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </fieldset>

              {/* Fieldset Password Baru (Opsional - Tidak Diwajibkan) */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Kata Sandi Baru (Kosongkan jika tidak diganti)
                </legend>
                <label
                  className={`input input-bordered input-sm flex items-center gap-2 bg-base-100 rounded-xl h-9 w-full transition-all ${!isPasswordValid && formData.password !== "" ? "input-error bg-error/5" : ""}`}
                >
                  <Key className="h-3.5 w-3.5 text-base-content/40" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Tulis sandi baru jika ingin diubah"
                    className="grow text-xs font-mono"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </label>
                {!isPasswordValid && formData.password !== "" && (
                  <p className="text-error text-[10px] font-bold mt-1 pl-1">
                    * Kata sandi baru minimal harus sepanjang 5 karakter.
                  </p>
                )}
              </fieldset>

              {/* Fieldset Konfirmasi Password */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Ulangi Kata Sandi Baru
                </legend>
                <label
                  className={`input input-bordered input-sm flex items-center gap-2 bg-base-100 rounded-xl h-9 w-full transition-all ${!isMatch ? "input-error bg-error/5" : ""}`}
                >
                  <Key className="h-3.5 w-3.5 text-base-content/40" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Ketik ulang sandi baru"
                    className="grow text-xs font-mono"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={formData.password === ""}
                  />
                </label>
                {!isMatch && (
                  <p className="text-error text-[10px] font-bold mt-1 pl-1">
                    * Konfirmasi sandi tidak sesuai dengan sandi baru di atas.
                  </p>
                )}
              </fieldset>
            </div>
          </div>
        </div>

        {/* PANEL PANEL UTAMA BUTTON ACTION */}
        <div className="bg-base-100 border border-base-300/60 p-4 rounded-2xl shadow-sm flex justify-end items-center">
          <button
            type="submit"
            className="btn btn-primary btn-sm rounded-xl font-bold gap-1.5 px-6 shadow-sm w-full sm:w-auto"
            disabled={
              isLoadingSave ||
              !isMatch ||
              (!isPasswordValid && formData.password !== "")
            } // PENGAMAN 3: Kunci submit di browser
          >
            {isLoadingSave ? (
              <>
                <span className="loading loading-sm loading-spinner"></span>
                Memperbarui...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Simpan Perubahan Profil
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
