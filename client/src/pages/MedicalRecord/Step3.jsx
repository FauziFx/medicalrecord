import React, { useRef, useState } from "react";
import UseFormStore from "@/store/UseFormStore";
import { ImageUp } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import api from "@/utils/api";
import useSWR from "swr";

export function Step3({ dataOptic }) {
  const API = import.meta.env.VITE_API_URL;
  const {
    setStep,
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
  } = UseFormStore();
  const inputFile = useRef(null);

  const fetcher = async (url) => {
    try {
      const resOptic = await api.get("/optic?status=active");

      return resOptic.data.data;
    } catch (error) {
      console.log(error);
    }
  };

  const { data, error, isLoading } = useSWR(`/step3`, fetcher);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep(4);
  };

  if (error) return <p>Error loading data.</p>;

  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="mt-6 mb-4 font-semibold text-xl">Ukuran Baru</h1>
      <form onSubmit={handleSubmit} autoComplete="off">
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
            value={newData.opticId || ""}
            onChange={(e) => updateNewData("opticId", e.target.value)}
          >
            <option disabled value="">
              Pilih Optik
            </option>
            {!isLoading &&
              data.map((item, index) => (
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
        <div className="w-full max-w-xs">
          <label className="text-xs font-semibold">Keterangan (Optional)</label>
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
        <div className="w-full max-w-xs">
          <label className="text-xs">Garansi Frame</label>
          <select
            className="select select-sm w-full max-w-xs"
            value={garansiFrame}
            onChange={(e) => setGaransiFrame(e.target.value)}
          >
            <option value="-">-</option>
            <option value="6">6 Bulan</option>
            <option value="1">1 Tahun</option>
            <option value="2">2 Tahun</option>
            <option value="3">3 Tahun</option>
          </select>
        </div>
        <div className="w-full max-w-xs mb-2">
          <label className="text-xs">Garansi Lensa</label>
          <select
            className="select select-sm w-full max-w-xs"
            value={garansiLensa}
            onChange={(e) => setGaransiLensa(e.target.value)}
          >
            <option value="-">-</option>
            <option value="6">6 Bulan</option>
            <option value="1">1 Tahun</option>
            <option value="2">2 Tahun</option>
            <option value="3">3 Tahun</option>
          </select>
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
            <button
              type="button"
              className="btn btn-sm join-item w-1/2 btn-soft"
              onClick={() => setStep(2)}
            >
              « Back
            </button>
            <button
              type="submit"
              className="btn btn-sm join-item w-1/2 btn-primary"
              disabled={image === ""}
            >
              Next »
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Step3;
