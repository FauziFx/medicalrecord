import React from "react";
import Chart from "react-apexcharts";

function DonutChart({ series, labels, colors }) {
  const donutChartData = {
    series: series,
    options: {
      chart: {
        type: "donut",
        fontFamily: "inherit",
      },
      labels: labels,
      colors: colors || ["#0284c7", "#0ea5e9", "#38bdf8", "#7dd3fc"],
      stroke: {
        colors: ["var(--color-base-100)"],
        width: 2,
      },
      legend: {
        position: "bottom",
        fontSize: "12px",
        labels: {
          colors: "var(--color-base-content)",
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "11px",
        },
      },
    },
  };

  return (
    <div className="w-full max-w-[280px] mx-auto">
      <Chart
        options={donutChartData.options}
        series={donutChartData.series}
        type="donut"
        width="100%"
      />
    </div>
  );
}

export default DonutChart;
