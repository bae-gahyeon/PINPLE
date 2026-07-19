// src/TimelineTab.jsx

export default function TimelineTab({ savedRecords }) {
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
            marginBottom: 15,
            padding: 10,
            background: "white",
            borderRadius: 8,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
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
