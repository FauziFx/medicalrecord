import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "@/utils/api";
import useSWR from "swr";
import { LoadingTable } from "@/components";
import { Save, ArrowLeft, ShieldAlert, FileText } from "lucide-react";
import dayjs from "dayjs";
import Swal from "sweetalert2";

const formatNama = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export function WarrantyClaimAdd() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [claimDate, setClaimDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [warrantyType, setWarrantyType] = useState("");
  const [damage, setDamage] = useState("");
  const [repair, setRepair] = useState("");

  useEffect(() => {
    if (!location.state || !location.state.warrantyId) {
      navigate("/kartu-garansi");
    }
  }, [navigate, location]);

  const warrantyId = location.state?.warrantyId;
  const prevPage = location.state?.prevPage || "/warranty";

  const fetcher = async (url) => {
    const response = await api.get(url);
    return response.data.data;
  };

  const { data, error, isLoading } = useSWR(
    warrantyId ? `/warranty/${warrantyId}` : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // PENGAMAN 1: Cegah double submit dari klik ganda
    if (isLoadingSave) return;

    try {
      setIsLoadingSave(true);
      const response = await api.post("/warranty/claim", {
        warrantyId: warrantyId,
        warranty_type: warrantyType,
        damage: damage,
        repair: repair,
        claim_date: claimDate,
      });

      if (response.data.success) {
        setIsLoadingSave(false);
        Swal.fire({
          title: "Berhasil!",
          text: "Klaim garansi berhasil diajukan!",
          icon: "success",
        }).then(() => {
          navigate("/kartu-garansi");
        });
      }
    } catch (error) {
      console.log(error);
      // PENGAMAN 2: Buka kunci jika server error
      setIsLoadingSave(false);
    }
  };

  if (error)
    return (
      <div className="alert alert-error max-w-md mx-auto mt-10 rounded-2xl">
        Gagal memuat rekam data garansi.
      </div>
    );
  if (isLoading)
    return (
      <div className="p-10 text-center">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-12">
      {/* HEADER PAGE */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-4 rounded-2xl border border-base-300/60 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-soft btn-sm btn-square rounded-xl"
          disabled={isLoadingSave}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-base-content">
            Form Pengajuan Klaim Garansi
          </h1>
          <p className="text-xs text-base-content/50">
            Pencatatan perbaikan atau penggantian item kacamata pelanggan
          </p>
        </div>
      </div>

      {/* INFORMASI TIKET GARANSI AKTIF */}
      <div className="card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl overflow-hidden">
        <div className="card-body p-5 space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-base-200">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <h2 className="font-bold text-xs text-base-content uppercase tracking-wider">
              Detail Referensi Kartu Garansi
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div>
              <span className="text-base-content/40 block text-[10px] uppercase font-bold">
                Nama Pelanggan
              </span>
              <p className="font-bold text-base-content text-sm tracking-tight">
                {formatNama(data?.name)}
              </p>
            </div>
            <div>
              <span className="text-base-content/40 block text-[10px] uppercase font-bold">
                Optik Penerbit
              </span>
              <p className="font-semibold text-primary text-sm">
                {data?.optic?.optic_name}
              </p>
            </div>
            <div className="bg-base-200/40 p-2.5 rounded-xl border border-base-300/30 sm:col-span-2 space-y-1 text-base-content/80 font-medium">
              <p>
                <span className="text-base-content/50 font-semibold">
                  Koleksi Frame :
                </span>{" "}
                {data?.frame || "—"}
              </p>
              <p>
                <span className="text-base-content/50 font-semibold">
                  Spek Lensa :
                </span>{" "}
                {data?.lens || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FORM INPUT KLAIM */}
      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
        <div className="card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl">
          <div className="card-body p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-base-200">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-sm text-base-content">
                Rincian Laporan Kendala & Klaim
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                    Tanggal Pengajuan Klaim *
                  </legend>
                  <input
                    type="date"
                    className="input input-bordered input-sm rounded-xl h-9 text-xs w-full bg-base-100"
                    value={claimDate}
                    onChange={(e) => setClaimDate(e.target.value)}
                    required
                  />
                </fieldset>

                <fieldset className="fieldset">
                  <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                    Jenis Tindakan Garansi *
                  </legend>
                  <select
                    className="select select-bordered select-sm rounded-xl h-9 bg-base-100 w-full"
                    required
                    value={warrantyType}
                    onChange={(e) => setWarrantyType(e.target.value)}
                  >
                    <option disabled value="">
                      -- Pilih Jenis Klaim --
                    </option>
                    <option value="Servis Frame">Servis Frame</option>
                    <option value="Ganti Frame">Ganti Frame</option>
                    <option value="Servis Lensa">Servis Lensa</option>
                    <option value="Ganti Lensa">Ganti Lensa</option>
                  </select>
                </fieldset>
              </div>

              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Detail Kerusakan Produk *
                </legend>
                <textarea
                  className="textarea textarea-bordered textarea-sm rounded-xl min-h-[72px] w-full"
                  placeholder="Jelaskan kondisi kerusakan (misal: lensa retak, engsel frame patah)..."
                  required
                  value={damage}
                  onChange={(e) => setDamage(e.target.value)}
                ></textarea>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Tindakan Perbaikan / Solusi *
                </legend>
                <textarea
                  className="textarea textarea-bordered textarea-sm rounded-xl min-h-[72px] w-full"
                  placeholder="Jelaskan perbaikan yang dilakukan (misal: ganti lensa baru dengan ukuran sama, ganti part engsel)..."
                  required
                  value={repair}
                  onChange={(e) => setRepair(e.target.value)}
                ></textarea>
              </fieldset>
            </div>
          </div>
        </div>

        {/* PANEL PANEL UTAMA BUTTON ACTION */}
        <div className="bg-base-100 border border-base-300/60 p-4 rounded-2xl shadow-sm flex justify-end items-center gap-3">
          <Link
            to={prevPage}
            className="btn btn-ghost btn-sm rounded-xl font-medium"
            disabled={isLoadingSave}
          >
            Batal
          </Link>
          <button
            type="submit"
            className="btn btn-primary btn-sm rounded-xl font-bold gap-1.5 px-6 shadow-sm"
            disabled={isLoadingSave} // PENGAMAN 3: Mengunci tombol secara fisik di browser
          >
            {isLoadingSave ? (
              <>
                <span className="loading loading-sm loading-spinner"></span>
                Memproses...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Simpan Klaim
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default WarrantyClaimAdd;
