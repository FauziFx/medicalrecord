import { Dashboard } from "@/pages/Dashboard";
import {
  Patients,
  MedicalRecords,
  AddMedicalRecords,
  AddPatientData,
  EditPatientData,
  Details,
} from "@/pages/MedicalRecord";
import { Optic, AddOptic, EditOptic } from "@/pages/Optic";
import { Warranties, WarrantyClaim, AddWarrantyClaim } from "@/pages/Warranty";
import { Users, AddUser, EditUser } from "@/pages/Users";
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
} from "lucide-react";
import { Navigate } from "react-router-dom";

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
        path: "/medical-record",
        component: Patients,
        showInMenu: false,
        roles: ["admin", "user"],
      },
      {
        name: "Patients",
        path: "/medical-record/patients",
        component: Patients,
        showInMenu: true,
        roles: ["admin", "user"],
      },
      {
        name: "Medical Record",
        path: "/medical-record/medical-records",
        component: MedicalRecords,
        showInMenu: true,
        roles: ["admin", "user"],
      },
      {
        name: "Add Medical Record",
        path: "/medical-record/add-medical-record",
        component: AddMedicalRecords,
        showInMenu: false,
        roles: ["admin", "user"],
      },
      {
        name: "Add Patient Data",
        path: "/medical-record/add-patient-data",
        component: AddPatientData,
        showInMenu: false,
        roles: ["admin", "user"],
      },
      {
        name: "Edit Patient Data",
        path: "/medical-record/edit-patient-data/:id",
        component: EditPatientData,
        showInMenu: false,
        roles: ["admin", "user"],
      },
      {
        name: "Edit Patient Data",
        path: "/medical-record/edit-patient-data",
        component: () => <Navigate to="/medical-record" replace />,
        showInMenu: false,
        roles: ["admin", "user"],
      },
      {
        name: "Details Patient",
        path: "/medical-record/patients/:id",
        component: Details,
        showInMenu: false,
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
        path: "/warranty",
        component: Warranties,
        showInMenu: false,
        roles: ["admin", "user"],
      },
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
        roles: ["admin", "user"],
      },
      {
        name: "Add Warranty Claim",
        path: "/warranty/add-warranty-claim",
        component: AddWarrantyClaim,
        showInMenu: false,
        roles: ["admin", "user"],
      },
    ],
  },
  {
    name: "Optics",
    path: "/optics",
    icon: <Store className="h-4 w-4" />,
    component: Optic,
    showInMenu: true,
    roles: ["admin"],
  },
  {
    name: "Add Optic",
    path: "/optics/add-optic",
    icon: <Store className="h-4 w-4" />,
    component: AddOptic,
    showInMenu: false,
    roles: ["admin"],
  },
  {
    name: "Edit Optic",
    path: "/optics/edit-optic/:id",
    icon: <Store className="h-4 w-4" />,
    component: EditOptic,
    showInMenu: false,
    roles: ["admin"],
  },
  {
    name: "Edit Optic",
    path: "/optics/edit-optic",
    icon: <Store className="h-4 w-4" />,
    component: () => <Navigate to="/optics" replace />,
    showInMenu: false,
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
    name: "Add Users",
    path: "/users/add-user",
    icon: <UsersIcon className="h-4 w-4" />,
    component: AddUser,
    showInMenu: false,
    roles: ["admin"],
  },
  {
    name: "Edit Users",
    path: "/users/edit-user/:id",
    icon: <UsersIcon className="h-4 w-4" />,
    component: EditUser,
    showInMenu: false,
    roles: ["admin"],
  },
  {
    name: "Edit Users",
    path: "/users/edit-user",
    icon: <UsersIcon className="h-4 w-4" />,
    component: () => <Navigate to="/users" replace />,
    showInMenu: false,
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
