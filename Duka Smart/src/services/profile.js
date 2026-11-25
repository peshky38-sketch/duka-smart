// Profile edits. The backend already has GET /api/profile. It needs PATCH on the same address
// and a change-password route (see docs/TEAM-AGREEMENT.md). Until they exist:
//  - profile edits (name, shop, phone, town, photo) are kept on this device only
//  - changing the password shows a clear message
// When the backend adds the routes they are used automatically.
import { request } from "./api";

const missing = (e) => e.status === 404 || e.status === 405;

export const profileApi = {
  update: async (c) => {
    try {
      await request("/api/profile", {
        method: "PATCH",
        body: { username: c.name, business_name: c.shop, phone_number: c.phone, business_address: c.location, avatar: c.avatar },
      });
    } catch (e) {
      if (!missing(e)) throw e; // route not built yet: the app keeps the change on this device
    }
  },
  changePassword: async (current, next) => {
    try {
      await request("/api/profile/change-password", { method: "POST", body: { current_password: current, new_password: next } });
    } catch (e) {
      if (missing(e)) throw new Error("Changing the password is not available on the server yet.");
      throw e;
    }
  },
};
