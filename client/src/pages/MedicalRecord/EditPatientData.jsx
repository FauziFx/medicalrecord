import React, { useState } from "react";
import UseFormStore from "@/store/UseFormStore";
import api from "@/utils/api";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Save } from "lucide-react";
import useSWR from "swr";

export function EditPatientData() {
  const { patientData, updatePatientData, resetPatientData, toggleCondition } =
    UseFormStore();
  const { id } = useParams();
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const navigate = useNavigate();

  // Validasi
  if (!/^\d+$/.test(id)) {
    return <Navigate to="/medical-record/patients" replace />;
  }

  const fetcher = async (url) => {
    try {
      const resPatient = await api.get(url);
      if (resPatient.data.success) {
        const resMedicalCondition = await api.get("/medicalcondition");
        const resOptic = await api.get("/optic?status=active");
        const newConditions = resPatient.data.data.medicalconditions.map(
          (item) => item.name
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
        navigate("/medical-record");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const { data, error, isLoading } = useSWR("/patient/" + id, fetcher, {
    revalidateOnFocus: false,
  });

  const handleScroll = (e) => {
    e.target.addEventListener(
      "wheel",
      function (e) {
        e.preventDefault();
      },
      {
        passive: false,
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoadingSave(true);
      const data = {
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

      const response = await api.patch("/patient/" + id, data);

      if (response.data.success) {
        resetPatientData();
        setIsLoadingSave(false);
        navigate("/medical-record/patients");
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (error) return <p>Error loading data.</p>;
  if (isLoading) return <p>loading data.</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Edit Patient Data</h1>
      <div className="card p-4 bg-white shadow-md pb-8">
        <div className="flex flex-col justify-center items-center">
          <h1 className="mt-6 font-semibold text-xl">Edit Data Pasien</h1>
          <form autoComplete="off" onSubmit={handleSubmit}>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Nama Optik</label>
              <select
                className="select select-sm w-full max-w-xs"
                required
                value={patientData.opticId}
                onChange={(e) => updatePatientData("opticId", e.target.value)}
              >
                <option disabled value="">
                  Pilih Optik
                </option>
                {!isLoading &&
                  data.optic.map((item, index) => (
                    <option key={index + 1} value={item.id}>
                      {item.optic_name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Nama Lengkap</label>
              <input
                type="text"
                placeholder="Masukkan nama"
                className="input input-sm w-full max-w-xs"
                required
                value={patientData.name}
                onChange={(e) => updatePatientData("name", e.target.value)}
              />
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Jenis Kelamin</label>
              <div className="flex space-x-4">
                <label className="cursor-pointer flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="Laki-laki"
                    className="radio radio-sm radio-info"
                    required
                    checked={patientData.gender === "Laki-laki"}
                    onChange={(e) =>
                      updatePatientData("gender", e.target.value)
                    }
                  />
                  <span className="label-text text-xs ml-2">Laki-laki</span>
                </label>
                <label className="cursor-pointer flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="Perempuan"
                    className="radio radio-sm radio-secondary"
                    required
                    checked={patientData.gender === "Perempuan"}
                    onChange={(e) =>
                      updatePatientData("gender", e.target.value)
                    }
                  />
                  <span className="label-text text-xs ml-2">Perempuan</span>
                </label>
              </div>
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Alamat</label>
              <textarea
                className="textarea textarea-sm w-full max-w-xs"
                placeholder="Alamat"
                required
                value={patientData.address}
                onChange={(e) => updatePatientData("address", e.target.value)}
              ></textarea>
            </div>

            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Nomor Hp</label>
              <input
                type="number"
                placeholder="08xx xxx xxx"
                className="input input-sm w-full max-w-xs"
                value={patientData.phone_number}
                onChange={(e) =>
                  updatePatientData("phone_number", e.target.value)
                }
                onFocus={(e) => handleScroll(e)}
              />
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Tempat Lahir</label>
              <input
                type="text"
                placeholder="Tempat Lahir"
                className="input input-sm w-full max-w-xs"
                value={patientData.place_of_birth}
                onChange={(e) =>
                  updatePatientData("place_of_birth", e.target.value)
                }
              />
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Tanggal Lahir</label>
              <input
                type="date"
                className="input input-sm w-full max-w-xs"
                required
                value={patientData.date_of_birth}
                onChange={(e) =>
                  updatePatientData("date_of_birth", e.target.value)
                }
              />
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Pekerjaan</label>
              <input
                type="text"
                placeholder="Pekerjaan"
                className="input input-sm w-full max-w-xs"
                value={patientData.occupation}
                onChange={(e) =>
                  updatePatientData("occupation", e.target.value)
                }
              />
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Riwayat Penyakit</label>
              <div className="flex flex-col gap-2">
                {!isLoading &&
                  data.medicalcondition.map((item, index) => (
                    <label
                      key={item.id}
                      className="cursor-pointer flex items-center"
                    >
                      <input
                        type="checkbox"
                        checked={patientData.conditions.includes(item.name)} // Bind ke Zustand state
                        onChange={() => toggleCondition(item.name)} // Update Zustand
                        className="checkbox checkbox-sm checkbox-neutral"
                      />
                      <span className="label-text text-xs ml-2">
                        {item.name}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="join w-full gap-1 mb-1">
                <Link
                  to="/medical-record"
                  type="submit"
                  name="next"
                  className="btn btn-sm join-item btn-soft btn-primary w-1/2"
                  disabled={isLoadingSave}
                >
                  « Back
                </Link>
                <button
                  type="submit"
                  name="save"
                  className="btn btn-sm join-item btn-primary w-1/2"
                  disabled={isLoadingSave}
                >
                  {isLoadingSave ? (
                    <span className="loading loading-sm loading-spinner"></span>
                  ) : (
                    <>
                      <Save className="h-4" /> Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditPatientData;
