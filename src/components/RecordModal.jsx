// src/components/RecordModal.jsx
import { useState } from "react";
import firebase from "firebase/compat/app";
import { db } from "./firebase";

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
  fetchRecords,
  setKeyword,
  setSearchResults,
  editingRecord = null,
  setEditingRecord,
}) {
  // 수정 모드일 경우 기존 데이터, 아니면 빈 값 기본으로 세팅
  const [date, setDate] = useState(editingRecord ? editingRecord.date : "");
  const [cost, setCost] = useState(editingRecord ? editingRecord.cost : "");
  const [memo, setMemo] = useState(editingRecord ? editingRecord.memo : "");

  const handleSave = () => {
    if (!date || !cost || !memo) return alert("항목을 모두 입력해주세요!");

    if (editingRecord) {
      // 수정 모드 (기존 문서 update)
      db.collection("diary_records")
        .doc(editingRecord.id)
        .update({
          date,
          cost,
          memo,
        })
        .then(() => {
          alert("수정되었습니다!");
          handleClose();
          fetchRecords();
        });
    } else {
      // 추가 모드 (기존 add 로직)
      db.collection("diary_records")
        .add({
          profileName: currentProfile,
          placeName: selectedPlace.place_name,
          lat: selectedPlace.y,
          lng: selectedPlace.x,
          address: selectedPlace.address_name, // ex) "부산 해운대구 123"
          category: selectedPlace.category_name, // ex) "카페", "음식"
          date,
          cost,
          memo,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          alert("저장되었습니다!");
          setIsModalOpen(false);
          setSelectedPlace(null);
          setKeyword(""); // 검색창 텍스트 날리기
          setSearchResults([]); // 파란 핀들 날리기
          fetchRecords();
        });
    }
  };

  // 닫기 버튼 눌렀을 때 모든 상태 초기화 (오류 방지)
  const handleClose = () => {
    setIsModalOpen(false);
    if (setSelectedPlace) setSelectedPlace(null);
    if (setKeyword) setKeyword("");
    if (setSearchResults) setSearchResults([]);
    if (setEditingRecord) setEditingRecord(null); // 수정 모드 해제
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
          padding: 20,
          borderRadius: 10,
          width: 350,
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
          <button onClick={() => setCost(Number(cost || 0) + 1000)}>
            +1천원
          </button>
          <button onClick={() => setCost(Number(cost || 0) + 5000)}>
            +5천원
          </button>
          <button onClick={() => setCost(Number(cost || 0) + 10000)}>
            +1만원
          </button>
          <button onClick={() => setCost("")}>초기화</button>
        </div>
        <p>
          📝 메모:{" "}
          <textarea
            rows="3"
            style={{ width: "100%" }}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          ></textarea>
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <button
            style={{ ...btnStyle, background: "#ccc", color: "black" }}
            onClick={handleClose}
          >
            닫기
          </button>
          <button
            style={{ ...btnStyle, background: "#e50914", color: "white" }}
            onClick={handleSave}
          >
            {editingRecord ? "수정완료" : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
