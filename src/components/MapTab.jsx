// src/components/MapTab.jsx
import { act, useEffect, useState } from "react";
// DetailModal 부품 불러오기
import DetailModal from "./DetailModal";

import {
  Map,
  MapMarker,
  CustomOverlayMap,
  ZoomControl,
} from "react-kakao-maps-sdk";
import { db } from "./firebase";

export default function MapTab({
  savedRecords,
  setSelectedPlace,
  setIsModalOpen,
  selectedPlace,
  fetchRecords,
  // Pinple에서 받아옴
  keyword,
  setKeyword,
  searchResults,
  setSearchResults,
  setEditingRecord,
}) {
  // PC vs 모바일 화면 감지 상태
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // 모바일에서 리스트 열기/닫기 토글 상태
  const [isListOpen, setIsListOpen] = useState(true);

  //화면 크기가 바뀔 때마다 isMobile 상태 업데이트
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // (열려있는 말풍선 ID 기억하기)
  const [openMarkerId, setOpenMarkerId] = useState(null);

  //지도 중심 좌표 관리하는 상태(기본값: 부산 해운대)
  const [mapCenter, setMapCenter] = useState({ lat: 35.1595, lng: 129.1602 });

  // 2. 카카오맵 장소 검색
  const searchPlaces = (e) => {
    e?.preventDefault();
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services)
      return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(keyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(data);
        setIsListOpen(true);
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

  // 현재 눌린 탭 기억
  const [activeTab, setActiveTab] = useState("ALL");

  // 선택된 탭에 따라 보여줄 기록만 필터링
  const visibleRecords =
    activeTab === "ALL"
      ? savedRecords
      : savedRecords.filter((record) => {
          // 카테고리 정보가 아예 없으면 통과 X
          if (!record.category) return false;

          // 식당 탭 눌렀을 때 '음식점'은 포함, '카페'는 빼기
          if (activeTab === "음식점") {
            return (
              record.category.includes("음식점") &&
              !record.category.includes("카페")
            );
          }

          if (activeTab === "문화시설") {
            return record.category.includes("문화");
          }

          if (activeTab === "관광명소") {
            return (
              record.category.includes("관광") ||
              (record.category.includes("여행") &&
                !record.category.includes("숙박"))
            );
          }

          if (activeTab === "숙박") {
            return record.category.includes("숙박");
          }

          return record.category.includes(activeTab);
        });

  // 클릭한 마커 데이터 담아둘 상태
  const [selectedRecord, setSelectedRecord] = useState(null);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* 텅 빈 지도 안내창(기록이 없을때만) */}
      {savedRecords.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(229, 9,20,0.9)",
            color: "white",
            padding: "12px 24px",
            borderRadius: "30px",
            fontSize: "15px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            zIndex: 999,
            textAlign: "center",
          }}
        >
          아직 기록한 곳이 없네요! <br /> 왼쪽 검색창에서 첫 장소를 찾아볼까요?
        </div>
      )}

      {/* 카테고리 필터링: 검색 결과가 없고, 검색어도 비어있을때만 등장 */}
      {searchResults.length === 0 && !keyword && (
        <div
          style={{
            position: "absolute",
            top: isMobile ? "70px" : "10px", //안내창이나 다른 요소와 안 겹치게 간격 확보
            left: isMobile ? "50%" : "auto",
            right: isMobile ? "10px" : "45px",
            transform: isMobile ? "translateX(-50%)" : "none",
            zIndex: 10,
            display: "flex",
            gap: "10px",
            background: "rgba(255,255,255,0.9)",
            padding: "10px 15px",
            borderRadius: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",

            // 모바일 가로 스크롤
            width: "max-content",
            maxWidth: isMobile ? "calc(100%- 20px)" : "calc(100vw - 300px)",
            overflow: "auto", // 가로 공간 부족하면 스크롤 생성
            whiteSpace: "nowrap", // 버튼 1줄 고정
          }}
        >
          <button style={{ flexShrink: 0 }} onClick={() => setActiveTab("ALL")}>
            전체
          </button>
          <button
            style={{ flexShrink: 0 }}
            onClick={() => setActiveTab("음식점")}
          >
            식당
          </button>
          <button
            style={{ flexShrink: 0 }}
            onClick={() => setActiveTab("카페")}
          >
            카페
          </button>
          <button
            style={{ flexShrink: 0 }}
            onClick={() => setActiveTab("문화시설")}
          >
            문화
          </button>
          <button
            style={{ flexShrink: 0 }}
            onClick={() => setActiveTab("관광명소")}
          >
            관광
          </button>
          <button
            style={{ flexShrink: 0 }}
            onClick={() => setActiveTab("숙박")}
          >
            숙소
          </button>
        </div>
      )}

      {/* 지도 center를 mapCenter 상태로 연결 */}
      <Map
        center={mapCenter}
        style={{ width: "100%", height: "100%" }}
        level={8}
      >
        {/* 줌 컨트롤러 추가 */}
        {!isMobile && (
          <ZoomControl
            position={window.kakao.maps.ControlPosition.RIGHT}
          ></ZoomControl>
        )}
        {/* 내 저장 기록 (빨간 핀) */}
        {visibleRecords.map((record) => (
          <MapMarker
            key={record.id}
            position={{ lat: record.lat, lng: record.lng }}
            title={record.placeName} // 마우스 올리면 저장된 이름 뜸
            image={{
              src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
              size: { width: 31, height: 35 },
            }}
            onClick={() => {
              setOpenMarkerId(record.id); // 빨간 핀 열기
              setSelectedPlace(null); // 파란 핀 팝업 닫기
            }} // 클릭하면 alert 대신 ID를 저장!
          />
        ))}

        {/*  클릭하면 뜨는 말풍선 (CustomOverlayMap) */}
        {visibleRecords.map(
          (record) =>
            openMarkerId === record.id && (
              <CustomOverlayMap
                key={record.id}
                position={{ lat: record.lat, lng: record.lng }}
                yAnchor={1.5} // 마커 살짝 위쪽으로 띄우기
              >
                {/* 말풍선 전체 컨테이너 */}
                <div
                  onClick={() => setSelectedRecord(record)} // 💡 클릭 시 상세 모달창 열기!
                  style={{
                    display: "flex",
                    alignItems: "stretch",
                    background: "white",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                >
                  {/* 왼쪽: 장소 이름 및 날짜 영역 */}
                  <div
                    style={{
                      padding: "8px 12px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: "15px",
                        color: "#333",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {record.placeName}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#888",
                        marginTop: "2px",
                      }}
                    >
                      {record.date}
                    </span>
                  </div>

                  {/* 오른쪽: 빨간색 화살표 버튼 영역 */}
                  <div
                    style={{
                      background: "#e50914",
                      color: "white",
                      padding: "0 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      fontWeight: "bold",
                    }}
                  >
                    {">"}
                  </div>
                </div>

                {/* 말풍선 아래쪽 뾰족한 꼬리표 (사진처럼 마커를 가리키게) */}
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderTop: "8px solid white",
                    margin: "0 auto",
                  }}
                />
              </CustomOverlayMap>
            ),
        )}

        {/* 검색 리스트에서 누른 장소에 [기록하기] 팝업 띄우기 */}
        {selectedPlace && (
          <CustomOverlayMap
            position={{ lat: selectedPlace.y, lng: selectedPlace.x }}
            yAnchor={1.3}
          >
            <div
              style={{
                padding: "15px",
                background: "white",
                borderRadius: "8px",
                border: "2px solid #0b1031",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                textAlign: "center",
                zIndex: 10,
                minWidth: "160px",
              }}
            >
              {/* Flexbox 적용 - 장소 이름 왼쪽, x버튼 오른쪽 양쪽 정렬 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <strong
                  style={{
                    textAlign: "left",
                    paddingRight: "10px",
                    wordBreak: "keep-all",
                    color: "#000",
                    fontSize: "15px",
                    lineHeight: 1,
                    margin: 0,
                  }}
                >
                  {selectedPlace.place_name}
                </strong>

                {/* x버튼 flex 박스 안으로 */}
                <button
                  onClick={() => setSelectedPlace(null)}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "14px",
                    color: "#888",
                    cursor: "pointer",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>

              <button
                onClick={() => setIsModalOpen(true)} // 여기서 모달창 오픈
                style={{
                  background: "rgb(137, 178, 255)",
                  color: "black",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                📝 기록
              </button>
            </div>
          </CustomOverlayMap>
        )}

        {/* 검색 결과 (기본 파란 핀) */}
        {filteredPlaces.map((place, i) => (
          <MapMarker
            key={i}
            position={{ lat: place.y, lng: place.x }}
            title={place.place_name}
            onClick={() => {
              setSelectedPlace(place);
              setOpenMarkerId(null); // 빨간 핀 팝업 닫기
              setMapCenter({ lat: place.y, lng: place.x });
            }}
          />
        ))}
      </Map>

      {/* PC/모바일 통합: 상단 플로팅 검색창 & 리스트 영역 */}
      <div
        style={{
          position: "absolute",
          top: "10px", // PC, 모바일 모두 상단 고정
          left: "10px",
          width: isMobile ? "calc(100% - 20px)" : "300px", // 모바일 꽉 차게, PC는 좌측 사이드바
          height: "auto",
          zIndex: 11, // 필터 탭보다 위로 올라오게
          display: "flex",
          flexDirection: "column",
        }}
      >
        <form
          onSubmit={(e) => {
            searchPlaces(e);
            setIsListOpen(true);
          }}
          style={{
            display: "flex",
            alignItems: "center", //버튼 수직 중앙 정렬
            background: "white",
            padding: "6px 12px",
            borderRadius: "8px",
            boxShadow: isMobile ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <input
            placeholder="장소 검색.."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              if (e.target.value === "") setSearchResults([]); // 다 지우면 결과도 지움
            }}
            style={{
              flex: 1,
              minWidth: 0, // 입력창 길어져도 레이아웃 안깨지게
              padding: "6px",
              border: "none",
              outline: "none", // 클릭 시 파란 테두리 방지
              fontSize: "15px",
            }}
          />

          {/* 글자가 1글자라도 있으면 X버튼 */}
          {keyword && (
            <button
              type="button"
              onClick={() => {
                setKeyword(""); // 검색어 지우기
                setSearchResults([]); // 파란 핀 제거
                setIsListOpen(false); // 리스트 닫기
              }}
              style={{
                border: "none",
                background: "transparent",
                color: "#999",
                fontSize: "16px",
                cursor: "pointer",
                padding: "0 8px",
              }}
            >
              ✕
            </button>
          )}

          {/* 검색어와 검색 버튼 사이의 얇은 구분선 */}
          <div
            style={{
              width: "1px",
              height: "16px",
              background: "#ddd",
              margin: "0 4px",
            }}
          ></div>

          <button
            type="submit"
            style={{ padding: "6px 12px", cursor: "pointer" }}
          >
            검색
          </button>
        </form>

        {filteredPlaces.length > 0 && (
          <>
            <button
              onClick={() => setIsListOpen(!isListOpen)}
              style={{
                margin: "10px auto",
                padding: "8px 20px",
                background: "#0b1031",
                color: "white",
                border: "none",
                borderRadius: "20px",
                fontWeight: "bold",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                cursor: "pointer",
              }}
            >
              {isListOpen ? "리스트 접기 " : "목록 보기 "}
            </button>

            {/* 검색 결과 리스트 */}
            {isListOpen && (
              <ul
                style={{
                  maxHeight: isMobile ? "250px" : "400px",
                  overflowY: "auto",
                  paddingLeft: 0,
                  margin: 0,
                  background: "white",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {filteredPlaces.map((p, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      setSelectedPlace(p);
                      setMapCenter({ lat: p.y, lng: p.x });
                      setOpenMarkerId(null);
                      setIsListOpen(false); // 장소 누르면 리스트 접기
                    }}
                    style={{
                      cursor: "pointer",
                      borderBottom: "1px solid #ccc",
                      padding: "10px 15px",
                      listStyle: "none",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ fontWeight: "bold", fontSize: "15px" }}>
                      {p.place_name}
                    </div>
                    {/* 주소 추가 */}
                    <div
                      style={{
                        fontSize: "12px",
                        color: "gray",
                        marginTop: "4px",
                      }}
                    >
                      {p.address_name}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
      {/* 파일 맨 마지막 닫는 div 태그 직전에 모달창 렌더링 추가 */}
      {selectedRecord && (
        <DetailModal
          // selectedRecord(과거) 대신 실시간 배열에서 꺼내오기
          record={
            savedRecords.find((r) => r.id === selectedRecord.id) ||
            selectedRecord
          }
          onClose={() => setSelectedRecord(null)}
          onEdit={(record) => {
            setEditingRecord(record); // 어떤 기록을 수정할지 세팅
            setIsModalOpen(true); // 수정용 폼 (RecordModal) 열기
          }}
          onDelete={(id) => {
            handleDelete(id);
            setSelectedRecord(null); // 삭제하면 모달창도 같이 닫기
          }}
        />
      )}
    </div>
  );
}
