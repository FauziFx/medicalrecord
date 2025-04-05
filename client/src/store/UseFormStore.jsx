import { create } from "zustand";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const UseFormStore = create((set) => ({
  currentStep: 1,
  setStep: (value) => set((state) => ({ currentStep: value })),

  // Handle Patient Data
  patientData: {
    name: "",
    gender: "",
    address: "",
    phone_number: "",
    place_of_birth: "",
    date_of_birth: "",
    occupation: "",
    opticId: Cookies.get("token")
      ? jwtDecode(Cookies.get("token")).opticId
      : "",
    conditions: [],
  },
  updatePatientData: (field, value) =>
    set((state) => ({
      patientData: { ...state.patientData, [field]: value },
    })),

  resetPatientData: () =>
    set((state) => ({
      patientData: {
        name: "",
        gender: "",
        address: "",
        phone_number: "",
        place_of_birth: "",
        date_of_birth: "",
        occupation: "",
        opticId: Cookies.get("token")
          ? jwtDecode(Cookies.get("token")).opticId
          : "",
        conditions: [],
      },
      age: "",
    })),
  // Update kondisi medical conditions
  toggleCondition: (condition) =>
    set((state) => ({
      patientData: {
        ...state.patientData,
        conditions: state.patientData.conditions.includes(condition)
          ? state.patientData.conditions.filter((item) => item !== condition) // Hapus jika sudah ada
          : [...state.patientData.conditions, condition], // Tambahkan jika belum ada
      },
    })),

  // Handle Age
  age: "",
  updateAge: (age) => {
    set((state) => ({
      patientData: {
        ...state.patientData,
        date_of_birth: new Date().getFullYear() - age + "-01-01",
      },
      age: age,
    }));
  },

  // Handle Old data
  oldData: {
    rsph: "",
    rcyl: "",
    raxis: "",
    radd: "",
    lsph: "",
    lcyl: "",
    laxis: "",
    ladd: "",
    far_pd: "",
    near_pd: "",
    visit_date: dayjs().format("YYYY-MM-DD"),
    is_olddata: 1,
    note: "",
  },
  updateOldData: (field, value) =>
    set((state) => ({
      oldData: { ...state.oldData, [field]: value },
    })),
  skipOldData: () =>
    set((state) => ({
      oldData: {
        rsph: "",
        rcyl: "",
        raxis: "",
        radd: "",
        lsph: "",
        lcyl: "",
        laxis: "",
        ladd: "",
        far_pd: "",
        near_pd: "",
        visit_date: dayjs().format("YYYY-MM-DD"),
        is_olddata: 1,
        note: "",
      },
    })),

  // Handle Old data
  newData: {
    rsph: "",
    rcyl: "",
    raxis: "",
    radd: "",
    lsph: "",
    lcyl: "",
    laxis: "",
    ladd: "",
    far_pd: "",
    near_pd: "",
    visit_date: dayjs().format("YYYY-MM-DD"),
    checked_by: "",
    opticId: Cookies.get("token")
      ? jwtDecode(Cookies.get("token")).opticId
      : "",
    is_olddata: 0,
    note: "",
  },
  updateNewData: (field, value) =>
    set((state) => ({
      newData: { ...state.newData, [field]: value },
    })),
  note: {
    frame: "",
    lens: "",
    price: "",
    note: "",
  },
  updateNote: (field, value) =>
    set((state) => ({
      note: { ...state.note, [field]: value },
    })),

  image: "",
  updateImage: (value) => set((state) => ({ image: value })),

  resetNewData: () =>
    set((state) => ({
      newData: {
        rsph: "",
        rcyl: "",
        raxis: "",
        radd: "",
        lsph: "",
        lcyl: "",
        laxis: "",
        ladd: "",
        far_pd: "",
        near_pd: "",
        visit_date: dayjs().format("YYYY-MM-DD"),
        checked_by: "",
        opticId: Cookies.get("token")
          ? jwtDecode(Cookies.get("token")).opticId
          : "",
        is_olddata: 0,
        note: "",
      },
      note: {
        frame: "",
        lens: "",
        price: "",
        note: "",
      },
      image: "",
    })),
}));

export default UseFormStore;
