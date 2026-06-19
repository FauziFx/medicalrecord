import React, { useState } from "react";
import UseFormStore from "@/store/UseFormStore";
import api from "@/utils/api";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, User } from "lucide-react";
import useSWR from "swr";
import Swal from "sweetalert2";

export function PatientEdit() {
  const { patientData, updatePatientData, resetPatientData, toggleCondition } =
    UseFormStore();
  const { id } = useParams();
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const navigate = useNavigate();

  // Validasi ID Angka murni
  if (!/^\d+$/.test(id)) {
    return <Navigate to="/rekam-medis" replace />;
  }

  const fetcher = async (url) => {
    const resPatient = await api.get(url);
    if (resPatient.data.success) {
      const resMedicalCondition = await api.get("/medicalcondition");
      const resOptic = await api.get("/optic?status=active");
      const newConditions = resPatient.data.data.medicalconditions.map(
        (item) => item.name,
      );
      let patient = resPatient.data.data;

      updatePatientData("name", patient.name);
      updatePatientData("gender", patient.gender);
      updatePatientData("address", patient.address);
      updatePatientData("phone_number", patient.phone_number);
      updatePatientData("place_of_birth", patient.place_of_birth);
      updatePatientData("date_of_birth", patient.date_of_birth.split("T")[0]);
      updatePatientData("occupation", patient.occupation);
      updatePatientData("opticId", patient.opticId);
      updatePatientData("conditions", newConditions);

      const data = {
        medicalcondition: resMedicalCondition.data.data,
        optic: resOptic.data.data,
      };

      return data;
    } else {
      navigate("/rekam-medis");
    }
  };

  const { data, error, isLoading } = useSWR("/patient/" + id, fetcher, {
    revalidateOnFocus: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoadingSave(true);
      const payload = {
        name: patientData.name,
        address: patientData.address,
        phone_number: patientData.phone_number,
        place_of_birth: patientData.place_of_birth,
        date_of_birth: patientData.date_of_birth,
        occupation: patientData.occupation,
        gender: patientData.gender,
        conditions: patientData.conditions,
        opticId: Number(patientData.opticId),
      };

      const response = await api.patch("/patient/" + id, payload);

      if (response.data.success) {
        resetPatientData();
        setIsLoadingSave(false);
        Swal.fire({
          title: "Berhasil!",
          text: "Data pribadi pasien berhasil disimpan!",
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
            Ubah Data Pasien
          </h1>
          <p className="text-xs text-base-content/50">
            Perbarui informasi identitas pribadi dan riwayat sistemik pasien
          </p>
        </div>
      </div>

      {/* FORM UTAMA */}
      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
        <div className="card bg-base-100 border border-base-300/60 shadow-sm rounded-2xl">
          <div className="card-body p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-base-200">
              <User className="h-4 w-4 text-primary" />
              <h2 className="font-bold text-sm text-base-content">
                Informasi Profil Pasien
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Nama Optik / Cabang
                </legend>
                <select
                  className="select select-bordered select-sm rounded-xl h-9 bg-base-100 w-full"
                  required
                  value={patientData.opticId || ""}
                  onChange={(e) => updatePatientData("opticId", e.target.value)}
                >
                  <option value="" disabled>
                    Pilih Optik
                  </option>
                  {data?.optic.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.optic_name}
                    </option>
                  ))}
                </select>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Nama Lengkap Pasien
                </legend>
                <input
                  type="text"
                  placeholder="Masukkan nama"
                  className="input input-bordered input-sm rounded-xl h-9 w-full"
                  required
                  value={patientData.name || ""}
                  onChange={(e) => updatePatientData("name", e.target.value)}
                />
              </fieldset>

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
                    />
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
                    />
                    <span className="text-xs font-medium">Perempuan</span>
                  </label>
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Nomor HP / WhatsApp
                </legend>
                <input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  className="input input-bordered input-sm rounded-xl h-9 font-mono w-full"
                  value={patientData.phone_number || ""}
                  onChange={(e) =>
                    updatePatientData("phone_number", e.target.value)
                  }
                />
              </fieldset>

              <div className="grid grid-cols-2 gap-2">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                    Tempat Lahir
                  </legend>
                  <input
                    type="text"
                    placeholder="Kota"
                    className="input input-bordered input-sm rounded-xl h-9 w-full"
                    value={patientData.place_of_birth || ""}
                    onChange={(e) =>
                      updatePatientData("place_of_birth", e.target.value)
                    }
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                    Tanggal Lahir
                  </legend>
                  <input
                    type="date"
                    className="input input-bordered input-sm rounded-xl h-9 text-xs w-full"
                    required
                    value={patientData.date_of_birth || ""}
                    onChange={(e) =>
                      updatePatientData("date_of_birth", e.target.value)
                    }
                  />
                </fieldset>
              </div>

              <fieldset className="fieldset">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Pekerjaan
                </legend>
                <input
                  type="text"
                  placeholder="Pekerjaan pasien"
                  className="input input-bordered input-sm rounded-xl h-9 w-full"
                  value={patientData.occupation || ""}
                  onChange={(e) =>
                    updatePatientData("occupation", e.target.value)
                  }
                />
              </fieldset>

              <fieldset className="fieldset m-0 p-0 sm:col-span-2">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Alamat Tempat Tinggal
                </legend>
                <textarea
                  className="textarea textarea-bordered textarea-sm rounded-xl min-h-[68px] w-full"
                  placeholder="Tulis alamat rumah lengkap pasien..."
                  required
                  value={patientData.address || ""}
                  onChange={(e) => updatePatientData("address", e.target.value)}
                ></textarea>
              </fieldset>

              <fieldset className="fieldset m-0 p-0 sm:col-span-2 space-y-1">
                <legend className="fieldset-legend label-text font-semibold text-xs text-base-content/70 py-1 m-0">
                  Riwayat Penyakit Sistemik Pasien
                </legend>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-base-200/40 p-3 rounded-xl border border-base-300/30 w-full">
                  {data?.medicalcondition.map((item) => (
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

        {/* PANEL SUBMIT ACTION */}
        <div className="bg-base-100 border border-base-300/60 p-4 rounded-2xl shadow-sm flex justify-end items-center gap-3">
          <Link
            to="/rekam-medis"
            onClick={() => resetPatientData()}
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
                <Save className="h-4 w-4" /> Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PatientEdit;
