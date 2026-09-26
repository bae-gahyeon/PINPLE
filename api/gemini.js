// 이 파일은 브라우저가 아니라 Vercel 서버에서만 실행
// 그래서 여기서 쓰는 API 키는 클라이언트로 노출x
export default async function handler(req, res) {
  // 사이트에서 온 요청만 허용 (CORS 설정)
  res.setHeader("Access-Control-Allow-Origin", "*"); // 배포 주소 확정되면 나중에 특정 도메인으로 좁힘.
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 브라우저가 실제 요청 전에 보내는 사전 확인 요청(preflight) 처리
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "허용되지 않은 요청입니다" });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "prompt가 필요해요" });

    // GEMINI_API_KEY는 Vercel 대시보드에 등록 (VITE_ 접두어 없음 = 브라우저에 안 보임)
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );

    const data = await geminiRes.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Gemini 호출 실패:", error);
    res.status(500).json({ error: "서버 오류" });
  }
}
