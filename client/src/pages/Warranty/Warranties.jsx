import {
  ShieldCheckIcon,
  Search,
  Store,
  Calendar,
  Info,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LoadingTable } from "@/components";
import api from "@/utils/api";
import useSWR from "swr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { useDebounce } from "@/hooks/useDebounce";

dayjs.extend(utc);
dayjs.extend(timezone);

const formatNama = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export function Warranties() {
  const [name, setName] = useState("");
  const [opticId, setOpticId] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 15;
  const location = useLocation();

  const [state, setState] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  const handleDateChange = (item) => {
    setState([item.selection]);
    setStartDate(format(item.selection.startDate, "yyyy-MM-dd"));
    setEndDate(format(item.selection.endDate, "yyyy-MM-dd"));
  };

  const resetDate = () => {
    setState([
      {
        startDate: null,
        endDate: null,
        key: "selection",
      },
    ]);
    setStartDate(null);
    setEndDate(null);
  };

  // State untuk menyimpan data item garansi yang sedang dipilih di Modal
  const [selectedWarranty, setSelectedWarranty] = useState(null);

  const debouncedName = useDebounce(name, 500);
  const debouncedOpticId = useDebounce(opticId, 300);
  const debouncedStartDate = useDebounce(startDate, 500);
  const debouncedEndDate = useDebounce(endDate, 500);

  const query = new URLSearchParams({ page, limit });
  if (name) query.append("name", debouncedName);
  if (opticId) query.append("opticId", debouncedOpticId);
  if (startDate) query.append("startDate", debouncedStartDate);
  if (endDate) query.append("endDate", debouncedEndDate);

  const fetcher = async (url) => {
    const response = await api.get(url);
    const resOptic = await api.get("/optic?status=active");
    return {
      dataOptic: resOptic.data.data,
      data: response.data.data,
      totalData: response.data.totalData,
      totalPages: response.data.totalPages,
    };
  };

  const { data, error, isLoading } = useSWR(
    `/warranty?${query.toString()}`,
    fetcher,
  );

  const checkStatusGaransi = (expireDate) => {
    const today = dayjs();
    return today.isBefore(dayjs(expireDate)) ? "Aktif" : "Kedaluwarsa";
  };

  const openDetailModal = (warrantyItem) => {
    setSelectedWarranty(warrantyItem);
    document.getElementById("detail_warranty_modal").showModal();
  };

  if (error)
    return (
      <div className="alert alert-error max-w-md mx-auto mt-10 rounded-2xl">
        Gagal memuat data garansi.
      </div>
    );

  return (
    <div className="space-y-4">
      {/* HEADER UTAMA */}
      <div className="bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-4 rounded-2xl border border-base-300/60 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-base-content">
          Data Garansi
        </h1>
        <p className="text-xs text-base-content/50">
          Pantau masa aktif kartu garansi pasien
        </p>
      </div>

      {/* KARTU FILTER PANEL */}
      <div className="card bg-base-100 border border-base-300/60 shadow-sm p-4 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="input input-bordered input-sm flex items-center gap-2 bg-base-100 rounded-xl">
            <Search className="h-3.5 w-3.5 text-base-content/40" />
            <input
              type="search"
              placeholder="Nama pasien..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="grow text-xs"
            />
          </label>

          <label className="input input-bordered input-sm flex items-center gap-2 bg-base-100 rounded-xl">
            <Store className="h-3.5 w-3.5 text-base-content/40" />
            <select
              value={opticId}
              onChange={(e) => setOpticId(e.target.value)}
              className="grow text-xs bg-transparent border-none outline-none focus:ring-0 p-0"
            >
              <option value="">Semua Cabang Toko</option>
              {!isLoading &&
                data?.dataOptic?.map((item, idx) => (
                  <option key={idx} value={item.id}>
                    {item.optic_name}
                  </option>
                ))}
            </select>
          </label>

          <div className="flex items-center">
            <div className="dropdown dropdown-bottom w-full">
              <div
                tabIndex={0}
                role="button"
                className={`btn btn-sm bg-base-100 flex items-center text-xs justify-start font-normal ${startDate && endDate ? "rounded-e-none rounded-s-xl" : "rounded-xl"}`}
              >
                <Calendar className="h-3.5 w-3.5 text-base-content/40" />
                {startDate === endDate || !startDate || !endDate
                  ? "Semua Tanggal"
                  : `${format(new Date(startDate), "dd/MM/yyyy")} - ${format(
                      new Date(endDate),
                      "dd/MM/yyyy",
                    )}`}
              </div>
              <ul
                tabIndex="-1"
                className="dropdown-content menu bg-base-100 rounded-box z-1 p-2 shadow-sm"
              >
                <div>
                  <DateRange
                    editableDateInputs={true}
                    onChange={handleDateChange}
                    maxDate={new Date()}
                    moveRangeOnFirstSelection={false}
                    ranges={state}
                  />
                </div>
              </ul>
            </div>
            {startDate && endDate && (
              <button
                className="btn btn-sm btn-error rounded-full hover:text-error/70 rounded-s-none rounded-e-xl"
                onClick={(e) => {
                  e.stopPropagation();
                  resetDate();
                }}
              >
                x
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AREA UTAMA DATA GARANSI */}
      <div className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm overflow-hidden p-2">
        {/* VIEW 1: LAYOUT MOBILE */}
        <div className="block md:hidden divide-y divide-base-200/60">
          {isLoading ? (
            <div className="p-6 text-center">
              <span className="loading loading-spinner text-primary"></span>
            </div>
          ) : (
            data?.data?.map((item, idx) => (
              <div
                key={idx}
                className="p-4 flex items-center justify-between gap-2"
              >
                <div>
                  <h4 className="text-sm font-bold text-base-content">
                    {formatNama(item.name)}
                  </h4>
                  <p className="text-[10px] text-base-content/40 font-mono mt-0.5">
                    {item.optic?.optic_name} •{" "}
                    {dayjs(item.createdAt).format("DD-MM-YYYY")}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/warranty/add-warranty-claim"
                    state={{ warrantyId: item.id, prevPage: location.pathname }}
                    className="btn btn-primary btn-xs rounded-lg shadow-2xs gap-1"
                  >
                    <ShieldCheckIcon className="h-4 w-4" /> Klaim
                  </Link>
                  <button
                    type="button"
                    onClick={() => openDetailModal(item)}
                    className="btn btn-outline btn-xs rounded-lg"
                  >
                    Detail
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* VIEW 2: LAYOUT DESKTOP (TAMPILAN RINGKAS & BERSIH) */}
        <div className="hidden md:block overflow-hidden w-full">
          <table className="table table-sm w-full border-none table-fixed">
            <thead>
              <tr className="border-b border-base-200 text-base-content/50 text-[11px] uppercase tracking-wider bg-base-200/40">
                <th className="w-14 text-center py-3">#</th>
                <th className="w-[35%]">Nama Pasien</th>
                <th className="w-[25%]">Cabang Optik</th>
                <th className="w-[20%]">Tanggal Transaksi</th>
                <th className="w-[20%] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading ? (
                data.data.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-base-200/30 border-b border-base-200"
                  >
                    <td className="text-center font-mono text-xs text-base-content/40">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="font-bold text-xs text-base-content truncate">
                      {formatNama(item.name)}
                    </td>
                    <td className="text-xs font-semibold text-base-content/70 truncate">
                      {item.optic?.optic_name}
                    </td>
                    <td className="font-mono text-xs text-base-content/60">
                      {dayjs(item.createdAt).format("DD-MM-YYYY")}
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* TOMBOL KLAIM GARANSI */}
                        <Link
                          to="/warranty/add-warranty-claim"
                          state={{
                            warrantyId: item.id,
                            prevPage: location.pathname,
                          }}
                          className="btn btn-xs btn-primary rounded-lg tooltip"
                          data-tip="Proses Klaim Garansi"
                        >
                          <ShieldCheckIcon className="h-4 w-4" />
                          Klaim
                        </Link>
                        {/* TOMBOL MODAL DETAIL */}
                        <button
                          type="button"
                          onClick={() => openDetailModal(item)}
                          className="btn btn-outline btn-xs rounded-lg tooltip"
                          data-tip="Lihat Detail Resep & Garansi"
                        >
                          {" "}
                          Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <LoadingTable row="10" colspan="5" />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINASI GLOBAL */}
      {!isLoading && data && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 bg-base-100 p-3 rounded-2xl border border-base-300/60 shadow-3xs">
          <div className="text-xs text-base-content/50">
            Total Data:{" "}
            <span className="font-bold text-base-content">
              {data.totalData || 0}
            </span>
          </div>
          <div className="join">
            <button
              className="join-item btn btn-xs px-3 bg-base-100"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              «
            </button>
            <button className="join-item btn btn-xs font-semibold bg-base-200 no-animation">
              Hal {page} dari {data.totalPages || 1}
            </button>
            <button
              className="join-item btn btn-xs px-3 bg-base-100"
              disabled={page >= data.totalPages}
              onClick={() => setPage(page + 1)}
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* DIALOG MODAL: DESAIN FISIK KARTU GARANSI OPTIK DIGITAL      */}
      {/* ========================================================== */}
      <dialog
        id="detail_warranty_modal"
        className="modal modal-bottom sm:modal-middle"
      >
        {/* REVISI: Tambahkan max-h-[85vh] sm:max-h-none dan flex flex-col agar layout terbagi rata antara header, body, dan footer */}
        <div className="modal-box p-0 max-w-lg rounded-t-2xl sm:rounded-2xl bg-base-100 border border-base-300/60 shadow-2xl overflow-hidden max-h-[85vh] sm:max-h-none flex flex-col">
          {/* HEADER MODAL (Tetap terkunci di atas) */}
          <div className="bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-5 flex justify-between items-center border-b border-base-200 shrink-0">
            <div>
              <h3 className="font-extrabold text-base text-base-content tracking-tight flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-primary" /> KARTU
                GARANSI DIGITAL
              </h3>
              <p className="text-[10px] text-base-content/40 font-mono tracking-wider uppercase mt-0.5">
                Nota Transaksi: #{selectedWarranty?.id}
              </p>
            </div>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost">
                <X className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* BADAN FISIK KARTU GARANSI */}
          {/* REVISI: Tambahkan overflow-y-auto dan grow agar area ini saja yang bisa di-scroll ketika layar HP sempit */}
          {selectedWarranty && (
            <div className="p-5 space-y-5 text-sm overflow-y-auto grow [scrollbar-width:thin]">
              {/* 1. INFORMASI CABANG & PELANGGAN */}
              <div className="grid grid-cols-2 gap-4 bg-base-200/30 p-3.5 rounded-xl border border-base-300/40">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-base-content/40 uppercase tracking-widest block">
                    Nama Pelanggan
                  </span>
                  <p className="font-extrabold text-base-content text-sm tracking-tight">
                    {formatNama(selectedWarranty.name)}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-base-content/40 uppercase tracking-widest block">
                    Cabang Penerbit
                  </span>
                  <p className="font-bold text-primary text-sm">
                    {selectedWarranty.optic?.optic_name}
                  </p>
                </div>
                <div className="space-y-0.5 col-span-2 pt-1 border-t border-base-300/40">
                  <span className="text-[9px] font-bold text-base-content/40 uppercase tracking-widest block">
                    Tanggal Pembelian
                  </span>
                  <p className="font-mono font-semibold text-base-content/70">
                    {dayjs(selectedWarranty.createdAt).format("DD MMMM YYYY")}
                  </p>
                </div>
              </div>

              {/* 2. SPESIFIKASI PRODUK (FRAME & LENSA) */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-base-content/40 uppercase tracking-wider block">
                  Item Yang Dijamin
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-base-100 border border-base-300/60 p-3 rounded-xl shadow-2xs">
                    <span className="text-[9px] font-bold text-base-content/40 uppercase block">
                      Koleksi Frame
                    </span>
                    <p className="font-bold text-base-content mt-0.5 truncate">
                      {selectedWarranty.frame || "—"}
                    </p>
                  </div>
                  <div className="bg-base-100 border border-base-300/60 p-3 rounded-xl shadow-2xs">
                    <span className="text-[9px] font-bold text-base-content/40 uppercase block">
                      Spesifikasi Lensa
                    </span>
                    <p className="font-bold text-base-content mt-0.5 truncate">
                      {selectedWarranty.lens || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. GRID UKURAN LENSA MATA */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-base-content/40 uppercase tracking-wider block">
                  Spesifikasi Resep Lensa
                </span>
                <div className="border border-base-300/70 rounded-xl overflow-hidden shadow-2xs bg-base-100">
                  <table className="table table-xs w-full text-center border-none font-mono">
                    <thead>
                      <tr className="bg-base-200/50 text-[10px] font-bold text-base-content/50 border-b border-base-200">
                        <th className="py-2 text-left pl-3 font-sans">MATA</th>
                        <th className="py-2">SPH</th>
                        <th className="py-2">CYL</th>
                        <th className="py-2">AXIS</th>
                        <th className="py-2">ADD</th>
                        <th className="py-2 pr-3 font-sans">PD</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-bold text-base-content/90">
                      <tr className="border-b border-base-200/60">
                        <td className="py-2 text-left pl-3 font-sans text-primary font-bold">
                          OD (Kanan)
                        </td>
                        <td className="py-2 bg-primary/2%">
                          {selectedWarranty.od?.split("/")[0] || "0.00"}
                        </td>
                        <td className="py-2">
                          {selectedWarranty.od?.split("/")[1] || "—"}
                        </td>
                        <td className="py-2">
                          {selectedWarranty.od?.split("/")[2] || "—"}
                        </td>
                        <td className="py-2">
                          {selectedWarranty.od?.split("/")[3] || "—"}
                        </td>
                        <td
                          className="py-2 pr-3 align-middle font-sans text-base-content/60"
                          rowSpan={2}
                        >
                          {selectedWarranty.od?.split("/")[4]
                            ? `${Number(selectedWarranty.od.split("/")[4]) * 2} mm`
                            : "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-left pl-3 font-sans text-secondary font-bold">
                          OS (Kiri)
                        </td>
                        <td className="py-2 bg-secondary/2%">
                          {selectedWarranty.os?.split("/")[0] || "0.00"}
                        </td>
                        <td className="py-2">
                          {selectedWarranty.os?.split("/")[1] || "—"}
                        </td>
                        <td className="py-2">
                          {selectedWarranty.os?.split("/")[2] || "—"}
                        </td>
                        <td className="py-2">
                          {selectedWarranty.os?.split("/")[3] || "—"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. MASA BERLAKU VALIDITAS GARANSI PRODUK */}
              <div className="space-y-2 border-t border-base-200 pt-4">
                <span className="text-[10px] font-extrabold text-base-content/40 uppercase tracking-wider block">
                  Validitas Garansi Toko
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedWarranty.warranty_frame !== "-" ? (
                    <div className="bg-base-100 border border-base-300/60 rounded-xl p-3 flex justify-between items-center shadow-2xs relative overflow-hidden">
                      <div className="space-y-0.5">
                        <p className="font-bold text-xs text-base-content">
                          Garansi Frame
                        </p>
                        <p className="text-[10px] text-base-content/40 font-mono">
                          Hingga:{" "}
                          {dayjs(selectedWarranty.expire_frame).format(
                            "DD MMM YYYY",
                          )}
                        </p>
                      </div>
                      <span
                        className={`badge badge-sm font-extrabold rounded-md shadow-3xs ${checkStatusGaransi(selectedWarranty.expire_frame) === "Aktif" ? "badge-primary badge-soft" : "badge-error badge-soft"}`}
                      >
                        {checkStatusGaransi(
                          selectedWarranty.expire_frame,
                        ).toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-base-200/20 border border-base-300/30 rounded-xl p-3 flex justify-between items-center opacity-60">
                      <p className="font-medium text-xs text-base-content/40">
                        Frame Tanpa Garansi
                      </p>
                      <span className="badge badge-sm badge-neutral badge-soft rounded-md text-[9px]">
                        N/A
                      </span>
                    </div>
                  )}

                  {selectedWarranty.warranty_lens !== "-" ? (
                    <div className="bg-base-100 border border-base-300/60 rounded-xl p-3 flex justify-between items-center shadow-2xs relative overflow-hidden">
                      <div className="space-y-0.5">
                        <p className="font-bold text-xs text-base-content">
                          Garansi Lensa
                        </p>
                        <p className="text-[10px] text-base-content/40 font-mono">
                          Hingga:{" "}
                          {dayjs(selectedWarranty.expire_lens).format(
                            "DD MMM YYYY",
                          )}
                        </p>
                      </div>
                      <span
                        className={`badge badge-sm font-extrabold rounded-md shadow-3xs ${checkStatusGaransi(selectedWarranty.expire_lens) === "Aktif" ? "badge-primary badge-soft" : "badge-error badge-soft"}`}
                      >
                        {checkStatusGaransi(
                          selectedWarranty.expire_lens,
                        ).toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-base-200/20 border border-base-300/30 rounded-xl p-3 flex justify-between items-center opacity-60">
                      <p className="font-medium text-xs text-base-content/40">
                        Lensa Tanpa Garansi
                      </p>
                      <span className="badge badge-sm badge-neutral badge-soft rounded-md text-[9px]">
                        N/A
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PANEL ACTION DI BAWAH MODAL (Tetap terkunci di bawah) */}
          <div className="modal-action m-0 p-4 bg-base-200/40 border-t border-base-200 flex gap-2 shrink-0">
            <form method="dialog" className="w-full grid grid-cols-2 gap-2">
              <button className="btn btn-sm btn-neutral rounded-xl font-bold">
                Tutup Kartu
              </button>
              {selectedWarranty && (
                <Link
                  to="/warranty/add-warranty-claim"
                  state={{
                    warrantyId: selectedWarranty.id,
                    prevPage: location.pathname,
                  }}
                  className="btn btn-sm btn-primary rounded-xl font-bold shrink-0 px-4 gap-1.5 flex items-center justify-center"
                >
                  Ajukan Klaim
                </Link>
              )}
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default Warranties;
