// src/components/RecordModal.jsx
import { useState } from "react";
import firebase from "firebase/compat/app";
import { db } from "./firebase";
import { useDiaryStore } from "../store/useDiaryStore";
import { formatDate, uploadToCloudinary } from "../utils";

// 공통 버튼 스타일
const btnStyle = {
  padding: "8px 12px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
};

const amountBtnStyle = {
  ...btnStyle,
  background: "#f0f0f0",
  flex: 1,
};

export default function RecordModal({
  selectedPlace,
  setIsModalOpen,
  setSelectedPlace,
  currentProfile,
  setKeyword,
  setSearchResults,
  editingRecord = null,
  setEditingRecord,
  aiData,
  setAiData,
  uid, // uid 추가
}) {
  const fetchRecords = useDiaryStore((s) => s.fetchRecords);

  // 수정 모드일 경우 기존 데이터, 아니면 빈 값 기본으로 세팅
  const [date, setDate] = useState(
    editingRecord ? editingRecord.date : aiData?.date || "",
  );
  const [cost, setCost] = useState(
    editingRecord ? editingRecord.cost : aiData?.cost || "",
  );
  const [memo, setMemo] = useState(
    editingRecord ? editingRecord.memo : aiData?.memo || "",
  );

  const [rating, setRating] = useState(editingRecord?.rating || 0);

  // 새로 고른 파일(업로드 전) / 미리보기용 이미지 / 지금 업로드 중인지 여부
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(
    editingRecord?.photoUrl || null,
  );
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    if (!date || !cost || !memo) return alert("항목을 모두 입력해주세요!");

    setUploading(true);
    try {
      // 새 사진을 골랐으면 그걸 업로드, 안 골랐으면 기존 사진(수정모드) 그대로 유지
      let photoUrl = editingRecord?.photoUrl || null;
      if (photoFile) {
        photoUrl = await uploadToCloudinary(photoFile);
      }

      if (editingRecord) {
        await db.collection("diary_records").doc(editingRecord.id).update({
          date,
          cost,
          memo,
          photoUrl,
          rating,
        });
        alert("수정되었습니다!");
        handleClose();
        fetchRecords();
      } else {
        await db.collection("diary_records").add({
          uid,
          profileName: currentProfile,
          placeName: selectedPlace.place_name,
          lat: selectedPlace.y,
          lng: selectedPlace.x,
          address: selectedPlace.address_name,
          category: selectedPlace.category_name,
          date,
          cost,
          memo,
          photoUrl,
          rating,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
        alert("저장되었습니다!");
        setIsModalOpen(false);
        setSelectedPlace(null);
        setKeyword("");
        setSearchResults([]);
        fetchRecords();
      }
    } catch (error) {
      console.error("저장 중 오류:", error);
      alert("사진 업로드나 저장 중 문제가 발생했어요. 다시 시도해주세요.");
    } finally {
      setUploading(false);
    }
  };

  // 닫기 버튼 눌렀을 때 모든 상태 초기화 (오류 방지)
  const handleClose = () => {
    setIsModalOpen(false);
    if (setSelectedPlace) setSelectedPlace(null);
    if (setKeyword) setKeyword("");
    if (setSearchResults) setSearchResults([]);
    if (setEditingRecord) setEditingRecord(null); // 수정 모드 해제
    if (setAiData) setAiData(null);
  };

  // 장소 이름 분기 처리 (수정 - 기록된 이름, 추가 - 카카오맵 이름)
  const placeName = editingRecord
    ? editingRecord.placeName
    : selectedPlace?.place_name;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          width: "350px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            borderBottom: "2px solid #eee",
            paddingBottom: "10px",
          }}
        >
          {editingRecord ? "장소 기록 수정하기" : "장소 기록하기"}
        </h3>

        <p>
          📍 장소: <strong>{placeName}</strong>
        </p>
        <p>
          📆 날짜:{" "}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {/* 날짜를 선택하면 옆에 (목) 하고 요일 표시 */}
          {date && (
            <span
              style={{ fontWeight: "bold", color: "black", marginLeft: "5px" }}
            >
              {formatDate(date).slice(-3)}
            </span>
          )}
        </p>
        <p>
          🧾 지출액:{" "}
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />{" "}
          원
        </p>
        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
          <button
            style={amountBtnStyle}
            onClick={() => setCost(Number(cost || 0) + 1000)}
          >
            +1천원
          </button>
          <button
            style={amountBtnStyle}
            onClick={() => setCost(Number(cost || 0) + 5000)}
          >
            +5천원
          </button>
          <button
            style={amountBtnStyle}
            onClick={() => setCost(Number(cost || 0) + 10000)}
          >
            +1만원
          </button>
          <button
            style={{ ...amountBtnStyle, background: "#ddd" }}
            onClick={() => setCost("")}
          >
            초기화
          </button>
        </div>
        <p style={{ marginTop: "15px", marginBottom: "5px" }}>
          ⭐ 만족도:{" "}
          <span style={{ fontSize: 24, verticalAlign: "middle" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star === rating ? 0 : star)} // 같은 별 다시 누르면 취소
                style={{
                  cursor: "pointer",
                  color: star <= rating ? "#ffc107" : "#ddd",
                }}
              >
                ★
              </span>
            ))}
          </span>
        </p>
        <p style={{ marginTop: "15px", marginBottom: "5px" }}>
          📝 메모:{" "}
          <textarea
            rows="3"
            style={{ width: "100%", resize: "none", marginTop: "10px" }}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          ></textarea>
        </p>

        <p style={{ marginTop: "15px", marginBottom: "5px" }}>
          📷 사진:{" "}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              if (file.size > 5 * 1024 * 1024) {
                alert("사진 크기는 5MB 이하로 올려주세요!");
                return;
              }
              setPhotoFile(file);
              setPhotoPreview(URL.createObjectURL(file)); // 업로드 전, 내 컴퓨터에 있는 파일 미리보기
            }}
          />
        </p>
        {photoPreview && (
          <img
            src={photoPreview}
            alt="미리보기"
            style={{
              width: "100%",
              maxHeight: 150,
              objectFit: "contain",
              borderRadius: 8,
              marginBottom: 10,
            }}
          />
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <button
            style={{ ...btnStyle, background: "#ddd", color: "black" }}
            onClick={handleClose}
          >
            닫기
          </button>
          <button
            style={{
              ...btnStyle,
              background: "#0b1031",
              color: "white",
              opacity: uploading ? 0.6 : 1,
            }}
            onClick={handleSave}
            disabled={uploading}
          >
            {uploading ? "저장 중..." : editingRecord ? "수정완료" : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
