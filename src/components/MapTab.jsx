// src/components/MapTab.jsx
import { act, useState } from "react";
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
}) {
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

          return record.category.includes(activeTab);
        });

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

      <div
        style={{
          position: "absolute",
          top: "80px", //안내창이나 다른 요소와 안 겹치게 간격 확보
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          gap: "10px",
          background: "rgba(255,255,255,0.9)",
          padding: "10px 15px",
          borderRadius: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <button onClick={() => setActiveTab("ALL")}>전체</button>
        <button onClick={() => setActiveTab("음식점")}>식당</button>
        <button onClick={() => setActiveTab("카페")}>카페</button>
        <button onClick={() => setActiveTab("문화시설")}>문화</button>
        <button onClick={() => setActiveTab("관광명소")}>관광</button>
        <button onClick={() => setActiveTab("숙박")}>숙소</button>
      </div>

      {/* 지도 center를 mapCenter 상태로 연결 */}
      <Map
        center={mapCenter}
        style={{ width: "100%", height: "100%" }}
        level={8}
      >
        {/* 줌 컨트롤러 추가 */}
        <ZoomControl
          position={window.kakao.maps.ControlPosition.RIGHT}
        ></ZoomControl>
        {/* 내 저장 기록 (빨간 핀) */}
        {visibleRecords.map((record) => (
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
        {visibleRecords.map(
          (record) =>
            openMarkerId === record.id && (
              <CustomOverlayMap
                key={`overlay-${record.id}`}
                position={{ lat: record.lat, lng: record.lng }}
                yAnchor={1.3} // 마커 살짝 위쪽으로 띄우기
              >
                <div
                  style={{
                    position: "relative", // x버튼 절대 위치
                    padding: "15px",
                    background: "white",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    minWidth: "140px",
                  }}
                >
                  <button
                    onClick={() => setOpenMarkerId(null)}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      border: "none",
                      background: "transparent",
                      fontSize: "14px",
                      color: "#888",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>

                  <strong
                    style={{
                      display: "block",
                      color: "#000000",
                      marginBottom: "5px",
                      fontSize: "15px",
                    }}
                  >
                    {record.placeName}
                  </strong>
                  <span style={{ fontSize: "13px" }}>{record.date}</span>
                  <br />
                  <br />
                  <span style={{ fontSize: "13px" }}>🧾 {record.cost}원</span>
                  <br />
                  <span style={{ fontSize: "12px", color: "gray" }}>
                    📝 {record.memo}
                  </span>
                  <br />

                  <button
                    onClick={() => handleDelete(record.id)}
                    style={{
                      marginTop: "15px",
                      padding: "3px 10px",
                      border: "none",
                      background: "#eee",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    삭제
                  </button>
                </div>
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
            onClick={() => {
              setSelectedPlace(place);
              setMapCenter({ lat: place.y, lng: place.x });
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
        <form onSubmit={searchPlaces} style={{ display: "flex", gap: "8px" }}>
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
                setMapCenter({ lat: p.y, lng: p.x });
              }}
              style={{
                cursor: "pointer",
                borderBottom: "1px solid #ccc",
                padding: "5px 0",
              }}
            >
              <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                {p.place_name}
              </div>
              {/* 주소 추가 */}
              <div
                style={{ fontSize: "12px", color: "gray", marginTop: "4px" }}
              >
                {p.address_name}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
