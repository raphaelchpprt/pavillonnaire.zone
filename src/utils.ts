import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatMultiValueString } from "@/lib/normalize";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTypeString(type: string | undefined) {
  return formatMultiValueString(type);
}
