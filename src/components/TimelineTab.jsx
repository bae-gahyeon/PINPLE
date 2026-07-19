// src/components/TimelineTab.jsx

import { db } from "./firebase";

export default function TimelineTab({ savedRecords, fetchRecords }) {
  const handleDelete = (id) => {
    if (window.confirm("정말 이 기록을 삭제할까요?")) {
      db.collection("diary_records")
        .doc(id)
        .delete()
        .then(() => {
          alert("삭제되었습니다.");
          fetchRecords(); // 부모 새로고침 요청
        });
    }
  };

  /* ⏳ 2. 타임라인 탭 */
  return (
    <div
      style={{
        padding: "20px 20px 85px 20px",
        overflowY: "auto",
        height: "100%",
        boxSizing: "border-box",
        background: "#f9f9f9",
      }}
    >
      <h2 style={{ borderBottom: "2px solid #e50914", paddingBottom: 10 }}>
        내 기록 타임라인
      </h2>
      {savedRecords.map((r) => (
        <div
          key={r.id}
          style={{
            position: "relative", // 버튼 우측 상단에 띄우기 위해 추가
            marginBottom: 15,
            padding: 10,
            background: "white",
            borderRadius: 8,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <button
            onClick={() => handleDelete(r.id)}
            style={{
              position: "absolute",
              margin: "3px",
              width: "50px",
              height: "30px",
              top: "10px",
              right: "10px",
              background: "#eee",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              border: "none",
            }}
            title="기록 삭제"
          >
            삭제
          </button>

          <div style={{ fontSize: 12, color: "gray" }}>{r.date}</div>
          <div style={{ fontWeight: "bold", fontSize: 16 }}>{r.placeName}</div>
          <br />
          <div>💰 {r.cost}원</div>
          <div style={{ color: "#555", marginTop: 5 }}>📝 {r.memo}</div>
        </div>
      ))}
    </div>
  );
}
