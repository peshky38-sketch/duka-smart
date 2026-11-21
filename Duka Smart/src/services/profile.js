// Profile calls for the FastAPI backend (these endpoints are new, see README note)
import { request } from "./api";

export const profileApi = {
  // Only the fields that were passed are sent, so a photo-only change sends just `avatar`
  update: (c) =>
    request("/api/auth/me", {
      method: "PATCH",
      body: { name: c.name, business_name: c.shop, phone: c.phone, location: c.location, avatar: c.avatar },
    }),
  changePassword: (current, next) =>
    request("/api/auth/change-password", {
      method: "POST",
      body: { current_password: current, new_password: next },
    }),
};
