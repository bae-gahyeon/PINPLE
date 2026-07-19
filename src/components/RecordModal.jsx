// src/components/RecordModal.jsx
import { useState } from "react";
import firebase from "firebase/compat/app";
import { db } from "./firebase";

export default function RecordModal({
  selectedPlace,
  setIsModalOpen,
  currentProfile,
  fetchRecords,
}) {
  const [date, setDate] = useState("");
  const [cost, setCost] = useState("");
  const [memo, setMemo] = useState("");

  const handleSave = () => {
    if (!date || !cost || !memo) return alert("항목을 모두 입력해주세요!");

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
        fetchRecords();
      });
  };

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
        <h3>장소 기록하기</h3>
        <p>
          📍 장소: <strong>{selectedPlace?.place_name}</strong>
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
          <button onClick={handleSave}>저장하기</button>
          <button onClick={() => setIsModalOpen(false)}>닫기</button>
        </div>
      </div>
    </div>
  );
}
