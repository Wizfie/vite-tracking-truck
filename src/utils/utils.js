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

// Fungsi untuk mengonversi timestamp menjadi format waktu relatif
export function formatTime(timestamp) {
  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now - messageDate) / 1000); // Selisih dalam detik
  const diffInMinutes = Math.floor(diffInSeconds / 60); // Selisih dalam menit
  const diffInHours = Math.floor(diffInMinutes / 60); // Selisih dalam jam
  const diffInDays = Math.floor(diffInHours / 24); // Selisih dalam hari

  if (diffInSeconds < 60) {
    return "Baru saja"; // Jika kurang dari 1 menit
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} menit yang lalu`; // Jika kurang dari 1 jam
  } else if (diffInHours < 24) {
    return `${diffInHours} jam yang lalu`; // Jika kurang dari 1 hari
  } else if (diffInDays === 1) {
    return "Kemarin"; // Jika 1 hari yang lalu
  } else if (diffInDays < 7) {
    return `${diffInDays} hari yang lalu`; // Jika kurang dari 7 hari
  } else {
    return messageDate.toLocaleDateString(); // Menampilkan tanggal jika lebih dari seminggu
  }
}
