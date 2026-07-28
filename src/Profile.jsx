// src/Profile.jsx
import { useState, useEffect } from "react";
import { db } from "./components/firebase";

export default function Profile({ setProfile }) {
  const [profiles, setProfiles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // 모달창 상태 관리 변수들
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#e50914");

  // 프로필 선택용 커스텀 색상 후보들
  const colorOptions = ["#e50914", "#5691ff", "#2b9e4a", "#fbc02d", "#8e24aa"];

  const fetchProfiles = () => {
    db.collection("profiles")
      .get()
      .then((snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProfiles(data);
      });
  };

  useEffect(() => {
    // 수정1: fetchProfiles() 호출로 변경
    fetchProfiles();
  }, []);

  // 수정 2: name 대신 프로필 객체(p)받아서 삭제 로직 추가
  const handleSelect = (p) => {
    if (isEditing) {
      if (window.confirm(`'${p.name}' 프로필을 정말 삭제할까요?`)) {
        db.collection("profiles")
          .doc(p.id)
          .delete()
          .then(() => {
            fetchProfiles(); // 삭제 후 화면 부드럽게 갱신
          });
      }
    } else {
      localStorage.setItem("currentProfile", p.name);
      setProfile(p.name);
    }
  };

  // 수정 3: prompt() 대신 모달용 저장 함수 추가
  const saveNewProfile = () => {
    if (!newName.trim()) {
      alert("이름을 입력해주세요!");
      return;
    }
    db.collection("profiles")
      .add({ name: newName, color: selectedColor })
      .then(() => {
        fetchProfiles(); // window.location.reload() 대신 리스트만 갱신
        setNewName("");
        setSelectedColor("#e50914");
        setShowAddModal(false);
      });
  };

  return (
    <div
      className="profile-container"
      style={{
        background: "#141414",
        color: "white",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          marginBottom: "2em",
          fontWeight: "normal",
        }}
      >
        {isEditing ? "프로필 관리" : "프로필을 선택하세요."}
      </h1>

      <div
        className="profile-list"
        style={{
          display: "flex",
          gap: "30px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {profiles.map((p) => (
          <div
            key={p.id}
            className="profile-item"
            onClick={() => handleSelect(p)} //수정: p 전체 넘겨줌
            style={{
              cursor: "pointer",
              textAlign: "center",
              position: "relative",
            }}
          >
            <div
              className="profile-img"
              style={{
                width: 150,
                height: 150,
                borderRadius: 10,
                backgroundColor: p.color || "blue",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "4rem",
                position: "relative",
              }}
            >
              👤
              {/* 삭제 모드일때 휴지통 아이콘 표시 */}
              {isEditing && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0,0,0,0.6)",
                    borderRadius: "10px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  🗑️
                </div>
              )}
            </div>
            <span
              className="profile-name"
              style={{
                marginTop: 15,
                display: "block",
                color: isEditing ? "white" : "gray",
              }}
            >
              {p.name}
            </span>
          </div>
        ))}

        {/* 추가 버튼 */}
        <div
          className="profile-item add-profile"
          onClick={() => {
            if (!isEditing) setShowAddModal(true); // 수정모드가 아닐때만 모달창 연결
          }}
          style={{
            cursor: "pointer",
            textAlign: "center",
            opacity: isEditing ? 0.3 : 1,
          }}
        >
          <div
            className="profile-img"
            style={{
              width: 150,
              height: 150,
              borderRadius: 10,
              border: "3px solid gray",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "4rem",
              color: "gray",
            }}
          >
            +
          </div>
          <span
            className="profile-name"
            style={{ marginTop: 15, display: "block" }}
          >
            프로필 추가
          </span>
        </div>
      </div>

      {/* 수정 4: 하단 프로필 관리 버튼 추가 */}
      <button
        onClick={() => setIsEditing(!isEditing)}
        style={{
          marginTop: "60px",
          padding: "10px 30px",
          background: "transparent",
          border: isEditing ? "1px solid white" : "1px solid gray",
          color: isEditing ? "white" : "gray",
          fontSize: "1.2rem",
          cursor: "pointer",
          letterSpacing: "2px",
        }}
      >
        {isEditing ? "완료" : "프로필 관리"}
      </button>

      {/* 프로필 추가 커스텀 모달창 컴포넌트 추가 */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            widows: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#222",
              padding: "40px",
              borderRadius: "10px",
              width: "400px",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginBottom: "20px" }}>프로필 추가</h2>

            {/* 색상 선택 영역 */}
            <div style={{
              display:"flex",
              flexDirection:"row", // 가로 정렬
              flexWrap:"wrap", // 화면이 좁아져도 예쁘게 줄바꿈
              justifyContent:"center",
              gap:"15px",
              marginBottom:"30px"
            }}>
              {colorOptions.map((color) => (
                <div
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: color,
                    cursor: "pointer",
                    border:
                      selectedColor === color
                        ? "3px solid white"
                        : "3px solid transparent",
                    boxShadow:
                      selectedColor === color
                        ? "0 0 10px rgba(255,255,255,0.5)"
                        : "none",
                  }}
                ></div>
              ))}
            </div>

            {/* 이름 입력 영역 */}
            <input
              type="text"
              placeholder="이름을 입력하세요"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{
                width: "90%",
                padding: "15px",
                borderRadius: "5px",
                border: "none",
                background: "#333",
                color: "white",
                fontSize: "1.2rem",
                marginBottom: "30px",
                outline: "none",
              }}
            />

            {/* 버튼 영역 */}
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  flex: 1,
                  padding: "15px",
                  background: "transparent",
                  border: "1px solid gray",
                  color: "white",
                  cursor: "pointer",
                  borderRadius: "5px",
                }}
              >
                취소
              </button>
              <button
                onClick={saveNewProfile}
                style={{
                  flex: 1,
                  padding: "15px",
                  background: "white",
                  border: "none",
                  color: "black",
                  fontWeight: "bold",
                  cursor: "pointer",
                  borderRadius: "5px",
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
