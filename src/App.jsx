// src/App.jsx
import { useState, useEffect, use } from "react";
import { auth } from "./components/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import Profile from "./Profile";
import Pinple from "./Pinple";
import "./style.css";

export default function App() {
  const [user, setUser] = useState(null); // 유저 상태 관리
  // 프로필 상태를 App.jsx에서 관리 (로컬스토리지에서 기존 프로필 이름 가져오기)
  const [currentProfile, setCurrentProfile] = useState(
    localStorage.getItem("currentProfile") || null,
  );

  // 로그인 상태 감시
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 구글 로그인 함수
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("로그인 실패:", error);
    }
  };

  // 로그아웃 시 프로필 선택 상태 초기화
  const handleLogout = () => {
    signOut(auth);
    setCurrentProfile(null);
    localStorage.removeItem("currentProfile");
  };

  // 로그인 안 한 상태: 로그인 화면 렌더링
  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#ffffff",
          color: "white",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "bold",
            marginBottom: "20px",
            color: "#e50914",
          }}
        >
          MAPFLIX
        </h1>
        <p style={{ marginBottom: "40px", color: "#2c2727" }}>
          나만의 다중 프로필 지도 다이어리
        </p>
        <button
          onClick={handleGoogleLogin}
          style={{
            padding: "15px 30px",
            backgroundColor: "#0b1031",
            color: "white",
            fontWeight: "bold",
            borderRadius: "30px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            fontSize: "1rem",
          }}
        >
          🚀 Google 계정으로 시작하기
        </button>
      </div>
    );
  }

  // 로그인 성공 시 화면
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        backgroundColor: "#f9f9f9",
        position: "relative",
      }}
    >
      {!currentProfile ? (
        <Profile setProfile={setCurrentProfile} uid={user.uid} /> //uid 추가
      ) : (
        // Pinple에 onLogout 이라는 이름으로 로그아웃 함수 넘겨주기
        <Pinple
          currentProfile={currentProfile}
          setProfile={setCurrentProfile}
          onLogout={handleLogout}
          uid={user.uid}
        />
      )}
    </div>
  );
}
