// src/hooks/useApi.js

import { useState, useCallback } from "react";

export default function useApi(apiFunction) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFunction(...args);

        return response.data;
      } catch (err) {
        setError(
          err?.response?.data?.message ||
          err.message ||
          "Something went wrong"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return {
    loading,
    error,
    execute,
  };
}