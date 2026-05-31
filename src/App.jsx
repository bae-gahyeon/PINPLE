// src/App.jsx
import { useState } from "react"; // useEffect는 이제 안 쓰니까 지움!
import Profile from "./Profile";
import Pinple from "./Pinple";
import "./style.css";

export default function App() {
  // 💡 리액트식 지연 초기화: 처음에 앱이 켜질 때 로컬 스토리지를 바로 확인!
  const [currentProfile, setCurrentProfile] = useState(() => {
    return localStorage.getItem("currentProfile") || null;
  });

  // 프로필이 없으면 프로필 화면, 있으면 맵플릭스 본 화면!
  return (
    <>
      {!currentProfile ? (
        <Profile setProfile={setCurrentProfile} />
      ) : (
        <Pinple
          currentProfile={currentProfile}
          setProfile={setCurrentProfile}
        />
      )}
    </>
  );
}
