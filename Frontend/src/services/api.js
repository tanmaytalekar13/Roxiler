import axios from "axios";

// ======================================================
// Axios Instance
// ======================================================

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ======================================================
// DEBUG GUARD (IMPORTANT FIX)
// Catches: api.post("/url", 1) ❌
// ======================================================

api.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();

  if (["post", "put", "patch"].includes(method)) {
    const data = config.data;

    const isInvalidPrimitive =
      data !== undefined &&
      (typeof data === "string" || typeof data === "number" || typeof data === "boolean");

    if (isInvalidPrimitive) {
      console.error(
        "❌ INVALID REQUEST BODY DETECTED:",
        data,
        "\n👉 You must send an object like { key: value }"
      );
    }
  }

  return config;
});

// ======================================================
// Access Token Memory Store
// ======================================================

let accessToken = null;
let isRefreshing = false;
let refreshSubscribers = [];

// ======================================================
// Token Helpers
// ======================================================

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

// ======================================================
// Queue Helpers
// ======================================================

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// ======================================================
// Request Interceptor (AUTH HEADER)
// ======================================================

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ======================================================
// Response Interceptor (AUTO REFRESH)
// ======================================================

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) return Promise.reject(error);

    const isAuthRoute =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await api.post("/auth/refresh");

        const newToken = data?.data?.accessToken;
        if (!newToken) throw new Error("No access token from refresh");

        setAccessToken(newToken);
        onTokenRefreshed(newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (err) {
        clearAccessToken();
        refreshSubscribers = [];
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ======================================================
// AUTH APIs
// ======================================================

export const signup = (data) => api.post("/auth/signup", data);

export const login = async (data) => {
  const { data: res } = await api.post("/auth/login", data);
  return res;
};

export const logout = () => api.post("/auth/logout");
export const refreshToken = () => api.post("/auth/refresh");
export const getMe = () => api.get("/auth/me");

export const changePassword = (data) =>
  api.put("/auth/change-password", data);

// ======================================================
// AUTH WRAPPER
// ======================================================

export const authApi = {
  signup,
  login,
  logout,
  refresh: refreshToken,
  me: getMe,
  changePassword,
};

// ======================================================
// ADMIN APIs
// ======================================================

export const adminCreateUser = (data) => api.post("/admin/users", data);
export const adminAddUser = adminCreateUser;

export const adminGetUsers = (params) =>
  api.get("/admin/users", { params });

export const adminGetUser = (id) =>
  api.get(`/admin/users/${id}`);

export const adminUpdateUser = (id, data) =>
  api.put(`/admin/users/${id}`, data);

export const adminDeleteUser = (id) =>
  api.delete(`/admin/users/${id}`);

export const getAdminDashboard = () =>
  api.get("/admin/dashboard");

export const adminGetStores = (params) =>
  api.get("/admin/stores", { params });

export const adminGetStore = (id) =>
  api.get(`/admin/stores/${id}`);

export const adminCreateStore = (data) =>
  api.post("/admin/stores", data);

export const adminUpdateStore = (id, data) =>
  api.put(`/admin/stores/${id}`, data);

export const adminDeleteStore = (id) =>
  api.delete(`/admin/stores/${id}`);

export const adminApi = {
  getDashboard: getAdminDashboard,
  getUsers: adminGetUsers,
  getUser: adminGetUser,
  createUser: adminCreateUser,
  updateUser: adminUpdateUser,
  deleteUser: adminDeleteUser,
  getStores: adminGetStores,
  getStore: adminGetStore,
  createStore: adminCreateStore,
  updateStore: adminUpdateStore,
  deleteStore: adminDeleteStore,
};

// ======================================================
// STORE APIs
// ======================================================

export const getStores = (params) =>
  api.get("/stores", { params });

export const getStore = (id) =>
  api.get(`/stores/${id}`);

export const storeApi = {
  getStores,
  getStore,
};

// ======================================================
// RATING APIs
// ======================================================

export const submitRating = (data) => api.post("/ratings", data);
export const updateRating = (id, data) => {
  if (!id) {
    console.error("Rating ID is missing:", id);
    return;
  }

  return api.put(`/ratings/${id}`, data);
};

export const deleteRating = (id) =>
  api.delete(`/ratings/${id}`);

export const getRatings = (params) =>
  api.get("/ratings", { params });

export const ratingApi = {
  submit: submitRating,
  update: updateRating,
  delete: deleteRating,
  getAll: getRatings,
};

// ======================================================
// OWNER APIs
// ======================================================

export const getOwnerDashboard = () =>
  api.get("/owner/dashboard");

export const ownerApi = {
  getDashboard: getOwnerDashboard,
};

// ======================================================
// DEFAULT EXPORT
// ======================================================

export default api;