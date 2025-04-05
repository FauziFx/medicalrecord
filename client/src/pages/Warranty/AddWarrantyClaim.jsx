import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "@/utils/api";
import useSWR from "swr";
import { LoadingTable } from "@/components";
import { Save } from "lucide-react";
import dayjs from "dayjs";

export function AddWarrantyClaim() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [claimDate, setClaimDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [warrantyType, setWarrantyType] = useState("");
  const [damage, setDamage] = useState("");
  const [repair, setRepair] = useState("");

  useEffect(() => {
    if (!location.state || !location.state.warrantyId) {
      navigate("/warranty");
    }
  }, [navigate, location]);

  const warrantyId = location.state?.warrantyId;
  const prevPage = location.state?.prevPage;

  const fetcher = async (url) => {
    try {
      const response = await api.get(url);

      return response.data.data;
    } catch (error) {
      console.log(error);
    }
  };

  const { data, error, isLoading } = useSWR(
    `/warranty/${warrantyId}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoadingSave(true);
      const response = await api.post("/warranty/claim", {
        warrantyId: warrantyId,
        warranty_type: warrantyType,
        damage: damage,
        repair: repair,
        claim_date: claimDate,
      });

      if (response.data.success) {
        setIsLoadingSave(false);
        navigate("/warranty/warranty-claim");
      }
      setIsLoadingSave(false);
    } catch (error) {
      console.log(error);
    }
  };

  if (error) return <p>Error loading data.</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Add Warranty Claim</h1>
      <div className="card p-4 bg-white shadow-md pb-8">
        <div className="flex flex-col justify-center items-center">
          <h1 className="mt-6 mb-4 font-semibold text-xl">Warranty Claim</h1>
          <div className="card-body">
            <table className="table table-xs md:table-sm max-w-md rounded-box border border-base-content/5 bg-base-100">
              <tbody>
                {isLoading ? (
                  <LoadingTable row="8" colspan="3" />
                ) : data ? (
                  <>
                    <tr>
                      <th width="1%">Nama</th>
                      <td width="1%">:</td>
                      <th className="uppercase">{data.name}</th>
                    </tr>
                    <tr>
                      <th>Optik</th>
                      <td>:</td>
                      <td>{data.optic.optic_name}</td>
                    </tr>
                    <tr>
                      <th>Frame</th>
                      <td>:</td>
                      <td>{data.frame}</td>
                    </tr>
                    <tr>
                      <th>Lensa</th>
                      <td>:</td>
                      <td>{data.lens}</td>
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
              <label className="text-xs font-semibold">Tanggal</label>
              <input
                type="date"
                className="input input-sm w-full max-w-xs"
                value={claimDate}
                onChange={(e) => setClaimDate(e.target.value)}
                required
              />
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Jenis Garansi</label>
              <select
                className="select select-sm w-full max-w-xs"
                required
                value={warrantyType}
                onChange={(e) => setWarrantyType(e.target.value)}
              >
                <option disabled value="">
                  -- Jenis Garansi --
                </option>
                <option value="Servis Frame">Servis Frame</option>
                <option value="Ganti Frame">Ganti Frame</option>
                <option value="Servis Lensa">Servis Lensa</option>
                <option value="Ganti Lensa">Ganti Lensa</option>
              </select>
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Kerusakan</label>
              <textarea
                className="textarea textarea-sm w-full max-w-xs"
                placeholder="Kerusakan"
                value={damage}
                onChange={(e) => setDamage(e.target.value)}
              ></textarea>
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Perbaikan</label>
              <textarea
                className="textarea textarea-sm w-full max-w-xs"
                placeholder="Perbaikan"
                value={repair}
                onChange={(e) => setRepair(e.target.value)}
              ></textarea>
            </div>
            <div className="flex">
              <div className="join gap-1 w-full">
                <Link
                  to={prevPage}
                  type="button"
                  className="btn btn-sm join-item w-1/2 btn-soft"
                  disabled={isLoadingSave}
                >
                  « Back
                </Link>
                <button
                  type="submit"
                  className="btn btn-sm join-item w-1/2 btn-primary"
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

export default AddWarrantyClaim;
