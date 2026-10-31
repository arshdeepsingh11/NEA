/** Opens NEA's AR face-map mirror from anywhere on the site, optionally on one face zone. */
export const openMirror = (zone?: string) => window.dispatchEvent(new CustomEvent("nea:mirror", { detail: { zone } }));
