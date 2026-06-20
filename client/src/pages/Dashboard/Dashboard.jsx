import React, { useState } from "react";
import {
  Book,
  BookPlus,
  User,
  UserPlus,
  ArrowUpRight,
  PlusCircle,
  Search,
  Activity,
  IdCard,
  FilePlus,
} from "lucide-react";
import api from "@/utils/api";
import useSWR from "swr";
import LoadingDashboard from "../../components/LoadingDashboard";
import DonutChart from "../../components/DonutChart";
import LoadingTable from "../../components/LoadingTable";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Link } from "react-router-dom";
import AreaChart from "../../components/AreaChart";

dayjs.extend(utc);
dayjs.extend(timezone);

export function Dashboard() {
  const [patient6Month, setPatient6Month] = useState(true);
  const [medicalRecord6Month, setMedicalRecord6Month] = useState(true);

  const fetcher = async (url) => {
    const response = await api.get(url);
    return response.data;
  };

  const { data, error, isLoading } = useSWR(`/dashboard/summary`, fetcher, {
    revalidateOnFocus: false,
  });

  const {
    data: dataPatient,
    error: errorPatient,
    isLoading: isLoadingPatient,
  } = useSWR(`/patient?limit=5`, fetcher, { revalidateOnFocus: false });

  if (error || errorPatient)
    return (
      <div className="alert alert-error max-w-md mx-auto mt-10 rounded-2xl">
        Gagal memuat data dashboard.
      </div>
    );
  if (isLoading) return <LoadingDashboard />;

  // Sinkronisasi Warna Chart ke Tema Medis Modern (#0284c7)
  const chartColors = ["#0284c7", "#38bdf8", "#0ea5e9", "#7dd3fc"];

  const patientData = patient6Month
    ? data.trends.patientData6Months
    : data.trends.patientData12Months;

  const medicalRecordData = medicalRecord6Month
    ? data.trends.medicalRecordData6Months
    : data.trends.medicalRecordData12Months;

  return (
    <div className="space-y-6">
      {/* SECTION 1: HEADER & QUICK ACTIONS (Ditambah Tombol Baru) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-4 sm:p-5 rounded-2xl border border-base-300/60 shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-base-content flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Ringkasan Klinik
          </h1>
          <p className="text-xs text-base-content/60">
            Berikut data pantauan rekam medis saat ini.
          </p>
        </div>

        {/* AREA TOMBOL-TOMBOL QUICK ACTIONS */}
        {/* flex-wrap bikin tombol otomatis turun ke bawah kalau di HP layar kecil agar tidak terpotong */}
        <div className="grid grid-cols-2 md:flex md:flex-row items-center gap-2 w-full md:w-auto">
          <Link
            to="/rekam-medis"
            className="btn btn-primary btn-sm rounded-xl font-semibold gap-1.5 shadow-sm text-xs"
          >
            <FilePlus className="h-4 w-4" /> Rekam Medis
          </Link>

          <Link
            to="/kartu-garansi"
            className="btn btn-outline btn-primary btn-sm rounded-xl font-semibold gap-1.5 text-xs"
          >
            <IdCard className="h-4 w-4" /> Kartu Garansi
          </Link>

          <Link
            to="/stok-lensa"
            className="btn btn-outline btn-sm rounded-xl font-medium gap-1.5 text-xs"
          >
            <Search className="h-4 w-4" /> Cek Stok
          </Link>
        </div>
      </div>

      {/* SECTION 2: STAT CARDS (Super Simple & Compact Mobile View) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Patients */}
        <div className="bg-base-100 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-base-300/60 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0 hidden sm:block">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-base-content/50 uppercase tracking-wider block truncate">
              Total Pasien
            </span>
            <p className="text-xl sm:text-3xl font-extrabold text-base-content tracking-tight">
              {data.statistics.totalPatients}
            </p>
          </div>
        </div>

        {/* New Patients */}
        <div className="bg-base-100 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-base-300/60 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0 hidden sm:block">
            <UserPlus className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-base-content/50 uppercase tracking-wider block truncate">
              Pasien Baru
            </span>
            <div className="flex items-baseline gap-1.5">
              <p className="text-xl sm:text-3xl font-extrabold text-base-content tracking-tight">
                {data.statistics.patientsThisMonth}
              </p>
              <span className="text-[9px] sm:text-xs font-medium text-success sm:bg-success/10 sm:px-2 sm:py-0.5 rounded-full">
                Bulan Ini
              </span>
            </div>
          </div>
        </div>

        {/* Total Medical Records */}
        <div className="bg-base-100 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-base-300/60 shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0 hidden sm:block">
            <Book className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-base-content/50 uppercase tracking-wider block truncate">
              Total Berkas RM
            </span>
            <p className="text-xl sm:text-3xl font-extrabold text-base-content tracking-tight">
              {data.statistics.totalMedicalRecords}
            </p>
          </div>
        </div>

        {/* New Medical Record */}
        <div className="bg-base-100 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-base-300/60 shadow-sm flex items-center gap-3 text-left">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0 hidden sm:block">
            <BookPlus className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-base-content/50 uppercase tracking-wider block truncate">
              Berkas Baru
            </span>
            <div className="flex items-baseline gap-1.5">
              <p className="text-xl sm:text-3xl font-extrabold text-base-content tracking-tight">
                {data.statistics.medicalRecordsThisMonth}
              </p>
              <span className="text-[9px] sm:text-xs font-medium text-amber-600 sm:bg-amber-50 sm:px-2 sm:py-0.5 rounded-full">
                Bulan Ini
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: LINE & BAR TREND CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pasien Trend */}
        <div className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm p-4 sm:p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-bold text-sm tracking-tight">
                Tren Kunjungan Pasien
              </h2>
              <p className="text-xs text-base-content/50">
                Statistik jumlah pasien masuk
              </p>
            </div>
            <button
              onClick={() => setPatient6Month(!patient6Month)}
              className="btn btn-sm btn-ghost bg-base-200 hover:bg-base-300 text-xs font-semibold rounded-lg"
            >
              {patient6Month ? "6 Bulan" : "12 Bulan"}
            </button>
          </div>
          <AreaChart
            name="Pasien"
            dataSource={patientData}
            valueKey="patientCount"
          />
        </div>

        {/* Medical Record Trend */}
        <div className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm p-4 sm:p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-bold text-sm tracking-tight">
                Tren Berkas Rekam Medis
              </h2>
              <p className="text-xs text-base-content/50">
                Jumlah dokumen medis terbit
              </p>
            </div>
            <button
              onClick={() => setMedicalRecord6Month(!medicalRecord6Month)}
              className="btn btn-sm btn-ghost bg-base-200 hover:bg-base-300 text-xs font-semibold rounded-lg"
            >
              {medicalRecord6Month ? "6 Bulan" : "12 Bulan"}
            </button>
          </div>
          <AreaChart
            name="Rekam Medis"
            dataSource={medicalRecordData}
            valueKey="recordCount"
          />
        </div>
      </div>

      {/* SECTION 4: DEMOGRAFI & DISTRIBUSI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Age */}
        <div className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm p-5 flex flex-col justify-between">
          <h2 className="font-bold text-sm mb-3">Distribusi Umur</h2>
          <div className="flex justify-center items-center grow py-2">
            <DonutChart
              series={data.distribution.ageData.map((item) => item.count)}
              labels={data.distribution.ageData.map(
                (item) => item.ageGroup + " Tahun",
              )}
              colors={chartColors}
            />
          </div>
        </div>

        {/* Gender */}
        <div className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm p-5 flex flex-col justify-between">
          <h2 className="font-bold text-sm mb-3">Distribusi Gender</h2>
          <div className="flex justify-center items-center grow py-2">
            <DonutChart
              series={data.distribution.genderData.map((item) => item.count)}
              labels={data.distribution.genderData.map((item) => item.gender)}
              colors={["#0284c7", "#f43f5e"]}
            />
          </div>
        </div>

        {/* Occupations */}
        <div className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm p-5 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <h2 className="font-bold text-sm mb-3">Pekerjaan Terbanyak</h2>
          <div className="flex justify-center items-center grow py-2">
            <DonutChart
              series={data.distribution.occupationData.map(
                (item) => item.count,
              )}
              labels={data.distribution.occupationData.map(
                (item) => item.occupation,
              )}
              colors={chartColors}
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: RECENT PATIENTS LIST */}
      <div className="bg-base-100 border border-base-300/60 rounded-2xl shadow-sm p-4 sm:p-5">
        {/* HEADER KARTU */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-bold text-sm sm:text-base tracking-tight text-base-content">
              Pasien Terbaru
            </h2>
            <p className="text-[11px] sm:text-xs text-base-content/50">
              Daftar pendaftaran pasien paling akhir
            </p>
          </div>
          <Link
            to="/medical-record/patients"
            className="btn btn-ghost btn-xs text-primary font-semibold gap-1"
          >
            Lihat Semua →
          </Link>
        </div>

        {/* VIEW 1: KHUSUS MOBILE (Menggunakan Flex List - Tanpa Tag Table Bawaan) */}
        <div className="block md:hidden divide-y divide-base-200/60">
          {!isLoadingPatient ? (
            dataPatient.data.map(({ name, createdAt }, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 gap-3 first:pt-1 last:pb-1"
              >
                {/* Sisi Kiri: Nomor & Nama */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs text-base-content/30 w-4 shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-xs font-semibold text-base-content truncate tracking-tight">
                    {
                      name.toUpperCase() /* Gunakan uppercase murni atau normalkan dari DB */
                    }
                  </p>
                </div>

                {/* Sisi Kanan: Tanggal & Jam Ramping */}
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-base-content/80">
                    {dayjs(createdAt).tz("Asia/Jakarta").format("DD MMM YYYY")}
                  </p>
                  <p className="text-[10px] font-mono text-base-content/40 mt-0.5">
                    {dayjs(createdAt).tz("Asia/Jakarta").format("HH:mm")} WIB
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-xs text-base-content/50">
              Memuat data...
            </div>
          )}
        </div>

        {/* VIEW 2: KHUSUS DESKTOP (Tabel Normal Kamu yang Lama) */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="table table-sm w-full">
            <thead>
              <tr className="border-b border-base-300 text-base-content/40 text-xs">
                <th className="w-12 text-center">#</th>
                <th>Nama Pasien</th>
                <th>Tanggal Registrasi</th>
              </tr>
            </thead>
            <tbody>
              {!isLoadingPatient ? (
                dataPatient.data.map(({ name, createdAt }, index) => (
                  <tr
                    key={index}
                    className="hover:bg-base-200/40 transition-colors border-b border-base-200"
                  >
                    <td className="text-center font-mono text-xs text-base-content/40">
                      {index + 1}
                    </td>
                    <td className="font-semibold text-xs text-base-content capitalize">
                      {name.toLowerCase()}
                    </td>
                    <td className="text-xs text-base-content/60">
                      {dayjs(createdAt)
                        .tz("Asia/Jakarta")
                        .format("DD-MM-YYYY — HH:mm")}
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
  );
}

export default Dashboard;
