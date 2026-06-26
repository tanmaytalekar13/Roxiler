import { ROLE_LABELS } from "../constants";

export const formatRole = (role) => ROLE_LABELS[role] ?? role;

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/** Extract a user-friendly message from an Axios error */
export const extractError = (err) =>
  err?.response?.data?.message ||
  err?.message ||
  "An unexpected error occurred.";

/** Extract field-level Zod errors from the backend */
export const extractFieldErrors = (err) =>
  err?.response?.data?.errors ?? null;