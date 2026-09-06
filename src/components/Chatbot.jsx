// src/components/Chatbot.jsx
import { useState } from "react";

export default function Chatbot({ currentProfile, onAiParsed }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);

    try {
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      const today = new Date().toISOString().split("T")[0];

      const prompt = `
      너는 사용자의 일상 대화를 다이어리 데이터로 변환해주는 AI야.
      오늘 날짜는 ${today}야. ('오늘', '어제'는 이 날짜 기준으로 계산해)
      
      사용자 입력: "${inputText}"
      
      위 문장에서 다음 정보를 추출해 반드시 순수 JSON 형식으로만 대답해.
      {"placeName": "장소명", "cost": 0, "date": "YYYY-MM-DD", "memo": "간단한 요약 메모"}
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        },
      );

      const data = await response.json();
      let resultText = data.candidates[0].content.parts[0].text;
      resultText = resultText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsedData = JSON.parse(resultText);

      onAiParsed(parsedData); // 부모(Pinple)에게 전달
      setInputText("");
      setIsOpen(false); // 채팅창 닫기
    } catch (error) {
      console.error("AI 변환 실패:", error);
      alert("AI가 문장을 이해하지 못했어요. 다시 시도해주세요!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 플로팅 챗봇 버튼 */}
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
              "9월 3일 서면 고깃집 3만원" 처럼 <br />오늘 다녀온 곳을 편하게
              말씀해주세요. <br />제가 정리해서 기록해 드릴게요!
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
