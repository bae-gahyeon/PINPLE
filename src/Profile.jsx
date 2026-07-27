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
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2em", fontWeight:"normal" }}>
        {isEditing ? "프로필 관리" : "프로필을 선택하세요."}
      </h1>

      <div className="profile-list" style={{ display: "flex", gap: "30px" }}>
        {profiles.map((p) => (
          <div
            key={p.id}
            className="profile-item"
            onClick={() => handleSelect(p)} //수정: p 전체 넘겨줌
            style={{ cursor: "pointer", textAlign: "center" }}
          >
            <div
              className="profile-img"
              style={{
                width: 150,
                height: 150,
                borderRadius: 10,
                backgroundColor: p.color || "blue",
              }}
            ></div>
            <span
              className="profile-name"
              style={{ marginTop: 15, display: "block" }}
            >
              {p.name}
            </span>
          </div>
        ))}

        {/* 추가 버튼 */}
        <div
          className="profile-item add-profile"
          onClick={()=>{
            if(!isEditing) setShowAddModal(true); // 수정: 모달창 연결
          }}
          style={{cursor:"pointer", textAlign:"center", opacity: isEditing ? 0.3 : 1}}
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
              color:"gray"
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
      <button onClick={()=>setIsEditing(!isEditing)}
        style={{
          marginTop:"60px", padding:"10px 30px", background: "transparent",
          border:isEditing ? "1px solid white" : "1px solid gray", color:isEditing ? "white" : "gray",
          fontSize:"1.2rem", cursor:"pointer", letterSpacing:"2px"
        }}
        >
          {isEditing ? "완료" : "프로필 관리"}
      </button>
    </div>
  );
}
