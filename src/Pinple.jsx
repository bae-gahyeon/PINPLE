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
import Chatbot from "./components/Chatbot";
import { useDiaryStore } from "./store/useDiaryStore";

export default function Pinple({ currentProfile, setProfile, onLogout, uid }) {
  // 수정할 기록 담아둘 상태
  const [editingRecord, setEditingRecord] = useState(null);

  const [activeTab, setActiveTab] = useState("map");

  // 모달(입력창) 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // 지도 안에서만 사용되는 상태들
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [aiData, setAiData] = useState(null);

  const handleAiParsed = (parsedData, place) => {
    setSelectedPlace(place); // 검색된 정확한 지점 데이터 세팅
    setAiData(parsedData); // AI가 뽑아준 날짜, 금액, 메모 세팅
    setIsModalOpen(true); // 기록 모달창 오픈
  };

  const setUser = useDiaryStore((s) => s.setUser);
  const fetchRecords = useDiaryStore((s) => s.fetchRecords);
  const periodFilter = useDiaryStore((s) => s.periodFilter);
  const setPeriodFilter = useDiaryStore((s) => s.setPeriodFilter);

  // 모바일 화면 감지 상태 추가
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // 드롭다운 열림/닫힘 상태 추가
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setUser(uid, currentProfile) // 스토어에 먼저 넣어주기
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile, uid]); // uid 추가

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const profileColor = localStorage.getItem("profileColor") || "e50914";

  // 드롭다운 메뉴 버튼 부품
  const DropdownItem = ({ icon, text, onClick, isLast }) => (
    <button
      onClick={onClick}
      style={{
        padding: "15px",
        background: "transparent",
        border: "none",
        textAlign: "left",
        cursor: "pointer",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        color: "#333",
        borderBottom: isLast ? "none" : "1px solid #eee", // 마지막 칸은 밑줄 빼
      }}
    >
      {icon} {text}
    </button>
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
        style={{
          padding: isMobile ? "5px" : "10px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <h1
          style={{
            margin: isMobile ? "5px 0 " : "10px 0",
            fontSize: isMobile ? "24px" : "2em", // 로고 크기 축소
            fontWeight: "bold",
          }}
        >
          <span style={{ color: "red" }}>M</span>APFLIX
        </h1>

        <h3
          style={{
            fontSize: isMobile ? "13px" : "1.17em",
            margin: isMobile ? "5px 0" : "1em 0",
          }}
        >
          안녕하세요, {currentProfile}님! 장소를 검색하고 기록을 추가하세요.
        </h3>

        {activeTab !== "calendar" && (
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            style={{
              marginTop: 8,
              padding: "6px 10px",
              borderRadius: 20,
              border: "1px solid #ddd",
              fontSize: 13,
              background: "white",
            }}
          >
            <option value="all">전체 기간</option>
            <option value="1m">최근 1개월</option>
            <option value="6m">최근 6개월</option>
          </select>
        )}

        <div
          style={{
            position: "absolute",
            top: isMobile ? 10 : 15,
            right: isMobile ? 10 : 15,
          }}
        >
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              width: isMobile ? "32px" : "40px",
              height: isMobile ? "32px" : "40px",
              borderRadius: "4px",
              background: profileColor,
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              fontSize: isMobile ? "16px" : "20px",
              cursor: "pointer",
            }}
          >
            {currentProfile ? currentProfile.charAt(0) : "P"}
          </div>

          {/* 2. 드롭다운 메뉴 */}
          {isDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: isMobile ? "40px" : "50px",
                right: 0,
                width: "180px",
                background: "white",
                color: "#333",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)", // 세련된 은은한 그림자
                border: "1px solid #ddd", // 연한 회색 테두리
                display: "flex",
                flexDirection: "column",
                zIndex: 10000,
                borderRadius: "8px",
              }}
            >
              <DropdownItem
                icon="🔄"
                text="프로필 전환"
                onClick={() => setProfile(null)}
              />
              <DropdownItem
                icon="⚙️"
                text="설정"
                onClick={() => alert("설정 열기")}
              />
              <DropdownItem
                icon="🌙"
                text="다크 모드"
                onClick={() => alert("다크모드 전환")}
              />
              <DropdownItem
                icon="❓"
                text="고객 센터"
                onClick={() => alert("고객센터 연결")}
                isLast={true}
              />
              <DropdownItem
                icon="🚪"
                text="로그아웃"
                onClick={onLogout}
                isLast={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* {중앙 탭 내용 영역} */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* {1. 분리한 MapTab 부품 끼워넣기} */}
        {activeTab === "map" && (
          <MapTab
            setSelectedPlace={setSelectedPlace}
            setIsModalOpen={setIsModalOpen}
            selectedPlace={selectedPlace}
            keyword={keyword}
            setKeyword={setKeyword}
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            // 맵에서도 모달창 열기
            setEditingRecord={setEditingRecord}
          />
        )}

        {/* ⏳ 2. 타임라인 탭 */}
        {activeTab === "timeline" && (
          <TimelineTab
            // 타임라인에서도 모달창 열기
            setEditingRecord={setEditingRecord}
            setIsModalOpen={setIsModalOpen}
          />
        )}

        {/* 📅 3. 캘린더 탭 부품 */}
        {activeTab === "calendar" && (
          <CalendarTab
            setEditingRecord={setEditingRecord}
            setIsModalOpen={setIsModalOpen}
          />
        )}

        {/* {4. 분리한 DashboardTab 부품 끼워넣기 */}
        {activeTab === "dashboard" && (
          <DashboardTab currentProfile={currentProfile} />
        )}
      </div>
      {/* 모달창 (저장 UI) */}
      {isModalOpen && (
        <RecordModal
          selectedPlace={selectedPlace}
          setIsModalOpen={setIsModalOpen}
          setSelectedPlace={setSelectedPlace}
          currentProfile={currentProfile}
          setKeyword={setKeyword}
          setSearchResults={setSearchResults}
          // 수정모드 상태 전달
          editingRecord={editingRecord}
          setEditingRecord={setEditingRecord}
          aiData={aiData}
          setAiData={setAiData}
          uid={uid} // uid 추가
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
            <span style={{ fontSize: 18 }}>
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
      <Chatbot currentProfile={currentProfile} onAiParsed={handleAiParsed} />
    </div>
  );
}
