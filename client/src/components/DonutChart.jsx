import React from "react";
import Chart from "react-apexcharts";

function DonutChart({ series, labels }) {
  const donutChartData = {
    series: series,
    options: {
      chart: {
        width: "100%",
        type: "donut",
      },
      labels: labels,
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  };
  return (
    <Chart
      options={donutChartData.options}
      series={donutChartData.series}
      type="donut"
      width={300}
    />
  );
}

export default DonutChart;
