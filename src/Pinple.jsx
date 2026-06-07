// src/Pinple.jsx
import { useState, useEffect } from "react";
import {
  Map,
  MapMarker,
  CustomOverlayMap,
  ZoomControl,
} from "react-kakao-maps-sdk";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import firebase from "firebase/compat/app";
import { db } from "./components/firebase";

export default function Pinple({ currentProfile, setProfile }) {
  const [activeTab, setActiveTab] = useState("map");
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [savedRecords, setSavedRecords] = useState([]);
  // AI 대시보드 상태
  const [aiInsight, setAiInsight] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

      // ! API 키 오류나 404 에러 시 뻗지 않고 화면에 메시지 띄움!
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

  // 모달(입력창) 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [date, setDate] = useState("");
  const [cost, setCost] = useState("");
  const [memo, setMemo] = useState("");
  // (열려있는 말풍선 ID 기억하기)
  const [openMarkerId, setOpenMarkerId] = useState(null);

  // 1. 파이어베이스에서 내 기록 불러오기
  const fetchRecords = () => {
    db.collection("diary_records")
      .where("profileName", "==", currentProfile)
      .get()
      .then((snapshot) => {
        const records = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // 최신순 정렬
        records.sort((a, b) => new Date(b.date) - new Date(a.date));
        setSavedRecords(records);
      });
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile]);

  // 2. 카카오맵 장소 검색
  const searchPlaces = (e) => {
    e?.preventDefault();
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services)
      return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(keyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(data);
      } else {
        alert("검색 결과가 없습니다.");
      }
    });
  };

  // 3. 데이터 저장
  const handleSave = () => {
    if (!date || !cost || !memo) return alert("항목을 모두 입력해주세요!");

    db.collection("diary_records")
      .add({
        profileName: currentProfile,
        placeName: selectedPlace.place_name,
        lat: selectedPlace.y,
        lng: selectedPlace.x,
        date,
        cost,
        memo,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        alert("저장되었습니다!");
        setIsModalOpen(false);
        setDate("");
        setCost("");
        setMemo("");
        fetchRecords(); // 저장 후 목록 갱신! (새로고침 불필요)
      });
  };

  // 필터링: 저장된 장소는 검색 결과(파란 핀)에서 빼기
  const savedNames = savedRecords.map((r) => r.placeName);
  const filteredPlaces = searchResults.filter(
    (p) => !savedNames.includes(p.place_name),
  );

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* 상단 헤더 */}
      <div
        style={{ padding: "10px", textAlign: "center", position: "relative" }}
      >
        <h1 style={{ margin: "10px 0", fontWeight: "bold" }}>
          <span style={{ color: "red" }}>M</span>APFLIX
        </h1>
        <h3>장소를 검색하고 기록을 추가하세요.</h3>
        <button
          onClick={() => {
            localStorage.removeItem("currentProfile");
            setProfile(null);
          }}
          style={{ position: "absolute", top: 15, right: 15 }}
        >
          프로필 변경
        </button>
      </div>

      {/* 탭 내용 영역 */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* 🗺️ 1. 지도 탭 */}
        {activeTab === "map" && (
          <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <Map
              center={{ lat: 35.1595, lng: 129.1602 }}
              style={{ width: "100%", height: "100%" }}
              level={9}
            >
              {/* 줌 컨트롤러 추가 */}
              <ZoomControl
                position={window.kakao.maps.ControlPosition.RIGHT}
              ></ZoomControl>
              {/* 내 저장 기록 (빨간 핀) */}
              {savedRecords.map((record) => (
                <MapMarker
                  key={record.id}
                  position={{ lat: record.lat, lng: record.lng }}
                  image={{
                    src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
                    size: { width: 31, height: 35 },
                  }}
                  onClick={() => setOpenMarkerId(record.id)} // 💡 클릭하면 alert 대신 ID를 저장!
                />
              ))}

              {/*  클릭하면 뜨는 말풍선 (CustomOverlayMap) */}
              {savedRecords.map(
                (record) =>
                  openMarkerId === record.id && (
                    <CustomOverlayMap
                      key={`overlay-${record.id}`}
                      position={{ lat: record.lat, lng: record.lng }}
                      yAnchor={1.3} // 마커 살짝 위쪽으로 띄우기
                    >
                      <div
                        style={{
                          padding: "10px",
                          background: "white",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                          minWidth: "120px",
                        }}
                      >
                        <strong
                          style={{
                            display: "block",
                            color: "#000000",
                            marginBottom: "5px",
                          }}
                        >
                          {record.placeName}
                        </strong>
                        <span style={{ fontSize: "13px" }}>{record.date}</span>
                        <br />
                        <br />
                        <span style={{ fontSize: "13px" }}>
                          🧾 {record.cost}원
                        </span>
                        <br />
                        <span style={{ fontSize: "12px", color: "gray" }}>
                          📝 {record.memo}
                        </span>
                        <br />
                        <button
                          onClick={() => setOpenMarkerId(null)}
                          style={{
                            marginTop: "8px",
                            padding: "3px 10px",
                            border: "none",
                            background: "#eee",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          닫기
                        </button>
                      </div>
                    </CustomOverlayMap>
                  ),
              )}

              {/* 검색 결과 (기본 파란 핀) */}
              {filteredPlaces.map((place, i) => (
                <MapMarker
                  key={i}
                  position={{ lat: place.y, lng: place.x }}
                  onClick={() => {
                    setSelectedPlace(place);
                    setIsModalOpen(true);
                  }}
                />
              ))}
            </Map>

            {/* 좌측 검색창 */}
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 2,
                background: "rgba(255,255,255,0.9)",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
            >
              <form
                onSubmit={searchPlaces}
                style={{ display: "flex", gap: "8px" }}
              >
                <input
                  placeholder="장소 검색.."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  style={{
                    padding: "6px",
                  }}
                  size="12"
                />
                <button type="submit">검색</button>
              </form>
              <ul
                style={{
                  maxHeight: 300,
                  overflowY: "auto",
                  paddingLeft: 0,
                  marginTop: 10,
                }}
              >
                {filteredPlaces.map((p, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setSelectedPlace(p);
                      setIsModalOpen(true);
                    }}
                    style={{
                      cursor: "pointer",
                      borderBottom: "1px solid #ccc",
                      padding: "5px 0",
                    }}
                  >
                    {p.place_name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ⏳ 2. 타임라인 탭 */}
        {activeTab === "timeline" && (
          <div
            style={{
              padding: "20px 20px 85px 20px",
              overflowY: "auto",
              height: "100%",
              boxSizing: "border-box",
              background: "#f9f9f9",
            }}
          >
            <h2
              style={{ borderBottom: "2px solid #e50914", paddingBottom: 10 }}
            >
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
                <div style={{ fontWeight: "bold", fontSize: 16 }}>
                  {r.placeName}
                </div>
                <br />
                <div>💰 {r.cost}원</div>
                <div style={{ color: "#555", marginTop: 5 }}>📝 {r.memo}</div>
              </div>
            ))}
          </div>
        )}

        {/* 📅 3. 캘린더 탭 */}
        {activeTab === "calendar" && (
          <div style={{ padding: 20, height: "100%", overflowY: "auto" }}>
            <div
              style={{
                maxWidth: 800,
                margin: "0 auto",
                background: "white",
                padding: 20,
                borderRadius: 10,
              }}
            >
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={savedRecords.map((r) => ({
                  title: `${r.placeName} (${r.cost}원)`,
                  start: r.date,
                  color: "#180085",
                }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* 📊 4. AI 요약 대시보드 탭 */}
      {activeTab === "dashboard" && (
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
                  background: "#f9dcdc",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem",
                  margin: "0 auto 10px auto",
                }}
              >
                추가 예정
              </div>
            </div>

            {/* 오른쪽 인사이트 영역 */}
            <div style={{ flex: 1, display:"flex", flexDirection:"column" }}>
              <h3 style={{ margin: "0 0 10px 0" }}>AI 추억 인사이트</h3>
              <div
                style={{
                  minHeight: "80px",
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: 20,
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
                  <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6", fontSize:"16px"}}>
                    {aiInsight}
                  </p>
                )}
              </div>

              {/* 하단 3개 네이비색 카드 */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  width: "100%",
                  marginTop: "auto",
                }}
              >
                {[
                  {
                    title: "자주 방문한 지역",
                    // value:
                    //   savedRecords.length > 0
                    //     ? savedRecords[0].placeName.split(" ")[0]
                    //     : "-",
                    value: "추가 예정",
                  },
                  {
                    title: "평균 지출",
                    // value:
                    //   savedRecords.length > 0
                    //     ? `${Math.round(savedRecords.reduce((acc, cur) => acc + Number(cur.cost), 0) / savedRecords.length).toLocaleString()}원`
                    //     : "0원",
                    value: "추가 예정",
                  },
                  { title: "최다 방문 카테고리", value: "추가 예정" },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
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
                        fontSize: "11px",
                        color: "#aaa",
                        marginBottom: 8,
                      }}
                    >
                      {stat.title}
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 모달창 (저장 UI) */}
      {isModalOpen && (
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
      )}

      {/* 하단 탭 내비게이션 */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 65,
          minHeight: 65 /* 최소 높이 65px로 고정 */,
          flexShrink: 0 /* 위에서 내용이 길어져도 안 찌그러짐 */,
          display: "flex",
          borderTop: "1px solid #e0e0e0",
          background: "white",
          zIndex: 9999,
        }}
      >
        {["map", "timeline", "calendar", "dashboard"].map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: activeTab === tab ? "#e50914" : "#888",
              fontWeight: activeTab === tab ? "bold" : "normal",
            }}
          >
            {/* 아이콘 추가 예정 */}
            <span style={{ fontSize: 12 }}>
              {tab === "map"
                ? "지도"
                : tab === "timeline"
                  ? "타임라인"
                  : tab === "calendar"
                    ? "캘린더"
                    : "대시보드"}
            </span>
          </div>
        ))}
      </nav>
    </div>
  );
}
