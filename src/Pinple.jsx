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

import MapTab from "./components/MapTab";
// import TimelineTab from "./components/TimelineTab"; 아직 생성x
// import CalendarTab from "./components/CalendarTab";
import DashboardTab from "./components/DashboardTab";
// import RecordModal from "./components/RecordModal";

export default function Pinple({ currentProfile, setProfile }) {
  const [activeTab, setActiveTab] = useState("map");
  const [savedRecords, setSavedRecords] = useState([]);

  // 모달(입력창) 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [date, setDate] = useState("");
  const [cost, setCost] = useState("");
  const [memo, setMemo] = useState("");

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

  //지워졌던 handlesave함수 복구(나중에 모달창 쪼갤때 가져감)
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
        fetchRecords(); 
      });
  };

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

{/* {중앙 탭 내용 영역} */}
<div style={{flex: 1, position: "relative", overflow: "hidden"}}>

{/* {1. 분리한 MapTab 부품 끼워넣기} */}
{activeTab === "map" &&(
  <MapTab
  savedRecords={savedRecords}
  setSelectedPlace={setSelectedPlace}
  setIsModalOpen={setIsModalOpen}
  />
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
        <div
          style={{
            padding: "20px 20px 85px 20px",
            height: "100%",
            overflowY: "auto",
            background: "#f0f0f0",
          }}
        >
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

      {/* {4. 분리한 DashboardTab 부품 끼워넣기 */}
      { activeTab === "dashboard" && (
        <DashboardTab
        savedRecords={savedRecords}
        currentProfile={currentProfile}
        />
      )}

      </div> 

  /* 모달창 (저장 UI) */
  {
    isModalOpen && (
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

  {
    /* 하단 탭 내비게이션 */
  }
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
