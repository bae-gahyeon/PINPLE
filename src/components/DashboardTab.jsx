// src/components/DashboardTab.jsx
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

export default function DashboardTab({ savedRecords, currentProfile }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. 통계치 계산
  const avgCost =
    savedRecords.length > 0
      ? Math.round(
          savedRecords.reduce((acc, cur) => acc + Number(cur.cost), 0) /
            savedRecords.length,
        )
      : 0;

  const getTopItem = (arr) => {
    if (arr.length === 0) return "-";
    const counts = arr.reduce((acc, val) => {
      if (val) acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    if (Object.keys(counts).length === 0) return "-";
    return Object.keys(counts).reduce((a, b) =>
      counts[a] > counts[b] ? a : b,
    );
  };

  const regions = savedRecords
    .map((r) =>
      r.address
        ? r.address.split(" ").length > 1
          ? r.address.split(" ")[1]
          : r.address.split(" ")[0]
        : null,
    )
    .filter(Boolean);
  const topRegion = getTopItem(regions);

  const categories = savedRecords.map((r) => r.category).filter(Boolean);
  const formattedCategories = categories.map((c) => c.split(">")[0].trim());
  const topCategory = getTopItem(formattedCategories);

  const profileColor = localStorage.getItem("profileColor") || "#e50914";

  // 2. 카테고리별 차트 데이터 가공 (지출 및 방문 횟수)
  const processCategoryData = () => {
    const dataMap = {};
    savedRecords.forEach((record) => {
      if (!record.category) return;
      const cat = record.category.split(">")[0].trim();
      const cost = Number(record.cost) || 0;

      if (dataMap[cat]) {
        dataMap[cat].cost += cost;
        dataMap[cat].count += 1;
      } else {
        dataMap[cat] = { cost: cost, count: 1 };
      }
    });

    return Object.keys(dataMap)
      .map((key) => ({
        name: key,
        지출액: dataMap[key].cost,
        방문횟수: dataMap[key].count,
      }))
      .sort((a, b) => b.지출액 - a.지출액);
  };

  // 3. 지역별 방문 횟수 차트 데이터 가공
  const processRegionData = () => {
    const dataMap = {};
    savedRecords.forEach((record) => {
      if (!record.address) return;
      const parts = record.address.split(" ");
      const region = parts.length > 1 ? parts[1] : parts[0];

      dataMap[region] = (dataMap[region] || 0) + 1;
    });

    return Object.keys(dataMap)
      .map((key) => ({ name: key, 방문횟수: dataMap[key] }))
      .sort((a, b) => b.방문횟수 - a.방문횟수)
      .slice(0, 5); // 상위 5개 지역만
  };

  const categoryChartData = processCategoryData();
  const regionChartData = processRegionData();
  const COLORS = ["#e50914", "#0b1031", "#5691ff", "#2b9e4a", "#fbc02d"];

  return (
    <div
      style={{
        padding: "20px 20px 85px 20px",
        height: "100%",
        overflowY: "auto",
        background: "#f0f0f0",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2 style={{ borderBottom: "2px solid #e50914", paddingBottom: 10 }}>
        추억 대시보드
      </h2>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: "20px",
          background: "white",
          padding: 20,
          borderRadius: 15,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        {/* 왼쪽: 프로필 요약 카드 */}
        <div style={{ textAlign: "center", minWidth: "160px" }}>
          <div
            style={{
              width: 100,
              height: 100,
              background: profileColor,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem",
              margin: "0 auto 10px auto",
              fontWeight: "bold",
              color: "white",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          >
            {currentProfile ? currentProfile.charAt(0) : "P"}
          </div>
          <h3 style={{ marginTop: 15, marginBottom: 5 }}>
            {currentProfile} 님
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "#888",
              fontWeight: "bold",
            }}
          >
            총 {savedRecords.length}개의 기록
          </p>
        </div>

        {/* 오른쪽: 차트 & 하단 카드 영역 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {categoryChartData.length > 0 ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {/* 1. 카테고리별 지출 통계 (막대) - 가로로 길게 */}
              <div
                style={{
                  padding: "15px",
                  background: "#f9f9f9",
                  borderRadius: "10px",
                  border: "1px solid #eee",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 15px 0",
                    color: "#333",
                    fontSize: "14px",
                  }}
                >
                  카테고리별 지출
                </h4>
                <div style={{ width: "100%", height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryChartData}
                      margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${value.toLocaleString()}`} width={65}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(0,0,0,0.05)" }}
                        formatter={(value) => `${value.toLocaleString()}원`}
                      />
                      <Bar dataKey="지출액" radius={[4, 4, 0, 0]}>
                        {categoryChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? "#e50914" : "#0b1031"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 하단 2개 원형 차트 나란히 배치 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  gap: "15px",
                }}
              >
                {/* 2. 카테고리별 방문 비율 (원형) */}
                <div
                  style={{
                    flex: 1,
                    padding: "15px",
                    background: "#f9f9f9",
                    borderRadius: "10px",
                    border: "1px solid #eee",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 15px 0",
                      color: "#333",
                      fontSize: "14px",
                    }}
                  >
                    주로 방문한 곳
                  </h4>
                  <div style={{ width: "100%", height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          dataKey="방문횟수"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          innerRadius={35}
                          outerRadius={55}
                          paddingAngle={5}
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}번 방문`} />
                        <Legend
                          iconType="circle"
                          wrapperStyle={{ fontSize: "12px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. 지역별 방문 비율 (원형) */}
                <div
                  style={{
                    flex: 1,
                    padding: "15px",
                    background: "#f9f9f9",
                    borderRadius: "10px",
                    border: "1px solid #eee",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 15px 0",
                      color: "#333",
                      fontSize: "14px",
                    }}
                  >
                    자주 간 지역 TOP 5
                  </h4>
                  <div style={{ width: "100%", height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{top:15,right:0,left:0,bottom:0}}>
                        <Pie
                          data={regionChartData}
                          dataKey="방문횟수"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          innerRadius={35}
                          outerRadius={55}
                          paddingAngle={5}
                        >
                          {regionChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}번 방문`} />
                        <Legend
                          iconType="circle"
                          wrapperStyle={{ fontSize: "12px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#888",
                background: "#f9f9f9",
                borderRadius: "10px",
              }}
            >
              아직 통계를 낼 기록이 없어요! 장소를 먼저 기록해 주세요.
            </div>
          )}

          {/* 4. 하단 3개 네이비색 카드 */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              width: "100%",
            }}
          >
            {[
              { title: "자주 방문한 지역", value: topRegion },
              { title: "평균 지출", value: `${avgCost.toLocaleString()}원` },
              { title: "최다 방문 카테고리", value: topCategory },
            ].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  flex: isMobile ? "1 1 45%" : 1,
                  background: "#0b1031",
                  color: "white",
                  padding: "15px 10px",
                  borderRadius: 10,
                  textAlign: "center",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{ fontSize: "13px", color: "#aaa", marginBottom: 8 }}
                >
                  {stat.title}
                </div>
                <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
