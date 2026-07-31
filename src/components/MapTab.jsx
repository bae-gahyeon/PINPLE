// src/components/MapTab.jsx
import { useState } from "react";
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
}) {
  // 지도 안에서만 사용되는 상태들
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
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

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* 지도 center를 mapCenter 상태로 연결 */}
      <Map
        center={mapCenter}
        style={{ width: "100%", height: "100%" }}
        level={5}
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
                padding: "30px 15px 15px 15px",
                background: "white",
                borderRadius: "8px",
                border: "2px solid #0b1031",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                textAlign: "center",
                zIndex: 10,
                position: "relative",
              }}
            >
              {/* Flexbox 적용 - 장소 이름 왼쪽, x버튼 오른쪽 양쪽 정렬 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <strong
                  style={{
                    textAlign: "left",
                    paddingRight: "10px",
                    wordBreak: "keep-all",
                    color: "#000",
                  }}
                >
                  {selectedPlace.place_name}
                </strong>
              </div>

              {/* x버튼 추가 */}
              <button
                onClick={() => setSelectedPlace(null)}
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

              <strong style={{ display: "block", marginBottom: "8px" }}>
                {selectedPlace.place_name}
              </strong>

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
