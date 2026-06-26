import { useState } from "react";
import { useForm } from "react-hook-form";
import { changePassword } from "../../services/api";
import Alert from "../../components/Alert";
import Button from "../../components/Button";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

export default function ChangePassword() {
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch("newPassword");

  const onSubmit = async (data) => {
    setServerError("");
    setSuccess(false);
    setLoading(true);
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      reset();
    } catch (e) {
      setServerError(
        e.response?.data?.message || "Failed to update password. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Change Password</h1>
        <p className="text-sm text-slate-500 mt-1">
          Update your account password below.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        {success && (
          <Alert type="success" message="Password updated successfully." />
        )}
        {serverError && <Alert type="error" message={serverError} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Current password
            </label>
            <input
              type="password"
              {...register("currentPassword", {
                required: "Current password is required",
              })}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-colors ${
                errors.currentPassword
                  ? "border-red-400 focus:ring-red-300"
                  : "border-slate-200 focus:ring-indigo-400"
              }`}
              placeholder="Enter current password"
            />
            {errors.currentPassword && (
              <p className="text-xs text-red-500">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              type="password"
              {...register("newPassword", {
                required: "New password is required",
                pattern: {
                  value: PASSWORD_REGEX,
                  message:
                    "8–16 characters, at least one uppercase letter and one special character.",
                },
              })}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-colors ${
                errors.newPassword
                  ? "border-red-400 focus:ring-red-300"
                  : "border-slate-200 focus:ring-indigo-400"
              }`}
              placeholder="Enter new password"
            />
            {errors.newPassword ? (
              <p className="text-xs text-red-500">
                {errors.newPassword.message}
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                8–16 characters · one uppercase · one special character (!@#$%…)
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Confirm new password
            </label>
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Please confirm your new password",
                validate: (val) =>
                  val === newPassword || "Passwords do not match",
              })}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-colors ${
                errors.confirmPassword
                  ? "border-red-400 focus:ring-red-300"
                  : "border-slate-200 focus:ring-indigo-400"
              }`}
              placeholder="Re-enter new password"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
