import { useEffect, useRef, useState } from "react"
import { saveRecord } from "../saveRecord"

function MapPage() {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [keyword, setKeyword] = useState("")
  const [places, setPlaces] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [memo, setMemo] = useState("")
  const [cost, setCost] = useState("")

  useEffect(() => {
    const container = mapRef.current
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 3,
    }

    const mapInstance = new window.kakao.maps.Map(container, options)
    setMap(mapInstance)
  }, [])

  const searchPlaces = () => {
    const ps = new window.kakao.maps.services.Places()

    ps.keywordSearch(keyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setPlaces(data)
      }
    })
  }

  const selectPlace = (place) => {
    setSelectedPlace(place)

    const latlng = new window.kakao.maps.LatLng(place.y, place.x)
    map.setCenter(latlng)

    const marker = new window.kakao.maps.Marker({
      position: latlng,
    })
    marker.setMap(map)
  }

  const handleSave = async () => {
    if (!selectedPlace) return alert("장소를 선택해주세요!")

    await saveRecord({
      profileId: "friend1", // 나중에 연결
      placeName: selectedPlace.place_name,
      lat: selectedPlace.y,
      lng: selectedPlace.x,
      memo,
      cost: Number(cost),
      date: new Date().toISOString(),
    })
  }

  return (
    <div>
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="장소 검색"
      />
      <button onClick={searchPlaces}>검색</button>

      <div ref={mapRef} style={{ width: "100%", height: "400px" }} />

      <ul>
        {places.map((p, i) => (
          <li key={i} onClick={() => selectPlace(p)}>
            {p.place_name}
          </li>
        ))}
      </ul>

      {selectedPlace && (
        <div>
          <h3>{selectedPlace.place_name}</h3>
          <input
            placeholder="메모"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
          <input
            placeholder="지출"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
          <button onClick={handleSave}>저장</button>
        </div>
      )}
    </div>
  )
}

export default MapPage