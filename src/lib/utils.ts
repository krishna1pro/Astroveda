import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getISTDate(): string {
  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const parts = new Intl.DateTimeFormat("en-IN", options).formatToParts(new Date());
    const year = parts.find((p) => p.type === "year")?.value || "2026";
    const month = parts.find((p) => p.type === "month")?.value || "01";
    const day = parts.find((p) => p.type === "day")?.value || "01";
    return `${year}-${month}-${day}`;
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

export function getISTDateDDMMYYYY(): string {
  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const parts = new Intl.DateTimeFormat("en-IN", options).formatToParts(new Date());
    const year = parts.find((p) => p.type === "year")?.value || "2026";
    const month = parts.find((p) => p.type === "month")?.value || "01";
    const day = parts.find((p) => p.type === "day")?.value || "01";
    return `${day}-${month}-${year}`;
  } catch (e) {
    return "01-01-2026";
  }
}

export function parseSheetDate(dateStr: string | undefined): { day: string; month: string; year: string; dayName: string } {
  const fallback = { day: "??", month: "???", year: "2026", dayName: "???" };
  if (!dateStr) return fallback;

  // Handle DD-MM-YYYY or DD/MM/YYYY
  const parts = dateStr.split(/[-/]/);
  if (parts.length !== 3) return fallback;

  const [d, m, y] = parts;
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  
  try {
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const dayName = dateObj.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase();
    const monthName = months[parseInt(m) - 1] || "???";
    
    return {
      day: d,
      month: monthName,
      year: y,
      dayName: dayName
    };
  } catch (e) {
    return fallback;
  }
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr || typeof dateStr !== 'string') return "N/A";
  const parts = dateStr.split(/[-/]/);
  if (parts.length !== 3) return dateStr;

  const [d, m, y] = parts;
  try {
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return dateObj.toLocaleDateString("en-IN", { 
      weekday: "long", 
      day: "numeric", 
      month: "long", 
      year: "numeric" 
    });
  } catch (e) {
    return dateStr;
  }
}
