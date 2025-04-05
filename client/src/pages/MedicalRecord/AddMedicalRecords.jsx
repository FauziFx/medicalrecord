import { ImageUp, Save } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import api from "@/utils/api";
import useSWR from "swr";
import { LoadingTable } from "@/components";
import dayjs from "dayjs"; // Core Day.js
import utc from "dayjs/plugin/utc"; // Plugin UTC
import timezone from "dayjs/plugin/timezone"; // Plugin Timezone
import "dayjs/locale/id";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UseFormStore from "@/store/UseFormStore";
import { v4 as uuidv4 } from "uuid";

// Extend plugins ke Day.js
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("id");

export function AddMedicalRecords() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    newData,
    updateNewData,
    note,
    updateNote,
    image,
    updateImage,
    resetNewData,
  } = UseFormStore();
  const inputFile = useRef(null);

  const [isLoadingSave, setIsLoadingSave] = useState(false);

  useEffect(() => {
    if (!location.state || !location.state.patientId) {
      navigate("/medical-record");
    }
  }, [navigate, location]);

  const patientId = location.state?.patientId;
  const prevPage = location.state?.prevPage;

  const fetcher = async (url) => {
    try {
      const response = await api.get(`/patient/${patientId}`);
      const resOptic = await api.get("/optic?status=active");

      const data = {
        dataPatient: response.data.data,
        dataOptic: resOptic.data.data,
      };
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  const { data, error, isLoading } = useSWR(`/add-medical-record`, fetcher, {
    revalidateOnFocus: false,
  });

  const handlePower = (e) => {
    const value = e.target.value;
    const field = e.target.name;
    if (!isNaN(value)) {
      updateNewData(field, value);
    } else if (value == "-" || value == "+") {
      updateNewData(field, value);
    }
  };

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

  const handleChangeImage = async (e) => {
    if (e.target.files.length != 0) {
      const files = e.target.files[0];
      const maxSize = 5 * 1024 * 1024;
      if (files.size > maxSize) {
        alert("Maximum Size : 5MB");
        return false;
      } else {
        const ext = files.type == "image/jpeg" ? ".jpg" : ".png";
        const fileName = uuidv4() + ext;
        const myRenamedFile = new File([files], fileName, {
          type: files.type,
        });
        updateImage(myRenamedFile);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoadingSave(true);

      const record = [];

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

      record.push(newRecord);

      const formData = new FormData();
      formData.append("image", image);
      formData.append("records", JSON.stringify(record));

      const response = await api.post("/medicalrecord", formData);

      if (response.data.success) {
        setIsLoadingSave(false);
        resetNewData();

        navigate("/medical-record/medical-records");
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (error) return <p>Error loading data.</p>;
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Add Medical Record</h1>
      <div className="card p-4 bg-white shadow-md pb-8">
        <div className="flex flex-col justify-center items-center">
          <h1 className="mt-6 mb-4 font-semibold text-xl">Ukuran Baru</h1>
          <div className="card-body">
            <h2 className="card-title">Informasi Pasien</h2>
            <table className="table table-xs md:table-sm max-w-md rounded-box border border-base-content/5 bg-base-100">
              <tbody>
                {isLoading ? (
                  <LoadingTable row="8" colspan="3" />
                ) : data.dataPatient ? (
                  <>
                    <tr>
                      <th width="35%">Nama</th>
                      <td width="1%">:</td>
                      <th className="uppercase">{data.dataPatient.name}</th>
                    </tr>
                    <tr>
                      <th>Optik</th>
                      <td>:</td>
                      <td>{data.dataPatient.optic.optic_name}</td>
                    </tr>
                    <tr>
                      <th>Jenis Kelamin</th>
                      <td>:</td>
                      <td>{data.dataPatient.gender}</td>
                    </tr>
                    <tr>
                      <th>Alamat</th>
                      <td>:</td>
                      <td>{data.dataPatient.address}</td>
                    </tr>
                    <tr>
                      <th>TTL</th>
                      <td>:</td>
                      <td>
                        {data.dataPatient.place_of_birth},{" "}
                        {dayjs(data.dataPatient.date_of_birth)
                          .tz("Asia/Jakarta")
                          .format("DD MMM YYYY")}
                      </td>
                    </tr>
                    <tr>
                      <th>Pekerjaan</th>
                      <td>:</td>
                      <td>{data.dataPatient.occupation}</td>
                    </tr>
                    <tr>
                      <th className="align-top">Riwayat Penyakit</th>
                      <td className="align-top">:</td>
                      <td>
                        <ul className="list-inside list-disc">
                          {data.dataPatient.medicalconditions.length >= 1 &&
                            data.dataPatient.medicalconditions.map(
                              (item, key) => <li key={key}>{item.name}</li>
                            )}
                        </ul>
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center">
                      Data Not Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <form autoComplete="off" onSubmit={handleSubmit}>
            <div className="w-full max-w-xs mb-2">
              <div className="join mb-2 gap-1">
                <input
                  type="text"
                  className="input input-sm px-1 join-item"
                  placeholder="R sph"
                  name="rsph"
                  value={newData.rsph}
                  onChange={(e) => handlePower(e)}
                  required
                />
                <input
                  type="text"
                  className="input input-sm px-1 join-item"
                  placeholder="R cyl"
                  name="rcyl"
                  value={newData.rcyl}
                  onChange={(e) => handlePower(e)}
                />
                <input
                  type="text"
                  className="input input-sm px-1 join-item"
                  placeholder="R axis"
                  name="raxis"
                  value={newData.raxis}
                  onChange={(e) => handlePower(e)}
                />
                <input
                  type="text"
                  className="input input-sm px-1 join-item"
                  placeholder="R add"
                  name="radd"
                  value={newData.radd}
                  onChange={(e) => handlePower(e)}
                />
              </div>
              <div className="join gap-1">
                <input
                  type="text"
                  className="input input-sm px-1 join-item"
                  placeholder="L sph"
                  name="lsph"
                  value={newData.lsph}
                  onChange={(e) => handlePower(e)}
                  required
                />
                <input
                  type="text"
                  className="input input-sm px-1 join-item"
                  placeholder="L cyl"
                  name="lcyl"
                  value={newData.lcyl}
                  onChange={(e) => handlePower(e)}
                />
                <input
                  type="text"
                  className="input input-sm px-1 join-item"
                  placeholder="L axis"
                  name="laxis"
                  value={newData.laxis}
                  onChange={(e) => handlePower(e)}
                />
                <input
                  type="text"
                  className="input input-sm px-1 join-item"
                  placeholder="L add"
                  name="ladd"
                  value={newData.ladd}
                  onChange={(e) => handlePower(e)}
                />
              </div>
            </div>
            <div className="w-full max-w-xs mb-2">
              <div className="join gap-2">
                <div className="w-full max-w-xs join-item">
                  <label className="text-xs font-semibold">PD Jauh</label>
                  <input
                    type="number"
                    placeholder="PD Jauh"
                    className="input input-sm w-full max-w-xs"
                    value={newData.far_pd}
                    onChange={(e) =>
                      updateNewData("far_pd", Number(e.target.value))
                    }
                    onFocus={(e) => handleScroll(e)}
                  />
                </div>
                <div className="w-full max-w-xs join-item">
                  <label className="text-xs font-semibold">PD Dekat</label>
                  <input
                    type="number"
                    placeholder="PD Dekat"
                    className="input input-sm w-full max-w-xs"
                    value={newData.near_pd}
                    onChange={(e) =>
                      updateNewData("near_pd", Number(e.target.value))
                    }
                    onFocus={(e) => handleScroll(e)}
                  />
                </div>
              </div>
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Tanggal Kunjungan</label>
              <input
                type="date"
                className="input input-sm w-full max-w-xs"
                value={newData.visit_date}
                onChange={(e) => updateNewData("visit_date", e.target.value)}
                required
              />
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Nama Optik</label>
              <select
                className="select select-sm w-full max-w-xs"
                required
                value={newData.opticId}
                onChange={(e) => updateNewData("opticId", e.target.value)}
              >
                <option disabled value="">
                  Pilih Optik
                </option>
                {!isLoading &&
                  data.dataOptic.map((item, index) => (
                    <option key={index + 1} value={item.id}>
                      {item.optic_name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Pemeriksa</label>
              <input
                type="text"
                placeholder="Pemeriksa"
                className="input input-sm w-full max-w-xs"
                value={newData.checked_by}
                onChange={(e) => updateNewData("checked_by", e.target.value)}
                required
              />
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">
                Keterangan (Optional)
              </label>
              <input
                type="text"
                placeholder="Frame"
                className="input input-sm w-full max-w-xs mb-1"
                value={note.frame}
                onChange={(e) => updateNote("frame", e.target.value)}
              />
              <input
                type="text"
                placeholder="Lensa"
                className="input input-sm w-full max-w-xs mb-1"
                value={note.lens}
                onChange={(e) => updateNote("lens", e.target.value)}
              />
              <input
                type="number"
                placeholder="Harga"
                className="input input-sm w-full max-w-xs mb-1"
                value={note.price}
                onChange={(e) => updateNote("price", e.target.value)}
                onFocus={(e) => handleScroll(e)}
              />
              <textarea
                className="textarea textarea-sm w-full max-w-xs"
                placeholder="Keterangan Lain"
                value={note.note}
                onChange={(e) => updateNote("note", e.target.value)}
              ></textarea>
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Lampiran</label>
              <br />
              <label className="text-xs">
                Foto resep dokter, hasil refraksi atau lainnya.
              </label>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg, image/png"
                ref={inputFile}
                onChange={(e) => handleChangeImage(e)}
              />
              <div
                className="card border items-center p-2 py-4 cursor-pointer"
                onClick={() => inputFile.current.click()}
              >
                {image != "" ? (
                  <img
                    src={URL.createObjectURL(image)}
                    className="rounded-lg h-56"
                  />
                ) : (
                  <>
                    <ImageUp />
                    <p className="text-xs text-gray-500 hover:underline">
                      Browse file to upload
                    </p>
                    <p className="font-light text-xs">
                      Supported Formats: .jpg, .png
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex">
              <div className="join gap-1 w-full">
                <Link
                  to={prevPage}
                  type="button"
                  className="btn btn-sm join-item w-1/2 btn-soft"
                  disabled={isLoadingSave}
                  onClick={() => resetNewData()}
                >
                  « Back
                </Link>
                <button
                  type="submit"
                  className="btn btn-sm join-item w-1/2 btn-primary"
                  disabled={image === "" || isLoadingSave}
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

export default AddMedicalRecords;
