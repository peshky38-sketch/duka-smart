import { describe, it, expect } from "vitest";
import { isLow, isOut } from "../context/AppContext.jsx";
import { sum, saleCost, pctChange, sameDay } from "../utils";
import { toWhatsAppNumber, reorderMessage } from "../whatsapp";

describe("low-stock rule (project doc, business rules)", () => {
  const p = (qty) => ({ qty, minStock: 10 });
  it("is low when stock equals the minimum", () => expect(isLow(p(10))).toBe(true));
  it("is low when stock is below the minimum", () => expect(isLow(p(4))).toBe(true));
  it("is not low when stock is above the minimum", () => expect(isLow(p(11))).toBe(false));
  it("is out of stock (not low) at zero", () => {
    expect(isOut(p(0))).toBe(true);
    expect(isLow(p(0))).toBe(false);
  });
});

describe("profit calculations", () => {
  it("sums values", () => expect(sum([{ a: 2 }, { a: 3 }], (x) => x.a)).toBe(5));
  it("cost of goods sold = cost x quantity for every item", () => {
    const sale = { items: [{ qty: 2, cost: 100 }, { qty: 1, cost: 50 }] };
    expect(saleCost(sale)).toBe(250);
  });
  it("net profit = revenue - cost of goods - expenses", () => {
    const sale = { total: 500, items: [{ qty: 2, cost: 100 }] };
    expect(sale.total - saleCost(sale) - 120).toBe(180);
  });
  it("percentage change vs yesterday", () => {
    expect(pctChange(120, 100)).toBe(20);
    expect(pctChange(80, 100)).toBe(-20);
    expect(pctChange(5, 0)).toBeNull();
  });
  it("matches dates on the same day", () => {
    expect(sameDay("2026-11-20T08:00:00", "2026-11-20T21:30:00")).toBe(true);
    expect(sameDay("2026-11-20T08:00:00", "2026-11-21T08:00:00")).toBe(false);
  });
});

describe("supplier reorder over WhatsApp", () => {
  it("formats Kenyan numbers", () => {
    expect(toWhatsAppNumber("0712 345 678")).toBe("254712345678");
    expect(toWhatsAppNumber("+254 712 345 678")).toBe("254712345678");
    expect(toWhatsAppNumber("712345678")).toBe("254712345678");
  });
  it("lists every item in the message", () => {
    const text = reorderMessage("Mama Wanjiru Stores", "Baraka Foods", [{ name: "Sugar 1kg", qty: 46 }, { name: "Bar Soap", qty: 21 }]);
    expect(text).toContain("- Sugar 1kg x 46");
    expect(text).toContain("- Bar Soap x 21");
    expect(text).toContain("Baraka Foods");
  });
});
