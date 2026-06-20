import React, { useState } from "react";
import api from "@/utils/api";
import useSWR from "swr";
import { LoadingTable } from "@/components";
import {
  FilterX,
  Search,
  Layers,
  RefreshCw,
  X,
  PackageOpen,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export function Stock() {
  const [type, setType] = useState("");
  const [coating, setCoating] = useState("");
  const [name, setName] = useState("");
  const [variantName, setVariantName] = useState("");
  const [productName, setProductName] = useState("");

  const [page, setPage] = useState(1);
  const [pageDetail, setPageDetail] = useState(1);
  const limit = 15;
  const [showDetail, setShowDetail] = useState(false);

  // DEBOUNCE FILTER
  const debouncedName = useDebounce(name, 500);
  const debouncedVariantName = useDebounce(variantName, 500);

  // QUERY STRING
  const query = new URLSearchParams({ page, limit });
  if (debouncedName) query.append("name", debouncedName);
  if (type) query.append("type", type);
  if (coating) query.append("coating", coating);

  const queryDetail = new URLSearchParams({
    page: pageDetail,
    limit,
    productName,
  });
  if (debouncedVariantName) queryDetail.append("name", debouncedVariantName);

  const fetcher = async (url) => {
    const response = await api.get(url);
    return response.data;
  };

  const { data, error, isLoading } = useSWR(
    `/stock/lens?${query.toString()}`,
    fetcher,
  );
  const { data: dataDetail, isLoading: isLoadingDetail } = useSWR(
    productName ? `/stock/lens/detail?${queryDetail.toString()}` : null,
    fetcher,
  );

  const resetFilter = () => {
    setType("");
    setCoating("");
    setName("");
    setPage(1);
  };

  const handleProductClick = (pName) => {
    setProductName(pName);
    setPageDetail(1);
    setShowDetail(true);
    setVariantName("");

    // Khusus layar mobile (di bawah 1024px), langsung panggil pemicu DaisyUI Modal
    if (window.innerWidth < 1024) {
      document.getElementById("mobile_stock_detail_modal").showModal();
    }
  };

  const handleCloseMobileModal = () => {
    setShowDetail(false);
    setProductName("");
    document.getElementById("mobile_stock_detail_modal").close();
  };

  if (error)
    return (
      <div className="alert alert-error max-w-md mx-auto mt-10 rounded-2xl">
        Gagal memuat informasi stok lensa.
      </div>
    );

  // SUBSITUSI ELEMEN VARIANT DETAIL (Agar kode lebih bersih & reusable)
  const renderDetailContent = () => (
    <div className="space-y-3">
      {/* Input Khusus Cari Ukuran Power */}
      <fieldset className="fieldset m-0 p-0 max-w-xs">
        <label className="input input-bordered input-sm flex items-center gap-2 bg-base-100 rounded-xl h-8 w-full">
          <Search className="h-3 w-3 text-base-content/40" />
          <input
            type="search"
            placeholder="Cari resep (Misal: -2.00)..."
            value={variantName}
            onChange={(e) => {
              setVariantName(e.target.value);
              setPageDetail(1);
            }}
            className="grow text-[11px]"
          />
        </label>
      </fieldset>

      {/* Tabel Varian */}
      <div className="overflow-x-auto w-full">
        <table className="table table-sm w-full table-fixed">
          <thead>
            <tr className="border-b border-base-200 text-base-content/50 text-[11px] uppercase tracking-wider bg-base-200/40">
              <th className="w-[60%] py-2 pl-3">Ukuran / Power Lensa</th>
              <th className="w-[40%] text-center py-2">Jumlah Stok</th>
            </tr>
          </thead>
          <tbody>
            {!isLoadingDetail && dataDetail ? (
              dataDetail.data.map((item, index) => (
                <tr
                  key={index}
                  className={`border-b border-base-200/60 transition-colors ${
                    item.stock <= 0
                      ? "bg-error/15 text-error-content"
                      : item.stock === 1
                        ? "bg-warning/15 text-warning-content"
                        : "hover:bg-base-200/40"
                  }`}
                >
                  <td className="text-xs font-mono font-bold py-2.5 pl-3">
                    {item.name}
                  </td>
                  <td className="text-center font-mono text-xs font-bold">
                    {item.stock <= 0 ? (
                      <span className="badge badge-error badge-xs font-bold px-1.5 rounded">
                        Habis
                      </span>
                    ) : (
                      `${item.stock} Pcs`
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <LoadingTable row="8" colspan="2" />
            )}
          </tbody>
        </table>
      </div>

      {/* Paginasi Internal Variant */}
      {!isLoadingDetail && dataDetail && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-base-200 text-[11px]">
          <span className="text-base-content/40">
            Total:{" "}
            <span className="font-bold text-base-content">
              {dataDetail.totalData} varian
            </span>
          </span>
          <div className="join">
            <button
              className="join-item btn btn-xs px-2 bg-base-100"
              disabled={pageDetail <= 1}
              onClick={() => setPageDetail(pageDetail - 1)}
            >
              «
            </button>
            <button className="join-item btn btn-xs bg-base-200 no-animation">
              Hal {pageDetail} / {dataDetail.totalPages || 1}
            </button>
            <button
              className="join-item btn btn-xs px-2 bg-base-100"
              disabled={pageDetail >= dataDetail.totalPages}
              onClick={() => setPageDetail(pageDetail + 1)}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 pb-12">
      {/* HEADER UTAMA */}
      <div className="bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-4 rounded-2xl border border-base-300/60 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-base-content">
          Ketersediaan Stok Lensa
        </h1>
        <p className="text-xs text-base-content/50">
          Cek ketersediaan lensa berdasarkan spesifikasi power
        </p>
      </div>

      {/* PANEL FILTER PENCARIAN */}
      <div className="card bg-base-100 border border-base-300/60 shadow-sm p-4 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="input input-bordered input-sm flex items-center gap-2 bg-base-100 rounded-xl">
            <Search className="h-3.5 w-3.5 text-base-content/40" />
            <input
              type="search"
              placeholder="Essilor, Polycore..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setPage(1);
              }}
              className="grow text-xs"
            />
          </label>

          <label className="input input-bordered input-sm flex items-center gap-2 bg-base-100 rounded-xl">
            <Layers className="h-3.5 w-3.5 text-base-content/40" />
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
                if (e.target.value === "") setCoating("");
              }}
              className="grow text-xs bg-transparent border-none outline-none p-0"
            >
              <option value="">Semua Tipe</option>
              <option value="sv">Single Vision</option>
              <option value="kt">Bifocal (Kriptok)</option>
              <option value="prog">Progressive</option>
            </select>
          </label>

          <label className="input input-bordered input-sm flex items-center gap-2 bg-base-100 rounded-xl">
            <RefreshCw className="h-3.5 w-3.5 text-base-content/40" />
            <select
              value={coating}
              onChange={(e) => {
                setCoating(e.target.value);
                setPage(1);
              }}
              className="grow text-xs bg-transparent border-none outline-none p-0"
              disabled={type === ""}
            >
              <option value="">Semua Lapisan Coating</option>
              <option value="putih">Non MC / Putih</option>
              <option value="mc">Supersin / MC</option>
              <option value="blue">Blueray Proteksi</option>
              <option value="photo">Photocromic</option>
              <option value="bluecromic">Bluecromic</option>
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilter}
              disabled={!name && !type && !coating}
              className="btn btn-error btn-soft btn-sm rounded-xl"
            >
              <FilterX className="h-4 w-4" /> Bersihkan Filter
            </button>
          </div>
        </div>
      </div>

      {/* RESPONSIVE LAYOUT MATRIX SYSTEM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* PANEL UTAMA: DAFTAR KATALOG MODEL LENSA */}
        <div
          className={`bg-base-100 border border-base-300/60 rounded-2xl shadow-sm p-3 transition-all duration-300 ${showDetail ? "lg:col-span-5" : "lg:col-span-12"}`}
        >
          <div className="overflow-x-auto w-full">
            <table className="table table-sm w-full table-fixed">
              <thead>
                <tr className="border-b border-base-200 text-base-content/50 text-[11px] uppercase tracking-wider bg-base-200/40">
                  <th className="w-12 text-center py-2.5">#</th>
                  <th>Nama Master Kategori Lensa</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading ? (
                  data?.data.map((item, index) => (
                    <tr
                      key={index}
                      className={`cursor-pointer border-b border-base-200 transition-all ${productName === item.productName ? "bg-primary/10 font-bold text-primary" : "hover:bg-base-200/40"}`}
                      onClick={() => handleProductClick(item.productName)}
                    >
                      <td className="text-center font-mono text-xs text-base-content/40 py-3">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="text-xs truncate">{item.productName}</td>
                    </tr>
                  ))
                ) : (
                  <LoadingTable row="10" colspan="2" />
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && data && (
            <div className="flex justify-center items-center gap-2 mt-4 pt-2 border-t border-base-200">
              <div className="join">
                <button
                  className="join-item btn btn-xs px-2.5 bg-base-100"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  «
                </button>
                <button className="join-item btn btn-xs bg-base-200 no-animation text-[11px]">
                  Hal {page} / {data.totalPages || 1}
                </button>
                <button
                  className="join-item btn btn-xs px-2.5 bg-base-100"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>

        {/* VIEW DESKTOP ONLY PANEL DETAIL KANAN (Akan tersembunyi jika di HP) */}
        {showDetail && (
          <div className="hidden lg:block lg:col-span-7 bg-base-100 border border-base-300/60 rounded-2xl shadow-sm p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-base-200">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-base-content/40 uppercase tracking-widest block">
                  Varian Ukuran
                </span>
                <h3 className="font-extrabold text-sm text-base-content tracking-tight">
                  {productName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDetail(false);
                  setProductName("");
                }}
                className="btn btn-ghost btn-xs rounded-lg bg-base-200/60 gap-1"
              >
                Tutup Detail
              </button>
            </div>
            {renderDetailContent()}
          </div>
        )}
      </div>

      {/* ========================================================== */}
      {/* DIALOG MODAL BOTTOM SHEET (KHUSUS TAMPILAN MOBILE/HP)      */}
      {/* ========================================================== */}
      <dialog
        id="mobile_stock_detail_modal"
        className="modal modal-bottom lg:modal-middle"
      >
        {/* 
          REVISI: 
          Mengunci tinggi modal secara fix di layar mobile menggunakan h-[80vh] max-h-[80vh].
          Jadi saat data loading ataupun saat data penuh, tinggi modal tetap kokoh tidak melar.
        */}
        <div className="modal-box p-0 rounded-t-2xl lg:rounded-2xl bg-base-100 border border-base-300/60 shadow-2xl overflow-hidden h-[80vh] max-h-[80vh] lg:h-auto lg:max-h-none flex flex-col">
          {/* Header Modal (Tetap terkunci di atas) */}
          <div className="bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-4 flex justify-between items-center border-b border-base-200 shrink-0">
            <div className="flex items-center gap-2">
              <PackageOpen className="h-4 w-4 text-primary" />
              <div>
                <h3 className="font-extrabold text-sm text-base-content tracking-tight">
                  {productName || "Detail Stok Lensa"}
                </h3>
                <p className="text-[9px] text-base-content/40 font-semibold uppercase tracking-wider">
                  Informasi Ketersediaan Varian
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseMobileModal}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body Modal Detail dengan Scroll Vertikal Internal */}
          <div className="p-4 overflow-y-auto grow [scrollbar-width:thin] bg-base-100">
            {productName && renderDetailContent()}
          </div>

          {/* Footer Modal Action (Tetap terkunci di bawah) */}
          <div className="modal-action m-0 p-3 bg-base-200/50 border-t border-base-200 shrink-0">
            <button
              onClick={handleCloseMobileModal}
              className="btn btn-sm btn-neutral rounded-xl font-bold w-full"
            >
              Tutup Berkas
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default Stock;
