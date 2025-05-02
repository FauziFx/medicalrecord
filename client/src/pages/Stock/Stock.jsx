import React, { useState } from "react";
import api from "@/utils/api";
import useSWR, { useSWRConfig } from "swr";
import { LoadingTable } from "@/components";
import { Link } from "react-router-dom";
import { FilterX, Pencil, Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

export function Stock() {
  const [type, setType] = useState("");
  const [coating, setCoating] = useState("");

  const [name, setName] = useState("");
  const [variantName, setVariantName] = useState("");
  const [productName, setProductName] = useState("");
  const [page, setPage] = useState(1);
  const [pageDetail, setPageDetail] = useState(1);
  const limit = 15; // Default limit 15
  const { mutate } = useSWRConfig();
  const [showDetail, setShowDetail] = useState(false);

  const query = new URLSearchParams({ page, limit });
  if (name) query.append("name", name);
  if (type) query.append("type", type);
  if (coating) query.append("coating", coating);

  const queryDetail = new URLSearchParams({
    page: pageDetail,
    limit,
    productName,
  });
  if (variantName) queryDetail.append("name", variantName);

  const fetcher = async (url) => {
    try {
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };
  const { data, error, isLoading } = useSWR(
    `/stock/lens?${query.toString()}`,
    fetcher
  );

  const {
    data: dataDetail,
    error: errorDetail,
    isLoading: isLoadingDetail,
  } = useSWR(`/stock/lens/detail?${queryDetail.toString()}`, fetcher);

  if (error || errorDetail) return <p>Error loading data.</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Stock Lens</h1>
      <div className="card bg-white shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <input
            type="search"
            placeholder="Search by product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`input input-sm shadow w-full md:w-1/4 ${
              showDetail ? "hidden" : ""
            }`}
          />
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              if (e.target.value == "") {
                setCoating("");
              }
            }}
            className={`select select-sm shadow w-full md:w-1/4 ${
              showDetail ? "hidden" : ""
            }`}
          >
            <option value="">All Type</option>
            <option value="sv">Single Vision</option>
            <option value="kt">Bifocal</option>
            <option value="prog">Progressive</option>
          </select>

          <select
            value={coating}
            onChange={(e) => setCoating(e.target.value)}
            className={`select select-sm shadow w-full md:w-1/4 ${
              showDetail ? "hidden" : ""
            }`}
            disabled={type === ""}
          >
            <option value="">All Coating</option>
            <option value="putih">Non MC</option>
            <option value="mc">MC</option>
            <option value="blue">Blueray</option>
            <option value="photo">Photocromic</option>
            <option value="bluecromic">Bluecromic</option>
          </select>

          <button
            className={`btn btn-sm btn-error w-full md:w-1/4 ${
              showDetail ? "hidden" : type == "" ? "hidden" : ""
            }`}
            onClick={() => {
              setType("");
              setCoating("");
            }}
          >
            <FilterX className="h-4 w-4" /> Reset Filter
          </button>

          <input
            type="search"
            placeholder="Search by power"
            value={variantName}
            onChange={(e) => setVariantName(e.target.value)}
            className={`input input-sm shadow w-full md:w-1/3 ${
              showDetail ? "" : "hidden"
            }`}
          />
        </div>
      </div>
      <div id="productName" className={showDetail ? "hidden" : ""}>
        <div className="overflow-x-auto card bg-white shadow-md mt-4 p-2 pb-6">
          <table className="table table-sm w-full min-w-[380px] table-auto">
            {/* Head */}
            <thead>
              <tr>
                {["#", "Product Name"].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-2 text-left"
                  >
                    <p
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            {/* Body */}
            <tbody>
              {!isLoading ? (
                data.data.map(({ productName }, index) => (
                  <tr
                    key={index}
                    className="cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      setShowDetail(true);
                      setProductName(productName);
                    }}
                  >
                    <td className="border-b border-gray-200" width="1%">
                      {index + 1}
                    </td>
                    <td className="border-b border-gray-200">{productName}</td>
                  </tr>
                ))
              ) : (
                <LoadingTable row="10" colspan="7" />
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col justify-center items-center mt-4">
          <div className="join">
            <button
              className="join-item btn btn-sm bg-white"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              « Prev
            </button>
            <button className="join-item btn btn-sm bg-white font-normal">
              Page {page} of {!isLoading && data.totalPages}
            </button>
            <button
              className="join-item btn btn-sm bg-white"
              disabled={page >= (!isLoading && data.totalPages)}
              onClick={() => setPage(page + 1)}
            >
              Next »
            </button>
          </div>
          <div className="text-xs mt-4">
            Total Data: {!isLoading && data.totalData}
          </div>
        </div>
      </div>

      <div id="productDetail" className={showDetail ? "" : "hidden"}>
        <div className="overflow-x-auto card bg-white shadow-md mt-4 p-2 pb-6">
          <button
            className="btn btn-xs btn-primary w-fit m-2"
            onClick={() => setShowDetail(false)}
          >
            « Back
          </button>
          <h1 className="p-2 font-semibold">{productName}</h1>
          <table className="table table-sm w-full min-w-[380px] table-auto">
            {/* Head */}
            <thead>
              <tr>
                {["Product Name", "Power", "Stock"].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-2 text-left"
                  >
                    <p
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            {/* Body */}
            <tbody>
              {!isLoadingDetail ? (
                dataDetail.data.map(({ productName, name, stock }, index) => (
                  <tr
                    key={index}
                    className={`cursor-pointer hover:bg-gray-200 ${
                      stock <= 0
                        ? "bg-red-100"
                        : stock == 1
                        ? "bg-yellow-100"
                        : ""
                    }`}
                    onClick={() => setShowDetail(true)}
                  >
                    <td className="border-b border-gray-200">{productName}</td>
                    <td className="border-b border-gray-200">{name}</td>
                    <td className="border-b border-gray-200">{stock}</td>
                  </tr>
                ))
              ) : (
                <LoadingTable row="10" colspan="7" />
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col justify-center items-center mt-4">
          <div className="join">
            <button
              className="join-item btn btn-sm bg-white"
              disabled={pageDetail <= 1}
              onClick={() => setPageDetail(pageDetail - 1)}
            >
              « Prev
            </button>
            <button className="join-item btn btn-sm bg-white font-normal">
              Page {pageDetail} of {!isLoadingDetail && dataDetail.totalPages}
            </button>
            <button
              className="join-item btn btn-sm bg-white"
              disabled={
                pageDetail >= (!isLoadingDetail && dataDetail.totalPages)
              }
              onClick={() => setPageDetail(pageDetail + 1)}
            >
              Next »
            </button>
          </div>
          <div className="text-xs mt-4">
            Total Data: {!isLoadingDetail && dataDetail.totalData}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stock;
