// Light / dark mode. The choice is saved in the browser: "light", "dark" or "system" (follow the device).
const KEY = "duka_theme";
const query = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

export function getTheme() {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function resolve(mode) {
  return mode === "system" ? (query && query.matches ? "dark" : "light") : mode;
}

export function applyTheme(mode = getTheme()) {
  document.documentElement.setAttribute("data-theme", resolve(mode));
}

export function setTheme(mode) {
  try {
    if (mode === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, mode);
  } catch {
    // storage blocked: the choice still applies until the page is closed
  }
  applyTheme(mode);
}

// follow the device while "system" is chosen
if (query && query.addEventListener) {
  query.addEventListener("change", () => {
    if (getTheme() === "system") applyTheme("system");
  });
}

applyTheme();
