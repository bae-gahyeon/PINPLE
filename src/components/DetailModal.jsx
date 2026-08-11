// src/components/DetailModal.jsx

export default function DetailModal({ record, onClose }) {
  if (!record) return null;

  // 추후 수정: 파이어베이스에서 사진 URL을 받아오기 전까지 쓸 임시 사진
  const dummyImageUrl = "https://via.placeholder.com/400x250?text=Photo+Area";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "380px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          overflow: "hidden", // 모서리 둥글게
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 사진 영역(나중에 사진 URL로 교체될 자리) */}
        <div style={{ width: "100%", height: "250px", position: "relative" }}>
          <img
            src={dummyImageUrl}
            alt="장소 사진(추후 파이어베이스랑 연동)"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "rgba(0,0,0,0.5)",
              border: "none",
              color: "white",
              fontSize: "16px",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* 상세 내용 영역 */}
        <div style={{ padding: "20px" }}>
          <div style={{ marginBottom: "15px" }}>
            <h2 style={{ margin: "0 0 5px 0", fontSize: "20px" }}>
              {record.placeName}
            </h2>
            <span
              style={{
                fontSize: "12px",
                color: "white",
                background: "#e50914",
                padding: "3px 8px",
                borderRadius: "4px",
              }}
            >
              {record.category || "카테고리 없음"}
            </span>
          </div>

          <div style={{ fontSize: "14px", color: "#444", lineHeight: "1.6" }}>
            <div>
              <strong>날짜:</strong>
              {record.date}
            </div>
            <div>
              <strong>주소:</strong>
              {record.address || "주소 정보 없음"}
            </div>
            <div>
              <strong>지출:</strong>
              {Number(record.cost || 0).toLocaleString()}원
            </div>

            <div
              style={{
                marginTop: "15px",
                padding: "12px",
                background: "#f5f5f5",
                borderRadius: "8px",
                minHeight: "60px",
              }}
            >
              <strong>메모:</strong>
              <br />
              {record.memo || "작성된 메모가 없습니다."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
