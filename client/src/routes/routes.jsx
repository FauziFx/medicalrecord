// src/routes/routes.js
import { Dashboard } from "@/pages/Dashboard";
import { Patients, MedicalRecords } from "@/pages/MedicalRecord";
import { Optic } from "@/pages/Optic";
import { Stock } from "@/pages/Stock";
import { Warranties, WarrantyClaim } from "@/pages/Warranty";
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
    name: "Medical Record",
    path: "/medical-record",
    icon: <Book className="h-4 w-4" />,
    component: MedicalRecordLayout,
    showInMenu: true,
    roles: ["admin", "user"],
    children: [
      {
        name: "Patients",
        path: "/medical-record/patients", // Gabungkan halaman tambah/edit pakai modal di sini
        component: Patients,
        showInMenu: true,
        roles: ["admin", "user"],
      },
      {
        name: "Medical Records",
        path: "/medical-record/medical-records",
        component: MedicalRecords,
        showInMenu: true,
        roles: ["admin", "user"],
      },
    ],
  },
  {
    name: "Warranty",
    path: "/warranty",
    icon: <IdCard className="h-4 w-4" />,
    component: WarrantyLayout,
    showInMenu: true,
    roles: ["admin", "user"],
    children: [
      {
        name: "Warranties",
        path: "/warranty/warranties",
        component: Warranties,
        showInMenu: true,
        roles: ["admin", "user"],
      },
      {
        name: "Warranty Claim",
        path: "/warranty/warranty-claim",
        component: WarrantyClaim,
        showInMenu: true,
        roles: ["admin"],
      },
    ],
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
