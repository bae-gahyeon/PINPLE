// src/components/Chatbot.jsx
import { useState } from "react";

export default function Chatbot({ currentProfile, onAiParsed }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 여러 지점 검색 시 챗봇 안에 리스트 생성
  const [placeOptions, setPlaceOptions] = useState([]);
  const [tempAiData, setTempAiData] = useState(null);

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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${API_KEY}`,
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

      const ps = new window.kakao.maps.services.Places();
      ps.keywordSearch(parsedData.placeName, (searchData, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          if (searchData.length === 1) {
            // 결과가 1개면 바로 모달창 열기
            onAiParsed(parsedData, searchData[0]);
            setInputText("");
            setIsOpen(false);
          } else {
            // 결과가 여러 개면 챗봇 창에 최대 5개 객관식으로 띄워주기
            setPlaceOptions(searchData.slice(0, 5));
            setTempAiData(parsedData);
            setInputText("");
          }
        } else {
          alert(`지도에서 "${parsedData.placeName}" 장소를 찾을 수 없어요!`);
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error("AI 변환 실패:", error);
      alert("AI가 문장을 이해하지 못했어요. 다시 시도해주세요!");
      setIsLoading(false);
    }
  };

  // 객관식 리스트에서 하나를 선택했을 때 실행되는 함수
  const handleSelectPlace = (place) => {
    onAiParsed(tempAiData, place); // 선택한 장소와 AI데이터를 부모로 전달
    setPlaceOptions([]); // 리스트 초기화
    setTempAiData(null);
    setIsOpen(false); // 챗봇 닫고 모달창으로 이동
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
              backgroundColor: "#fca1bc",
              color: "white",
              padding: "15px",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>AI 스마트 기록 비서</span>
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
              "9월 3일 서면 고깃집 3만원" 처럼 <br />
              오늘 다녀온 곳을 편하게 말씀해주세요. <br />
              제가 정리해서 기록해 드릴게요!
            </div>
            {/* 💡 빠져있던 객관식 리스트 UI 복구 완료! */}
            {placeOptions.length > 0 && (
              <div
                style={{
                  backgroundColor: "white",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #e50914",
                }}
              >
                <p
                  style={{
                    margin: "0 0 10px 0",
                    fontWeight: "bold",
                    color: "#000000",
                    fontSize: "13px",
                  }}
                >
                  여러 지점이 검색되었어요! 어느 곳인가요?
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {placeOptions.map((place, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPlace(place)}
                      style={{
                        padding: "8px",
                        textAlign: "left",
                        background: "#f0f0f0",
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      <strong style={{ display: "block", color: "#0b1031" }}>
                        {place.place_name}
                      </strong>
                      <span style={{ color: "gray" }}>
                        {place.address_name}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => setPlaceOptions([])}
                    style={{
                      padding: "5px",
                      background: "transparent",
                      border: "none",
                      color: "gray",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    취소하기
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 입력 영역 */}
          <form
            onSubmit={(e) => {
              e.preventDefault(); // 엔터 쳤을 때 폼 전송으로 인한 새로고침 방지
              handleSend();
            }}
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
              placeholder="대화하듯 입력해보세요..."
              style={{
                flex: 1,
                padding: "10px 15px",
                border: "1px solid #ccc",
                borderRadius: "20px",
                outline: "none",
                fontSize: "14px",
              }}
              disabled={isLoading || placeOptions.length > 0}
            />
            <button
              type="submit" // 버튼 타입을 submit으로 지정
              onClick={handleSend}
              disabled={isLoading || placeOptions.length > 0}
              style={{
                marginLeft: "10px",
                padding: "10px 15px",
                backgroundColor:
                  isLoading || placeOptions.length > 0 ? "#888" : "#0b1031",
                color: "white",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              전송
            </button>
          </form>
        </div>
      )}
    </>
  );
}
