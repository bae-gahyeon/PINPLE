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
              level={8}
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
          <div style={{ padding: "20px 20px 85px 20px", height: "100%", overflowY: "auto", background: "#f0f0f0"}}>
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
