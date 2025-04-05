import React from "react";
import UseFormStore from "@/store/UseFormStore";

export function Step2() {
  const { setStep, oldData, updateOldData, skipOldData } = UseFormStore();

  const handlePower = (e) => {
    const value = e.target.value;
    const field = e.target.name;
    if (!isNaN(value)) {
      updateOldData(field, value);
    } else if (value == "-" || value == "+") {
      updateOldData(field, value);
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

  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="mt-6 font-semibold text-xl">Ukuran Lama</h1>
      <p className="text-sm">(Optional)</p>
      <p className="text-xs mb-4 text-gray-700">
        Klik <span className="font-semibold">"Skip"</span> jika tidak memiliki
        data
      </p>
      <form autoComplete="off">
        <div className="w-full max-w-xs mb-2">
          <div className="join mb-2 gap-1">
            <input
              type="text"
              className="input input-sm px-1 join-item"
              placeholder="R sph"
              name="rsph"
              value={oldData.rsph}
              onChange={(e) => handlePower(e)}
            />
            <input
              type="text"
              className="input input-sm px-1 join-item"
              placeholder="R cyl"
              name="rcyl"
              value={oldData.rcyl}
              onChange={(e) => handlePower(e)}
            />
            <input
              type="text"
              className="input input-sm px-1 join-item"
              placeholder="R axis"
              name="raxis"
              value={oldData.raxis}
              onChange={(e) => handlePower(e)}
            />
            <input
              type="text"
              className="input input-sm px-1 join-item"
              placeholder="R add"
              name="radd"
              value={oldData.radd}
              onChange={(e) => handlePower(e)}
            />
          </div>
          <div className="join gap-1">
            <input
              type="text"
              className="input input-sm px-1 join-item"
              placeholder="L sph"
              name="lsph"
              value={oldData.lsph}
              onChange={(e) => handlePower(e)}
            />
            <input
              type="text"
              className="input input-sm px-1 join-item"
              placeholder="L cyl"
              name="lcyl"
              value={oldData.lcyl}
              onChange={(e) => handlePower(e)}
            />
            <input
              type="text"
              className="input input-sm px-1 join-item"
              placeholder="L axis"
              name="laxis"
              value={oldData.laxis}
              onChange={(e) => handlePower(e)}
            />
            <input
              type="text"
              className="input input-sm px-1 join-item"
              placeholder="L add"
              name="ladd"
              value={oldData.ladd}
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
                value={oldData.far_pd}
                onChange={(e) =>
                  updateOldData("far_pd", Number(e.target.value))
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
                value={oldData.near_pd}
                onChange={(e) =>
                  updateOldData("near_pd", Number(e.target.value))
                }
                onFocus={(e) => handleScroll(e)}
              />
            </div>
          </div>
        </div>
        <div className="w-full max-w-xs mb-2">
          <label className="text-xs font-semibold">Keterangan</label>
          <textarea
            className="textarea textarea-sm w-full max-w-xs"
            placeholder="Keterangan"
            value={oldData.note}
            onChange={(e) => updateOldData("note", e.target.value)}
          ></textarea>
        </div>
        <div className="flex">
          <div className="join gap-1 w-full">
            <button
              type="button"
              className="btn btn-sm join-item w-1/3 btn-soft"
              onClick={() => setStep(1)}
            >
              « Back
            </button>

            <button
              type="button"
              className="btn btn-sm join-item w-1/3 btn-soft btn-primary"
              onClick={() => {
                skipOldData();
                setStep(3);
              }}
            >
              Skip ⏭
            </button>
            <button
              type="button"
              className="btn btn-sm join-item w-1/3 btn-primary"
              onClick={() => setStep(3)}
            >
              Next »
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Step2;
