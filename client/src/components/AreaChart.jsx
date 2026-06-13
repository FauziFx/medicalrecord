import React from "react";
import Chart from "react-apexcharts";

function AreaChart({ name, dataSource, valueKey }) {
  const areaChartData = {
    series: [
      {
        name,
        data: dataSource.map((item) => item[valueKey]),
      },
    ],
    options: {
      chart: {
        type: "area",
        toolbar: { show: false },
        fontFamily: "inherit",
      },
      colors: ["#0284c7"],
      dataLabels: { enabled: false },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.25,
          opacityTo: 0.05,
        },
      },
      labels: dataSource.map((item) => item.month),
      grid: {
        borderColor: "var(--color-base-300)",
        strokeDashArray: 4,
      },
    },
  };

  return (
    <>
      <Chart
        options={areaChartData.options}
        series={areaChartData.series}
        type="area"
        height={240}
      />
    </>
  );
}

export default AreaChart;
