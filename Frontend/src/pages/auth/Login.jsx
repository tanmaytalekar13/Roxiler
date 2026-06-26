import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { login, setAccessToken } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import Input from "../../components/Input";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);

    try {
      // ✅ FIXED: pass object directly
      const res = await login(data);

      const { accessToken, user } = res.data;

      setAccessToken(accessToken);
      setUser(user);

      // Redirect by role
      if (user.role === "ADMIN") navigate("/admin");
      else if (user.role === "OWNER") navigate("/owner");
      else navigate("/stores");
    } catch (e) {
      setServerError(
        e.response?.data?.message || "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Sign in</h2>
        <p className="text-sm text-slate-500 mt-0.5">Welcome back.</p>
      </div>

      {serverError && <Alert type="error" message={serverError} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          required
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email",
            },
          })}
        />

        <Input
          label="Password"
          type="password"
          required
          placeholder="Your password"
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
          })}
        />

        <Button type="submit" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>

      <p className="text-sm text-center text-slate-500">
        Don't have an account?{" "}
        <Link to="/signup" className="text-indigo-600 font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}