// Helper format tanggal dan waktu
export function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", { hour12: false });
  } catch {
    return dateStr;
  }
}
