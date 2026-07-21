import { useState } from "react";

const SP_PANA_DATA = {
  "1": [128, 137, 146, 236, 245, 290, 380, 470, 489, 560, 579, 678],
  "2": [129, 138, 147, 156, 237, 246, 345, 390, 480, 570, 589, 679],
  "3": [120, 139, 148, 157, 238, 247, 256, 346, 490, 580, 670, 689],
  "4": [130, 149, 158, 167, 239, 248, 257, 347, 356, 590, 680, 789],
  "5": [140, 159, 168, 230, 249, 258, 267, 348, 357, 456, 690, 780],
  "6": [123, 150, 169, 178, 240, 259, 268, 349, 358, 367, 457, 790],
  "7": [124, 160, 179, 250, 269, 278, 340, 359, 368, 458, 467, 890],
  "8": [125, 134, 170, 189, 260, 279, 350, 369, 378, 459, 468, 567],
  "9": [126, 135, 180, 234, 270, 289, 360, 379, 450, 469, 478, 568],
  "0": [127, 136, 145, 190, 235, 280, 370, 389, 460, 479, 569, 578],
};

const DP_PANA_DATA = {
  "1": [100, 119, 155, 227, 244, 299, 335, 388, 446, 599, 668, 677],
  "2": [200, 110, 228, 255, 337, 344, 399, 445, 588, 669, 778, 688],
  "3": [300, 166, 229, 338, 355, 446, 599, 779, 688, 120, 139, 148],
  "4": [400, 112, 220, 266, 338, 355, 446, 779, 888, 149, 158, 167],
  "5": [500, 113, 122, 230, 266, 338, 446, 590, 680, 789, 159, 168],
  "6": [600, 114, 123, 330, 177, 249, 258, 267, 339, 448, 357, 456],
  "7": [700, 115, 133, 224, 259, 268, 277, 349, 358, 448, 169, 178],
  "8": [800, 116, 224, 233, 179, 188, 269, 278, 377, 449, 359, 368],
  "9": [900, 117, 144, 225, 234, 288, 279, 369, 378, 459, 468, 126],
  "0": [550, 668, 244, 299, 118, 127, 136, 145, 190, 235, 280, 370],
};

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

function PanaGroup({ digit, items, onBetSelect, selectedBets, tabKey, suspended }) {
  const isSelected = (val) =>
    selectedBets.some((b) => b.label === String(val) && b.tab === tabKey);

  return (
    <div className="worli-odd-box">
      <span className="worli-odd back">{digit}</span>
      <div className="worli-sub-odd-box-container">
        {items.map((val) => (
          <div
            key={val}
            className={`worli-sub-odd-box back${isSelected(val) ? " selected" : ""}`}
            onClick={() => !suspended && onBetSelect({ label: String(val), tab: tabKey })}
          >
            <span className="worli-odd">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PanaTab({ onBetSelect, selectedBets = [], suspended }) {
  const [subTab, setSubTab] = useState("sp");
  const data = subTab === "sp" ? SP_PANA_DATA : DP_PANA_DATA;
  const tabKey = subTab === "sp" ? "pana-sp" : "pana-dp";

  return (
    <div className={`worlibox${suspended ? " suspended-box" : ""}`}>
      <div className="worli-full">
        <ul className="nav nav-pills">
          <li className="nav-item">
            <button
              className={`nav-link${subTab === "sp" ? " active" : ""}`}
              onClick={() => setSubTab("sp")}
              type="button"
            >
              SP PANA (<b>140</b>)
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link${subTab === "dp" ? " active" : ""}`}
              onClick={() => setSubTab("dp")}
              type="button"
            >
              DP PANA (<b>280</b>) &amp; TRIO (<b>700</b>)
            </button>
          </li>
        </ul>
        <div className="tab-content">
          <div className="tab-pane active" id={subTab === "sp" ? "sppana" : "dppana"}>
            <div className="worli-box-row">
              {DIGITS.map((digit) => (
                <PanaGroup
                  key={digit}
                  digit={digit}
                  items={data[digit]}
                  onBetSelect={onBetSelect}
                  selectedBets={selectedBets}
                  tabKey={tabKey}
                  suspended={suspended}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
