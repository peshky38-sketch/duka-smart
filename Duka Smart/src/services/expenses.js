// Edit and delete for expenses (these two endpoints are new, see README note)
import { request } from "./api";

const toExpense = (e) => ({
  id: e.id,
  description: e.description,
  category: e.category?.name ?? e.category,
  amount: Number(e.amount),
  date: e.date || e.created_at,
});

export const expensesApi = {
  update: async (id, e) =>
    toExpense(await request(`/api/expenses/${id}`, { method: "PATCH", body: { description: e.description, category: e.category, amount: e.amount, date: e.date } })),
  remove: (id) => request(`/api/expenses/${id}`, { method: "DELETE" }),
};
