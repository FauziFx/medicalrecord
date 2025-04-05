import { Save } from "lucide-react";
import React, { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import api from "@/utils/api";

export function EditUser() {
  const navigate = useNavigate();
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [opticId, setOpticId] = useState("");
  const { id } = useParams();

  // Validasi
  if (!/^\d+$/.test(id)) {
    return <Navigate to="/users" replace />;
  }

  const fetcher = async (url) => {
    try {
      const resUser = await api.get(url);
      const resOptic = await api.get("/optic?status=active");

      setName(resUser.data.data.name);
      setEmail(resUser.data.data.email);
      setRole(resUser.data.data.role);
      setOpticId(resUser.data.data.opticId || "");

      return resOptic.data.data;
    } catch (error) {
      console.log(error);
    }
  };

  const { data, error, isLoading } = useSWR(`/user/${id}`, fetcher, {
    revalidateOnFocus: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoadingSave(true);
      const response = await api.patch("/user/" + id, {
        name: name,
        email: email,
        password: password,
        role: role,
        opticId: opticId || null,
      });

      if (response.data.success) {
        setIsLoadingSave(false);
        navigate("/users");
      }
      setIsLoadingSave(false);
    } catch (error) {
      console.log(error);
    }
  };

  if (error) return <p>Error loading data.</p>;
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Edit User</h1>
      <div className="card p-4 bg-white shadow-md pb-8">
        <div className="flex flex-col justify-center items-center">
          <h1 className="mt-6 font-semibold text-xl">Edit User</h1>
          <form autoComplete="off" onSubmit={handleSubmit}>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Nama</label>
              <input
                type="text"
                className="input input-sm w-full max-w-xs"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Nama"
              />
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Email</label>
              <input
                type="email"
                className="input input-sm w-full max-w-xs"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@site.com"
              />
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Password</label>
              <input
                type="password"
                className="input input-sm w-full max-w-xs"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="*****"
              />
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="select select-sm shadow w-full md:1/5"
              >
                <option value="admin">Admin</option>
                <option value="lab">Admin Lab</option>
                <option value="user">User</option>
              </select>
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Optik</label>
              <select
                value={opticId}
                onChange={(e) => setOpticId(e.target.value)}
                className="select select-sm shadow w-full md:1/5"
              >
                <option value="">All Store</option>
                {!isLoading &&
                  data.map((item, index) => (
                    <option key={index} value={item.id}>
                      {item.optic_name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex flex-col">
              <div className="join w-full gap-1 mb-1">
                <Link
                  to="/users"
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

export default EditUser;
