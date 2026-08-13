// src/utils.js

export const getWeekday = (dateString) => {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const date = new Date(dateString);
  return days[date.getDay()];
};
