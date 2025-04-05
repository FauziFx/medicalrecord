import React from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Save } from "lucide-react";
import api from "@/utils/api";
import Swal from "sweetalert2";

export function Profile() {
  const [isLoadingSave, setIsLoadingSave] = React.useState(false);
  const token = Cookies.get("token");
  const decode = jwtDecode(token);
  const [user, setUser] = React.useState({
    id: decode.id,
    name: Cookies.get("user") ? Cookies.get("user") : decode.name,
    email: decode.email,
    role: decode.role,
    status: decode.status,
    opticId: decode.opticId,
  });

  const [formData, setFormData] = React.useState({
    name: user.name,
    email: user.email,
    password: "",
    confirmPassword: "",
  });

  const [isMatch, setIsMatch] = React.useState(true);
  const [isPasswordValid, setIsPasswordValid] = React.useState(true);

  const handleChange = (e) => {
    // setFormData({ ...formData, [e.target.name]: e.target.value });
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };

    if (name === "password") {
      setIsPasswordValid(value.length >= 5);
    }

    setFormData(updatedFormData);
    if (name === "password" || name === "confirmPassword") {
      setIsMatch(updatedFormData.password === updatedFormData.confirmPassword);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!isPasswordValid) {
        alert("Password must be at least 5 characters.");
        return;
      }
      if (!isMatch) {
        alert("Passwords do not match.");
        return;
      }

      setIsLoadingSave(true);
      const data = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: user.role,
        status: user.status,
        opticId: user.opticId,
      };

      const response = await api.patch("/user/" + user.id, data);

      if (response.data.success) {
        setIsLoadingSave(false);
        setFormData({
          name: formData.name,
          email: user.email,
          password: "",
          confirmPassword: "",
        });
        Cookies.set("user", formData.name, { expires: 90 });
        Swal.fire(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Profile</h1>
      <div className="card p-4 bg-white shadow-md pb-8">
        <div className="flex flex-col justify-center items-center">
          <h1 className="mt-6 font-semibold text-xl">Edit Profil</h1>
          <form autoComplete="off" onSubmit={handleSubmit}>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Email</label>
              <input
                type="text"
                placeholder="mail@site.com"
                className="input input-sm w-full max-w-xs"
                value={formData.email}
                readOnly
              />
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                placeholder="Masukkan nama"
                className="input input-sm w-full max-w-xs"
                value={formData.name}
                onChange={(e) => handleChange(e)}
                required
              />
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">Password Baru</label>
              <input
                type="password"
                name="password"
                placeholder="Password baru"
                className={`input input-sm w-full max-w-xs focus:outline-0 focus:border-0 focus:ring ${
                  isPasswordValid
                    ? " focus:ring-green-500 "
                    : " focus:ring-red-500 "
                }`}
                value={formData.password}
                onChange={(e) => handleChange(e)}
                required
              />
              {!isPasswordValid && (
                <p className="text-red-500 text-xs mt-2">
                  Password must be at least 5 characters.
                </p>
              )}
            </div>
            <div className="w-full max-w-xs mb-2">
              <label className="text-xs font-semibold">
                Konfirmasi Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="konfirmasi Password"
                className={`input input-sm w-full max-w-xs focus:outline-0 focus:border-0 focus:ring ${
                  isMatch ? " focus:ring-green-500 " : " focus:ring-red-500 "
                }`}
                value={formData.confirmPassword}
                onChange={(e) => handleChange(e)}
                required
              />
              {!isMatch && (
                <p className="text-red-500 text-xs mt-2">
                  Passwords do not match.
                </p>
              )}
            </div>
            <button
              type="submit"
              name="save"
              className="btn btn-sm join-item btn-primary w-full mt-4"
              //   disabled={isLoadingSave}
            >
              <Save className="h-4" /> Save
              {/* {isLoadingSave ? (
                <span className="loading loading-sm loading-spinner"></span>
              ) : (
                <>
                  <Save className="h-4" /> Save
                </>
              )} */}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
