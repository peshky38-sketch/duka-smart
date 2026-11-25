// Edit and delete for expenses (the backend has PUT and DELETE for these)
import { request } from "./api";

export const expensesApi = {
  update: async (id, e) => {
    // Only these three fields: the backend's update rejects any other field with 400 "Invalid fields supplied".
    // Once it accepts a date, add `date: e.date` here.
    await request(`/api/expenses/${id}`, { method: "PUT", body: { expense_name: e.description, amount: e.amount, category: e.category } });
    const { expense } = await request(`/api/expenses/${id}`); // read it back so the date shown is the server's
    return {
      id: expense.id,
      description: expense.expense_name,
      category: expense.category,
      amount: Number(expense.amount),
      date: ((d) => (/(Z|[+-]\d{2}:?\d{2})$/i.test(d) ? d : d + "Z"))(expense.date || expense.created_at),
    };
  },
  remove: (id) => request(`/api/expenses/${id}`, { method: "DELETE" }),
};
