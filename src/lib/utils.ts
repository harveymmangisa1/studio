import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toCsv(data: any[], columns: string[]): string {
  const header = columns.join(',') + '\n';
  const body = data.map(row => {
    return columns.map(col => row[col]).join(',');
  }).join('\n');
  return header + body;
}
