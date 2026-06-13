import React, { useState } from "react";
import { Footer } from "@/components";
import { KeyRound, Mail, AlertCircle } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

export function Login() {
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(""); // Reset error setiap kali submit ulang
    try {
      setLoading(true);
      const response = await axios.post(API_URL + "/login", {
        email: email,
        password: password,
      });

      const data = response.data;

      if (data.success) {
        const { token } = data.data;
        Cookies.set("token", token, { expires: 89 });
        window.location.href = "/dashboard";
      } else {
        setLoading(false);
        setErr(data.message || "Email atau password salah.");
      }
    } catch (error) {
      setLoading(false);
      setErr("Terjadi kesalahan jaringan. Silakan coba lagi.");
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      {/* Container Utama Form */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="card w-full max-w-sm bg-base-100 shadow-sm border border-base-300/60 rounded-2xl">
          <div className="card-body p-6 sm:p-8">
            {/* Header / Judul */}
            <div className="text-center space-y-1 mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-secondary">
                Medis<span className="text-primary">MA</span>
              </h1>
              <p className="text-xs text-base-content/60">
                Masuk untuk mengelola data rekam medis
              </p>
            </div>

            {/* Notifikasi Error yang Lebih Clean */}
            {err && (
              <div className="alert alert-error py-2.5 px-3 rounded-xl text-xs gap-2 mb-4 animate-fadeIn">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{err}</span>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              autoComplete="off"
              className="space-y-4"
            >
              {/* Fieldset Email */}
              <fieldset className="fieldset p-0">
                <legend className="fieldset-legend text-xs font-medium text-base-content/70 mb-1">
                  Email Akun
                </legend>
                <label className="input input-bordered flex items-center gap-3 w-full bg-base-100 focus-within:input-primary">
                  <Mail className="h-4 w-4 text-base-content/40" />
                  <input
                    type="email"
                    className="grow text-sm"
                    placeholder="mail@klinik.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
              </fieldset>

              {/* Fieldset Password */}
              <fieldset className="fieldset p-0">
                <legend className="fieldset-legend text-xs font-medium text-base-content/70 mb-1">
                  Kata Sandi
                </legend>
                <label className="input input-bordered flex items-center gap-3 w-full bg-base-100 focus-within:input-primary">
                  <KeyRound className="h-4 w-4 text-base-content/40" />
                  <input
                    type="password"
                    className="grow text-sm"
                    placeholder="••••••••"
                    minLength="5"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </label>
              </fieldset>

              {/* Tombol Login */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="btn btn-primary w-full text-sm font-semibold shadow-sm rounded-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Masuk"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Login;
