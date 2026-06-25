import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

const onSubmit = async (data) => {
  try {
    setLoading(true);

    const user = await login(data);

    toast.success("Login successful");

    switch (user.role) {
      case "ADMIN":
        navigate("/admin/dashboard");
        break;

      case "OWNER":
        navigate("/owner/dashboard");
        break;

      case "USER":
        navigate("/stores");
        break;

      default:
        navigate("/");
    }
  } catch (error) {
    toast.error(
      error?.response?.data?.message || "Login failed."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">

        <h1 className="text-3xl font-bold text-center">
          Store Rating System
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Login to your account
        </p>

        <form
          className="mt-8 space-y-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Email */}

          <div>
            <label className="block mb-2 font-medium">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter email"
              className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
              {...register("email", {
                required: "Email is required",
              })}
            />

            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}

          <div>
            <label className="block mb-2 font-medium">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
              {...register("password", {
                required: "Password is required",
              })}
            />

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account?

          <Link
            to="/signup"
            className="ml-2 text-blue-600 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}