import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MULTI_VALUE_DELIMITER } from '@/lib/normalize';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTypeString(type: string | undefined) {
  if (!type) return '';
  // TODO: ajouter le "et" sur le dernier si plus d'un.
  return type.split(MULTI_VALUE_DELIMITER).join(', ');
}
