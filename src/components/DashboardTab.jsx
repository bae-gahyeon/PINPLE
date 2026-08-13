// src/components/DashboardTab.jsx
import { useState, useEffect } from "react";

// AI 대시보드 상태
export default function DashboardTab({ savedRecords, currentProfile }) {
  // Pinple에 있는 AI 상태 이사 완료
  const [aiInsight, setAiInsight] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 모바일 화면 감지 상태
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Gemini AI 호출 함수
  const analyzeWithGemini = async () => {
    if (savedRecords.length === 0) {
      alert("분석할 기록이 없습니다! 장소를 먼저 저장해주세요.");
      return;
    }

    setIsAnalyzing(true);
    try {
      //
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

      // 내 기록을 AI가 읽기 좋게 텍스트로 변환
      const promptData = savedRecords
        .map((r) => `- ${r.date}: ${r.placeName} (${r.cost}원) 메모: ${r.memo}`)
        .join("\n");

      // AI에게 내릴 섬세한 프롬프트 지시사항
      const prompt = `
      너는 사용자의 장소 방문 기록과 지출 내역을 분석해주는 다정한 AI 비서야.
      다음은 사용자가 최근 다녀온 부산 지역의 장소 기록이야:
      
      [기록 시작]
      ${promptData}
      [기록 끝]
      
      이 데이터를 바탕으로 다음 3가지 요소를 포함하여 3~4줄로 다정하게 요약해줘:
      1. 자주 방문한 지역
      2. 전반적인 지출 성향 및 평균 지출액 
      3. 주로 방문한 카테고리 (카페, 식당, 문화공간 등)
      
      그리고 마지막 줄에는 다가오는 주말에 갈만한 부산의 새로운 핫플 장소를 딱 하나만 센스 있게 추천해줘.
      `;

      // 구글 Gemini API 호출
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
      );

      const data = await response.json();
      console.log("Gemini 응답 데이터:", data); // F12 콘솔창 확인용

      // ! API 키 오류나 404 에러 시 뻗지 않고 화면에 메시지 띄움
      if (!response.ok || data.error) {
        setAiInsight(
          `앗! AI 서버 통신에 문제가 생겼어요.\n(API 키를 다시 확인하거나 잠시 후 시도해주세요!)`,
        );
        return;
      }

      // AI가 응답한 텍스트만 빼오기
      const resultText = data.candidates[0].content.parts[0].text;
      setAiInsight(resultText);
    } catch (error) {
      console.error("AI 분석 실패:", error);
      setAiInsight(
        "AI 분석 중 서버 통신에 오류가 발생했어요. 다시 시도해주세요!",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };
  // 1. 평균 지출 계산 함수(전체 비용 / 기록 개수)
  const avgCost =
    savedRecords.length > 0
      ? Math.round(
          savedRecords.reduce((acc, cur) => acc + Number(cur.cost), 0) /
            savedRecords.length,
        )
      : 0;

  // 2. 가장 많이 등장한 단어(최빈값) 찾아주는 함수
  const getTopItem = (arr) => {
    if (arr.length === 0) return "-";
    const counts = arr.reduce((acc, val) => {
      if (val) acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    if (Object.keys(counts).length === 0) return "-";
    // 개수가 가장 많은 키(단어)를 반환
    return Object.keys(counts).reduce((a, b) =>
      counts[a] > counts[b] ? a : b,
    );
  };

  // 3. 자주 방문한 지역 (주소에서 '구' 단위 추출. 예: "부산 해운대구 우동 -> 해운대구")
  const regions = savedRecords
    .map((r) => {
      if (!r.address) return null;
      const parts = r.address.split(" ");
      return parts.length > 1 ? parts[1] : parts[0];
    })
    .filter(Boolean);

  const topRegion = getTopItem(regions);

  // 4. 최다 방문 카테고리 (예: "카페", "음식점")
  const categories = savedRecords.map((r) => r.category).filter(Boolean);

  // 카테고리 이름이 길면 첫 번째 항목만 자르기 (예: "음식점 > 한식" -> "음식점")
  const formattedCategories = categories.map((c) => c.split(" > ")[0]);
  const topCategory = getTopItem(formattedCategories);

  const profileColor = localStorage.getItem("profileColor") || "#e50914";

  /* 4. AI 요약 대시보드 화면 렌더링 부분 */
  return (
    <div
      style={{
        padding: "20px 20px 85px 20px", // 하단 탭 가림 방지
        height: "100%",
        overflowY: "auto",
        background: "#f0f0f0",
        boxSizing: "border-box",
        display: "flex", //세로 배치
        flexDirection: "column", //위에서 아래로 정렬
      }}
    >
      <h2 style={{ borderBottom: "2px solid #e50914", paddingBottom: 10 }}>
        요약 대시보드
      </h2>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: "20px",
          background: "white",
          padding: 20,
          borderRadius: 15,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        {/* 왼쪽 프로필 아이콘 (간단히 이모지로 대체) */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 100,
              height: 100,
              background: profileColor,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem",
              margin: "0 auto 10px auto",
              fontWeight: "bold",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          >
            {currentProfile ? currentProfile.charAt(0) : "P"}
          </div>
          <h3 style={{ marginTop: 15, marginBottom: 5 }}>
            {currentProfile} 님
          </h3>
          <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
            총 {savedRecords.length}개의 추억
          </p>
        </div>

        {/* 오른쪽 인사이트 영역 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: "0 0 10px 0" }}>AI 추억 인사이트</h3>
          <div
            style={{
              minHeight: "80px",
              lineHeight: "1.6",
              color: "#333",
              marginBottom: 20,
              background: "#f4f7f8",
              padding: "15px",
              borderRadius: "10px",
            }}
          >
            {!aiInsight ? (
              <button
                onClick={analyzeWithGemini} // AI 함수 연결
                style={{
                  padding: "10px 20px",
                  background: "rgb(86, 145, 255)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
                disabled={isAnalyzing} // 분석 중일 땐 버튼 여러 번 못 누르게 막기
              >
                {isAnalyzing
                  ? "Gemini AI가 데이터를 분석 중입니다... "
                  : "요약하기"}
              </button>
            ) : (
              <p
                style={{
                  whiteSpace: "pre-wrap",
                  margin: 0,
                  fontSize: "14px",
                }}
              >
                {aiInsight}
              </p>
            )}
          </div>

          {/* 하단 3개 네이비색 카드 */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              width: "100%",
              marginTop: "auto",
            }}
          >
            {[
              {
                title: "자주 방문한 지역",
                value: topRegion,
              },
              {
                title: "평균 지출",
                value: `${avgCost.toLocaleString()}원`,
              },
              { title: "최다 방문 카테고리", value: topCategory },
            ].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  flex: isMobile ? "1 1 45%" : 1,
                  background: "#0b1031",
                  color: "white",
                  padding: "15px 10px",
                  borderRadius: 10,
                  textAlign: "center",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#aaa",
                    marginBottom: 8,
                  }}
                >
                  {stat.title}
                </div>
                <div style={{ fontSize: "15px", fontWeight: "bold" }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
