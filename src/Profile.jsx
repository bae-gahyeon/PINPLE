// src/Profile.jsx
import { useState, useEffect } from "react";
import { db } from "./components/firebase";

export default function Profile({ setProfile, uid}) { // uid 추가
  const [profiles, setProfiles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // 모달창 상태 관리 변수들
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" 또는 "edit"
  const [editTargetId, setEditTargetId] = useState(null); // 수정 프로필 고유ID 기억
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#e50914");

  // 프로필 선택용 커스텀 색상 후보들
  const colorOptions = ["#e50914", "#5691ff", "#2b9e4a", "#fbc02d", "#8e24aa"];

  const fetchProfiles = () => {
    db.collection("profiles")
      .where("uid", "==", uid)
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
    if (uid) fetchProfiles();
  }, [uid]); // 의존성 배열에 uid 추가

  const handleSelect = (p) => {
    if (isEditing) {
      // 관리(수정) 모드일 땐 모달창 띄우기 (기존 정보 채워넣기)
      setModalMode("edit");
      setEditTargetId(p.id);
      setNewName(p.name);
      setSelectedColor(p.color || "#e50914");
      setShowModal(true);
    } else {
      // 평소엔 앱으로 입장
      localStorage.setItem("currentProfile", p.name);
      localStorage.setItem("profileColor", p.color || "#e50914"); // 프로필 색상 로컬리지에 저장
      setProfile(p.name);
    }
  };

  // + 버튼 눌렀을 때 추가모드
  const handleAddClick = () => {
    if (!isEditing) {
      setModalMode("add");
      setNewName("");
      setSelectedColor("#e50914");
      setShowModal(true);
    }
  };

  // 모달창에서 '저장' 눌렀을 때 (추가 & 수정 분기 처리)
  const handleSave = () => {
    if (!newName.trim()) {
      alert("이름을 입력해주세요!");
      return;
    }
    if (modalMode === "add") {
      // 새 프로필 추가
      db.collection("profiles")
        .add({ name: newName, color: selectedColor, uid }) //uid 추가
        .then(() => {
          fetchProfiles();
          setShowModal(false);
        });
    } else {
      // 기존 프로필 수정 (💡 오타 수정 완료!)
      db.collection("profiles")
        .doc(editTargetId)
        .update({ name: newName, color: selectedColor })
        .then(() => {
          fetchProfiles();
          setShowModal(false);
        });
    }
  };

  // 수정: 모달창 안에서 프로필 삭제 로직
  const handleDelete = () => {
    if (
      window.confirm(`이 프로필을 정말 삭제할까요? 기록이 모두 날아갑니다.`)
    ) {
      db.collection("profiles")
        .doc(editTargetId)
        .delete()
        .then(() => {
          fetchProfiles();
          setShowModal(false);
        });
    }
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
            onClick={() => handleSelect(p)}
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
              {/* 삭제 = 휴지통, 수정 = 연필 */}
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
                    fontSize: "3rem",
                  }}
                >
                  ✏️
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

        {/* 💡 className 완벽하게 복구된 추가 버튼 */}
        <div
          className="profile-item add-profile"
          onClick={handleAddClick}
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

      {/* 하단 프로필 관리 버튼 */}
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

      {/* 프로필 추가/수정 공용 모달창 */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
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
            <h2 style={{ marginBottom: "20px" }}>
              {modalMode === "add" ? "프로필 추가" : "프로필 수정"}
            </h2>

            {/* 색상 선택 영역 */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "15px",
                marginBottom: "30px",
              }}
            >
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
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setShowModal(false)}
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
                {/* 💡 저장 버튼을 handleSave와 제대로 연결! */}
                <button
                  onClick={handleSave}
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

              {/* 💡 수정 모드일 때만 하단에 '삭제' 버튼 표시 */}
              {modalMode === "edit" && (
                <button
                  onClick={handleDelete}
                  style={{
                    width: "100%",
                    padding: "15px",
                    marginTop: "10px",
                    background: "transparent",
                    border: "1px solid #e50914",
                    color: "#e50914",
                    fontWeight: "bold",
                    cursor: "pointer",
                    borderRadius: "5px",
                  }}
                >
                  이 프로필 삭제하기
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
