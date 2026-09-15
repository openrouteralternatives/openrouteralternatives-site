/**
 * Applies the stored theme before first paint so there is no flash of the
 * wrong palette. Injected into <head> as a blocking inline script.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("ora-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export const THEME_STORAGE_KEY = "ora-theme";
