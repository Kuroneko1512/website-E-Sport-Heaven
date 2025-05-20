export const FomatTime = (timeString) => {
    const date = new Date(timeString);
    const now = new Date();
  
    const isSameDay = (d1, d2) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  
    const isYesterday = (d) => {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      return isSameDay(d, yesterday);
    };
  
    // Tính số ngày chênh lệch
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    // Format ngày tháng
    const formatDate = (d) => {
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };
  
    if (isSameDay(date, now)) return "Hôm nay";
    if (isYesterday(date)) return "Hôm qua";
    
    // Nếu trong vòng 7 ngày, hiển thị "X ngày trước"
    if (daysDiff < 7) return `${daysDiff} ngày trước`;
    
    // Nếu cùng năm, hiển thị ngày và tháng
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit'
      });
    }
    
    // Khác năm, hiển thị đầy đủ ngày tháng năm
    return formatDate(date);
};