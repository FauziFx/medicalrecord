// src/routes/routes.js
import { Dashboard } from "@/pages/Dashboard";
import {
  PatientAdd,
  PatientEdit,
  MedicalRecords,
  MedicalRecordAdd,
} from "@/pages/MedicalRecord";
import { Optic } from "@/pages/Optic";
import { Stock } from "@/pages/Stock";
import { Warranties, WarrantyClaimAdd } from "@/pages/Warranty";
import { Users } from "@/pages/Users";
import { RecycleBin } from "@/pages/RecycleBin";
import { Profile } from "@/pages/Profile";
import MedicalRecordLayout from "@/layouts/MedicalRecordLayout";
import WarrantyLayout from "@/layouts/WarrantyLayout";
import {
  House,
  Book,
  Trash2,
  User,
  Store,
  Users as UsersIcon,
  IdCard,
  PackageSearch,
} from "lucide-react";

const routes = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <House className="h-4 w-4" />,
    component: Dashboard,
    showInMenu: true,
    roles: ["admin", "user"],
  },
  {
    name: "Rekam Medis",
    path: "/rekam-medis",
    icon: <Book className="h-4 w-4" />,
    component: MedicalRecords,
    showInMenu: true,
    roles: ["admin", "user"],
  },
  {
    name: "Tambah Pasien",
    path: "/rekam-medis/tambah-pasien",
    icon: <Book className="h-4 w-4" />,
    component: PatientAdd,
    showInMenu: false,
    roles: ["admin", "user"],
  },
  {
    name: "Edit Pasien",
    path: "/rekam-medis/:id/edit",
    icon: <Book className="h-4 w-4" />,
    component: PatientEdit,
    showInMenu: false,
    roles: ["admin", "user"],
  },
  {
    name: "Tambah Rekam Medis",
    path: "/rekam-medis/tambah",
    icon: <Book className="h-4 w-4" />,
    component: MedicalRecordAdd,
    showInMenu: false,
    roles: ["admin", "user"],
  },
  {
    name: "Kartu Garansi",
    path: "/kartu-garansi",
    icon: <IdCard className="h-4 w-4" />,
    component: Warranties,
    showInMenu: true,
    roles: ["admin", "user"],
  },
  {
    name: "Klaim Garansi",
    path: "/kartu-garansi/klaim",
    icon: <IdCard className="h-4 w-4" />,
    component: WarrantyClaimAdd,
    showInMenu: false,
    roles: ["admin", "user"],
  },
  {
    name: "Stock Lens",
    path: "/stocks",
    icon: <PackageSearch className="h-4 w-4" />,
    component: Stock,
    showInMenu: true,
    roles: ["admin", "user"],
  },
  {
    name: "Optics",
    path: "/optics", // Halaman Add/Edit gabung di sini atau pakai parameter URL langsung
    icon: <Store className="h-4 w-4" />,
    component: Optic,
    showInMenu: true,
    roles: ["admin"],
  },
  {
    name: "Users",
    path: "/users",
    icon: <UsersIcon className="h-4 w-4" />,
    component: Users,
    showInMenu: true,
    roles: ["admin"],
  },
  {
    name: "Recycle Bin",
    path: "/recycle-bin",
    icon: <Trash2 className="h-4 w-4" />,
    component: RecycleBin,
    showInMenu: true,
    roles: ["admin"],
  },
  {
    name: "Profile",
    path: "/profile",
    icon: <User className="h-4 w-4" />,
    component: Profile,
    showInMenu: true,
    roles: ["admin", "user"],
  },
];

export default routes;
