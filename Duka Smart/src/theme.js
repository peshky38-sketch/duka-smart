
const KEY = "theme";

export const getTheme = () =>
  localStorage.getItem(KEY) ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

export const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme; // CSS reads [data-theme="dark"]
  localStorage.setItem(KEY, theme);
};

// Call once before the app renders so there is no flash of the wrong theme
export const initTheme = () => {
  document.documentElement.dataset.theme = getTheme();
};
