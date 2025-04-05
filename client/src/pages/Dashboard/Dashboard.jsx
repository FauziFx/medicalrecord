import React, { useState } from "react";
import Chart from "react-apexcharts";
import {
  Book,
  BookPlus,
  Eye,
  Package,
  ShoppingBag,
  User,
  UserPlus,
} from "lucide-react";
import api from "@/utils/api";
import useSWR from "swr";
import LoadingDashboard from "../../components/LoadingDashboard";
import DonutChart from "../../components/DonutChart";
import LoadingTable from "../../components/LoadingTable";
import dayjs from "dayjs"; // Core Day.js
import utc from "dayjs/plugin/utc"; // Plugin UTC
import timezone from "dayjs/plugin/timezone"; // Plugin Timezone
import { Link } from "react-router-dom";

// Extend plugins ke Day.js
dayjs.extend(utc);
dayjs.extend(timezone);

export function Dashboard() {
  const [patient6Month, setPatient6Month] = useState(true);
  const [medicalRecord6Month, setMedicalRecord6Month] = useState(true);

  const fetcher = async (url) => {
    try {
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const { data, error, isLoading } = useSWR(`/dashboard/summary`, fetcher, {
    revalidateOnFocus: false,
  });
  const {
    data: dataPatient,
    error: errorPatient,
    isLoading: isLoadingPatient,
  } = useSWR(`/patient?limit=5`, fetcher, { revalidateOnFocus: false });

  if (error || errorPatient) return <p>Error loading data.</p>;
  if (isLoading) return <LoadingDashboard />;

  const areaChartData = {
    series: [
      {
        name: "Patient",
        data: patient6Month
          ? data.trends.patientData6Months.map((item) => item.patientCount)
          : data.trends.patientData12Months.map((item) => item.patientCount),
      },
    ],
    options: {
      chart: {
        type: "area",
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "straight",
      },
      labels: patient6Month
        ? data.trends.patientData6Months.map((item) => item.month)
        : data.trends.patientData12Months.map((item) => item.month),
      yaxis: {
        opposite: true,
      },
      legend: {
        horizontalAlign: "left",
      },
    },
  };

  const barChartData = {
    series: [
      {
        name: "Medical Record",
        data: medicalRecord6Month
          ? data.trends.medicalRecordData6Months.map((item) => item.recordCount)
          : data.trends.medicalRecordData12Months.map(
              (item) => item.recordCount
            ),
      },
    ],
    options: {
      chart: {
        type: "bar",
        zoom: {
          enable: false,
        },
      },
      plotOptions: {
        bar: {
          columnWidth: "90%",
          distributed: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      xaxis: {
        categories: medicalRecord6Month
          ? data.trends.medicalRecordData6Months.map((item) => item.month)
          : data.trends.medicalRecordData12Months.map((item) => item.month),
      },
    },
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-primary text-primary-content p-2 px-4 shadow-md flex justify-between items-center rounded-xl">
          <div>
            <h3 className="text-md font-semibold">Patients</h3>
            <p className="text-xl font-bold">{data.statistics.totalPatients}</p>
            <span className="text-xs font-light">&nbsp;</span>
          </div>
          <User className="w-8 h-8 opacity-75" />
        </div>
        <div className="bg-secondary text-secondary-content p-2 px-4 shadow-md flex justify-between items-center rounded-xl">
          <div>
            <h3 className="text-md font-semibold">New Patients</h3>
            <p className="text-xl font-bold">
              {data.statistics.patientsThisMonth}
            </p>
            <span className="text-xs font-light">This Month</span>
          </div>
          <UserPlus className="w-8 h-8 opacity-75" />
        </div>
        <div className="bg-accent text-accent-content p-2 px-4 shadow-md flex justify-between items-center rounded-xl">
          <div>
            <h3 className="text-md font-semibold">Medical Records</h3>
            <p className="text-xl font-bold">
              {data.statistics.totalMedicalRecords}
            </p>
            <span className="text-xs font-light">&nbsp;</span>
          </div>
          <Book className="w-8 h-8 opacity-75" />
        </div>
        <div className="bg-neutral text-neutral-content p-2 px-4 shadow-md flex justify-between items-center rounded-xl">
          <div>
            <h3 className="text-md font-semibold">New Medical Record</h3>
            <p className="text-xl font-bold">
              {data.statistics.medicalRecordsThisMonth}
            </p>
            <span className="text-xs font-light">This Month</span>
          </div>
          <BookPlus className="w-8 h-8 opacity-75" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2">
        <div className="mb-4 bg-white border border-gray-300 rounded-xl shadow-md p-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold mb-2">Patients Trend</h2>
            <label className="swap swap-rotate bg-primary text-white p-4 py-1 rounded">
              <input
                type="checkbox"
                checked={!patient6Month} // Jika "checked", berarti 12 bulan
                onChange={() => setPatient6Month(!patient6Month)}
              />
              <div className="text-xs swap-on">12 Month</div>
              <div className="text-xs swap-off">6 Month</div>
            </label>
          </div>
          <Chart
            options={areaChartData.options}
            series={areaChartData.series}
            type="area"
            height={220}
          />
        </div>

        <div className="mb-4 bg-white border border-gray-300 rounded-xl shadow-md p-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold mb-2">Medical Record Trend</h2>
            <label className="swap swap-rotate bg-primary text-white p-4 py-1 rounded">
              <input
                type="checkbox"
                checked={!medicalRecord6Month} // Jika "checked", berarti 12 bulan
                onChange={() => setMedicalRecord6Month(!medicalRecord6Month)}
              />
              <div className="text-xs swap-on">12 Month</div>
              <div className="text-xs swap-off">6 Month</div>
            </label>
          </div>
          <Chart
            options={barChartData.options}
            series={barChartData.series}
            type="bar"
            height={220}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="mb-4 bg-white border border-gray-300 rounded-xl shadow-md p-4">
          <h2 className="font-semibold mb-2">Age Distribution</h2>
          <div className="flex justify-center items-center">
            <DonutChart
              series={data.distribution.ageData.map((item) => item.count)}
              labels={data.distribution.ageData.map(
                (item) => item.ageGroup + " Tahun"
              )}
            />
          </div>
        </div>
        <div className="mb-4 bg-white border border-gray-300 rounded-xl shadow-md p-4">
          <h2 className="font-semibold mb-2">Gender Distribution</h2>
          <div className="flex justify-center items-center">
            <DonutChart
              series={data.distribution.genderData.map((item) => item.count)}
              labels={data.distribution.genderData.map((item) => item.gender)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="mb-4 bg-white border border-gray-300 rounded-xl shadow-md p-4">
          <h2 className="font-semibold mb-2">Most Common Occupations</h2>
          <div className="flex justify-center items-center">
            <DonutChart
              series={data.distribution.occupationData.map(
                (item) => item.count
              )}
              labels={data.distribution.occupationData.map(
                (item) => item.occupation
              )}
            />
          </div>
        </div>
        <div className="mb-4 bg-white border border-gray-300 rounded-xl shadow-md p-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold mb-2">Recent Patient</h2>
            <Link
              to="/medical-record/patients"
              className="btn btn-link text-xs"
            >
              Details
            </Link>
          </div>
          <div className="flex justify-center items-center">
            <table className="table table-xs w-full table-auto">
              {/* Head */}
              <thead>
                <tr>
                  {["#", "Name", "Date"].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-2 text-left"
                    >
                      <p
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              {/* Body */}
              <tbody>
                {!isLoadingPatient ? (
                  dataPatient.data.map(({ name, createdAt }, index) => (
                    <tr key={index}>
                      <td className="border-b border-gray-200">{index + 1}</td>
                      <td className="border-b border-gray-200">
                        <p className="text-xs font-semibold capitalize">
                          {name.toLowerCase()}
                        </p>
                      </td>
                      <td className="border-b border-gray-200">
                        <p className="text-xs text-gray-500 font-light">
                          {dayjs(createdAt)
                            .tz("Asia/Jakarta")
                            .format("DD-MM-YYYY")}
                        </p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <LoadingTable row="5" colspan="3" />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
