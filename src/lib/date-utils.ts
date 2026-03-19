export type DateRangePreset = "7" | "30" | "90" | "all";

export function getDateCutoff(preset: DateRangePreset): string | null {
  if (preset === "all") return null;

  const days = Number(preset);
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}
