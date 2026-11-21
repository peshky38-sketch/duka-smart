// Supplier calls for the FastAPI backend (these endpoints are new, see README note)
import { request } from "./api";

const toSupplier = (s) => ({ id: s.id, name: s.name, phone: s.phone || "", deliveryDays: s.delivery_days ?? 1, notes: s.notes || "" });
const fromSupplier = (s) => ({ name: s.name, phone: s.phone, delivery_days: s.deliveryDays, notes: s.notes });
const list = (d) => (Array.isArray(d) ? d : d.suppliers || []);

export const supplierApi = {
  list: async () => list(await request("/api/suppliers")).map(toSupplier),
  create: async (s) => toSupplier(await request("/api/suppliers", { method: "POST", body: fromSupplier(s) })),
  update: async (id, s) => toSupplier(await request(`/api/suppliers/${id}`, { method: "PATCH", body: fromSupplier(s) })),
  remove: (id) => request(`/api/suppliers/${id}`, { method: "DELETE" }),
};
