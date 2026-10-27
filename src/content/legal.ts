import raw from "./generated/legal.json";
import type { Block } from "./treatments";

const legal = raw as Record<string, Block[]>;
export const privacyBlocks = legal["privacy-policy"] ?? [];
export const termsBlocks = legal["terms-of-service"] ?? [];
