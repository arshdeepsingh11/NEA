/** Inline in <head> so the saved theme is applied before first paint (no flash). Kept out of the client module on purpose. */
export const themeInitScript = `try{var t=localStorage.getItem("nea-theme");document.documentElement.dataset.theme=(t==="sand"||t==="pearl")?t:"pearl"}catch(e){document.documentElement.dataset.theme="pearl"}`;
