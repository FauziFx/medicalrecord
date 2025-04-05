import React from "react";
import api from "@/utils/api";
import useSWR, { useSWRConfig } from "swr";
import { LoadingTable } from "@/components";
import { Link } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

export function Users() {
  const idLoggedIn = jwtDecode(Cookies.get("token")).id;
  const { mutate } = useSWRConfig();
  const fetcher = async (url) => {
    try {
      const response = await api.get("/user");

      return response.data;
    } catch (error) {
      console.log(error);
    }
  };
  const { data, error, isLoading } = useSWR("/users", fetcher);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      await api.patch(`/user/status/${id}`, { status: newStatus });
      mutate("/users");
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
        deleteUser(id);
      }
    });
  };

  const deleteUser = async (id) => {
    try {
      const response = await api.delete(`/user/${id}`);

      if (response.data.success) {
        mutate("/users");
        Swal.fire(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (error) return <p>Error loading data.</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Users</h1>
      <div className="card bg-white shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-2 md:items-center justify-between">
          <Link
            to="/users/add-user"
            className="btn btn-primary btn-sm w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> Add User
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto card bg-white shadow-md mt-4 p-2 pb-6">
        <table className="table table-xs w-full min-w-[380px] table-auto">
          {/* Head */}
          <thead>
            <tr>
              {["#", "Name", "Role", "Optic", "Status", "Action"].map((el) => (
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
              data.data.map(
                ({ id, name, email, role, optic, status }, index) => (
                  <tr key={index}>
                    <td className="border-b border-gray-200">{index + 1}</td>
                    <td className="border-b border-gray-200">
                      <p className="text-xs font-semibold">{name}</p>
                      <p className="text-xs text-gray-500 font-light">
                        {email}
                      </p>
                    </td>
                    <td className="border-b border-gray-200 capitalize">
                      {role}
                    </td>
                    <td className="border-b border-gray-200">
                      <p className="text-xs font-semibold">
                        {optic ? optic.optic_name : ""}
                      </p>
                    </td>
                    <td className="border-b border-gray-200">
                      {idLoggedIn !== id && (
                        <label className="fieldset-label">
                          <input
                            type="checkbox"
                            checked={status ? true : false}
                            className="toggle toggle-xs toggle-primary"
                            onChange={() => toggleStatus(id, status)}
                          />
                          {status ? "Active" : "Inactive"}
                        </label>
                      )}
                    </td>
                    <td className="w-28 flex justify-end">
                      {idLoggedIn !== id && (
                        <>
                          <Link
                            to={`/users/edit-user/${id}`}
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
                        </>
                      )}
                    </td>
                  </tr>
                )
              )
            ) : (
              <LoadingTable row="10" colspan="7" />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
