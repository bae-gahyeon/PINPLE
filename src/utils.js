// src/utils.js

export const formatDate = (dateString) => {
  if (!dateString) return "";
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const date = new Date(dateString);
  return `${dateString} (${days[date.getDay()]})`;
};
