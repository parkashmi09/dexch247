import { useState, useMemo } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startDay; i++) {
    cells.push({ day: null, type: "out prev" });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, type: "" });
  }

  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let i = 0; i < remaining; i++) {
      cells.push({ day: null, type: "out next" });
    }
  }

  return cells;
}

export default function ResultCalendar({ mId, detailData }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const cells = useMemo(() => getCalendarGrid(year, month), [year, month]);
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  function goPrev() {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  }

  function goNext() {
    if (isCurrentMonth) return;
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  }

  // Parse prefetched detailData into day-keyed map
  const dayResults = useMemo(() => {
    const map = {};
    if (!detailData) return map;
    const records = detailData?.data || detailData?.details || detailData?.soda || [];
    if (!Array.isArray(records)) return map;

    records.forEach((r) => {
      const dateStr = r.date || r.gdate || "";
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = { open: ["", "", ""], close: ["", "", ""] };
        const openDigits = r.open || "";
        const closeDigits = r.close || "";
        if (openDigits) map[day].open = String(openDigits).split("").slice(0, 3);
        if (closeDigits) map[day].close = String(closeDigits).split("").slice(0, 3);
      }
    });
    return map;
  }, [detailData, year, month]);

  return (
    <div className="calendar">
      <div className="topbar">
        <div className="left"></div>
        <div className="center">
          <button className="navbtn" onClick={goPrev}>«</button>
          <div className="month">{MONTHS[month]} {year}</div>
          <button className="navbtn" onClick={goNext} disabled={isCurrentMonth}>»</button>
        </div>
        <div className="right"></div>
      </div>
      <div className="cal-scroll">
        <div className="cal-strip">
          <div className="dow">
            {DAYS.map((d) => (<div key={d}>{d}</div>))}
          </div>
          <div className="grid">
            {cells.map((cell, idx) => {
              const dr = cell.day ? (dayResults[cell.day] || { open: ["", "", ""], close: ["", "", ""] }) : null;
              return (
                <div key={idx} className={`cell ${cell.type}`}>
                  <div className="content">
                    {cell.day && (
                      <>
                        <div className="cell-top">
                          <span className="date-badge">{cell.day}</span>
                        </div>
                        <div className="oc-rows">
                          <div className="digits">
                            <div>{dr.open[0]}</div>
                            <div>{dr.open[1]}</div>
                            <div>{dr.open[2]}</div>
                          </div>
                          <div></div>
                          <div className="digits">
                            <div>{dr.close[0]}</div>
                            <div>{dr.close[1]}</div>
                            <div>{dr.close[2]}</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
