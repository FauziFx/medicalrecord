import React, { useRef, useState } from "react";
import {
  Save,
  ImageUp,
  User,
  Eye,
  ArrowLeft,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import api from "@/utils/api";
import useSWR from "swr";
import { useNavigate } from "react-router-dom";
import UseFormStore from "@/store/UseFormStore";
import dayjs from "dayjs";
import Swal from "sweetalert2";

// Fungsi pembantu parsing input angka resep agar aman
const handleNumberInput = (value, callback) => {
  if (!isNaN(value) || value === "-" || value === "+") {
    callback(value);
  }
};

export function PatientAdd() {
  const navigate = useNavigate();
  const inputFile = useRef(null);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  // GLOBAL STATE DARI ZUSTAND
  const {
    patientData,
    updatePatientData,
    toggleCondition,
    age,
    updateAge,
    oldData,
    updateOldData,
    skipOldData,
    newData,
    updateNewData,
    note,
    updateNote,
    image,
    updateImage,
    garansiFrame,
    garansiLensa,
    setGaransiFrame,
    setGaransiLensa,
    resetPatientData,
    resetNewData,
  } = UseFormStore();

  // AMBIL DATA OPTIK & RIWAYAT PENYAKIT (SWR Tunggal Lebih Efisien)
  const fetcher = async () => {
    const resCondition = await api.get("/medicalcondition");
    const resOptic = await api.get("/optic?status=active");
    return {
      conditions: resCondition.data.data,
      optics: resOptic.data.data,
    };
  };
  const { data: selectData, isLoading } = useSWR(
    "/api/form-select-data",
    fetcher,
    { revalidateOnFocus: false },
  );

  // HANDLER UPLOAD GAMBAR RESEP
  const handleChangeImage = (e) => {
    if (e.target.files.length !== 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran berkas maksimal adalah 5MB");
        return;
      }
      const ext = file.type === "image/jpeg" ? ".jpg" : ".png";
      const renamedFile = new File([file], uuidv4() + ext, { type: file.type });
      updateImage(renamedFile);
    }
  };

  // SUBMIT DATA GABUNGAN (LOGIKA UTAMA STEP 4)
  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    if (isLoadingSave) return;

    try {
      setIsLoadingSave(true);

      // 1. Jalankan Simpan Garansi jika diaktifkan
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
          name: patientData.name,
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

      // 2. Simpan Master Pasien
      const savePatient = await api.post("/patient", {
        ...patientData,
        opticId: Number(patientData.opticId),
      });
      const generatedPatientId = savePatient.data.patientId;

      // 3. Susun Array Records Rekam Medis (Deteksi Ukuran Lama otomatis)
      const recordPayload = [];

      if (oldData.rsph || oldData.lsph) {
        recordPayload.push({
          od: [oldData.rsph, oldData.rcyl, oldData.raxis, oldData.radd].join(
            "/",
          ),
          os: [oldData.lsph, oldData.lcyl, oldData.laxis, oldData.ladd].join(
            "/",
          ),
          far_pd: oldData.far_pd || null,
          near_pd: oldData.near_pd || null,
          visit_date: newData.visit_date,
          note: oldData.note,
          opticId: Number(patientData.opticId),
          is_olddata: 1,
          patientId: generatedPatientId,
        });
      }

      recordPayload.push({
        od: [newData.rsph, newData.rcyl, newData.raxis, newData.radd].join("/"),
        os: [newData.lsph, newData.lcyl, newData.laxis, newData.ladd].join("/"),
        far_pd: newData.far_pd || null,
        near_pd: newData.near_pd || null,
        visit_date: newData.visit_date,
        checked_by: newData.checked_by,
        note: `Frame: ${note.frame || "-"}\nLensa: ${note.lens || "-"}\nHarga: Rp ${note.price || "-"}\nCatatan: ${note.note || "-"}`,
        image: image ? image.name : null,
        opticId: Number(newData.opticId),
        is_olddata: 0,
        patientId: generatedPatientId,
      });

      // 4. Kirim FormData Rekam Medis beserta Berkas Gambar
      const formData = new FormData();
      if (image) formData.append("image", image);
      formData.append("records", JSON.stringify(recordPayload));

      const resRecord = await api.post("/medicalrecord", formData);
      if (resRecord.data.success) {
        setIsLoadingSave(false);
        resetPatientData();
        skipOldData();
        resetNewData();

        Swal.fire({
          title: "Berhasil!",
          text: "Rekam Medis pasien berhasil disimpan!",
          icon: "success",
        }).then((result) => {
          navigate("/rekam-medis");
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSave(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-10 text-center">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-12">
      {/* HEADER PAGE */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-4 rounded-2xl border border-base-300/60 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-soft btn-sm btn-square rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-base-content">
            Tambah Pasien & Rekam Medis
          </h1>
          <p className="text-xs text-base-content/50">Registrasi pasien baru</p>
        </div>
      </div>

      <form
        onSubmit={handleFinalSubmit}
        autoComplete="off"
        className="space-y-5"
      >
        {/* ========================================================== */}
        {/* PANEL CARD 1: BIODATA PASIEN                               */}
        {/* ========================================================== */}
        <div className="card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl">
          <div className="card-body p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-base-200">
              <User className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-sm text-base-content">
                1. Identitas Pribadi Pasien
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {/* Cabang Registrasi */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Cabang Registrasi
                </legend>
                <select
                  className="select select-bordered select-sm rounded-xl h-9 bg-base-100"
                  required
                  value={patientData.opticId || ""}
                  onChange={(e) => updatePatientData("opticId", e.target.value)}
                >
                  <option value="" disabled>
                    Pilih Cabang Optik
                  </option>
                  {selectData?.optics.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.optic_name}
                    </option>
                  ))}
                </select>
              </fieldset>

              {/* Nama Lengkap */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Nama Lengkap Pasien
                </legend>
                <input
                  type="text"
                  placeholder="Masukkan nama sesuai KTP"
                  className="input input-bordered input-sm rounded-xl h-9"
                  required
                  value={patientData.name}
                  onChange={(e) => updatePatientData("name", e.target.value)}
                />
              </fieldset>

              {/* Jenis Kelamin */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Jenis Kelamin
                </legend>
                <div className="flex gap-4 h-9 items-center pl-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Laki-laki"
                      className="radio radio-primary radio-sm"
                      required
                      checked={patientData.gender === "Laki-laki"}
                      onChange={(e) =>
                        updatePatientData("gender", e.target.value)
                      }
                    />{" "}
                    <span className="text-xs font-medium">Laki-laki</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Perempuan"
                      className="radio radio-secondary radio-sm"
                      required
                      checked={patientData.gender === "Perempuan"}
                      onChange={(e) =>
                        updatePatientData("gender", e.target.value)
                      }
                    />{" "}
                    <span className="text-xs font-medium">Perempuan</span>
                  </label>
                </div>
              </fieldset>

              {/* Nomor HP */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Nomor HP / WhatsApp
                </legend>
                <input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  className="input input-bordered input-sm rounded-xl h-9 font-mono"
                  value={patientData.phone_number}
                  onChange={(e) =>
                    updatePatientData("phone_number", e.target.value)
                  }
                />
              </fieldset>

              {/* Usia */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Usia (Tahun)
                </legend>
                <input
                  type="number"
                  placeholder="Contoh: 28"
                  className="input input-bordered input-sm rounded-xl h-9"
                  required
                  value={age}
                  onChange={(e) => updateAge(e.target.value)}
                />
              </fieldset>

              {/* TTL */}
              <div className="grid grid-cols-2 gap-2">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                    Tempat Lahir
                  </legend>
                  <input
                    type="text"
                    placeholder="Kota"
                    className="input input-bordered input-sm rounded-xl h-9"
                    value={patientData.place_of_birth}
                    onChange={(e) =>
                      updatePatientData("place_of_birth", e.target.value)
                    }
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                    Tempat Lahir
                  </legend>
                  <input
                    type="date"
                    className="input input-bordered input-sm rounded-xl h-9"
                    required
                    value={patientData.date_of_birth}
                    onChange={(e) =>
                      updatePatientData("date_of_birth", e.target.value)
                    }
                  />
                </fieldset>
              </div>

              {/* Pekerjaan */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Pekerjaan
                </legend>
                <input
                  type="text"
                  placeholder="Contoh: Pegawai Negeri, Mahasiswa, Supir"
                  className="input input-bordered input-sm rounded-xl h-9"
                  value={patientData.occupation}
                  onChange={(e) =>
                    updatePatientData("occupation", e.target.value)
                  }
                />
              </fieldset>

              {/* Alamat */}
              <fieldset className="fieldset sm:col-span-2">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Alamat Tempat Tinggal
                </legend>
                <textarea
                  className="textarea textarea-sm textarea-bordered rounded-xl min-h-[60px]"
                  placeholder="Tulis alamat rumah lengkap pasien..."
                  required
                  value={patientData.address}
                  onChange={(e) => updatePatientData("address", e.target.value)}
                ></textarea>
              </fieldset>

              {/* Checkbox Riwayat Penyakit */}
              <fieldset className="fieldset sm:col-span-2 space-y-1">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Riwayat Penyakit Sistemik Pasien
                </legend>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-base-200/40 p-3 rounded-xl border border-base-300/30">
                  {selectData?.conditions.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 cursor-pointer py-1"
                    >
                      <input
                        type="checkbox"
                        checked={patientData.conditions.includes(item.name)}
                        onChange={() => toggleCondition(item.name)}
                        className="checkbox checkbox-sm checkbox-primary rounded"
                      />
                      <span className="text-xs text-base-content/80 font-medium">
                        {item.name}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* PANEL CARD 2: UKURAN LAMA PASIEN (OPTIONAL SECTION)        */}
        {/* ========================================================== */}
        <div className="card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl">
          <div className="card-body p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-base-200">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-base-content/40" />
                <h2 className="font-bold text-sm text-base-content">
                  2. Data Ukuran Lensa Lama Pasien{" "}
                  <span className="text-xs text-base-content/40 font-normal">
                    (Opsional)
                  </span>
                </h2>
              </div>
            </div>
            <p className="text-[11px] text-base-content/50 leading-tight">
              Kosongkan kolom di bawah ini jika pasien tidak membawa kacamata
              lama atau tidak ingat ukurannya.
            </p>

            <div className="space-y-3">
              {/* Grid Baris OD & OS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* OD */}
                <div className="bg-base-200/30 border border-base-300/50 rounded-xl p-3 space-y-2">
                  <span className="text-[10px] font-bold text-primary tracking-wider uppercase block">
                    Mata Kanan (OD)
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    <input
                      type="text"
                      className="input input-bordered input-sm text-center px-1 font-mono rounded-lg h-8"
                      placeholder="Sph"
                      name="rsph"
                      value={oldData.rsph}
                      onChange={(e) =>
                        handleNumberInput(e.target.value, (val) =>
                          updateOldData("rsph", val),
                        )
                      }
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm text-center px-1 font-mono rounded-lg h-8"
                      placeholder="Cyl"
                      name="rcyl"
                      value={oldData.rcyl}
                      onChange={(e) =>
                        handleNumberInput(e.target.value, (val) =>
                          updateOldData("rcyl", val),
                        )
                      }
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm text-center px-1 font-mono rounded-lg h-8"
                      placeholder="Axis"
                      name="raxis"
                      value={oldData.raxis}
                      onChange={(e) =>
                        handleNumberInput(e.target.value, (val) =>
                          updateOldData("raxis", val),
                        )
                      }
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm text-center px-1 font-mono rounded-lg h-8"
                      placeholder="Add"
                      name="radd"
                      value={oldData.radd}
                      onChange={(e) =>
                        handleNumberInput(e.target.value, (val) =>
                          updateOldData("radd", val),
                        )
                      }
                    />
                  </div>
                </div>
                {/* OS */}
                <div className="bg-base-200/30 border border-base-300/50 rounded-xl p-3 space-y-2">
                  <span className="text-[10px] font-bold text-secondary tracking-wider uppercase block">
                    Mata Kiri (OS)
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    <input
                      type="text"
                      className="input input-bordered input-sm text-center px-1 font-mono rounded-lg h-8"
                      placeholder="Sph"
                      name="lsph"
                      value={oldData.lsph}
                      onChange={(e) =>
                        handleNumberInput(e.target.value, (val) =>
                          updateOldData("lsph", val),
                        )
                      }
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm text-center px-1 font-mono rounded-lg h-8"
                      placeholder="Cyl"
                      name="lcyl"
                      value={oldData.lcyl}
                      onChange={(e) =>
                        handleNumberInput(e.target.value, (val) =>
                          updateOldData("lcyl", val),
                        )
                      }
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm text-center px-1 font-mono rounded-lg h-8"
                      placeholder="Axis"
                      name="laxis"
                      value={oldData.laxis}
                      onChange={(e) =>
                        handleNumberInput(e.target.value, (val) =>
                          updateOldData("laxis", val),
                        )
                      }
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm text-center px-1 font-mono rounded-lg h-8"
                      placeholder="Add"
                      name="ladd"
                      value={oldData.ladd}
                      onChange={(e) =>
                        handleNumberInput(e.target.value, (val) =>
                          updateOldData("ladd", val),
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* PD Jauh & Dekat */}
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                    PD Jauh (mm)
                  </legend>
                  <input
                    type="number"
                    placeholder="Misal: 62"
                    className="input input-bordered input-sm rounded-xl h-8"
                    value={oldData.far_pd || ""}
                    onChange={(e) =>
                      updateOldData(
                        "far_pd",
                        e.target.value ? Number(e.target.value) : "",
                      )
                    }
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                    PD Dekat (mm)
                  </legend>
                  <input
                    type="number"
                    placeholder="Misal: 58"
                    className="input input-bordered input-sm rounded-xl h-8"
                    value={oldData.near_pd || ""}
                    onChange={(e) =>
                      updateOldData(
                        "near_pd",
                        e.target.value ? Number(e.target.value) : "",
                      )
                    }
                  />
                </fieldset>
              </div>

              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Keterangan Tambahan Kacamata Lama
                </legend>
                <textarea
                  className="textarea textarea-sm textarea-bordered rounded-xl min-h-[80px] bg-base-100"
                  placeholder="Contoh: Kacamata patah, Lensa sudah sangat buram / baret"
                  value={oldData.note || ""}
                  onChange={(e) => updateOldData("note", e.target.value)}
                ></textarea>
              </fieldset>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* PANEL CARD 3: REKOMENDASI UKURAN REKAP BARU                 */}
        {/* ========================================================== */}
        <div className="card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl">
          <div className="card-body p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-base-200">
              <Eye className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-sm text-base-content">
                3. Hasil Resep Lensa / Ukuran Baru Pasien
              </h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                    PD Jauh Baru
                  </legend>
                  <input
                    type="number"
                    placeholder="mm"
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
                    PD Dekat Baru
                  </legend>
                  <input
                    type="number"
                    placeholder="mm"
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
                  Tanggal Periksa *
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
                      Pilih Cabang Pemeriksaan
                    </option>
                    {selectData?.optics.map((op) => (
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

              {/* Rincian Produk & Garansi */}
              <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                Catatan (Optional)
              </legend>
              <div className="bg-base-200/40 p-4 border border-base-300/40 rounded-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
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
                    <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
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
                    <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
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
                    <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
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
                    <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
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
                  <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                    Catatan Lain
                  </legend>
                  <textarea
                    className="textarea textarea-sm textarea-bordered rounded-xl min-h-[80px] bg-base-100"
                    placeholder="Catatan tambahan hasil refraksi..."
                    value={note.note || ""}
                    onChange={(e) => updateNote("note", e.target.value)}
                  ></textarea>
                </fieldset>
              </div>

              {/* Upload Lampiran */}
              <fieldset className="fieldset max-w-md">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Lampira Foto Resep / Refraksi
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

        {/* ========================================================== */}
        {/* PANEL SUBMIT ACTION                                        */}
        {/* ========================================================== */}
        <div className="bg-base-100 border border-base-300/60 p-4 rounded-2xl shadow-sm flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm rounded-xl font-medium"
            disabled={isLoadingSave}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm rounded-xl font-bold gap-1.5 px-6 shadow-sm"
            disabled={isLoadingSave}
          >
            {isLoadingSave ? (
              <>
                <span className="loading loading-sm loading-spinner"></span>
                Menyimpan...
              </>
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

export default PatientAdd;
