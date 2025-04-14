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
  
    const getWeek = (d) => {
      const oneJan = new Date(d.getFullYear(), 0, 1);
      const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
      return Math.ceil((d.getDay() + 1 + numberOfDays) / 7);
    };
  
    const currentWeek = getWeek(now);
    const dateWeek = getWeek(date);
  
    const sameYear = date.getFullYear() === now.getFullYear();
  
    if (isSameDay(date, now)) return "Hôm nay";
    if (isYesterday(date)) return "Hôm qua";
    if (dateWeek === currentWeek && sameYear) return "Tuần này";
    if (dateWeek === currentWeek - 1 && sameYear) return "Tuần trước";
  
    const month = date.toLocaleString("vi-VN", { month: "long" }); // "Tháng ba"
    if (sameYear) return `${month}`;
    return `${month} năm ${date.getFullYear()}`;
  };  