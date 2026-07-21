// PieChart.js
import { Chart } from "react-google-charts";

export function PieChart({data}) {
  

  const options = {
    pieHole: 0.4,
    is3D: true,
    pieStartAngle: 100,
    sliceVisibilityThreshold: 0.02,
    legend: {
      position: "right", 
      alignment: "center",
      textStyle: {
        color: "#333",
        fontSize: 14,
      },
    },
    chartArea: {
      left: 0,
      top: 20,
      width: "70%",
      height: "90%",
    },
    colors: ["#ae2130", "#086cb8", "#279532"],
  };

  return (
    <div style={{ width: "100%", maxWidth: "320px", margin: "0 auto" }}>
      <h3
        style={{
          textAlign: "center",
          fontSize: "18px",
          
          color: "#333",
        }}
      >
        Statistics
      </h3>
      <Chart
        chartType="PieChart"
        data={data}
        options={options}
        width={"100%"}
        height={"250px"}
      />
    </div>
  );
}
