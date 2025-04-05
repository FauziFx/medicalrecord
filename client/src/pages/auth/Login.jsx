import React, { useState } from "react";
import { Footer } from "@/components";
import { KeyRound, Mail } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

export function Login() {
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(API_URL + "/login", {
        email: email,
        password: password,
      });

      const data = response.data;

      if (response.data.success) {
        const { token } = data.data;
        Cookies.set("token", token, { expires: 89 });
        window.location.href = "/dashboard";
      } else {
        setLoading(false);
        setErr(data.message);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };
  return (
    <>
      <div className="flex items-center justify-center min-h-[calc(100vh-68px)] bg-gray-100 px-4">
        <div className="card w-96 bg-white shadow-xl">
          <div className="card-body">
            <div className="card-title flex flex-col justify-center mb-2">
              <h1 className="text-2xl font-bold">Login</h1>
              <p className="text-base-content font-light text-sm">
                Enter your Email and Password
              </p>
              {err && <p className="text-xs text-red-500">{err}</p>}
            </div>
            <form onSubmit={handleSubmit} autoComplete="off">
              <fieldset className="fieldset mb-2">
                <legend className="fieldset-legend pb-1">Email</legend>
                <label className="input validator">
                  <Mail className="h-3 w-3" />
                  <input
                    type="email"
                    placeholder="mail@site.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
                <div className="validator-hint hidden">
                  Enter valid email address
                </div>
              </fieldset>
              <fieldset className="fieldset mb-2">
                <legend className="fieldset-legend pb-1">Password</legend>
                <label className="input validator">
                  <KeyRound className="h-3 w-3" />
                  <input
                    type="password"
                    placeholder="Password"
                    minLength="5"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </label>
              </fieldset>
              <div className="form-control mt-4">
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "Login"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Login;
