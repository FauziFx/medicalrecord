import { Save } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import api from "@/utils/api";
import useSWR from "swr";

export function EditOptic() {
  const [optic_name, setOpticName] = useState("");
  const navigate = useNavigate();
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const { id } = useParams();

  // Validasi
  if (!/^\d+$/.test(id)) {
    return <Navigate to="/optics" replace />;
  }

  const fetcher = async (url) => {
    try {
      const resPatient = await api.get(url);
      if (resPatient.data.success) {
        const response = await api.get("/optic/" + id);
        setOpticName(response.data.data.optic_name);
        return response.data.data;
      } else {
        navigate("/optics");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const { data, error, isLoading } = useSWR("/optic/" + id, fetcher, {
    revalidateOnFocus: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoadingSave(true);
      const response = await api.patch("/optic/" + id, {
        optic_name: optic_name,
      });

      if (response.data.success) {
        setIsLoadingSave(false);
        navigate("/optics");
      }
      setIsLoadingSave(false);
    } catch (error) {
      console.log(error);
    }
  };

  if (error) return <p>Error loading data.</p>;
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Edit Optic</h1>
      <div className="card p-4 bg-white shadow-md pb-8">
        <div className="flex flex-col justify-center items-center">
          <h1 className="mt-6 font-semibold text-xl">Edit Optic</h1>
          <form autoComplete="off" onSubmit={handleSubmit}>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Nama Optik</label>
              <input
                type="text"
                className="input input-sm w-full max-w-xs"
                value={!isLoading ? optic_name : ""}
                onChange={(e) => setOpticName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col">
              <div className="join w-full gap-1 mb-1">
                <Link
                  to="/optics"
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

export default EditOptic;
