import { type ClassValue, clsx } from "clsx";

/**
 * Simple className merger
 * Combines class values into a single string
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
