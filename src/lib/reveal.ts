/** On phones the preview sits under the list, so bring it into view after a tap. */
export function revealOnMobile(id: string) {
  if (typeof window === "undefined" || window.innerWidth >= 1024) return;
  requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }));
}
