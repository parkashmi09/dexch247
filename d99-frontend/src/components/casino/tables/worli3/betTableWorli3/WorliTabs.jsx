import JodiTab from "./JodiTab.jsx";
import SingleTab from "./SingleTab.jsx";
import PanaTab from "./PanaTab.jsx";
import SPTab from "./SPTab.jsx";
import DPTab from "./DPTab.jsx";
import TrioTab from "./TrioTab.jsx";
import CycleTab from "./CycleTab.jsx";
import MotorSPTab from "./MotorSPTab.jsx";
import Chart56Tab from "./Chart56Tab.jsx";
import Chart64Tab from "./Chart64Tab.jsx";
import ABRTab from "./ABRTab.jsx";
import CommonSPTab from "./CommonSPTab.jsx";
import CommonDPTab from "./CommonDPTab.jsx";
import ColorDPTab from "./ColorDPTab.jsx";

const TABS = [
  { key: "jodi", label: "Jodi" },
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

// Standard matka payout rates shown in each tab's title. These are fixed
// (the worli3 API only returns the market schedule, no rates), so they live
// here. Tabs without a listed rate render an empty title (matches reference).
const RATES = {
  jodi: "90",
  single: "9.5",
  sp: "140",
  dp: "280",
  commonsp: "140",
  commondp: "280",
  colordp: "280",
};

function renderTabContent(key, onBetSelect, selectedBets, suspended) {
  const props = { onBetSelect, selectedBets, suspended, rate: RATES[key] };
  switch (key) {
    case "jodi": return <JodiTab {...props} />;
    case "single": return <SingleTab {...props} />;
    case "pana": return <PanaTab {...props} />;
    case "sp": return <SPTab {...props} />;
    case "dp": return <DPTab {...props} />;
    case "trio": return <TrioTab {...props} />;
    case "cycle": return <CycleTab {...props} />;
    case "motor": return <MotorSPTab {...props} />;
    case "chart56": return <Chart56Tab {...props} />;
    case "chart64": return <Chart64Tab {...props} />;
    case "abr": return <ABRTab {...props} />;
    case "commonsp": return <CommonSPTab {...props} />;
    case "commondp": return <CommonDPTab {...props} />;
    case "colordp": return <ColorDPTab {...props} />;
    default: return null;
  }
}

export default function WorliTabs({ activeTab, onTabChange, onBetSelect, selectedBets = [], suspended = false }) {
  return (
    <>
      <div className="nav nav-pills" role="tablist">
        {TABS.map((tab) => (
          <div key={tab.key} className="nav-item">
            <a
              role="tab"
              data-rr-ui-event-key={tab.key}
              id={`worli-tabs-tab-${tab.key}`}
              aria-controls={`worli-tabs-tabpane-${tab.key}`}
              aria-selected={activeTab === tab.key}
              className={`nav-link${activeTab === tab.key ? " active" : ""}`}
              tabIndex={activeTab === tab.key ? 0 : -1}
              href="#"
              onClick={(e) => { e.preventDefault(); onTabChange(tab.key); }}
            >
              {tab.label}
            </a>
          </div>
        ))}
      </div>
      <div className="casino-box tab-content w-100 tab-content">
        {TABS.map((tab) => (
          <div
            key={tab.key}
            id={`worli-tabs-tabpane-${tab.key}`}
            role="tabpanel"
            aria-labelledby={`worli-tabs-tab-${tab.key}`}
            className={`fade ${tab.key} tab-pane${activeTab === tab.key ? " active show" : ""}`}
          >
            {activeTab === tab.key && renderTabContent(tab.key, onBetSelect, selectedBets, suspended)}
          </div>
        ))}
      </div>
    </>
  );
}
