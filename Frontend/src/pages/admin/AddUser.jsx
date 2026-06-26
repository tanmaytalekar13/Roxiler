import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { adminCreateUser } from "../../services/api";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Select from "../../components/Select";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

const ROLE_OPTIONS = [
  { value: "USER", label: "Normal User" },
  { value: "ADMIN", label: "Administrator" },
  { value: "OWNER", label: "Store Owner" },
];

export default function AddUser() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { role: "USER" } });

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);
    try {
      await adminCreateUser(data);
      navigate("/admin/users");
    } catch (e) {
      setServerError(e.response?.data?.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/users")}
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Add user</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        {serverError && <Alert type="error" message={serverError} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
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
            placeholder="user@example.com"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
            })}
          />

          <Input
            label="Address"
            required
            placeholder="Full address (max 400 chars)"
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
            hint="8–16 characters · one uppercase · one special character"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              pattern: {
                value: PASSWORD_REGEX,
                message: "8–16 chars, at least one uppercase and one special character",
              },
            })}
          />

          <Select
            label="Role"
            required
            options={ROLE_OPTIONS}
            error={errors.role?.message}
            {...register("role", { required: "Role is required" })}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">
              Create user
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/admin/users")}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}