import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { adminCreateStore, adminGetUsers } from "../../services/api";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Select from "../../components/Select";

export default function AddStore() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Load all OWNER users for the dropdown
  useEffect(() => {
    (async () => {
      try {
        const res = await adminGetUsers({ role: "OWNER", limit: 100 });
        setOwners(res.data.data.users || []);
      } catch {
        // non-fatal; user can still type ownerId manually
      }
    })();
  }, []);

  const ownerOptions = owners.map((o) => ({
    value: String(o.id),
    label: `${o.name} (${o.email})`,
  }));

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);
    try {
      await adminCreateStore({ ...data, ownerId: Number(data.ownerId) });
      navigate("/admin/stores");
    } catch (e) {
      setServerError(e.response?.data?.message || "Failed to create store.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/stores")}
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Add store</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        {serverError && <Alert type="error" message={serverError} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          <Input
            label="Store name"
            required
            placeholder="Min 20 characters"
            error={errors.name?.message}
            {...register("name", {
              required: "Store name is required",
              minLength: { value: 20, message: "Name must be at least 20 characters" },
              maxLength: { value: 60, message: "Name must be at most 60 characters" },
            })}
          />

          <Input
            label="Email"
            type="email"
            required
            placeholder="store@example.com"
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

          <Select
            label="Store owner"
            required
            placeholder="Select an owner…"
            options={ownerOptions}
            error={errors.ownerId?.message}
            {...register("ownerId", { required: "Please select a store owner" })}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">
              Create store
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/admin/stores")}
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