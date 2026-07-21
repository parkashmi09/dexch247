import { useState, useEffect } from "react";
import { WorliOddBox, ROW1, ROW2 } from "../../common/WorliGrid.jsx";

const TABS = [
  { key: "single", label: "Single" },
  { key: "pana", label: "Pana" },
  { key: "sp", label: "SP" },
  { key: "dp", label: "DP" },
  { key: "trio", label: "Trio" },
  { key: "cycle", label: "Cycle" },
  { key: "motor", label: "Motor SP" },
  { key: "chart56", label: "56 Charts" },
  { key: "chart64", label: "64 Charts" },
  { key: "abr", label: "ABR" },
  { key: "commonsp", label: "Common SP" },
  { key: "commondp", label: "Common DP" },
  { key: "colordp", label: "Color DP" },
];

// NAT prefix mappings for each tab
const TAB_NAT_PREFIX = {
  single: "Single",
  pana: "Pana",
  sp: "SP",
  dp: "DP",
  trio: "Trio",
  cycle: "Cycle",
  motor: "Motor",
  chart56: "56",
  chart64: "64",
  abr: "ABR",
  commonsp: "Common SP",
  commondp: "Common DP",
  colordp: "Color DP",
};

function findOdds(sub, tabKey) {
  if (!Array.isArray(sub)) return 0;
  const prefix = TAB_NAT_PREFIX[tabKey] || tabKey;
  const item = sub.find(
    (s) => s && s.nat && s.nat.toLowerCase().startsWith(prefix.toLowerCase())
  );
  return parseFloat(item?.b) || parseFloat(item?.odds) || 0;
}

function findItemByNat(sub, nat) {
  if (!Array.isArray(sub)) return null;
  return sub.find((s) => s && s.nat === nat) || null;
}

const RIGHT_ITEMS = [
  [
    { label: "Line 1", sub: "1|2|3|4|5" },
    { label: "ODD", sub: "1|3|5|7|9" },
  ],
  [
    { label: "Line 2", sub: "6|7|8|9|0" },
    { label: "EVEN", sub: "2|4|6|8|0" },
  ],
];

