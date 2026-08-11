// src/components/TimelineTab.jsx

import { useState } from "react";
import { db } from "./firebase";
import DetailModal from "./DetailModal";

export default function TimelineTab({ savedRecords, fetchRecords }) {
  // 체크된 기록들 ID 모아둘 배열 상태
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteMode, setIsdeleteMode] = useState(false);

  // 몇 번째 카드인지 번호를 기억하는 상태로 변경
  const [selectedIndex, setSelectedIndex] = useState(null);

  // 체크박스 누를 때 마다 넣었다 뺐다 하는 함수
  const handleToggle = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        // 이미 있으면 뺀다 (선택 해제)
        return prev.filter((item) => item !== id);
      } else {
        // 없으면 넣는다 (선택)
        return [...prev, id];
      }
    });
  };

  const toggleDeleteMode = () => {
    setIsdeleteMode(!isDeleteMode); // 스위치 반전
    setSelectedIds([]); // 모드가 바뀔 땐 장바구니 초기화
  };

  const handleBulkDelete = async () => {
    // 아무것도 안 고르고 누르면 튕김
    if (selectedIds.length === 0) {
      return alert("삭제할 기록을 먼저 선택해주세요!");
    }

    if (window.confirm("정말 ${selectedIds.length}개의 기록을 삭제할까요?")) {
      try {
        // 선택된 ID 배열을 돌면서 firebase에 삭제 요청
        await Promise.all(
          selectedIds.map((id) =>
            db.collection("diary-records").doc(id).delete(),
          ),
        );

        alert("선택한 기록이 모두 삭제되었습니다!");
        setSelectedIds([]); // 삭제 끝나면 비우기
        fetchRecords(); // 부모(App)에게 새로고침 요청 후 화면 갱신
      } catch (error) {
        console.error("삭제 중 오류 발생", error);
        alert("삭제 중 문제가 발생했습니다.");
      }
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("정말 이 기록을 삭제할까요?")) {
      db.collection("diary_records")
        .doc(id)
        .delete()
        .then(() => {
          alert("삭제되었습니다.");
          fetchRecords(); // 부모 새로고침 요청
        });
    }
  };

  /* ⏳ 2. 타임라인 탭 */
  return (
    <div
      style={{
        padding: "20px 20px 85px 20px",
        overflowY: "auto",
        height: "100%",
        boxSizing: "border-box",
        background: "#f9f9f9",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #e50914",
          padding: 10,
          marginBottom: 15,
        }}
      >
        <h2 style={{ margin: 0 }}>내 기록 타임라인</h2>

        {/* 삭제 모드 스위치에 따라 우측 상단 버튼 다르게 보임 */}
        <div>
          {!isDeleteMode ? (
            // 평소 모드일 때: 삭제 모드로 진입하는 버튼만 보임
            <button
              onClick={toggleDeleteMode}
              style={{
                background: "#eee",
                color: "black",
                border: "none",
                padding: "6px 12px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              선택 삭제
            </button>
          ) : (
            // 삭제 모드일 때: '취소'와 '삭제' 버튼 2개 보임
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={toggleDeleteMode}
                style={{
                  background: "#888",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
              <button
                onClick={handleBulkDelete}
                style={{
                  // 선택된 게 1개라도 있으면 빨간색, 0개면 회색
                  background: selectedIds.length > 0 ? "#e50914" : "#ccc",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "5px",
                  // 선택된 게 없으면 마우스 커서도 금지 모양으로 바꿈
                  cursor: selectedIds.length > 0 ? "pointer" : "not-allowed",
                  fontWeight: "bold",
                }}
                disabled={selectedIds.length === 0} // 0개일 땐 아예 클릭 안먹히게
              >
                삭제하기 ({selectedIds.length})
              </button>
            </div>
          )}
        </div>
      </div>
      {savedRecords.map((r, index) => (
        <div
          key={r.id}
          style={{
            position: "relative", // 버튼 우측 상단에 띄우기 위해 추가
            marginBottom: 15,
            padding: 10,
            background:
              isDeleteMode && selectedIds.includes(r.id) ? "#ffe6e6" : "white",
            borderRadius: 8,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "flex-start",
            gap: "15px",
            cursor: "pointer",
          }}
          // 체크박스 맞추기 힘드니까 카드 자체를 클릭해도 체크되도록
          onClick={() => {
            if (isDeleteMode) {
              handleToggle(r.id); // 삭제 모드일 땐 체크박스 껐다 켜기
            } else {
              //일반 모드일 땐 모달창 띄우기
              setSelectedIndex(index);
            }
          }}
        >
          {/* 개별 삭제 버튼 대신 체크박스 넣기 */}
          {isDeleteMode && (
            <input
              type="checkbox"
              checked={selectedIds.includes(r.id)} // 내 ID가 장바구니에 있으면 체크 표시
              readOnly // 모양만 보여줌
              style={{
                marginTop: "5px",
                transform: "scale(1.5)",
                cursor: "pointer",
              }}
            />
          )}

          {/* 기록 내용들 */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "gray" }}>{r.date}</div>
            <div style={{ fontWeight: "bold", fontSize: 16 }}>
              {r.placeName}
            </div>
            <br />
            <div>💰 {r.cost}원</div>
            <div style={{ color: "#555", marginTop: 5 }}>📝 {r.memo}</div>
          </div>
        </div>
      ))}
      {selectedIndex !== null && (
        <DetailModal
          record={savedRecords[selectedIndex]} // 번호에 맞는 데이터를 뽑아서 전달
          onClose={() => setSelectedIndex(null)}
          // 이전 버튼 누르면 번호를 1 빼기 (첫 카드면 맨 끝으로 이동)
          onPrev={() =>
            setSelectedIndex((prev) =>
              prev > 0 ? prev - 1 : savedRecords.length - 1,
            )
          }
          // 다음 버튼 누르면 번호를 1 더하기 (끝 카드면 맨 처음으로 이동)
          onNext={() =>
            setSelectedIndex((prev) =>
              prev < savedRecords.length - 1 ? prev + 1 : 0,
            )
          }
        />
      )}
    </div>
  );
}
