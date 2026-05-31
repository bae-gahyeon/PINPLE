// src/Profile.jsx
import { useState, useEffect } from "react";
import { db } from "./components/firebase";

export default function Profile({ setProfile }) {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    db.collection("profiles")
      .get()
      .then((snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProfiles(data);
      });
  }, []);

  const handleSelect = (name) => {
    localStorage.setItem("currentProfile", name);
    setProfile(name); // App.jsx의 상태 업데이트!
  };

  const handleAdd = () => {
    const newName = prompt("새 프로필 이름을 입력하세요:");
    if (newName) {
      db.collection("profiles")
        .add({ name: newName, color: "#e50914" })
        .then(() => window.location.reload());
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
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2em" }}>
        프로필을 선택하세요.
      </h1>

      <div className="profile-list" style={{ display: "flex", gap: "30px" }}>
        {profiles.map((p) => (
          <div
            key={p.id}
            className="profile-item"
            onClick={() => handleSelect(p.name)}
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
          onClick={handleAdd}
          style={{ cursor: "pointer", textAlign: "center" }}
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
              fontSize: "3rem",
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
    </div>
  );
}
