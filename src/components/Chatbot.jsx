// src/components/AiChatbot.jsx
import { useState } from "react";

export default function AiChatbot({ currentProfile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (!inputText.trim()) return;

    // 💡 테스트용 알림 (여기에 곧 Gemini API 로직이 들어갈 예정!)
    alert(`입력한 내용: ${inputText}\n(여기에 AI 분석 로직이 들어갈 거야!)`);
    setInputText("");
  };

  return (
    <>
      {/* 둥둥 떠 있는 플로팅 챗봇 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "85px", // 하단 탭바 위로 살짝 띄움
          right: "20px",
          zIndex: 9999,
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "#0b1031", // 네이비색
          color: "white",
          fontSize: "24px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transition: "transform 0.2s",
        }}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* 버튼 누르면 위로 열리는 채팅창 모달 */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "160px", // 플로팅 버튼 바로 위
            right: "20px",
            zIndex: 9998,
            width: "320px",
            height: "400px",
            backgroundColor: "white",
            borderRadius: "15px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* 채팅창 헤더 */}
          <div
            style={{
              backgroundColor: "#e50914",
              color: "white",
              padding: "15px",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>✨ AI 스마트 기록 비서</span>
            <span
              style={{ cursor: "pointer", fontSize: "18px" }}
              onClick={() => setIsOpen(false)}
            >
              ✕
            </span>
          </div>

          {/* 대화 내역 영역 */}
          <div
            style={{
              flex: 1,
              padding: "15px",
              backgroundColor: "#f4f7f8",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "10px",
                fontSize: "14px",
                border: "1px solid #eee",
                lineHeight: "1.5",
              }}
            >
              안녕하세요, <strong>{currentProfile}</strong>님! 😊
              <br />
              <br />
              "9월 3일 서면 고깃집 3만원" 처럼 오늘 다녀온 곳을 편하게
              말씀해주세요. 제가 찰떡같이 정리해서 기록해 드릴게요!
            </div>
          </div>

          {/* 입력 영역 */}
          <div
            style={{
              display: "flex",
              padding: "10px",
              borderTop: "1px solid #ddd",
              backgroundColor: "white",
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="대화하듯 입력해보세요..."
              style={{
                flex: 1,
                padding: "10px 15px",
                border: "1px solid #ccc",
                borderRadius: "20px",
                outline: "none",
                fontSize: "14px",
              }}
            />
            <button
              onClick={handleSend}
              style={{
                marginLeft: "10px",
                padding: "10px 15px",
                backgroundColor: "#0b1031",
                color: "white",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              전송
            </button>
          </div>
        </div>
      )}
    </>
  );
}