function SingleTabContent({ sub, suspended, onBet, selectedKey }) {
  const odds = findOdds(sub, "single");
  const handleClick = (natLabel) => {
    if (suspended) return;
    const item = findItemByNat(sub, `Single ${natLabel}`) || findItemByNat(sub, natLabel) || sub?.[0];
    const betOdds = parseFloat(item?.b) || odds || 1;
    onBet(betOdds, `Single ${natLabel}`, item, "back");
  };
  const isSelected = (label) => selectedKey === `single-Single ${label}`;

  return (
    <div className={`worlibox${suspended ? " suspended-box" : ""}`}>
      <div className="worli-left">
        <div className="worli-box-title"><b>{odds}</b></div>
        <div className="worli-box-row">
          {ROW1.map((n) => (
            <WorliOddBox key={n} label={n} selected={isSelected(n)} onClick={() => handleClick(n)} />
          ))}
        </div>
        <div className="worli-box-row">
          {ROW2.map((n) => (
            <WorliOddBox key={n} label={n} selected={isSelected(n)} onClick={() => handleClick(n)} />
          ))}
        </div>
      </div>
      <div className="worli-right">
        <div className="worli-box-title"><b>{odds}</b></div>
        {RIGHT_ITEMS.map((row, ri) => (
          <div className="worli-box-row" key={ri}>
            {row.map((item) => (
              <div
                key={item.label}
                className={`worli-odd-box back${isSelected(item.label) ? " selected" : ""}`}
                onClick={() => handleClick(item.label)}
              >
                <span className="worli-odd">{item.label}</span>
                <span className="d-block">{item.sub}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Multi-digit selection tab (Cycle / Motor SP / Pana).
 * Accumulates digits locally, then PLACE composes the proper selection string and
 * calls the SAME onBet() the single-click tabs use — so the place-bet panel /
 * betslip flow is identical; only the selection string is multi-digit.
 *  - Cycle:  exactly 2 distinct digits  → "Cycle a-b"
 *  - Motor:  4–9 distinct digits        → "Motor a,b,c,d"
 *  - Pana:   exactly 3 digits (repeats allowed) → "Pana ddd"
 */
function MultiSelectTabContent({ sub, suspended, onBet, tabKey, min, max, allowRepeat, compose, hint, picks, setPicks }) {
  const odds = findOdds(sub, tabKey);

  const toggle = (n) => {
    if (suspended) return;
    setPicks((prev) => {
      if (allowRepeat) {
        if (prev.length >= max) return prev;
        return [...prev, n];
      }
      if (prev.includes(n)) return prev.filter((x) => x !== n);
      if (prev.length >= max) return prev;
      return [...prev, n];
    });
  };

  const count = picks.length;
  const ready = count >= min && count <= max;
  const isSelected = (n) => picks.includes(n);

  const place = () => {
    if (suspended || !ready) return;
    const natLabel = compose(picks);
    const item = findItemByNat(sub, natLabel) || sub?.[0];
    const betOdds = parseFloat(item?.b) || odds || 1;
    onBet(betOdds, natLabel, item, "back");
  };

  return (
    <div className={`worli-full${suspended ? " suspended-box" : ""}`}>
      <div className="worli-box-title">
        <b>{odds || ""}</b>
        <span className="ms-2 worli-multi-hint">
          {count ? `Selected: ${compose(picks).replace(/^[^0-9]+/, "")} (${count}/${max})` : hint}
        </span>
      </div>
      <div className="worli-box-row">
        {ROW1.map((n) => (
          <WorliOddBox key={n} label={n} selected={isSelected(n)} onClick={() => toggle(n)} />
        ))}
      </div>
      <div className="worli-box-row">
        {ROW2.map((n) => (
          <WorliOddBox key={n} label={n} selected={isSelected(n)} onClick={() => toggle(n)} />
        ))}
      </div>
      <div className="worli-box-row worli-multi-actions">
        <div
          className={`worli-odd-box back worli-place-btn${ready ? " selected" : " disabled"}`}
          onClick={place}
        >
          <span className="worli-odd">PLACE</span>
        </div>
        <div
          className="worli-odd-box lay worli-clear-btn"
          onClick={() => !suspended && setPicks([])}
        >
          <span className="worli-odd">CLEAR</span>
        </div>
      </div>
    </div>
  );
}

function LeftRightTabContent({ sub, suspended, onBet, tabKey, allLabel, natPrefix, selectedKey }) {
  const odds = findOdds(sub, tabKey);
  const handleClick = (label) => {
    if (suspended) return;
    const natLabel = `${natPrefix} ${label}`;
    const item = findItemByNat(sub, natLabel) || sub?.[0];
    const betOdds = parseFloat(item?.b) || odds || 1;
    onBet(betOdds, natLabel, item, "back");
  };
  const isSelected = (label) => selectedKey === `${tabKey}-${natPrefix} ${label}`;

  return (
    <div className={`worlibox${suspended ? " suspended-box" : ""}`}>
      <div className="worli-box-title"></div>
      <div className="worli-left">
        <div className="worli-box-row">
          {ROW1.map((n) => (
            <WorliOddBox key={n} label={n} selected={isSelected(n)} onClick={() => handleClick(n)} />
          ))}
        </div>
        <div className="worli-box-row">
          {ROW2.map((n) => (
            <WorliOddBox key={n} label={n} selected={isSelected(n)} onClick={() => handleClick(n)} />
          ))}
        </div>
      </div>
      <div className="worli-right">
        <div className="worli-box-row">
          <WorliOddBox label={allLabel} selected={isSelected(allLabel)} onClick={() => handleClick(allLabel)} />
        </div>
      </div>
    </div>
  );
}

function TrioTabContent({ sub, suspended, onBet, selectedKey }) {
  const odds = findOdds(sub, "trio");
  const handleClick = () => {
    if (suspended) return;
    const item = findItemByNat(sub, "Trio") || sub?.[0];
    const betOdds = parseFloat(item?.b) || odds || 1;
    onBet(betOdds, "ALL TRIO", item, "back");
  };

  return (
    <div className={`worli-full${suspended ? " suspended-box" : ""}`}>
      <div className="worli-box-title"></div>
      <div className="worli-box-row">
        <div className={`worli-odd-box back${selectedKey === "trio-ALL TRIO" ? " selected" : ""}`} onClick={handleClick}>
          <span className="worli-odd">ALL TRIO</span>
        </div>
      </div>
    </div>
  );
}

function FullGridTabContent({ sub, suspended, onBet, tabKey, natPrefix, selectedKey }) {
  const odds = findOdds(sub, tabKey);
  const handleClick = (n) => {
    if (suspended) return;
    const natLabel = `${natPrefix} ${n}`;
    const item = findItemByNat(sub, natLabel) || sub?.[0];
    const betOdds = parseFloat(item?.b) || odds || 1;
    onBet(betOdds, natLabel, item, "back");
  };
  const isSelected = (n) => selectedKey === `${tabKey}-${natPrefix} ${n}`;

  return (
    <div className={`worli-full${suspended ? " suspended-box" : ""}`}>
      <div className="worli-box-title"></div>
      <div className="worli-box-row">
        {ROW1.map((n) => (
          <WorliOddBox key={n} label={n} selected={isSelected(n)} onClick={() => handleClick(n)} />
        ))}
      </div>
      <div className="worli-box-row">
        {ROW2.map((n) => (
          <WorliOddBox key={n} label={n} selected={isSelected(n)} onClick={() => handleClick(n)} />
        ))}
      </div>
    </div>
  );
}

function ABRTabContent({ sub, suspended, onBet, selectedKey }) {
  const odds = findOdds(sub, "abr");
  const handleClick = (label) => {
    if (suspended) return;
    const item = findItemByNat(sub, `ABR ${label}`) || findItemByNat(sub, label) || sub?.[0];
    const betOdds = parseFloat(item?.b) || odds || 1;
    onBet(betOdds, label, item, "back");
  };
  const isSelected = (label) => selectedKey === `abr-${label}`;

  return (
    <div className={`worlibox${suspended ? " suspended-box" : ""}`}>
      <div className="worli-box-title"></div>
      <div className="worli-left">
        <div className="worli-box-row">
          {["A", "B", "R"].map((n) => (
            <WorliOddBox key={n} label={n} selected={isSelected(n)} onClick={() => handleClick(n)} />
          ))}
        </div>
        <div className="worli-box-row">
          {["AB", "AR", "BR"].map((n) => (
            <WorliOddBox key={n} label={n} selected={isSelected(n)} onClick={() => handleClick(n)} />
          ))}
        </div>
      </div>
      <div className="worli-right">
        <div className="worli-box-row">
          <WorliOddBox label="ABR" selected={isSelected("ABR")} onClick={() => handleClick("ABR")} />
        </div>
        <div className="worli-box-row">
          <WorliOddBox label="ABR CUT" selected={isSelected("ABR CUT")} onClick={() => handleClick("ABR CUT")} />
        </div>
      </div>
    </div>
  );
}

// compose helpers for the multi-select tabs — must match resolveWorli parsing.
const cycleCompose = (d) => `Cycle ${[...d].sort((a, b) => a - b).join("-")}`;
const motorCompose = (d) => `Motor ${[...d].sort((a, b) => a - b).join(",")}`;
const panaCompose = (d) => `Pana ${d.join("")}`;

function renderTab(tabKey, sub, suspended, onBet, selectedKey, picks, setPicks) {
  const sel = selectedKey || "";
  switch (tabKey) {
    case "single":
      return <SingleTabContent sub={sub} suspended={suspended} onBet={onBet} selectedKey={sel} />;
    case "pana":
      return (
        <MultiSelectTabContent
          sub={sub} suspended={suspended} onBet={onBet}
          tabKey="pana" min={3} max={3} allowRepeat={true}
          compose={panaCompose} hint="Pick a 3-digit Pana" picks={picks} setPicks={setPicks}
        />
      );
    case "sp":
      return (
        <LeftRightTabContent
          sub={sub} suspended={suspended} onBet={onBet} selectedKey={sel}
          tabKey="sp" allLabel="SP ALL" natPrefix="SP"
        />
      );
    case "dp":
      return (
        <LeftRightTabContent
          sub={sub} suspended={suspended} onBet={onBet} selectedKey={sel}
          tabKey="dp" allLabel="DP ALL" natPrefix="DP"
        />
      );
    case "trio":
      return <TrioTabContent sub={sub} suspended={suspended} onBet={onBet} selectedKey={sel} />;
    case "cycle":
      return (
        <MultiSelectTabContent
          sub={sub} suspended={suspended} onBet={onBet}
          tabKey="cycle" min={2} max={2} allowRepeat={false}
          compose={cycleCompose} hint="Pick 2 digits" picks={picks} setPicks={setPicks}
        />
      );
    case "motor":
      return (
        <MultiSelectTabContent
          sub={sub} suspended={suspended} onBet={onBet}
          tabKey="motor" min={4} max={9} allowRepeat={false}
          compose={motorCompose} hint="Pick 4–9 digits" picks={picks} setPicks={setPicks}
        />
      );
    case "chart56":
      return (
        <LeftRightTabContent
          sub={sub} suspended={suspended} onBet={onBet} selectedKey={sel}
          tabKey="chart56" allLabel="56 ALL" natPrefix="56"
        />
      );
    case "chart64":
      return (
        <LeftRightTabContent
          sub={sub} suspended={suspended} onBet={onBet} selectedKey={sel}
          tabKey="chart64" allLabel="64 ALL" natPrefix="64"
        />
      );
    case "abr":
      return <ABRTabContent sub={sub} suspended={suspended} onBet={onBet} selectedKey={sel} />;
    case "commonsp":
      return (
        <FullGridTabContent
          sub={sub} suspended={suspended} onBet={onBet} selectedKey={sel}
          tabKey="commonsp" natPrefix="Common SP"
        />
      );
    case "commondp":
      return (
        <FullGridTabContent
          sub={sub} suspended={suspended} onBet={onBet} selectedKey={sel}
          tabKey="commondp" natPrefix="Common DP"
        />
      );
    case "colordp":
      return (
        <LeftRightTabContent
          sub={sub} suspended={suspended} onBet={onBet} selectedKey={sel}
          tabKey="colordp" allLabel="COLOR DP ALL" natPrefix="Color DP"
        />
      );
    default:
      return null;
  }
}

export default function BetTableWorli({ gameData, onBet, exposures = {}, showPlaceBet }) {
  const [activeTab, setActiveTab] = useState("single");
  const [selectedKey, setSelectedKey] = useState("");
  // accumulated digits for multi-select tabs (cycle / motor / pana-3digit)
  const [picks, setPicks] = useState([]);

  useEffect(() => {
    if (!showPlaceBet) {
      setSelectedKey("");
      setPicks([]);
    }
  }, [showPlaceBet]);

  // reset multi-select accumulation when switching tabs
  useEffect(() => { setPicks([]); }, [activeTab]);

  const handleBet = (odds, natLabel, item, type) => {
    setSelectedKey(`${activeTab}-${natLabel}`);
    onBet(odds, natLabel, item, type);
  };

  const raw = gameData?.data?.data || gameData?.data || gameData || {};
  const sub = Array.isArray(raw.sub) ? raw.sub : [];
  const gstatus = raw.gstatus || "";
  const hasSuspendedStatus = gstatus === "SUSPENDED" || gstatus === "CLOSED" || gstatus === "0";
  const subWithStatus = sub.filter((s) => s.gstatus);
  const allSubSuspended = subWithStatus.length > 0 && subWithStatus.every((s) => s.gstatus !== "OPEN" && s.gstatus !== "1");
  const suspended = hasSuspendedStatus || allSubSuspended;

  return (
    <div className="casino-table">
      <div className="nav nav-pills" role="tablist">
        {TABS.map((tab) => (
          <div key={tab.key} className="nav-item">
            <a
              role="tab"
              className={`nav-link${activeTab === tab.key ? " active" : ""}`}
              href="#"
              onClick={(e) => { e.preventDefault(); setActiveTab(tab.key); }}
            >
              {tab.label}
            </a>
          </div>
        ))}
      </div>
      <div className="tab-content w-100">
        {TABS.map((tab) => (
          <div
            key={tab.key}
            className={`fade ${tab.key} tab-pane${activeTab === tab.key ? " active show" : ""}`}
          >
            {activeTab === tab.key && renderTab(tab.key, sub, suspended, handleBet, selectedKey, picks, setPicks)}
          </div>
        ))}
      </div>
    </div>
  );
}
