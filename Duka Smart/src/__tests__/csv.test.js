import { describe, it, expect } from "vitest";
import { toCsv } from "../utils";

describe("CSV export", () => {
  it("joins rows with commas and new lines", () => {
    expect(toCsv([["a", "b"], [1, 2]])).toBe("a,b\r\n1,2");
  });
  it("quotes text that contains commas, quotes or new lines", () => {
    expect(toCsv([['Sugar, 1kg "white"']])).toBe('"Sugar, 1kg ""white"""');
  });
  it("stops text from running as a spreadsheet formula", () => {
    expect(toCsv([["=SUM(A1:A9)"], ["+1"], ["@cmd"]])).toBe("'=SUM(A1:A9)\r\n'+1\r\n'@cmd");
  });
  it("keeps negative numbers as numbers", () => {
    expect(toCsv([[-250, "ok"]])).toBe("-250,ok");
  });
  it("handles empty values", () => {
    expect(toCsv([[null, undefined, ""]])).toBe(",,");
  });
});
