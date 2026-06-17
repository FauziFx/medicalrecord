import {
  ImageUp,
  Save,
  ArrowLeft,
  User,
  Eye,
  ClipboardList,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import api from "@/utils/api";
import useSWR from "swr";
import { LoadingTable } from "@/components";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/id";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UseFormStore from "@/store/UseFormStore";
import { v4 as uuidv4 } from "uuid";
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

export function MedicalRecordAdd() {
  const location = useLocation();
  const navigate = useNavigate();
  const inputFile = useRef(null);
  const [isLoadingSave, setIsLoadingSave] = useState(false);

  const {
    newData,
    updateNewData,
    note,
    updateNote,
    image,
    updateImage,
    resetNewData,
    garansiFrame,
    garansiLensa,
    setGaransiFrame,
    setGaransiLensa,
  } = UseFormStore();

  useEffect(() => {
    if (!location.state || !location.state.patientId) {
      navigate("/rekam-medis");
    }
  }, [navigate, location]);

  const patientId = location.state?.patientId;
  const prevPage = location.state?.prevPage || "/rekam-medis";

  const fetcher = async () => {
    const response = await api.get(`/patient/${patientId}`);
    const resOptic = await api.get("/optic?status=active");
    return {
      dataPatient: response.data.data,
      dataOptic: resOptic.data.data,
    };
  };

  const { data, error, isLoading } = useSWR(
    patientId ? `/add-medical-record/${patientId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const handleNumberInput = (value, callback) => {
    if (!isNaN(value) || value === "-" || value === "+") {
      callback(value);
    }
  };

  const handleChangeImage = async (e) => {
    if (e.target.files.length !== 0) {
      const files = e.target.files[0];
      if (files.size > 5 * 1024 * 1024) {
        alert("Ukuran berkas maksimal adalah 5MB");
        return;
      }
      const ext = files.type === "image/jpeg" ? ".jpg" : ".png";
      const renamedFile = new File([files], uuidv4() + ext, {
        type: files.type,
      });
      updateImage(renamedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoadingSave(true);

      if (garansiFrame !== "-" || garansiLensa !== "-") {
        const expiredFrame =
          garansiFrame === "-"
            ? newData.visit_date
            : dayjs(newData.visit_date)
                .add(
                  garansiFrame === "6" ? 6 : Number(garansiFrame),
                  garansiFrame === "6" ? "M" : "y",
                )
                .format("YYYY-MM-DD");
        const expiredLensa =
          garansiLensa === "-"
            ? newData.visit_date
            : dayjs(newData.visit_date)
                .add(
                  garansiLensa === "6" ? 6 : Number(garansiLensa),
                  garansiLensa === "6" ? "M" : "y",
                )
                .format("YYYY-MM-DD");

        const payloadGaransi = {
          name: data.dataPatient.name,
          frame: note.frame,
          lens: note.lens,
          od: [
            newData.rsph,
            newData.rcyl,
            newData.raxis,
            newData.radd,
            (newData.far_pd || 0) / 2,
          ].join("/"),
          os: [
            newData.lsph,
            newData.lcyl,
            newData.laxis,
            newData.ladd,
            (newData.far_pd || 0) / 2,
          ].join("/"),
          warranty_lens: garansiLensa,
          warranty_frame: garansiFrame,
          expire_lens: expiredLensa,
          expire_frame: expiredFrame,
          opticId: Number(newData.opticId),
          createdAt: newData.visit_date,
        };
        await api.post("/warranty", payloadGaransi);
      }

      const record = [
        {
          od: [newData.rsph, newData.rcyl, newData.raxis, newData.radd].join(
            "/",
          ),
          os: [newData.lsph, newData.lcyl, newData.laxis, newData.ladd].join(
            "/",
          ),
          far_pd: newData.far_pd || null,
          near_pd: newData.near_pd || null,
          visit_date: newData.visit_date,
          checked_by: newData.checked_by,
          note: `Frame: ${note.frame || "-"}\nLensa: ${note.lens || "-"}\nHarga: Rp ${note.price || "-"}\nCatatan: ${note.note || "-"}`,
          image: image ? image.name : null,
          opticId: Number(newData.opticId),
          is_olddata: 0,
          patientId: patientId,
        },
      ];

      const formData = new FormData();
      if (image) formData.append("image", image);
      formData.append("records", JSON.stringify(record));

      const response = await api.post("/medicalrecord", formData);

      if (response.data.success) {
        setIsLoadingSave(false);
        resetNewData();
        Swal.fire({
          title: "Berhasil!",
          text: "Rekam Medis pasien berhasil disimpan!",
          icon: "success",
        }).then((result) => {
          navigate("/rekam-medis");
        });
      }
    } catch (error) {
      console.log(error);
      setIsLoadingSave(false);
    }
  };

  if (error)
    return (
      <div className="alert alert-error max-w-md mx-auto mt-10 rounded-2xl">
        Gagal memuat data pasien.
      </div>
    );
  if (isLoading)
    return (
      <div className="p-10 text-center">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );

  const pt = data?.dataPatient;

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-12">
      {/* HEADER PAGE */}
      <div className="flex items-center gap-3 bg-base-100 p-4 rounded-2xl border border-base-300/60 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-soft btn-sm btn-square rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-base-content">
            Input Pemeriksaan Pasien
          </h1>
          <p className="text-xs text-base-content/50">
            Pemeriksaan refraksi kacamata dan pencatatan rekam medis baru
          </p>
        </div>
      </div>

      {/* RINGKASAN INFORMASI PASIEN YANG SUDAH ADA */}
      <div className="card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl overflow-hidden">
        <div className="card-body p-5 space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-base-200">
            <User className="h-4 w-4 text-primary" />
            <h2 className="font-bold text-xs text-base-content uppercase tracking-wider">
              Identitas Pasien Terpilih
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm pt-1">
            <div>
              <span className="text-base-content/40 block text-[10px] uppercase font-semibold">
                Nama Pasien
              </span>
              <p className="font-bold text-base-content text-xs sm:text-sm">
                {formatNama(pt?.name)}
              </p>
            </div>
            <div>
              <span className="text-base-content/40 block text-[10px] uppercase font-semibold">
                Gender & Umur
              </span>
              <p className="font-semibold text-base-content text-xs sm:text-sm">
                {pt?.gender} •{" "}
                {dayjs().diff(dayjs(pt?.date_of_birth?.split("T")[0]), "year")}{" "}
                Tahun
              </p>
            </div>
            <div>
              <span className="text-base-content/40 block text-[10px] uppercase font-semibold">
                Riwayat Sistemik
              </span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {pt?.medicalconditions?.length > 0 ? (
                  pt.medicalconditions.map((med, k) => (
                    <span
                      key={k}
                      className="bg-error/10 text-error font-bold text-[9px] px-1.5 py-0.5 rounded"
                    >
                      {med.name}
                    </span>
                  ))
                ) : (
                  <span className="text-base-content/30 italic text-xs">
                    Tidak ada riwayat penyakit
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FORM UTAMA REKAM MEDIS BARU */}
      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
        <div className="card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl">
          <div className="card-body p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-base-200">
              <Eye className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-sm text-base-content">
                Hasil Rekomendasi Ukuran Lensa Baru
              </h2>
            </div>

            <div className="space-y-4">
              {/* INPUT RESEP MATA KANAN & KIRI SEJAJAR DAN BER-FIELDSET */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* OD BARU */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-2">
                  <span className="text-[10px] font-bold text-primary tracking-wider uppercase block">
                    Mata Kanan Baru (OD) *
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    <input
                      type="text"
                      className="input input-bordered input-sm text-center px-1 font-mono rounded-lg h-8 bg-base-100"
                      placeholder="Sph"
                      name="rsph"
                      required
                      value={newData.rsph}
                      onChange={(e) =>
                        handleNumberInput(e.target.value, (val) =>
                          updateNewData("rsph", val),
                        )
                      }
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm text-center px-1 font-mono rounded-lg h-8 bg-base-100"
                      placeholder="Cyl"
                      name="rcyl"
                      value={newData.rcyl}
                      onChange={(e) =>
                        handleNumberInput(e.target.value, (val) =>
                          updateNewData("rcyl", val),
                        )
                      }
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm text-center px-1 font-mono rounded-lg h-8 bg-base-100"
                      placeholder="Axis"
                      name="raxis"
                      value={newData.raxis}
                      onChange={(e) =>
                        handleNumberInput(e.target.value, (val) =>
                          updateNewData("raxis", val),
                        )
                      }
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm text-center px-1 font-mono rounded-lg h-8 bg-base-100"
                      placeholder="Add"
                      name="radd"
                      value={newData.radd}
                      onChange={(e) =>
                        handleNumberInput(e.target.value, (val) =>
                          updateNewData("radd", val),
                        )
                      }
                    />
                  </div>
                </div>

                {/* OS BARU */}
                <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-3 space-y-2">
                  <span className="text-[10px] font-bold text-secondary tracking-wider uppercase block">
                    Mata Kiri Baru (OS) *
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    <input
                      type="text"
                      className="input input-bordered input-sm text-center px-1 font-mono rounded-lg h-8 bg-base-100"
                      placeholder="Sph"
                      name="lsph"
                      required
                      value={newData.lsph}
                      onChange={(e) =>
                        handleNumberInput(e.target.value, (val) =>
                          updateNewData("lsph", val),
                        )
                      }
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm text-center px-1 font-mono rounded-lg h-8 bg-base-100"
                      placeholder="Cyl"
                      name="lcyl"
                      value={newData.lcyl}
                      onChange={(e) =>
                        handleNumberInput(e.target.value, (val) =>
                          updateNewData("lcyl", val),
                        )
                      }
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm text-center px-1 font-mono rounded-lg h-8 bg-base-100"
                      placeholder="Axis"
                      name="laxis"
                      value={newData.laxis}
                      onChange={(e) =>
                        handleNumberInput(e.target.value, (val) =>
                          updateNewData("laxis", val),
                        )
                      }
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm text-center px-1 font-mono rounded-lg h-8 bg-base-100"
                      placeholder="Add"
                      name="ladd"
                      value={newData.ladd}
                      onChange={(e) =>
                        handleNumberInput(e.target.value, (val) =>
                          updateNewData("ladd", val),
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* INPUT LAYOUT DETAIL (FULL FIELDSET) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                    PD Jauh Baru (mm)
                  </legend>
                  <input
                    type="number"
                    placeholder="Jauh"
                    className="input input-bordered input-sm rounded-xl h-9"
                    value={newData.far_pd || ""}
                    onChange={(e) =>
                      updateNewData(
                        "far_pd",
                        e.target.value ? Number(e.target.value) : "",
                      )
                    }
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                    PD Dekat Baru (mm)
                  </legend>
                  <input
                    type="number"
                    placeholder="Dekat"
                    className="input input-bordered input-sm rounded-xl h-9"
                    value={newData.near_pd || ""}
                    onChange={(e) =>
                      updateNewData(
                        "near_pd",
                        e.target.value ? Number(e.target.value) : "",
                      )
                    }
                  />
                </fieldset>
              </div>

              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Tanggal Kunjungan / Pemeriksaan *
                </legend>
                <input
                  type="date"
                  className="input input-bordered input-sm rounded-xl h-9 text-xs"
                  required
                  value={newData.visit_date || ""}
                  onChange={(e) => updateNewData("visit_date", e.target.value)}
                />
              </fieldset>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                    Optik Cabang Pemeriksa *
                  </legend>
                  <select
                    className="select select-bordered select-sm rounded-xl h-9 bg-base-100"
                    required
                    value={newData.opticId || ""}
                    onChange={(e) => updateNewData("opticId", e.target.value)}
                  >
                    <option value="" disabled>
                      Pilih Cabang Optik
                    </option>
                    {data?.dataOptic?.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.optic_name}
                      </option>
                    ))}
                  </select>
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                    Nama Pemeriksa / Refraksionis *
                  </legend>
                  <input
                    type="text"
                    placeholder="Nama pemeriksa"
                    className="input input-bordered input-sm rounded-xl h-9"
                    required
                    value={newData.checked_by || ""}
                    onChange={(e) =>
                      updateNewData("checked_by", e.target.value)
                    }
                  />
                </fieldset>
              </div>

              {/* Rincian Produk, Harga, Keterangan, dan Garansi */}
              <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                Catatan (Optional)
              </legend>
              <div className="bg-base-200/40 p-4 border border-base-300/40 rounded-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend label-text text-xs font-semibold text-base-content/60 py-1 m-0">
                      Tipe Kode Frame
                    </legend>
                    <input
                      type="text"
                      className="input input-bordered input-sm rounded-xl h-8 bg-base-100"
                      placeholder="Contoh: Rayban Aviator"
                      value={note.frame || ""}
                      onChange={(e) => updateNote("frame", e.target.value)}
                    />
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend label-text text-xs font-semibold text-base-content/60 py-1 m-0">
                      Jenis Spek Lensa
                    </legend>
                    <input
                      type="text"
                      className="input input-bordered input-sm rounded-xl h-8 bg-base-100"
                      placeholder="Contoh: Essilor Crizal"
                      value={note.lens || ""}
                      onChange={(e) => updateNote("lens", e.target.value)}
                    />
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend label-text text-xs font-semibold text-base-content/60 py-1 m-0">
                      Total Harga (Rp)
                    </legend>
                    <input
                      type="number"
                      className="input input-bordered input-sm rounded-xl h-8 bg-base-100 font-mono"
                      placeholder="Nominal"
                      value={note.price || ""}
                      onChange={(e) => updateNote("price", e.target.value)}
                    />
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend label-text text-xs font-semibold text-base-content/60 py-1 m-0">
                      Masa Garansi Frame
                    </legend>
                    <select
                      className="select select-bordered select-sm rounded-xl h-8 bg-base-100 p-0 pl-2 text-xs"
                      value={garansiFrame}
                      onChange={(e) => setGaransiFrame(e.target.value)}
                    >
                      <option value="-">Tanpa Garansi</option>
                      <option value="6">6 Bulan</option>
                      <option value="1">1 Tahun</option>
                      <option value="2">2 Tahun</option>
                    </select>
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend label-text text-xs font-semibold text-base-content/60 py-1 m-0">
                      Masa Garansi Lensa
                    </legend>
                    <select
                      className="select select-bordered select-sm rounded-xl h-8 bg-base-100 p-0 pl-2 text-xs"
                      value={garansiLensa}
                      onChange={(e) => setGaransiLensa(e.target.value)}
                    >
                      <option value="-">Tanpa Garansi</option>
                      <option value="6">6 Bulan</option>
                      <option value="1">1 Tahun</option>
                      <option value="2">2 Tahun</option>
                    </select>
                  </fieldset>
                </div>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend label-text text-xs font-semibold text-base-content/60 py-1 m-0">
                    Catatan Lain
                  </legend>
                  <textarea
                    className="textarea textarea-bordered textarea-sm rounded-xl min-h-[80px] bg-base-100"
                    placeholder="Catatan tambahan hasil refraksi..."
                    value={note.note || ""}
                    onChange={(e) => updateNote("note", e.target.value)}
                  ></textarea>
                </fieldset>
              </div>

              {/* Upload Lampiran Berkas Medis */}
              <fieldset className="fieldset max-w-md">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Lampiran Foto Resep / Refraksi
                </legend>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg, image/png"
                  ref={inputFile}
                  onChange={handleChangeImage}
                />
                <div
                  className="card border border-dashed border-base-300 hover:border-primary items-center p-4 cursor-pointer bg-base-200/20 rounded-xl transition-all"
                  onClick={() => inputFile.current.click()}
                >
                  {image ? (
                    <div className="text-center space-y-2">
                      <img
                        src={URL.createObjectURL(image)}
                        className="rounded-xl h-44 mx-auto object-cover shadow-sm"
                        alt="Preview"
                      />
                      <span className="text-xs text-primary underline block">
                        Ganti Gambar
                      </span>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-base-content/50 space-y-1">
                      <ImageUp className="mx-auto h-6 w-6 text-primary/60" />
                      <p className="text-xs font-semibold">
                        Klik untuk memilih file lampiran
                      </p>
                      <p className="text-[10px]">
                        Mendukung ekstensi .jpg, .png (Max: 5MB)
                      </p>
                    </div>
                  )}
                </div>
              </fieldset>
            </div>
          </div>
        </div>

        {/* PANEL ACTION BUTTONS */}
        <div className="bg-base-100 border border-base-300/60 p-4 rounded-2xl shadow-sm flex justify-end items-center gap-3">
          <Link
            to={prevPage}
            onClick={() => resetNewData()}
            className="btn btn-ghost btn-sm rounded-xl font-medium"
          >
            Batal
          </Link>
          <button
            type="submit"
            className="btn btn-primary btn-sm rounded-xl font-bold gap-1.5 px-6 shadow-sm"
            disabled={isLoadingSave}
          >
            {isLoadingSave ? (
              <span className="loading loading-sm loading-spinner"></span>
            ) : (
              <>
                <Save className="h-4 w-4" /> Simpan Rekam Medis
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MedicalRecordAdd;
