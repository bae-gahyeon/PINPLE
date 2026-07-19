// src/Pinple.jsx
import { useState, useEffect } from "react";
import {
  Map,
  MapMarker,
  CustomOverlayMap,
  ZoomControl,
} from "react-kakao-maps-sdk";

import firebase from "firebase/compat/app";
import { db } from "./components/firebase";

import MapTab from "./components/MapTab";
import TimelineTab from "./components/TimelineTab";
import CalendarTab from "./components/CalendarTab";
import DashboardTab from "./components/DashboardTab";
import RecordModal from "./components/RecordModal";
import RecordModal from "./components/RecordModal";

export default function Pinple({ currentProfile, setProfile }) {
  const [activeTab, setActiveTab] = useState("map");
  const [savedRecords, setSavedRecords] = useState([]);

  // 모달(입력창) 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

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
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* {1. 분리한 MapTab 부품 끼워넣기} */}
        {activeTab === "map" && (
          <MapTab
            savedRecords={savedRecords}
            setSelectedPlace={setSelectedPlace}
            setIsModalOpen={setIsModalOpen}
          />
        )}

        {/* ⏳ 2. 타임라인 탭 */}
        {activeTab === "timeline" && (
          <TimelineTab savedRecords={savedRecords} />
        )}

        {/* 📅 3. 캘린더 탭 부품 */}
        {activeTab === "calendar" && (
          <CalendarTab savedRecords={savedRecords} />
        )}

        {/* {4. 분리한 DashboardTab 부품 끼워넣기 */}
        {activeTab === "dashboard" && (
          <DashboardTab
            savedRecords={savedRecords}
            currentProfile={currentProfile}
          />
        )}
      </div>
      /* 모달창 (저장 UI) */
      {isModalOpen && (
        <RecordModal
          selectedPlace={selectedPlace}
          setIsModalOpen={setIsModalOpen}
          currentProfile={currentProfile}
          fetchRecords={fetchRecords}
        />
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
