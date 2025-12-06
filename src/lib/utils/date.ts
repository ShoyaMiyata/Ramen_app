export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateInput(timestamp: number | undefined): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toISOString().split("T")[0];
}

export function parseDateInput(dateString: string): number | undefined {
  if (!dateString) return undefined;
  return new Date(dateString).getTime();
}

export function getTodayDateInput(): string {
  return new Date().toISOString().split("T")[0];
}
