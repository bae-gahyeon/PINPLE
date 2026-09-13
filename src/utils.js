// src/utils.js

export const formatDate = (dateString) => {
  if (!dateString) return "";
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const date = new Date(dateString);
  return `${dateString} (${days[date.getDay()]})`;
};

// 사진 파일을 Cloudinary에 올리고, 올라간 사진의 URL을 돌려주는 함수
export const uploadToCloudinary = async (file) => {
  const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;

  // FormData: 파일 같은 바이너리 데이터를 보낼 때 쓰는 특수한 형식
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  );

  const res = await fetch(url, { method: "POST", body: formData });
  const data = await res.json();

  if (!data.secure_url) throw new Error("사진 업로드 실패");
  return data.secure_url; // Firestore에 저장할 사진 주소
};

// 기록 배열을 기간 기준으로 걸러주는 함수
export const filterRecordsByPeriod = (records, period) => {
  if (period === "all") return records;

  const now = new Date();
  const cutoff = new Date();
  if (period === "1m") cutoff.setMonth(now.getMonth() - 1);
  if (period === "6m") cutoff.setMonth(now.getMonth() - 6);

  return records.filter((r) => new Date(r.date) >= cutoff);
};
