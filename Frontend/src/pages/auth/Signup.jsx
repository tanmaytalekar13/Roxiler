import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { signup } from "../../services/api";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import Input from "../../components/Input";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

export default function Signup() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
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
      await signup(data);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (e) {
      setServerError(e.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-3 py-4">
        <p className="text-3xl">🎉</p>
        <h2 className="text-base font-semibold text-slate-800">Account created!</h2>
        <p className="text-sm text-slate-500">Redirecting you to login…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Create an account</h2>
        <p className="text-sm text-slate-500 mt-0.5">Join the platform to rate stores.</p>
      </div>

      {serverError && <Alert type="error" message={serverError} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full name"
          required
          placeholder="Min 20 characters"
          error={errors.name?.message}
          {...register("name", {
            required: "Name is required",
            minLength: { value: 20, message: "Name must be at least 20 characters" },
            maxLength: { value: 60, message: "Name must be at most 60 characters" },
          })}
        />

        <Input
          label="Email"
          type="email"
          required
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
          })}
        />

        <Input
          label="Address"
          required
          placeholder="Your address (max 400 chars)"
          error={errors.address?.message}
          {...register("address", {
            required: "Address is required",
            maxLength: { value: 400, message: "Address must be at most 400 characters" },
          })}
        />

        <Input
          label="Password"
          type="password"
          required
          hint="8–16 characters · one uppercase · one special character (!@#$%…)"
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
            pattern: {
              value: PASSWORD_REGEX,
              message: "8–16 chars, at least one uppercase and one special character",
            },
          })}
        />

        <Button type="submit" loading={loading} className="w-full">
          Create account
        </Button>
      </form>

      <p className="text-sm text-center text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}