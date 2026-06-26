export const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
  OWNER: "OWNER",
};

export const ROLE_LABELS = {
  ADMIN: "Administrator",
  USER: "Normal User",
  OWNER: "Store Owner",
};

export const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

export const PASSWORD_HINT =
  "8–16 characters with at least one uppercase letter and one special character.";

export const DEFAULT_PAGE_SIZE = 10;