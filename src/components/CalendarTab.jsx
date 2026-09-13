// src/components/CalendarTab.jsx

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction"; // 날짜 클릭 감지용 플러그인
import DetailModal from "./DetailModal";
import { db } from "./firebase";
import koLocale from "@fullcalendar/core/locales/ko";
import { useDiaryStore } from "../store/useDiaryStore";
import { formatDate } from "../utils";

export default function CalendarTab({ setEditingRecord, setIsModalOpen }) {
  // 클릭한 날짜와 리스트에서 클릭한 기록 담아둘 상태
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const savedRecords = useDiaryStore((s) => s.savedRecords);
  const fetchRecords = useDiaryStore((s) => s.fetchRecords);

  // 같은 날짜에 기록이 여러개여도, 달력에는 '빨간 점' 하나만 찍히도록 표시 (날짜 중복 제거)
  const uniqueDates = [...new Set(savedRecords.map((r) => r.date))];

  // Fullcalendar에 넘겨줄 이벤트 데이터 형식으로 변환
  const events = uniqueDates.map((date) => ({
    start: date,
    allDay: true, // 하루 종일 (시간 표시 안함)
    backgroundColor: "transparent", // 투명하게
    borderColor: "transparent",
  }));

  // 빨간 점 렌더링
  const renderEventContent = () => {
    return (
      <div
        style={{
          width: "6px",
          height: "6px",
          background: "#e50914",
          borderRadius: "50%",
          margin: "2px auto 0", // 가운데 정렬
        }}
      ></div>
    );
  };

  // 선택한 날짜에 해당하는 기록만 뽑기
  const filteredRecords = selectedDate
    ? savedRecords.filter((r) => r.date === selectedDate)
    : [];

  const handleDelete = (id) => {
    if (window.confirm("정말 이 기록을 삭제할까요?")) {
      db.collection("diary_records")
        .doc(id)
        .delete()
        .then(() => {
          alert("삭제되었습니다.");
          fetchRecords();
        });
    }
  };

  return (
    <div
      style={{
        padding: "20px 20px 85px 20px",
        height: "100%",
        overflowY: "auto",
        background: "#f0f0f0",
        boxSizing: "border-box",
      }}
    >
      {/* --- 상단: 캘린더 영역 --- */}
      <style>{`
        /* 달력 헤더(월, 요일) 폰트 크기 및 색상 */
        .fc .fc-toolbar-title { font-size: 1.2rem !important; font-weight: bold; }
        .fc-col-header-cell-cushion { color: #333 !important; font-size: 14px; padding: 10px 0 !important; }
        
        /* 날짜 숫자 가운데 정렬 및 여백 축소 */
        .fc .fc-daygrid-day-top { justify-content: center; margin-top: 5px; }
        .fc-daygrid-day-number { font-size: 14px !important; color: #333 !important; }
        
        /* 달력 칸(셀) 높이 콤팩트하게 압축 */
        .fc .fc-daygrid-day-frame { min-height: 50px !important; }
        .fc .fc-daygrid-day-events { margin: 0 !important; }
        
        /* 이번 달이 아닌 날짜 배경색을 사진처럼 은은하게 */
        .fc-day-other { background-color: #f4f7f8 !important; }
        
        /* 테두리 색상 연하게 */
        .fc-theme-standard td, .fc-theme-standard th { border-color: #eaeaea !important; }
        
        /* 오늘 날짜 하이라이트 배경색 수정 */
        .fc .fc-day-today { background-color: #fff0f0 !important; }
      `}</style>

      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          background: "white",
          padding: 15,
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.85)",
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={koLocale}
          events={events}
          eventContent={renderEventContent} // 빨간 점
          dateClick={(info) => {
            // 날짜를 클릭했을 때 아래 리스트 열기
            // 이미 열려있는 날짜를 또 누르면 접히고, 아니면 열림 (토글)
            setSelectedDate((prev) =>
              prev === info.dateStr ? null : info.dateStr,
            );
          }}
          height="auto" // 달력 자체 스크롤 방지
          headerToolbar={{
            left: "prev",
            center: "title",
            right: "next",
          }}
        />
      </div>

      {/* --- 하단: 날짜 클릭 시 나타나는 리스트 영역 --- */}
      {selectedDate && (
        <div
          style={{ marginTop: "30px", maxWidth: 800, margin: "30px auto 0" }}
        >
          <h3
            style={{
              borderBottom: "2px solid #e50914",
              paddingBottom: "10px",
              marginTop: 0,
            }}
          >
            {formatDate(selectedDate)} 기록
          </h3>

          {filteredRecords.length === 0 ? (
            <p
              style={{ color: "#888", textAlign: "center", padding: "20px 0" }}
            >
              이 날은 기록이 없네요!
            </p>
          ) : (
            filteredRecords.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRecord(r)} // 카드 누르면 상세 모달창으로 연결
                style={{
                  marginBottom: 15,
                  padding: "15px 20px",
                  background: "white",
                  borderRadius: 8,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  borderLeft: "5px solid #e50914",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold", fontSize: 16 }}>
                    {r.placeName}
                  </div>
                  <div
                    style={{
                      color: "#888",
                      marginTop: 5,
                      fontSize: 13,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "200px",
                    }}
                  >
                    {r.memo}
                  </div>
                </div>
                <div style={{ fontWeight: "bold", color: "#333" }}>
                  💰 {r.cost}원
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- 상세 모달창 (지도/타임라인과 동일하게 연동) --- */}
      {selectedRecord && (
        <DetailModal
          record={
            savedRecords.find((r) => r.id === selectedRecord.id) ||
            selectedRecord
          }
          onClose={() => setSelectedRecord(null)}
          onEdit={(record) => {
            setEditingRecord(record);
            setIsModalOpen(true);
          }}
          onDelete={(id) => {
            handleDelete(id);
            setSelectedRecord(null);
          }}
        />
      )}
    </div>
  );
}
