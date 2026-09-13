import { create } from "zustand";
import { db } from "../components/firebase";

export const useDiaryStore = create((set, get) => ({
  // 로그인 유저 정보 (Pinple.jsx에서 최초 1번 세팅)
  uid: null,
  profileName: null,

  savedRecords: [], // 전체 기록 (필터 안 걸린 원본)
  periodFilter: "all", // "all" | "1m" | "6m"

  setUser: (uid, profileName) => set({ uid, profileName }),
  setPeriodFilter: (period) => set({ periodFilter: period }),

  // uid를 매번 인자로 안 받아도 되게, 스토어 안에 저장된 값을 씀
  fetchRecords: async () => {
    const { uid, profileName } = get();
    if (!uid || !profileName) return;

    const snapshot = await db
      .collection("diary_records")
      .where("uid", "==", uid)
      .where("profileName", "==", profileName)
      .get();

    const records = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    records.sort((a, b) => new Date(b.date) - new Date(a.date));

    set({ savedRecords: records });
  },
}));
