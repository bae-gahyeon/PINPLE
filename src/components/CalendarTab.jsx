// src/CalendarTab.jsx

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

export default function CalendarTab({ savedRecords }) {
  return (
    <div
      style={{
        padding: "20px 20px 85px 20px",
        height: "100%",
        overflowY: "auto",
        background: "#f0f0f0",
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          background: "white",
          padding: 20,
          borderRadius: 10,
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={savedRecords.map((r) => ({
            title: `${r.placeName} (${r.cost}원)`,
            start: r.date,
            color: "#180085",
          }))}
        />
      </div>
    </div>
  );
}
