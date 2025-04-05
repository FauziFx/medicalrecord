import React from "react";
import UseFormStore from "@/store/UseFormStore";
import { Save } from "lucide-react";
import dayjs from "dayjs"; // Core Day.js
import utc from "dayjs/plugin/utc"; // Plugin UTC
import timezone from "dayjs/plugin/timezone"; // Plugin Timezone
import "dayjs/locale/id";
import { useNavigate } from "react-router-dom";
import api from "@/utils/api";
import useSWR from "swr";

// Extend plugins ke Day.js
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("id");

export function Step4({ dataOptic }) {
  const {
    setStep,
    patientData,
    oldData,
    newData,
    image,
    note,
    resetNewData,
    skipOldData,
    resetPatientData,
  } = UseFormStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  const fetcher = async (url) => {
    try {
      const resOptic = await api.get("/optic?status=active");
      const opticNames = resOptic.data.data.map((item) => item.optic_name);

      return opticNames;
    } catch (error) {
      console.log(error);
    }
  };

  const {
    data: opticNames,
    error,
    isLoading: isLoadingOptic,
  } = useSWR(`/step4`, fetcher);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const savePatient = await api.post("/patient", {
        name: patientData.name,
        address: patientData.address,
        phone_number: patientData.phone_number,
        place_of_birth: patientData.place_of_birth,
        date_of_birth: patientData.date_of_birth,
        occupation: patientData.occupation,
        gender: patientData.gender,
        conditions: patientData.conditions,
        opticId: Number(patientData.opticId),
      });

      const patientId = savePatient.data.patientId;

      const record = [];
      const oldRecord = {
        od: [oldData.rsph, oldData.rcyl, oldData.raxis, oldData.radd].join("/"),
        os: [oldData.lsph, oldData.lcyl, oldData.laxis, oldData.ladd].join("/"),
        far_pd: oldData.far_pd || null,
        near_pd: oldData.near_pd || null,
        visit_date: oldData.visit_date,
        note: oldData.note,
        opticId: Number(patientData.opticId),
        is_olddata: 1,
        patientId: patientId,
      };
      const newRecord = {
        od: [newData.rsph, newData.rcyl, newData.raxis, newData.radd].join("/"),
        os: [newData.lsph, newData.lcyl, newData.laxis, newData.ladd].join("/"),
        far_pd: newData.far_pd || null,
        near_pd: newData.near_pd || null,
        visit_date: newData.visit_date,
        checked_by: newData.checked_by,
        note:
          (note.frame ? note.frame : "") +
          (note.lens ? "\n" + note.lens : "") +
          (note.price ? "\nRp " + note.price : "") +
          (note.note ? "\n" + note.note : ""),
        image: image.name,
        opticId: Number(newData.opticId),
        is_olddata: 0,
        patientId: patientId,
      };

      if (oldData.rsph != "") {
        record.push(oldRecord);
      }

      record.push(newRecord);

      const formData = new FormData();
      formData.append("image", image);
      formData.append("records", JSON.stringify(record));

      const response = await api.post("/medicalrecord", formData);

      if (response.data.success) {
        setIsLoading(false);
        resetPatientData();
        skipOldData();
        resetNewData();
        setStep(1);

        navigate("/medical-record/patients");
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (error) return <p>Error loading data.</p>;
  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="mt-6 mb-4 font-semibold text-xl">Ringkasan</h1>
      <table className="table table-xs md:table-sm max-w-md rounded-box border border-base-content/5 bg-base-100">
        <thead>
          <tr>
            <th className="text-black" colSpan={3}>
              Data Pasien
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td width="35%">Nama</td>
            <td width="1%">:</td>
            <td>{patientData.name}</td>
          </tr>
          <tr>
            <td>Optik</td>
            <td>:</td>
            <td>{!isLoadingOptic && opticNames[patientData.opticId - 1]}</td>
          </tr>
          <tr>
            <td>Jenis Kelamin</td>
            <td>:</td>
            <td>{patientData.gender}</td>
          </tr>
          <tr>
            <td>Alamat</td>
            <td>:</td>
            <td>{patientData.address}</td>
          </tr>
          <tr>
            <td>TTL</td>
            <td>:</td>
            <td>
              {patientData.place_of_birth},{" "}
              {dayjs(patientData.date_of_birth)
                .tz("Asia/Jakarta")
                .format("DD MMMM YYYY")}
            </td>
          </tr>
          <tr>
            <td>Pekerjaan</td>
            <td>:</td>
            <td>{patientData.occupation}</td>
          </tr>
          <tr>
            <td className="align-top">Riwayat Penyakit</td>
            <td className="align-top">:</td>
            <td>
              <ul className="list-inside list-disc">
                {patientData.conditions.length != 0 &&
                  patientData.conditions.map((item, key) => (
                    <li key={key}>{item}</li>
                  ))}
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Ukuran Lama */}
      <table className="table table-xs md:table-sm max-w-md rounded-box border border-base-content/5 bg-base-100">
        <thead>
          <tr>
            <th className="text-black" colSpan={5}>
              Ukuran Lama
            </th>
          </tr>
        </thead>
        {oldData.rsph != "" && (
          <tbody>
            <tr>
              <td className="border-y">OD</td>
              <td className="border-y">{oldData.rsph}</td>
              <td className="border-y">{oldData.rcyl}</td>
              <td className="border-y">{oldData.raxis}</td>
              <td className="border-y">{oldData.radd}</td>
            </tr>
            <tr>
              <td className="border-y">OS</td>
              <td className="border-y">{oldData.lsph}</td>
              <td className="border-y">{oldData.lcyl}</td>
              <td className="border-y">{oldData.laxis}</td>
              <td className="border-y">{oldData.ladd}</td>
            </tr>
          </tbody>
        )}
      </table>
      <table className="table table-xs md:table-sm max-w-md rounded-box border border-base-content/5 bg-base-100">
        {oldData.rsph != "" && (
          <tbody>
            <tr>
              <td width="35%">PD</td>
              <td width="1%">:</td>
              <td colSpan={3}>
                {oldData.far_pd && oldData.near_pd
                  ? `${oldData.far_pd}/${oldData.near_pd}`
                  : oldData.far_pd
                  ? oldData.far_pd
                  : null}
              </td>
            </tr>
            <tr>
              <td>Keterangan</td>
              <td>:</td>
              <td colSpan={3}>{oldData.note}</td>
            </tr>
          </tbody>
        )}
      </table>

      {/* Uukuran Baru */}
      <table className="table table-xs md:table-sm max-w-md rounded-box border border-base-content/5 bg-base-100">
        <thead>
          <tr>
            <th className="text-black" colSpan={5}>
              Ukuran Baru
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-y py-1">OD</td>
            <td className="border-y py-1">{newData.rsph}</td>
            <td className="border-y py-1">{newData.rcyl}</td>
            <td className="border-y py-1">{newData.raxis}</td>
            <td className="border-y py-1">{newData.radd}</td>
          </tr>
          <tr>
            <td className="border-y py-1">OS</td>
            <td className="border-y py-1">{newData.lsph}</td>
            <td className="border-y py-1">{newData.lcyl}</td>
            <td className="border-y py-1">{newData.laxis}</td>
            <td className="border-y py-1">{newData.ladd}</td>
          </tr>
        </tbody>
      </table>
      <table className="table table-xs md:table-sm max-w-md rounded-box border border-base-content/5 bg-base-100">
        <tbody>
          <tr>
            <td width="35%">PD</td>
            <td width="1%">:</td>
            <td>
              {newData.far_pd && newData.near_pd
                ? `${newData.far_pd}/${newData.near_pd}`
                : newData.far_pd
                ? newData.far_pd
                : null}
            </td>
          </tr>
          <tr>
            <td>Tanggal</td>
            <td>:</td>
            <td>
              {dayjs(newData.date).tz("Asia/Jakarta").format("DD-MM-YYYY")}
            </td>
          </tr>
          <tr>
            <td>Optik</td>
            <td>:</td>
            <td>{!isLoadingOptic && opticNames[newData.opticId - 1]}</td>
          </tr>
          <tr>
            <td>Pemeriksa</td>
            <td>:</td>
            <td>{newData.checked_by}</td>
          </tr>
          <tr>
            <td className="align-top">Keterangan</td>
            <td className="align-top">:</td>
            <td>
              {note.frame} <br />
              {note.lens}
              <br />
              {note.price && `Rp.${note.price}`}
              <br />
              {note.note}
            </td>
          </tr>
        </tbody>
      </table>
      <div className="p-6">
        <img
          src={image != "" ? URL.createObjectURL(image) : ""}
          className="h-56 mx-auto shadow-md"
          alt=""
        />
      </div>
      <div className="flex max-w-xs w-full">
        <div className="join gap-1 w-full">
          <button
            type="button"
            className="btn btn-sm join-item w-1/2 btn-soft"
            onClick={() => setStep(3)}
            // disabled={isLoading}
          >
            « Back
          </button>
          <button
            type="submit"
            className="btn btn-sm join-item w-1/2 btn-primary"
            onClick={() => handleSubmit()}
            // disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-sm loading-spinner"></span>
            ) : (
              <>
                <Save className="h-4" /> Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Step4;
