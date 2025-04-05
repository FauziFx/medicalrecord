import React from "react";
import api from "@/utils/api";
import useSWR, { useSWRConfig } from "swr";
import { LoadingTable } from "@/components";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

export function Optic() {
  const { mutate } = useSWRConfig();
  const fetcher = async (url) => {
    try {
      const response = await api.get("/optic");

      return response.data;
    } catch (error) {
      console.log(error);
    }
  };
  const {
    data: dataOptic,
    error: errorOptic,
    isLoading: isLoadingOptic,
  } = useSWR("/optics", fetcher);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      await api.patch(`/optic/${id}`, { status: newStatus });
      mutate("/optics");
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Permanently Deleted?",
      showDenyButton: true,
      showCancelButton: true,
      showConfirmButton: false,
      denyButtonText: `Yes, Deleted`,
    }).then((result) => {
      // Confirm Delete
      if (result.isDenied) {
        deleteOptic(id);
      }
    });
  };

  const deleteOptic = async (id) => {
    try {
      const response = await api.delete(`/optic/${id}`);

      mutate("/optics");
      Swal.fire(response.data.message);
    } catch (error) {
      console.log(error);
    }
  };

  if (errorOptic) return <p>Error loading data.</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Optics</h1>
      <div className="card bg-white shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-2 md:items-center justify-between">
          <Link
            to="/optics/add-optic"
            className="btn btn-primary btn-sm w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Optic
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto card bg-white shadow-md mt-4 p-2 pb-6">
        <table className="table table-xs w-full min-w-[380px] table-auto">
          {/* Head */}
          <thead>
            <tr>
              {["#", "Name", "Status", "Action"].map((el) => (
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
            {!isLoadingOptic ? (
              dataOptic.data.map(({ id, optic_name, status }, index) => (
                <tr key={index}>
                  <td className="border-b border-gray-200">{index + 1}</td>
                  <td className="border-b border-gray-200">{optic_name}</td>
                  <td className="border-b border-gray-200">
                    <label className="fieldset-label">
                      <input
                        type="checkbox"
                        checked={status ? true : false}
                        className="toggle toggle-xs toggle-primary"
                        onChange={() => toggleStatus(id, status)}
                      />
                      {status ? "Active" : "Inactive"}
                    </label>
                  </td>
                  <td className="w-28 flex justify-end">
                    <Link
                      to={`/optics/edit-optic/${id}`}
                      className="btn btn-xs btn-ghost btn-circle text-success tooltip mr-2"
                      data-tip="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      className="btn btn-xs btn-ghost btn-circle text-error tooltip"
                      data-tip="Delete"
                      onClick={() => handleDelete(id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <LoadingTable row="10" colspan="7" />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Optic;
